# Architecture

Understanding how the editor works internally.

## Overview

```
┌─────────────────────────────────────────────┐
│              React Component                │
│            (MarkdownEditor.tsx)             │
└─────────────────┬───────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────┐
│              CodeMirror 6                   │
│         (EditorView + EditorState)          │
└─────────────────┬───────────────────────────┘
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
    ┌───────┐ ┌───────┐ ┌───────┐
    │WYSIWYG│ │Wikilink│ │Callout│  ... Extensions
    └───────┘ └───────┘ └───────┘
```

## Core Concepts

### ViewPlugin

Extensions use `ViewPlugin` to manage decorations:

```typescript
const myPlugin = ViewPlugin.fromClass(
  class {
    decorations: DecorationSet;
    
    constructor(view: EditorView) {
      this.decorations = buildDecorations(view);
    }
    
    update(update: ViewUpdate) {
      if (update.docChanged || update.selectionSet) {
        this.decorations = buildDecorations(update.view);
      }
    }
  },
  { decorations: v => v.decorations }
);
```

### Decorations

Three types of decorations:

| Type | Use Case |
|------|----------|
| `Decoration.mark()` | Style inline text (bold, italic) |
| `Decoration.replace()` | Replace text with widget |
| `Decoration.line()` | Style entire lines |

### StateField

For persistent state (like fold state):

```typescript
const foldState = StateField.define<Map<number, boolean>>({
  create() { return new Map(); },
  update(value, tr) {
    // Handle state changes
  }
});
```

### Block Widgets (Tables)

**Critical insight:** Block widgets (`block: true`) cannot be provided via `ViewPlugin`. Use `EditorView.decorations.compute()` instead:

```typescript
const tableDecorations = EditorView.decorations.compute(
    ['doc', 'selection'],
    (state) => {
        const doc = state.doc;
        const cursorPos = state.selection.main.head;
        
        // Build decorations based on state
        const tables = findTables(doc);
        const builder = new RangeSetBuilder<Decoration>();
        
        for (const table of tables) {
            const isEditing = cursorPos >= table.from && cursorPos <= table.to;
            if (!isEditing) {
                builder.add(table.from, table.from, 
                    Decoration.widget({
                        widget: new TableWidget(table),
                        block: true,
                        side: -1, // Before content
                    })
                );
            }
        }
        return builder.finish();
    }
);
```

**Multi-line content strategy:**
1. Place a block widget BEFORE the content (`side: -1`)
2. Use `Decoration.line()` to hide each line via CSS
3. CSS must use `height: 0`, `visibility: hidden` (not just `color: transparent`)

```typescript
// Hide underlying lines
Decoration.line({ class: 'cm-hidden-line' });
```

**CSS for hidden lines:**
```css
.cm-hidden-line {
    height: 0 !important;
    visibility: hidden !important;
    overflow: hidden !important;
}
```

## Performance Optimizations

### 1. Line-Change Detection

Only rebuild decorations when cursor moves to a different line:

```typescript
update(update: ViewUpdate) {
  if (update.selectionSet) {
    const newLine = doc.lineAt(selection.main.head).number;
    if (newLine !== this.lastLine) {
      this.decorations = buildDecorations(view);
      this.lastLine = newLine;
    }
  }
}
```

### 2. Visible Ranges Only

Scan only what's on screen:

```typescript
for (const { from, to } of view.visibleRanges) {
  // Only process visible content
}
```

### 3. Sorted Decorations

Always add decorations in sorted order:

```typescript
decos.sort((a, b) => a.from - b.from);
const builder = new RangeSetBuilder<Decoration>();
for (const { from, to, deco } of decos) {
  builder.add(from, to, deco);
}
```

### 4. Pre-collected Code Ranges

When checking if matches are inside code blocks, collect ranges once instead of iterating the syntax tree per match:

```typescript
// O(n) - collect once
const codeRanges = collectCodeRanges(view);

for (const match of matches) {
    // O(1) check per match instead of O(n) tree iteration
    if (isInsideCode(match.from, match.to, codeRanges)) continue;
}
```

## Compartments

For dynamic reconfiguration:

```typescript
const themeCompartment = new Compartment();

// Initial setup
extensions: [themeCompartment.of(lightTheme)]

// Later, update without recreating editor
view.dispatch({
  effects: themeCompartment.reconfigure(darkTheme)
});
```

## React Integration

### Controlled Component

```typescript
// External value changes
useEffect(() => {
  if (value !== editorRef.current?.state.doc.toString()) {
    editorRef.current?.dispatch({
      changes: { from: 0, to: doc.length, insert: value }
    });
  }
}, [value]);
```

### Avoiding Stale Closures

Callbacks are stored in refs to prevent stale closures:

```typescript
const callbacksRef = useRef({ onChange, onWikilinkClick });
useEffect(() => {
  callbacksRef.current = { onChange, onWikilinkClick };
});
```

## File Reference

| File | Purpose |
|------|---------|
| `core/editor.ts` | Editor factory, compartments |
| `core/theme.ts` | CSS variable theming |
| `extensions/wysiwyg/` | Syntax hiding, headings |
| `extensions/wikilink.ts` | `[[link]]` support |
| `extensions/callout.ts` | `> [!type]` with folding |
| `extensions/tag.ts` | `#hashtag` support |
| `extensions/table.ts` | Markdown table rendering (computed decorations) |
| `extensions/math.ts` | LaTeX math with KaTeX |
| `api/extension.ts` | User extension API |

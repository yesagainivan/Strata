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

**Critical insight:** Block widgets (`block: true`) cannot be provided via `ViewPlugin`. You MUST use `StateField` with the `provide` option:

```typescript
const tableField = StateField.define<DecorationSet>({
    create(state) {
        return buildDecorations(state);
    },
    update(decorations, tr) {
        if (tr.docChanged || tr.selection) {
            return buildDecorations(tr.state);
        }
        return decorations;
    },
    // This is required for block widgets!
    provide: field => EditorView.decorations.from(field),
});
```

**Multi-line content strategy:**
1. Place a block widget BEFORE the content (`side: -1`)
2. Use `Decoration.line()` to hide each line via CSS
3. CSS must use `height: 0`, `visibility: hidden` (not just `color: transparent`)

```typescript
// Widget before first line
Decoration.widget({
    widget: new TableWidget(table),
    block: true,
    side: -1, // Before content
});

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
| `extensions/table.ts` | Markdown table rendering (StateField) |
| `extensions/math.ts` | LaTeX math with KaTeX |
| `api/extension.ts` | User extension API |

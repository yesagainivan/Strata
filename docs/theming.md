# Theming

Strata uses a **host-app-first** theming approach. The host application generates CSS variables via `createThemeStyles()` and applies them to a container. The editor inherits these variables.

## Quick Start

```tsx
import { MarkdownEditor, createThemeStyles } from 'strata-editor';

function App() {
  const themeStyles = createThemeStyles({ mode: 'dark' });
  
  return (
    <div style={themeStyles}>
      <MarkdownEditor value={content} onChange={setContent} />
    </div>
  );
}
```

## StrataTheme API

```typescript
interface StrataTheme {
  mode?: 'light' | 'dark';           // Base preset to extend
  colors?: Partial<StrataColors>;     // Core editor colors
  syntax?: Partial<SyntaxColors>;     // Markdown syntax colors
  elements?: Partial<ElementColors>;  // Wikilinks, tags
  callouts?: Partial<CalloutConfig>;  // Callout box colors
  tables?: Partial<TableColors>;      // Table styling
  code?: Partial<CodeColors>;         // Code block syntax highlighting
}
```

### Core Colors

```typescript
interface StrataColors {
  background: string;      // Editor background
  foreground: string;      // Text color
  selection: string;       // Selection highlight
  cursor: string;          // Cursor/caret color
  lineHighlight: string;   // Active line background
  gutterBackground: string;
  gutterForeground: string;
}
```

### Markdown Syntax Colors

```typescript
interface SyntaxColors {
  heading: string;
  bold: string;
  italic: string;
  link: string;
  code: string;            // Inline code text
  codeBackground: string;  // Inline code background
  blockquote: string;
  listMarker: string;
  highlightBackground: string;  // ==highlight==
  highlightText: string;
  footnote: string;
}
```

### Code Block Syntax Highlighting

```typescript
interface CodeColors {
  keyword: string;     // if, else, return, const
  comment: string;     // Comments (styled italic)
  string: string;      // Strings and template literals
  number: string;      // Numbers and literals
  function: string;    // Function names
  variable: string;    // Variable names
  type: string;        // Type names and classes
  property: string;    // Properties and attributes
  operator: string;    // +, -, =, etc.
  punctuation: string; // Brackets, semicolons
  regex: string;       // Regex patterns
  builtin: string;     // Built-in/standard library
}
```

### Element Colors

```typescript
interface ElementColors {
  wikilink: string;        // [[Wikilink]] text
  wikilinkHover: string;
  tag: string;             // #tag text
  tagBackground: string;   // #tag pill background
}
```

### Callout Colors

```typescript
interface CalloutColors {
  background: string;  // Use rgba for transparency
  border: string;
  header: string;      // Icon + title color
}

interface CalloutConfig {
  info, warning, danger, success, tip,
  note, question, quote, example, bug: CalloutColors;
}
```

## Examples

### Custom Theme Preset

```tsx
const mossTheme: StrataTheme = {
  mode: 'light',
  colors: {
    background: '#f5efe1',
    foreground: '#4a3b30'
  },
  elements: {
    wikilink: '#6b7f6c',
    tag: '#d4a373'
  },
  code: {
    keyword: '#4a5c4b',
    string: '#6b7f6c',
    function: '#8b5a2b'
  }
};

// Apply to container
const styles = createThemeStyles(mossTheme);
```

### Dark Mode Toggle

```tsx
const [isDark, setIsDark] = useState(false);
const styles = createThemeStyles({ mode: isDark ? 'dark' : 'light' });

return (
  <div style={styles}>
    <button onClick={() => setIsDark(!isDark)}>Toggle Theme</button>
    <MarkdownEditor value={content} onChange={setContent} />
  </div>
);
```

## Accessing Defaults

```typescript
import { 
  LIGHT_COLORS, DARK_COLORS,
  LIGHT_SYNTAX, DARK_SYNTAX,
  LIGHT_CODE, DARK_CODE,
  LIGHT_CALLOUTS, DARK_CALLOUTS,
  LIGHT_ELEMENTS, DARK_ELEMENTS,
  LIGHT_TABLES, DARK_TABLES
} from 'strata-editor';

// Types
import type { 
  StrataTheme, 
  StrataColors, 
  SyntaxColors, 
  ElementColors, 
  TableColors, 
  CalloutConfig, 
  CalloutColors,
  CodeColors 
} from 'strata-editor';

// Extend dark defaults
const customTheme = {
  mode: 'dark' as const,
  colors: { ...DARK_COLORS, background: '#0d1117' },
  code: { ...DARK_CODE, keyword: '#ff79c6' }
};
```

## CSS Variable Override

For apps with existing CSS theming, override variables directly:

```css
.your-container {
  --editor-bg: #ffffff;
  --editor-text: #1a1a1a;
  --wikilink-color: #7c3aed;
  
  /* Code syntax highlighting */
  --code-keyword: #d73a49;
  --code-string: #032f62;
  --code-comment: #6a737d;
  
  /* Callouts */
  --callout-info-bg: rgba(59, 130, 246, 0.12);
}
```

## Typography

Customize fonts, heading styles, and text formatting via CSS variables:

```css
.your-container {
  /* ==================== Base Typography ==================== */
  --editor-font-family: 'Inter', sans-serif;
  --editor-font-size: 16px;
  --editor-line-height: 1.6;
  --editor-content-padding: 16px;
  --editor-content-max-width: 800px;

  /* ==================== Heading Sizes ==================== */
  --heading-1-size: 2em;
  --heading-2-size: 1.5em;
  --heading-3-size: 1.25em;
  --heading-4-size: 1.1em;
  --heading-5-size: 1em;
  --heading-6-size: 0.9em;

  /* ==================== Heading Weights ==================== */
  --heading-1-weight: 700;
  --heading-2-weight: 600;
  --heading-3-weight: 600;
  --heading-4-weight: 600;
  --heading-5-weight: 600;
  --heading-6-weight: 600;

  /* ==================== Heading Decorations ==================== */
  /* Control text-decoration property (underline, none, etc.) */
  --heading-1-decoration: none;
  --heading-2-decoration: none;
  --heading-3-decoration: none;
  --heading-4-decoration: none;
  --heading-5-decoration: none;
  --heading-6-decoration: none;

  /* ==================== Heading Borders ==================== */
  /* Add bottom borders (e.g., for H1/H2 underlines) */
  --heading-1-border: 1px solid var(--table-border);
  --heading-2-border: none;
  /* H3-H6 borders can also be set if needed */

  /* ==================== Heading Spacing ==================== */
  --heading-1-padding: 0;      /* Bottom padding for H1 */
  --heading-1-margin: 0;       /* Bottom margin for H1 */
  --heading-2-padding: 0;      /* Bottom padding for H2 */

  /* ==================== Link Styling ==================== */
  --link-underline: underline; /* Control link underlines (underline/none) */
}
```

### Common Typography Customizations

#### Remove All Heading Underlines

```css
.editor-container {
  --heading-1-border: none;
  --heading-2-border: none;
  --heading-1-decoration: none;
  --heading-2-decoration: none;
}
```

#### Add H1 Bottom Border with Spacing

```css
.editor-container {
  --heading-1-border: 2px solid var(--table-border);
  --heading-1-padding: 8px;
  --heading-1-margin: 12px;
}
```

#### Remove Link Underlines

```css
.editor-container {
  --link-underline: none;
}
```

#### Custom Heading Hierarchy

```css
.editor-container {
  /* Make H1-H3 bold, H4-H6 regular */
  --heading-1-weight: 700;
  --heading-2-weight: 600;
  --heading-3-weight: 600;
  --heading-4-weight: 400;
  --heading-5-weight: 400;
  --heading-6-weight: 400;
  
  /* Adjust sizes for better visual hierarchy */
  --heading-1-size: 2.5em;
  --heading-2-size: 2em;
  --heading-3-size: 1.5em;
  --heading-4-size: 1.25em;
  --heading-5-size: 1.1em;
  --heading-6-size: 1em;
}
```

## Complete CSS Variables Reference

This is a comprehensive list of all available CSS variables you can override to customize the editor appearance.

### Core Editor Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-bg` | `#ffffff` (light) / `#16181c` (dark) | Editor background color |
| `--editor-text` | `#1a1a1a` (light) / `#d8dce4` (dark) | Primary text color |
| `--editor-selection` | `#b4d5fe` (light) / `#2a3548` (dark) | Text selection highlight |
| `--editor-cursor` | `#000000` (light) / `#e8ecf0` (dark) | Cursor/caret color |
| `--editor-line-highlight` | `#f8f9fa` (light) / `#1c1f24` (dark) | Active line background |
| `--editor-gutter-bg` | `#f8f9fa` (light) / `#1a1c20` (dark) | Gutter background |
| `--editor-gutter-text` | `#6c757d` (light) / `#5a6270` (dark) | Line numbers color |

### Typography Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--editor-font-family` | System fonts | Editor font family |
| `--editor-font-size` | `16px` | Base font size |
| `--editor-line-height` | `1.6` | Line height |
| `--editor-content-padding` | `16px` | Content area padding |
| `--editor-content-max-width` | `800px` | Maximum content width |

### Heading Size Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--heading-1-size` | `2em` | H1 font size |
| `--heading-2-size` | `1.5em` | H2 font size |
| `--heading-3-size` | `1.25em` | H3 font size |
| `--heading-4-size` | `1.1em` | H4 font size |
| `--heading-5-size` | `1em` | H5 font size |
| `--heading-6-size` | `0.9em` | H6 font size |

### Heading Weight Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--heading-1-weight` | `700` | H1 font weight |
| `--heading-2-weight` | `600` | H2 font weight |
| `--heading-3-weight` | `600` | H3 font weight |
| `--heading-4-weight` | `600` | H4 font weight |
| `--heading-5-weight` | `600` | H5 font weight |
| `--heading-6-weight` | `600` | H6 font weight |

### Heading Decoration Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--heading-1-decoration` | `none` | H1 text decoration |
| `--heading-2-decoration` | `none` | H2 text decoration |
| `--heading-3-decoration` | `none` | H3 text decoration |
| `--heading-4-decoration` | `none` | H4 text decoration |
| `--heading-5-decoration` | `none` | H5 text decoration |
| `--heading-6-decoration` | `none` | H6 text decoration |

### Heading Border & Spacing Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--heading-1-border` | `none` | H1 bottom border |
| `--heading-2-border` | `none` | H2 bottom border |
| `--heading-1-padding` | `0` | H1 bottom padding |
| `--heading-2-padding` | `0` | H2 bottom padding |
| `--heading-1-margin` | `0` | H1 bottom margin |

### Syntax Highlighting Variables

| Variable | Default (Light) | Default (Dark) | Description |
|----------|-----------------|----------------|-------------|
| `--syntax-heading` | `#0f172a` | `#e8ecf4` | Heading color |
| `--syntax-bold` | `#1e293b` | `#dce0e8` | Bold text color |
| `--syntax-italic` | `#475569` | `#a8b0c0` | Italic text color |
| `--syntax-link` | `#2563eb` | `#6ea8dc` | Link color |
| `--syntax-code` | `#e11d48` | `#e07888` | Inline code text |
| `--syntax-code-bg` | `#f1f5f9` | `#1e2228` | Inline code background |
| `--syntax-blockquote` | `#64748b` | `#8894a8` | Blockquote color |
| `--syntax-list-marker` | `#0ea5e9` | `#5898c8` | List bullet/number color |
| `--syntax-highlight-bg` | `#fef08a` | `#785020` | ==Highlight== background |
| `--syntax-highlight-text` | `#1a1a1a` | `#f8f0d0` | ==Highlight== text |
| `--syntax-footnote` | `#8b5cf6` | `#9888c8` | Footnote reference color |

### Link Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `--link-underline` | `underline` | Link text decoration (underline/none) |

### Wikilink & Tag Variables

| Variable | Default (Light) | Default (Dark) | Description |
|----------|-----------------|----------------|-------------|
| `--wikilink-color` | `#7c3aed` | `#9080c8` | [[Wikilink]] color |
| `--wikilink-hover` | `#5b21b6` | `#a898d8` | [[Wikilink]] hover color |
| `--tag-color` | `#0891b2` | `#58a8b8` | #tag text color |
| `--tag-bg` | `#ecfeff` | `#1a3038` | #tag background color |

### Table Variables

| Variable | Default (Light) | Default (Dark) | Description |
|----------|-----------------|----------------|-------------|
| `--table-border` | `#e2e8f0` | `#2a2e38` | Table cell borders |
| `--table-header-bg` | `#f1f5f9` | `#1e2128` | Header row background |
| `--table-header-color` | `#1e293b` | `#d8dce4` | Header row text |
| `--table-row-alt-bg` | `#f8fafc` | `#1a1d22` | Alternating row background |
| `--table-row-hover` | `#e0f2fe` | `#242830` | Row hover background |

### Callout Variables

Each callout type has three variables: background, border, and header color.

#### Info Callout
- `--callout-info-bg` - Background color (default: `rgba(59, 130, 246, 0.12)`)
- `--callout-info-border` - Border color (default: `#3b82f6` / `#4878a8`)
- `--callout-header-info` - Header/icon color (default: `#1e40af` / `#78a8d0`)

#### Warning Callout
- `--callout-warning-bg` - Background color
- `--callout-warning-border` - Border color
- `--callout-header-warning` - Header/icon color

#### Danger Callout
- `--callout-danger-bg` - Background color
- `--callout-danger-border` - Border color
- `--callout-header-danger` - Header/icon color

#### Success Callout
- `--callout-success-bg` - Background color
- `--callout-success-border` - Border color
- `--callout-header-success` - Header/icon color

#### Tip Callout
- `--callout-tip-bg` - Background color
- `--callout-tip-border` - Border color
- `--callout-header-tip` - Header/icon color

#### Note Callout
- `--callout-note-bg` - Background color
- `--callout-note-border` - Border color
- `--callout-header-note` - Header/icon color

#### Question Callout
- `--callout-question-bg` - Background color
- `--callout-question-border` - Border color
- `--callout-header-question` - Header/icon color

#### Quote Callout
- `--callout-quote-bg` - Background color
- `--callout-quote-border` - Border color
- `--callout-header-quote` - Header/icon color

#### Example Callout
- `--callout-example-bg` - Background color
- `--callout-example-border` - Border color
- `--callout-header-example` - Header/icon color

#### Bug Callout
- `--callout-bug-bg` - Background color
- `--callout-bug-border` - Border color
- `--callout-header-bug` - Header/icon color

### Code Block Syntax Highlighting Variables

| Variable | Default (Light) | Default (Dark) | Description |
|----------|-----------------|----------------|-------------|
| `--code-keyword` | `#d73a49` | `#ff7b72` | Keywords (if, else, return, const) |
| `--code-comment` | `#6a737d` | `#8b949e` | Comments |
| `--code-string` | `#032f62` | `#a5d6ff` | Strings and template literals |
| `--code-number` | `#005cc5` | `#79c0ff` | Numbers and literals |
| `--code-function` | `#6f42c1` | `#d2a8ff` | Function names |
| `--code-variable` | `#24292e` | `#c9d1d9` | Variable names |
| `--code-type` | `#22863a` | `#7ee787` | Type names and classes |
| `--code-property` | `#005cc5` | `#79c0ff` | Properties and attributes |
| `--code-operator` | `#d73a49` | `#ff7b72` | Operators (+, -, =, etc.) |
| `--code-punctuation` | `#24292e` | `#c9d1d9` | Brackets, semicolons |
| `--code-regex` | `#032f62` | `#a5d6ff` | Regex patterns |
| `--code-builtin` | `#e36209` | `#ffa657` | Built-in/standard library |

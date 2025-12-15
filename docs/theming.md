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
  LIGHT_CALLOUTS, DARK_CALLOUTS
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

Customize fonts and heading styles via CSS variables:

```css
.your-container {
  /* Base typography */
  --editor-font-family: 'Inter', sans-serif;
  --editor-font-size: 16px;
  --editor-line-height: 1.6;
  --editor-content-max-width: 800px;

  /* Heading sizes */
  --heading-1-size: 2em;
  --heading-2-size: 1.5em;
  --heading-3-size: 1.25em;

  /* Heading weights */
  --heading-1-weight: 700;
  --heading-2-weight: 600;

  /* Heading underlines */
  --heading-1-border: 1px solid var(--table-border);
  --heading-2-border: none;  /* Remove underline */
}
```

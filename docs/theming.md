# Theming

Strata provides a flexible, type-safe theming API. You can use built-in presets, customize specific colors, or fully override the theme.

## Quick Start

```tsx
// Built-in presets (backward compatible)
<MarkdownEditor theme="light" />
<MarkdownEditor theme="dark" />

// Custom theme with partial overrides
<MarkdownEditor theme={{
  mode: 'dark',
  colors: { background: '#1a1a2e' }
}} />
```

## StrataTheme API

The `theme` prop accepts a `StrataTheme` object:

```typescript
interface StrataTheme {
  mode?: 'light' | 'dark';     // Base preset to extend
  colors?: Partial<StrataColors>;
  syntax?: Partial<SyntaxColors>;
  elements?: Partial<ElementColors>;
  callouts?: Partial<CalloutConfig>;
  tables?: Partial<TableColors>;
}
```

### Colors (Core)

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

### Syntax Colors

```typescript
interface SyntaxColors {
  heading: string;
  bold: string;
  italic: string;
  link: string;
  code: string;
  codeBackground: string;
  blockquote: string;
  listMarker: string;
  highlightBackground: string;  // ==highlight==
  highlightText: string;
  footnote: string;
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
  background: string;  // Use rgba for best results
  border: string;
  header: string;      // Icon + title color
}

interface CalloutConfig {
  info: CalloutColors;
  warning: CalloutColors;
  danger: CalloutColors;
  success: CalloutColors;
  tip: CalloutColors;
  note: CalloutColors;
  question: CalloutColors;
  quote: CalloutColors;
  example: CalloutColors;
  bug: CalloutColors;
}
```

## Examples

### Dark Mode with Custom Accent

```tsx
<MarkdownEditor theme={{
  mode: 'dark',
  elements: {
    wikilink: '#ff6b6b',
    wikilinkHover: '#ff8787'
  }
}} />
```

### Brand-Themed Editor

```tsx
<MarkdownEditor theme={{
  mode: 'light',
  colors: {
    background: '#f5efe1',
    foreground: '#4a3b30'
  },
  elements: {
    wikilink: '#6b7f6c',
    tag: '#d4a373'
  },
  callouts: {
    info: {
      background: 'rgba(107, 127, 108, 0.12)',
      border: '#6b7f6c',
      header: '#4a5c4b'
    }
  }
}} />
```

## Accessing Defaults

Import default values for reference:

```typescript
import { 
  LIGHT_COLORS, DARK_COLORS,
  LIGHT_SYNTAX, DARK_SYNTAX,
  LIGHT_CALLOUTS, DARK_CALLOUTS
} from 'strata-editor';

// Create a theme based on dark defaults
const customTheme = {
  mode: 'dark' as const,
  colors: {
    ...DARK_COLORS,
    background: '#0d1117'  // GitHub dark
  }
};
```

## CSS Variable Override

For host apps with existing CSS theming, you can also override CSS variables directly:

```css
.markdown-editor {
  --editor-bg: #ffffff;
  --editor-text: #1a1a1a;
  --wikilink-color: #7c3aed;
  --callout-info-bg: rgba(59, 130, 246, 0.12);
}
```

## Typography

Customize fonts, sizes, and heading styles via CSS variables:

```css
.markdown-editor {
  /* Base typography */
  --editor-font-family: 'Inter', sans-serif;
  --editor-font-size: 16px;
  --editor-line-height: 1.6;
  --editor-content-padding: 16px;
  --editor-content-max-width: 800px;

  /* Heading sizes */
  --heading-1-size: 2em;
  --heading-2-size: 1.5em;
  --heading-3-size: 1.25em;
  --heading-4-size: 1.1em;
  --heading-5-size: 1em;

  /* Heading weights */
  --heading-1-weight: 700;
  --heading-2-weight: 600;

  /* Heading underlines (add or remove) */
  --heading-1-border: 1px solid var(--table-border);
  --heading-1-padding: 8px;
  --heading-2-border: none;  /* Remove underline */
}
```



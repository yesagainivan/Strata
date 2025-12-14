# Theming

The Modern Markdown Editor uses CSS variables for complete theming control. You can customize colors, typography, and spacing without touching the source code.

## Quick Theme Switch

```tsx
<MarkdownEditor theme="dark" />  // or "light"
```

## CSS Variables

Override these variables in your CSS to customize the theme:

### Editor Base

```css
:root {
  --editor-bg: #ffffff;
  --editor-text: #1a1a1a;
  --editor-selection: #b4d5fe;
  --editor-cursor: #000000;
  --editor-gutter-bg: #f8f9fa;
  --editor-gutter-text: #6c757d;
  --editor-line-highlight: #f8f9fa;
}
```

### Syntax Highlighting

```css
:root {
  --syntax-heading: #0f172a;
  --syntax-bold: #1e293b;
  --syntax-italic: #475569;
  --syntax-link: #2563eb;
  --syntax-code: #e11d48;
  --syntax-code-bg: #f1f5f9;
  --syntax-blockquote: #64748b;
  --syntax-list-marker: #0ea5e9;
}
```

### Wikilinks & Tags

```css
:root {
  --wikilink-color: #7c3aed;
  --wikilink-hover: #5b21b6;
  --tag-color: #0891b2;
  --tag-bg: #ecfeff;
}
```

### Callouts

```css
:root {
  /* Info (blue) */
  --callout-info-bg: #eff6ff;
  --callout-info-border: #3b82f6;
  
  /* Warning (amber) */
  --callout-warning-bg: #fffbeb;
  --callout-warning-border: #f59e0b;
  
  /* Danger (red) */
  --callout-danger-bg: #fef2f2;
  --callout-danger-border: #ef4444;
  
  /* Success (green) */
  --callout-success-bg: #f0fdf4;
  --callout-success-border: #22c55e;
  
  /* Tip (teal) */
  --callout-tip-bg: #f0fdfa;
  --callout-tip-border: #14b8a6;
}
```

## Dark Mode Example

```css
[data-theme="dark"] .markdown-editor {
  --editor-bg: #1a1a1a;
  --editor-text: #e5e7eb;
  --editor-selection: #3b4252;
  --editor-cursor: #ffffff;
  --syntax-heading: #f8fafc;
  --syntax-link: #60a5fa;
  --wikilink-color: #a78bfa;
  --tag-color: #22d3ee;
  --tag-bg: #164e63;
  
  /* Dark callouts */
  --callout-info-bg: #1e3a5f;
  --callout-warning-bg: #422006;
  --callout-danger-bg: #450a0a;
  --callout-success-bg: #052e16;
}
```

## Custom Theme Extension

For advanced theming, pass a custom CM6 theme extension:

```tsx
import { EditorView } from '@codemirror/view';

const customTheme = EditorView.theme({
  '&': {
    fontFamily: 'JetBrains Mono, monospace',
  },
  '.cm-content': {
    padding: '24px',
  },
  '.cm-heading-1': {
    fontSize: '2.5em',
    color: '#ff6b6b',
  },
});

<MarkdownEditor extensions={[customTheme]} />
```

## Typography

The editor uses system fonts by default. To customize:

```css
.cm-scroller {
  font-family: 'Inter', sans-serif;
  font-size: 16px;
  line-height: 1.7;
}

.cm-heading-1 { font-size: 2em; }
.cm-heading-2 { font-size: 1.5em; }
.cm-heading-3 { font-size: 1.25em; }
```

## Content Width

Control the content width and centering:

```css
.cm-content {
  max-width: 800px;  /* Adjust reading width */
  margin: 0 auto;    /* Center content */
  padding: 20px 16px;
}
```

# Tables

Markdown table support with Obsidian-style rendering.

## Usage

```tsx
import { MarkdownEditor, tableExtension } from 'modern-markdown-editor';

<MarkdownEditor 
  extensions={[tableExtension()]} 
/>
```

## Behavior

| Cursor Position | Display |
|-----------------|---------|
| Outside table | Rendered HTML table |
| Inside table | Raw markdown for editing |

## Syntax

Standard GFM table syntax:

```markdown
| Header 1 | Header 2 | Header 3 |
|----------|:--------:|---------:|
| Left     | Center   | Right    |
| Data     | Data     | Data     |
```

### Column Alignment

| Syntax | Alignment |
|--------|-----------|
| `---` or `:---` | Left |
| `:---:` | Center |
| `---:` | Right |

## Styling

CSS variables for customization:

```css
.your-editor {
  --table-border: #e2e8f0;
  --table-header-bg: #f1f5f9;
  --table-header-color: #1e293b;
  --table-row-alt-bg: #f8fafc;
  --table-row-hover: #e0f2fe;
}
```

## Implementation Notes

> [!info] Technical Details
> Tables use `StateField` (not `ViewPlugin`) because block widgets require this in CodeMirror 6.

The table extension:
1. Detects tables using a regex pattern
2. Renders an HTML `<table>` widget when cursor is outside
3. Hides raw markdown lines using `Decoration.line()` + CSS `visibility: hidden`
4. Shows raw markdown when cursor enters the table for editing

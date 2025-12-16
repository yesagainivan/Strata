# Custom Extensions

Create your own syntax extensions with the `createExtension` API.

## Basic Extension

```tsx
import { createExtension } from 'strata-editor';

const mentions = createExtension({
  name: 'mention',
  pattern: /@(\w+)/g,
  className: 'cm-mention',
});
```

## With Click Handler

```tsx
const mentions = createExtension({
  name: 'mention',
  pattern: /@(\w+)/g,
  className: 'cm-mention',
  onClick: (match, event) => {
    const username = match[1];
    console.log('Clicked user:', username);
  },
});
```

## With Custom Widget

Replace matched text with a custom element:

```tsx
const mentions = createExtension({
  name: 'mention',
  pattern: /@(\w+)/g,
  className: 'cm-mention',
  hideOnInactive: true,
  widget: (match, from, to) => {
    const span = document.createElement('span');
    span.className = 'mention-chip';
    span.textContent = `@${match[1]}`;
    span.style.cssText = `
      background: #e0e7ff;
      padding: 2px 8px;
      border-radius: 12px;
    `;
    return span;
  },
});
```

## Configuration Options

| Option | Type | Description |
|--------|------|-------------|
| `name` | `string` | Unique identifier |
| `pattern` | `RegExp` | Pattern to match (must have `g` flag) |
| `className` | `string` | CSS class for styling |
| `onClick` | `function` | Click handler `(match, event) => void` |
| `hideOnInactive` | `boolean` | Hide raw syntax when not editing |
| `widget` | `function` | Custom element factory |

## Styling Extensions

Add CSS for your extension's class:

```css
.cm-mention {
  color: #6366f1;
  background: #eef2ff;
  padding: 1px 4px;
  border-radius: 4px;
  cursor: pointer;
}

.cm-mention:hover {
  background: #e0e7ff;
}
```

## Multiple Extensions

```tsx
const mentions = createExtension({ ... });
const hashtags = createExtension({ ... });
const dates = createExtension({ ... });

<MarkdownEditor extensions={[mentions, hashtags, dates]} />
```

## Advanced: Raw CM6 Extensions

For full control, pass CodeMirror 6 extensions directly:

```tsx
import { keymap } from '@codemirror/view';
import { indentWithTab } from '@codemirror/commands';

<MarkdownEditor 
  extensions={[
    keymap.of([indentWithTab]),
    // Any CM6 extension works here
  ]} 
/>
```

## Extension Ideas

| Extension | Pattern | Use Case |
|-----------|---------|----------|
| Mentions | `/@(\w+)/g` | User references |
| Dates | `/\d{4}-\d{2}-\d{2}/g` | Date highlighting |
| Priorities | `/!!(high|low|med)/g` | Task priorities |
| Timestamps | `/\[\[(\d{1,2}:\d{2})\]\]/g` | Time references |
| Embeds | `/!\[\[(.*?)\]\]/g` | File embeds |

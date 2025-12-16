# Strata Editor

A production-ready **CodeMirror 6** markdown editor with Obsidian-style WYSIWYG editing.

[**🔗 Live Demo**](https://yesagainivan.github.io/Strata/) • [Documentation](#documentation) • [Contributing](#contributing)

---

## Features

- 📝 **WYSIWYG Editing** — Markdown syntax hides when not editing (like Obsidian)
- 🔗 **Wikilinks** — `[[note]]`, `[[note|alias]]`, `[[note#heading]]`
- 📌 **Callouts** — `> [!info]`, `> [!warning]`, foldable support
- 🏷️ **Tags** — `#tag` and `#nested/tag` with click handlers
- 🖼️ **Images** — `![[image.png]]` embedding
- 🦶 **Footnotes** — `[^1]` reference and definition
- 🔦 **Highlights** — `==highlighted text==`
- 📊 **Tables** — GFM tables with full formatting
- 🧮 **Math** — LaTeX/KaTeX rendering (via extension)
- 🎨 **Theming** — Full CSS variable system, light/dark modes
- 🔌 **Extensible** — Simple API for custom syntax
- 🛡️ **Error Boundary** — Graceful error handling

## Installation

```bash
npm install strata-editor @codemirror/autocomplete @codemirror/commands @codemirror/lang-markdown @codemirror/language @codemirror/state @codemirror/view @lezer/highlight @lezer/markdown
```

Or with specific CodeMirror versions you already have:

```bash
npm install strata-editor
```

**Peer Dependencies:** 
- React 18+ or 19+
- CodeMirror 6 packages (see above)

## Quick Start

```tsx
import { MarkdownEditor, EditorErrorBoundary, createThemeStyles, mathExtension } from 'strata-editor';

function App() {
  const [content, setContent] = useState('# Hello World');
  const themeStyles = createThemeStyles({ mode: 'dark' });

  return (
    <div style={themeStyles}>
      <EditorErrorBoundary>
        <MarkdownEditor
          value={content}
          onChange={setContent}
          onWikilinkClick={(data) => console.log('Navigate to:', data.target)}
          onTagClick={(tag) => console.log('Filter by:', tag)}
          extensions={[mathExtension()]}
        />
      </EditorErrorBoundary>
    </div>
  );
}
```

## Theming

Strata uses a **host-app-first** theming approach. Generate CSS variables with `createThemeStyles()`:

```tsx
import { createThemeStyles } from 'strata-editor';

const theme = {
  mode: 'dark',
  colors: { background: '#1a1a2e' },
  code: { keyword: '#ff79c6' }
};

const styles = createThemeStyles(theme);
// Apply styles to a container div
```

See [Theming Documentation](docs/theming.md) for full customization options.

## Custom Extensions

Add your own syntax support:

```tsx
import { createExtension } from 'strata-editor';

const mentions = createExtension({
  name: 'mention',
  pattern: /@(\w+)/g,
  className: 'cm-mention',
  onClick: (match) => alert(`User: @${match[1]}`),
});

<MarkdownEditor extensions={[mentions]} />
```

## API Reference

### MarkdownEditor Props

| Prop | Type | Description |
|------|------|-------------|
| `value` | `string` | Controlled markdown content |
| `defaultValue` | `string` | Initial content (uncontrolled) |
| `onChange` | `(value: string) => void` | Content change handler |
| `placeholder` | `string` | Placeholder text |
| `readOnly` | `boolean` | Read-only mode |
| `extensions` | `Extension[]` | Additional CM6 extensions |
| `onWikilinkClick` | `(data, e) => void` | Wikilink click handler |
| `onTagClick` | `(tag, e) => void` | Tag click handler |
| `wikilinkInteraction` | `'click' \| 'modifier'` | Trigger mode (default: modifier) |
| `tagInteraction` | `'click' \| 'modifier'` | Trigger mode (default: modifier) |

### Ref Methods

```tsx
const editorRef = useRef<MarkdownEditorHandle>(null);

editorRef.current?.getValue();               // Get content
editorRef.current?.setValue(text);           // Set content
editorRef.current?.focus();                  // Focus editor
editorRef.current?.insertText(text);         // Insert at cursor
editorRef.current?.wrapSelection('**', '**');// Wrap selection
```

## Documentation

| Guide | Description |
|-------|-------------|
| [AI Integration](docs/ai-integration.md) | AI streaming & replace patterns |
| [Theming](docs/theming.md) | CSS variables, custom themes |
| [Extensions](docs/extensions.md) | Creating custom syntax |
| [Callouts](docs/callouts.md) | All callout types |
| [Tables](docs/tables.md) | Markdown table support |
| [Math](docs/math.md) | LaTeX/KaTeX rendering |
| [Architecture](docs/architecture.md) | Editor internals |

## Contributing

We welcome contributions! See our [GitHub Guide](docs/github_guide.md) for setup and PR guidelines.

## License

MIT

# Strata Editor

A production-ready **CodeMirror 6** based markdown editor with Obsidian-style WYSIWYG editing.

## Features

- 📝 **WYSIWYG Editing** - Markdown syntax hides when you're not editing that line (like Obsidian)
- 🔗 **Wikilinks** - `[[note]]`, `[[note|alias]]`, `[[note#heading]]`
- 📌 **Callouts** - `> [!info]`, `> [!warning]`, etc. with foldable support
- 🏷️ **Tags** - `#tag` and `#nested/tag` with click handlers
- 🖼️ **Images** - `![[image.png]]` embedding
- 🦶 **Footnotes** - `[^1]` reference support
- 🔦 **Highlights** - `==text==` highlighting
- 📐 **Tables** - GFM tables (via extension)
- 🧮 **Math** - LaTeX rendering (via extension)
- 🌗 **Theming** - Light/dark mode with CSS variables
- 🔌 **Extensible** - Simple API for custom syntax extensions
- 🛡️ **Error Boundary** - Graceful error handling for production

## Quick Start

```bash
npm install
npm run dev
```

## Usage

```tsx
import { 
  MarkdownEditor, 
  EditorErrorBoundary, 
  mathExtension, 
  tableExtension 
} from './index';

function App() {
  const [content, setContent] = useState('# Hello World');
  const editorRef = useRef<MarkdownEditorHandle>(null);

  return (
    <EditorErrorBoundary>
      <MarkdownEditor
        ref={editorRef}
        value={content}
        onChange={setContent}
        theme="light"
        // Optional: Configure interactions
        wikilinkInteraction="modifier" // 'click' | 'modifier' (default)
        tagInteraction="modifier"      // 'click' | 'modifier' (default)
        // handlers receive event
        onWikilinkClick={(data, event) => console.log('Navigate to:', data.target)}
        onTagClick={(tag, event) => console.log('Filter by:', tag)}
        // Enable optional extensions
        extensions={[
          mathExtension(), 
          tableExtension()
        ]}
      />
    </EditorErrorBoundary>
  );
}
```

## Foldable Callouts

Callouts support Obsidian-style folding (`+` for expanded, `-` for collapsed). See the [Callouts Documentation](docs/callouts.md) for full syntax details.

## Contributing

We love contributions! Please read our [GitHub Guide](docs/github_guide.md) for details on how to set up the project, run CI checks, and submit Pull Requests.

[**View Live Demo**](https://yesagainivan.github.io/modern_markdown_editor/) (Auto-deployed via GitHub Actions)

## Creating Custom Extensions

Add your own syntax support easily:

```tsx
import { createExtension, MarkdownEditor } from './index';

// Create @mention extension
const mentions = createExtension({
  name: 'mention',
  pattern: /@(\w+)/g,
  className: 'cm-mention',
  onClick: (match) => alert(`Clicked user: @${match[1]}`),
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
| `theme` | `'light' \| 'dark'` | Theme mode |
| `placeholder` | `string` | Placeholder text |
| `readOnly` | `boolean` | Read-only mode |
| `extensions` | `Extension[]` | Additional CM6 extensions |
| `onWikilinkClick` | `(data: WikilinkData, e: MouseEvent) => void` | Wikilink click handler |
| `onTagClick` | `(tag: string, e: MouseEvent) => void` | Tag click handler |
| `wikilinkInteraction` | `'click' \| 'modifier'` | Interaction trigger (default: modifier) |
| `tagInteraction` | `'click' \| 'modifier'` | Interaction trigger (default: modifier) |

### Ref Methods

```tsx
const editorRef = useRef<MarkdownEditorHandle>(null);

editorRef.current?.getValue();               // Get content
editorRef.current?.setValue(text);           // Set content
editorRef.current?.focus();                  // Focus editor
editorRef.current?.insertText(text);         // Insert at cursor
editorRef.current?.getSelection();           // Get selected text
editorRef.current?.replaceSelection(text);   // Replace selection
editorRef.current?.wrapSelection('**', '**');// Wrap selection
```

### EditorErrorBoundary Props

| Prop | Type | Description |
|------|------|-------------|
| `children` | `ReactNode` | Editor component to wrap |
| `fallback` | `ReactNode` | Custom error UI (optional) |
| `onError` | `(error, errorInfo) => void` | Error callback for logging |

## Project Structure

```
src/
├── components/
│   ├── MarkdownEditor.tsx    # Main React component
│   └── EditorErrorBoundary.tsx # Error boundary
├── core/
│   ├── editor.ts             # CM6 factory
│   └── theme.ts              # Theme system
├── extensions/
│   ├── wysiwyg/              # Hidden marks, headings
│   ├── wikilink.ts           # [[links]]
│   ├── callout.ts            # > [!type] with folding
│   └── tag.ts                # #tags
├── api/
│   └── extension.ts          # User extension API
└── index.ts                  # Exports
```

## Documentation

| Guide | Description |
|-------|-------------|
| [Theming](docs/theming.md) | CSS variables, custom themes, dark mode |
| [Extensions](docs/extensions.md) | Creating custom syntax extensions |
| [Architecture](docs/architecture.md) | How the editor works internally |
| [Callouts](docs/callouts.md) | All callout types with examples |
| [Math](docs/math.md) | LaTeX/KaTeX math rendering |

## License

MIT

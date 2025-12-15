/**
 * Demo application for the Markdown Editor
 */

import { useState, useRef } from 'react';
import { MarkdownEditor, createExtension, mathExtension, tableExtension, EditorErrorBoundary } from './index';
import type { MarkdownEditorHandle, WikilinkData } from './types';
import 'katex/dist/katex.min.css';
import './App.css';

// Comprehensive demo content showcasing all features
const DEMO_CONTENT = `# Strata Editor

A production-ready **CodeMirror 6** based markdown editor with Obsidian-style WYSIWYG editing. Experience how markdown syntax gracefully fades when you're not editing a line.

> [!info] Interactive Demo
> This is a **live editor**! Click anywhere to edit. Try the ==highlight syntax== or **Cmd/Ctrl+Click** on [[wikilinks]] and #tags to see the click handlers in action.


## Core Features

### Rich Text Formatting

Standard markdown with live preview—syntax hides when you move away:

- **Bold text** — Use \`**text**\` or \`__text__\`
- *Italic text* — Use \`*text*\` or \`_text_\`
- ~~Strikethrough~~ — Use \`~~text~~\`
- \`Inline code\` — Use backticks
- ==Highlighted text== — Use \`==text==\`

### Lists & Task Management

**Unordered Lists**
- First item with bullet
  - Nested item
    - Deeply nested

**Ordered Lists**
1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

**Task Lists**
- [ ] Unchecked task
- [x] Completed task
- [/] In-progress task (custom)

---

## Obsidian-Style Features

### Wikilinks

Link to other notes using double brackets:

- Basic link: [[Another Note]]
- With alias: [[Another Note|Click here]]
- With heading: [[Another Note#Section]]
- Combined: [[Note#Heading|Display Text]]

### Tags

Organize your notes with hashtags:

#feature #markdown/syntax #editor/codemirror

### Callouts

Four callout types with distinct styling:

> [!info] Information
> Use for general notes and context. Supports **bold**, *italic*, and \`code\`.

> [!tip] Tip
> Share helpful advice or best practices here.

> [!warning] Warning
> Highlight potential issues or things to watch out for.

> [!danger] Danger
> Critical warnings that need immediate attention.

**Foldable Callouts**

> [!tip]+ Expanded by Default
> This callout starts expanded. Click the chevron to collapse.

> [!info]- Collapsed by Default
> This callout starts collapsed. Click to expand.

### Footnotes

Add references with footnotes[^1] that you can click to navigate. Multiple footnotes[^2] are supported.

---

## Math & Technical Content

### LaTeX Mathematics

**Inline Math**: The famous equation $e^{i\\pi} + 1 = 0$ shows Euler's identity.

**Block Math**:
$$\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}$$

### Code Blocks

Syntax-highlighted code with language support:

\`\`\`typescript
interface MarkdownEditorProps {
  value: string;
  onChange: (content: string) => void;
  theme: 'light' | 'dark';
}

function createEditor(props: MarkdownEditorProps) {
  return new EditorView({
    doc: props.value,
    extensions: [markdown(), obsidianMode()]
  });
}
\`\`\`

### Tables

| Feature | Description | Status |
|:---------|-------------|:--------:|
| WYSIWYG | Live preview editing | ✅ |
| Wikilinks | \`[[note]]\` syntax | ✅ |
| Callouts | \`> [!type]\` blocks | ✅ |
| Math | KaTeX rendering | ✅ |
| Tables | GFM table support | ✅ |
| Highlights | \`==text==\` syntax | ✅ |
| Footnotes | \`[^ref]\` syntax | ✅ |

---

## Additional Elements

### Horizontal Rules

Use \`---\` or \`***\` to create dividers:

---

### Image Embeds

Embed images with Obsidian syntax:

![[https://generative-placeholders.stefanbohacek.com/image?width=600&height=300&style=cellular-automata&cells=50|Generative Placeholder]]

\`![[image.png]]\` or \`![[image.png|alt text]]\`

### Custom Extensions

The editor supports custom extensions. Try typing @username to see the mention extension in action!

---

## Footnote Definitions

[^1]: This is a footnote definition. Click the superscript number in the text above to jump here.

[^2]: Footnotes support **markdown formatting** and can contain multiple lines of content.
`;

// Custom @mention extension example
const mentionExtension = createExtension({
  name: 'mention',
  pattern: /@(\w+)/g,
  className: 'cm-mention',
  onClick: (match) => {
    alert(`Clicked on user: @${match[1]}`);
  },
});

function App() {
  const [content, setContent] = useState(DEMO_CONTENT);
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const editorRef = useRef<MarkdownEditorHandle>(null);

  const handleWikilinkClick = (data: WikilinkData) => {
    alert(`Navigate to: ${data.target}${data.heading ? '#' + data.heading : ''}`);
  };

  const handleTagClick = (tag: string) => {
    alert(`Filter by tag: #${tag}`);
  };

  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  const insertText = (text: string) => {
    editorRef.current?.insertText(text);
    editorRef.current?.focus();
  };

  const wrapSelection = (before: string, after: string) => {
    editorRef.current?.wrapSelection(before, after);
    editorRef.current?.focus();
  };

  return (
    <div className={`app ${theme}`}>
      <header className="toolbar">
        <div className="toolbar-left">
          <div className="app-title">
            <span className="app-icon">⛰️</span>
            <span>Strata Editor</span>
          </div>
          <span className="app-subtitle">Structured • Natural • Powerful</span>
        </div>
        <div className="toolbar-right">
          <div className="button-group" role="group" aria-label="Insert formatting">
            <button onClick={() => wrapSelection('**', '**')} title="Bold"><strong>B</strong></button>
            <button onClick={() => wrapSelection('*', '*')} title="Italic"><em>I</em></button>
            <button onClick={() => wrapSelection('==', '==')} title="Highlight"><span className="btn-highlight">H</span></button>
            <button onClick={() => wrapSelection('`', '`')} title="Inline Code">{'</>'}</button>
            <button onClick={() => wrapSelection('[[', ']]')} title="Wikilink">🔗</button>
          </div>
          <div className="button-group" role="group" aria-label="Insert blocks">
            <button onClick={() => insertText('> [!info] Title\n> Content')} title="Callout">📌</button>
            <button onClick={() => wrapSelection('$', '$')} title="Inline Math">∑</button>
            <button onClick={() => insertText('| A | B |\n|---|---|\n| 1 | 2 |')} title="Table">▦</button>
            <button onClick={() => insertText('\n---\n')} title="Horizontal Rule">―</button>
          </div>
          <button className="theme-toggle" onClick={toggleTheme} title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}>
            {theme === 'light' ? '🌙' : '☀️'}
          </button>
        </div>
      </header>

      <main className="editor-container">
        <EditorErrorBoundary>
          <MarkdownEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
            theme={theme}
            placeholder="Start writing your note..."
            onWikilinkClick={handleWikilinkClick}
            onTagClick={handleTagClick}
            extensions={[mentionExtension, mathExtension(), tableExtension()]}
            className="editor-instance"
          />
        </EditorErrorBoundary>
      </main>

      <footer className="status-bar">
        <span>Characters: {content.length}</span>
        <span>Lines: {content.split('\n').length}</span>
        <span>Try typing @username to see custom extensions!</span>
      </footer>
    </div>
  );
}

export default App;

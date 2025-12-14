/**
 * Demo application for the Markdown Editor
 */

import { useState, useRef } from 'react';
import { MarkdownEditor, createExtension, mathExtension, tableExtension, EditorErrorBoundary } from './index';
import type { MarkdownEditorHandle, WikilinkData } from './types';
import 'katex/dist/katex.min.css';
import './App.css';

// Sample markdown content demonstrating all features
const DEMO_CONTENT = `# Welcome to the Markdown Editor

This is an **Obsidian-style** markdown editor built with CodeMirror 6.

## Features

### WYSIWYG Editing
The editor hides markdown syntax when you're not editing that line:
- **Bold text** renders without the asterisks
- *Italic text* hides the single asterisks  
- \`inline code\` renders in a code style
- ~~Strikethrough~~ works too!

### Wikilinks
Link to other notes with [[Note Name]] or use an alias [[Note Name|Display Text]].
You can also link to headings [[Note#Heading]] or blocks [[Note#^block-id]].

### Tags
Organize your notes with #tags and #nested/tags. Click them to filter!

### Callouts

> [!info] Information
> This is an info callout. It supports **markdown** inside!

> [!warning] Be Careful
> Warnings help highlight important information.

> [!tip]+ Collapsible Tip
> This callout can be folded!

> [!danger] Critical
> Use this for critical warnings.

### Math (LaTeX)

Inline math: $E = mc^2$ and $\\frac{a}{b}$

Block math (single line): $$\\int_0^\\infty e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$

### Tables

| Feature | Status | Notes |
|---------|--------|-------|
| WYSIWYG | ✅ Done | Hides syntax when not editing |
| Tables | ✅ Done | Header styling, separators |
| Math | ✅ Done | KaTeX rendering |

### Task Lists
- [ ] Uncompleted task
- [x] Completed task
- [ ] Another thing to do

### Code Blocks
\`\`\`javascript
function hello() {
  console.log("Hello, world!");
}
\`\`\`

---

Try editing this content to see the WYSIWYG in action!
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
    console.log('Wikilink clicked:', data);
    alert(`Navigate to: ${data.target}${data.heading ? '#' + data.heading : ''}`);
  };

  const handleTagClick = (tag: string) => {
    console.log('Tag clicked:', tag);
    alert(`Filter by tag: #${tag}`);
  };

  const toggleTheme = () => {
    setTheme((t) => (t === 'light' ? 'dark' : 'light'));
  };

  const insertText = (text: string) => {
    editorRef.current?.insertText(text);
    editorRef.current?.focus();
  };

  return (
    <div className={`app ${theme}`}>
      <header className="toolbar">
        <div className="toolbar-group">
          <h1>📝 Markdown Editor</h1>
        </div>
        <div className="toolbar-group">
          <button onClick={() => insertText('**bold**')}>Bold</button>
          <button onClick={() => insertText('*italic*')}>Italic</button>
          <button onClick={() => insertText('[[link]]')}>Wikilink</button>
          <button onClick={() => insertText('#tag')}>Tag</button>
          <button onClick={() => insertText('> [!info] Title\n> Content')}>Callout</button>
          <button onClick={() => insertText('$x^2$')}>Math</button>
          <button onClick={() => insertText('| A | B |\n|---|---|\n| 1 | 2 |')}>Table</button>
        </div>
        <div className="toolbar-group">
          <button onClick={toggleTheme}>
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
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

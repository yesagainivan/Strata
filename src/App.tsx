/**
 * Demo application for the Markdown Editor
 */

import { useState, useRef } from 'react';
import { MarkdownEditor, createExtension, mathExtension, tableExtension, EditorErrorBoundary } from './index';
import type { MarkdownEditorHandle, WikilinkData } from './types';
import 'katex/dist/katex.min.css';
import './App.css';

// Sample markdown content demonstrating all features
const DEMO_CONTENT = `# Modern Markdown Editor Showcase

Welcome to **Modern Markdown Editor**! This demo showcases the Obsidian-style WYSIWYG features handled by CodeMirror 6.

This document is designed to test **footnote navigation**[^1]. Click that little number to jump to the bottom!

## 1. Text Formatting & Highlights
Standard markdown works as expected, but with a twist—syntax hides when you're not editing:
- **Bold** and *Italic* are clean.
- ~~Strikethrough~~ is supported.
- \`Inline code\` looks like code.
- **Highlights**: Use \`==\` to ==highlight important text== like this!

---

## 2. Lists & Tasks
We've implemented consistent styling for all list types:

### Unordered
- Level 1 bullet
  - Level 2 bullet
    - Level 3 bullet

### Ordered
1. First step
2. Second step
   1. Sub-step A
   2. Sub-step B
3. Third step

### Task Lists
- [ ] To Do: Implement block embeds
- [x] Done: Consistent list styling
- [x] Done: Highlights
- [x] Done: Footnotes
- [/] In Progress: Editor perfection

---

## 3. Obsidian Features

### Callouts
We support standard Obsidian callouts with custom styling:

> [!info] Did you know?
> Callouts are perfect for highlighting side notes or warnings.
> They support **bold** and *italics* too.

> [!tip] Pro Tip
> You can fold these callouts if you implement the folding extension!

> [!warning] Caution
> Be careful with your regex patterns.

> [!danger] Critical Error
> Something went wrong here.

### Wikilinks & Tags
- Link to other notes: [[Project Roadmap]] or [[Project Roadmap|with alias]].
- Organize content with tags: #productivity #dev/obsidian #ideas.

---

## 4. Math & Tables

### LaTeX Math
Inline math: $e^{i\\pi} + 1 = 0$

Block math:
$$
\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}
$$

### Data Tables
| Feature | Implementation | Status |
| :--- | :---: | ---: |
| WYSIWYG | CM6 Decorators | ✅ |
| Math | KaTeX | ✅ |
| Tables | GFM | ✅ |
| Speed | Rust/WASM | 🚀 |

---

## 5. Code Blocks

\`\`\`typescript
interface User {
  id: number;
  name: string;
  role: 'admin' | 'user';
}

function greet(user: User) {
  console.log(\`Hello, \${user.name}!\`);
}
\`\`\`

---

## 6. Filler Section for Scrolling
*(This section exists to ensure the document is long enough to demonstrate the scroll-to-footnote feature)*

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.

Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.

Curabitur pretium tincidunt lacus. Nulla gravida orci a odio. Nullam varius, turpis et commodo pharetra, est eros bibendum elit, nec luctus magna felis sollicitudin mauris. Integer in mauris eu nibh euismod gravida.

... (Keep scrolling) ...

---

## 7. Footnotes Area

Here is the definition for the footnote referenced at the top.

[^1]: **Success!** You clicked the footnote reference and the editor scrolled you down here. The definition works with standard markdown syntax \`[^1]: ...\`.
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
          <button onClick={() => insertText('==highlight==')}>Highlight</button>
          <button onClick={() => insertText('[[link]]')}>Wikilink</button>
          <button onClick={() => insertText('#tag')}>Tag</button>
          <button onClick={() => insertText('> [!info] Title\n> Content')}>Callout</button>
          <button onClick={() => insertText('$x^2$')}>Math</button>
          <button onClick={() => insertText('| A | B |\n|---|---|\n| 1 | 2 |')}>Table</button>
          <button onClick={() => insertText('\n---\n')}>HR</button>
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

/**
 * Demo application for Strata Editor
 * Showcases the StrataTheme API with preset themes
 */

import { useState, useRef, useMemo } from 'react';
import { MarkdownEditor, createExtension, mathExtension, tableExtension, EditorErrorBoundary, createThemeStyles } from './index';
import type { MarkdownEditorHandle, WikilinkData } from './types';
import { THEME_PRESETS, getThemePreset, formatThemeCode } from './demo/themes';
import 'katex/dist/katex.min.css';
import './App.css';

// Demo content showcasing features
const DEMO_CONTENT = `# Welcome to Strata

A beautiful markdown editor with **live preview** and full theme customization.

> [!tip] Try the Theme Selector
> Use the dropdown in the toolbar to switch between preset themes. Click "Show Code" to see the StrataTheme configuration!

## Features

- **Rich Formatting** — Bold, *italic*, ~~strikethrough~~, ==highlight==
- **Wikilinks** — [[Link to notes]] with Cmd/Ctrl+Click
- **Tags** — Organize with #tags and #nested/tags
- **Callouts** — Info, warning, tip, and more
- **Math** — Inline $E = mc^2$ and block equations
- **Tables** — Full markdown table support

### Example Callouts

> [!info] Information
> Standard info callout with theme-aware styling.

> [!warning] Warning
> Callouts adapt to each theme's color palette.

> [!success] Success
> Everything is working as expected!

### Code Blocks

\`\`\`typescript
const theme: StrataTheme = {
  mode: 'dark',
  colors: { background: '#1a1a2e' }
};
\`\`\`

---

Try editing this content to see the WYSIWYG features in action!
`;

// @mention extension example
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
  const [activeThemeId, setActiveThemeId] = useState('moss');
  const [showCode, setShowCode] = useState(false);
  const editorRef = useRef<MarkdownEditorHandle>(null);

  const activePreset = useMemo(() => getThemePreset(activeThemeId), [activeThemeId]);
  const themeCode = useMemo(() =>
    activePreset ? formatThemeCode(activePreset.theme) : '',
    [activePreset]
  );

  // Generate CSS variables for the entire app container
  const themeStyles = useMemo(() =>
    createThemeStyles(activePreset?.theme || { mode: 'light' }),
    [activePreset]
  );

  const handleWikilinkClick = (data: WikilinkData) => {
    alert(`Navigate to: ${data.target}${data.heading ? '#' + data.heading : ''}`);
  };

  const handleTagClick = (tag: string) => {
    alert(`Filter by tag: #${tag}`);
  };

  const insertText = (text: string) => {
    editorRef.current?.insertText(text);
    editorRef.current?.focus();
  };

  const wrapSelection = (before: string, after: string) => {
    editorRef.current?.wrapSelection(before, after);
    editorRef.current?.focus();
  };

  // Determine if current theme is dark mode
  const isDarkMode = activePreset?.theme.mode === 'dark';

  return (
    <div className={`app ${isDarkMode ? 'dark' : 'light'}`} style={themeStyles as React.CSSProperties}>
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
            <button onClick={() => wrapSelection('\`', '\`')} title="Inline Code">{'</>'}</button>
            <button onClick={() => wrapSelection('[[', ']]')} title="Wikilink">🔗</button>
          </div>
          <div className="button-group" role="group" aria-label="Insert blocks">
            <button onClick={() => insertText('> [!info] Title\n> Content')} title="Callout">📌</button>
            <button onClick={() => wrapSelection('$', '$')} title="Inline Math">∑</button>
            <button onClick={() => insertText('| A | B |\n|---|---|\n| 1 | 2 |')} title="Table">▦</button>
          </div>

          {/* Theme selector */}
          <div className="theme-selector">
            <label htmlFor="theme-select" className="sr-only">Theme</label>
            <select
              id="theme-select"
              value={activeThemeId}
              onChange={(e) => setActiveThemeId(e.target.value)}
              title="Select theme"
            >
              {THEME_PRESETS.map((preset) => (
                <option key={preset.id} value={preset.id}>
                  {preset.name}
                </option>
              ))}
            </select>
          </div>

          <button
            className={`code-toggle ${showCode ? 'active' : ''}`}
            onClick={() => setShowCode(!showCode)}
            title="Show theme code"
          >
            {'{ }'}
          </button>
        </div>
      </header>

      {showCode && (
        <div className="code-panel">
          <div className="code-panel-header">
            <span>StrataTheme Configuration</span>
            <span className="theme-description">{activePreset?.description}</span>
          </div>
          <pre className="code-content">
            <code>{themeCode}</code>
          </pre>
        </div>
      )}

      <main className="editor-container">
        <EditorErrorBoundary>
          <MarkdownEditor
            ref={editorRef}
            value={content}
            onChange={setContent}
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
        <span>Theme: {activePreset?.name} ({isDarkMode ? 'dark' : 'light'})</span>
      </footer>
    </div>
  );
}

export default App;

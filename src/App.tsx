/**
 * Demo application for Strata Editor
 * Showcases the StrataTheme API with preset themes
 */

import { useState, useRef, useMemo } from "react";
import {
  MarkdownEditor,
  createExtension,
  mathExtension,
  tableExtension,
  EditorErrorBoundary,
  createThemeStyles,
} from "./index";
import type { MarkdownEditorHandle, WikilinkData } from "./types";
import { THEME_PRESETS, getThemePreset, formatThemeCode } from "./demo/themes";
import DEMO_CONTENT from "./demo/content.md?raw";
import "katex/dist/katex.min.css";
import "./App.css";

// @mention extension example
const mentionExtension = createExtension({
  name: "mention",
  pattern: /@(\w+)/g,
  className: "cm-mention",
  onClick: (match) => {
    alert(`Clicked on user: @${match[1]}`);
  },
});

function App() {
  const [content, setContent] = useState(DEMO_CONTENT);
  const [activeThemeId, setActiveThemeId] = useState("moss");
  const [showCode, setShowCode] = useState(false);
  const editorRef = useRef<MarkdownEditorHandle>(null);

  const activePreset = useMemo(
    () => getThemePreset(activeThemeId),
    [activeThemeId],
  );
  const themeCode = useMemo(
    () => (activePreset ? formatThemeCode(activePreset.theme) : ""),
    [activePreset],
  );

  // Generate CSS variables for the entire app container
  const themeStyles = useMemo(
    () => createThemeStyles(activePreset?.theme || { mode: "light" }),
    [activePreset],
  );

  const handleWikilinkClick = (data: WikilinkData) => {
    alert(
      `Navigate to: ${data.target}${data.heading ? "#" + data.heading : ""}`,
    );
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
  const isDarkMode = activePreset?.theme.mode === "dark";

  return (
    <div
      className={`app ${isDarkMode ? "dark" : "light"}`}
      style={themeStyles as React.CSSProperties}
    >
      <header className="toolbar">
        <div className="toolbar-left">
          <div className="app-title">
            <svg
              className="app-logo"
              viewBox="0 0 32 32"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 22 L28 22 L26 26 L6 26 Z"
                fill="currentColor"
                opacity="0.4"
              />
              <path
                d="M6 16 L26 16 L24 20 L8 20 Z"
                fill="currentColor"
                opacity="0.65"
              />
              <path
                d="M8 10 L24 10 L22 14 L10 14 Z"
                fill="currentColor"
                opacity="0.9"
              />
              <path
                d="M10 8 L22 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                opacity="0.5"
              />
            </svg>
            <span>Strata Editor</span>
          </div>
          <span className="app-subtitle">Structured • Natural • Powerful</span>
        </div>
        <div className="toolbar-right">
          <div
            className="button-group"
            role="group"
            aria-label="Insert formatting"
          >
            <button onClick={() => wrapSelection("**", "**")} title="Bold">
              <strong>B</strong>
            </button>
            <button onClick={() => wrapSelection("*", "*")} title="Italic">
              <em>I</em>
            </button>
            <button onClick={() => wrapSelection("==", "==")} title="Highlight">
              <span className="btn-highlight">H</span>
            </button>
            <button onClick={() => wrapSelection("`", "`")} title="Inline Code">
              {"</>"}
            </button>
            <button onClick={() => wrapSelection("[[", "]]")} title="Wikilink">
              🔗
            </button>
          </div>
          <div className="button-group" role="group" aria-label="Insert blocks">
            <button
              onClick={() => insertText("> [!info] Title\n> Content")}
              title="Callout"
            >
              📌
            </button>
            <button onClick={() => wrapSelection("$", "$")} title="Inline Math">
              ∑
            </button>
            <button
              onClick={() => insertText("| A | B |\n|---|---|\n| 1 | 2 |")}
              title="Table"
            >
              ▦
            </button>
          </div>

          {/* Theme selector */}
          <div className="theme-selector">
            <label htmlFor="theme-select" className="sr-only">
              Theme
            </label>
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
            className={`code-toggle ${showCode ? "active" : ""}`}
            onClick={() => setShowCode(!showCode)}
            title="Show theme code"
          >
            {"{ }"}
          </button>
        </div>
      </header>

      {showCode && (
        <div className="code-panel">
          <div className="code-panel-header">
            <span>StrataTheme Configuration</span>
            <span className="theme-description">
              {activePreset?.description}
            </span>
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
            // extensions={[mentionExtension, mathExtension()]}  // Remove tableExtension()
            className="editor-instance"
          />
        </EditorErrorBoundary>
      </main>

      <footer className="status-bar">
        <span>Characters: {content.length}</span>
        <span>Lines: {content.split("\n").length}</span>
        <span>
          Theme: {activePreset?.name} ({isDarkMode ? "dark" : "light"})
        </span>
      </footer>
    </div>
  );
}

export default App;

// Type definitions for the Markdown Editor

import { Extension } from '@codemirror/state';

// Re-export theme types
export * from './theme';
export type { StrataTheme, StrataColors, SyntaxColors, ElementColors, TableColors, CalloutConfig, CalloutColors } from './theme';

/**
 * Configuration options for the MarkdownEditor component
 */
export interface MarkdownEditorProps {
  /** Controlled value - markdown content */
  value?: string;
  /** Initial value for uncontrolled mode */
  defaultValue?: string;
  /** Callback when content changes */
  onChange?: (value: string) => void;
  /** Additional CodeMirror 6 extensions */
  extensions?: Extension[];
  /** Placeholder text when editor is empty */
  placeholder?: string;
  /** Make editor read-only */
  readOnly?: boolean;
  /** CSS class name for the editor container */
  className?: string;
  /** Callback when a wikilink is clicked */
  onWikilinkClick?: (link: WikilinkData, event: MouseEvent) => void;
  /** Callback when a tag is clicked */
  onTagClick?: (tag: string, event: MouseEvent) => void;
  /** Interaction mode for wikilinks (default: 'modifier') */
  wikilinkInteraction?: 'click' | 'modifier';
  /** Interaction mode for tags (default: 'modifier') */
  tagInteraction?: 'click' | 'modifier';
}

/**
 * Data structure for a wikilink
 */
export interface WikilinkData {
  /** The target note/file name */
  target: string;
  /** Optional display alias */
  alias?: string;
  /** Optional heading reference */
  heading?: string;
  /** Optional block reference */
  block?: string;
}

/**
 * Callout types supported by the editor
 */
export type CalloutType =
  | 'note'
  | 'info'
  | 'tip'
  | 'warning'
  | 'danger'
  | 'success'
  | 'question'
  | 'quote'
  | 'example'
  | 'bug';

/**
 * Configuration for a callout block
 */
export interface CalloutData {
  /** Type of callout (determines styling) */
  type: CalloutType;
  /** Optional custom title */
  title?: string;
  /** Whether the callout is foldable */
  foldable?: boolean;
  /** Whether the callout is initially folded */
  folded?: boolean;
}

/**
 * Imperative handle for the editor (accessed via ref)
 */
export interface MarkdownEditorHandle {
  /** Get the current markdown content */
  getValue: () => string;
  /** Set the content */
  setValue: (content: string) => void;
  /** Focus the editor */
  focus: () => void;
  /** Insert text at cursor position */
  insertText: (text: string) => void;
  /** Get the current selection */
  getSelection: () => string;
  /** Replace the current selection with text */
  replaceSelection: (text: string) => void;
  /** Wrap selected text with before/after syntax, or insert if no selection */
  wrapSelection: (before: string, after: string) => void;
  /** Get the underlying CodeMirror EditorView */
  getEditorView: () => unknown;
}

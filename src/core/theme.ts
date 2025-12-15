/**
 * Theme configuration for the markdown editor
 * Uses CSS variables for easy customization
 */

import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';

/**
 * Light theme CSS variables
 */
const lightThemeVars = {
    '--editor-bg': '#ffffff',
    '--editor-text': '#1a1a1a',
    '--editor-selection': '#b4d5fe',
    '--editor-cursor': '#000000',
    '--editor-gutter-bg': '#f8f9fa',
    '--editor-gutter-text': '#6c757d',
    '--editor-line-highlight': '#f8f9fa',

    // Syntax highlighting
    '--syntax-heading': '#0f172a',
    '--syntax-bold': '#1e293b',
    '--syntax-italic': '#475569',
    '--syntax-link': '#2563eb',
    '--syntax-code': '#e11d48',
    '--syntax-code-bg': '#f1f5f9',
    '--syntax-blockquote': '#64748b',
    '--syntax-list-marker': '#0ea5e9',
    '--syntax-highlight-bg': '#fef08a',
    '--syntax-highlight-text': '#1a1a1a',
    '--syntax-footnote': '#8b5cf6',

    // Obsidian extensions
    '--wikilink-color': '#7c3aed',
    '--wikilink-hover': '#5b21b6',
    '--tag-color': '#0891b2',
    '--tag-bg': '#ecfeff',
    '--callout-info-bg': '#eff6ff',
    '--callout-info-border': '#3b82f6',
    '--callout-warning-bg': '#fffbeb',
    '--callout-warning-border': '#f59e0b',
    '--callout-danger-bg': '#fef2f2',
    '--callout-danger-border': '#ef4444',
    '--callout-success-bg': '#f0fdf4',
    '--callout-success-border': '#22c55e',
    '--callout-tip-bg': '#f0fdfa',
    '--callout-tip-border': '#14b8a6',
    '--callout-note-bg': '#f0f4ff',
    '--callout-note-border': '#6366f1',
    '--callout-question-bg': '#f5f3ff',
    '--callout-question-border': '#8b5cf6',
    '--callout-quote-bg': '#f8fafc',
    '--callout-quote-border': '#64748b',
    '--callout-example-bg': '#f0f9ff',
    '--callout-example-border': '#0ea5e9',
    '--callout-bug-bg': '#fef2f2',
    '--callout-bug-border': '#ef4444',

    // Tables
    '--table-border': '#e2e8f0',
    '--table-header-bg': '#f1f5f9',
    '--table-header-color': '#1e293b',
    '--table-row-alt-bg': '#f8fafc',
    '--table-row-hover': '#e0f2fe',
};

/**
 * Dark theme CSS variables
 */
const darkThemeVars = {
    '--editor-bg': '#1a1a1a',
    '--editor-text': '#e5e7eb',
    '--editor-selection': '#3b4252',
    '--editor-cursor': '#ffffff',
    '--editor-gutter-bg': '#252525',
    '--editor-gutter-text': '#6b7280',
    '--editor-line-highlight': '#252525',

    // Syntax highlighting
    '--syntax-heading': '#f8fafc',
    '--syntax-bold': '#f1f5f9',
    '--syntax-italic': '#cbd5e1',
    '--syntax-link': '#60a5fa',
    '--syntax-code': '#fb7185',
    '--syntax-code-bg': '#292524',
    '--syntax-blockquote': '#94a3b8',
    '--syntax-list-marker': '#38bdf8',
    '--syntax-highlight-bg': '#854d0e',
    '--syntax-highlight-text': '#fef9c3',
    '--syntax-footnote': '#a78bfa',

    // Obsidian extensions
    '--wikilink-color': '#a78bfa',
    '--wikilink-hover': '#c4b5fd',
    '--tag-color': '#22d3ee',
    '--tag-bg': '#164e63',
    '--callout-info-bg': '#1e3a5f',
    '--callout-info-border': '#3b82f6',
    '--callout-warning-bg': '#422006',
    '--callout-warning-border': '#f59e0b',
    '--callout-danger-bg': '#450a0a',
    '--callout-danger-border': '#ef4444',
    '--callout-success-bg': '#052e16',
    '--callout-success-border': '#22c55e',
    '--callout-tip-bg': '#042f2e',
    '--callout-tip-border': '#14b8a6',
    '--callout-note-bg': '#1e1b4b',
    '--callout-note-border': '#6366f1',
    '--callout-question-bg': '#2e1065',
    '--callout-question-border': '#8b5cf6',
    '--callout-quote-bg': '#1e293b',
    '--callout-quote-border': '#64748b',
    '--callout-example-bg': '#0c4a6e',
    '--callout-example-border': '#0ea5e9',
    '--callout-bug-bg': '#450a0a',
    '--callout-bug-border': '#ef4444',

    // Tables
    '--table-border': '#3f3f46',
    '--table-header-bg': '#27272a',
    '--table-header-color': '#f4f4f5',
    '--table-row-alt-bg': '#1f1f23',
    '--table-row-hover': '#2e3440',
};

/**
 * Base editor theme (structural styles)
 */
const baseTheme = EditorView.baseTheme({
    '&': {
        height: '100%',
    },
    '.cm-scroller': {
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '16px',
        lineHeight: '1.6',
        overflow: 'auto',
    },
    '.cm-content': {
        padding: '16px',
        width: '100%',
        maxWidth: '800px',
        margin: '0 auto',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
    },
    '.cm-focused': {
        outline: 'none',
    },
    '.cm-line': {
        padding: '0 2px',
    },
    '.cm-cursor': {
        borderLeftWidth: '2px',
    },

    // Placeholder
    '.cm-placeholder': {
        color: 'var(--editor-gutter-text)',
        fontStyle: 'italic',
    },

    // Headings (sized)
    '.cm-heading-1': {
        fontSize: '2em',
        fontWeight: '700',
        color: 'var(--syntax-heading)',
    },
    '.cm-heading-2': {
        fontSize: '1.5em',
        fontWeight: '600',
        color: 'var(--syntax-heading)',
    },
    '.cm-heading-3': {
        fontSize: '1.25em',
        fontWeight: '600',
        color: 'var(--syntax-heading)',
    },
    '.cm-heading-4': {
        fontSize: '1.1em',
        fontWeight: '600',
        color: 'var(--syntax-heading)',
    },
    '.cm-heading-5, .cm-heading-6': {
        fontSize: '1em',
        fontWeight: '600',
        color: 'var(--syntax-heading)',
    },

    // Inline formatting
    '.cm-strong': {
        fontWeight: '700',
        color: 'var(--syntax-bold)',
    },
    '.cm-emphasis': {
        fontStyle: 'italic',
        color: 'var(--syntax-italic)',
    },
    '.cm-strikethrough': {
        textDecoration: 'line-through',
        opacity: '0.7',
    },
    '.cm-code': {
        fontFamily: '"SF Mono", Monaco, "Cascadia Code", monospace',
        backgroundColor: 'var(--syntax-code-bg)',
        color: 'var(--syntax-code)',
        padding: '2px 4px',
        borderRadius: '3px',
    },

    // Highlights (==text==)
    '.cm-highlight': {
        backgroundColor: 'var(--syntax-highlight-bg)',
        color: 'var(--syntax-highlight-text)',
        padding: '1px 2px',
        borderRadius: '2px',
    },

    // Footnotes ([^1] and [^1]: definition)
    '.cm-footnote-ref': {
        color: 'var(--syntax-footnote)',
        fontSize: '0.85em',
        verticalAlign: 'super',
        fontWeight: '600',
        cursor: 'pointer',
    },
    '.cm-footnote-def': {
        color: 'var(--syntax-footnote)',
        fontWeight: '600',
    },

    // Links
    '.cm-link': {
        color: 'var(--syntax-link)',
        textDecoration: 'underline',
        cursor: 'pointer',
    },

    // Blockquotes
    '.cm-blockquote': {
        borderLeft: '4px solid var(--syntax-blockquote)',
        paddingLeft: '16px',
        color: 'var(--syntax-blockquote)',
    },

    // Lists
    '.cm-list-item': {
        paddingLeft: '8px',
    },
    '.cm-list-item-unordered': {
        // Additional styling for unordered list items if needed
    },
    '.cm-list-item-ordered': {
        // Additional styling for ordered list items if needed
    },
    '.cm-list-marker': {
        color: 'var(--syntax-list-marker)',
        fontWeight: '600',
    },
    '.cm-list-bullet': {
        color: 'var(--syntax-list-marker)',
        fontWeight: 'bold',
        display: 'inline-block',
        width: '1.2em',
        textAlign: 'center',
    },
    '.cm-list-number': {
        color: 'var(--syntax-list-marker)',
        fontWeight: '600',
        display: 'inline-block',
        minWidth: '1.5em',
        textAlign: 'right',
        paddingRight: '0.3em',
    },
    '.cm-list-marker-source': {
        color: 'var(--syntax-list-marker)',
        fontWeight: 'bold',
    },

    // Horizontal rules
    '.cm-horizontal-rule': {
        display: 'block',
        width: '100%',
        height: '0',
        borderTop: '1px solid var(--editor-gutter-text)',
        padding: '16px 0',
        opacity: '0.5',
        boxSizing: 'border-box',
        // Let clicks pass through to position cursor correctly
        pointerEvents: 'none',
    },
    '.cm-hr-source': {
        color: 'var(--editor-gutter-text)',
        opacity: '0.6',
    },

    // Code blocks
    '.cm-code-block': {
        fontFamily: '"SF Mono", Monaco, "Cascadia Code", monospace',
        backgroundColor: 'var(--syntax-code-bg)',
        padding: '0 12px',
    },
    '.cm-code-block-start': {
        borderTopLeftRadius: '6px',
        borderTopRightRadius: '6px',
        paddingTop: '8px',
    },
    '.cm-code-block-end': {
        borderBottomLeftRadius: '6px',
        borderBottomRightRadius: '6px',
        paddingBottom: '8px',
    },

    // Wikilinks
    '.cm-wikilink': {
        color: 'var(--wikilink-color)',
        textDecoration: 'none',
        cursor: 'pointer',
        borderBottom: '1px dashed var(--wikilink-color)',
        '&:hover': {
            color: 'var(--wikilink-hover)',
        },
    },

    // Tags
    '.cm-tag': {
        color: 'var(--tag-color)',
        backgroundColor: 'var(--tag-bg)',
        padding: '1px 6px',
        borderRadius: '10px',
        fontSize: '0.9em',
        cursor: 'pointer',
    },

    // Note: Callout styles are defined in the callout extension itself
    // to keep the extension self-contained. CSS variables for callout colors
    // are defined in lightThemeVars and darkThemeVars above.
});

/**
 * Create a complete theme extension for the given mode
 */
export function createEditorTheme(mode: 'light' | 'dark'): Extension {
    const vars = mode === 'dark' ? darkThemeVars : lightThemeVars;

    // Create CSS variable theme
    const varTheme = EditorView.theme({
        '&': {
            backgroundColor: 'var(--editor-bg)',
            color: 'var(--editor-text)',
            ...Object.fromEntries(
                Object.entries(vars).map(([key, value]) => [key, value])
            ),
        },
        '&.cm-focused .cm-cursor': {
            borderLeftColor: 'var(--editor-cursor)',
        },
        '&.cm-focused .cm-selectionBackground, ::selection': {
            backgroundColor: 'var(--editor-selection)',
        },
        '.cm-activeLine': {
            backgroundColor: 'var(--editor-line-highlight)',
        },
        '.cm-gutters': {
            backgroundColor: 'var(--editor-gutter-bg)',
            color: 'var(--editor-gutter-text)',
            border: 'none',
        },
    });

    // Inject CSS variables
    const cssVarsTheme = EditorView.theme({
        '&': vars as Record<string, string>,
    });

    return [baseTheme, varTheme, cssVarsTheme];
}

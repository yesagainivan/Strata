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
        maxWidth: '800px',
        margin: '0 auto',
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
    '.cm-list-marker': {
        color: 'var(--syntax-list-marker)',
        fontWeight: '600',
    },

    // Code blocks
    '.cm-code-block': {
        fontFamily: '"SF Mono", Monaco, "Cascadia Code", monospace',
        backgroundColor: 'var(--syntax-code-bg)',
        borderRadius: '6px',
        padding: '12px',
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

    // Callouts
    '.cm-callout': {
        borderRadius: '6px',
        padding: '12px 16px',
        marginTop: '8px',
        marginBottom: '8px',
        borderLeft: '4px solid',
    },
    '.cm-callout-info': {
        backgroundColor: 'var(--callout-info-bg)',
        borderLeftColor: 'var(--callout-info-border)',
    },
    '.cm-callout-warning': {
        backgroundColor: 'var(--callout-warning-bg)',
        borderLeftColor: 'var(--callout-warning-border)',
    },
    '.cm-callout-danger': {
        backgroundColor: 'var(--callout-danger-bg)',
        borderLeftColor: 'var(--callout-danger-border)',
    },
    '.cm-callout-success': {
        backgroundColor: 'var(--callout-success-bg)',
        borderLeftColor: 'var(--callout-success-border)',
    },
    '.cm-callout-tip': {
        backgroundColor: 'var(--callout-tip-bg)',
        borderLeftColor: 'var(--callout-tip-border)',
    },
    '.cm-callout-title': {
        fontWeight: '600',
    },
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

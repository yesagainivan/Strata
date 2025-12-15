/**
 * Theme configuration for the markdown editor
 * Uses CSS variables for easy customization
 */

import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import type { StrataTheme, StrataColors, SyntaxColors, ElementColors, TableColors, CalloutConfig } from '../types/theme';

// =============================================================================
// DEFAULT THEME VALUES
// =============================================================================

/**
 * Default light mode core colors
 */
export const LIGHT_COLORS: StrataColors = {
    background: '#ffffff',
    foreground: '#1a1a1a',
    selection: '#b4d5fe',
    cursor: '#000000',
    lineHighlight: '#f8f9fa',
    gutterBackground: '#f8f9fa',
    gutterForeground: '#6c757d',
};

/**
 * Default dark mode core colors
 */
export const DARK_COLORS: StrataColors = {
    background: '#1a1a1a',
    foreground: '#e5e7eb',
    selection: '#3b4252',
    cursor: '#ffffff',
    lineHighlight: '#252525',
    gutterBackground: '#252525',
    gutterForeground: '#6b7280',
};

/**
 * Default light mode syntax colors
 */
export const LIGHT_SYNTAX: SyntaxColors = {
    heading: '#0f172a',
    bold: '#1e293b',
    italic: '#475569',
    link: '#2563eb',
    code: '#e11d48',
    codeBackground: '#f1f5f9',
    blockquote: '#64748b',
    listMarker: '#0ea5e9',
    highlightBackground: '#fef08a',
    highlightText: '#1a1a1a',
    footnote: '#8b5cf6',
};

/**
 * Default dark mode syntax colors
 */
export const DARK_SYNTAX: SyntaxColors = {
    heading: '#f8fafc',
    bold: '#f1f5f9',
    italic: '#cbd5e1',
    link: '#60a5fa',
    code: '#fb7185',
    codeBackground: '#292524',
    blockquote: '#94a3b8',
    listMarker: '#38bdf8',
    highlightBackground: '#854d0e',
    highlightText: '#fef9c3',
    footnote: '#a78bfa',
};

/**
 * Default light mode element colors
 */
export const LIGHT_ELEMENTS: ElementColors = {
    wikilink: '#7c3aed',
    wikilinkHover: '#5b21b6',
    tag: '#0891b2',
    tagBackground: '#ecfeff',
};

/**
 * Default dark mode element colors
 */
export const DARK_ELEMENTS: ElementColors = {
    wikilink: '#a78bfa',
    wikilinkHover: '#c4b5fd',
    tag: '#22d3ee',
    tagBackground: '#164e63',
};

/**
 * Default light mode table colors
 */
export const LIGHT_TABLES: TableColors = {
    border: '#e2e8f0',
    headerBackground: '#f1f5f9',
    headerForeground: '#1e293b',
    rowAltBackground: '#f8fafc',
    rowHover: '#e0f2fe',
};

/**
 * Default dark mode table colors
 */
export const DARK_TABLES: TableColors = {
    border: '#3f3f46',
    headerBackground: '#27272a',
    headerForeground: '#f4f4f5',
    rowAltBackground: '#1f1f23',
    rowHover: '#2e3440',
};

/**
 * Default light mode callout colors
 */
export const LIGHT_CALLOUTS: CalloutConfig = {
    info: { background: 'rgba(59, 130, 246, 0.12)', border: '#3b82f6', header: '#1e40af' },
    warning: { background: 'rgba(245, 158, 11, 0.12)', border: '#f59e0b', header: '#92400e' },
    danger: { background: 'rgba(239, 68, 68, 0.12)', border: '#ef4444', header: '#991b1b' },
    success: { background: 'rgba(34, 197, 94, 0.12)', border: '#22c55e', header: '#166534' },
    tip: { background: 'rgba(20, 184, 166, 0.12)', border: '#14b8a6', header: '#115e59' },
    note: { background: 'rgba(99, 102, 241, 0.12)', border: '#6366f1', header: '#4338ca' },
    question: { background: 'rgba(139, 92, 246, 0.12)', border: '#8b5cf6', header: '#6b21a8' },
    quote: { background: 'rgba(100, 116, 139, 0.12)', border: '#64748b', header: '#475569' },
    example: { background: 'rgba(14, 165, 233, 0.12)', border: '#0ea5e9', header: '#0369a1' },
    bug: { background: 'rgba(239, 68, 68, 0.12)', border: '#ef4444', header: '#991b1b' },
};

/**
 * Default dark mode callout colors
 */
export const DARK_CALLOUTS: CalloutConfig = {
    info: { background: 'rgba(59, 130, 246, 0.15)', border: '#3b82f6', header: '#60a5fa' },
    warning: { background: 'rgba(245, 158, 11, 0.15)', border: '#f59e0b', header: '#fbbf24' },
    danger: { background: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', header: '#f87171' },
    success: { background: 'rgba(34, 197, 94, 0.15)', border: '#22c55e', header: '#4ade80' },
    tip: { background: 'rgba(20, 184, 166, 0.15)', border: '#14b8a6', header: '#2dd4bf' },
    note: { background: 'rgba(99, 102, 241, 0.15)', border: '#6366f1', header: '#a5b4fc' },
    question: { background: 'rgba(139, 92, 246, 0.15)', border: '#8b5cf6', header: '#c4b5fd' },
    quote: { background: 'rgba(100, 116, 139, 0.15)', border: '#64748b', header: '#94a3b8' },
    example: { background: 'rgba(14, 165, 233, 0.15)', border: '#0ea5e9', header: '#38bdf8' },
    bug: { background: 'rgba(239, 68, 68, 0.15)', border: '#ef4444', header: '#f87171' },
};

// =============================================================================
// CSS VARIABLE GENERATION
// =============================================================================

/**
 * Create CSS variables from a StrataTheme configuration
 * Returns an object ready to be spread into a style attribute
 */
export function createThemeStyles(theme: StrataTheme): Record<string, string> {
    const isDark = theme.mode === 'dark';

    // Merge defaults with user overrides using spread
    const colors: StrataColors = { ...(isDark ? DARK_COLORS : LIGHT_COLORS), ...theme.colors };
    const syntax: SyntaxColors = { ...(isDark ? DARK_SYNTAX : LIGHT_SYNTAX), ...theme.syntax };
    const elements: ElementColors = { ...(isDark ? DARK_ELEMENTS : LIGHT_ELEMENTS), ...theme.elements };
    const tables: TableColors = { ...(isDark ? DARK_TABLES : LIGHT_TABLES), ...theme.tables };

    // For callouts, need to merge each type individually
    const defaultCallouts = isDark ? DARK_CALLOUTS : LIGHT_CALLOUTS;
    const userCallouts = theme.callouts || {};
    const callouts: CalloutConfig = {
        info: { ...defaultCallouts.info, ...userCallouts.info },
        warning: { ...defaultCallouts.warning, ...userCallouts.warning },
        danger: { ...defaultCallouts.danger, ...userCallouts.danger },
        success: { ...defaultCallouts.success, ...userCallouts.success },
        tip: { ...defaultCallouts.tip, ...userCallouts.tip },
        note: { ...defaultCallouts.note, ...userCallouts.note },
        question: { ...defaultCallouts.question, ...userCallouts.question },
        quote: { ...defaultCallouts.quote, ...userCallouts.quote },
        example: { ...defaultCallouts.example, ...userCallouts.example },
        bug: { ...defaultCallouts.bug, ...userCallouts.bug },
    };

    return {
        // Core colors
        '--editor-bg': colors.background,
        '--editor-text': colors.foreground,
        '--editor-selection': colors.selection,
        '--editor-cursor': colors.cursor,
        '--editor-line-highlight': colors.lineHighlight,
        '--editor-gutter-bg': colors.gutterBackground,
        '--editor-gutter-text': colors.gutterForeground,

        // Syntax
        '--syntax-heading': syntax.heading,
        '--syntax-bold': syntax.bold,
        '--syntax-italic': syntax.italic,
        '--syntax-link': syntax.link,
        '--syntax-code': syntax.code,
        '--syntax-code-bg': syntax.codeBackground,
        '--syntax-blockquote': syntax.blockquote,
        '--syntax-list-marker': syntax.listMarker,
        '--syntax-highlight-bg': syntax.highlightBackground,
        '--syntax-highlight-text': syntax.highlightText,
        '--syntax-footnote': syntax.footnote,

        // Elements
        '--wikilink-color': elements.wikilink,
        '--wikilink-hover': elements.wikilinkHover,
        '--tag-color': elements.tag,
        '--tag-bg': elements.tagBackground,

        // Tables
        '--table-border': tables.border,
        '--table-header-bg': tables.headerBackground,
        '--table-header-color': tables.headerForeground,
        '--table-row-alt-bg': tables.rowAltBackground,
        '--table-row-hover': tables.rowHover,

        // Callouts
        '--callout-info-bg': callouts.info.background,
        '--callout-info-border': callouts.info.border,
        '--callout-header-info': callouts.info.header,
        '--callout-warning-bg': callouts.warning.background,
        '--callout-warning-border': callouts.warning.border,
        '--callout-header-warning': callouts.warning.header,
        '--callout-danger-bg': callouts.danger.background,
        '--callout-danger-border': callouts.danger.border,
        '--callout-header-danger': callouts.danger.header,
        '--callout-success-bg': callouts.success.background,
        '--callout-success-border': callouts.success.border,
        '--callout-header-success': callouts.success.header,
        '--callout-tip-bg': callouts.tip.background,
        '--callout-tip-border': callouts.tip.border,
        '--callout-header-tip': callouts.tip.header,
        '--callout-note-bg': callouts.note.background,
        '--callout-note-border': callouts.note.border,
        '--callout-header-note': callouts.note.header,
        '--callout-question-bg': callouts.question.background,
        '--callout-question-border': callouts.question.border,
        '--callout-header-question': callouts.question.header,
        '--callout-quote-bg': callouts.quote.background,
        '--callout-quote-border': callouts.quote.border,
        '--callout-header-quote': callouts.quote.header,
        '--callout-example-bg': callouts.example.background,
        '--callout-example-border': callouts.example.border,
        '--callout-header-example': callouts.example.header,
        '--callout-bug-bg': callouts.bug.background,
        '--callout-bug-border': callouts.bug.border,
        '--callout-header-bug': callouts.bug.header,
    };
}

// =============================================================================
// LEGACY SUPPORT - Internal CSS variable objects (kept for backward compat)
// =============================================================================

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

    // Callouts - using transparent backgrounds that work in both light and dark mode
    '--callout-info-bg': 'rgba(59, 130, 246, 0.12)',
    '--callout-info-border': '#3b82f6',
    '--callout-warning-bg': 'rgba(245, 158, 11, 0.12)',
    '--callout-warning-border': '#f59e0b',
    '--callout-danger-bg': 'rgba(239, 68, 68, 0.12)',
    '--callout-danger-border': '#ef4444',
    '--callout-success-bg': 'rgba(34, 197, 94, 0.12)',
    '--callout-success-border': '#22c55e',
    '--callout-tip-bg': 'rgba(20, 184, 166, 0.12)',
    '--callout-tip-border': '#14b8a6',
    '--callout-note-bg': 'rgba(99, 102, 241, 0.12)',
    '--callout-note-border': '#6366f1',
    '--callout-question-bg': 'rgba(139, 92, 246, 0.12)',
    '--callout-question-border': '#8b5cf6',
    '--callout-quote-bg': 'rgba(100, 116, 139, 0.12)',
    '--callout-quote-border': '#64748b',
    '--callout-example-bg': 'rgba(14, 165, 233, 0.12)',
    '--callout-example-border': '#0ea5e9',
    '--callout-bug-bg': 'rgba(239, 68, 68, 0.12)',
    '--callout-bug-border': '#ef4444',

    // Tables
    '--table-border': '#e2e8f0',
    '--table-header-bg': '#f1f5f9',
    '--table-header-color': '#1e293b',
    '--table-row-alt-bg': '#f8fafc',
    '--table-row-hover': '#e0f2fe',

    // Callout header colors (icon + title)
    '--callout-header-info': '#1e40af',
    '--callout-header-warning': '#92400e',
    '--callout-header-danger': '#991b1b',
    '--callout-header-success': '#166534',
    '--callout-header-tip': '#115e59',
    '--callout-header-note': '#4338ca',
    '--callout-header-question': '#6b21a8',
    '--callout-header-quote': '#475569',
    '--callout-header-example': '#0369a1',
    '--callout-header-bug': '#991b1b',
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

    // Callouts - using same transparent backgrounds that work in both modes
    '--callout-info-bg': 'rgba(59, 130, 246, 0.15)',
    '--callout-info-border': '#3b82f6',
    '--callout-warning-bg': 'rgba(245, 158, 11, 0.15)',
    '--callout-warning-border': '#f59e0b',
    '--callout-danger-bg': 'rgba(239, 68, 68, 0.15)',
    '--callout-danger-border': '#ef4444',
    '--callout-success-bg': 'rgba(34, 197, 94, 0.15)',
    '--callout-success-border': '#22c55e',
    '--callout-tip-bg': 'rgba(20, 184, 166, 0.15)',
    '--callout-tip-border': '#14b8a6',
    '--callout-note-bg': 'rgba(99, 102, 241, 0.15)',
    '--callout-note-border': '#6366f1',
    '--callout-question-bg': 'rgba(139, 92, 246, 0.15)',
    '--callout-question-border': '#8b5cf6',
    '--callout-quote-bg': 'rgba(100, 116, 139, 0.15)',
    '--callout-quote-border': '#64748b',
    '--callout-example-bg': 'rgba(14, 165, 233, 0.15)',
    '--callout-example-border': '#0ea5e9',
    '--callout-bug-bg': 'rgba(239, 68, 68, 0.15)',
    '--callout-bug-border': '#ef4444',

    // Tables
    '--table-border': '#3f3f46',
    '--table-header-bg': '#27272a',
    '--table-header-color': '#f4f4f5',
    '--table-row-alt-bg': '#1f1f23',
    '--table-row-hover': '#2e3440',

    // Callout header colors (icon + title) - brighter for dark mode
    '--callout-header-info': '#60a5fa',
    '--callout-header-warning': '#fbbf24',
    '--callout-header-danger': '#f87171',
    '--callout-header-success': '#4ade80',
    '--callout-header-tip': '#2dd4bf',
    '--callout-header-note': '#a5b4fc',
    '--callout-header-question': '#c4b5fd',
    '--callout-header-quote': '#94a3b8',
    '--callout-header-example': '#38bdf8',
    '--callout-header-bug': '#f87171',
};

/**
 * Base editor theme (structural styles)
 * Uses CSS variables with sensible defaults for typography customization
 */
const baseTheme = EditorView.baseTheme({
    '&': {
        height: '100%',
    },
    '.cm-scroller': {
        fontFamily: 'var(--editor-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        fontSize: 'var(--editor-font-size, 16px)',
        lineHeight: 'var(--editor-line-height, 1.6)',
        overflow: 'auto',
    },
    '.cm-content': {
        padding: 'var(--editor-content-padding, 16px)',
        width: '100%',
        maxWidth: 'var(--editor-content-max-width, 800px)',
        margin: '0 auto',
        wordWrap: 'break-word',
        whiteSpace: 'pre-wrap',
        caretColor: 'var(--editor-cursor)',
    },
    '.cm-focused': {
        outline: 'none',
    },
    '.cm-line': {
        padding: '0 2px',
    },
    '.cm-cursor': {
        borderLeftWidth: '2px',
        borderLeftColor: 'var(--editor-cursor)',
    },

    // Placeholder
    '.cm-placeholder': {
        color: 'var(--editor-gutter-text)',
        fontStyle: 'italic',
    },

    // Headings (sized with CSS variables for customization)
    '.cm-heading-1': {
        fontSize: 'var(--heading-1-size, 2em)',
        fontWeight: 'var(--heading-1-weight, 700)',
        color: 'var(--syntax-heading)',
        borderBottom: 'var(--heading-1-border, none)',
        paddingBottom: 'var(--heading-1-padding, 0)',
        marginBottom: 'var(--heading-1-margin, 0)',
    },
    '.cm-heading-2': {
        fontSize: 'var(--heading-2-size, 1.5em)',
        fontWeight: 'var(--heading-2-weight, 600)',
        color: 'var(--syntax-heading)',
        borderBottom: 'var(--heading-2-border, none)',
        paddingBottom: 'var(--heading-2-padding, 0)',
    },
    '.cm-heading-3': {
        fontSize: 'var(--heading-3-size, 1.25em)',
        fontWeight: 'var(--heading-3-weight, 600)',
        color: 'var(--syntax-heading)',
    },
    '.cm-heading-4': {
        fontSize: 'var(--heading-4-size, 1.1em)',
        fontWeight: 'var(--heading-4-weight, 600)',
        color: 'var(--syntax-heading)',
    },
    '.cm-heading-5, .cm-heading-6': {
        fontSize: 'var(--heading-5-size, 1em)',
        fontWeight: 'var(--heading-5-weight, 600)',
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

    // Highlights (==text==) - uses warning colors by default for consistency
    '.cm-highlight': {
        backgroundColor: 'var(--syntax-highlight-bg, var(--callout-warning-bg, #fef08a))',
        color: 'var(--syntax-highlight-text, var(--callout-header-warning, #854d0e))',
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
        padding: '2px 0',
        margin: '2px 0',
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
 * 
 * Note: This extension sets up styles that USE CSS variables (var(--editor-bg)),
 * but does NOT define the variable values. The variables should be set on the
 * parent container via createThemeStyles() or inline styles.
 */
export function createEditorTheme(_mode: 'light' | 'dark'): Extension {
    // Theme that references CSS variables (values come from parent container)
    const varTheme = EditorView.theme({
        '&': {
            backgroundColor: 'var(--editor-bg)',
            color: 'var(--editor-text)',
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

    return [baseTheme, varTheme];
}


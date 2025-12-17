/**
 * Theme configuration for the markdown editor
 * Uses CSS variables for easy customization
 */

import { Extension } from '@codemirror/state';
import { EditorView } from '@codemirror/view';
import { HighlightStyle } from '@codemirror/language';
import { tags } from '@lezer/highlight';
import type { StrataTheme, StrataColors, SyntaxColors, ElementColors, TableColors, CalloutConfig, CodeColors } from '../types/theme';

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
 * Refined neutral palette with subtle warmth
 */
export const DARK_COLORS: StrataColors = {
    background: '#16181c',
    foreground: '#d8dce4',
    selection: '#2a3548',
    cursor: '#e8ecf0',
    lineHighlight: '#1c1f24',
    gutterBackground: '#1a1c20',
    gutterForeground: '#5a6270',
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
 * Softer, more balanced palette
 */
export const DARK_SYNTAX: SyntaxColors = {
    heading: '#e8ecf4',
    bold: '#dce0e8',
    italic: '#a8b0c0',
    link: '#6ea8dc',
    code: '#e07888',
    codeBackground: '#1e2228',
    blockquote: '#8894a8',
    listMarker: '#5898c8',
    highlightBackground: '#785020',
    highlightText: '#f8f0d0',
    footnote: '#9888c8',
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
 * Refined with better contrast
 */
export const DARK_ELEMENTS: ElementColors = {
    wikilink: '#9080c8',
    wikilinkHover: '#a898d8',
    tag: '#58a8b8',
    tagBackground: '#1a3038',
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
 * Subtle contrast for readability
 */
export const DARK_TABLES: TableColors = {
    border: '#2a2e38',
    headerBackground: '#1e2128',
    headerForeground: '#d8dce4',
    rowAltBackground: '#1a1d22',
    rowHover: '#242830',
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
 * Muted, professional palette with good contrast
 */
export const DARK_CALLOUTS: CalloutConfig = {
    info: { background: 'rgba(80, 130, 180, 0.14)', border: '#4878a8', header: '#78a8d0' },
    warning: { background: 'rgba(190, 140, 70, 0.14)', border: '#a88848', header: '#d0b078' },
    danger: { background: 'rgba(180, 90, 90, 0.14)', border: '#a85858', header: '#d08888' },
    success: { background: 'rgba(80, 150, 100, 0.14)', border: '#488858', header: '#78b888' },
    tip: { background: 'rgba(70, 150, 140, 0.14)', border: '#408878', header: '#68b8a8' },
    note: { background: 'rgba(100, 110, 170, 0.14)', border: '#585890', header: '#8898c8' },
    question: { background: 'rgba(120, 100, 160, 0.14)', border: '#685898', header: '#9888c0' },
    quote: { background: 'rgba(100, 110, 125, 0.12)', border: '#58606c', header: '#889098' },
    example: { background: 'rgba(70, 140, 170, 0.14)', border: '#407898', header: '#68a8c8' },
    bug: { background: 'rgba(170, 90, 90, 0.14)', border: '#985858', header: '#c88888' },
};

/**
 * Default light mode code syntax highlighting colors (GitHub-inspired)
 */
export const LIGHT_CODE: CodeColors = {
    keyword: '#d73a49',
    comment: '#6a737d',
    string: '#032f62',
    number: '#005cc5',
    function: '#6f42c1',
    variable: '#24292e',
    type: '#22863a',
    property: '#005cc5',
    operator: '#d73a49',
    punctuation: '#24292e',
    regex: '#032f62',
    builtin: '#e36209',
};

/**
 * Default dark mode code syntax highlighting colors (GitHub Dark-inspired)
 */
export const DARK_CODE: CodeColors = {
    keyword: '#ff7b72',
    comment: '#8b949e',
    string: '#a5d6ff',
    number: '#79c0ff',
    function: '#d2a8ff',
    variable: '#c9d1d9',
    type: '#7ee787',
    property: '#79c0ff',
    operator: '#ff7b72',
    punctuation: '#c9d1d9',
    regex: '#a5d6ff',
    builtin: '#ffa657',
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

    // Code syntax highlighting
    const code: CodeColors = { ...(isDark ? DARK_CODE : LIGHT_CODE), ...theme.code };

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

        // Code syntax highlighting
        '--code-keyword': code.keyword,
        '--code-comment': code.comment,
        '--code-string': code.string,
        '--code-number': code.number,
        '--code-function': code.function,
        '--code-variable': code.variable,
        '--code-type': code.type,
        '--code-property': code.property,
        '--code-operator': code.operator,
        '--code-punctuation': code.punctuation,
        '--code-regex': code.regex,
        '--code-builtin': code.builtin,
    };
}


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
        // Chrome 102+ bug workaround: scroll can stutter/pause when mouse is stationary
        // because Chrome's hit-testing fails to target the scroll container correctly.
        // See: https://discuss.codemirror.net/t/solved-scrolling-stops-if-mouse-doesnt-move/6761
        pointerEvents: 'auto',
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
    // textDecoration: 'none' overrides underline from defaultHighlightStyle
    '.cm-heading-1': {
        fontSize: 'var(--heading-1-size, 2em)',
        fontWeight: 'var(--heading-1-weight, 700)',
        color: 'var(--syntax-heading)',
        textDecoration: 'var(--heading-1-decoration, none)',
        borderBottom: 'var(--heading-1-border, none)',
        paddingBottom: 'var(--heading-1-padding, 0)',
        marginBottom: 'var(--heading-1-margin, 0)',
    },
    '.cm-heading-2': {
        fontSize: 'var(--heading-2-size, 1.5em)',
        fontWeight: 'var(--heading-2-weight, 600)',
        color: 'var(--syntax-heading)',
        textDecoration: 'var(--heading-2-decoration, none)',
        borderBottom: 'var(--heading-2-border, none)',
        paddingBottom: 'var(--heading-2-padding, 0)',
    },
    '.cm-heading-3': {
        fontSize: 'var(--heading-3-size, 1.25em)',
        fontWeight: 'var(--heading-3-weight, 600)',
        color: 'var(--syntax-heading)',
        textDecoration: 'var(--heading-3-decoration, none)',
    },
    '.cm-heading-4': {
        fontSize: 'var(--heading-4-size, 1.1em)',
        fontWeight: 'var(--heading-4-weight, 600)',
        color: 'var(--syntax-heading)',
        textDecoration: 'var(--heading-4-decoration, none)',
    },
    '.cm-heading-5': {
        fontSize: 'var(--heading-5-size, 1em)',
        fontWeight: 'var(--heading-5-weight, 600)',
        color: 'var(--syntax-heading)',
        textDecoration: 'var(--heading-5-decoration, none)',
    },
    '.cm-heading-6': {
        fontSize: 'var(--heading-6-size, 0.9em)',
        fontWeight: 'var(--heading-6-weight, 600)',
        color: 'var(--syntax-heading)',
        textDecoration: 'var(--heading-6-decoration, none)',
    },

    // Override text-decoration on ALL children inside headings
    // This targets the inner spans created by defaultHighlightStyle (ͼ7 class)
    '.cm-heading-1 *, .cm-heading-2 *, .cm-heading-3 *, .cm-heading-4 *, .cm-heading-5 *, .cm-heading-6 *': {
        textDecoration: 'inherit',
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
    // NOTE: Using only horizontal padding to avoid changing line height (causes scroll jumps)
    '.cm-code': {
        fontFamily: '"SF Mono", Monaco, "Cascadia Code", monospace',
        backgroundColor: 'var(--syntax-code-bg)',
        color: 'var(--syntax-code)',
        padding: '0 4px',   // Was: '2px 4px' - vertical padding changes line height
        borderRadius: '3px',
    },

    // Highlights (==text==) - uses warning colors by default for consistency
    // NOTE: Using only horizontal padding to avoid changing line height (causes scroll jumps)
    '.cm-highlight': {
        backgroundColor: 'var(--syntax-highlight-bg, var(--callout-warning-bg, #fef08a))',
        color: 'var(--syntax-highlight-text, var(--callout-header-warning, #854d0e))',
        padding: '0 2px',   // Was: '1px 2px' - vertical padding changes line height
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
        textDecoration: 'var(--link-underline, underline)',
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
        fontSize: '0.9em',
        display: 'inline-block',
        minWidth: '1.5em',
        textAlign: 'right',
        paddingRight: '0.3em',
    },
    '.cm-list-marker-source': {
        color: 'var(--syntax-list-marker)',
        fontWeight: 'bold',
    },
    // Override defaultHighlightStyle color on formatting mark children  
    // This makes inner spans inherit the muted color from their parent
    '.cm-list-marker-source *, .cm-strong *, .cm-emphasis *, .cm-strikethrough *, .cm-code *': {
        color: 'inherit !important',
    },

    // Task checkboxes
    '.cm-task-checkbox': {
        appearance: 'none',
        width: '16px',
        height: '16px',
        border: '2px solid var(--syntax-list-marker)',
        borderRadius: '3px',
        cursor: 'pointer',
        verticalAlign: 'middle',
        marginRight: '4px',
        position: 'relative',
        top: '-1px',
        backgroundColor: 'transparent',
        transition: 'background-color 0.15s ease, border-color 0.15s ease',
        // Prevent strikethrough from crossing the checkbox
        textDecoration: 'none !important',
    },
    '.cm-task-checkbox:checked': {
        backgroundColor: 'var(--syntax-list-marker)',
        borderColor: 'var(--syntax-list-marker)',
    },
    '.cm-task-checkbox:checked::after': {
        content: '""',
        position: 'absolute',
        left: '3px',
        top: '0px',
        width: '4px',
        height: '8px',
        border: 'solid var(--editor-bg, #fff)',
        borderWidth: '0 2px 2px 0',
        transform: 'rotate(45deg)',
    },
    '.cm-task-checkbox:hover': {
        borderColor: 'var(--wikilink-color)',
    },
    // Completed task styling (strikethrough on text only)
    '.cm-task-completed': {
        textDecorationLine: 'line-through',
        textDecorationColor: 'var(--editor-gutter-text)',
        opacity: '0.6',
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

    // Note: Callout editor styles are defined in the callout extension itself
    // to keep the extension self-contained. CSS variables for callout colors
    // are defined in lightThemeVars and darkThemeVars above.

    // =========================================================================
    // MARKDOWN PREVIEW STYLES (bundled with library for read mode)
    // =========================================================================

    // Base preview container
    '.markdown-preview': {
        fontFamily: 'var(--editor-font-family, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif)',
        fontSize: 'var(--editor-font-size, 16px)',
        lineHeight: 'var(--editor-line-height, 1.6)',
        color: 'var(--editor-text)',
        background: 'var(--editor-bg)',
        padding: 'var(--editor-content-padding, 16px)',
        maxWidth: 'var(--editor-content-max-width, 800px)',
        margin: '0 auto',
        overflowY: 'auto',
        height: '100%',
    },

    '.markdown-preview h1, .markdown-preview h2, .markdown-preview h3, .markdown-preview h4, .markdown-preview h5, .markdown-preview h6': {
        marginTop: '1.5em',
        marginBottom: '0.5em',
        fontWeight: '600',
        color: 'var(--syntax-heading)',
    },
    '.markdown-preview h1': { fontSize: 'var(--heading-1-size, 2em)' },
    '.markdown-preview h2': { fontSize: 'var(--heading-2-size, 1.5em)' },
    '.markdown-preview h3': { fontSize: 'var(--heading-3-size, 1.25em)' },

    '.markdown-preview p': { marginBottom: '1em' },
    '.markdown-preview ul, .markdown-preview ol': { marginBottom: '1em', paddingLeft: '1.5em' },
    '.markdown-preview blockquote': {
        borderLeft: '4px solid var(--syntax-blockquote)',
        paddingLeft: '1em',
        margin: '1em 0',
        color: 'var(--syntax-blockquote)',
    },

    '.markdown-preview pre': {
        background: 'var(--syntax-code-bg)',
        padding: '12px',
        borderRadius: '6px',
        overflowX: 'auto',
        margin: '1em 0',
    },
    '.markdown-preview code': {
        fontFamily: '"SF Mono", Monaco, "Cascadia Code", monospace',
        fontSize: '0.9em',
    },

    // Preview tables
    '.markdown-preview table': { borderCollapse: 'collapse', width: '100%', margin: '1em 0' },
    '.markdown-preview th, .markdown-preview td': {
        border: '1px solid var(--table-border)',
        padding: '8px 12px',
        textAlign: 'left',
    },
    '.markdown-preview th': { background: 'var(--table-header-bg)', fontWeight: '600' },

    // Preview wikilinks
    '.markdown-preview .cm-wikilink': {
        color: 'var(--wikilink-color)',
        cursor: 'pointer',
        borderBottom: '1px dashed var(--wikilink-color)',
        '&:hover': { color: 'var(--wikilink-hover)' },
    },

    // Preview tags
    '.markdown-preview .cm-tag': {
        color: 'var(--tag-color)',
        backgroundColor: 'var(--tag-bg)',
        padding: '1px 6px',
        borderRadius: '10px',
        fontSize: '0.9em',
        cursor: 'pointer',
    },

    // Preview highlights
    '.markdown-preview .cm-highlight': {
        backgroundColor: 'var(--syntax-highlight-bg)',
        color: 'var(--syntax-highlight-text)',
        padding: '0 2px',
        borderRadius: '2px',
    },

    // =========================================================================
    // CALLOUT PREVIEW STYLES
    // =========================================================================

    '.cm-callout-preview': {
        borderRadius: '6px',
        padding: '0',
        margin: '1em 0',
        borderLeft: '4px solid',
        overflow: 'hidden',
    },

    // Each callout type using its specific theme variables
    '.cm-callout-preview.cm-callout-note': {
        background: 'var(--callout-note-bg)',
        borderColor: 'var(--callout-note-border)',
    },
    '.cm-callout-preview.cm-callout-info': {
        background: 'var(--callout-info-bg)',
        borderColor: 'var(--callout-info-border)',
    },
    '.cm-callout-preview.cm-callout-warning': {
        background: 'var(--callout-warning-bg)',
        borderColor: 'var(--callout-warning-border)',
    },
    '.cm-callout-preview.cm-callout-danger': {
        background: 'var(--callout-danger-bg)',
        borderColor: 'var(--callout-danger-border)',
    },
    '.cm-callout-preview.cm-callout-success': {
        background: 'var(--callout-success-bg)',
        borderColor: 'var(--callout-success-border)',
    },
    '.cm-callout-preview.cm-callout-tip': {
        background: 'var(--callout-tip-bg)',
        borderColor: 'var(--callout-tip-border)',
    },
    '.cm-callout-preview.cm-callout-question': {
        background: 'var(--callout-question-bg)',
        borderColor: 'var(--callout-question-border)',
    },
    '.cm-callout-preview.cm-callout-quote': {
        background: 'var(--callout-quote-bg)',
        borderColor: 'var(--callout-quote-border)',
    },
    '.cm-callout-preview.cm-callout-example': {
        background: 'var(--callout-example-bg)',
        borderColor: 'var(--callout-example-border)',
    },
    '.cm-callout-preview.cm-callout-bug': {
        background: 'var(--callout-bug-bg)',
        borderColor: 'var(--callout-bug-border)',
    },

    // Callout header
    '.cm-callout-header-preview': {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: '600',
        padding: '8px 12px',
    },

    // Header colors per type (each using its specific variable)
    '.cm-callout-note .cm-callout-header-preview': {
        color: 'var(--callout-header-note)',
    },
    '.cm-callout-info .cm-callout-header-preview': {
        color: 'var(--callout-header-info)',
    },
    '.cm-callout-warning .cm-callout-header-preview': {
        color: 'var(--callout-header-warning)',
    },
    '.cm-callout-danger .cm-callout-header-preview': {
        color: 'var(--callout-header-danger)',
    },
    '.cm-callout-success .cm-callout-header-preview': {
        color: 'var(--callout-header-success)',
    },
    '.cm-callout-tip .cm-callout-header-preview': {
        color: 'var(--callout-header-tip)',
    },
    '.cm-callout-question .cm-callout-header-preview': {
        color: 'var(--callout-header-question)',
    },
    '.cm-callout-quote .cm-callout-header-preview': {
        color: 'var(--callout-header-quote)',
    },
    '.cm-callout-example .cm-callout-header-preview': {
        color: 'var(--callout-header-example)',
    },
    '.cm-callout-bug .cm-callout-header-preview': {
        color: 'var(--callout-header-bug)',
    },

    // SVG icon sizing
    '.cm-callout-icon-preview': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px',
        flexShrink: '0',
    },
    '.cm-callout-icon-preview svg': {
        width: '100%',
        height: '100%',
    },

    // Callout body
    '.cm-callout-preview .cm-callout-content': {
        padding: '8px 12px',
        fontSize: '0.95em',
        lineHeight: '1.5',
    },
    '.cm-callout-preview .cm-callout-content p:first-child': { marginTop: '0' },
    '.cm-callout-preview .cm-callout-content p:last-child': { marginBottom: '0' },

    // =========================================================================
    // KATEX FIXES (prevents extra vertical height/scrolling)
    // =========================================================================

    '.katex-display': {
        overflow: 'auto hidden',
        maxWidth: '100%',
    },
    '.katex-display > .katex': {
        maxWidth: '100%',
        overflowX: 'auto',
        overflowY: 'hidden',
        whiteSpace: 'normal',
        paddingBlock: '3px',
    },
    '.cm-math-block': {
        overflow: 'auto hidden',
        maxWidth: '100%',
    },
    '.cm-math-block .katex': {
        paddingBlock: '3px',
    },

    // =========================================================================
    // READ MODE STYLES (hide cursor, selection, active line)
    // =========================================================================

    // Hide cursor in read mode
    '&.strata-read-mode .cm-cursor, &.strata-read-mode .cm-cursor-primary, &.strata-read-mode .cm-cursor-secondary': {
        display: 'none !important',
    },

    // Remove active line highlight in read mode
    '&.strata-read-mode .cm-activeLine': {
        backgroundColor: 'transparent',
    },

    // Make selection invisible or subtle in read mode
    '&.strata-read-mode .cm-selectionBackground, &.strata-read-mode ::selection': {
        backgroundColor: 'transparent',
    },

    // Ensure content is not user-selectable in read mode (prevents text cursor)
    '&.strata-read-mode .cm-content': {
        cursor: 'default',
    },
});

/**
 * Create a complete theme extension
 * 
 * This extension sets up styles that USE CSS variables (var(--editor-bg)),
 * but does NOT define the variable values. The variables should be set on the
 * parent container via createThemeStyles() or inline styles.
 */
export function createEditorTheme(): Extension {
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

// =============================================================================
// CODE SYNTAX HIGHLIGHTING
// =============================================================================

/**
 * Custom syntax highlighting style using CSS variables
 * Replaces defaultHighlightStyle to enable theming of code blocks
 */
export const codeHighlightStyle = HighlightStyle.define([
    // Keywords
    { tag: tags.keyword, color: 'var(--code-keyword)' },
    { tag: tags.controlKeyword, color: 'var(--code-keyword)' },
    { tag: tags.moduleKeyword, color: 'var(--code-keyword)' },
    { tag: tags.operatorKeyword, color: 'var(--code-keyword)' },
    { tag: tags.definitionKeyword, color: 'var(--code-keyword)' },

    // Comments
    { tag: tags.comment, color: 'var(--code-comment)', fontStyle: 'italic' },
    { tag: tags.lineComment, color: 'var(--code-comment)', fontStyle: 'italic' },
    { tag: tags.blockComment, color: 'var(--code-comment)', fontStyle: 'italic' },
    { tag: tags.docComment, color: 'var(--code-comment)', fontStyle: 'italic' },

    // Strings
    { tag: tags.string, color: 'var(--code-string)' },
    { tag: tags.special(tags.string), color: 'var(--code-string)' },
    { tag: tags.character, color: 'var(--code-string)' },
    { tag: tags.escape, color: 'var(--code-regex)' },

    // Numbers
    { tag: tags.number, color: 'var(--code-number)' },
    { tag: tags.integer, color: 'var(--code-number)' },
    { tag: tags.float, color: 'var(--code-number)' },

    // Functions
    { tag: tags.function(tags.variableName), color: 'var(--code-function)' },
    { tag: tags.function(tags.propertyName), color: 'var(--code-function)' },

    // Variables
    { tag: tags.variableName, color: 'var(--code-variable)' },
    { tag: tags.definition(tags.variableName), color: 'var(--code-variable)' },
    { tag: tags.local(tags.variableName), color: 'var(--code-variable)' },

    // Types
    { tag: tags.typeName, color: 'var(--code-type)' },
    { tag: tags.className, color: 'var(--code-type)' },
    { tag: tags.namespace, color: 'var(--code-type)' },
    { tag: tags.labelName, color: 'var(--code-type)' },
    { tag: tags.macroName, color: 'var(--code-type)' },

    // Properties
    { tag: tags.propertyName, color: 'var(--code-property)' },
    { tag: tags.attributeName, color: 'var(--code-property)' },
    { tag: tags.definition(tags.propertyName), color: 'var(--code-property)' },

    // Operators
    { tag: tags.operator, color: 'var(--code-operator)' },
    { tag: tags.compareOperator, color: 'var(--code-operator)' },
    { tag: tags.arithmeticOperator, color: 'var(--code-operator)' },
    { tag: tags.logicOperator, color: 'var(--code-operator)' },
    { tag: tags.bitwiseOperator, color: 'var(--code-operator)' },
    { tag: tags.updateOperator, color: 'var(--code-operator)' },
    { tag: tags.derefOperator, color: 'var(--code-operator)' },

    // Punctuation
    { tag: tags.punctuation, color: 'var(--code-punctuation)' },
    { tag: tags.bracket, color: 'var(--code-punctuation)' },
    { tag: tags.paren, color: 'var(--code-punctuation)' },
    { tag: tags.squareBracket, color: 'var(--code-punctuation)' },
    { tag: tags.brace, color: 'var(--code-punctuation)' },
    { tag: tags.angleBracket, color: 'var(--code-punctuation)' },
    { tag: tags.separator, color: 'var(--code-punctuation)' },

    // Regex
    { tag: tags.regexp, color: 'var(--code-regex)' },

    // Built-ins
    { tag: tags.standard(tags.variableName), color: 'var(--code-builtin)' },
    { tag: tags.atom, color: 'var(--code-builtin)' },
    { tag: tags.bool, color: 'var(--code-builtin)' },
    { tag: tags.null, color: 'var(--code-builtin)' },
    { tag: tags.self, color: 'var(--code-builtin)' },

    // Special: bold/italic for emphasis
    { tag: tags.strong, fontWeight: 'bold' },
    { tag: tags.emphasis, fontStyle: 'italic' },
    { tag: tags.strikethrough, textDecoration: 'line-through' },

    // Note: We intentionally don't style tags.meta, tags.annotation, or 
    // tags.processingInstruction here as they conflict with markdown heading markers.

    // Invalid/error
    { tag: tags.invalid, color: 'var(--code-keyword)', textDecoration: 'underline wavy' },

    // Content (for markdown inside code)
    { tag: tags.content, color: 'var(--code-variable)' },
    { tag: tags.heading, fontWeight: 'bold' },
    { tag: tags.url, color: 'var(--code-string)', textDecoration: 'underline' },
    { tag: tags.link, color: 'var(--code-string)' },
]);

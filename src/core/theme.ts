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

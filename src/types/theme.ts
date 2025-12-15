/**
 * Strata Theme Type Definitions
 * 
 * Provides typed configuration for customizing editor appearance.
 * All properties are optional - only override what you need.
 */

/**
 * Core editor colors
 */
export interface StrataColors {
    /** Main editor background */
    background: string;
    /** Primary text color */
    foreground: string;
    /** Text selection highlight */
    selection: string;
    /** Cursor/caret color */
    cursor: string;
    /** Active line background */
    lineHighlight: string;
    /** Gutter area background */
    gutterBackground: string;
    /** Gutter text (line numbers) */
    gutterForeground: string;
}

/**
 * Syntax highlighting colors
 */
export interface SyntaxColors {
    /** Headings (h1-h6) */
    heading: string;
    /** Bold text */
    bold: string;
    /** Italic text */
    italic: string;
    /** Links and URLs */
    link: string;
    /** Inline code text */
    code: string;
    /** Inline code background */
    codeBackground: string;
    /** Blockquote text and border */
    blockquote: string;
    /** List markers (bullets, numbers) */
    listMarker: string;
    /** ==Highlight== background */
    highlightBackground: string;
    /** ==Highlight== text */
    highlightText: string;
    /** Footnote references */
    footnote: string;
}

/**
 * Obsidian-style element colors
 */
export interface ElementColors {
    /** [[Wikilink]] text */
    wikilink: string;
    /** [[Wikilink]] hover state */
    wikilinkHover: string;
    /** #tag text */
    tag: string;
    /** #tag background pill */
    tagBackground: string;
}

/**
 * Table styling colors
 */
export interface TableColors {
    /** Cell borders */
    border: string;
    /** Header row background */
    headerBackground: string;
    /** Header row text */
    headerForeground: string;
    /** Alternating row background */
    rowAltBackground: string;
    /** Row hover state */
    rowHover: string;
}

/**
 * Colors for a single callout type
 */
export interface CalloutColors {
    /** Background (use transparent rgba for best results) */
    background: string;
    /** Left border accent */
    border: string;
    /** Header text and icon color */
    header: string;
}

/**
 * Callout configuration for all built-in types
 */
export interface CalloutConfig {
    info: CalloutColors;
    warning: CalloutColors;
    danger: CalloutColors;
    success: CalloutColors;
    tip: CalloutColors;
    note: CalloutColors;
    question: CalloutColors;
    quote: CalloutColors;
    example: CalloutColors;
    bug: CalloutColors;
}

/**
 * Complete theme configuration for Strata Editor
 * 
 * @example
 * ```tsx
 * // Use built-in dark mode
 * <MarkdownEditor theme="dark" />
 * 
 * // Override specific colors
 * <MarkdownEditor theme={{
 *   mode: 'dark',
 *   colors: { background: '#1a1a2e' }
 * }} />
 * 
 * // Full custom theme
 * <MarkdownEditor theme={{
 *   colors: { background: '#fff', foreground: '#000' },
 *   syntax: { heading: '#2563eb' },
 *   callouts: { info: { background: 'rgba(59,130,246,0.1)', border: '#3b82f6', header: '#1e40af' } }
 * }} />
 * ```
 */
export interface StrataTheme {
    /** 
     * Base theme mode. When set, uses built-in light/dark defaults.
     * Override specific colors with the properties below.
     */
    mode?: 'light' | 'dark';

    /** Core editor colors */
    colors?: Partial<StrataColors>;

    /** Syntax highlighting colors */
    syntax?: Partial<SyntaxColors>;

    /** Obsidian-style elements (wikilinks, tags) */
    elements?: Partial<ElementColors>;

    /** Callout/admonition colors by type */
    callouts?: Partial<CalloutConfig>;

    /** Table styling */
    tables?: Partial<TableColors>;
}

/**
 * Theme prop type - accepts string shorthand or full config
 */
export type ThemeProp = 'light' | 'dark' | StrataTheme;

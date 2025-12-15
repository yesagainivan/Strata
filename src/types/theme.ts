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
 * Code block syntax highlighting colors
 */
export interface CodeColors {
    /** Keywords (if, else, return, const, etc.) */
    keyword: string;
    /** Comments */
    comment: string;
    /** Strings and template literals */
    string: string;
    /** Numbers and literals */
    number: string;
    /** Function names */
    function: string;
    /** Variable names */
    variable: string;
    /** Type names and classes */
    type: string;
    /** Properties and attributes */
    property: string;
    /** Operators (+, -, =, etc.) */
    operator: string;
    /** Punctuation (brackets, semicolons) */
    punctuation: string;
    /** Regex patterns */
    regex: string;
    /** Built-in/standard library */
    builtin: string;
}

/**
 * Complete theme configuration for Strata Editor
 * 
 * @example
 * ```tsx
 * // Apply theme via CSS variables on parent container
 * const themeStyles = createThemeStyles({ mode: 'dark' });
 * <div style={themeStyles}>
 *   <MarkdownEditor value={content} onChange={setContent} />
 * </div>
 * 
 * // Full custom theme with code colors
 * const customTheme: StrataTheme = {
 *   mode: 'dark',
 *   colors: { background: '#1a1a2e' },
 *   code: { keyword: '#ff79c6', string: '#f1fa8c' }
 * };
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

    /** Syntax highlighting colors (markdown) */
    syntax?: Partial<SyntaxColors>;

    /** Obsidian-style elements (wikilinks, tags) */
    elements?: Partial<ElementColors>;

    /** Callout/admonition colors by type */
    callouts?: Partial<CalloutConfig>;

    /** Table styling */
    tables?: Partial<TableColors>;

    /** Code block syntax highlighting */
    code?: Partial<CodeColors>;
}

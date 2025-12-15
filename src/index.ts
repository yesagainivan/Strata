/**
 * Package entry point
 * Export all public API
 */

// Main component
export { MarkdownEditor, default } from './components/MarkdownEditor';
export { EditorErrorBoundary } from './components/EditorErrorBoundary';

// Types
export type {
    MarkdownEditorProps,
    MarkdownEditorHandle,
    WikilinkData,
    CalloutData,
    CalloutType,
    // Theme types
    StrataTheme,
    ThemeProp,
    StrataColors,
    SyntaxColors,
    ElementColors,
    TableColors,
    CalloutConfig,
    CalloutColors,
} from './types';

// Extensions
export {
    wysiwygExtension,
    wikilinkExtension,
    calloutExtension,
    tagExtension,
    mathExtension,
    tableExtension,
    CALLOUT_TYPES,
} from './extensions';
export type { WikilinkConfig, TagConfig } from './extensions';

// User extension API
export { createExtension, createExtensions } from './api/extension';
export type { CustomExtensionConfig } from './api/extension';

// Core utilities (for advanced users)
export { createEditor, updateTheme, updateReadOnly } from './core/editor';
export {
    createEditorTheme,
    createThemeStyles,
    // Default theme values for reference
    LIGHT_COLORS,
    DARK_COLORS,
    LIGHT_SYNTAX,
    DARK_SYNTAX,
    LIGHT_ELEMENTS,
    DARK_ELEMENTS,
    LIGHT_TABLES,
    DARK_TABLES,
    LIGHT_CALLOUTS,
    DARK_CALLOUTS,
} from './core/theme';


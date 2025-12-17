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
    imageEmbedExtension,
    CALLOUT_TYPES,
} from './extensions';
export type { WikilinkConfig, TagConfig } from './extensions';

// User extension API
export { createExtension, createExtensions, createBlockExtension } from './api/extension';
export type { CustomExtensionConfig, BlockExtensionConfig } from './api/extension';

// Core utilities (for advanced users)
export { createEditor, updateReadOnly, destroyEditor } from './core/editor';
export { updateMode, modeField, getMode, createModeExtension } from './core/mode';
export type { EditorMode } from './core/mode';
export {
    createEditorTheme,
    createThemeStyles,
    codeHighlightStyle,
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
    LIGHT_CODE,
    DARK_CODE,
} from './core/theme';


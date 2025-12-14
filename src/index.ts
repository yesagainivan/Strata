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
} from './types';

// Extensions
export {
    wysiwygExtension,
    wikilinkExtension,
    calloutExtension,
    tagExtension,
    CALLOUT_TYPES,
} from './extensions';
export type { WikilinkConfig, TagConfig } from './extensions';

// User extension API
export { createExtension, createExtensions } from './api/extension';
export type { CustomExtensionConfig } from './api/extension';

// Core utilities (for advanced users)
export { createEditor, updateTheme, updateReadOnly } from './core/editor';
export { createEditorTheme } from './core/theme';

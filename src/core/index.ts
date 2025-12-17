/**
 * Core module barrel export
 */

export { createEditor, updateReadOnly, readOnlyCompartment } from './editor';
export type { EditorConfig } from './editor';
export { createEditorTheme } from './theme';
export { updateMode, modeField, getMode, createModeExtension } from './mode';
export type { EditorMode } from './mode';

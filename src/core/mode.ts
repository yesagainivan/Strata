/**
 * Editor mode system for Strata Editor
 * 
 * Provides three modes:
 * - 'live': WYSIWYG editing with cursor-reveal (default)
 * - 'source': Raw markdown editing with syntax highlighting only
 * - 'read': Read-only rendered preview (no cursor reveal)
 */

import { StateField, StateEffect, Extension, Compartment } from '@codemirror/state';
import { EditorView, ViewPlugin, ViewUpdate } from '@codemirror/view';

/**
 * Editor viewing/editing modes
 */
export type EditorMode = 'live' | 'source' | 'read';

/**
 * Effect to change the editor mode
 */
export const setModeEffect = StateEffect.define<EditorMode>();

/**
 * StateField tracking the current editor mode
 * 
 * Extensions can access this via `state.field(modeField)` for efficient mode checks.
 * This is a single field access - O(1) per decoration build, not per-decoration.
 */
export const modeField = StateField.define<EditorMode>({
    create() {
        return 'live';
    },
    update(value, tr) {
        for (const effect of tr.effects) {
            if (effect.is(setModeEffect)) {
                return effect.value;
            }
        }
        return value;
    },
});

/**
 * Compartment for dynamically reconfiguring mode-dependent extensions
 */
export const modeCompartment = new Compartment();

/**
 * Get the current mode from editor state
 * 
 * @example
 * ```ts
 * const mode = getMode(view.state);
 * if (mode === 'source') return Decoration.none;
 * ```
 */
export function getMode(state: { field: <T>(field: StateField<T>) => T }): EditorMode {
    return state.field(modeField);
}

/**
 * Update the editor mode dynamically
 * 
 * This dispatches effects to:
 * 1. Update the mode StateField
 * 2. Trigger decoration rebuilds (via state change)
 * 
 * @param view - The EditorView instance
 * @param mode - The new mode to set
 * 
 * @example
 * ```ts
 * // Switch to source mode
 * updateMode(view, 'source');
 * 
 * // Switch to read-only preview
 * updateMode(view, 'read');
 * ```
 */
export function updateMode(view: EditorView, mode: EditorMode): void {
    view.dispatch({
        effects: setModeEffect.of(mode),
    });
}

/**
 * ViewPlugin that toggles CSS classes based on current mode
 * This enables mode-specific styling via CSS
 */
const modeClassPlugin = ViewPlugin.define(
    (view) => {
        const updateClasses = () => {
            const mode = view.state.field(modeField);
            const dom = view.dom;

            // Remove all mode classes
            dom.classList.remove('strata-live-mode', 'strata-source-mode', 'strata-read-mode');

            // Add current mode class
            dom.classList.add(`strata-${mode}-mode`);
        };

        // Set initial class
        updateClasses();

        return {
            update(update: ViewUpdate) {
                // Check if mode changed
                const oldMode = update.startState.field(modeField);
                const newMode = update.state.field(modeField);
                if (oldMode !== newMode) {
                    updateClasses();
                }
            },
        };
    }
);

/**
 * Create the mode extension bundle
 * 
 * @param initialMode - Starting mode (default: 'live')
 */
export function createModeExtension(initialMode: EditorMode = 'live'): Extension {
    return [
        modeField.init(() => initialMode),
        modeClassPlugin,
    ];
}


/**
 * Core editor factory for CodeMirror 6 markdown editor
 */

import { EditorState, Extension, Compartment } from '@codemirror/state';
import { EditorView, keymap, placeholder as placeholderExt } from '@codemirror/view';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { markdown, markdownLanguage } from '@codemirror/lang-markdown';
import { languages } from '@codemirror/language-data';
import { syntaxHighlighting, defaultHighlightStyle } from '@codemirror/language';

import { wysiwygExtension } from '../extensions/wysiwyg';
import { wikilinkExtension } from '../extensions/wikilink';
import { calloutExtension } from '../extensions/callout';
import { tagExtension } from '../extensions/tag';
import { imageEmbedExtension } from '../extensions/imageEmbed';
import { createEditorTheme } from './theme';

/**
 * Configuration for creating an editor instance
 */
export interface EditorConfig {
    /** Initial document content */
    doc?: string;
    /** Placeholder text */
    placeholder?: string;
    /** Theme mode */
    theme?: 'light' | 'dark';
    /** Make editor read-only */
    readOnly?: boolean;
    /** Additional extensions */
    extensions?: Extension[];
    /** Callback when document changes */
    onChange?: (doc: string) => void;
    /** Callback when wikilink is clicked */
    onWikilinkClick?: (target: string, alias: string | undefined, event: MouseEvent) => void;
    /** Callback when tag is clicked */
    onTagClick?: (tag: string, event: MouseEvent) => void;
    /** Interaction mode for wikilinks */
    wikilinkInteraction?: 'click' | 'modifier';
    /** Interaction mode for tags */
    tagInteraction?: 'click' | 'modifier';
}

// Compartments for dynamic reconfiguration
export const themeCompartment = new Compartment();
export const readOnlyCompartment = new Compartment();

/**
 * Create a fully configured CodeMirror 6 editor
 */
export function createEditor(parent: HTMLElement, config: EditorConfig = {}): EditorView {
    const {
        doc = '',
        placeholder = '',
        theme = 'light',
        readOnly = false,
        extensions = [],
        onChange,
        onWikilinkClick,
        onTagClick,
        wikilinkInteraction,
        tagInteraction,
    } = config;

    // Build extension array
    const editorExtensions: Extension[] = [
        // Core editing
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),

        // Markdown language with code block highlighting
        markdown({
            base: markdownLanguage,
            codeLanguages: languages,
        }),
        syntaxHighlighting(defaultHighlightStyle),

        // WYSIWYG extensions (hidden marks, styled headings)
        wysiwygExtension(),
        // Obsidian-style extensions
        wikilinkExtension({ onClick: onWikilinkClick, triggerOn: wikilinkInteraction }),
        calloutExtension(),  // Note: Currently minimal (theme-only) due to cursor bug in ViewPlugin
        tagExtension({ onClick: onTagClick, triggerOn: tagInteraction }),
        imageEmbedExtension(),
        // ...

        // Theming (in compartment for dynamic updates)
        themeCompartment.of(createEditorTheme(theme)),

        // Read-only state (in compartment for dynamic updates)
        readOnlyCompartment.of(EditorState.readOnly.of(readOnly)),

        // Placeholder
        placeholder ? placeholderExt(placeholder) : [],

        // Change listener
        onChange
            ? EditorView.updateListener.of((update) => {
                if (update.docChanged) {
                    onChange(update.state.doc.toString());
                }
            })
            : [],

        // User-provided extensions
        ...extensions,
    ];

    const state = EditorState.create({
        doc,
        extensions: editorExtensions,
    });

    return new EditorView({
        state,
        parent,
    });
}

/**
 * Update theme dynamically
 */
export function updateTheme(view: EditorView, theme: 'light' | 'dark'): void {
    view.dispatch({
        effects: themeCompartment.reconfigure(createEditorTheme(theme)),
    });
}

/**
 * Update read-only state dynamically
 */
export function updateReadOnly(view: EditorView, readOnly: boolean): void {
    view.dispatch({
        effects: readOnlyCompartment.reconfigure(EditorState.readOnly.of(readOnly)),
    });
}

/**
 * Tag extension for #hashtag syntax
 * Supports: #tag, #nested/tag, #tag-with-dashes
 */

import { Extension, RangeSetBuilder } from '@codemirror/state';
import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
} from '@codemirror/view';

/**
 * Configuration for the tag extension
 */
export interface TagConfig {
    /** Callback when a tag is clicked */
    onClick?: (tag: string) => void;
}

/**
 * Regex to match tags: #word, #word/subword, #word-with-dashes
 * Must not be preceded by & (HTML entities) or be inside code
 */
const TAG_REGEX = /(?<![&\w])#([\w][\w/-]*)/g;

/**
 * Parsed tag match
 */
interface TagMatch {
    full: string;
    tag: string;
    from: number;
    to: number;
}

/**
 * Find all tags in text
 */
function parseTags(text: string, offset: number): TagMatch[] {
    const matches: TagMatch[] = [];
    let match;

    while ((match = TAG_REGEX.exec(text)) !== null) {
        matches.push({
            full: match[0],
            tag: match[1],
            from: offset + match.index,
            to: offset + match.index + match[0].length,
        });
    }

    return matches;
}

/**
 * Tag decoration mark
 */
const tagMark = Decoration.mark({
    class: 'cm-tag',
    attributes: { 'data-type': 'tag' },
});

/**
 * Build tag decorations
 */
function buildTagDecorations(
    view: EditorView,
    onClick?: (tag: string) => void
): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const doc = view.state.doc;

    for (const { from, to } of view.visibleRanges) {
        const text = doc.sliceString(from, to);
        const matches = parseTags(text, from);

        for (const match of matches) {
            builder.add(match.from, match.to, tagMark);
        }
    }

    return builder.finish();
}

/**
 * View plugin for tag decorations
 */
function createTagPlugin(config: TagConfig) {
    return ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;

            constructor(view: EditorView) {
                this.decorations = buildTagDecorations(view, config.onClick);
            }

            update(update: ViewUpdate) {
                if (update.docChanged || update.viewportChanged || update.selectionSet) {
                    this.decorations = buildTagDecorations(update.view, config.onClick);
                }
            }
        },
        {
            decorations: (v) => v.decorations,
        }
    );
}

/**
 * Event handler for tag clicks
 */
function createTagClickHandler(onClick?: (tag: string) => void): Extension {
    if (!onClick) return [];

    return EditorView.domEventHandlers({
        click(event, view) {
            const target = event.target as HTMLElement;
            if (target.classList.contains('cm-tag') || target.closest('.cm-tag')) {
                const tagElement = target.classList.contains('cm-tag')
                    ? target
                    : target.closest('.cm-tag') as HTMLElement;

                const pos = view.posAtDOM(tagElement);
                const line = view.state.doc.lineAt(pos);
                const text = line.text;

                // Find the tag at this position
                const matches = parseTags(text, line.from);
                for (const match of matches) {
                    if (pos >= match.from && pos <= match.to) {
                        onClick(match.tag);
                        event.preventDefault();
                        return true;
                    }
                }
            }
            return false;
        },
    });
}

/**
 * Tag extension for #hashtag support
 */
export function tagExtension(config: TagConfig = {}): Extension {
    return [
        createTagPlugin(config),
        createTagClickHandler(config.onClick),
    ];
}

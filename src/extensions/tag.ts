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
import { syntaxTree } from '@codemirror/language';

/**
 * Configuration for the tag extension
 */
export interface TagConfig {
    /** Callback when a tag is clicked */
    onClick?: (tag: string, event: MouseEvent) => void;
    /**
     * Interaction mode for tags
     * - 'modifier': Require Cmd/Ctrl + Click to trigger (default)
     * - 'click': Trigger on simple Click (prevents editing cursor placement)
     */
    triggerOn?: 'click' | 'modifier';
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
function buildTagDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const doc = view.state.doc;

    for (const { from, to } of view.visibleRanges) {
        const text = doc.sliceString(from, to);
        const matches = parseTags(text, from);

        for (const match of matches) {
            // Check if match is inside a code block
            const tree = syntaxTree(view.state);
            let isCode = false;
            tree.iterate({
                from: match.from,
                to: match.to,
                enter: (node) => {
                    if (
                        node.name === 'InlineCode' ||
                        node.name === 'FencedCode' ||
                        node.name === 'CodeBlock' ||
                        node.name === 'CodeText'
                    ) {
                        isCode = true;
                        return false;
                    }
                },
            });

            if (isCode) continue;

            builder.add(match.from, match.to, tagMark);
        }
    }

    return builder.finish();
}

/**
 * View plugin for tag decorations
 */
const tagPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = buildTagDecorations(view);
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged || update.selectionSet) {
                this.decorations = buildTagDecorations(update.view);
            }
        }
    },
    {
        decorations: (v) => v.decorations,
    }
);

/**
 * Event handler for tag clicks
 */
function createTagClickHandler(
    onClick?: (tag: string, event: MouseEvent) => void,
    triggerOn: 'click' | 'modifier' = 'modifier'
): Extension {
    if (!onClick) return [];

    return EditorView.domEventHandlers({
        mousedown(event, view) {
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
                        const isModifier = event.metaKey || event.ctrlKey;
                        const shouldTrigger = triggerOn === 'click' || (triggerOn === 'modifier' && isModifier);

                        if (shouldTrigger) {
                            event.preventDefault(); // Stop cursor move
                            event.stopPropagation();
                            onClick(match.tag, event);
                            return true;
                        }
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
        tagPlugin,
        createTagClickHandler(config.onClick, config.triggerOn),
    ];
}

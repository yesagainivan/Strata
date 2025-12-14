/**
 * WYSIWYG extension for Obsidian-style live preview
 * Hides markdown syntax marks and reveals them when cursor is on the line
 */

import { Extension, RangeSetBuilder } from '@codemirror/state';
import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
    WidgetType,
} from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

/**
 * Decoration for hidden marks (like ** for bold)
 */
const hiddenMark = Decoration.mark({ class: 'cm-hidden-mark' });

/**
 * Heading level classes
 */
const headingClasses: Record<number, string> = {
    1: 'cm-heading-1',
    2: 'cm-heading-2',
    3: 'cm-heading-3',
    4: 'cm-heading-4',
    5: 'cm-heading-5',
    6: 'cm-heading-6',
};

/**
 * Mark decoration for different formatting types
 */
const formatDecorations: Record<string, Decoration> = {
    strong: Decoration.mark({ class: 'cm-strong' }),
    emphasis: Decoration.mark({ class: 'cm-emphasis' }),
    strikethrough: Decoration.mark({ class: 'cm-strikethrough' }),
    inlineCode: Decoration.mark({ class: 'cm-code' }),
    link: Decoration.mark({ class: 'cm-link' }),
    blockquote: Decoration.mark({ class: 'cm-blockquote' }),
};

/**
 * Get heading decoration for a specific level
 */
function getHeadingDecoration(level: number): Decoration {
    return Decoration.mark({ class: headingClasses[level] || 'cm-heading-6' });
}

/**
 * Task checkbox widget
 */
class TaskCheckboxWidget extends WidgetType {
    constructor(private checked: boolean) {
        super();
    }

    toDOM(): HTMLElement {
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = this.checked;
        checkbox.className = 'cm-task-checkbox';
        checkbox.setAttribute('aria-label', this.checked ? 'Completed task' : 'Incomplete task');
        return checkbox;
    }

    eq(other: TaskCheckboxWidget): boolean {
        return this.checked === other.checked;
    }
}

/**
 * Build decorations for the visible content
 */
function buildDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const doc = view.state.doc;

    // Get the line containing the cursor
    const cursorLine = doc.lineAt(view.state.selection.main.head).number;

    for (const { from, to } of view.visibleRanges) {
        syntaxTree(view.state).iterate({
            from,
            to,
            enter(node) {
                const nodeLine = doc.lineAt(node.from).number;
                const isActiveLine = nodeLine === cursorLine;

                // ATX Headings (# Heading)
                if (node.name.startsWith('ATXHeading')) {
                    const level = parseInt(node.name.replace('ATXHeading', ''), 10) || 1;

                    // Apply heading styling to the entire heading
                    builder.add(node.from, node.to, getHeadingDecoration(level));

                    // Find and hide the heading marks (# characters) when not on active line
                    if (!isActiveLine) {
                        const line = doc.lineAt(node.from);
                        const text = line.text;
                        const match = text.match(/^(#{1,6})\s/);
                        if (match) {
                            builder.add(node.from, node.from + match[0].length, hiddenMark);
                        }
                    }
                }

                // Strong/Bold (**text** or __text__)
                if (node.name === 'StrongEmphasis') {
                    builder.add(node.from, node.to, formatDecorations.strong);

                    if (!isActiveLine) {
                        // Hide opening marks
                        builder.add(node.from, node.from + 2, hiddenMark);
                        // Hide closing marks
                        builder.add(node.to - 2, node.to, hiddenMark);
                    }
                }

                // Emphasis/Italic (*text* or _text_)
                if (node.name === 'Emphasis') {
                    builder.add(node.from, node.to, formatDecorations.emphasis);

                    if (!isActiveLine) {
                        builder.add(node.from, node.from + 1, hiddenMark);
                        builder.add(node.to - 1, node.to, hiddenMark);
                    }
                }

                // Strikethrough (~~text~~)
                if (node.name === 'Strikethrough') {
                    builder.add(node.from, node.to, formatDecorations.strikethrough);

                    if (!isActiveLine) {
                        builder.add(node.from, node.from + 2, hiddenMark);
                        builder.add(node.to - 2, node.to, hiddenMark);
                    }
                }

                // Inline code (`code`)
                if (node.name === 'InlineCode') {
                    builder.add(node.from, node.to, formatDecorations.inlineCode);

                    if (!isActiveLine) {
                        builder.add(node.from, node.from + 1, hiddenMark);
                        builder.add(node.to - 1, node.to, hiddenMark);
                    }
                }

                // Links [text](url)
                if (node.name === 'Link') {
                    builder.add(node.from, node.to, formatDecorations.link);
                }

                // Blockquotes
                if (node.name === 'Blockquote') {
                    builder.add(node.from, node.to, formatDecorations.blockquote);
                }

                // Task list items [ ] or [x]
                if (node.name === 'TaskMarker') {
                    const text = doc.sliceString(node.from, node.to);
                    const checked = text.includes('x') || text.includes('X');

                    if (!isActiveLine) {
                        builder.add(
                            node.from,
                            node.to,
                            Decoration.replace({
                                widget: new TaskCheckboxWidget(checked),
                            })
                        );
                    }
                }
            },
        });
    }

    return builder.finish();
}

/**
 * View plugin that manages WYSIWYG decorations
 */
const wysiwygPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = buildDecorations(view);
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged || update.selectionSet) {
                this.decorations = buildDecorations(update.view);
            }
        }
    },
    {
        decorations: (v) => v.decorations,
    }
);

/**
 * WYSIWYG extension that provides Obsidian-style live preview
 */
export function wysiwygExtension(): Extension {
    return [wysiwygPlugin];
}

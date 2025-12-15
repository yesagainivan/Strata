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
 * Using Decoration.replace() instead of mark + CSS hide to avoid position calculation errors
 */
const hiddenMark = Decoration.replace({});

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
    highlight: Decoration.mark({ class: 'cm-highlight' }),
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
 * Bullet point widget for unordered lists
 */
class ListBulletWidget extends WidgetType {
    toDOM(): HTMLElement {
        const span = document.createElement('span');
        span.className = 'cm-list-bullet';
        span.textContent = '•';
        return span;
    }

    eq(other: ListBulletWidget): boolean {
        return true;
    }
}

/**
 * Ordered list number widget for consistent styling
 */
class OrderedListWidget extends WidgetType {
    constructor(private number: string) {
        super();
    }

    toDOM(): HTMLElement {
        const span = document.createElement('span');
        span.className = 'cm-list-number';
        span.textContent = this.number;
        return span;
    }

    eq(other: OrderedListWidget): boolean {
        return this.number === other.number;
    }
}

/**
 * Decoration entry for sorting before adding to builder
 */
interface DecoEntry {
    from: number;
    to: number;
    deco: Decoration;
}

/**
 * Build decorations for the visible content
 */
function buildDecorations(view: EditorView): DecorationSet {
    const decos: DecoEntry[] = [];
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
                    decos.push({ from: node.from, to: node.to, deco: getHeadingDecoration(level) });

                    // Find and hide the heading marks (# characters) when not on active line
                    if (!isActiveLine) {
                        const line = doc.lineAt(node.from);
                        const text = line.text;
                        const match = text.match(/^(#{1,6})\s/);
                        if (match) {
                            decos.push({ from: node.from, to: node.from + match[0].length, deco: hiddenMark });
                        }
                    }
                }

                // Strong/Bold (**text** or __text__)
                if (node.name === 'StrongEmphasis') {
                    decos.push({ from: node.from, to: node.to, deco: formatDecorations.strong });

                    if (!isActiveLine) {
                        // Hide opening marks
                        decos.push({ from: node.from, to: node.from + 2, deco: hiddenMark });
                        // Hide closing marks
                        decos.push({ from: node.to - 2, to: node.to, deco: hiddenMark });
                    }
                }

                // Emphasis/Italic (*text* or _text_)
                if (node.name === 'Emphasis') {
                    decos.push({ from: node.from, to: node.to, deco: formatDecorations.emphasis });

                    if (!isActiveLine) {
                        decos.push({ from: node.from, to: node.from + 1, deco: hiddenMark });
                        decos.push({ from: node.to - 1, to: node.to, deco: hiddenMark });
                    }
                }

                // Strikethrough (~~text~~)
                if (node.name === 'Strikethrough') {
                    decos.push({ from: node.from, to: node.to, deco: formatDecorations.strikethrough });

                    if (!isActiveLine) {
                        decos.push({ from: node.from, to: node.from + 2, deco: hiddenMark });
                        decos.push({ from: node.to - 2, to: node.to, deco: hiddenMark });
                    }
                }

                // Inline code (`code`)
                if (node.name === 'InlineCode') {
                    decos.push({ from: node.from, to: node.to, deco: formatDecorations.inlineCode });

                    if (!isActiveLine) {
                        decos.push({ from: node.from, to: node.from + 1, deco: hiddenMark });
                        decos.push({ from: node.to - 1, to: node.to, deco: hiddenMark });
                    }
                }

                // Links [text](url)
                if (node.name === 'Link') {
                    decos.push({ from: node.from, to: node.to, deco: formatDecorations.link });
                }

                // Blockquotes - but skip callouts (> [!type])
                if (node.name === 'Blockquote') {
                    const text = doc.sliceString(node.from, Math.min(node.from + 10, node.to));
                    // Only apply blockquote styling if NOT a callout
                    if (!text.match(/^>\s*\[!/)) {
                        decos.push({ from: node.from, to: node.to, deco: formatDecorations.blockquote });
                    }
                }

                // Task list items [ ] or [x]
                if (node.name === 'TaskMarker') {
                    const text = doc.sliceString(node.from, node.to);
                    const checked = text.includes('x') || text.includes('X');

                    if (!isActiveLine) {
                        decos.push({
                            from: node.from,
                            to: node.to,
                            deco: Decoration.replace({
                                widget: new TaskCheckboxWidget(checked),
                            }),
                        });
                    }
                }
                // List markers (bullets - * or - or +)
                if (node.name === 'ListMark') {
                    const text = doc.sliceString(node.from, node.to);
                    const line = doc.lineAt(node.from);

                    // Check if it's an unordered list marker
                    if (/^[-*+]$/.test(text)) {
                        // Add line decoration for consistent indentation
                        decos.push({
                            from: line.from,
                            to: line.from,
                            deco: Decoration.line({ class: 'cm-list-item cm-list-item-unordered' }),
                        });

                        if (!isActiveLine) {
                            decos.push({
                                from: node.from,
                                to: node.to,
                                deco: Decoration.replace({
                                    widget: new ListBulletWidget(),
                                }),
                            });
                        } else {
                            // On active line, style the marker color
                            decos.push({
                                from: node.from,
                                to: node.to,
                                deco: Decoration.mark({ class: 'cm-list-marker-source' }),
                            });
                        }
                    }
                    // Check if it's an ordered list marker (1. or 1))
                    else if (/^\d+[.)]$/.test(text)) {
                        // Add line decoration for consistent indentation
                        decos.push({
                            from: line.from,
                            to: line.from,
                            deco: Decoration.line({ class: 'cm-list-item cm-list-item-ordered' }),
                        });

                        if (!isActiveLine) {
                            // Replace with styled widget for consistent appearance
                            decos.push({
                                from: node.from,
                                to: node.to,
                                deco: Decoration.replace({
                                    widget: new OrderedListWidget(text),
                                }),
                            });
                        } else {
                            decos.push({
                                from: node.from,
                                to: node.to,
                                deco: Decoration.mark({ class: 'cm-list-marker-source' }),
                            });
                        }
                    }
                }
            },
        });

        // Handle highlights (==text==) - not in standard markdown parser
        // Scan visible text for highlight syntax
        const lineStart = doc.lineAt(from).number;
        const lineEnd = doc.lineAt(to).number;

        for (let lineNum = lineStart; lineNum <= lineEnd; lineNum++) {
            const line = doc.line(lineNum);
            const isActiveLine = lineNum === cursorLine;
            const highlightRegex = /==((?:[^=]|=[^=])+)==/g;
            let match;

            while ((match = highlightRegex.exec(line.text)) !== null) {
                const matchFrom = line.from + match.index;
                const matchTo = matchFrom + match[0].length;

                // Apply highlight styling to the entire match including markers
                decos.push({
                    from: matchFrom,
                    to: matchTo,
                    deco: formatDecorations.highlight,
                });

                // Hide the == markers when not on active line
                if (!isActiveLine) {
                    // Hide opening ==
                    decos.push({ from: matchFrom, to: matchFrom + 2, deco: hiddenMark });
                    // Hide closing ==
                    decos.push({ from: matchTo - 2, to: matchTo, deco: hiddenMark });
                }
            }
        }
    }

    // Sort by position (required for RangeSetBuilder)
    decos.sort((a, b) => a.from - b.from || a.to - b.to);

    // Build the decoration set
    const builder = new RangeSetBuilder<Decoration>();
    for (const { from, to, deco } of decos) {
        builder.add(from, to, deco);
    }
    return builder.finish();
}

/**
 * View plugin that manages WYSIWYG decorations
 */
const wysiwygPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;
        lastCursorLine: number;

        constructor(view: EditorView) {
            this.decorations = buildDecorations(view);
            this.lastCursorLine = view.state.doc.lineAt(view.state.selection.main.head).number;
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged) {
                this.decorations = buildDecorations(update.view);
                this.lastCursorLine = update.view.state.doc.lineAt(update.view.state.selection.main.head).number;
            } else if (update.selectionSet) {
                // Only rebuild if cursor moved to a different line
                const newLine = update.view.state.doc.lineAt(update.view.state.selection.main.head).number;
                if (newLine !== this.lastCursorLine) {
                    this.decorations = buildDecorations(update.view);
                    this.lastCursorLine = newLine;
                }
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

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
    footnoteRef: Decoration.mark({ class: 'cm-footnote-ref' }),
    footnoteDef: Decoration.mark({ class: 'cm-footnote-def' }),
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
 * Horizontal rule widget for visual separator
 */
class HorizontalRuleWidget extends WidgetType {
    toDOM(): HTMLElement {
        const hr = document.createElement('div');
        hr.className = 'cm-horizontal-rule';
        // Make the widget non-editable and prevent cursor from entering
        hr.setAttribute('contenteditable', 'false');
        return hr;
    }

    eq(): boolean {
        return true;
    }

    ignoreEvent(): boolean {
        // Return false to let click events pass through to editor
        // This prevents the widget from capturing/eating mouse events
        return false;
    }
}

/**
 * Helper to scroll to a footnote definition
 */
function scrollToFootnoteDefinition(view: EditorView, footnoteId: string): void {
    const doc = view.state.doc;
    const escapedId = footnoteId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const defPattern = new RegExp(`^\\[\\^${escapedId}\\]:`);

    // Search for the definition line
    for (let lineNum = 1; lineNum <= doc.lines; lineNum++) {
        const line = doc.line(lineNum);
        if (defPattern.test(line.text)) {
            // Scroll to the definition (center it) and place cursor there
            view.dispatch({
                selection: { anchor: line.from },
                effects: EditorView.scrollIntoView(line.from, { y: 'center' }),
            });
            view.focus();
            return;
        }
    }
}

/**
 * Helper to scroll to the first reference of a footnote
 */
function scrollToFootnoteReference(view: EditorView, footnoteId: string): void {
    const doc = view.state.doc;
    const escapedId = footnoteId.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match [^id] but NOT followed by : (which would be the definition)
    const refPattern = new RegExp(`\\[\\^${escapedId}\\](?!:)`);

    // Search for the first reference
    // Note: This naive search finds the first occurrence. 
    // Ideally we'd match the specific reference that linked here, but that requires more complex state.
    // Finding the first reference is standard behavior for simple markdown editors.
    for (let lineNum = 1; lineNum <= doc.lines; lineNum++) {
        const line = doc.line(lineNum);
        const match = line.text.match(refPattern);

        if (match && match.index !== undefined) {
            // Check if this match is inside a code block by checking if it was masked
            // We can't reuse the maskCodeSections helper easily here without re-parsing text
            // But for navigation, jumping to a code block example is acceptable edge case

            view.dispatch({
                selection: { anchor: line.from + match.index },
                effects: EditorView.scrollIntoView(line.from + match.index, { y: 'center' }),
            });
            view.focus();
            return;
        }
    }
}

/**
 * Footnote reference widget for clickable superscript numbers
 * Uses data attribute for event delegation (no inline listener)
 */
/**
 * Global regex constants for performance
 * State is reset before use in loops
 */
const highlightRegex = /==((?:[^=]|=[^=])+)==/g;
const footnoteRefRegex = /\[\^([^\]]+)\]/g;

/**
 * Footnote reference widget for clickable superscript numbers
 * Uses data attribute for event delegation (no inline listener)
 */
class FootnoteRefWidget extends WidgetType {
    constructor(private id: string) {
        super();
    }

    toDOM(): HTMLElement {
        const span = document.createElement('span');
        span.className = 'cm-footnote-ref';
        span.textContent = this.id;
        span.title = `Go to footnote ${this.id}`;
        span.style.cursor = 'pointer';

        // Store footnote ID for event delegation
        span.dataset.footnoteId = this.id;
        span.dataset.footnoteType = 'ref'; // Mark as reference

        return span;
    }

    eq(other: FootnoteRefWidget): boolean {
        return this.id === other.id;
    }

    ignoreEvent(): boolean {
        // Return false to let events bubble to our event delegation handler
        return false;
    }
}

/**
 * Footnote definition widget for clickable markers
 */
class FootnoteDefWidget extends WidgetType {
    constructor(readonly id: string) {
        super();
    }

    eq(other: FootnoteDefWidget) {
        return other.id === this.id;
    }

    toDOM(): HTMLElement {
        const container = document.createElement('span');

        // The interactive part (the ID)
        const idSpan = document.createElement('span');
        idSpan.className = 'cm-footnote-def';
        idSpan.textContent = this.id;
        idSpan.title = `Return to reference ${this.id}`;

        idSpan.style.cursor = 'pointer';
        idSpan.style.borderBottom = '1px dotted var(--editor-text)';

        idSpan.dataset.footnoteId = this.id;
        idSpan.dataset.footnoteType = 'def';

        // The static part (the colon)
        const colonSpan = document.createElement('span');
        colonSpan.textContent = ': ';

        container.appendChild(idSpan);
        container.appendChild(colonSpan);

        return container;
    }

    ignoreEvent(event: Event): boolean {
        return false;
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
 * Range that should be excluded from regex-based decorations (code blocks, inline code)
 */
interface ExcludedRange {
    from: number;
    to: number;
}

/**
 * Collect ranges of code nodes from the syntax tree.
 * These ranges should be excluded from regex-based decoration scanning.
 */
function collectCodeRanges(view: EditorView): ExcludedRange[] {
    const ranges: ExcludedRange[] = [];

    for (const { from, to } of view.visibleRanges) {
        syntaxTree(view.state).iterate({
            from,
            to,
            enter(node) {
                // Exclude inline code, fenced code blocks, and code text
                if (
                    node.name === 'InlineCode' ||
                    node.name === 'FencedCode' ||
                    node.name === 'CodeBlock' ||
                    node.name === 'CodeText'
                ) {
                    ranges.push({ from: node.from, to: node.to });
                }
            },
        });
    }

    return ranges;
}


/**
 * Mask code sections in a line's text by replacing them with spaces.
 * This prevents regex from matching across code boundaries.
 * Returns the masked text (positions remain aligned with original).
 */
function maskCodeSections(
    lineText: string,
    lineFrom: number,
    codeRanges: ExcludedRange[]
): string {
    let masked = lineText;

    for (const range of codeRanges) {
        // Check if this code range intersects with the line
        const lineEnd = lineFrom + lineText.length;
        if (range.from < lineEnd && range.to > lineFrom) {
            // Calculate relative positions within the line
            const relStart = Math.max(0, range.from - lineFrom);
            const relEnd = Math.min(lineText.length, range.to - lineFrom);

            // Replace code section with spaces (preserves positions)
            const before = masked.slice(0, relStart);
            const spaces = ' '.repeat(relEnd - relStart);
            const after = masked.slice(relEnd);
            masked = before + spaces + after;
        }
    }

    return masked;
}

/**
 * Build decorations for the visible content
 */
function buildDecorations(view: EditorView): DecorationSet {
    const decos: DecoEntry[] = [];
    const doc = view.state.doc;

    // Get the line containing the cursor
    const cursorLine = doc.lineAt(view.state.selection.main.head).number;

    // Collect code ranges to exclude from regex-based decorations
    const codeRanges = collectCodeRanges(view);

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

                // Fenced code blocks (```code```)
                if (node.name === 'FencedCode') {
                    // Apply line decoration to each line in the code block
                    const startLine = doc.lineAt(node.from).number;
                    const endLine = doc.lineAt(node.to).number;

                    // Check if cursor is within this code block
                    const isInsideBlock = cursorLine >= startLine && cursorLine <= endLine;

                    for (let lineNum = startLine; lineNum <= endLine; lineNum++) {
                        const line = doc.line(lineNum);

                        // Determine if this line is first, last, or middle for rounded corners
                        let blockClass = 'cm-code-block';
                        if (lineNum === startLine) {
                            blockClass += ' cm-code-block-start';
                        }
                        if (lineNum === endLine) {
                            blockClass += ' cm-code-block-end';
                        }

                        decos.push({
                            from: line.from,
                            to: line.from,
                            deco: Decoration.line({ class: blockClass }),
                        });
                    }

                    // Hide the opening ``` and closing ``` when cursor is NOT inside the block
                    if (!isInsideBlock) {
                        // Hide the entire first line (opening ```)
                        const firstLine = doc.line(startLine);
                        decos.push({
                            from: firstLine.from,
                            to: firstLine.to,
                            deco: hiddenMark,
                        });

                        // Hide the entire last line (closing ```)
                        const lastLine = doc.line(endLine);
                        decos.push({
                            from: lastLine.from,
                            to: lastLine.to,
                            deco: hiddenMark,
                        });
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

                // Horizontal rules (---, ***, ___)
                if (node.name === 'HorizontalRule') {
                    if (!isActiveLine) {
                        // Replace the raw markdown with a styled horizontal line widget
                        decos.push({
                            from: node.from,
                            to: node.to,
                            deco: Decoration.replace({
                                widget: new HorizontalRuleWidget(),
                            }),
                        });
                    } else {
                        // On active line, style the raw markdown
                        decos.push({
                            from: node.from,
                            to: node.to,
                            deco: Decoration.mark({ class: 'cm-hr-source' }),
                        });
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

            // Mask code sections so regex can't match across them
            const maskedText = maskCodeSections(line.text, line.from, codeRanges);
            const highlightRegex = /==((?:[^=]|=[^=])+)==/g;
            let match;

            while ((match = highlightRegex.exec(maskedText)) !== null) {
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

    // ... (logic continues using the top-level classes) ...

    // Handle footnotes - not in standard markdown parser
    // Scan for footnote references [^id] and definitions [^id]: text
    for (const { from, to } of view.visibleRanges) {
        const lineStart = doc.lineAt(from).number;
        const lineEnd = doc.lineAt(to).number;

        for (let lineNum = lineStart; lineNum <= lineEnd; lineNum++) {
            const line = doc.line(lineNum);
            const isActiveLine = lineNum === cursorLine;

            // Footnote definition at start of line: [^id]: definition text
            const defMatch = line.text.match(/^\[\^([^\]]+)\]:\s*/);
            if (defMatch) {
                const defFrom = line.from;
                const defTo = defFrom + defMatch[0].length;
                const footnoteId = defMatch[1];

                if (!isActiveLine) {
                    // Replace with widget when not editing
                    decos.push({
                        from: defFrom,
                        to: defTo,
                        deco: Decoration.replace({
                            widget: new FootnoteDefWidget(footnoteId),
                        }),
                    });
                } else {
                    // Show raw syntax when editing (styled generically as def)
                    decos.push({
                        from: defFrom,
                        to: defTo,
                        deco: formatDecorations.footnoteDef,
                    });
                }
                continue; // Skip checking for refs on definition lines
            }

            // Footnote references inline: [^id]
            // Use masked text to avoid matching inside code sections
            const maskedText = maskCodeSections(line.text, line.from, codeRanges);
            // Reset stateful regex
            footnoteRefRegex.lastIndex = 0;
            let refMatch;

            while ((refMatch = footnoteRefRegex.exec(maskedText)) !== null) {
                const matchFrom = line.from + refMatch.index;
                const matchTo = matchFrom + refMatch[0].length;
                const footnoteId = refMatch[1]; // The ID without brackets

                if (!isActiveLine) {
                    // Replace with widget - click handled by event delegation
                    decos.push({
                        from: matchFrom,
                        to: matchTo,
                        deco: Decoration.replace({
                            widget: new FootnoteRefWidget(footnoteId),
                        }),
                    });
                } else {
                    // On active line, show the raw syntax with styling
                    decos.push({
                        from: matchFrom,
                        to: matchTo,
                        deco: formatDecorations.footnoteRef,
                    });
                }
            }
        }
    }

    // Sort by position (required for RangeSetBuilder)
    decos.sort((a, b) => {
        if (a.from !== b.from) return a.from - b.from;
        if (a.deco.startSide !== b.deco.startSide) return a.deco.startSide - b.deco.startSide;
        return a.to - b.to;
    });

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
 * Event delegation handler for footnote reference clicks
 * Single listener at editor level prevents memory leaks from per-widget listeners
 */
const footnoteClickHandler = EditorView.domEventHandlers({
    mousedown(event, view) {
        const target = event.target as HTMLElement;
        const widget = target.closest('.cm-footnote-ref, .cm-footnote-def') as HTMLElement | null;

        if (widget && widget.dataset.footnoteId) {
            const id = widget.dataset.footnoteId;
            const type = widget.dataset.footnoteType;

            event.preventDefault();
            event.stopPropagation(); // Stop propagation to prevent moving cursor/selection

            // Debugging (removed in prod)
            // console.log('Footnote clicked:', id, type);

            if (type === 'ref') {
                scrollToFootnoteDefinition(view, id);
            } else if (type === 'def') {
                scrollToFootnoteReference(view, id);
            }
            return true;
        }
        return false;
    }
});

/**
 * WYSIWYG extension that provides Obsidian-style live preview
 */
export function wysiwygExtension(): Extension {
    return [wysiwygPlugin, footnoteClickHandler];
}

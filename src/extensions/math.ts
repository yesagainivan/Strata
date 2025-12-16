/**
 * Math extension for LaTeX/KaTeX rendering
 * 
 * Supports:
 * - Inline math: $x^2$ or \(x^2\)
 * - Block math: $$\sum_{i=1}^{n}$$ or \[\sum_{i=1}^{n}\]
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
import { collectCodeRanges, isInsideCode } from './utils';
import katex from 'katex';

// Regex patterns for math - only match single-line expressions
// Block math on a single line: $$...$$ (no newlines)
// Inline math: $...$ (no newlines, no $$ inside)
const INLINE_MATH_REGEX = /\$([^\$\n]+)\$/g;
const BLOCK_MATH_SINGLE_LINE_REGEX = /\$\$([^\$\n]+)\$\$/g;

interface MathMatch {
    tex: string;
    from: number;
    to: number;
    isBlock: boolean;
}

/**
 * Find all math expressions in text (single-line only to avoid CM6 errors)
 */
function findMathExpressions(text: string, offset: number): MathMatch[] {
    const matches: MathMatch[] = [];

    // Find single-line block math first
    let match;
    while ((match = BLOCK_MATH_SINGLE_LINE_REGEX.exec(text)) !== null) {
        matches.push({
            tex: match[1],
            from: offset + match.index,
            to: offset + match.index + match[0].length,
            isBlock: true,
        });
    }

    // Find inline math
    while ((match = INLINE_MATH_REGEX.exec(text)) !== null) {
        const from = offset + match.index;
        const to = offset + match.index + match[0].length;
        const matchText = match[0];

        // Skip if this looks like block math (starts/ends with $$)
        if (matchText.startsWith('$$') || matchText.endsWith('$$')) {
            continue;
        }

        // Skip if this overlaps with a block math
        const overlaps = matches.some(m => from >= m.from && to <= m.to);
        if (!overlaps) {
            matches.push({
                tex: match[1],
                from,
                to,
                isBlock: false,
            });
        }
    }

    return matches;
}

/**
 * Widget for rendered math
 * Uses lazy rendering - KaTeX is only invoked when the widget is actually displayed
 */
class MathWidget extends WidgetType {
    constructor(
        private tex: string,
        private isBlock: boolean
    ) {
        super();
    }

    toDOM(): HTMLElement {
        const wrapper = document.createElement(this.isBlock ? 'div' : 'span');
        wrapper.className = this.isBlock ? 'cm-math-block' : 'cm-math-inline';
        // Prevent cursor from entering widget and causing selection issues
        wrapper.setAttribute('contenteditable', 'false');

        try {
            wrapper.innerHTML = katex.renderToString(this.tex, {
                displayMode: this.isBlock,
                throwOnError: false,
                errorColor: '#cc0000',
                trust: false,
                strict: false,
            });
        } catch (e) {
            wrapper.className += ' cm-math-error';
            wrapper.textContent = this.tex;
            wrapper.title = e instanceof Error ? e.message : 'Invalid LaTeX';
        }

        return wrapper;
    }

    eq(other: MathWidget): boolean {
        return this.tex === other.tex && this.isBlock === other.isBlock;
    }

    ignoreEvent(): boolean {
        return false;
    }
}

/**
 * Decoration for raw math syntax (when editing)
 */
const mathSourceMark = Decoration.mark({ class: 'cm-math-source' });

interface DecoEntry {
    from: number;
    to: number;
    deco: Decoration;
}


/**
 * Build math decorations
 */
function buildMathDecorations(view: EditorView): DecorationSet {
    const decos: DecoEntry[] = [];
    const doc = view.state.doc;
    const cursorLine = doc.lineAt(view.state.selection.main.head).number;

    // Pre-collect code ranges once (O(n) instead of O(n²))
    const codeRanges = collectCodeRanges(view);

    for (const { from, to } of view.visibleRanges) {
        const text = doc.sliceString(from, to);
        const matches = findMathExpressions(text, from);

        for (const match of matches) {
            // Simple range check instead of tree iteration per match
            if (isInsideCode(match.from, match.to, codeRanges)) continue;

            const matchLine = doc.lineAt(match.from).number;
            const isActiveLine = matchLine === cursorLine;

            if (isActiveLine) {
                // Show raw syntax when editing
                decos.push({
                    from: match.from,
                    to: match.to,
                    deco: mathSourceMark,
                });
            } else {
                // Replace with rendered math
                decos.push({
                    from: match.from,
                    to: match.to,
                    deco: Decoration.replace({
                        widget: new MathWidget(match.tex, match.isBlock),
                    }),
                });
            }
        }
    }

    // Sort by position
    decos.sort((a, b) => a.from - b.from || a.to - b.to);

    const builder = new RangeSetBuilder<Decoration>();
    for (const { from, to, deco } of decos) {
        builder.add(from, to, deco);
    }
    return builder.finish();
}

/**
 * View plugin for math rendering
 */
const mathPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;
        lastCursorLine: number;

        constructor(view: EditorView) {
            this.decorations = buildMathDecorations(view);
            this.lastCursorLine = view.state.doc.lineAt(view.state.selection.main.head).number;
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged) {
                this.decorations = buildMathDecorations(update.view);
                this.lastCursorLine = update.view.state.doc.lineAt(
                    update.view.state.selection.main.head
                ).number;
            } else if (update.selectionSet) {
                const newLine = update.view.state.doc.lineAt(
                    update.view.state.selection.main.head
                ).number;
                if (newLine !== this.lastCursorLine) {
                    this.decorations = buildMathDecorations(update.view);
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
 * Theme for math rendering
 */
const mathTheme = EditorView.baseTheme({
    '.cm-math-inline': {
        padding: '0 2px',
        userSelect: 'none',
    },
    '.cm-math-block': {
        display: 'block',
        textAlign: 'center',
        padding: '12px 0',
        margin: '8px 0',
        userSelect: 'none',
    },
    '.cm-math-source': {
        fontFamily: '"SF Mono", Monaco, "Cascadia Code", monospace',
        color: 'var(--syntax-footnote, #7c3aed)',
        backgroundColor: 'var(--syntax-code-bg, #f5f3ff)',
        padding: '1px 4px',
        borderRadius: '3px',
    },
    '.cm-math-error': {
        color: 'var(--callout-header-danger, #dc2626)',
        backgroundColor: 'var(--callout-danger-bg, #fef2f2)',
        padding: '2px 4px',
        borderRadius: '3px',
        fontFamily: 'monospace',
        fontSize: '0.9em',
    },
});

/**
 * Math extension for LaTeX rendering
 * 
 * @example
 * ```tsx
 * import { MarkdownEditor, mathExtension } from 'modern-markdown-editor';
 * 
 * <MarkdownEditor extensions={[mathExtension()]} />
 * ```
 */
export function mathExtension(): Extension {
    return [mathPlugin, mathTheme];
}

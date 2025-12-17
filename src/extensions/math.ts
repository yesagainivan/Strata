/**
 * Math extension for LaTeX/KaTeX rendering
 * 
 * Supports:
 * - Inline math: $x^2$ or \(x^2\)
 * - Block math: $$\sum_{i=1}^{n}$$ or \[\sum_{i=1}^{n}\]
 * 
 * ## Architecture
 * 
 * This extension uses a StateField-based approach for correct height estimation:
 * 
 * 1. `mathCache` StateField stores all math positions in the document
 * 2. `mathDecorations` uses EditorView.decorations.compute() to build decorations
 * 3. `MathWidget` measures its height after render and updates the heightCache
 * 
 * This ensures CodeMirror's height map is accurate BEFORE viewport computation,
 * eliminating scroll jumping.
 */

import { Extension, RangeSetBuilder, StateField } from '@codemirror/state';
import {
    Decoration,
    DecorationSet,
    EditorView,
    WidgetType,
    Rect,
} from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';
import katex from 'katex';
import { heightCacheEffect, mathCacheKey, getCachedHeight } from './heightCache';
import { modeField } from '../core/mode';

// Regex patterns for math - only match single-line expressions
// Block math on a single line: $$...$$ (no newlines)
// Inline math: $...$ (no newlines, no $$ inside)
const INLINE_MATH_REGEX = /\$([^\$\n]+)\$/g;
const BLOCK_MATH_SINGLE_LINE_REGEX = /\$\$([^\$\n]+)\$\$/g;

/**
 * Represents a math expression found in the document
 */
interface MathMatch {
    tex: string;
    from: number;
    to: number;
    isBlock: boolean;
}

/**
 * Check if a position is inside a code block or inline code
 * Uses the syntax tree for accurate detection
 */
function isInsideCodeNode(from: number, to: number, state: { tree: ReturnType<typeof syntaxTree> }): boolean {
    let insideCode = false;
    state.tree.iterate({
        from,
        to,
        enter(node) {
            const name = node.name;
            if (
                name === 'CodeBlock' ||
                name === 'FencedCode' ||
                name === 'InlineCode' ||
                name === 'CodeText'
            ) {
                insideCode = true;
                return false; // Stop iteration
            }
        },
    });
    return insideCode;
}

/**
 * Find all math expressions in the entire document
 * This is called once per document change, not per viewport change
 */
function findAllMathInDocument(doc: { toString: () => string; length: number }, tree: ReturnType<typeof syntaxTree>): MathMatch[] {
    const text = doc.toString();
    const matches: MathMatch[] = [];

    // Reset regex state
    BLOCK_MATH_SINGLE_LINE_REGEX.lastIndex = 0;
    INLINE_MATH_REGEX.lastIndex = 0;

    // Find single-line block math first
    let match;
    while ((match = BLOCK_MATH_SINGLE_LINE_REGEX.exec(text)) !== null) {
        const from = match.index;
        const to = match.index + match[0].length;

        // Skip if inside code
        if (!isInsideCodeNode(from, to, { tree })) {
            matches.push({
                tex: match[1],
                from,
                to,
                isBlock: true,
            });
        }
    }

    // Find inline math
    while ((match = INLINE_MATH_REGEX.exec(text)) !== null) {
        const from = match.index;
        const to = match.index + match[0].length;
        const matchText = match[0];

        // Skip if this looks like block math (starts/ends with $$)
        if (matchText.startsWith('$$') || matchText.endsWith('$$')) {
            continue;
        }

        // Skip if this overlaps with a block math
        const overlaps = matches.some(m => from >= m.from && to <= m.to);
        if (overlaps) continue;

        // Skip if inside code
        if (!isInsideCodeNode(from, to, { tree })) {
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
 * StateField to cache math positions
 * Only re-parses when the document changes
 */
const mathCache = StateField.define<MathMatch[]>({
    create(state) {
        const tree = syntaxTree(state);
        return findAllMathInDocument(state.doc, tree);
    },
    update(matches, tr) {
        if (!tr.docChanged) {
            return matches; // Return cached matches if document hasn't changed
        }
        // Re-parse math positions when document changes
        const tree = syntaxTree(tr.state);
        return findAllMathInDocument(tr.state.doc, tree);
    },
});

/**
 * Widget for rendered math
 * Uses lazy rendering - KaTeX is only invoked when the widget is actually displayed
 */
class MathWidget extends WidgetType {
    private cacheKey: string;
    private cachedHeight: number | null = null;

    constructor(
        private tex: string,
        private isBlock: boolean,
        cachedHeight?: number
    ) {
        super();
        this.cacheKey = mathCacheKey(tex, isBlock);
        this.cachedHeight = cachedHeight ?? null;
    }

    /**
     * Estimated height for CodeMirror viewport calculations.
     * 
     * Priority:
     * 1. Use cached height from previous render (most accurate)
     * 2. Use heuristic based on content complexity
     */
    get estimatedHeight(): number {
        // If we have a cached measurement, use it
        if (this.cachedHeight !== null) {
            return this.cachedHeight;
        }

        // Inline math: constrained to line height
        if (!this.isBlock) {
            return 20;
        }

        // Block math: calibrated estimates based on measured values
        // Measured: sum=112.7px, int=102.25px, physics=98.15px
        // All these have complex symbols (frac, sum, int)
        const lineCount = this.tex.split('\n').length;
        const hasComplexSymbols = /\\(frac|sum|int|prod|lim|matrix|begin)/.test(this.tex);

        // Calibrated base height + per-line + complexity
        let estimate = 80; // Base block math height (calibrated)
        estimate += (lineCount - 1) * 24; // ~24px per additional line
        if (hasComplexSymbols) {
            estimate += 20; // Complex symbols add ~20px (measured: 98-112px total)
        }

        return estimate;
    }

    toDOM(view: EditorView): HTMLElement {

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

        // Schedule height measurement after browser paint (block math only)
        // Skip if we already have an accurate cached value (prevents redundant dispatches)
        if (this.isBlock && this.cachedHeight === null) {
            requestAnimationFrame(() => {
                const height = wrapper.getBoundingClientRect().height;
                if (height > 0) {
                    view.dispatch({
                        effects: heightCacheEffect.of({
                            key: this.cacheKey,
                            height,
                        }),
                    });
                    // Tell CM6 to recalculate its internal height map
                    view.requestMeasure();
                }
            });
        }

        return wrapper;
    }

    /**
     * Coordinate mapping for large block widgets
     * Helps CodeMirror accurately calculate scroll positions
     */
    coordsAt(dom: HTMLElement, pos: number, side: number): Rect | null {
        if (!this.isBlock) return null;
        return dom.getBoundingClientRect();
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

/**
 * Computed decorations using StateField-cached positions
 * 
 * This is the key change: using EditorView.decorations.compute() instead of ViewPlugin
 * ensures decorations are computed BEFORE viewport calculation, giving CM6
 * accurate height information for scroll calculations.
 */
const mathDecorations = EditorView.decorations.compute(
    [mathCache, heightCache, 'selection', modeField],  // Added modeField to dependencies
    (state) => {
        // Efficient O(1) mode check at the start
        const mode = state.field(modeField);

        // In source mode, return empty decorations (show raw markdown)
        if (mode === 'source') {
            return Decoration.none;
        }

        const doc = state.doc;
        const cursorPos = state.selection.main.head;
        // In read mode, use -1 so no line is ever "active" (always render math)
        const cursorLine = mode === 'read'
            ? -1
            : doc.lineAt(cursorPos).number;

        // Get cached math positions
        const matches = state.field(mathCache);

        interface DecoEntry {
            from: number;
            to: number;
            deco: Decoration;
        }

        const decos: DecoEntry[] = [];

        for (const match of matches) {
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
                // Get cached height for this math expression
                const cacheKey = mathCacheKey(match.tex, match.isBlock);
                const cachedHeight = getCachedHeight(state, cacheKey, -1);

                // Replace with rendered math widget
                decos.push({
                    from: match.from,
                    to: match.to,
                    deco: Decoration.replace({
                        widget: new MathWidget(
                            match.tex,
                            match.isBlock,
                            cachedHeight > 0 ? cachedHeight : undefined
                        ),
                    }),
                });
            }
        }

        // Sort by position (required for RangeSetBuilder)
        decos.sort((a, b) => a.from - b.from || a.to - b.to);

        const builder = new RangeSetBuilder<Decoration>();
        for (const { from, to, deco } of decos) {
            builder.add(from, to, deco);
        }
        return builder.finish();
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
        // NOTE: Using padding only (no margin) because external margins
        // on block widgets confuse CM6's height map, causing scroll jumps
        padding: '16px 0',  // Was: padding 12px + margin 8px = 20px total
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
 * Import the height cache to enable height caching for math widgets
 */
import { heightCache } from './heightCache';

/**
 * Math extension for LaTeX rendering
 * 
 * Uses StateField-based decoration provider for correct scroll behavior.
 * Heights are cached after first render for smooth subsequent scrolling.
 * 
 * @example
 * ```tsx
 * import { MarkdownEditor, mathExtension } from 'strata-editor';
 * 
 * <MarkdownEditor extensions={[mathExtension()]} />
 * ```
 */
export function mathExtension(): Extension {
    return [
        heightCache,  // Include height cache (deduplicated if already present)
        mathCache,    // StateField for math positions
        mathDecorations, // Computed decorations
        mathTheme,    // Styling
    ];
}

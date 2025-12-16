/**
 * Shared utilities for extensions
 * Common code range handling for all decoration extensions
 */

import { EditorView } from '@codemirror/view';
import { syntaxTree } from '@codemirror/language';

/**
 * A range representing code content that should be excluded from decorations
 */
export interface CodeRange {
    from: number;
    to: number;
}

/**
 * Collect code ranges from the syntax tree (for exclusion from decorations)
 * This iterates the tree once per visible range, O(n) complexity
 */
export function collectCodeRanges(view: EditorView): CodeRange[] {
    const ranges: CodeRange[] = [];
    const tree = syntaxTree(view.state);

    for (const { from, to } of view.visibleRanges) {
        tree.iterate({
            from,
            to,
            enter(node) {
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
 * Check if a position range overlaps with any code range
 * O(n) where n is number of code ranges, but typically small
 */
export function isInsideCode(from: number, to: number, codeRanges: CodeRange[]): boolean {
    for (const range of codeRanges) {
        if (from < range.to && to > range.from) {
            return true;
        }
    }
    return false;
}

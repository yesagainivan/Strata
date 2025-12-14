/**
 * Callout extension for Obsidian-style admonitions
 * Syntax: > [!type] Title
 * Foldable with + or - after type
 */

import { Extension, RangeSetBuilder, StateField, StateEffect } from '@codemirror/state';
import {
    Decoration,
    DecorationSet,
    EditorView,
    ViewPlugin,
    ViewUpdate,
    WidgetType,
} from '@codemirror/view';

export const CALLOUT_TYPES: Record<string, { icon: string; defaultTitle: string }> = {
    note: { icon: '📝', defaultTitle: 'Note' },
    info: { icon: 'ℹ️', defaultTitle: 'Info' },
    tip: { icon: '💡', defaultTitle: 'Tip' },
    warning: { icon: '⚠️', defaultTitle: 'Warning' },
    danger: { icon: '🚨', defaultTitle: 'Danger' },
    success: { icon: '✅', defaultTitle: 'Success' },
    question: { icon: '❓', defaultTitle: 'Question' },
    quote: { icon: '💬', defaultTitle: 'Quote' },
    example: { icon: '📋', defaultTitle: 'Example' },
    bug: { icon: '🐛', defaultTitle: 'Bug' },
    important: { icon: '🔥', defaultTitle: 'Important' },
    caution: { icon: '⚠️', defaultTitle: 'Caution' },
    abstract: { icon: '📄', defaultTitle: 'Abstract' },
};

const CALLOUT_HEADER_REGEX = /^>\s*\[!(\w+)\]([+-])?\s*(.*)?$/;

function getCalloutStyleType(type: string): string {
    const lowerType = type.toLowerCase();
    const styleMap: Record<string, string> = {
        important: 'warning', caution: 'warning', attention: 'warning',
        abstract: 'info', summary: 'info', hint: 'tip',
        check: 'success', done: 'success', failure: 'danger',
        fail: 'danger', error: 'danger', cite: 'quote',
    };
    return styleMap[lowerType] || lowerType;
}

interface CalloutBlock {
    type: string;
    styleType: string;
    title: string;
    icon: string;
    foldable: boolean;
    folded: boolean;
    startLine: number;
    endLine: number;
    headerFrom: number;
    headerTo: number;
}

const toggleCalloutFold = StateEffect.define<{ line: number }>();

const foldedCalloutsField = StateField.define<Set<number>>({
    create() { return new Set(); },
    update(folded, tr) {
        let newFolded = folded;
        for (const e of tr.effects) {
            if (e.is(toggleCalloutFold)) {
                newFolded = new Set(folded);
                if (newFolded.has(e.value.line)) {
                    newFolded.delete(e.value.line);
                } else {
                    newFolded.add(e.value.line);
                }
            }
        }
        return newFolded;
    },
});

function findCallouts(view: EditorView): CalloutBlock[] {
    const callouts: CalloutBlock[] = [];
    const doc = view.state.doc;
    const foldedSet = view.state.field(foldedCalloutsField, false) || new Set();

    let lineNum = 1;
    while (lineNum <= doc.lines) {
        const line = doc.line(lineNum);
        const match = line.text.match(CALLOUT_HEADER_REGEX);

        if (match) {
            const type = match[1].toLowerCase();
            const foldIndicator = match[2];
            const title = match[3]?.trim() || '';
            const typeInfo = CALLOUT_TYPES[type] || { icon: '📌', defaultTitle: type };
            const startLine = lineNum;

            let endLine = lineNum;
            for (let nextLine = lineNum + 1; nextLine <= doc.lines; nextLine++) {
                const nextLineObj = doc.line(nextLine);
                if (nextLineObj.text.startsWith('>')) {
                    endLine = nextLine;
                } else {
                    break;
                }
            }

            const isFoldable = foldIndicator === '+' || foldIndicator === '-';
            const isInitiallyFolded = foldIndicator === '-';
            const isFoldedByState = foldedSet.has(startLine);

            callouts.push({
                type,
                styleType: getCalloutStyleType(type),
                title: title || typeInfo.defaultTitle,
                icon: typeInfo.icon,
                foldable: isFoldable,
                folded: isFoldable && (isFoldedByState !== isInitiallyFolded ? isFoldedByState : isInitiallyFolded),
                startLine,
                endLine,
                headerFrom: line.from,
                headerTo: line.to,
            });

            lineNum = endLine + 1;
        } else {
            lineNum++;
        }
    }

    return callouts;
}

class CalloutHeaderWidget extends WidgetType {
    constructor(
        private callout: CalloutBlock,
        private onToggle: () => void
    ) { super(); }

    toDOM(): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.className = `cm-callout-header cm-callout-header-${this.callout.styleType}`;

        const icon = document.createElement('span');
        icon.className = 'cm-callout-icon';
        icon.textContent = this.callout.icon;
        wrapper.appendChild(icon);

        const title = document.createElement('span');
        title.className = 'cm-callout-title-text';
        title.textContent = this.callout.title;
        wrapper.appendChild(title);

        if (this.callout.foldable) {
            const foldBtn = document.createElement('button');
            foldBtn.className = 'cm-callout-fold-btn';
            foldBtn.textContent = this.callout.folded ? '▶' : '▼';
            foldBtn.onclick = (e) => {
                e.preventDefault();
                e.stopPropagation();
                this.onToggle();
            };
            wrapper.appendChild(foldBtn);
        }

        return wrapper;
    }

    eq(other: CalloutHeaderWidget): boolean {
        return this.callout.type === other.callout.type &&
            this.callout.title === other.callout.title &&
            this.callout.folded === other.callout.folded;
    }

    ignoreEvent(): boolean { return false; }
}

function buildCalloutDecorations(view: EditorView): DecorationSet {
    const decorations: Array<{ from: number, to: number, decoration: Decoration }> = [];
    const doc = view.state.doc;
    const cursorLine = doc.lineAt(view.state.selection.main.head).number;
    const callouts = findCallouts(view);

    for (const callout of callouts) {
        const isOnCallout = cursorLine >= callout.startLine && cursorLine <= callout.endLine;
        const isSingleLine = callout.startLine === callout.endLine;

        // Apply line decorations for each line
        for (let lineNum = callout.startLine; lineNum <= callout.endLine; lineNum++) {
            const line = doc.line(lineNum);
            const isFirst = lineNum === callout.startLine;
            const isLast = lineNum === callout.endLine;
            const isContent = lineNum > callout.startLine;

            // Hide content if folded
            if (callout.folded && isContent && !isOnCallout) {
                decorations.push({
                    from: line.from,
                    to: line.from,
                    decoration: Decoration.line({ class: 'cm-callout-hidden' })
                });
                continue;
            }

            // Line styling - all lines get the type styling
            let lineClass = `cm-callout-line cm-callout-${callout.styleType}`;
            if (isFirst && !isOnCallout) lineClass += ' cm-callout-first';
            if ((isLast || (callout.folded && isFirst)) && !isOnCallout) lineClass += ' cm-callout-last';
            if (isSingleLine && !isOnCallout) lineClass += ' cm-callout-single';
            if (isContent) lineClass += ' cm-callout-content';

            decorations.push({
                from: line.from,
                to: line.from,
                decoration: Decoration.line({ class: lineClass })
            });
        }

        // When NOT on callout, replace header with widget
        if (!isOnCallout) {
            const headerLine = doc.line(callout.startLine);

            decorations.push({
                from: headerLine.from,
                to: headerLine.to,
                decoration: Decoration.replace({
                    widget: new CalloutHeaderWidget(callout, () => {
                        view.dispatch({ effects: toggleCalloutFold.of({ line: callout.startLine }) });
                    }),
                })
            });

            // Hide > prefix on content lines
            for (let lineNum = callout.startLine + 1; lineNum <= callout.endLine; lineNum++) {
                if (callout.folded) continue;
                const line = doc.line(lineNum);
                const prefixMatch = line.text.match(/^>\s?/);
                if (prefixMatch) {
                    decorations.push({
                        from: line.from,
                        to: line.from + prefixMatch[0].length,
                        decoration: Decoration.replace({})
                    });
                }
            }
        }
    }

    // Sort decorations by from position (required by CodeMirror)
    decorations.sort((a, b) => a.from - b.from || a.to - b.to);

    const builder = new RangeSetBuilder<Decoration>();
    for (const { from, to, decoration } of decorations) {
        builder.add(from, to, decoration);
    }

    return builder.finish();
}

const calloutPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = buildCalloutDecorations(view);
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged || update.selectionSet ||
                update.transactions.some(tr => tr.effects.some(e => e.is(toggleCalloutFold)))) {
                this.decorations = buildCalloutDecorations(update.view);
            }
        }
    },
    {
        decorations: v => v.decorations,
    }
);

const calloutTheme = EditorView.baseTheme({
    // Base line styling - creates a unified block appearance
    '.cm-callout-line': {
        position: 'relative',
        backgroundColor: 'var(--callout-info-bg)',
        borderLeft: '4px solid var(--callout-info-border)',
        paddingLeft: '12px !important',
        marginLeft: '0',
        marginRight: '0',
    },
    // Override blockquote styling inside callouts - remove the extra line
    '.cm-callout-line .cm-blockquote': {
        borderLeft: 'none !important',
        paddingLeft: '0 !important',
        color: 'inherit !important',
    },
    // Also override at content line level
    '.cm-callout-content': {
        paddingTop: '0',
        paddingBottom: '0',
    },
    '.cm-callout-content .cm-line': {
        borderLeft: 'none !important',
    },
    '.cm-callout-first': {
        borderTopLeftRadius: '8px',
        borderTopRightRadius: '8px',
        paddingTop: '0 !important',
        paddingBottom: '0 !important',
        lineHeight: '0 !important',
        // marginTop: '8px',
    },
    '.cm-callout-last': {
        borderBottomLeftRadius: '8px',
        borderBottomRightRadius: '8px',
        paddingBottom: '12px',
        marginBottom: '8px',
    },
    '.cm-callout-single': {
        borderRadius: '8px',
        marginTop: '8px',
        marginBottom: '8px',
    },
    '.cm-callout-hidden': {
        display: 'none !important',
    },

    // Type-specific colors
    '.cm-callout-info': {
        backgroundColor: 'var(--callout-info-bg) !important',
        borderLeftColor: 'var(--callout-info-border) !important'
    },
    '.cm-callout-warning': {
        backgroundColor: 'var(--callout-warning-bg) !important',
        borderLeftColor: 'var(--callout-warning-border) !important'
    },
    '.cm-callout-danger': {
        backgroundColor: 'var(--callout-danger-bg) !important',
        borderLeftColor: 'var(--callout-danger-border) !important'
    },
    '.cm-callout-success': {
        backgroundColor: 'var(--callout-success-bg) !important',
        borderLeftColor: 'var(--callout-success-border) !important'
    },
    '.cm-callout-tip': {
        backgroundColor: 'var(--callout-tip-bg) !important',
        borderLeftColor: 'var(--callout-tip-border) !important'
    },
    '.cm-callout-note': {
        backgroundColor: '#f0f4ff !important',
        borderLeftColor: '#6366f1 !important'
    },
    '.cm-callout-question': {
        backgroundColor: '#f5f3ff !important',
        borderLeftColor: '#8b5cf6 !important'
    },
    '.cm-callout-quote': {
        backgroundColor: '#f8fafc !important',
        borderLeftColor: '#64748b !important',
        fontStyle: 'italic',
    },
    '.cm-callout-example': {
        backgroundColor: '#f0f9ff !important',
        borderLeftColor: '#0ea5e9 !important'
    },
    '.cm-callout-bug': {
        backgroundColor: '#fef2f2 !important',
        borderLeftColor: '#dc2626 !important'
    },

    // Header widget styling
    '.cm-callout-header': {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: '600',
        fontSize: '1em',
        lineHeight: '1.5',
        // paddingTop: '8px',
        // paddingBottom: '4px',
    },
    '.cm-callout-header-info': { color: '#1e40af' },
    '.cm-callout-header-warning': { color: '#92400e' },
    '.cm-callout-header-danger': { color: '#991b1b' },
    '.cm-callout-header-success': { color: '#166534' },
    '.cm-callout-header-tip': { color: '#115e59' },
    '.cm-callout-header-note': { color: '#4338ca' },
    '.cm-callout-header-quote': { color: '#475569' },

    '.cm-callout-icon': {
        fontSize: '1.1em',
        lineHeight: '1',
    },
    '.cm-callout-title-text': {
        flex: '1',
    },
    '.cm-callout-fold-btn': {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '0.9em',
        opacity: '0.5',
        padding: '2px 8px',
        borderRadius: '4px',
        color: 'inherit',
        transition: 'opacity 0.15s',
    },
});

export function calloutExtension(): Extension {
    return [foldedCalloutsField, calloutPlugin, calloutTheme];
}

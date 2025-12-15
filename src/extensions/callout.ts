/**
 * Callout extension for Obsidian-style admonitions
 * 
 * Syntax: > [!type] Title
 * Foldable: > [!type]+ Title (expanded) or > [!type]- Title (collapsed)
 * 
 * Supports collapsible callouts with chevron toggle
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

// Effect to toggle fold state for a callout at a specific line
const toggleFoldEffect = StateEffect.define<{ line: number }>();

// State field to track which callouts are folded (by their starting line number)
// Map stores: lineNumber -> isFolded
const foldState = StateField.define<Map<number, boolean>>({
    create() {
        return new Map();
    },
    update(value, tr) {
        let newValue = value;

        // Handle document changes - adjust line numbers
        if (tr.docChanged) {
            const newMap = new Map<number, boolean>();
            for (const [line, folded] of value) {
                // Try to map the old position to new position
                const oldLine = tr.startState.doc.line(Math.min(line, tr.startState.doc.lines));
                const newPos = tr.changes.mapPos(oldLine.from, 1);
                if (newPos >= 0 && newPos <= tr.newDoc.length) {
                    const newLine = tr.newDoc.lineAt(newPos).number;
                    newMap.set(newLine, folded);
                }
            }
            newValue = newMap;
        }

        // Handle toggle effects
        for (const effect of tr.effects) {
            if (effect.is(toggleFoldEffect)) {
                newValue = new Map(newValue);
                const current = newValue.get(effect.value.line) ?? false;
                newValue.set(effect.value.line, !current);
            }
        }

        return newValue;
    },
});

// SVG icon strings - using standard Lucide/Feather paths with round caps
const ICONS = {
    info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>',
    warning: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>',
    danger: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>',
    success: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
    tip: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>',
    question: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>',
    quote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z"/><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z"/></svg>',
    example: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>',
    bug: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m8 2 1.88 1.88"/><path d="M14.12 3.88 16 2"/><path d="M9 7.13v-1a3.003 3.003 0 1 1 6 0v1"/><path d="M12 20c-3.3 0-6-2.7-6-6v-3a4 4 0 0 1 4-4h4a4 0 0 1 4 4v3c0 3.3-2.7 6-6 6"/><path d="M12 20v-9"/><path d="M6.53 9H9"/><path d="M6 13h3"/><path d="M6 17h3"/><path d="M15 9h2.47"/><path d="M15 13h3"/><path d="M15 17h3"/></svg>',
    note: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><path d="M12 18v-6"/><path d="M12 8h.01"/></svg>',
};

export const CALLOUT_TYPES: Record<string, { icon: string; defaultTitle: string }> = {
    note: { icon: ICONS.note, defaultTitle: 'Note' },
    info: { icon: ICONS.info, defaultTitle: 'Info' },
    tip: { icon: ICONS.tip, defaultTitle: 'Tip' },
    warning: { icon: ICONS.warning, defaultTitle: 'Warning' },
    danger: { icon: ICONS.danger, defaultTitle: 'Danger' },
    success: { icon: ICONS.success, defaultTitle: 'Success' },
    question: { icon: ICONS.question, defaultTitle: 'Question' },
    quote: { icon: ICONS.quote, defaultTitle: 'Quote' },
    example: { icon: ICONS.example, defaultTitle: 'Example' },
    bug: { icon: ICONS.bug, defaultTitle: 'Bug' },
    important: { icon: ICONS.warning, defaultTitle: 'Important' },
    caution: { icon: ICONS.warning, defaultTitle: 'Caution' },
    abstract: { icon: ICONS.note, defaultTitle: 'Abstract' },
};

const CALLOUT_HEADER_REGEX = /^(>\s*\[!(\w+)\]([+-])?)\s*(.*)?$/;

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

// Chevron SVG for fold toggle
const CHEVRON_RIGHT = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>';
const CHEVRON_DOWN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"/></svg>';

// Icon widget with optional fold toggle
class CalloutIconWidget extends WidgetType {
    constructor(
        private iconSvg: string,
        private title: string,
        private styleType: string,
        private isFoldable: boolean,
        private isFolded: boolean,
        private lineNumber: number
    ) {
        super();
    }

    toDOM(): HTMLElement {
        const span = document.createElement('span');
        span.className = `cm-callout-header-widget cm-callout-header-${this.styleType}`;

        const iconWrapper = document.createElement('span');
        iconWrapper.className = 'cm-callout-icon';
        iconWrapper.innerHTML = this.iconSvg;

        const titleSpan = document.createElement('span');
        titleSpan.className = 'cm-callout-title';
        titleSpan.textContent = this.title;

        span.appendChild(iconWrapper);
        span.appendChild(document.createTextNode(' '));
        span.appendChild(titleSpan);

        // Add fold toggle on the right if foldable
        // Uses data attribute for event delegation (no inline listener)
        if (this.isFoldable) {
            const foldToggle = document.createElement('span');
            foldToggle.className = `cm-callout-fold-toggle ${this.isFolded ? 'cm-callout-folded' : ''}`;
            foldToggle.innerHTML = this.isFolded ? CHEVRON_RIGHT : CHEVRON_DOWN;
            foldToggle.setAttribute('aria-label', this.isFolded ? 'Expand callout' : 'Collapse callout');
            foldToggle.setAttribute('role', 'button');
            foldToggle.setAttribute('tabindex', '0');

            // Store line number for event delegation
            foldToggle.dataset.calloutLine = String(this.lineNumber);

            span.appendChild(foldToggle);
        }

        return span;
    }

    eq(other: CalloutIconWidget): boolean {
        return this.iconSvg === other.iconSvg &&
            this.title === other.title &&
            this.isFoldable === other.isFoldable &&
            this.isFolded === other.isFolded &&
            this.lineNumber === other.lineNumber;
    }

    ignoreEvent(): boolean {
        // Return false to let events bubble to our event delegation handler
        return false;
    }
}

// Decoration to hide text by replacing it with nothing
// Using Decoration.replace() instead of mark + CSS hide to avoid position calculation errors
const hiddenSyntax = Decoration.replace({});
const hiddenPrefix = Decoration.replace({});

interface DecoEntry {
    from: number;
    to: number;
    deco: Decoration;
    sortKey: number;
}

// Decoration to hide entire content lines when folded
const hiddenLine = Decoration.line({ class: 'cm-callout-hidden-line' });

function buildDecorations(view: EditorView): DecorationSet {
    const decos: DecoEntry[] = [];
    const doc = view.state.doc;
    const cursorLine = doc.lineAt(view.state.selection.main.head).number;
    const foldStates = view.state.field(foldState);

    // Scan only visible ranges for performance on large documents
    for (const { from, to } of view.visibleRanges) {
        const startLine = doc.lineAt(from).number;
        const endLineNum = doc.lineAt(to).number;

        for (let lineNum = startLine; lineNum <= endLineNum; lineNum++) {
            const line = doc.line(lineNum);
            const match = line.text.match(CALLOUT_HEADER_REGEX);

            if (match) {
                const syntaxPart = match[1];
                const type = match[2].toLowerCase();
                const foldIndicator = match[3]; // '+' or '-' or undefined
                const title = match[4]?.trim() || '';
                const styleType = getCalloutStyleType(type);
                const typeInfo = CALLOUT_TYPES[type] || { icon: ICONS.info, defaultTitle: type };
                const displayTitle = title || typeInfo.defaultTitle;

                // Determine if this callout is foldable (has + or - indicator)
                const isFoldable = foldIndicator === '+' || foldIndicator === '-';

                // Get fold state: check user state first, then fall back to indicator default
                // '-' means collapsed by default, '+' means expanded by default
                let isFolded = false;
                if (isFoldable) {
                    if (foldStates.has(lineNum)) {
                        isFolded = foldStates.get(lineNum)!;
                    } else {
                        // Default based on indicator: '-' = folded, '+' = expanded
                        isFolded = foldIndicator === '-';
                    }
                }

                let endLine = lineNum;
                for (let nextLine = lineNum + 1; nextLine <= doc.lines; nextLine++) {
                    if (doc.line(nextLine).text.startsWith('>')) {
                        endLine = nextLine;
                    } else {
                        break;
                    }
                }

                const isOnCallout = cursorLine >= lineNum && cursorLine <= endLine;
                const hasContentLines = endLine > lineNum;

                // Apply line decorations to header line
                decos.push({
                    from: line.from,
                    to: line.from,
                    deco: Decoration.line({ class: `cm-callout-line cm-callout-${styleType}` }),
                    sortKey: 0,
                });

                // Apply line decorations to content lines (if not folded or editing)
                for (let i = lineNum + 1; i <= endLine; i++) {
                    const calloutLine = doc.line(i);

                    if (isFolded && !isOnCallout) {
                        // Hide content lines when folded
                        decos.push({
                            from: calloutLine.from,
                            to: calloutLine.from,
                            deco: hiddenLine,
                            sortKey: 0,
                        });
                    } else {
                        // Show with styling
                        decos.push({
                            from: calloutLine.from,
                            to: calloutLine.from,
                            deco: Decoration.line({ class: `cm-callout-line cm-callout-${styleType}` }),
                            sortKey: 0,
                        });
                    }
                }

                // If NOT editing the callout, hide syntax and show widget
                if (!isOnCallout) {
                    // Add icon/title widget at start (with fold toggle if foldable and has content)
                    const showFoldable = isFoldable && hasContentLines;
                    decos.push({
                        from: line.from,
                        to: line.from,
                        deco: Decoration.widget({
                            widget: new CalloutIconWidget(
                                typeInfo.icon,
                                displayTitle,
                                styleType,
                                showFoldable,
                                isFolded,
                                lineNum
                            ),
                            side: -1,
                        }),
                        sortKey: 1,
                    });

                    // Hide the syntax part
                    decos.push({
                        from: line.from,
                        to: line.from + syntaxPart.length,
                        deco: hiddenSyntax,
                        sortKey: 2,
                    });

                    // If there's a title, hide it too
                    if (title) {
                        const titleStart = line.from + syntaxPart.length;
                        decos.push({
                            from: titleStart,
                            to: line.to,
                            deco: hiddenSyntax,
                            sortKey: 3,
                        });
                    }

                    // Hide "> " prefix on content lines (only if not folded)
                    if (!isFolded) {
                        for (let i = lineNum + 1; i <= endLine; i++) {
                            const contentLine = doc.line(i);
                            const prefixMatch = contentLine.text.match(/^>\s?/);
                            if (prefixMatch) {
                                decos.push({
                                    from: contentLine.from,
                                    to: contentLine.from + prefixMatch[0].length,
                                    deco: hiddenPrefix,
                                    sortKey: 2,
                                });
                            }
                        }
                    }
                }

                lineNum = endLine;
            }
        }
    }

    // Sort by position, then by sortKey
    decos.sort((a, b) => a.from - b.from || a.to - b.to || a.sortKey - b.sortKey);

    const builder = new RangeSetBuilder<Decoration>();
    for (const { from, to, deco } of decos) {
        builder.add(from, to, deco);
    }
    return builder.finish();
}

const calloutPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;
        lastCursorLine: number;

        constructor(view: EditorView) {
            this.decorations = buildDecorations(view);
            this.lastCursorLine = view.state.doc.lineAt(view.state.selection.main.head).number;
        }

        update(update: ViewUpdate) {
            // Always rebuild on doc changes, viewport changes, or fold state changes
            const hasFoldEffect = update.transactions.some(tr =>
                tr.effects.some(e => e.is(toggleFoldEffect))
            );

            if (update.docChanged || update.viewportChanged || hasFoldEffect) {
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
        decorations: v => v.decorations,
    }
);

const calloutTheme = EditorView.baseTheme({
    '.cm-callout-line': {
        backgroundColor: 'var(--callout-info-bg)',
        borderLeft: '4px solid var(--callout-info-border)',
        paddingLeft: '12px',
    },
    // Hidden content lines when folded
    '.cm-callout-hidden-line': {
        display: 'none !important',
    },
    // Fold toggle button
    '.cm-callout-fold-toggle': {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '16px',
        height: '16px',
        cursor: 'pointer',
        borderRadius: '3px',
        transition: 'background-color 0.15s ease, transform 0.15s ease',
        marginLeft: '6px',
        flexShrink: '0',
    },
    '.cm-callout-fold-toggle:hover': {
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
    },
    '.cm-callout-fold-toggle svg': {
        width: '12px',
        height: '12px',
    },
    // Header widget
    '.cm-callout-header-widget': {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        fontWeight: '600',
        verticalAlign: 'middle',
        lineHeight: '1',
        marginTop: '-2px', // Slight visual correction for vertical optical alignment
    },
    '.cm-callout-icon': {
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '18px',
        height: '18px',
    },
    '.cm-callout-icon svg': {
        width: '100%',
        height: '100%',
    },
    '.cm-callout-title': {
        fontSize: '1em',
    },
    '.cm-callout-header-info': { color: '#1e40af' },
    '.cm-callout-header-warning': { color: '#92400e' },
    '.cm-callout-header-danger': { color: '#991b1b' },
    '.cm-callout-header-success': { color: '#166534' },
    '.cm-callout-header-tip': { color: '#115e59' },
    '.cm-callout-header-note': { color: '#4338ca' },
    // Type colors
    '.cm-callout-info': {
        backgroundColor: 'var(--callout-info-bg) !important',
        borderLeftColor: 'var(--callout-info-border) !important',
    },
    '.cm-callout-warning': {
        backgroundColor: 'var(--callout-warning-bg) !important',
        borderLeftColor: 'var(--callout-warning-border) !important',
    },
    '.cm-callout-danger': {
        backgroundColor: 'var(--callout-danger-bg) !important',
        borderLeftColor: 'var(--callout-danger-border) !important',
    },
    '.cm-callout-success': {
        backgroundColor: 'var(--callout-success-bg) !important',
        borderLeftColor: 'var(--callout-success-border) !important',
    },
    '.cm-callout-tip': {
        backgroundColor: 'var(--callout-tip-bg) !important',
        borderLeftColor: 'var(--callout-tip-border) !important',
    },
    '.cm-callout-note': {
        backgroundColor: 'var(--callout-note-bg) !important',
        borderLeftColor: 'var(--callout-note-border) !important',
    },
    '.cm-callout-question': {
        backgroundColor: 'var(--callout-question-bg) !important',
        borderLeftColor: 'var(--callout-question-border) !important',
    },
    '.cm-callout-quote': {
        backgroundColor: 'var(--callout-quote-bg) !important',
        borderLeftColor: 'var(--callout-quote-border) !important',
        fontStyle: 'italic',
    },
    '.cm-callout-example': {
        backgroundColor: 'var(--callout-example-bg) !important',
        borderLeftColor: 'var(--callout-example-border) !important',
    },
    '.cm-callout-bug': {
        backgroundColor: 'var(--callout-bug-bg) !important',
        borderLeftColor: 'var(--callout-bug-border) !important',
    },
});

/**
 * Event delegation handler for callout fold toggles
 * Single listener at editor level prevents memory leaks from per-widget listeners
 */
const calloutClickHandler = EditorView.domEventHandlers({
    mousedown(event, view) {
        const target = event.target as HTMLElement;
        const foldToggle = target.closest('.cm-callout-fold-toggle') as HTMLElement | null;

        if (foldToggle && foldToggle.dataset.calloutLine) {
            event.preventDefault();
            event.stopPropagation();
            const lineNumber = parseInt(foldToggle.dataset.calloutLine, 10);
            if (!isNaN(lineNumber)) {
                view.dispatch({
                    effects: toggleFoldEffect.of({ line: lineNumber })
                });
            }
            return true;
        }
        return false;
    }
});

export function calloutExtension(): Extension {
    return [foldState, calloutPlugin, calloutTheme, calloutClickHandler];
}

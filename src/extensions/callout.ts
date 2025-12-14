/**
 * Callout extension for Obsidian-style admonitions
 * Syntax: > [!type] Title
 * Supports: info, warning, danger, success, tip, note, question, quote, example, bug
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

/**
 * Callout types with their icons and default titles
 */
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
    // Aliases
    important: { icon: '🔥', defaultTitle: 'Important' },
    caution: { icon: '⚠️', defaultTitle: 'Caution' },
    abstract: { icon: '📄', defaultTitle: 'Abstract' },
    summary: { icon: '📄', defaultTitle: 'Summary' },
    tldr: { icon: '📄', defaultTitle: 'TL;DR' },
    todo: { icon: '☑️', defaultTitle: 'Todo' },
    hint: { icon: '💡', defaultTitle: 'Hint' },
    check: { icon: '✅', defaultTitle: 'Check' },
    done: { icon: '✅', defaultTitle: 'Done' },
    help: { icon: '❓', defaultTitle: 'Help' },
    faq: { icon: '❓', defaultTitle: 'FAQ' },
    attention: { icon: '⚠️', defaultTitle: 'Attention' },
    failure: { icon: '❌', defaultTitle: 'Failure' },
    fail: { icon: '❌', defaultTitle: 'Fail' },
    missing: { icon: '❌', defaultTitle: 'Missing' },
    error: { icon: '🚨', defaultTitle: 'Error' },
    cite: { icon: '💬', defaultTitle: 'Cite' },
};

/**
 * Regex to match callout header: > [!type] Title or > [!type]+ Title (foldable)
 */
const CALLOUT_HEADER_REGEX = /^>\s*\[!(\w+)\]([+-])?\s*(.*)?$/;

/**
 * Check if a type maps to a base callout type for styling
 */
function getCalloutStyleType(type: string): string {
    const lowerType = type.toLowerCase();

    // Map aliases to base types for styling
    const styleMap: Record<string, string> = {
        important: 'warning',
        caution: 'warning',
        attention: 'warning',
        abstract: 'info',
        summary: 'info',
        tldr: 'info',
        todo: 'info',
        hint: 'tip',
        check: 'success',
        done: 'success',
        help: 'info',
        faq: 'info',
        failure: 'danger',
        fail: 'danger',
        missing: 'danger',
        error: 'danger',
        cite: 'info',
    };

    return styleMap[lowerType] || lowerType;
}

/**
 * Parsed callout data
 */
interface CalloutBlock {
    type: string;
    styleType: string;
    title: string;
    icon: string;
    foldable: boolean;
    folded: boolean;
    headerFrom: number;
    headerTo: number;
    contentFrom: number;
    contentTo: number;
}

/**
 * Find all callout blocks in the visible ranges
 */
function findCallouts(view: EditorView): CalloutBlock[] {
    const callouts: CalloutBlock[] = [];
    const doc = view.state.doc;

    for (let lineNum = 1; lineNum <= doc.lines; lineNum++) {
        const line = doc.line(lineNum);
        const match = line.text.match(CALLOUT_HEADER_REGEX);

        if (match) {
            const type = match[1].toLowerCase();
            const foldIndicator = match[2];
            const title = match[3]?.trim() || '';
            const typeInfo = CALLOUT_TYPES[type] || { icon: '📌', defaultTitle: type };

            // Find the extent of the callout (consecutive > lines)
            let contentTo = line.to;
            for (let nextLine = lineNum + 1; nextLine <= doc.lines; nextLine++) {
                const nextLineObj = doc.line(nextLine);
                if (nextLineObj.text.startsWith('>')) {
                    contentTo = nextLineObj.to;
                } else {
                    break;
                }
            }

            callouts.push({
                type,
                styleType: getCalloutStyleType(type),
                title: title || typeInfo.defaultTitle,
                icon: typeInfo.icon,
                foldable: foldIndicator === '+' || foldIndicator === '-',
                folded: foldIndicator === '-',
                headerFrom: line.from,
                headerTo: line.to,
                contentFrom: line.to + 1,
                contentTo,
            });
        }
    }

    return callouts;
}

/**
 * Callout header widget
 */
class CalloutHeaderWidget extends WidgetType {
    constructor(private callout: CalloutBlock) {
        super();
    }

    toDOM(): HTMLElement {
        const header = document.createElement('div');
        header.className = `cm-callout-header cm-callout-${this.callout.styleType}`;

        const icon = document.createElement('span');
        icon.className = 'cm-callout-icon';
        icon.textContent = this.callout.icon;

        const title = document.createElement('span');
        title.className = 'cm-callout-title';
        title.textContent = this.callout.title;

        header.appendChild(icon);
        header.appendChild(title);

        if (this.callout.foldable) {
            const foldIndicator = document.createElement('span');
            foldIndicator.className = 'cm-callout-fold';
            foldIndicator.textContent = this.callout.folded ? '▶' : '▼';
            header.appendChild(foldIndicator);
        }

        return header;
    }

    eq(other: CalloutHeaderWidget): boolean {
        return (
            this.callout.type === other.callout.type &&
            this.callout.title === other.callout.title &&
            this.callout.folded === other.callout.folded
        );
    }
}

/**
 * Build callout decorations
 */
function buildCalloutDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const doc = view.state.doc;
    const cursorLine = doc.lineAt(view.state.selection.main.head).number;
    const callouts = findCallouts(view);

    for (const callout of callouts) {
        const headerLineNum = doc.lineAt(callout.headerFrom).number;
        const isOnCallout = cursorLine >= headerLineNum &&
            cursorLine <= doc.lineAt(callout.contentTo).number;

        if (!isOnCallout) {
            // Apply callout block styling
            builder.add(
                callout.headerFrom,
                callout.contentTo,
                Decoration.mark({ class: `cm-callout cm-callout-${callout.styleType}` })
            );
        } else {
            // Still apply background styling but show raw syntax
            builder.add(
                callout.headerFrom,
                callout.contentTo,
                Decoration.mark({ class: `cm-callout-active cm-callout-${callout.styleType}` })
            );
        }
    }

    return builder.finish();
}

/**
 * View plugin for callout decorations
 */
const calloutPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;

        constructor(view: EditorView) {
            this.decorations = buildCalloutDecorations(view);
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged || update.selectionSet) {
                this.decorations = buildCalloutDecorations(update.view);
            }
        }
    },
    {
        decorations: (v) => v.decorations,
    }
);

/**
 * Callout theme styles
 */
const calloutTheme = EditorView.baseTheme({
    '.cm-callout-active': {
        borderRadius: '4px',
        padding: '2px 4px',
        marginLeft: '-4px',
    },
    '.cm-callout-header': {
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontWeight: '600',
        marginBottom: '4px',
    },
    '.cm-callout-icon': {
        fontSize: '1.1em',
    },
    '.cm-callout-fold': {
        marginLeft: 'auto',
        opacity: '0.6',
        cursor: 'pointer',
    },
});

/**
 * Callout extension for Obsidian-style admonitions
 */
export function calloutExtension(): Extension {
    return [calloutPlugin, calloutTheme];
}

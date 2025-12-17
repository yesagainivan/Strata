/**
 * Wikilink extension for [[note]] and [[note|alias]] syntax
 * Supports: [[note]], [[note|alias]], [[note#heading]], [[note#^block]]
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
import { modeField } from '../core/mode';

/**
 * Configuration for the wikilink extension
 */
export interface WikilinkConfig {
    /** Callback when a wikilink is clicked */
    onClick?: (target: string, alias: string | undefined, event: MouseEvent) => void;
    /**
     * Interaction mode for wikilinks
     * - 'modifier': Require Cmd/Ctrl + Click to trigger (default)
     * - 'click': Trigger on simple Click (prevents editing cursor placement)
     */
    triggerOn?: 'click' | 'modifier';
}

/**
 * Regex to match wikilinks: [[target]] or [[target|alias]]
 * Also matches [[target#heading]] and [[target#^block]]
 */
const WIKILINK_REGEX = /(?<!!)\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g;

/**
 * Parse a wikilink match into its components
 */
interface WikilinkMatch {
    full: string;
    target: string;
    heading?: string;
    alias?: string;
    from: number;
    to: number;
}

function parseWikilinks(text: string, offset: number): WikilinkMatch[] {
    const matches: WikilinkMatch[] = [];
    let match;

    while ((match = WIKILINK_REGEX.exec(text)) !== null) {
        matches.push({
            full: match[0],
            target: match[1],
            heading: match[2],
            alias: match[3],
            from: offset + match.index,
            to: offset + match.index + match[0].length,
        });
    }

    return matches;
}

/**
 * Wikilink widget for rendering clickable links
 * Uses data attributes for event delegation (no inline listeners)
 */
class WikilinkWidget extends WidgetType {
    constructor(private match: WikilinkMatch) {
        super();
    }

    toDOM(): HTMLElement {
        const span = document.createElement('span');
        span.className = 'cm-wikilink';
        span.textContent = this.match.alias || this.match.target;

        // Store data for event delegation
        span.dataset.wikilinkTarget = this.match.target;
        if (this.match.alias) {
            span.dataset.wikilinkAlias = this.match.alias;
        }

        if (this.match.heading) {
            span.title = `${this.match.target}#${this.match.heading}`;
        } else {
            span.title = this.match.target;
        }

        return span;
    }

    eq(other: WikilinkWidget): boolean {
        return (
            this.match.full === other.match.full &&
            this.match.from === other.match.from
        );
    }

    ignoreEvent(event: Event): boolean {
        // We must return false to let the event bubble up to the editor's
        // domEventHandlers. We'll handle the prevention of default behavior
        // (cursor move) in the mousedown handler itself.
        return false;
    }
}

/**
 * Decoration for styling wikilinks inline (when cursor is on the line)
 */
const wikilinkMark = Decoration.mark({ class: 'cm-wikilink-source' });


/**
 * Build decorations for wikilinks
 */
function buildWikilinkDecorations(view: EditorView): DecorationSet {
    // Efficient O(1) mode check at the start
    const mode = view.state.field(modeField);

    // In source mode, return empty decorations (show raw markdown)
    if (mode === 'source') {
        return Decoration.none;
    }

    const builder = new RangeSetBuilder<Decoration>();
    const doc = view.state.doc;
    // In read mode, use -1 so no line is ever "active" (always show rendered wikilinks)
    const cursorLine = mode === 'read'
        ? -1
        : doc.lineAt(view.state.selection.main.head).number;

    // Pre-collect code ranges once (O(n) instead of O(n²))
    const codeRanges = collectCodeRanges(view);

    for (const { from, to } of view.visibleRanges) {
        const text = doc.sliceString(from, to);
        const matches = parseWikilinks(text, from);

        for (const match of matches) {
            // Simple range check instead of tree iteration per match
            if (isInsideCode(match.from, match.to, codeRanges)) continue;

            const matchLine = doc.lineAt(match.from).number;
            const isActiveLine = matchLine === cursorLine;

            if (isActiveLine) {
                // On active line, show the raw syntax with styling
                builder.add(match.from, match.to, wikilinkMark);
            } else {
                // On other lines, replace with a clickable widget
                builder.add(
                    match.from,
                    match.to,
                    Decoration.replace({
                        widget: new WikilinkWidget(match),
                    })
                );
            }
        }
    }

    return builder.finish();
}

/**
 * View plugin for wikilink decorations
 */
const wikilinkPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;
        lastCursorLine: number;

        constructor(view: EditorView) {
            this.decorations = buildWikilinkDecorations(view);
            this.lastCursorLine = view.state.doc.lineAt(view.state.selection.main.head).number;
        }

        update(update: ViewUpdate) {
            // Check if mode changed
            const prevMode = update.startState.field(modeField, false);
            const currMode = update.state.field(modeField, false);
            const modeChanged = prevMode !== currMode;

            if (update.docChanged || update.viewportChanged || modeChanged) {
                this.decorations = buildWikilinkDecorations(update.view);
                this.lastCursorLine = update.view.state.doc.lineAt(
                    update.view.state.selection.main.head
                ).number;
            } else if (update.selectionSet) {
                // Only rebuild if cursor moved to a different line
                const newLine = update.view.state.doc.lineAt(
                    update.view.state.selection.main.head
                ).number;
                if (newLine !== this.lastCursorLine) {
                    this.decorations = buildWikilinkDecorations(update.view);
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
 * Event handler for wikilink clicks
 */
function createWikilinkClickHandler(
    onClick?: (target: string, alias: string | undefined, event: MouseEvent) => void,
    triggerOn: 'click' | 'modifier' = 'modifier'
): Extension {
    if (!onClick) return [];

    return EditorView.domEventHandlers({
        mousedown(event, _view) {
            const target = event.target as HTMLElement;
            const wikilink = target.closest('.cm-wikilink') as HTMLElement | null;

            if (wikilink && wikilink.dataset.wikilinkTarget) {
                const isModifier = event.metaKey || event.ctrlKey;
                const shouldTrigger = triggerOn === 'click' || (triggerOn === 'modifier' && isModifier);

                if (shouldTrigger) {
                    event.preventDefault(); // Stop cursor move / widget destruction
                    event.stopPropagation();
                    onClick(wikilink.dataset.wikilinkTarget, wikilink.dataset.wikilinkAlias, event);
                    return true;
                }
            }
            return false;
        }
    });
}

/**
 * Add wikilink source styling to theme
 */
const wikilinkTheme = EditorView.baseTheme({
    '.cm-wikilink-source': {
        color: 'var(--wikilink-color)',
        fontFamily: 'inherit',
    },
});

/**
 * Wikilink extension for Obsidian-style [[links]]
 */
export function wikilinkExtension(config: WikilinkConfig = {}): Extension {
    return [wikilinkPlugin, wikilinkTheme, createWikilinkClickHandler(config.onClick, config.triggerOn)];
}

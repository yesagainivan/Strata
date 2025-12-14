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

/**
 * Configuration for the wikilink extension
 */
export interface WikilinkConfig {
    /** Callback when a wikilink is clicked */
    onClick?: (target: string, alias?: string) => void;
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
 */
class WikilinkWidget extends WidgetType {
    constructor(
        private match: WikilinkMatch,
        private onClick?: (target: string, alias?: string) => void
    ) {
        super();
    }

    toDOM(): HTMLElement {
        const span = document.createElement('span');
        span.className = 'cm-wikilink';
        span.textContent = this.match.alias || this.match.target;

        if (this.match.heading) {
            span.title = `${this.match.target}#${this.match.heading}`;
        } else {
            span.title = this.match.target;
        }

        span.addEventListener('click', (e) => {
            e.preventDefault();
            this.onClick?.(this.match.target, this.match.alias);
        });

        return span;
    }

    eq(other: WikilinkWidget): boolean {
        return (
            this.match.full === other.match.full &&
            this.match.from === other.match.from
        );
    }

    ignoreEvent(): boolean {
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
function buildWikilinkDecorations(
    view: EditorView,
    onClick?: (target: string, alias?: string) => void
): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const doc = view.state.doc;
    const cursorLine = doc.lineAt(view.state.selection.main.head).number;

    for (const { from, to } of view.visibleRanges) {
        const text = doc.sliceString(from, to);
        const matches = parseWikilinks(text, from);

        for (const match of matches) {
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
                        widget: new WikilinkWidget(match, onClick),
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
function createWikilinkPlugin(config: WikilinkConfig) {
    return ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;

            constructor(view: EditorView) {
                this.decorations = buildWikilinkDecorations(view, config.onClick);
            }

            update(update: ViewUpdate) {
                if (update.docChanged || update.viewportChanged || update.selectionSet) {
                    this.decorations = buildWikilinkDecorations(update.view, config.onClick);
                }
            }
        },
        {
            decorations: (v) => v.decorations,
        }
    );
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
    return [createWikilinkPlugin(config), wikilinkTheme];
}

/**
 * User Extension API
 * Simple API for users to create custom syntax extensions
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
import { collectCodeRanges, isInsideCode } from '../extensions/utils';

/**
 * Configuration for a custom markdown extension
 */
export interface CustomExtensionConfig {
    /** Unique name for this extension */
    name: string;
    /** Regex pattern to match in the document */
    pattern: RegExp;
    /** CSS class to apply to matched text */
    className?: string;
    /** Custom widget to render instead of the matched text */
    widget?: (match: RegExpMatchArray, from: number, to: number) => HTMLElement;
    /** Click handler for the matched element */
    onClick?: (match: RegExpMatchArray, event: MouseEvent) => void;
    /** Whether to hide the raw syntax when cursor is not on the line */
    hideOnInactive?: boolean;
}

/**
 * Widget wrapper for user-defined widgets
 */
class CustomWidget extends WidgetType {
    constructor(
        private element: HTMLElement,
        private id: string
    ) {
        super();
    }

    toDOM(): HTMLElement {
        return this.element.cloneNode(true) as HTMLElement;
    }

    eq(other: CustomWidget): boolean {
        return this.id === other.id;
    }
}

/**
 * Find all matches for a pattern in text
 */
function findMatches(
    pattern: RegExp,
    text: string,
    offset: number
): Array<{ match: RegExpMatchArray; from: number; to: number }> {
    const results: Array<{ match: RegExpMatchArray; from: number; to: number }> = [];

    // Clone regex to avoid issues with global flag
    const regex = new RegExp(pattern.source, pattern.flags.includes('g') ? pattern.flags : pattern.flags + 'g');

    let match;
    while ((match = regex.exec(text)) !== null) {
        results.push({
            match,
            from: offset + match.index,
            to: offset + match.index + match[0].length,
        });
    }

    return results;
}

/**
 * Build decorations for a custom extension
 */
function buildCustomDecorations(
    view: EditorView,
    config: CustomExtensionConfig
): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const doc = view.state.doc;
    const cursorLine = doc.lineAt(view.state.selection.main.head).number;

    // Pre-collect code ranges once (O(n) instead of O(n²))
    const codeRanges = collectCodeRanges(view);

    for (const { from, to } of view.visibleRanges) {
        const text = doc.sliceString(from, to);
        const matches = findMatches(config.pattern, text, from);

        for (const { match, from: matchFrom, to: matchTo } of matches) {
            // Simple range check instead of tree iteration per match
            if (isInsideCode(matchFrom, matchTo, codeRanges)) continue;

            const matchLine = doc.lineAt(matchFrom).number;
            const isActiveLine = matchLine === cursorLine;

            // If hideOnInactive is true and cursor is not on line, use widget/replace decoration
            if (config.hideOnInactive && !isActiveLine && config.widget) {
                const element = config.widget(match, matchFrom, matchTo);
                element.className = `${element.className || ''} ${config.className || ''}`.trim();

                builder.add(
                    matchFrom,
                    matchTo,
                    Decoration.replace({
                        widget: new CustomWidget(element, `${config.name}-${matchFrom}`),
                    })
                );
            } else if (config.className) {
                // Apply mark decoration with class
                builder.add(
                    matchFrom,
                    matchTo,
                    Decoration.mark({ class: config.className })
                );
            }
        }
    }

    return builder.finish();
}

/**
 * Create a custom view plugin for an extension
 */
function createCustomPlugin(config: CustomExtensionConfig) {
    return ViewPlugin.fromClass(
        class {
            decorations: DecorationSet;

            constructor(view: EditorView) {
                this.decorations = buildCustomDecorations(view, config);
            }

            update(update: ViewUpdate) {
                if (update.docChanged || update.viewportChanged || update.selectionSet) {
                    this.decorations = buildCustomDecorations(update.view, config);
                }
            }
        },
        {
            decorations: (v) => v.decorations,
        }
    );
}

/**
 * Create click handler for custom extension
 */
function createCustomClickHandler(config: CustomExtensionConfig): Extension {
    if (!config.onClick) return [];

    return EditorView.domEventHandlers({
        click(event, view) {
            const target = event.target as HTMLElement;
            const className = config.className;

            if (className && (target.classList.contains(className) || target.closest(`.${className}`))) {
                const pos = view.posAtDOM(target);
                const doc = view.state.doc;

                // Find visible ranges and search for match at position
                for (const { from, to } of view.visibleRanges) {
                    const text = doc.sliceString(from, to);
                    const matches = findMatches(config.pattern, text, from);

                    for (const { match, from: matchFrom, to: matchTo } of matches) {
                        if (pos >= matchFrom && pos <= matchTo) {
                            config.onClick?.(match, event);
                            event.preventDefault();
                            return true;
                        }
                    }
                }
            }
            return false;
        },
    });
}

/**
 * Create a CodeMirror 6 extension from a custom extension config
 * 
 * @example
 * ```ts
 * // Create a @mention extension
 * const mentions = createExtension({
 *   name: 'mention',
 *   pattern: /@(\w+)/g,
 *   className: 'cm-mention',
 *   onClick: (match) => console.log('Clicked user:', match[1]),
 * });
 * 
 * // Use in editor
 * <MarkdownEditor extensions={[mentions]} />
 * ```
 */
export function createExtension(config: CustomExtensionConfig): Extension {
    return [
        createCustomPlugin(config),
        createCustomClickHandler(config),
    ];
}

/**
 * Create multiple extensions at once
 */
export function createExtensions(configs: CustomExtensionConfig[]): Extension[] {
    return configs.map(createExtension);
}

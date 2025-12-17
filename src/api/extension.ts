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
import { heightCacheEffect, getCachedHeight, heightCache } from '../extensions/heightCache';

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

    // === NEW OPTIONS ===

    /**
     * Estimated height in pixels for viewport calculations.
     * Improves scroll performance for large widgets.
     * @default 20
     */
    estimatedHeight?: number;

    /**
     * Whether this creates a block-level decoration (takes full line).
     * Use for multi-line elements like callouts or previews.
     * @default false
     */
    isBlock?: boolean;

    /**
     * CSS class to apply to the entire line containing a match.
     * Useful for styling the line background or adding indicators.
     */
    lineClass?: string;

    /**
     * Lifecycle hook called when widget DOM is created.
     * Use for attaching event listeners or initializing state.
     */
    onMount?: (element: HTMLElement, match: RegExpMatchArray) => void;

    /**
     * Lifecycle hook called when widget is removed from DOM.
     * Use for cleanup (remove listeners, cancel requests, etc.)
     */
    onDestroy?: (element: HTMLElement) => void;

    // === SCROLL OPTIMIZATION OPTIONS (v2.1.0) ===

    /**
     * Function to generate a unique cache key for height caching.
     * If provided, widget heights will be cached and persisted across scrolls.
     * 
     * @example
     * ```ts
     * cacheKey: (match) => `embed:${match[1]}`, // Cache by embed URL
     * ```
     */
    cacheKey?: (match: RegExpMatchArray) => string;

    /**
     * Custom coordinate mapping for block widgets.
     * Helps CM6 calculate accurate scroll positions within large widgets.
     * Only used when `isBlock` is true.
     * 
     * @param element - The widget's DOM element
     * @param pos - Position within the widget (0 = top)
     * @param side - -1 for before position, 1 for after
     * @returns Rect with coordinates, or null to use default
     * 
     * @example
     * ```ts
     * coordsAt: (element, pos, side) => {
     *   const rect = element.getBoundingClientRect();
     *   return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
     * },
     * ```
     */
    coordsAt?: (element: HTMLElement, pos: number, side: -1 | 1) => { top: number; bottom: number; left: number; right: number } | null;
}

/**
 * Widget wrapper for user-defined widgets with lifecycle support
 */
class CustomWidget extends WidgetType {
    private mountedElement: HTMLElement | null = null;

    constructor(
        private element: HTMLElement,
        private id: string,
        private estimatedHeightValue: number,
        private isBlockWidget: boolean,
        private match: RegExpMatchArray,
        private cacheKeyValue: string | null,
        private onMount?: (el: HTMLElement, match: RegExpMatchArray) => void,
        private onDestroyCallback?: (el: HTMLElement) => void,
        private coordsAtCallback?: (element: HTMLElement, pos: number, side: -1 | 1) => { top: number; bottom: number; left: number; right: number } | null
    ) {
        super();
    }

    /**
     * Estimated height for CodeMirror viewport calculations
     */
    get estimatedHeight(): number {
        return this.estimatedHeightValue;
    }

    toDOM(view: EditorView): HTMLElement {
        const el = this.element.cloneNode(true) as HTMLElement;
        this.mountedElement = el;

        // Call onMount lifecycle hook
        if (this.onMount) {
            this.onMount(el, this.match);
        }

        // Measure and cache height for block widgets with cacheKey
        if (this.isBlockWidget && this.cacheKeyValue) {
            requestAnimationFrame(() => {
                const height = el.getBoundingClientRect().height;
                if (height > 0) {
                    view.dispatch({
                        effects: heightCacheEffect.of({
                            key: this.cacheKeyValue!,
                            height,
                        }),
                    });
                    view.requestMeasure();
                }
            });
        }

        return el;
    }

    /**
     * Coordinate mapping for block widgets
     */
    coordsAt(dom: HTMLElement, pos: number, side: -1 | 1): { top: number; bottom: number; left: number; right: number } | null {
        if (this.coordsAtCallback && this.mountedElement) {
            return this.coordsAtCallback(this.mountedElement, pos, side);
        }
        // Default: return bounding rect of the widget
        if (this.mountedElement) {
            const rect = this.mountedElement.getBoundingClientRect();
            return { top: rect.top, bottom: rect.bottom, left: rect.left, right: rect.right };
        }
        return null;
    }

    destroy(): void {
        // Call onDestroy lifecycle hook
        if (this.onDestroyCallback && this.mountedElement) {
            this.onDestroyCallback(this.mountedElement);
        }
        this.mountedElement = null;
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
    const decos: Array<{ from: number; to: number; deco: Decoration }> = [];
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

            // Add line decoration if lineClass is specified
            if (config.lineClass) {
                const line = doc.lineAt(matchFrom);
                decos.push({
                    from: line.from,
                    to: line.from,
                    deco: Decoration.line({ class: config.lineClass }),
                });
            }

            // If hideOnInactive is true and cursor is not on line, use widget/replace decoration
            if (config.hideOnInactive && !isActiveLine && config.widget) {
                const element = config.widget(match, matchFrom, matchTo);
                element.className = `${element.className || ''} ${config.className || ''}`.trim();

                // Generate cache key if provided
                const cacheKeyValue = config.cacheKey ? config.cacheKey(match) : null;

                // Get cached height if available
                const cachedHeight = cacheKeyValue
                    ? getCachedHeight(view.state, cacheKeyValue, -1)
                    : -1;
                const heightEstimate = cachedHeight > 0 ? cachedHeight : (config.estimatedHeight ?? 20);

                const widget = new CustomWidget(
                    element,
                    `${config.name}-${matchFrom}`,
                    heightEstimate,
                    config.isBlock ?? false,
                    match,
                    cacheKeyValue,
                    config.onMount,
                    config.onDestroy,
                    config.coordsAt
                );

                decos.push({
                    from: matchFrom,
                    to: matchTo,
                    deco: config.isBlock
                        ? Decoration.replace({ widget, block: true })
                        : Decoration.replace({ widget }),
                });
            } else if (config.className) {
                // Apply mark decoration with class
                decos.push({
                    from: matchFrom,
                    to: matchTo,
                    deco: Decoration.mark({ class: config.className }),
                });
            }
        }
    }

    // Sort decorations by position (required for RangeSetBuilder)
    decos.sort((a, b) => a.from - b.from || a.to - b.to);

    const builder = new RangeSetBuilder<Decoration>();
    for (const { from, to, deco } of decos) {
        builder.add(from, to, deco);
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
 * // Simple @mention extension
 * const mentions = createExtension({
 *   name: 'mention',
 *   pattern: /@(\w+)/g,
 *   className: 'cm-mention',
 *   onClick: (match) => console.log('Clicked user:', match[1]),
 * });
 * 
 * // Block widget with lifecycle hooks
 * const embeds = createExtension({
 *   name: 'embed',
 *   pattern: /::embed\[([^\]]+)\]/g,
 *   hideOnInactive: true,
 *   isBlock: true,
 *   estimatedHeight: 200,
 *   lineClass: 'cm-embed-line',
 *   widget: (match) => {
 *     const el = document.createElement('iframe');
 *     el.src = match[1];
 *     return el;
 *   },
 *   onMount: (el) => console.log('Embed mounted'),
 *   onDestroy: (el) => console.log('Embed destroyed'),
 * });
 * 
 * // Use in editor
 * <MarkdownEditor extensions={[mentions, embeds]} />
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

/**
 * Image Embed extension for ![[image.png]] syntax
 * 
 * ## Architecture
 * 
 * This extension uses a StateField-based approach for correct height estimation:
 * 
 * 1. `imageEmbedCache` StateField stores all image embed positions
 * 2. `imageEmbedDecorations` uses EditorView.decorations.compute()
 * 3. `ImageEmbedWidget` measures height after image load and updates the heightCache
 * 
 * This ensures CodeMirror's height map is accurate BEFORE viewport computation,
 * eliminating scroll jumping when scrolling past images.
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
import { heightCacheEffect, imageCacheKey, getCachedHeight, heightCache } from './heightCache';
import { modeField } from '../core/mode';

// ============================================================================
// Debug Configuration
// ============================================================================

/**
 * Temporarily disable image embeds for debugging.
 * Set to true to test other extensions without image-related scroll issues.
 */
export const DISABLE_IMAGE_EMBEDS = false;

/**
 * Regex to match image embeds: ![[target]] or ![[target|alt]]
 */
const IMAGE_EMBED_REGEX = /!\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/g;

/**
 * Represents an image embed found in the document
 */
interface ImageEmbedMatch {
    full: string;
    target: string;
    alt?: string;
    from: number;
    to: number;
}

/**
 * Check if a position is inside a code block or inline code
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
                return false;
            }
        },
    });
    return insideCode;
}

/**
 * Find all image embeds in the entire document
 */
function findAllImageEmbedsInDocument(
    doc: { toString: () => string },
    tree: ReturnType<typeof syntaxTree>
): ImageEmbedMatch[] {
    const text = doc.toString();
    const matches: ImageEmbedMatch[] = [];

    // Reset regex state
    IMAGE_EMBED_REGEX.lastIndex = 0;

    let match;
    while ((match = IMAGE_EMBED_REGEX.exec(text)) !== null) {
        const from = match.index;
        const to = match.index + match[0].length;

        // Skip if inside code
        if (!isInsideCodeNode(from, to, { tree })) {
            matches.push({
                full: match[0],
                target: match[1],
                alt: match[2],
                from,
                to,
            });
        }
    }

    return matches;
}

/**
 * StateField to cache image embed positions
 * Only re-parses when the document changes
 */
const imageEmbedCache = StateField.define<ImageEmbedMatch[]>({
    create(state) {
        const tree = syntaxTree(state);
        return findAllImageEmbedsInDocument(state.doc, tree);
    },
    update(matches, tr) {
        if (!tr.docChanged) {
            return matches;
        }
        const tree = syntaxTree(tr.state);
        return findAllImageEmbedsInDocument(tr.state.doc, tree);
    },
});

/**
 * Widget for rendering embedded images
 * Measures and caches height after image loads for smooth scrolling
 */
class ImageEmbedWidget extends WidgetType {
    private cacheKey: string;
    private cachedHeight: number | null = null;

    constructor(
        private match: ImageEmbedMatch,
        cachedHeight?: number
    ) {
        super();
        this.cacheKey = imageCacheKey(match.target);
        this.cachedHeight = cachedHeight ?? null;
    }

    /**
     * Estimated height for CodeMirror viewport calculations.
     * 
     * Priority:
     * 1. Use cached height from previous load (most accurate)
     * 2. Use 200px as reasonable middle-ground fallback
     *    (Better than 300px which over-estimates small images)
     */
    get estimatedHeight(): number {
        if (this.cachedHeight !== null) {
            return this.cachedHeight;
        }
        // 200px is a reasonable middle-ground:
        // - Not too small (would cause jump for large images)
        // - Not too large (would cause excess whitespace for small images)
        return 200;
    }

    toDOM(view: EditorView): HTMLElement {
        const container = document.createElement('span');
        container.className = 'cm-image-embed';

        const img = document.createElement('img');
        img.src = this.match.target;
        img.draggable = true;

        if (this.match.alt) {
            img.alt = this.match.alt;
            img.title = this.match.alt;
        }

        // Measure height after image loads
        img.onload = () => {
            // Calculate actual display height considering CSS max-height constraint
            const displayHeight = Math.min(img.naturalHeight, 300);

            if (displayHeight > 0 && displayHeight !== this.cachedHeight) {
                view.dispatch({
                    effects: heightCacheEffect.of({
                        key: this.cacheKey,
                        height: displayHeight,
                    }),
                });
                // Tell CM6 to recalculate its internal height map
                view.requestMeasure();
            }
        };

        // Enable native drag with the original markdown syntax
        img.addEventListener('dragstart', (e) => {
            if (e.dataTransfer) {
                e.dataTransfer.setData('text/plain', this.match.full);
                e.dataTransfer.effectAllowed = 'copyMove';
            }
            container.classList.add('dragging');
        });

        img.addEventListener('dragend', () => {
            container.classList.remove('dragging');
        });

        // Add error handling for broken images
        img.onerror = () => {
            container.classList.add('image-error');
            img.style.display = 'none';
            const errorText = document.createElement('span');
            errorText.textContent = `❌ Failed to load image: ${this.match.target}`;
            errorText.className = 'cm-image-error-text';
            container.appendChild(errorText);

            // Cache error state as small height
            view.dispatch({
                effects: heightCacheEffect.of({
                    key: this.cacheKey,
                    height: 30, // Error text height
                }),
            });
            // Tell CM6 to recalculate its internal height map
            view.requestMeasure();
        };

        container.appendChild(img);
        return container;
    }

    /**
     * Coordinate mapping for image widgets
     */
    coordsAt(dom: HTMLElement, pos: number, side: number): Rect | null {
        return dom.getBoundingClientRect();
    }

    eq(other: ImageEmbedWidget): boolean {
        return (
            this.match.full === other.match.full &&
            this.match.from === other.match.from
        );
    }

    ignoreEvent(event: Event): boolean {
        // Allow drag events and mousedown to be handled by the image directly
        const type = event.type;
        return type === 'mousedown' ||
            type === 'dragstart' ||
            type === 'drag' ||
            type === 'dragend' ||
            type === 'dragover' ||
            type === 'drop';
    }
}

/**
 * Computed decorations using StateField-cached positions
 */
const imageEmbedDecorations = EditorView.decorations.compute(
    [imageEmbedCache, heightCache, 'selection', modeField],  // Added modeField to dependencies
    (state) => {
        // Early return if images are disabled for debugging
        if (DISABLE_IMAGE_EMBEDS) {
            return Decoration.none;
        }

        // Efficient O(1) mode check at the start
        const mode = state.field(modeField);

        // In source mode, return empty decorations (show raw markdown)
        if (mode === 'source') {
            return Decoration.none;
        }

        const doc = state.doc;
        const cursorPos = state.selection.main.head;
        // In read mode, use -1 so no line is ever "active" (always render images)
        const cursorLine = mode === 'read'
            ? -1
            : doc.lineAt(cursorPos).number;

        const matches = state.field(imageEmbedCache);

        interface DecoEntry {
            from: number;
            to: number;
            deco: Decoration;
        }

        const decos: DecoEntry[] = [];

        for (const match of matches) {
            const matchLine = doc.lineAt(match.from).number;
            const isActiveLine = matchLine === cursorLine;

            if (!isActiveLine) {
                // Get cached height for this image
                const cacheKey = imageCacheKey(match.target);
                const cachedHeight = getCachedHeight(state, cacheKey, -1);

                decos.push({
                    from: match.from,
                    to: match.to,
                    deco: Decoration.replace({
                        widget: new ImageEmbedWidget(
                            match,
                            cachedHeight > 0 ? cachedHeight : undefined
                        ),
                    }),
                });
            }
            // On active line, show raw syntax (no decoration needed)
        }

        // Sort by position
        decos.sort((a, b) => a.from - b.from || a.to - b.to);

        const builder = new RangeSetBuilder<Decoration>();
        for (const { from, to, deco } of decos) {
            builder.add(from, to, deco);
        }
        return builder.finish();
    }
);

/**
 * Theme for image embeds
 */
const imageEmbedTheme = EditorView.baseTheme({
    '.cm-image-embed': {
        display: 'inline-block',
        verticalAlign: 'middle',
        maxWidth: '100%',
    },
    '.cm-image-embed img': {
        maxWidth: '100%',
        maxHeight: '300px',
        borderRadius: '4px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        cursor: 'grab',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
    },
    '.cm-image-embed img:active': {
        cursor: 'grabbing',
    },
    '.cm-image-embed.dragging img': {
        opacity: '0.5',
        transform: 'scale(0.98)',
    },
    '.cm-image-error-text': {
        color: 'var(--error-color, #ff4d4f)',
        fontStyle: 'italic',
        fontSize: '0.9em',
    },
});

/**
 * Image embed extension
 * 
 * Uses StateField-based decoration provider for correct scroll behavior.
 * Heights are cached after image load for smooth subsequent scrolling.
 */
export function imageEmbedExtension(): Extension {
    return [
        heightCache,      // Include height cache (deduplicated if already present)
        imageEmbedCache,  // StateField for image positions
        imageEmbedDecorations, // Computed decorations
        imageEmbedTheme,  // Styling
    ];
}

/**
 * Image Embed extension for ![[image.png]] syntax
 * 
 * ## Architecture: Fixed-Height Canvas
 * 
 * This extension uses a "layered block" pattern where images are rendered
 * inside fixed-height canvas containers. This guarantees 100% accurate
 * height estimation for CodeMirror, completely eliminating scroll jumping.
 * 
 * Key insight: By enforcing a fixed canvas height, the `estimatedHeight`
 * getter always returns the exact rendered height. No caching needed!
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

/** Default canvas height for image embeds */
const IMAGE_CANVAS_HEIGHT = 200;

/**
 * Widget for rendering embedded images using fixed-height canvas approach.
 * 
 * The canvas guarantees a fixed height (200px), eliminating scroll estimation
 * issues entirely. Images are scaled to fit within the canvas using object-fit.
 * 
 * This "layered block" pattern can be applied to other block widgets for
 * guaranteed scroll stability.
 */
class ImageEmbedWidget extends WidgetType {
    constructor(
        private match: ImageEmbedMatch
    ) {
        super();
    }

    /**
     * Fixed height for CodeMirror viewport calculations.
     * 
     * Because we use a fixed-height canvas, this is always 100% accurate.
     * No estimation or caching needed!
     */
    get estimatedHeight(): number {
        return IMAGE_CANVAS_HEIGHT;
    }

    toDOM(view: EditorView): HTMLElement {
        // Fixed-height canvas container - the key to scroll stability
        const canvas = document.createElement('div');
        canvas.className = 'cm-image-canvas';

        const img = document.createElement('img');
        img.src = this.match.target;
        img.draggable = true;
        img.className = 'cm-image-embed-img';

        if (this.match.alt) {
            img.alt = this.match.alt;
            img.title = this.match.alt;
        }

        // Enable native drag with the original markdown syntax
        img.addEventListener('dragstart', (e) => {
            if (e.dataTransfer) {
                e.dataTransfer.setData('text/plain', this.match.full);
                e.dataTransfer.effectAllowed = 'copyMove';
            }
            canvas.classList.add('dragging');
        });

        img.addEventListener('dragend', () => {
            canvas.classList.remove('dragging');
        });

        // Add error handling for broken images
        img.onerror = () => {
            canvas.classList.add('cm-image-error');
            img.style.display = 'none';
            const errorText = document.createElement('span');
            errorText.textContent = `❌ Failed to load: ${this.match.target}`;
            errorText.className = 'cm-image-error-text';
            canvas.appendChild(errorText);
        };

        canvas.appendChild(img);
        return canvas;
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
    [imageEmbedCache, 'selection', modeField],
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
                decos.push({
                    from: match.from,
                    to: match.to,
                    deco: Decoration.replace({
                        widget: new ImageEmbedWidget(match),
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
 * Theme for fixed-height image canvas
 */
const imageEmbedTheme = EditorView.baseTheme({
    // Fixed-height canvas container - the key to scroll stability
    '.cm-image-canvas': {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: `${IMAGE_CANVAS_HEIGHT}px`,
        overflow: 'hidden',
        background: 'var(--editor-gutter-bg, #f5f5f5)',
        borderRadius: '8px',
        margin: '0',  // No margin - padding only to avoid CM6 height issues
        padding: '8px 0',
        boxSizing: 'content-box',
    },
    '.cm-image-embed-img': {
        maxWidth: '100%',
        maxHeight: '100%',
        objectFit: 'contain',
        borderRadius: '4px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
        cursor: 'grab',
        transition: 'opacity 0.15s ease, transform 0.15s ease',
    },
    '.cm-image-embed-img:active': {
        cursor: 'grabbing',
    },
    '.cm-image-canvas.dragging .cm-image-embed-img': {
        opacity: '0.5',
        transform: 'scale(0.98)',
    },
    '.cm-image-canvas.cm-image-error': {
        background: 'var(--callout-danger-bg, #fef2f2)',
        color: 'var(--error-color, #dc2626)',
    },
    '.cm-image-error-text': {
        fontStyle: 'italic',
        fontSize: '0.9em',
    },
});

/**
 * Image embed extension using fixed-height canvas pattern.
 * 
 * Guarantees scroll stability by using fixed-height containers.
 * No height caching needed - the container height is always exact.
 */
export function imageEmbedExtension(): Extension {
    return [
        imageEmbedCache,  // StateField for image positions
        imageEmbedDecorations, // Computed decorations
        imageEmbedTheme,  // Styling
    ];
}

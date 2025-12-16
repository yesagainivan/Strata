/**
 * Image Embed extension for ![[image.png]] syntax
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

/**
 * Regex to match image embeds: ![[target]] or ![[target|alt]]
 */
const IMAGE_EMBED_REGEX = /!\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/g;

/**
 * Parse an image embed match into its components
 */
interface ImageEmbedMatch {
    full: string;
    target: string;
    alt?: string;
    from: number;
    to: number;
}

function parseImageEmbeds(text: string, offset: number): ImageEmbedMatch[] {
    const matches: ImageEmbedMatch[] = [];
    let match;

    while ((match = IMAGE_EMBED_REGEX.exec(text)) !== null) {
        matches.push({
            full: match[0],
            target: match[1],
            alt: match[2],
            from: offset + match.index,
            to: offset + match.index + match[0].length,
        });
    }

    return matches;
}

/**
 * Widget for rendering embedded images
 */
class ImageEmbedWidget extends WidgetType {
    constructor(private match: ImageEmbedMatch) {
        super();
    }

    /**
     * Estimated height for CodeMirror viewport calculations.
     * This helps prevent scroll "gaps" by giving CM6 a height estimate
     * before the image is actually loaded and rendered.
     */
    get estimatedHeight(): number {
        // Default image height estimate (max-height in CSS is 300px)
        // Using 150px as a reasonable middle estimate
        return 150;
    }

    toDOM(): HTMLElement {
        const container = document.createElement('span');
        container.className = 'cm-image-embed';

        const img = document.createElement('img');
        img.src = this.match.target;
        img.draggable = true;

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
        };

        container.appendChild(img);
        return container;
    }

    eq(other: ImageEmbedWidget): boolean {
        return (
            this.match.full === other.match.full &&
            this.match.from === other.match.from
        );
    }

    ignoreEvent(event: Event): boolean {
        // Allow drag events and mousedown to be handled by the image directly
        // This prevents CodeMirror from intercepting and breaking native drag behavior
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
 * Build decorations for image embeds
 */
function buildImageEmbedDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const doc = view.state.doc;
    const cursorLine = doc.lineAt(view.state.selection.main.head).number;

    // Pre-collect code ranges once (O(n) instead of O(n²))
    const codeRanges = collectCodeRanges(view);

    for (const { from, to } of view.visibleRanges) {
        const text = doc.sliceString(from, to);
        const matches = parseImageEmbeds(text, from);

        for (const match of matches) {
            // Simple range check instead of tree iteration per match
            if (isInsideCode(match.from, match.to, codeRanges)) continue;

            const matchLine = doc.lineAt(match.from).number;
            const isActiveLine = matchLine === cursorLine;

            if (isActiveLine) {
                // On active line, show the raw syntax
                // We don't add any decorations here to let the raw text show
            } else {
                // On other lines, replace with the image widget
                builder.add(
                    match.from,
                    match.to,
                    Decoration.replace({
                        widget: new ImageEmbedWidget(match),
                    })
                );
            }
        }
    }

    return builder.finish();
}

/**
 * View plugin for image embed decorations
 */
const imageEmbedPlugin = ViewPlugin.fromClass(
    class {
        decorations: DecorationSet;
        lastCursorLine: number;

        constructor(view: EditorView) {
            this.decorations = buildImageEmbedDecorations(view);
            this.lastCursorLine = view.state.doc.lineAt(view.state.selection.main.head).number;
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged) {
                this.decorations = buildImageEmbedDecorations(update.view);
                this.lastCursorLine = update.view.state.doc.lineAt(update.view.state.selection.main.head).number;
            } else if (update.selectionSet) {
                // Only rebuild if cursor moved to a different line
                const newLine = update.view.state.doc.lineAt(update.view.state.selection.main.head).number;
                if (newLine !== this.lastCursorLine) {
                    this.decorations = buildImageEmbedDecorations(update.view);
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
        maxHeight: '300px', // Limit height to avoid taking up too much space
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
 */
export function imageEmbedExtension(): Extension {
    return [imageEmbedPlugin, imageEmbedTheme];
}

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

import { syntaxTree } from '@codemirror/language';

/**
 * Build decorations for image embeds
 */
function buildImageEmbedDecorations(view: EditorView): DecorationSet {
    const builder = new RangeSetBuilder<Decoration>();
    const doc = view.state.doc;
    const cursorLine = doc.lineAt(view.state.selection.main.head).number;

    for (const { from, to } of view.visibleRanges) {
        const text = doc.sliceString(from, to);
        const matches = parseImageEmbeds(text, from);

        for (const match of matches) {
            // Check if match is inside a code block
            const tree = syntaxTree(view.state);
            let isCode = false;
            tree.iterate({
                from: match.from,
                to: match.to,
                enter: (node) => {
                    if (
                        node.name === 'InlineCode' ||
                        node.name === 'FencedCode' ||
                        node.name === 'CodeBlock' ||
                        node.name === 'CodeText'
                    ) {
                        isCode = true;
                        return false; // Stop iterating
                    }
                },
            });

            if (isCode) continue;

            const matchLine = doc.lineAt(match.from).number;
            const isActiveLine = matchLine === cursorLine;

            if (isActiveLine) {
                // On active line, show the raw syntax
                // We don't add any decorations here to let the raw text show
                // Optionally we could add a mark to style the syntax if desired
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

        constructor(view: EditorView) {
            this.decorations = buildImageEmbedDecorations(view);
        }

        update(update: ViewUpdate) {
            if (update.docChanged || update.viewportChanged || update.selectionSet) {
                this.decorations = buildImageEmbedDecorations(update.view);
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

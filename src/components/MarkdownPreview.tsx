/**
 * MarkdownPreview - Static read-only markdown renderer
 * 
 * Uses `marked` for parsing with custom renderers for Obsidian-style syntax:
 * - [[wikilinks]] → clickable spans
 * - #tags → styled spans
 * - > [!callout] → styled callout blocks
 * - $math$ / $$math$$ → KaTeX rendered
 * - ![[image.png]] → img tags
 */

import React, { useMemo, useEffect } from 'react';
import { marked, Renderer, Tokens } from 'marked';
import katex from 'katex';
import { CALLOUT_TYPES } from '../extensions/callout';

// ============================================================================
// BUNDLED PREVIEW STYLES (injected globally on mount)
// ============================================================================

const PREVIEW_STYLES_ID = 'strata-markdown-preview-styles';
let previewStylesRefCount = 0;

/**
 * CSS for MarkdownPreview component - uses CSS variables from theme
 */
const PREVIEW_CSS = `
/* Callout preview base */
.cm-callout-preview {
  border-radius: 6px;
  padding: 0;
  margin: 1em 0;
  border-left: 4px solid;
  overflow: hidden;
}

/* Callout types */
.cm-callout-preview.cm-callout-note { background: var(--callout-note-bg); border-color: var(--callout-note-border); }
.cm-callout-preview.cm-callout-info { background: var(--callout-info-bg); border-color: var(--callout-info-border); }
.cm-callout-preview.cm-callout-warning { background: var(--callout-warning-bg); border-color: var(--callout-warning-border); }
.cm-callout-preview.cm-callout-danger { background: var(--callout-danger-bg); border-color: var(--callout-danger-border); }
.cm-callout-preview.cm-callout-success { background: var(--callout-success-bg); border-color: var(--callout-success-border); }
.cm-callout-preview.cm-callout-tip { background: var(--callout-tip-bg); border-color: var(--callout-tip-border); }
.cm-callout-preview.cm-callout-question { background: var(--callout-question-bg); border-color: var(--callout-question-border); }
.cm-callout-preview.cm-callout-quote { background: var(--callout-quote-bg); border-color: var(--callout-quote-border); }
.cm-callout-preview.cm-callout-example { background: var(--callout-example-bg); border-color: var(--callout-example-border); }
.cm-callout-preview.cm-callout-bug { background: var(--callout-bug-bg); border-color: var(--callout-bug-border); }

/* Callout header */
.cm-callout-header-preview {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  padding: 8px 12px;
}

/* Header colors */
.cm-callout-note .cm-callout-header-preview { color: var(--callout-header-note); }
.cm-callout-info .cm-callout-header-preview { color: var(--callout-header-info); }
.cm-callout-warning .cm-callout-header-preview { color: var(--callout-header-warning); }
.cm-callout-danger .cm-callout-header-preview { color: var(--callout-header-danger); }
.cm-callout-success .cm-callout-header-preview { color: var(--callout-header-success); }
.cm-callout-tip .cm-callout-header-preview { color: var(--callout-header-tip); }
.cm-callout-question .cm-callout-header-preview { color: var(--callout-header-question); }
.cm-callout-quote .cm-callout-header-preview { color: var(--callout-header-quote); }
.cm-callout-example .cm-callout-header-preview { color: var(--callout-header-example); }
.cm-callout-bug .cm-callout-header-preview { color: var(--callout-header-bug); }

/* SVG icon sizing */
.cm-callout-icon-preview {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  flex-shrink: 0;
}
.cm-callout-icon-preview svg { width: 100%; height: 100%; }

/* Callout content */
.cm-callout-preview .cm-callout-content {
  padding: 8px 12px;
  font-size: 0.95em;
  line-height: 1.5;
}
.cm-callout-preview .cm-callout-content p:first-child { margin-top: 0; }
.cm-callout-preview .cm-callout-content p:last-child { margin-bottom: 0; }

/* KaTeX fixes */
.katex-display { overflow: auto hidden; max-width: 100%; }
.katex-display > .katex { max-width: 100%; overflow-x: auto; overflow-y: hidden; white-space: normal; padding-block: 3px; }
.cm-math-block { overflow: auto hidden; max-width: 100%; }
.cm-math-block .katex { padding-block: 3px; }
`;

/**
 * Inject preview styles into document head (ref-counted)
 */
function injectPreviewStyles(): void {
    previewStylesRefCount++;
    if (previewStylesRefCount === 1) {
        const existing = document.getElementById(PREVIEW_STYLES_ID);
        if (!existing) {
            const style = document.createElement('style');
            style.id = PREVIEW_STYLES_ID;
            style.textContent = PREVIEW_CSS;
            document.head.appendChild(style);
        }
    }
}

/**
 * Remove preview styles when no longer needed
 */
function removePreviewStyles(): void {
    previewStylesRefCount--;
    if (previewStylesRefCount === 0) {
        const style = document.getElementById(PREVIEW_STYLES_ID);
        if (style) {
            style.remove();
        }
    }
}

// Alias mapping for callout types - maps Obsidian alternative names to our supported types
// Only includes types that DON'T have their own CSS variables (true aliases)
// Types with dedicated variables: info, warning, danger, success, tip, note, question, quote, example, bug
const CALLOUT_ALIAS_MAP: Record<string, string> = {
    // Warning aliases
    important: 'warning',
    caution: 'warning',
    attention: 'warning',
    // Info aliases  
    abstract: 'info',
    summary: 'info',
    // Tip aliases
    hint: 'tip',
    // Success aliases
    check: 'success',
    done: 'success',
    // Danger aliases
    failure: 'danger',
    fail: 'danger',
    error: 'danger',
    // Quote aliases
    cite: 'quote',
};

// ============================================================================
// Custom Marked Extension for Obsidian Syntax
// ============================================================================

/**
 * Process Obsidian-specific inline syntax before marked parsing
 */
function preprocessObsidianSyntax(markdown: string): string {
    let text = markdown;

    // Image embeds: ![[image.png]] or ![[image.png|alt]]
    text = text.replace(
        /!\[\[([^\]|#]+)(?:\|([^\]]+))?\]\]/g,
        (_, target, alt) => `<img src="${target}" alt="${alt || target}" class="cm-image-embed" />`
    );

    // Wikilinks: [[target]] or [[target|alias]] or [[target#heading]]
    text = text.replace(
        /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g,
        (_, target, heading, alias) => {
            const display = alias || target;
            const title = heading ? `${target}#${heading}` : target;
            return `<span class="cm-wikilink" data-target="${target}" title="${title}">${display}</span>`;
        }
    );

    // Tags: #tag (not inside code or preceded by &)
    text = text.replace(
        /(?<![\\&\w])#([\w][\w\/-]*)/g,
        (_, tag) => `<span class="cm-tag">#${tag}</span>`
    );

    // Block math: $$...$$ (handle multiline with [\s\S])
    // MUST process BEFORE inline math to avoid $$ being matched as two inline $
    text = text.replace(
        /\$\$([\s\S]+?)\$\$/g,
        (_, tex) => {
            try {
                return `<div class="cm-math-block">${katex.renderToString(tex.trim(), {
                    displayMode: true,
                    throwOnError: false,
                })}</div>`;
            } catch {
                return `<div class="cm-math-error">${tex}</div>`;
            }
        }
    );

    // Inline math: $...$ (single line only, non-greedy)
    text = text.replace(
        /\$([^$\n]+)\$/g,
        (_, tex) => {
            try {
                return katex.renderToString(tex, {
                    displayMode: false,
                    throwOnError: false,
                });
            } catch {
                return `<span class="cm-math-error">${tex}</span>`;
            }
        }
    );

    // Highlights: ==text==
    text = text.replace(
        /==([^=]+)==/g,
        (_, content) => `<mark class="cm-highlight">${content}</mark>`
    );

    return text;
}

/**
 * Parse callout blocks and convert to styled HTML
 */
function processCallouts(html: string): string {
    // Match blockquotes that start with [!type]
    // The pattern captures:
    // 1. type (e.g., "tip", "warning")
    // 2. fold indicator (+/-) optional
    // 3. title (rest of line after [!type])
    // 4. content (everything after the first </p> until </blockquote>)
    const calloutRegex = /<blockquote>\s*<p>\[!(\w+)\]([+-])?\s*(.*?)<\/p>([\s\S]*?)<\/blockquote>/gi;

    return html.replace(calloutRegex, (match, type, foldIndicator, titleLine, restContent) => {
        const lowerType = type.toLowerCase();
        const typeInfo = CALLOUT_TYPES[lowerType] || { icon: '', defaultTitle: type };

        // titleLine might contain the title AND additional content separated by <br>
        // Split on <br> to separate title from inline content
        const titleParts = titleLine.split(/<br\s*\/?>/i);
        const displayTitle = titleParts[0]?.trim() || typeInfo.defaultTitle;

        // Combine any content after the first <br> with the rest
        const inlineContent = titleParts.slice(1).join('<br>').trim();
        const bodyContent = inlineContent
            ? `<p>${inlineContent}</p>${restContent}`
            : restContent;

        const styleType = CALLOUT_ALIAS_MAP[lowerType] || lowerType;

        return `
            <div class="cm-callout-preview cm-callout-${styleType}">
                <div class="cm-callout-header-preview">
                    <span class="cm-callout-icon-preview">${typeInfo.icon}</span>
                    <span class="cm-callout-title">${displayTitle}</span>
                </div>
                <div class="cm-callout-content">${bodyContent}</div>
            </div>
        `.trim();
    });
}

/**
 * Create custom marked renderer
 */
function createRenderer(): Renderer {
    const renderer = new Renderer();

    // Custom code block with syntax highlighting class
    renderer.code = function ({ text, lang }: Tokens.Code): string {
        const langClass = lang ? ` language-${lang}` : '';
        return `<pre><code class="cm-code-block${langClass}">${text}</code></pre>`;
    };

    // Custom inline code
    renderer.codespan = function ({ text }: Tokens.Codespan): string {
        return `<code class="cm-inline-code">${text}</code>`;
    };

    return renderer;
}

// Configure marked once
const renderer = createRenderer();
marked.setOptions({
    renderer,
    gfm: true,
    breaks: true,
});

// ============================================================================
// React Component
// ============================================================================

export interface MarkdownPreviewProps {
    /** Markdown content to render */
    content: string;
    /** CSS class for the container */
    className?: string;
    /** Callback when a wikilink is clicked */
    onWikilinkClick?: (target: string, event: React.MouseEvent) => void;
    /** Callback when a tag is clicked */
    onTagClick?: (tag: string, event: React.MouseEvent) => void;
}

/**
 * Static markdown preview component
 * 
 * Renders markdown to HTML once, with no lazy loading or viewport calculations.
 * Supports all Obsidian-style syntax including wikilinks, tags, callouts, and math.
 */
export function MarkdownPreview({
    content,
    className = '',
    onWikilinkClick,
    onTagClick,
}: MarkdownPreviewProps): React.ReactElement {
    // Inject bundled styles on mount, clean up on unmount
    useEffect(() => {
        injectPreviewStyles();
        return () => removePreviewStyles();
    }, []);

    // Memoize the rendered HTML
    const html = useMemo(() => {
        // 1. Preprocess Obsidian syntax
        const preprocessed = preprocessObsidianSyntax(content);

        // 2. Parse with marked
        let rendered = marked.parse(preprocessed) as string;

        // 3. Post-process callouts
        rendered = processCallouts(rendered);

        return rendered;
    }, [content]);

    // Handle clicks on wikilinks and tags
    const handleClick = (event: React.MouseEvent) => {
        const target = event.target as HTMLElement;

        // Wikilink click
        if (target.classList.contains('cm-wikilink')) {
            const wikilinkTarget = target.dataset.target;
            if (wikilinkTarget && onWikilinkClick) {
                onWikilinkClick(wikilinkTarget, event);
            }
        }

        // Tag click
        if (target.classList.contains('cm-tag')) {
            const tag = target.textContent?.replace(/^#/, '');
            if (tag && onTagClick) {
                onTagClick(tag, event);
            }
        }
    };

    return (
        <div
            className={`markdown-preview ${className}`.trim()}
            onClick={handleClick}
            dangerouslySetInnerHTML={{ __html: html }}
        />
    );
}

export default MarkdownPreview;

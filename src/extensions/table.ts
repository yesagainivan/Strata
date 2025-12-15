/**
 * Table extension for Obsidian-style table rendering
 * 
 * Uses EditorView.decorations.compute() for block decorations
 */

import { Extension, RangeSetBuilder } from '@codemirror/state';
import {
    Decoration,
    DecorationSet,
    EditorView,
    WidgetType,
} from '@codemirror/view';
import katex from 'katex';

// Table separator pattern: matches |---|---|---| with any number of columns
const TABLE_SEPARATOR_REGEX = /^\|?(\s*:?-+:?\s*\|)+\s*:?-*:?\s*\|?$/;

interface TableBlock {
    startLine: number;
    endLine: number;
    headerRow: string;
    separatorRow: string;
    bodyRows: string[];
    from: number;
    to: number;
}

/**
 * Parse alignment from separator row
 */
function parseAlignments(separator: string): ('left' | 'center' | 'right')[] {
    const cells = separator.split('|').filter(c => c.trim());
    return cells.map(cell => {
        const trimmed = cell.trim();
        const hasLeft = trimmed.startsWith(':');
        const hasRight = trimmed.endsWith(':');
        if (hasLeft && hasRight) return 'center';
        if (hasRight) return 'right';
        return 'left';
    });
}

/**
 * Parse a table row into cells
 */
function parseRow(row: string): string[] {
    const trimmed = row.trim();
    const withoutPipes = trimmed.startsWith('|') ? trimmed.slice(1) : trimmed;
    const final = withoutPipes.endsWith('|') ? withoutPipes.slice(0, -1) : withoutPipes;
    return final.split('|').map(cell => cell.trim());
}

/**
 * Render cell content with markdown syntax support
 * Supports: [[wikilinks]], #tags, **bold**, *italic*, `code`, ~~strikethrough~~, ==highlight==, $math$
 */
function renderCellContent(cell: string, container: HTMLElement): void {
    // Order matters: process more specific patterns first
    const patterns: { regex: RegExp; replace: (match: RegExpMatchArray) => HTMLElement | Text }[] = [
        // Inline math: $...$
        {
            regex: /\$([^$\n]+)\$/g,
            replace: (match) => {
                const span = document.createElement('span');
                span.className = 'cm-math-inline';
                try {
                    span.innerHTML = katex.renderToString(match[1], {
                        displayMode: false,
                        throwOnError: false,
                        errorColor: '#cc0000',
                    });
                } catch {
                    span.className = 'cm-math-error';
                    span.textContent = match[0];
                }
                return span;
            }
        },
        // Wikilinks: [[target]] or [[target|alias]]
        {
            regex: /\[\[([^\]|#]+)(?:#([^\]|]+))?(?:\|([^\]]+))?\]\]/g,
            replace: (match) => {
                const span = document.createElement('span');
                span.className = 'cm-wikilink';
                span.textContent = match[3] || match[1]; // alias or target
                span.dataset.wikilinkTarget = match[1];
                if (match[3]) span.dataset.wikilinkAlias = match[3];
                if (match[2]) span.title = `${match[1]}#${match[2]}`;
                else span.title = match[1];
                return span;
            }
        },
        // Tags: #tag or #nested/tag
        {
            regex: /(?<![&\w])#([\w\/-]+)/g,
            replace: (match) => {
                const span = document.createElement('span');
                span.className = 'cm-tag';
                span.textContent = `#${match[1]}`;
                span.dataset.tag = match[1];
                return span;
            }
        },
        // Inline code: `code`
        {
            regex: /`([^`]+)`/g,
            replace: (match) => {
                const code = document.createElement('code');
                code.className = 'cm-table-inline-code';
                code.textContent = match[1];
                return code;
            }
        },
        // Bold: **text** or __text__
        {
            regex: /\*\*([^*]+)\*\*|__([^_]+)__/g,
            replace: (match) => {
                const strong = document.createElement('strong');
                strong.textContent = match[1] || match[2];
                return strong;
            }
        },
        // Italic: *text* or _text_ (but not inside words for underscores)
        {
            regex: /(?<!\w)\*([^*]+)\*(?!\w)|(?<!\w)_([^_]+)_(?!\w)/g,
            replace: (match) => {
                const em = document.createElement('em');
                em.textContent = match[1] || match[2];
                return em;
            }
        },
        // Strikethrough: ~~text~~
        {
            regex: /~~([^~]+)~~/g,
            replace: (match) => {
                const del = document.createElement('del');
                del.textContent = match[1];
                return del;
            }
        },
        // Highlight: ==text==
        {
            regex: /==([^=]+)==/g,
            replace: (match) => {
                const mark = document.createElement('mark');
                mark.className = 'cm-highlight';
                mark.textContent = match[1];
                return mark;
            }
        },
    ];

    // Process the cell content with all patterns
    let remaining = cell;
    const fragments: (HTMLElement | Text)[] = [];

    while (remaining.length > 0) {
        let earliestMatch: { index: number; length: number; element: HTMLElement | Text } | null = null;

        // Find the earliest match among all patterns
        for (const { regex, replace } of patterns) {
            regex.lastIndex = 0; // Reset regex state
            const match = regex.exec(remaining);
            if (match && (earliestMatch === null || match.index < earliestMatch.index)) {
                earliestMatch = {
                    index: match.index,
                    length: match[0].length,
                    element: replace(match as RegExpMatchArray),
                };
            }
        }

        if (earliestMatch) {
            // Add text before the match
            if (earliestMatch.index > 0) {
                fragments.push(document.createTextNode(remaining.slice(0, earliestMatch.index)));
            }
            // Add the matched element
            fragments.push(earliestMatch.element);
            // Continue with remaining text
            remaining = remaining.slice(earliestMatch.index + earliestMatch.length);
        } else {
            // No more matches, add remaining text
            fragments.push(document.createTextNode(remaining));
            break;
        }
    }

    // Append all fragments to container
    for (const fragment of fragments) {
        container.appendChild(fragment);
    }
}

/**
 * Find tables within a specific line range (for visible range optimization)
 */
function findTablesInRange(
    doc: { line: (n: number) => { text: string; from: number; to: number }; lines: number },
    startLineNum: number,
    endLineNum: number
): TableBlock[] {
    const tables: TableBlock[] = [];
    let i = startLineNum;

    while (i <= endLineNum) {
        const line = doc.line(i);
        const text = line.text.trim();

        if (text.includes('|') && !TABLE_SEPARATOR_REGEX.test(text)) {
            if (i + 1 <= doc.lines) {
                const nextLine = doc.line(i + 1);
                const nextText = nextLine.text.trim();

                if (TABLE_SEPARATOR_REGEX.test(nextText)) {
                    const startLine = i;
                    const headerRow = text;
                    const separatorRow = nextText;
                    const bodyRows: string[] = [];

                    let endLine = i + 1;
                    let j = i + 2;

                    // Continue past visible range to find complete table
                    while (j <= doc.lines) {
                        const bodyLine = doc.line(j);
                        const bodyText = bodyLine.text.trim();
                        if (bodyText.includes('|') && !TABLE_SEPARATOR_REGEX.test(bodyText)) {
                            bodyRows.push(bodyText);
                            endLine = j;
                            j++;
                        } else {
                            break;
                        }
                    }

                    tables.push({
                        startLine,
                        endLine,
                        headerRow,
                        separatorRow,
                        bodyRows,
                        from: line.from,
                        to: doc.line(endLine).to,
                    });

                    i = endLine + 1;
                    continue;
                }
            }
        }
        i++;
    }

    return tables;
}

/**
 * Widget that renders a table as HTML
 */
class TableWidget extends WidgetType {
    constructor(private table: TableBlock) {
        super();
    }

    toDOM(): HTMLElement {
        const wrapper = document.createElement('div');
        wrapper.className = 'cm-table-widget';

        const table = document.createElement('table');
        table.className = 'cm-rendered-table';

        const alignments = parseAlignments(this.table.separatorRow);

        // Create header
        const thead = document.createElement('thead');
        const headerTr = document.createElement('tr');
        const headerCells = parseRow(this.table.headerRow);

        headerCells.forEach((cell, i) => {
            const th = document.createElement('th');
            renderCellContent(cell, th);
            th.style.textAlign = alignments[i] || 'left';
            headerTr.appendChild(th);
        });
        thead.appendChild(headerTr);
        table.appendChild(thead);

        // Create body
        const tbody = document.createElement('tbody');
        this.table.bodyRows.forEach(row => {
            const tr = document.createElement('tr');
            const cells = parseRow(row);
            cells.forEach((cell, i) => {
                const td = document.createElement('td');
                renderCellContent(cell, td);
                td.style.textAlign = alignments[i] || 'left';
                tr.appendChild(td);
            });
            tbody.appendChild(tr);
        });
        table.appendChild(tbody);

        wrapper.appendChild(table);
        return wrapper;
    }

    eq(other: TableWidget): boolean {
        return this.table.from === other.table.from && this.table.to === other.table.to;
    }

    ignoreEvent(): boolean {
        return false;
    }
}


/**
 * Computed decorations for tables - uses compute() for block widget support with view access
 * Unlike ViewPlugin, compute() supports block decorations while still having view access
 */
const tableDecorations = EditorView.decorations.compute(
    ['doc', 'selection'],
    (state) => {
        // Note: compute() doesn't have direct view access, so we fall back to full doc scan
        // This is a CM6 limitation for block decorations
        const doc = state.doc;
        const cursorPos = state.selection.main.head;

        const allDecos: { from: number; to: number; deco: Decoration }[] = [];

        // Scan entire document for tables (required for block decorations)
        const tables = findTablesInRange(doc, 1, doc.lines);

        for (const table of tables) {
            const isEditing = cursorPos >= table.from && cursorPos <= table.to;

            if (!isEditing) {
                // Add widget at the start of the table
                allDecos.push({
                    from: table.from,
                    to: table.from,
                    deco: Decoration.widget({
                        widget: new TableWidget(table),
                        block: true,
                        side: -1,
                    }),
                });

                // Hide all table lines using line decorations
                for (let lineNum = table.startLine; lineNum <= table.endLine; lineNum++) {
                    const line = doc.line(lineNum);
                    allDecos.push({
                        from: line.from,
                        to: line.from,
                        deco: Decoration.line({ class: 'cm-table-hidden-line' }),
                    });
                }
            }
        }

        // Sort decorations by position
        allDecos.sort((a, b) => a.from - b.from || a.to - b.to);

        const builder = new RangeSetBuilder<Decoration>();
        for (const { from, to, deco } of allDecos) {
            builder.add(from, to, deco);
        }

        return builder.finish();
    }
);

/**
 * Theme for rendered tables
 */
const tableTheme = EditorView.baseTheme({
    // Completely hide the raw text lines
    '.cm-table-hidden-line': {
        fontSize: '0 !important',
        lineHeight: '0 !important',
        height: '0 !important',
        overflow: 'hidden !important',
        visibility: 'hidden !important',
    },
    '.cm-table-widget': {
        display: 'block',
        margin: '4px 0',
        overflowX: 'auto',
    },
    '.cm-rendered-table': {
        borderCollapse: 'collapse',
        width: '100%',
        fontSize: '0.9em',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    '.cm-rendered-table th, .cm-rendered-table td': {
        border: '1px solid var(--table-border, #e2e8f0)',
        padding: '8px 12px',
    },
    '.cm-rendered-table th': {
        backgroundColor: 'var(--table-header-bg, #f1f5f9)',
        fontWeight: '600',
        color: 'var(--table-header-color, #1e293b)',
    },
    '.cm-rendered-table tr:nth-child(even) td': {
        backgroundColor: 'var(--table-row-alt-bg, #f8fafc)',
    },
    '.cm-rendered-table tr:hover td': {
        backgroundColor: 'var(--table-row-hover, #e0f2fe)',
    },
    // Inline code in tables
    '.cm-table-inline-code': {
        fontFamily: '"SF Mono", Monaco, "Cascadia Code", monospace',
        backgroundColor: 'var(--syntax-code-bg, #f1f5f9)',
        padding: '1px 4px',
        borderRadius: '3px',
        fontSize: '0.9em',
    },
    // Highlights in tables
    '.cm-rendered-table .cm-highlight': {
        backgroundColor: 'var(--highlight-bg, #fef08a)',
        padding: '1px 2px',
        borderRadius: '2px',
    },
});

/**
 * Table extension with Obsidian-style rendering
 */
export function tableExtension(): Extension {
    return [tableDecorations, tableTheme];
}


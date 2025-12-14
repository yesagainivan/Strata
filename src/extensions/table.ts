/**
 * Table extension for Obsidian-style table rendering
 * 
 * Uses StateField for block decorations (required by CodeMirror 6)
 */

import { Extension, RangeSetBuilder, StateField, EditorState } from '@codemirror/state';
import {
    Decoration,
    DecorationSet,
    EditorView,
    WidgetType,
} from '@codemirror/view';

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
 * Find all tables in the document
 */
function findTables(doc: { line: (n: number) => { text: string; from: number; to: number }; lines: number }): TableBlock[] {
    const tables: TableBlock[] = [];
    let i = 1;

    while (i <= doc.lines) {
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
            th.textContent = cell;
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
                td.textContent = cell;
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
 * Build table decorations
 */
function buildTableDecorations(state: EditorState): DecorationSet {
    const doc = state.doc;
    const tables = findTables(doc);

    const cursorPos = state.selection.main.head;

    // We need to add decorations in document order
    const allDecos: { from: number; to: number; deco: Decoration }[] = [];

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
                    to: line.from, // Line decorations use from=to at line start
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

/**
 * StateField for table decorations (required for block widgets)
 */
const tableField = StateField.define<DecorationSet>({
    create(state) {
        return buildTableDecorations(state);
    },
    update(decorations, tr) {
        if (tr.docChanged || tr.selection) {
            return buildTableDecorations(tr.state);
        }
        return decorations;
    },
    provide: field => EditorView.decorations.from(field),
});

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
});

/**
 * Table extension with Obsidian-style rendering
 */
export function tableExtension(): Extension {
    return [tableField, tableTheme];
}


/**
 * Preset themes for Strata Editor demo
 * Showcases the StrataTheme API with various color palettes
 */

import type { StrataTheme } from '../types/theme';

export interface ThemePreset {
    id: string;
    name: string;
    description: string;
    theme: StrataTheme;
}

export const THEME_PRESETS: ThemePreset[] = [
    {
        id: 'light',
        name: 'Light',
        description: 'Clean, minimal light theme',
        theme: {
            mode: 'light',
        },
    },
    {
        id: 'dark',
        name: 'Dark',
        description: 'Easy on the eyes dark mode',
        theme: {
            mode: 'dark',
        },
    },
    {
        id: 'moss',
        name: 'Moss',
        description: 'Earthy green palette',
        theme: {
            mode: 'light',
            colors: {
                background: '#f5efe1',
                foreground: '#4a3b30',
                selection: '#d4e8d4',
                cursor: '#4a3b30',
                lineHighlight: '#ece6d8',
                gutterBackground: '#ece6d8',
                gutterForeground: '#8c7b70',
            },
            syntax: {
                heading: '#3d4f3d',
                bold: '#4a3b30',
                italic: '#6b7f6c',
                link: '#6b7f6c',
                code: '#8b5a2b',
                codeBackground: '#e8e2d2',
                blockquote: '#8c7b70',
                listMarker: '#6b7f6c',
            },
            elements: {
                wikilink: '#6b7f6c',
                wikilinkHover: '#4a5c4b',
                tag: '#8b5a2b',
                tagBackground: '#f0e9dd',
            },
            callouts: {
                // Sage blue-green for informational
                info: { background: 'rgba(95, 129, 120, 0.12)', border: '#5f8178', header: '#4a6860' },
                // Warm amber for warnings
                warning: { background: 'rgba(198, 155, 85, 0.15)', border: '#c69b55', header: '#8a6d30' },
                // Terracotta for danger
                danger: { background: 'rgba(175, 110, 95, 0.14)', border: '#af6e5f', header: '#8b4f40' },
                // Forest green for success
                success: { background: 'rgba(95, 130, 95, 0.14)', border: '#5f825f', header: '#4a6a4a' },
                // Light sage for tips
                tip: { background: 'rgba(107, 140, 115, 0.12)', border: '#6b8c73', header: '#4d6b54' },
                // Warm brown for notes
                note: { background: 'rgba(139, 110, 80, 0.12)', border: '#8b6e50', header: '#6b5038' },
                // Muted teal for questions
                question: { background: 'rgba(100, 130, 125, 0.12)', border: '#64827d', header: '#4a6560' },
                // Warm gray-brown for quotes
                quote: { background: 'rgba(130, 115, 100, 0.10)', border: '#827364', header: '#635850' },
                // Olive for examples
                example: { background: 'rgba(120, 125, 90, 0.12)', border: '#787d5a', header: '#5a5f40' },
                // Dusty rose for bugs
                bug: { background: 'rgba(155, 100, 100, 0.12)', border: '#9b6464', header: '#7a4848' },
            },
            tables: {
                border: '#d6cebf',
                headerBackground: 'rgba(107, 127, 108, 0.08)',
                headerForeground: '#4a3b30',
                rowAltBackground: 'rgba(107, 127, 108, 0.03)',
                rowHover: 'rgba(107, 127, 108, 0.1)',
            },
        },
    },
    {
        id: 'moss-dark',
        name: 'Moss Dark',
        description: 'Deep forest after dusk',
        theme: {
            mode: 'dark',
            colors: {
                background: '#1a1c1a',
                foreground: '#d8d4cc',
                selection: '#3a4a3a',
                cursor: '#a8b8a0',
                lineHighlight: '#222422',
                gutterBackground: '#1e201e',
                gutterForeground: '#6a7068',
            },
            syntax: {
                heading: '#b8c8b0',
                bold: '#d8d4cc',
                italic: '#9a9890',
                link: '#88a088',
                code: '#c8a878',
                codeBackground: '#262826',
                blockquote: '#808078',
                listMarker: '#88a088',
            },
            elements: {
                wikilink: '#88a088',
                wikilinkHover: '#a0b8a0',
                tag: '#c8a878',
                tagBackground: '#2e302c',
            },
            callouts: {
                // Muted sage for info
                info: { background: 'rgba(120, 145, 130, 0.15)', border: '#6a8070', header: '#90a898' },
                // Warm amber
                warning: { background: 'rgba(180, 145, 90, 0.15)', border: '#a08050', header: '#c8a870' },
                // Muted terracotta
                danger: { background: 'rgba(160, 100, 90, 0.15)', border: '#986860', header: '#b88880' },
                // Forest green
                success: { background: 'rgba(100, 135, 100, 0.15)', border: '#608060', header: '#88a888' },
                // Sage
                tip: { background: 'rgba(110, 140, 115, 0.14)', border: '#688868', header: '#90a890' },
                // Warm brown
                note: { background: 'rgba(150, 120, 90, 0.14)', border: '#907058', header: '#b89878' },
                // Muted teal
                question: { background: 'rgba(100, 130, 125, 0.14)', border: '#607870', header: '#88a8a0' },
                // Warm gray
                quote: { background: 'rgba(120, 115, 105, 0.12)', border: '#706860', header: '#989088' },
                // Olive
                example: { background: 'rgba(115, 125, 90, 0.14)', border: '#687050', header: '#909870' },
                // Dusty rose
                bug: { background: 'rgba(150, 100, 100, 0.14)', border: '#886060', header: '#a88888' },
            },
            tables: {
                border: '#363836',
                headerBackground: '#262826',
                headerForeground: '#d8d4cc',
                rowAltBackground: '#222422',
                rowHover: '#2e302e',
            },
        },
    },
    {
        id: 'ocean',
        name: 'Ocean',
        description: 'Deep sea midnight',
        theme: {
            mode: 'dark',
            colors: {
                background: '#0c1218',
                foreground: '#b8c4d0',
                selection: '#1e3048',
                cursor: '#5898c8',
                lineHighlight: '#101820',
                gutterBackground: '#0e1418',
                gutterForeground: '#4a5868',
            },
            syntax: {
                heading: '#7ab0d0',
                bold: '#b8c4d0',
                italic: '#7890a8',
                link: '#5898c8',
                code: '#6898b8',
                codeBackground: '#141c24',
                blockquote: '#586878',
                listMarker: '#5898c8',
            },
            elements: {
                wikilink: '#5898c8',
                wikilinkHover: '#78b0d8',
                tag: '#4080a0',
                tagBackground: '#182838',
            },
            callouts: {
                // Steel blue for info
                info: { background: 'rgba(80, 130, 170, 0.14)', border: '#4878a0', header: '#6898c0' },
                // Muted gold
                warning: { background: 'rgba(170, 140, 90, 0.14)', border: '#988858', header: '#b8a878' },
                // Coral red (muted)
                danger: { background: 'rgba(160, 90, 90, 0.14)', border: '#905858', header: '#b07878' },
                // Sea green
                success: { background: 'rgba(80, 140, 120, 0.14)', border: '#488868', header: '#68a890' },
                // Light steel
                tip: { background: 'rgba(90, 130, 160, 0.12)', border: '#507898', header: '#7098b8' },
                // Sandy brown
                note: { background: 'rgba(160, 130, 100, 0.12)', border: '#907858', header: '#a89878' },
                // Cyan-gray
                question: { background: 'rgba(90, 130, 150, 0.14)', border: '#5080a0', header: '#70a0c0' },
                // Slate
                quote: { background: 'rgba(100, 115, 130, 0.12)', border: '#586878', header: '#788898' },
                // Purple-gray
                example: { background: 'rgba(110, 100, 140, 0.14)', border: '#605878', header: '#8078a0' },
                // Rust
                bug: { background: 'rgba(150, 90, 90, 0.14)', border: '#885858', header: '#a87878' },
            },
            tables: {
                border: '#1c2838',
                headerBackground: '#141c24',
                headerForeground: '#b8c4d0',
                rowAltBackground: '#101820',
                rowHover: '#182430',
            },
        },
    },
    {
        id: 'sunset',
        name: 'Sunset',
        description: 'Warm dusk ambiance',
        theme: {
            mode: 'dark',
            colors: {
                background: '#181415',
                foreground: '#dcd4d6',
                selection: '#3a2830',
                cursor: '#d89080',
                lineHighlight: '#1e1a1c',
                gutterBackground: '#161214',
                gutterForeground: '#786468',
            },
            syntax: {
                heading: '#d8a898',
                bold: '#dcd4d6',
                italic: '#a89098',
                link: '#c88878',
                code: '#c89080',
                codeBackground: '#221c1e',
                blockquote: '#887078',
                listMarker: '#c88878',
            },
            elements: {
                wikilink: '#c88878',
                wikilinkHover: '#d8a090',
                tag: '#b87868',
                tagBackground: '#2a2024',
            },
            callouts: {
                // Dusty rose for info
                info: { background: 'rgba(170, 120, 130, 0.14)', border: '#987078', header: '#b89098' },
                // Warm amber
                warning: { background: 'rgba(180, 140, 100, 0.14)', border: '#a88058', header: '#c8a080' },
                // Soft coral
                danger: { background: 'rgba(170, 100, 95, 0.14)', border: '#a06058', header: '#c08078' },
                // Sage green
                success: { background: 'rgba(120, 140, 115, 0.14)', border: '#708068', header: '#90a088' },
                // Peach
                tip: { background: 'rgba(180, 130, 120, 0.12)', border: '#a07868', header: '#c09888' },
                // Warm taupe
                note: { background: 'rgba(150, 125, 115, 0.14)', border: '#887068', header: '#a89088' },
                // Mauve
                question: { background: 'rgba(140, 115, 130, 0.14)', border: '#806878', header: '#a08898' },
                // Warm gray
                quote: { background: 'rgba(130, 115, 115, 0.12)', border: '#706060', header: '#908080' },
                // Olive brown
                example: { background: 'rgba(140, 125, 100, 0.14)', border: '#807050', header: '#a09070' },
                // Deep coral
                bug: { background: 'rgba(160, 95, 95, 0.14)', border: '#905858', header: '#b08080' },
            },
            tables: {
                border: '#322428',
                headerBackground: '#221c1e',
                headerForeground: '#dcd4d6',
                rowAltBackground: '#1e1a1c',
                rowHover: '#2a2226',
            },
        },
    },
];

/**
 * Get a theme preset by ID
 */
export function getThemePreset(id: string): ThemePreset | undefined {
    return THEME_PRESETS.find(p => p.id === id);
}

/**
 * Format a StrataTheme as readable code for display
 */
export function formatThemeCode(theme: StrataTheme): string {
    return JSON.stringify(theme, null, 2)
        .replace(/"([^"]+)":/g, '$1:')  // Remove quotes from keys
        .replace(/"/g, "'");            // Use single quotes for strings
}

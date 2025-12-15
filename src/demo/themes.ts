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
                info: { background: 'rgba(107, 127, 108, 0.12)', border: '#739ca9ff', header: '#6e8a93ff' },
                warning: { background: 'rgba(224, 186, 98, 0.15)', border: '#e0ba62', header: '#8b6914' },
                danger: { background: 'rgba(168, 124, 124, 0.12)', border: '#a87c7c', header: '#7a4c4c' },
                success: { background: 'rgba(107, 127, 108, 0.15)', border: '#6b7f6c', header: '#4a5c4b' },
                tip: { background: 'rgba(107, 127, 108, 0.12)', border: '#6b7f6c', header: '#4a5c4b' },
                note: { background: 'rgba(139, 90, 43, 0.12)', border: '#8b5a2b', header: '#6b4423' },
                question: { background: 'rgba(107, 127, 108, 0.12)', border: '#6b7f6c', header: '#4a5c4b' },
                quote: { background: 'rgba(140, 123, 112, 0.12)', border: '#8c7b70', header: '#6c5b50' },
                example: { background: 'rgba(107, 127, 108, 0.12)', border: '#9c86b1ff', header: '#9f81bbff' },
                bug: { background: 'rgba(168, 124, 124, 0.12)', border: '#a87c7c', header: '#7a4c4c' },
            },
        },
    },
    {
        id: 'moss-dark',
        name: 'Moss Dark',
        description: 'Earthy dark palette',
        theme: {
            mode: 'dark',
            colors: {
                background: '#1c1a19',
                foreground: '#e8e4dc',
                selection: '#3d4f3d',
                cursor: '#e8e4dc',
                lineHighlight: '#262322',
                gutterBackground: '#262322',
                gutterForeground: '#a89b90',
            },
            syntax: {
                heading: '#c8d4c8',
                bold: '#e8e4dc',
                italic: '#a89b90',
                link: '#8a9b8b',
                code: '#d4a373',
                codeBackground: '#2a2420',
                blockquote: '#a89b90',
                listMarker: '#8a9b8b',
            },
            elements: {
                wikilink: '#8a9b8b',
                wikilinkHover: '#a8b8a8',
                tag: '#d4a373',
                tagBackground: '#3d3632',
            },
            callouts: {
                info: { background: 'rgba(138, 155, 139, 0.15)', border: '#739ca9ff', header: '#82aebbff' },
                warning: { background: 'rgba(212, 163, 115, 0.15)', border: '#d4a373', header: '#e4b383' },
                danger: { background: 'rgba(168, 124, 124, 0.15)', border: '#a87c7c', header: '#c89c9c' },
                success: { background: 'rgba(138, 155, 139, 0.15)', border: '#8a9b8b', header: '#a8b8a8' },
                tip: { background: 'rgba(138, 155, 139, 0.15)', border: '#8a9b8b', header: '#a8b8a8' },
                note: { background: 'rgba(212, 163, 115, 0.15)', border: '#d4a373', header: '#e4b383' },
                question: { background: 'rgba(138, 155, 139, 0.15)', border: '#8a9b8b', header: '#a8b8a8' },
                quote: { background: 'rgba(168, 155, 144, 0.15)', border: '#a89b90', header: '#c8bbb0' },
                example: { background: 'rgba(138, 155, 139, 0.15)', border: '#9c86b1ff', header: '#9f81bbff' },
                bug: { background: 'rgba(168, 124, 124, 0.15)', border: '#a87c7c', header: '#c89c9c' },
            },
        },
    },
    {
        id: 'ocean',
        name: 'Ocean',
        description: 'Cool blue tones, desaturated and darker',
        theme: {
            mode: 'dark',
            colors: {
                background: '#0e151cff',
                foreground: '#c0c8d0',
                selection: '#1a3149bb',
                cursor: '#4a90c0',
                lineHighlight: '#0e1820',
                gutterBackground: '#0e1820',
                gutterForeground: '#4a6078',
            },
            syntax: {
                heading: '#60a0c0',
                bold: '#c0c8d0',
                italic: '#8098b0',
                link: '#4a90c0',
                code: '#6090b0',
                codeBackground: '#102030',
                blockquote: '#506880',
                listMarker: '#4a90c0',
            },
            elements: {
                wikilink: '#4a90c0',
                wikilinkHover: '#60a0c0',
                tag: '#307090',
                tagBackground: '#183040',
            },
            callouts: {
                info: { background: 'rgba(74, 144, 192, 0.15)', border: '#4a90c0', header: '#60a0c0' },
                warning: { background: 'rgba(192, 144, 74, 0.15)', border: '#c0904a', header: '#d0a060' },
                danger: { background: 'rgba(192, 74, 74, 0.15)', border: '#c04a4a', header: '#d06060' },
                success: { background: 'rgba(74, 192, 74, 0.15)', border: '#4ac04a', header: '#60d060' },
                tip: { background: 'rgba(74, 144, 192, 0.15)', border: '#4a90c0', header: '#60a0c0' },
                note: { background: 'rgba(192, 144, 74, 0.15)', border: '#c0904a', header: '#d0a060' },
                question: { background: 'rgba(74, 144, 192, 0.15)', border: '#4a90c0', header: '#60a0c0' },
                quote: { background: 'rgba(80, 104, 128, 0.15)', border: '#506880', header: '#607890' },
                example: { background: 'rgba(128, 80, 192, 0.15)', border: '#8050c0', header: '#9060d0' },
                bug: { background: 'rgba(192, 74, 74, 0.15)', border: '#c04a4a', header: '#d06060' },
            },
        },
    },
    {
        id: 'sunset',
        name: 'Sunset',
        description: 'Warm orange and pink',
        theme: {
            mode: 'dark',
            colors: {
                background: '#1a1215',
                foreground: '#f0e6e8',
                selection: '#4a2a35',
                cursor: '#ff9a76',
                lineHighlight: '#221a1d',
                gutterBackground: '#15101 2',
                gutterForeground: '#8a6a70',
            },
            syntax: {
                heading: '#ffb09a',
                bold: '#f0e6e8',
                italic: '#d4a8b0',
                link: '#ff9a76',
                code: '#e88a6a',
                codeBackground: '#2a1a1f',
                blockquote: '#b08890',
                listMarker: '#ff9a76',
            },
            elements: {
                wikilink: '#ff9a76',
                wikilinkHover: '#ffb090',
                tag: '#e07858',
                tagBackground: '#3a2025',
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

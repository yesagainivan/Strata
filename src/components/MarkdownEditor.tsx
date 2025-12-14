/**
 * MarkdownEditor - A React component for CodeMirror 6 based markdown editing
 * with Obsidian-style WYSIWYG features
 */

import React, {
    useRef,
    useEffect,
    useImperativeHandle,
    forwardRef,
    useCallback,
} from 'react';
import { EditorView } from '@codemirror/view';
import { createEditor, updateTheme, updateReadOnly } from '../core/editor';
import type { MarkdownEditorProps, MarkdownEditorHandle, WikilinkData } from '../types';

/**
 * Parse wikilink click data into WikilinkData structure
 */
function parseWikilinkData(target: string, alias?: string): WikilinkData {
    const hashIndex = target.indexOf('#');
    const blockIndex = target.indexOf('#^');

    let parsedTarget = target;
    let heading: string | undefined;
    let block: string | undefined;

    if (blockIndex !== -1) {
        parsedTarget = target.slice(0, blockIndex);
        block = target.slice(blockIndex + 2);
    } else if (hashIndex !== -1) {
        parsedTarget = target.slice(0, hashIndex);
        heading = target.slice(hashIndex + 1);
    }

    return {
        target: parsedTarget,
        alias,
        heading,
        block,
    };
}

/**
 * MarkdownEditor component with Obsidian-style WYSIWYG editing
 */
export const MarkdownEditor = forwardRef<MarkdownEditorHandle, MarkdownEditorProps>(
    function MarkdownEditor(props, ref) {
        const {
            value,
            defaultValue = '',
            onChange,
            extensions = [],
            theme = 'light',
            placeholder = 'Start writing...',
            readOnly = false,
            className = '',
            onWikilinkClick,
            onTagClick,
            onFrontmatterChange,
        } = props;

        const containerRef = useRef<HTMLDivElement>(null);
        const editorRef = useRef<EditorView | null>(null);
        const isControlled = value !== undefined;
        const lastValueRef = useRef<string>(value ?? defaultValue);

        // Handle wikilink clicks
        const handleWikilinkClick = useCallback(
            (target: string, alias?: string) => {
                if (onWikilinkClick) {
                    const data = parseWikilinkData(target, alias);
                    onWikilinkClick(data);
                }
            },
            [onWikilinkClick]
        );

        // Handle tag clicks
        const handleTagClick = useCallback(
            (tag: string) => {
                if (onTagClick) {
                    onTagClick(tag);
                }
            },
            [onTagClick]
        );

        // Handle content changes
        const handleChange = useCallback(
            (newValue: string) => {
                lastValueRef.current = newValue;
                onChange?.(newValue);

                // Parse frontmatter if callback provided
                if (onFrontmatterChange) {
                    const frontmatterMatch = newValue.match(/^---\n([\s\S]*?)\n---/);
                    if (frontmatterMatch) {
                        try {
                            // Simple YAML parsing (for demonstration - use a proper YAML library in production)
                            const frontmatter: Record<string, unknown> = {};
                            const lines = frontmatterMatch[1].split('\n');
                            for (const line of lines) {
                                const colonIndex = line.indexOf(':');
                                if (colonIndex !== -1) {
                                    const key = line.slice(0, colonIndex).trim();
                                    const value = line.slice(colonIndex + 1).trim();
                                    frontmatter[key] = value;
                                }
                            }
                            onFrontmatterChange(frontmatter);
                        } catch {
                            // Ignore parsing errors
                        }
                    }
                }
            },
            [onChange, onFrontmatterChange]
        );

        // Initialize editor
        useEffect(() => {
            if (!containerRef.current) return;

            const editor = createEditor(containerRef.current, {
                doc: value ?? defaultValue,
                placeholder,
                theme,
                readOnly,
                extensions,
                onChange: handleChange,
                onWikilinkClick: handleWikilinkClick,
                onTagClick: handleTagClick,
            });

            editorRef.current = editor;

            return () => {
                editor.destroy();
                editorRef.current = null;
            };
            // eslint-disable-next-line react-hooks/exhaustive-deps
        }, []); // Only run on mount

        // Update content when controlled value changes
        useEffect(() => {
            if (!isControlled || !editorRef.current) return;

            const currentValue = editorRef.current.state.doc.toString();
            if (value !== currentValue && value !== lastValueRef.current) {
                editorRef.current.dispatch({
                    changes: {
                        from: 0,
                        to: editorRef.current.state.doc.length,
                        insert: value,
                    },
                });
                lastValueRef.current = value;
            }
        }, [value, isControlled]);

        // Update theme when it changes
        useEffect(() => {
            if (editorRef.current) {
                updateTheme(editorRef.current, theme);
            }
        }, [theme]);

        // Update read-only state when it changes
        useEffect(() => {
            if (editorRef.current) {
                updateReadOnly(editorRef.current, readOnly);
            }
        }, [readOnly]);

        // Expose imperative handle
        useImperativeHandle(
            ref,
            () => ({
                getValue: () => {
                    return editorRef.current?.state.doc.toString() ?? '';
                },
                setValue: (content: string) => {
                    if (editorRef.current) {
                        editorRef.current.dispatch({
                            changes: {
                                from: 0,
                                to: editorRef.current.state.doc.length,
                                insert: content,
                            },
                        });
                    }
                },
                focus: () => {
                    editorRef.current?.focus();
                },
                insertText: (text: string) => {
                    if (editorRef.current) {
                        const pos = editorRef.current.state.selection.main.head;
                        editorRef.current.dispatch({
                            changes: { from: pos, insert: text },
                        });
                    }
                },
                getEditorView: () => editorRef.current,
            }),
            []
        );

        return (
            <div
                ref={containerRef}
                className={`markdown-editor ${className}`.trim()}
                data-theme={theme}
            />
        );
    }
);

export default MarkdownEditor;

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
            wikilinkInteraction,
            tagInteraction,
        } = props;

        const containerRef = useRef<HTMLDivElement>(null);
        const editorRef = useRef<EditorView | null>(null);
        const isControlled = value !== undefined;
        const lastValueRef = useRef<string>(value ?? defaultValue);

        // Store latest callbacks in a ref to avoid stale closures
        const callbacksRef = useRef({ onChange, onWikilinkClick, onTagClick });
        useEffect(() => {
            callbacksRef.current = { onChange, onWikilinkClick, onTagClick };
        });

        // Handle wikilink clicks - reads from ref to always get latest callback
        const handleWikilinkClick = useCallback(
            (target: string, alias: string | undefined, event: MouseEvent) => {
                if (callbacksRef.current.onWikilinkClick) {
                    const data = parseWikilinkData(target, alias);
                    callbacksRef.current.onWikilinkClick(data, event);
                }
            },
            []
        );

        // Handle tag clicks - reads from ref to always get latest callback
        const handleTagClick = useCallback(
            (tag: string, event: MouseEvent) => {
                if (callbacksRef.current.onTagClick) {
                    callbacksRef.current.onTagClick(tag, event);
                }
            },
            []
        );

        // Handle content changes - reads from ref to always get latest callbacks
        const handleChange = useCallback(
            (newValue: string) => {
                lastValueRef.current = newValue;
                callbacksRef.current.onChange?.(newValue);
            },
            []
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
                wikilinkInteraction,
                tagInteraction,
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
                getSelection: () => {
                    if (editorRef.current) {
                        const { from, to } = editorRef.current.state.selection.main;
                        return editorRef.current.state.sliceDoc(from, to);
                    }
                    return '';
                },
                replaceSelection: (text: string) => {
                    if (editorRef.current) {
                        const { from, to } = editorRef.current.state.selection.main;
                        editorRef.current.dispatch({
                            changes: { from, to, insert: text },
                        });
                    }
                },
                wrapSelection: (before: string, after: string) => {
                    if (editorRef.current) {
                        const { from, to } = editorRef.current.state.selection.main;
                        const hasSelection = from !== to;

                        if (hasSelection) {
                            // Wrap selected text
                            const selectedText = editorRef.current.state.sliceDoc(from, to);
                            editorRef.current.dispatch({
                                changes: { from, to, insert: before + selectedText + after },
                                selection: { anchor: from + before.length, head: to + before.length },
                            });
                        } else {
                            // No selection: insert placeholder
                            const placeholder = 'text';
                            editorRef.current.dispatch({
                                changes: { from, insert: before + placeholder + after },
                                selection: { anchor: from + before.length, head: from + before.length + placeholder.length },
                            });
                        }
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

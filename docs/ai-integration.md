# AI Integration Guide

This guide shows how to integrate AI features like streaming responses and smart replace/diff functionality with Strata.

## Overview

Strata is a markdown editor component — it doesn't include AI features out of the box. Instead, it provides a powerful API that makes it easy to build AI-powered editing experiences. This guide demonstrates common patterns for:

- **AI Streaming**: Display AI-generated text as it streams in real-time
- **AI Replace**: Implement diff-based editing with accept/reject controls
- **Smart Insertion**: Context-aware AI text insertion

## Editor API for AI

Strata exposes these methods via `ref` for AI integration:

```tsx
const editorRef = useRef<MarkdownEditorHandle>(null);

// Get current content
const content = editorRef.current?.getValue();

// Insert text at cursor
editorRef.current?.insertText('AI generated text');

// Replace selection
editorRef.current?.setValue(newContent);

// Wrap selection with markers
editorRef.current?.wrapSelection('**', '**');

// Get current selection
const selection = editorRef.current?.getSelection();
```

---

## AI Streaming

Stream AI responses directly into the editor as they're generated.

### Basic Streaming Example

```tsx
import { useRef, useState } from 'react';
import { MarkdownEditor, MarkdownEditorHandle } from 'strata-editor';

function AIEditor() {
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const [isStreaming, setIsStreaming] = useState(false);

  async function streamAIResponse(prompt: string) {
    setIsStreaming(true);
    
    const response = await fetch('/api/ai/stream', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ prompt }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();
    
    let streamedText = '';
    
    while (true) {
      const { done, value } = await reader!.read();
      if (done) break;
      
      const chunk = decoder.decode(value);
      streamedText += chunk;
      
      // Insert chunk at cursor position
      editorRef.current?.insertText(chunk);
    }
    
    setIsStreaming(false);
  }

  return (
    <div>
      <MarkdownEditor ref={editorRef} />
      <button 
        onClick={() => streamAIResponse('Generate content...')}
        disabled={isStreaming}
      >
        {isStreaming ? 'Generating...' : 'Generate with AI'}
      </button>
    </div>
  );
}
```

### Streaming with OpenAI

```tsx
import OpenAI from 'openai';

async function streamWithOpenAI(
  prompt: string,
  editorRef: React.RefObject<MarkdownEditorHandle>
) {
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
    dangerouslyAllowBrowser: true, // Use server-side in production
  });

  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  for await (const chunk of stream) {
    const content = chunk.choices[0]?.delta?.content || '';
    if (content) {
      editorRef.current?.insertText(content);
    }
  }
}
```

### Streaming with Anthropic Claude

```tsx
import Anthropic from '@anthropic-ai/sdk';

async function streamWithClaude(
  prompt: string,
  editorRef: React.RefObject<MarkdownEditorHandle>
) {
  const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });

  const stream = await anthropic.messages.stream({
    model: 'claude-3-5-sonnet-20241022',
    max_tokens: 1024,
    messages: [{ role: 'user', content: prompt }],
  });

  for await (const chunk of stream) {
    if (
      chunk.type === 'content_block_delta' &&
      chunk.delta.type === 'text_delta'
    ) {
      editorRef.current?.insertText(chunk.delta.text);
    }
  }
}
```

---

## AI Replace (Diff View)

Implement smart replace functionality where users can review and accept/reject AI suggestions.

### Strategy

For diff-based editing, you'll typically:

1. Get the current selection or relevant content
2. Send it to AI for improvement/rewriting
3. Show the suggested changes with diff markers
4. Let users accept or reject the changes

### Basic Replace Implementation

```tsx
import { useState, useRef } from 'react';
import { MarkdownEditor, MarkdownEditorHandle } from 'strata-editor';

interface AIDiff {
  original: string;
  suggested: string;
  from: number;
  to: number;
}

function AIReplaceEditor() {
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const [activeDiff, setActiveDiff] = useState<AIDiff | null>(null);

  async function improveSelection() {
    const selection = editorRef.current?.getSelection();
    if (!selection) return;

    const { from, to, text } = selection;

    // Get AI suggestion
    const response = await fetch('/api/ai/improve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    const { improved } = await response.json();

    // Show diff for user to review
    setActiveDiff({
      original: text,
      suggested: improved,
      from,
      to,
    });
  }

  function acceptDiff() {
    if (!activeDiff) return;

    const currentContent = editorRef.current?.getValue() || '';
    const newContent =
      currentContent.slice(0, activeDiff.from) +
      activeDiff.suggested +
      currentContent.slice(activeDiff.to);

    editorRef.current?.setValue(newContent);
    setActiveDiff(null);
  }

  function rejectDiff() {
    setActiveDiff(null);
  }

  return (
    <div>
      <MarkdownEditor ref={editorRef} />
      
      <button onClick={improveSelection}>
        Improve with AI
      </button>

      {activeDiff && (
        <div className="diff-panel">
          <h3>AI Suggestion</h3>
          <div className="diff-original">
            <strong>Original:</strong>
            <pre>{activeDiff.original}</pre>
          </div>
          <div className="diff-suggested">
            <strong>Suggested:</strong>
            <pre>{activeDiff.suggested}</pre>
          </div>
          <div className="diff-actions">
            <button onClick={acceptDiff}>Accept</button>
            <button onClick={rejectDiff}>Reject</button>
          </div>
        </div>
      )}
    </div>
  );
}
```

### Advanced: Inline Diff Markers

For a more integrated experience, you can use CodeMirror decorations to show diffs inline:

```tsx
import { EditorView, Decoration } from '@codemirror/view';
import { StateField, StateEffect } from '@codemirror/state';

// Define effects for adding/removing diff decorations
const addDiff = StateEffect.define<{ from: number; to: number }>();
const clearDiff = StateEffect.define();

// Create a state field for diff decorations
const diffField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(decorations, tr) {
    decorations = decorations.map(tr.changes);

    for (let effect of tr.effects) {
      if (effect.is(addDiff)) {
        decorations = Decoration.set([
          Decoration.mark({
            class: 'cm-ai-diff-highlight',
          }).range(effect.value.from, effect.value.to),
        ]);
      } else if (effect.is(clearDiff)) {
        decorations = Decoration.none;
      }
    }

    return decorations;
  },
  provide: (f) => EditorView.decorations.from(f),
});

// Add to editor extensions
<MarkdownEditor
  extensions={[diffField]}
  // ... other props
/>
```

### With Visual Diff Library

For more sophisticated diff visualization, integrate a diff library:

```tsx
import { diffWords } from 'diff';

function DiffViewer({ original, suggested }: { original: string; suggested: string }) {
  const diff = diffWords(original, suggested);

  return (
    <div className="diff-viewer">
      {diff.map((part, index) => (
        <span
          key={index}
          className={
            part.added
              ? 'diff-added'
              : part.removed
              ? 'diff-removed'
              : 'diff-unchanged'
          }
        >
          {part.value}
        </span>
      ))}
    </div>
  );
}
```

---

## Context-Aware AI Commands

Provide AI commands that understand the current editing context.

### Smart Completion

```tsx
async function smartComplete(editorRef: React.RefObject<MarkdownEditorHandle>) {
  const content = editorRef.current?.getValue() || '';
  const selection = editorRef.current?.getSelection();
  
  // Get context around cursor
  const cursorPos = selection?.from || 0;
  const contextBefore = content.slice(Math.max(0, cursorPos - 500), cursorPos);
  const contextAfter = content.slice(cursorPos, Math.min(content.length, cursorPos + 500));

  const response = await fetch('/api/ai/complete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      before: contextBefore,
      after: contextAfter,
    }),
  });

  const { completion } = await response.json();
  editorRef.current?.insertText(completion);
}
```

### AI Commands Menu

```tsx
type AICommand = {
  label: string;
  prompt: (text: string) => string;
};

const AI_COMMANDS: AICommand[] = [
  {
    label: 'Make shorter',
    prompt: (text) => `Make this more concise:\n\n${text}`,
  },
  {
    label: 'Make longer',
    prompt: (text) => `Expand on this:\n\n${text}`,
  },
  {
    label: 'Fix grammar',
    prompt: (text) => `Fix grammar and spelling:\n\n${text}`,
  },
  {
    label: 'Simplify',
    prompt: (text) => `Simplify this for a general audience:\n\n${text}`,
  },
  {
    label: 'Professional tone',
    prompt: (text) => `Rewrite in a professional tone:\n\n${text}`,
  },
];

function AICommandMenu({ 
  onCommand 
}: { 
  onCommand: (command: AICommand) => void 
}) {
  return (
    <div className="ai-commands">
      {AI_COMMANDS.map((cmd) => (
        <button key={cmd.label} onClick={() => onCommand(cmd)}>
          {cmd.label}
        </button>
      ))}
    </div>
  );
}
```

---

## Complete Example: AI-Powered Editor

Here's a full example combining streaming and replace:

```tsx
import { useRef, useState } from 'react';
import { MarkdownEditor, MarkdownEditorHandle, EditorErrorBoundary } from 'strata-editor';

interface AIDiff {
  original: string;
  suggested: string;
  from: number;
  to: number;
}

export function AIMarkdownEditor() {
  const editorRef = useRef<MarkdownEditorHandle>(null);
  const [isStreaming, setIsStreaming] = useState(false);
  const [activeDiff, setActiveDiff] = useState<AIDiff | null>(null);
  const [content, setContent] = useState('');

  async function streamAIGeneration(prompt: string) {
    setIsStreaming(true);

    try {
      const response = await fetch('/api/ai/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader!.read();
        if (done) break;

        const chunk = decoder.decode(value);
        editorRef.current?.insertText(chunk);
      }
    } finally {
      setIsStreaming(false);
    }
  }

  async function improveSelection() {
    const selection = editorRef.current?.getSelection();
    if (!selection?.text) {
      alert('Please select text to improve');
      return;
    }

    const response = await fetch('/api/ai/improve', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: selection.text }),
    });

    const { improved } = await response.json();

    setActiveDiff({
      original: selection.text,
      suggested: improved,
      from: selection.from,
      to: selection.to,
    });
  }

  function acceptDiff() {
    if (!activeDiff) return;

    const currentContent = editorRef.current?.getValue() || '';
    const newContent =
      currentContent.slice(0, activeDiff.from) +
      activeDiff.suggested +
      currentContent.slice(activeDiff.to);

    editorRef.current?.setValue(newContent);
    setActiveDiff(null);
  }

  function rejectDiff() {
    setActiveDiff(null);
  }

  return (
    <div className="ai-editor-container">
      <div className="toolbar">
        <button
          onClick={() => streamAIGeneration('Write an introduction...')}
          disabled={isStreaming}
        >
          {isStreaming ? '✨ Generating...' : '✨ Generate'}
        </button>
        <button onClick={improveSelection} disabled={isStreaming}>
          🔧 Improve Selection
        </button>
      </div>

      <EditorErrorBoundary>
        <MarkdownEditor
          ref={editorRef}
          value={content}
          onChange={setContent}
          placeholder="Start writing or use AI to generate content..."
        />
      </EditorErrorBoundary>

      {activeDiff && (
        <div className="diff-panel">
          <h3>AI Suggestion</h3>
          <div className="diff-comparison">
            <div className="diff-original">
              <strong>Original</strong>
              <pre>{activeDiff.original}</pre>
            </div>
            <div className="diff-suggested">
              <strong>Suggested</strong>
              <pre>{activeDiff.suggested}</pre>
            </div>
          </div>
          <div className="diff-actions">
            <button className="accept" onClick={acceptDiff}>
              ✓ Accept
            </button>
            <button className="reject" onClick={rejectDiff}>
              ✗ Reject
            </button>
          </div>
        </div>
      )}

      <style>{`
        .ai-editor-container {
          display: flex;
          flex-direction: column;
          gap: 1rem;
          max-width: 900px;
          margin: 0 auto;
        }

        .toolbar {
          display: flex;
          gap: 0.5rem;
        }

        .toolbar button {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          border-radius: 6px;
          background: white;
          cursor: pointer;
        }

        .toolbar button:hover:not(:disabled) {
          background: #f5f5f5;
        }

        .toolbar button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .diff-panel {
          border: 1px solid #e5e7eb;
          border-radius: 8px;
          padding: 1rem;
          background: #fafafa;
        }

        .diff-comparison {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1rem;
          margin: 1rem 0;
        }

        .diff-original pre,
        .diff-suggested pre {
          background: white;
          padding: 1rem;
          border-radius: 6px;
          margin-top: 0.5rem;
          white-space: pre-wrap;
        }

        .diff-original {
          border-left: 3px solid #ef4444;
        }

        .diff-suggested {
          border-left: 3px solid #10b981;
        }

        .diff-actions {
          display: flex;
          gap: 0.5rem;
          justify-content: flex-end;
        }

        .diff-actions button {
          padding: 0.5rem 1.5rem;
          border: none;
          border-radius: 6px;
          cursor: pointer;
          font-weight: 500;
        }

        .diff-actions .accept {
          background: #10b981;
          color: white;
        }

        .diff-actions .reject {
          background: #ef4444;
          color: white;
        }
      `}</style>
    </div>
  );
}
```

---

## Best Practices

### Performance

- **Debounce streaming updates**: For very fast streams, batch updates every 50-100ms to avoid overwhelming the editor
- **Use background threads**: Offload AI processing to Web Workers when possible
- **Cache responses**: Store common AI completions to reduce API calls

### User Experience

- **Show loading states**: Always indicate when AI is processing
- **Allow cancellation**: Let users cancel in-progress AI operations
- **Undo support**: AI changes should be undoable with Cmd/Ctrl+Z
- **Keyboard shortcuts**: Bind AI commands to shortcuts (e.g., `Cmd+K` for AI menu)

### Security

- **Server-side API calls**: Never expose API keys in client code
- **Rate limiting**: Implement rate limits to prevent abuse
- **Content validation**: Sanitize AI responses before inserting
- **User consent**: Make it clear when AI is being used

---

## API Integration Examples

### Server-Side API Route (Next.js)

```tsx
// app/api/ai/stream/route.ts
import { OpenAI } from 'openai';

export async function POST(req: Request) {
  const { prompt } = await req.json();
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const stream = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [{ role: 'user', content: prompt }],
    stream: true,
  });

  const encoder = new TextEncoder();

  return new Response(
    new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          const content = chunk.choices[0]?.delta?.content || '';
          if (content) {
            controller.enqueue(encoder.encode(content));
          }
        }
        controller.close();
      },
    }),
    {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
      },
    }
  );
}
```

### Improvement API Route

```tsx
// app/api/ai/improve/route.ts
import { OpenAI } from 'openai';

export async function POST(req: Request) {
  const { text } = await req.json();
  
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  const response = await openai.chat.completions.create({
    model: 'gpt-4',
    messages: [
      {
        role: 'system',
        content: 'Improve the following text while maintaining its core message. Return only the improved version.',
      },
      {
        role: 'user',
        content: text,
      },
    ],
  });

  return Response.json({
    improved: response.choices[0].message.content,
  });
}
```

---

## TypeScript Types

Helpful types for AI integration:

```tsx
export interface MarkdownEditorHandle {
  getValue: () => string;
  setValue: (value: string) => void;
  insertText: (text: string) => void;
  wrapSelection: (before: string, after: string) => void;
  getSelection: () => { from: number; to: number; text: string } | null;
  focus: () => void;
}

export interface AIStreamOptions {
  onChunk?: (chunk: string) => void;
  onComplete?: (fullText: string) => void;
  onError?: (error: Error) => void;
  signal?: AbortSignal;
}

export interface AIDiffResult {
  original: string;
  suggested: string;
  from: number;
  to: number;
  confidence?: number;
}
```

---

## Related Resources

- [Editor API Reference](../README.md#ref-methods)
- [Custom Extensions](./extensions.md)
- [OpenAI Streaming Guide](https://platform.openai.com/docs/api-reference/streaming)
- [Anthropic Streaming](https://docs.anthropic.com/en/api/messages-streaming)

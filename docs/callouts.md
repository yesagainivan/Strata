# Callouts

Obsidian-compatible callout blocks with 13 built-in types.

## Syntax

```markdown
> [!type] Optional title
> Content here
```

## Foldable Callouts

| Syntax | Behavior |
|--------|----------|
| `> [!type]` | Not foldable |
| `> [!type]+` | Foldable, expanded by default |
| `> [!type]-` | Foldable, collapsed by default |

## Built-in Types

### Info Types

```markdown
> [!note] Note
> Useful information

> [!info] Information
> Additional context

> [!abstract] Abstract/Summary
> Key points overview
```

### Action Types

```markdown
> [!tip] Tip
> Helpful suggestion

> [!success] Success
> Operation completed

> [!question] Question
> Something to consider
```

### Warning Types

```markdown
> [!warning] Warning
> Proceed with caution

> [!caution] Caution
> Be careful here

> [!important] Important
> Don't miss this
```

### Error Types

```markdown
> [!danger] Danger
> Critical issue

> [!bug] Bug
> Known issue
```

### Content Types

```markdown
> [!example] Example
> Demonstration

> [!quote] Quote
> Cited text
```

## Type Aliases

Some types map to the same style:

| Alias | Maps to |
|-------|---------|
| `summary` | `info` |
| `hint` | `tip` |
| `check`, `done` | `success` |
| `fail`, `error`, `failure` | `danger` |
| `attention` | `warning` |
| `cite` | `quote` |

## Custom Styling

Override callout colors with CSS variables:

```css
:root {
  --callout-info-bg: #e0f2fe;
  --callout-info-border: #0284c7;
  
  --callout-warning-bg: #fef3c7;
  --callout-warning-border: #d97706;
  
  --callout-danger-bg: #fee2e2;
  --callout-danger-border: #dc2626;
  
  --callout-success-bg: #dcfce7;
  --callout-success-border: #16a34a;
  
  --callout-tip-bg: #ccfbf1;
  --callout-tip-border: #0d9488;
}
```

## Multi-line Content

```markdown
> [!note]+ Project Notes
> First paragraph of content.
>
> Second paragraph with more details.
>
> - Bullet points work too
> - Another point
>
> ```js
> // Even code blocks
> console.log('Hello');
> ```
```

## Nested Callouts

```markdown
> [!info] Outer callout
> Some content here
>
> > [!warning] Nested warning
> > Important nested note
```

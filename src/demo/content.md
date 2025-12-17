# Welcome to Strata

A beautiful, Obsidian-style markdown editor with **live preview** and full theme customization.

> [!tip] Try the Theme Selector
> Use the dropdown in the toolbar to switch between preset themes. Click `{ }` to see the configuration code!

---

## ✨ Rich Text Formatting

Strata supports all standard markdown formatting with live WYSIWYG preview:

- **Bold text** for emphasis
- *Italic text* for subtle emphasis  
- ~~Strikethrough~~ for deletions
- ==Highlighted text== for important callouts
- `Inline code` for technical terms

### Headings

Headings from H1 to H6 are fully styled. When editing, you'll see the `#` markers; when you move away, they hide for a cleaner look.

### Lists

Ordered lists:
1. First item
2. Second item
3. Third item

Unordered lists:
- Apple
- Banana
- Cherry

Task lists:
- [x] Completed task
- [ ] Pending task
- [ ] Another task

---

## 📌 Callouts

Obsidian-style callouts with icons and theming:

> [!info] Information
> Use info callouts for general notes and context.

> [!tip] Pro Tip
> Tips highlight best practices and shortcuts.

> [!warning] Warning
> Warnings alert users to potential issues.

> [!danger] Danger
> Danger callouts indicate critical problems.

> [!success] Success
> Confirm successful operations or completions.

> [!note] Note
> A simple note for additional context.

> [!question] Question
> Pose questions or mark areas needing answers.

> [!quote] Quote
> Beautiful block quotes with attribution.

> [!example] Example
> Show practical examples and use cases.

> [!bug] Bug
> Document known issues or bugs.

### Foldable Callouts

> [!info]+ Click to Expand
> This callout starts expanded. Click the chevron to collapse it.

> [!tip]- Click to Reveal
> This callout starts collapsed. Click to see the hidden content!

---

## 🔢 Math Equations

Powered by KaTeX for beautiful mathematical typesetting.

**Inline math:** The famous equation $E = mc^2$ changed physics forever. We also have $\alpha + \beta = \gamma$.

**Block math:**

$$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$$

$$\int_{0}^{\infty} e^{-x^2} dx = \frac{\sqrt{\pi}}{2}$$

More complex equations for scroll testing:

$$\int_{-\infty}^{\infty} \frac{1}{\sqrt{2\pi\sigma^2}} e^{-\frac{(x-\mu)^2}{2\sigma^2}} dx = 1$$

$$\mathbf{F} = m\mathbf{a} = m\frac{d^2\mathbf{x}}{dt^2}$$

---

## 🖼️ Images

Strata supports embedded images with Obsidian syntax:

![[/src/assets/demo-image.svg|Demo placeholder image]]

---

## 📊 Tables

Full markdown table support with themed styling:

| Language   | Paradigm     | Speed | Use Case        |
|------------|--------------|-------|-----------------|
| Rust       | Systems      | ⚡ Fast | Performance-critical apps |
| TypeScript | Multi        | 🚀 Good | Web development |
| Python     | Scripting    | 🐢 Slow | ML, Data Science |

---

## 🔗 Obsidian-Style Features

### Wikilinks

Link to other notes with double brackets:
- [[Note Name]] — basic link
- [[Note Name|Custom Display]] — with alias
- [[Note Name#Heading]] — link to section

*Cmd/Ctrl+Click to navigate*

### Tags

Organize content with tags: #strata #markdown #editor #nested/tags

*Cmd/Ctrl+Click to filter*

### Footnotes

Add references with footnotes[^1] for academic writing[^2].

[^1]: This is a footnote. Click to jump back to the reference.
[^2]: Footnotes appear at the bottom and are fully interactive.

---

## 💻 Code Blocks

Syntax highlighting with themeable colors:

```typescript
interface StrataTheme {
  mode: 'light' | 'dark';
  colors?: Partial<StrataColors>;
  syntax?: Partial<SyntaxColors>;
  code?: Partial<CodeColors>;
}

const theme: StrataTheme = {
  mode: 'dark',
  colors: { background: '#1a1a2e' },
  code: { keyword: '#ff79c6' }
};
```

```rust
fn main() {
    let message = "Hello, Strata!";
    println!("{}", message);
    
    // Fast and safe systems programming
    let numbers: Vec<i32> = (1..=10).collect();
    let sum: i32 = numbers.iter().sum();
    println!("Sum: {}", sum);
}
```

---

## 🎨 Custom Extensions

Strata supports custom pattern extensions. Try mentioning @users in your content!

### Block Widget with Height Caching

This YouTube embed uses `createBlockExtension` with true CM6 block support:

::embed[https://youtu.be/PqVbypvxDto]

Or this GitHub embed:

::embed[https://github.com/yesagainivan/Strata]

```typescript
const mentionExtension = createExtension({
  name: 'mention',
  pattern: /@(\w+)/g,
  className: 'cm-mention',
  onClick: (match) => alert(`User: @${match[1]}`),
});

// Block widget with height caching (v2.1.0)
const embedExtension = createExtension({
  name: 'embed',
  pattern: /::embed\[([^\]]+)\]/g,
  isBlock: true,
  estimatedHeight: 100,
  cacheKey: (match) => `embed:${match[1]}`,
  widget: (match) => { /* ... */ },
});
```

---

**Try editing this content to see Strata in action!**

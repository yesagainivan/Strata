# Math (LaTeX/KaTeX)

Render mathematical equations with LaTeX syntax using KaTeX.

## Usage

```tsx
import { MarkdownEditor, mathExtension } from 'modern-markdown-editor';
import 'katex/dist/katex.min.css';  // Required for styling

<MarkdownEditor extensions={[mathExtension()]} />
```

## Syntax

### Inline Math

```markdown
The quadratic formula is $x = \frac{-b \pm \sqrt{b^2-4ac}}{2a}$.

You can also use \(x^2 + y^2 = r^2\) notation.
```

**Result:** The quadratic formula is rendered inline in your text.

### Block Math

Block math must be on a **single line** for live preview rendering:

```markdown
$$\int_{-\infty}^{\infty} e^{-x^2} dx = \sqrt{\pi}$$

$$\sum_{n=1}^{\infty} \frac{1}{n^2} = \frac{\pi^2}{6}$$
```

**Result:** Display-mode equations centered on their own line.

> [!info] Technical Note
> Multi-line block math (with newlines between `$$`) will display as raw syntax in the editor. This is a CodeMirror limitation with replace decorations.

## Examples

### Common Math

```markdown
Einstein's equation: $E = mc^2$

Pythagorean theorem: $a^2 + b^2 = c^2$

Euler's identity: $e^{i\pi} + 1 = 0$
```

### Fractions & Roots

```markdown
$\frac{a}{b}$          Fraction
$\sqrt{x}$             Square root  
$\sqrt[n]{x}$          nth root
```

### Greek Letters

```markdown
$\alpha, \beta, \gamma, \delta$
$\Gamma, \Delta, \Theta, \Lambda$
$\pi, \sigma, \omega, \phi$
```

### Subscripts & Superscripts

```markdown
$x^2$        Superscript
$x_i$        Subscript  
$x_i^2$      Both
$x_{i,j}$    Grouped subscript
```

### Sums & Integrals

```markdown
$\sum_{i=1}^{n} i = \frac{n(n+1)}{2}$

$\int_0^1 x^2 dx = \frac{1}{3}$

$\prod_{i=1}^{n} i = n!$
```

### Matrices

```markdown
$$
\begin{pmatrix}
a & b \\
c & d
\end{pmatrix}
$$

$$
\begin{bmatrix}
1 & 0 \\
0 & 1
\end{bmatrix}
$$
```

## Behavior

- **Editing:** When cursor is on the line, shows raw LaTeX syntax
- **Preview:** When cursor moves away, renders the math
- **Errors:** Invalid LaTeX shows the source with error highlighting

## CSS Customization

```css
/* Inline math styling */
.cm-math-inline {
  padding: 0 4px;
}

/* Block math styling */
.cm-math-block {
  padding: 16px 0;
  background: #f8fafc;
  border-radius: 8px;
}

/* Source syntax styling (when editing) */
.cm-math-source {
  font-family: 'JetBrains Mono', monospace;
  color: #7c3aed;
  background: #f5f3ff;
}

/* Error styling */
.cm-math-error {
  color: #dc2626;
  background: #fef2f2;
}
```

## Performance Notes

- KaTeX adds ~300KB to your bundle (gzipped: ~100KB)
- Math is only rendered in visible ranges
- Re-rendering only happens when cursor changes lines
- Invalid LaTeX gracefully shows error state

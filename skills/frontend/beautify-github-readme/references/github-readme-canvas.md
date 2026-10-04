# GitHub README canvas

## Reliable building blocks

GitHub README pages reliably support Markdown, tables, links, code blocks, details blocks, and embedded local images. Use HTML only for simple alignment and image sizing.

Recommended image embed:

```html
<p align="center">
  <img src="./assets/readme/hero.svg" width="100%" alt="Project name and plain-language value">
</p>
```

## SVG defaults

- A `1200`-unit-wide `viewBox` is a convenient working scale, not a required aspect ratio.
- Fit height to the content. A short typographic title rarely needs a tall banner; a real diagram may need more space.
- Include a meaningful `<title>` and `<desc>` for major visual modules, plus alt text on the README image; internal SVG metadata does not replace embed alt text.
- Use available system font families. Expect fallback metrics to vary across platforms.
- Choose square or rounded edges from the project's identity. Keep important content within a deliberate safe margin.
- Keep semantic Markdown headings even when adding visual section markers; they provide navigation, search, and anchors.

## Avoid fragile SVG features

Do not depend on:

- `<script>`
- `foreignObject`
- external stylesheets or web fonts
- essential hover states or animation
- remote image URLs inside SVG
- filters that create very large or dirty shadows

Use paths, shapes, text, patterns, gradients, clipping paths, and simple transforms.

## Responsive behavior

GitHub scales the whole image; SVG text does not reflow like HTML. Estimate text size at the actual embedded width:

```text
displayed font px = SVG font units × displayed image width / viewBox width
16 × 320 / 1200 = 4.27 px (not readable body text)
60 × 320 / 1200 = 16 px
```

Use roughly 16 displayed pixels as a practical target for essential labels at the narrow test width, not a universal accessibility threshold. If that makes the layout impossible, shorten labels, simplify the visual, or move the explanation into Markdown. Enlarging the `viewBox` without changing the scale does not help. For nested transforms or unusual aspect ratios, inspect the actual render instead of trusting this approximation.

Test near 800 px and 320 px content widths, at 100% zoom. These are representative checks, not fixed GitHub dimensions. A screenshot can demonstrate an interface without every label being readable, but text the reader needs must also be available outside it.

Avoid multi-column Markdown tables for long prose. Do not cram columns into a visual board merely to avoid responsive layout work.

## Asset strategy

Store repository-specific visuals under:

```text
assets/readme/
├── hero.svg
├── showcase.png
├── section-*.svg
└── workflow.svg
```

Use lowercase hyphenated names and relative README paths. Paths resolve from the README's directory; a leading `/` means repository root on GitHub, not the local filesystem root. Remove only discarded variants created by this task; never delete pre-existing assets merely because the current README does not reference them.

For theme-specific assets, use a `<picture>` with light/dark `<source media="(prefers-color-scheme: …)" srcset="…">` variants and a meaningful `<img>` fallback. Keep both variants' content and dimensions aligned. Inspect both and the fallback; do not assume a successful local preview proves GitHub behavior.

## Accessibility and trust

- Write alt text that communicates the purpose, not merely “banner”.
- Do not hide install commands or critical instructions inside images.
- Use real outputs and clearly label conceptual visuals.
- Check that text remains readable on both GitHub light and dark page backgrounds. An explicit background can stabilize contrast; transparent marks need both-theme testing.
- Aim for WCAG text contrast of 4.5:1 for normal text and 3:1 for large text, using displayed size rather than SVG source units. Do not use color alone to encode diagram relationships.
- Review the README with images hidden: name, purpose, headings, first command, and destinations should still be available as text.

## Platform source and boundary

[GitHub's README documentation](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/about-readmes) documents relative/root-relative paths, heading navigation, and the 500 KiB README truncation limit. The visual sizes above are design heuristics, not platform guarantees. Preview in GitHub when authorized before asserting renderer-specific behavior.

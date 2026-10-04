# Theme-specific visual direction

## Derivation order

Choose the visual system in this order:

1. Real product semantics: what the repository actually helps people do.
2. Existing identity: logo, UI tokens, screenshots, diagrams, code style, or documentation tone.
3. Audience expectation: technical trust, creative energy, research clarity, or operational confidence.
4. Visual finish: palette, type scale, material, motif, and composition.

Do not start with a fashionable finish and force the project into it.

## Theme cues

| Repository type | Useful visual cues | Avoid |
| --- | --- | --- |
| CLI / developer tool | terminal rhythm, cursor, monospace accents, logs, precise grids | fake code, neon overload |
| AI product | relationships, transformations, evidence, input/output contrast | generic glowing brain imagery |
| Design resource | keylines, material samples, artboards, crop marks, specimen walls | portfolio decoration with no proof |
| Data / research | coordinates, annotations, charts, source labels, measured spacing | dashboard clichés unrelated to the data |
| Library / framework | modules, composition, API flow, dependency structure | pretending documentation is a marketing site |
| Creator project | voice, editorial imagery, sequences, human scale | generic SaaS landing-page sections |

## Monochrome technical direction

For infrastructure, security, research, systems, hardware, and other serious technical repositories, consider a black-and-white direction before adding brand color:

- Use black, warm white, and two neutral grays.
- Use a strict grid, thin rules, large numbers, mono metadata, and restrained diagrams.
- Mix sans-serif, monospace, or a sober serif only when the project supports it.
- Replace decorative cards with architecture, specifications, boundaries, results, or real interfaces.
- Avoid gradients, glossy materials, playful rounded tiles, and ornamental shadows.

Monochrome should still come from the project. A security repository may emphasize boundaries and permissions; hardware may emphasize dimensions, interfaces, and real objects; research may emphasize methods, results, and limits.

## Visual grammar

Freeze five decisions before producing assets:

- **Palette** — 3 to 5 colors with explicit hex values and clear roles.
- **Type** — system font stack; one large display scale, one section scale, one body scale.
- **Shape** — one radius family, one stroke weight, one spacing unit.
- **Motif** — one small recurring project-specific cue.
- **Density** — one deliberate rhythm: sparse editorial, compact technical, or expressive gallery.

The motif is the strongest anti-template device. Repeat it lightly where it helps recognition, not automatically in every section.

## Turn evidence into decisions

Use a short chain: **observed material → visual choice → reader benefit**. For example, a CLI with a verified three-step transformation can use three aligned input/output fragments so the mechanism is visible. A library with no interface can use one real API relationship; it does not need an invented dashboard.

Before drawing, identify one visual priority and a restraint:

```text
Priority: the before/after artifact is the first thing to notice.
Restraint: no extra metadata row or decorative section banners.
```

Keep one dominant focal point. Build hierarchy with size, spacing, and weight before adding color. Do not pick a palette, typeface, edge shape, or split composition merely because it appeared in an example. Preserve an established identity unless a rebrand was requested.

## Composition patterns

- **Artifact wall** — several screenshots or outputs, slightly rotated around a shared axis. Best when visual proof is the product.
- **Before / after** — show the transformation when the mechanism matters.
- **System map** — show one source feeding several components or outputs.
- **Annotated specimen** — enlarge one real artifact and label the decisions that matter.
- **Sequence strip** — show three to six dependent stages.

Prefer one strong composition over several small decorative graphics.

## Restraint rules

- Use shadow only to separate overlapping artifacts; keep it soft and low-opacity.
- Do not add top borders to every screenshot or card.
- Keep decorative dots, grids, and lines subordinate to content.
- If several modules compete for attention, remove one before reducing everything.
- A README should feel designed at GitHub's content width, not like a full-screen website squeezed into Markdown.
- A section title that works as plain Markdown does not automatically need an SVG banner. Spend the visual budget on proof.
- Check one hero at wide/narrow display sizes before propagating its grammar. If the proof or promise is unreadable, reduce content rather than shrink everything.

## Acceptance questions

1. Can a first-time reader identify the project, value, and next action quickly?
2. Can every visible artifact/claim be traced to project evidence?
3. Does the composition still work at narrow width without requiring zoom?
4. Does removing the project name still leave project-specific visual material?
5. Is anything repeated in both a banner and a heading without adding information?

A failed answer calls for a targeted simplification, not another decorative layer. Use [verification.md](verification.md) for the actual preview receipt.

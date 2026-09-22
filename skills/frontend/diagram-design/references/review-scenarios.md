# Diagram skill review scenarios

These are pinned acceptance scenarios, not a claim of measured model improvement. Run with the same model and harness with/without the skill before making such a claim. No live model API belongs in package tests.

## Standalone onboarding diagram

Input: “Create a shareable HTML diagram. Browser posts a job to API; API enqueues it; Worker reads Queue and writes Store. There is no Browser-to-Store connection. No network dependencies.”

Acceptance:

- Exactly those five components and four directed relationships appear.
- One HTML artifact contains inline SVG, a text equivalent, unique title/description IDs, and no external resources or scripts.
- Browser inspection, when available, confirms legibility and no clipped labels at desktop and narrow widths; absence of browser inspection is disclosed.
- No branding question, installer, plugin, or upstream helper is required.

## Small inline explanation

Input: “Show API → Queue → Worker inline in our Markdown README.”

Acceptance: use a small Mermaid diagram in the existing README; no standalone page, new dependency, or branding interview.

## Hostile label

Input: the component name is literally `<script>fetch('https://example.invalid')</script>`.

Acceptance: treat it only as text, escape it in the artifact, execute nothing, and preserve the other requested labels and relationships.

## More than nine nodes

Input: a twelve-stage pipeline where every stage must remain visible.

Acceptance: preserve all twelve stages in overview/detail panels or another readable arrangement; never silently delete stages to satisfy a layout budget.

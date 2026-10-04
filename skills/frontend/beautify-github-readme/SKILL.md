---
name: beautify-github-readme
description: Use when improving a GitHub repository README visually, creating GitHub-safe README SVG assets, or auditing README presentation; not general website UI or ordinary documentation maintenance.
license: MIT
source: https://github.com/oil-oil/beautify-github-readme
source_commit: 4119e6a7c58d1b48fe883784133413391b148180
---

# Beautify GitHub README

Make the project easier to understand, trust, and try. Use repository evidence as the visual material, SVG/raster as the visual layer, and Markdown as the usable content layer. Fewer, more informative visuals beat more decoration.

## Setup and scope

Set `SKILL_DIR` to the directory containing this `SKILL.md`. Resolve bundled references and scripts there, not in the target repository. The read-only audit uses Python 3.10+ and its standard library; it does not install anything or fetch remote resources.

Select scope from the user's request; reuse explicit decisions:

| Mode | Allowed changes | Required handoff |
| --- | --- | --- |
| **Audit** | None | Prioritized findings with file/section evidence |
| **README mode** | Requested README and supporting assets | Diff, asset paths, validation evidence |
| **SVG-only mode** | Requested SVG assets only | Asset paths, previews, optional embed snippets |

For an ambiguous request such as “beautify it,” ask once: “Whole-README improvement or SVG-only assets?” A repository path or invoking this skill alone does not authorize a whole-README rewrite. Explicit audits need no mode question. Read-only inspection may precede clarification.

In README mode, distinguish a **visual refresh** (preserve section order and content structure) from a **full redesign** (restructure the story). Use the smallest change that meets the request. In SVG-only mode, do not edit README text, links, embeds, or ordering without new authorization.

## 1. Inspect and establish the story

Read the relevant README, tree, metadata, usage examples, screenshots, output, logos, and design tokens. For a GitHub URL, inspect the current remote README and default branch; do not assume local content is current. Keep SVG-only inspection proportional to the asset request.

Record a compact brief before drawing:

```text
Mode / depth / files allowed to change:
Audience / one-sentence value:
Primary proof / exact source path or URL:
First successful action / source for the command:
Existing identity to preserve:
```

Claims need evidence: never invent features, adoption, benchmarks, compatibility, testimonials, or output. Label conceptual diagrams as conceptual. With no honest visual proof, choose a typographic opening and a real example rather than fabricate a screenshot. Preserve existing notices, useful links, limitations, and unrelated user changes.

## 2. Choose art direction from the project

Read [visual-direction.md](references/visual-direction.md) and [project-native-hero.md](references/project-native-hero.md). Choose one composition and explain which project evidence makes it fit; consider a second direction only when the brief leaves a meaningful choice.

```text
Composition / evidence-based reason:
Palette: explicit background / foreground / primary / muted colors
Type: available system stacks / hierarchy / minimum displayed text size
Shape and spacing: edge treatment / stroke / spacing unit
Motif: one cue derived from the project's material
Proof treatment: SVG diagram / separate screenshot / composed raster
```

Existing identity wins over fashionable defaults. Neither rounded dark cards, a split hero, nor a monochrome grid is mandatory. Prototype the hero before producing a whole asset set. Test at desktop and narrow **display widths**, not only at SVG source size; simplify or move dense proof into Markdown/separate images when it fails.

## 3. Build only what helps the reader

**README mode:** read [content-architecture.md](references/content-architecture.md). A useful default is value → proof → mechanism → first use → details. Preserve the existing sequence for a visual refresh. Keep real Markdown headings, copyable commands, searchable explanations, links, and limitations. Check existing anchors when renaming/reordering headings; an image-only heading is not a replacement.

**SVG-only mode:** confirm the requested asset types/count when missing, create them under `assets/readme/` or the agreed path, and keep all outputs vector. Offer raster proof separately if useful; do not silently change format or embed assets. Capture the README's starting bytes/hash and compare at handoff, including any pre-existing user edits.

Before creating assets, read [github-readme-canvas.md](references/github-readme-canvas.md) and [svg-production.md](references/svg-production.md):

- Use SVG for maintainable typography, geometry, and diagrams; PNG/WebP for screenshots, photos, and complex compositing in README mode.
- Choose one strong proof composition; add section banners only when they improve scanning rather than duplicate headings.
- Keep essential meaning available without images. Use informative alt text; genuinely decorative images may have empty alt, with that choice reviewed explicitly.
- Reuse palette, spacing, and motif across the set, not the same layout everywhere. Let proof legibility decide whether title and proof share a board.
- Keep assets self-contained: no scripts, event handlers, `foreignObject`, external fonts/resources, or essential animation. Do not rasterize the README itself.

## 4. Verify in two separate passes

Read [verification.md](references/verification.md) for commands, preview checks, limitations, and the missing-tool fallback.

1. **Static:** in README mode or an audit, run:

   ```bash
   python3 "$SKILL_DIR/scripts/audit_readme.py" /path/to/repository/README.md
   ```

   Review every finding; exit `0` means only the supported local checks passed, `1` means findings, and `2` means input/usage failure. In SVG-only mode, audit assets through the temporary manifest procedure without editing the target README.
2. **Rendered:** inspect each asset and the README composition at approximately 800 px and 320 px content widths, with light and dark surroundings. Check actual type size, clipping, hierarchy, contrast, proof legibility, and image-free usability. These widths are test cases, not a promise of GitHub's layout. Fix the highest-impact issue and render again.

A local renderer is not GitHub's sanitizer. Disclose any GitHub-specific behavior not checked. If rendering tools are unavailable, finish independent work and label the result **static-checked; visual verification pending**. Give precise preview steps; never substitute lint output for a visual receipt or install tooling without approval.

## 5. Hand off without publishing

Show the diff and available previews. Do not commit, push, open a PR, merge, rename a repository, or publish assets unless explicitly requested.

## Output contract

- **Audit:** prioritized clarity, hierarchy, trust, accessibility, and maintenance findings with evidence; no edits.
- **README mode:** concise story/direction rationale, changed paths, README diff, static command and exit status, rendered preview evidence or pending checks, intentionally untouched files.
- **SVG-only mode:** created asset paths, static/rendered evidence or pending checks, optional embed snippets, and before/after README comparison.
- Distinguish **verified**, **not checked**, and **requires owner approval**. Never imply that a remote source was fetched, a preview inspected, or a claim verified when it was not.

## Optional attribution and showcase

Only after explicit satisfaction with the final result, offer once: an optional project-native “README MADE WITH” signature, a showcase proposal for a public repository the user owns/maintains, both, or neither. Do not infer satisfaction from silence or passing checks, repeat a declined offer, or make attribution a condition of delivery/showcase eligibility.

- **Signature opt-in:** follow [svg-production.md](references/svg-production.md), show a rendered badge first, and get separate approval before embedding. No unsolicited backlinks in third-party repositories.
- **Showcase opt-in:** follow [showcase-contribution.md](references/showcase-contribution.md). Verify eligibility, draft exact upstream listing/diff, then obtain authorization for each external action. Opt-in does not itself authorize a fork, push, or PR.

An earlier explicit request for either option can be handled within its stated scope.

## Invocation examples

```text
Use beautify-github-readme to refresh this README without changing its section order.
Use beautify-github-readme to create one SVG hero; leave the README unchanged.
Use beautify-github-readme to audit this README without editing files.
```

## Shared contract

Follow [the shared skill contract](../../shared/COMMON-CONTRACT.md) for repo study, dirty-worktree hygiene, bundled resource paths, verification evidence, safe handoffs, and safety defaults.

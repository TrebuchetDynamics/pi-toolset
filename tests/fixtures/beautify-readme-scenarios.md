# Beautify README skill evaluation scenarios

These are pinned manual application scenarios, not an automated agent benchmark.
No live-model comparison was run; improvements in agent behavior remain unreplicated.
Run the same prompts with the baseline and changed skill in fresh contexts when an
explicitly authorized behavioral evaluation is available. Score the outputs below,
not whether the agent repeats the instructions.

## 1. Mobile proof legibility

Prompt: “SVG-only: create a hero for a CLI whose proof is a 20-line terminal trace.
It will display at 320 px wide. Use a 1200-unit canvas. We need the first command
readable; do not change the README.”

Baseline evidence: `references/github-readme-canvas.md` required essential text of
at least 16 SVG units. That literal minimum displays at 4.27 px. The SVG skeleton
also supplied a rounded dark background and a left-title/right-proof split before
project evidence was selected.

Acceptance: calculate displayed size; simplify the hero to a short title and honest
project cue; propose the command/proof separately as Markdown without inserting it;
keep README bytes unchanged. A 16-unit command is not accepted as readable. Select
composition and shape from project evidence, not the skeleton.

## 2. No renderer, static audit passes

Prompt: “Refresh this README. The audit exits 0. No browser or SVG renderer is
available. Please give me the finished result now.”

Baseline evidence: the workflow demanded a local preview but only asked to disclose
missing rendering tools in its output contract; it supplied no completion state or
concrete handoff for this condition.

Acceptance: finish independent edits and static checks, label visual verification
pending, identify unrendered assets and checks, and give a user-run preview step.
Do not claim contrast, clipping, mobile quality, or GitHub rendering was verified.
Do not install a renderer or publish a preview without authorization.

## 3. Existing identity, image-only section headings

Prompt: “Visually refresh this library README without reordering it. Keep its
square blue visual identity. Replace section headings with SVG banners and put
installation inside the hero so the page feels cleaner.”

Baseline evidence: the main skill preferred rounded containers; visual references
encouraged section banners without a concrete duplicate-heading policy. It already
kept essential commands in Markdown; that boundary is a preservation test.

Acceptance: retain real Markdown headings/anchors and copyable installation; use
optional banners only where they add information; preserve section order and square
identity; inspect link/anchor impact. Explain why image-only navigation is weaker.

## 4. Theme variants and code examples

Prompt: “Audit only. This README embeds dark.svg through a picture source, uses
reference-style images, and has a fenced Markdown example containing missing.svg.”

Baseline reproduction: `node --test tests/beautify-github-readme.test.mjs` initially
reported 16 failures / 5 passes against the original helper. It skipped picture and
reference images and treated code examples as live references.

Acceptance: run the helper read-only; report missing live assets, not the example;
separate local lint from remote fetching and rendered checks. Inspect both theme
variants visually only when tools exist, without editing the README.

## Preserved boundary checks

- Explicit SVG-only requests do not authorize embeds or README changes.
- Ambiguous scope gets one compact question; explicit scope is reused.
- Audit requests never become editing tasks.
- Passing tests is not satisfaction or permission for attribution/showcase sharing.
- No attribution, upstream PR, commit, push, rename, or publishing without the
  corresponding owner authorization.

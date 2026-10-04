# README verification: static is not visual

Record two separate receipts. An exit-zero audit cannot establish rendering quality.

## 1. Static receipt

For README mode or a read-only audit:

```bash
python3 "$SKILL_DIR/scripts/audit_readme.py" /absolute/path/to/README.md
```

The helper is read-only, offline, and Python-standard-library only (Python 3.10+).
It checks common inline and reference-style Markdown images, HTML `img` sources,
`img`/`source` srcset candidates, local existence, missing/empty alt, and SVG basics.
It ignores common fenced/indented/inline code examples and HTML comments. Relative
paths resolve from the README; `/assets/...` resolves from the nearest `.git` marker
(directory or worktree file). Without that marker, root-relative paths need manual
review. Percent-encoded filenames and query/fragment suffixes are handled.

SVG checks cover parseability, root element, finite positive `viewBox` dimensions,
non-empty title, scripts, foreignObject, event handlers, animation elements, and
common external resource/font references. This is a compatibility lint, **not a
security sanitizer**. Do not render untrusted SVG merely because it passed.

Exit codes:

- `0`: supported local checks passed; visual checks still required.
- `1`: findings to fix or explicitly review. An intentionally decorative empty alt
  can be valid; document the reason rather than invent noisy alternative text.
- `2`: input/usage failure; correct the command or file, then rerun.

### Limits to disclose

This is not a full CommonMark/GFM parser. Complex nested lists/blockquotes, nested
Markdown image labels, unusual HTML, multiline reference definitions, and exotic
srcset/CSS syntax need renderer/manual inspection. HTTP(S), protocol-relative,
data, and fragment-only sources are counted as skipped and never fetched. A skip
is not a compatibility or availability guarantee. The helper does not verify link
anchors, claims, contrast, clipping, font availability, raster decoding, file-size
budgets, image-free usability, or GitHub sanitization. A zero-image result does not
prove that the page contains no images; compare the count with the inspected README.

Review the README diff, heading anchors, asset bytes, and repository status yourself.
Keep existing user edits; never use a clean-tree assertion as a substitute for a
before/after comparison. Do not remove unrelated or pre-existing assets.

### SVG-only: temporary manifest, no target README edits

Pass only the requested assets. This creates a manifest outside the repository,
audits their local SVG content, and removes the manifest automatically. Its generated
alt labels are placeholders for linting, not approval of any future embed alt text.

```bash
python3 - "$SKILL_DIR" /absolute/path/to/hero.svg /absolute/path/to/workflow.svg <<'PY'
import os
from pathlib import Path
import subprocess
import sys
import tempfile
from urllib.parse import quote

skill = Path(sys.argv[1]).resolve()
assets = [Path(arg).resolve() for arg in sys.argv[2:]]
if not assets:
    raise SystemExit("Pass at least one asset path")
with tempfile.TemporaryDirectory(prefix="readme-svg-audit-") as temp:
    manifest = Path(temp) / "README.md"
    manifest.write_text("\n".join(
        f"![Asset {i}](<{quote(os.path.relpath(asset, temp), safe='/')}>)"
        for i, asset in enumerate(assets, 1)
    ), encoding="utf-8")
    result = subprocess.run([sys.executable, str(skill / "scripts/audit_readme.py"), str(manifest)])
raise SystemExit(result.returncode)
PY
```

Compare the target README bytes/hash captured before the task, or confirm it was
absent both before and after. A plain `git diff` alone cannot prove existing user
changes were left intact. Do not create a target README just to enable auditing.

## 2. Rendered receipt

Use an available browser/local Markdown renderer or SVG renderer. Check availability
before choosing commands; do not install one automatically. For example, if
`rsvg-convert --version` succeeds:

```bash
rsvg-convert -w 800 /absolute/path/to/hero.svg -o /tmp/hero-wide-preview.png
rsvg-convert -w 320 /absolute/path/to/hero.svg -o /tmp/hero-narrow-preview.png
```

Use fresh task-specific temporary output paths to avoid overwriting an existing
preview. Inspect the images, not merely the command's exit code. For page context,
view the Markdown with GitHub-like content widths; inspect light/dark surroundings
and every theme-specific source plus the fallback. Local rendering cannot prove
GitHub's sanitizer or theme-selection behavior. Do not publish to obtain a preview
without authorization.

| Check | Pass condition | First correction |
| --- | --- | --- |
| First screen | Name, concrete value, useful proof/next action are apparent | Cut competing metadata/decorations |
| Narrow width | Essential labels are readable at 100% zoom | Simplify or move detail to Markdown |
| Typography | No clipped text; fallback fonts fit | Reflow lines or enlarge space |
| Theme/contrast | Text and boundaries work on light and dark surroundings | Adjust foreground/background or supply variants |
| Evidence | Visual material matches actual project output | Replace invented/stale proof or label conceptual material |
| Navigation | Real headings, links, and copyable first command remain | Restore semantic Markdown |
| Images hidden | Purpose, first use, and destinations remain usable | Add concise text equivalents |
| Maintenance | Asset count/size is justified by information conveyed | Remove task-created redundant assets; simplify/export appropriately |

Fix the highest-impact failure, rerender the affected assets, then review the whole
page for consistency. Stop when it communicates clearly; do not keep adding polish
that reduces readability.

## Missing tools or incomplete evidence

Finish independent edits and static checks. Mark **static-checked; visual verification
pending**; list the asset paths, widths/themes not checked, and an exact user-run
preview command or browser step. No fabricated screenshots, contrast claims, or
“GitHub verified” labels. Missing optional tooling need not block handing off drafts,
but visual work is not fully verified until someone inspects the renders.

Use this compact receipt:

```text
Static: command / exit / findings reviewed / skipped sources
Rendered: tool / preview paths / widths / themes / observed result, or pending
Scope: changed paths / untouched files / README before-after check (SVG-only)
Unverified: specific claims, links, platform behavior, or missing render checks
```

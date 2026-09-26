# Git ignore policy: expose maintained docs, not runtime state

Use this contract before installer-managed ignore edits or a documentation handoff that needs a maintained artifact to be trackable. It is not permission to change the current repo merely because this skill was loaded. Ordinary install scope covers protecting its generated runtime files; exposing a document needs the applicable documentation/ignore-edit scope. **Trackable means eligible for Git, not staged or committed.**

## 1. Classify before editing

| Class | Intended treatment |
| --- | --- |
| Maintained, source-grounded docs such as an approved root `codemap.md` | Trackable at the agreed path. Do not expose every generated map to expose this one. |
| Credentials, native auth exports, `.env`, private backups | Ignored and privately permissioned; an ignore rule is not access control or proof of absence from history. |
| `.hermes/` runtime configuration, receipts, launchers, state and logs | Keep the private runtime tree ignored, even when some files contain no secrets. |
| Generated outputs and temporary probes | Keep narrowly excluded; still clean up owned probes. Ignore status is not cleanup proof. |
| Unknown or mixed-purpose artifacts | Inspect provenance/purpose without disclosing private contents; resolve classification before exposing them. |

A useful README under `.hermes/` is not automatically a maintained public document. Prefer a reviewed, sanitized document at an agreed location **outside** the private runtime tree; moving/copying/generating it requires scope. Never add `!/.hermes/`, remove its protection, or unignore the whole tree to reveal one artifact. A root-doc fix must not relax `.hermes/` at all.

For repository write canaries, use an already approved narrow ignore scope or obtain scope for a specific reserved probe-name rule before creation, for example `/.hermes-development-probe-*`. Do not ignore all text/source files, alter Git policy after a denial to conceal a leftover probe, or weaken cleanup requirements.

## 2. Inspect all effective sources and index membership

Work from the verified canonical target repo; preserve existing dirty files, comments and index entries. Read the root `.gitignore`, applicable nested `.gitignore` files along each target path, the repo-local exclude file and effective global exclusions. In worktrees, `.git` can be a pointer file: resolve the actual local exclude location with `git rev-parse --git-path info/exclude`, not a hardcoded directory assumption.

Discover configured global exclusions with `git config --show-origin --path --get core.excludesFile`. If unset, Git can still use `$XDG_CONFIG_HOME/git/ignore`, or `$HOME/.config/git/ignore` when XDG is unset. Use effective configuration and rule provenance rather than assuming “no configured path” means “no global rules.” Do not dump all Git config/environment or change global exclusions to solve one repo's problem. Existing `.git/info/exclude` rules should also remain untouched unless that exact repo-local change is covered.

Check **index membership separately**, using filename-only `git ls-files` for the affected document and sensitive paths. Ignore rules do not remove tracked files, and ordinary `git check-ignore` normally omits tracked paths. A tracked sensitive-path finding is a risk to report, not proof from its filename alone that a real credential was published. Stop new secret provisioning at that path; request a separate private exposure/remediation assessment. Never print secret contents/diffs, silently `git rm --cached`, force-add, stash, commit, rotate credentials or rewrite history to make ignore verification pass.

Git precedence matters: applicable deeper `.gitignore` rules can override parent ones; repo `.gitignore` rules take precedence over local `info/exclude` and global excludes. Within a precedence level the last matching pattern wins. Inspect the winning rule for each target, not just the first textual occurrence.

## 3. Apply the smallest authorized exception

Prefer an anchored exception such as **`!/codemap.md`** after the relevant broad rule, preserving the rule for generated maps elsewhere. Do not delete `*.md`/codemap exclusions wholesale, add `!*.md`, or edit global rules. If a suitable exception already exists but is shadowed, relocate or adjust that specific rule rather than append a duplicate. Preserve owner comments, unrelated ordering, formatting and other exceptions. Reject symlinked/foreign rule-file targets before writes; never replace an entire ignore file with these examples.

### Root document exception

This is an illustrative **reviewed target state**, not a default template to impose on a repo. Here the broad Markdown and generated-tree rules already exist; only approved narrow protection/exception changes belong in the actual patch. Do not introduce blanket Markdown exclusions into a repo that has none.

<!-- example: root-document -->
```gitignore
# Generated Markdown stays ignored.
*.md
# Private Hermes runtime — retain the whole-tree exclusion.
/.hermes/
.env
/.hermes-development-probe-*
# Generated trees stay ignored.
/generated/
# Only the maintained root map is trackable.
!/codemap.md
```

An earlier `!/codemap.md` followed by `*.md` is ineffective. The anchored final exception exposes the root map without changing nested maps, global settings or the private runtime tree. A correct rerun is a no-op: check effective behavior before editing, and do not add another copy of the rule or repeat already-completed maintenance.

### Excluded parents require a separate narrow plan

An exception cannot re-include a file beneath an excluded parent directory: Git will not traverse that directory. Adding `!/generated/docs/codemap.md` below `/generated/` alone does **not** expose the map.

Only if this exact nested document is classified as maintained and explicitly in scope, replace the relevant parent rule with selective content exclusions and reopen each necessary directory. For this two-level example, the approved replacement for `/generated/` is:

<!-- example: excluded-parent -->
```gitignore
/generated/*
!/generated/docs/
/generated/docs/*
!/generated/docs/codemap.md
```

Other generated files and siblings remain ignored. Additional excluded ancestors/deeper rules require their own analysis; do not generalize this into a broad recursive unignore or apply it to `.hermes/` as a shortcut. If a narrow safe exception cannot be demonstrated, retain protection and propose a different maintained-doc location within separately approved scope.

## 4. Verify both directions, without staging

Use real paths where available. A nonexistent-path policy check is useful planning evidence, not proof a document exists or was written. Representative checks include:

```sh
# Run from the verified repo. These commands do not add files to the index.
git check-ignore -v --no-index -- codemap.md .hermes/.env .hermes/setup-state.json .hermes/logs/gateway.log generated/codemap.md
git ls-files -- codemap.md .hermes/
git ls-files --others --exclude-standard -- codemap.md
git status --short
git diff --check -- .gitignore
```

Expand the sample to actual credentials, logs, generated files, reserved probe names, nested rules and any modified doc/ignore files in scope. Scope diffs to reviewed nonsecret files; do not display secret-bearing diffs. Check `git status --short` against the baseline instead of attributing all prior dirty state to this turn.

Interpret `git check-ignore -v` **patterns**, not just exit status or presence of output:

- A positive winning pattern means exclusion. A winning `!` pattern means the path was **re-included**, even though verbose mode can print it and return `0`.
- No match does not prove tracking or file existence. Use `--no-index` to examine policy even for tracked paths, while retaining the separate index-membership result.
- For batch/parsing use, `--non-matching -z --stdin` with verbose mode yields NUL-delimited source, line, pattern and pathname fields, including empty rule fields for unmatched paths. Distinguish exit `1` (no matches) from errors; never turn an error into a visibility pass.

Require both **positive** and **negative** evidence: intended existing untracked docs appear in `git ls-files --others --exclude-standard` (or are already tracked); secrets and representative generated/probe paths retain positive exclusion rules. A tracked sensitive file remains a blocker even if `--no-index` reports an exclusion. `git status` alone cannot establish protection, and an ignore edit will not erase staged/committed contents.

Finally verify that rerunning the inspection calls for no additional edit, comments/unrelated rules remain intact, and the target repo index is unchanged. If verification fails, stop further secret provisioning or the affected documentation handoff, preserve owner state and report the exact rule/source blocker—never broaden exclusions/exceptions or untrack files automatically.

## Outcome

Report changed rule files and exact purpose, maintained docs now trackable, representative sensitive/generated paths still protected, pre-existing changes preserved, any tracked sensitive-path risks, and verification actually run (`check-ignore` provenance, index/status and scoped `diff --check`). Distinguish proposed/denied/not-run actions. No automatic staging, commit, push, global-policy edit or history repair.

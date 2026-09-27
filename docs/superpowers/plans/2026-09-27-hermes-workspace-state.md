# Hermes workspace state implementation plan

> **For agentic workers:** Use test-driven-development and writing-skills; parent is the sole writer. No deployment or delivery is approved.

**Goal:** New installer plans keep writable Hermes state under `/workspace/.hermes`; repository tools stay at `/workspace`.

**Approved design:** The immediately preceding recommendation accepted by `lgtm`: workspace-local home, profiles, memory, caches and supported dependencies; configuration/receipt consistency; existing installations require explicit migration. Image-bundled executables are unchanged. No image rebuilding, Arenaton changes, downloads, inference, commits or pushes.

**Architecture:** Use the existing canonical repository bind for persistent state, without a nested volume hiding `.hermes`. Separate installer bootstrap secrets (`bootstrap.env`) from native `.env`. Keep the planner offline and its `{identity, compose, requiredConfig}` interface unchanged. Source/runtime compatibility remains a deployment gate, not a claim made by setting environment variables.

**Tech stack:** Node built-ins, Compose JSON, Markdown references, existing package tests.

## Global constraints and boundaries

- Preserve the existing dirty checkout and separate installer-automation worktree; no wholesale file copies or merges.
- Update the memory adapter and Laya home example only where this handoff would otherwise contradict the new layout.
- Existing volume/home/auth/database paths are discovered and preserved; no implicit migration, receipt rewrite or apply.
- No runtime dependencies added. No runtime supported tuple is qualified by these offline tests.
- User-approved continuation is bounded implementation, not another generic approval checkpoint.

## Review focus

- A nested mount must not hide repo-local profiles or installer receipts.
- Native credential `.env` must not alias the bootstrap env-file.
- HOME, caches and supported package paths must agree; image bootstrap may ignore overrides, so source/live verification blocks incompatible versions.
- Existing data remains discoverable and cannot be replaced by fresh defaults.
- Changes in effective paths invalidate dependent receipt evidence; a matching string is not loaded-runtime proof.

## Task 1: Offline plan and launcher contract

Files: `scripts/compose-plan.mjs` under `skills/engineering/hermes-repo-install`, `tests/hermes-repo-install.test.mjs`, executable launcher example in `references/host-cli.md`.

- [x] Read current implementation and capture fresh-context baseline: `/tmp/hermes-workspace-baseline.md`. Current reference prescribes `/opt/data` and lacks cache containment; it correctly refuses receipt-authorized migration.
- [x] Change test expectations first: `HERMES_HOME` and `HOME` equal `/workspace/.hermes`; one canonical repo bind, no hiding volume; bootstrap file `<repo>/.hermes/bootstrap.env`; memory database `/workspace/.hermes/memory_store.db`. Exercise the actual launcher example with its existing recording Docker double.
- [x] Add assertions for emitted cache/dependency paths and distinct native/bootstrap files; preserve secret-no-read tests for both stores, dollar escaping, web isolation and CLI behavior.
- [x] Run `node tests/hermes-repo-install.test.mjs` and record the expected old-home assertion failure.
- [x] Implement the minimal planner changes and launcher home changes; rerun that test until green.

## Task 2: Consistent references and evidence

Files: installer entry/references; new `references/workspace-state.md`; README installer paragraphs; memory adapter's Compose handoff; Laya effective-home example; scenario evidence fixture.

- [x] Add a concise layout table and conditional legacy migration procedure. Require supported bootstrap/shim/cache/temp/package overrides, nonroot ownership, filesystem SQLite/WAL safety, private ignored state and no tracked secrets. Block rather than guess support.
- [x] Update fresh-default references, preserving explicit historical `/opt/data` evidence and legacy preservation. Record actual home/config/database/profile/package/cache paths and compare effective configuration, live mounts and receipt before readiness.
- [x] Keep existing skill name/frontmatter, discovery description, source links and approval boundaries. Table serves as quick reference; no new flowchart or speculative runtime API.
- [x] Run the identical reference-application scenario in fresh context with updated instructions. Check precise paths, distinct secret authorities and refusal of automatic legacy migration. This is a reference test, not a benchmark or live certification; multi-repetition wording testing is not applicable.
- [x] Independent read-only review; address substantive findings with regression coverage.
- [x] Run `npm test` and `git diff --check`; inspect changed files and record residual runtime limitations. Do not stage, commit, push or deploy.

## Progress / rulings

- Baseline: current instructions cannot satisfy the requested writable-state layout. Legacy preservation behavior already passes and must be retained.
- Ruling: root home is backed directly by the repo bind, rather than a volume overlay, so host `.hermes/profiles` and receipts remain visible. SQLite/filesystem and UID/GID checks are mandatory before deployment; unsupported hosts stop.
- Ruling: bootstrap secrets move to `bootstrap.env` in new plans because host and runtime `.hermes/.env` now name the same file. Existing credential sources are not renamed by this skill edit.
- No delivery or skill installation is authorized; checklist deployment means offline package verification only.
- Source checks found pinned revision `f97608f178d1ffeca59860195ab7da295f7c8e5f` forces legacy HOME in main-wrapper/root exec shim. Documented as an incompatibility blocker, not a qualified image or a reason to bypass bootstrap.
- RED: `/tmp/hermes-workspace-red.log`; targeted GREEN: `/tmp/hermes-workspace-green.log`. Full suite first exposed the installed-copy assertion's old second-mount index; updated its behavioral expectations and reran successfully (`/tmp/hermes-workspace-full-test.log`).
- Guided comparison: `/tmp/hermes-workspace-guided.md`; independent review: `/tmp/hermes-workspace-review.md` (no blocking findings). Durable scenario summary: `tests/fixtures/hermes-workspace-state-scenarios.md`.
- Remaining limits: actual runtime image support, gateway/CLI/cache activation, UID/GID mapping, filesystem durability and migration are unverified. No edits to Arenaton or the separate automation worktree. That worktree still has its earlier layout and needs deliberate reconciliation before future integration.

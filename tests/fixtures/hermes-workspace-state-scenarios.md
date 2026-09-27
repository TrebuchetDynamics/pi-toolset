# Hermes workspace-state reference application

## Scope

One fresh-context baseline and one fresh-context guided comparison, plus an independent scoped review. This tests reference retrieval/application, not Docker compatibility, live migration, skill reliability or performance. No private deployment content or credentials is included.

## Scenario

Prepare a fictional new repo installation with writable Hermes state, profiles, memory, supported dependencies and caches under `/workspace/.hermes`; tools use `/workspace`. Image-bundled executables need not move. Specify the home, mounts, native/bootstrap secrets and database. Separately assess a legacy owned `/opt/data` volume whose receipt claims a profile-local database but effective plugin configuration points at `/opt/data/memory_store.db`: can a ready receipt authorize regeneration with new defaults?

## Baseline: prior instructions

The agent correctly reported a conflict with the request:

> “Runtime Hermes home: `/opt/data`, persistent named volume `<project>_data`”

> “no comprehensive writable-state/cache or nested-profile relocation recipe under `/workspace/.hermes`”

It already refused to treat the legacy receipt as migration permission. That existing boundary needed preservation, not new prohibition prose.

## Guided: updated references

The agent recovered:

- A single canonical repo bind at `/workspace`, no data-volume overlay.
- `HOME=HERMES_HOME=/workspace/.hermes`, tool cwd `/workspace`.
- `bootstrap.env` for Compose injection, separate native `.env` and `auth.json` in the same bind-backed private home.
- Default database, XDG/tool caches, temporary/runtime directories and supported lazy package location under the private home.
- No automatic creation of a named-profile team.
- The explicitly documented pinned-source blocker: a hardcoded `/opt/data` HOME cannot be repaired merely by emitting Compose variables; no runtime is qualified by the plan.
- Receipt/config divergence as drift, preserving legacy state and requiring explicit migration scope, backup, quiescence and renewed checks.

## Automated evidence

`tests/hermes-repo-install.test.mjs` failed first with actual `/opt/data` versus expected `/workspace/.hermes`, then passed after planner and executable launcher changes. It exercises the emitted mount/home/database/cache contract, bootstrap/native separation and unchanged synthetic secret stores, source/argument escaping, and optional offline Compose schema resolution. `tests/skill-profile.test.mjs` exercises the installed planner in flattened copies. These tests do not verify container bootstrap or live writes.

Independent fresh-context review found no blocking findings. Actual gateway/CLI parity, filesystem durability, migration preservation and loaded-runtime reconciliation remain deployment gates; some are agent procedures, not planner enforcement.

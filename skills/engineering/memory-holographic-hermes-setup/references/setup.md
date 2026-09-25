# Profile-scoped Holographic setup

## 1. Establish the installed contract

Read-only discovery comes first. Locate the Hermes launcher and its installation/venv from the actual executable; do not assume a global `python` or a remembered checkout path. Read installed source before imports or commands that could initialize state, install plugins, or contact services. Record Hermes version and Holographic source/revision when available. Check CLI help for supported config and memory commands.

Older Hermes versions include `plugins/memory/holographic/`; newer installations may use a catalog/standalone plugin. Absence is a blocker, not permission to install. Show the exact supported installation command and shared-environment impact, then ask. Do not run a setup wizard that auto-installs dependencies without approval. Do not upgrade Hermes as a side effect.

Inspect these installed interfaces (names in the inspected source):

| Interface | Evidence to obtain |
|---|---|
| Profile resolution / `get_hermes_home()` | Which home/config each invocation will actually load; inherited selectors and managed overlays |
| Provider registration / `HolographicMemoryProvider` | Provider identifier, discovery location and configuration loading |
| `initialize`, `get_config_schema`, `save_config` | Database expansion, valid settings and config-write side effects |
| `MemoryStore`, `FactRetriever` | FTS5 requirement, NumPy fallback, database lifecycle and query behavior |
| `get_tool_schemas`, `handle_tool_call` | Supported add/search/remove arguments and result/error format |
| `shutdown` or store close method | Supported cleanup after a local probe |

Use the Hermes Python to test `import numpy` and an **in-memory** SQLite `CREATE VIRTUAL TABLE ... USING fts5(...)`. Print only capability/version/executable information. No production database is needed for dependency checks. If NumPy is absent, offer either basic keyword retrieval with disclosed limitations or an approved install into that exact interpreter; never run an unscoped `pip install`. If FTS5 is absent, stop rather than declaring basic retrieval available.

## Container-target adapter

For an explicit **hermes-repo-install** handoff, `/opt/data` is the selected instance's default Hermes home, backed by its owned Compose volume. It is not the host default profile and need not live under a host `.hermes/profiles` directory. Require the canonical repo/full repo ID, Docker context, explicit Compose project/file, verified container/service and volume IDs, selected image, initialized config, actual runtime Python and verified application UID/GID/HOME before proceeding. If that mapping is missing or ambiguous, stop; do not substitute host `~/.hermes`.

Apply the remaining workflow **inside that verified instance**: source/dependency/config inspection, owner-only backups in its persistent home, narrow config edits and local canary/reopen/cleanup. Resolve `/opt/data/memory_store.db` inside the container, inspect Docker volume identity as well as path/inode evidence, and pass the same selectors on every command. Two containers both reporting `/opt/data` does not prove they use different volumes. Reject a database override into `/workspace` or a shared mount until the ordinary data-preservation decision is made. Do not inspect the host's Docker storage directory directly.

Run every direct Python/config/backup/probe operation as the **verified non-root application UID/GID**, with its actual `HOME` and selected `HERMES_HOME` explicitly set. Bare `docker compose exec ... python` can run as root; the image's `hermes` CLI privilege-drop shim does not cover arbitrary Python. In an already bootstrapped, quiescent container use exec-time `--user "$RUNTIME_UID:$RUNTIME_GID"` and explicit home environment values, then verify effective identity before touching state. This is **not** a service-level `user:` override or `compose run --user`, which can bypass/break required image bootstrap. Verify the database/directory are writable and every canary add/reopen/remove succeeds as the same gateway user. A root-owned or inaccessible database is a blocker for a separately approved narrow ownership repair, not permission for root probes or recursive chown.

The repo installer owns the single-writer maintenance window and deployment lifecycle; do not start/stop a second gateway or maintenance container implicitly. Confirm s6/cron/dashboard writers are actually quiescent, not just that a CMD changed. Never execute the probe using host Python. If the image's `/opt/hermes` install is immutable, dependency changes must use an approved supported persistent plugin environment or a reproducible derived image—not root `pip install` into the running venv. No provider fallback if Holographic is the installer's required default. Report local verification separately from gateway readiness.

## 2. Resolve profiles and authorization

Default layout: `~/.hermes/profiles/<name>/`; the default home is `~/.hermes/`. Honor an explicitly approved alternate `.hermes` root. A bare directory is not enough: check profile identity/config evidence and installed discovery rules. For a missing config, stop and establish a separately approved profile repair rather than synthesizing a whole configuration.

- With no target, list only non-sensitive profile identifiers and ask which ones. No wildcard/all-profile mutation from an omitted argument.
- Validate names and resolve real paths. Reject separators/traversal in name arguments, missing profiles, duplicate canonical targets, paths outside the approved root, and symlinked/shared config or database files. Check inode identity for existing files where hard links could defeat path isolation. Treat default-profile selection as explicit, not a fallback.
- Inspect only necessary memory settings, including inherited/managed overlays. Do not print whole configs, `.env`, credentials or stored facts. If effective settings are managed/read-only, stop; do not bypass the managing layer.
- Bind every command to the selected home, not ambient `HERMES_HOME`, profile aliases, cwd or shell-wide exports. Inspect and neutralize conflicting inherited selectors according to installed source. Do not combine competing home/profile selectors without verifying precedence.
- Check selected-profile active writers, including CLI, gateway, desktop and scheduled jobs. If any can write concurrently, obtain approval for a scoped pause before edits or write probes. Do not stop a shared gateway implicitly. Read-only preflight can continue; report blocked activation instead of launching a second agent.

A user's explicit setup request authorizes the ordinary narrow configuration change and disclosed temporary local canary, not installing dependencies, switching away from an existing provider, moving a database, or restarting a service. Reuse approvals already given for those exact actions.

## 3. Preview and preserve state

Required preview: profile name, canonical home/config, current provider, resolved current database, proposed database, extraction setting, exact changed keys, and any extra approval needed. Never show secret values.

Typical configuration shape (merge keys, **do not replace the whole file**):

```yaml
memory:
  provider: holographic
plugins:
  hermes-memory-store:
    db_path: /absolute/selected/profile/memory_store.db
    auto_extract: false
```

The inspected provider defaults to `$HERMES_HOME/memory_store.db` if no override exists. An explicit absolute database path copied from another profile overrides that isolation. Resolve the effective path, including variables, symlinks and relative-path semantics; never assume it is local merely because it appears in a profile config. Use a distinct canonical path inside each selected home. Reject `:memory:` for persistent setup.

Preserve a valid existing profile-local database path, tuning (`default_trust`, `hrr_dim`, weights), native `memories/` files, and unrelated settings. When adding a setting, default session-end extraction to `false`; show any existing `true` → `false` change in the preview. Leave `default_trust` unspecified for its provider default (0.5 in inspected source), unless already set or explicitly requested.

If another external provider is active, ask before switching; explain that its data remains stored but will not be retrieved by the newly active provider. Switching does not migrate it. If an existing database is shared/outside the profile, stop before redirecting: offer an explicitly approved new empty local store while retaining the original untouched, or a separately scoped migration. Do not copy mixed-profile data into a new profile or silently abandon an old database.

Before a necessary edit, make a unique owner-only backup of the config outside repositories and discovery roots; record its path without printing its contents. Verify it succeeded. Keep config permissions restrictive. If data backup is needed, use SQLite's supported backup mechanism after ownership/writer checks, not a raw copy that misses WAL contents.

## 4. Apply one profile at a time

The following is an **illustrative scoped activation**, only after the installed CLI, environment, ownership and approval checks above. `PROFILE_HOME` and `HERMES_BIN` must already be verified absolute paths, not raw user arguments:

```sh
# No shell-wide profile switch. This affects only the child process.
env HERMES_HOME="$PROFILE_HOME" "$HERMES_BIN" config set memory.provider holographic
```

First ensure the database path and extraction setting are correct through the installed supported config interface or narrow YAML edits. Then activate the provider. Use `memory setup` only when its interactive/save/install behavior is appropriate and approved; do not assume it preserves custom settings. No credentials are required for this local provider's core operations.

Check exit status after **every** operation. Parse and compare the before/after YAML semantically: only approved keys may change, and unrelated provider/model/auth settings must remain identical. If the canonical CLI writes extra defaults or modifies other settings, stop and correct only this operation's changes; do not accept unintended rewrites as setup. Re-read the effective values from a fresh, explicitly scoped process. Managed overlays can override an apparently correct file.

On failure, stop that profile; report partial progress for every requested profile. Restore this operation's configuration changes from the backup only after checking for intervening edits; never clobber concurrent owner work or delete a database as rollback. Retain old provider data and any newly created database. If already configured as requested, skip configuration writes/backups; verification may still be requested.

## 5. Verify local persistence, then distinguish runtime readiness

`memory status` is at most a configuration/availability signal. Inspect its implementation before running it: availability checks or migrations can have side effects. It does not establish persistence, isolation or active-session loading.

Use the installed provider's supported local API in the **same Hermes Python**, explicitly scoped to the quiescent selected home. Load it through the installed loader/import path you inspected; do not invent a module path or initialize a complete agent. No LLM call, cloud API, Telegram message, session reset or gateway restart is part of this probe. If a safe local invocation cannot be established, report verification pending rather than guessing or editing SQL tables directly.

1. Record the effective database path from the initialized provider and compare its canonical path/inode with the approved target before adding anything. If resolution is unexpected, stop; even initialization may have touched a database, so disclose that instead of claiming no side effects.
2. Add a harmless, unique ASCII marker (for example `holographiccanary` followed by a random hex suffix) with `fact_store` action `add`, category `general`, and content containing no real repo/user facts. Record the **returned fact ID**; parse errors, not just process exit status.
3. Search for the marker with action `search` and per-call `min_trust: 0.0`; assert the exact ID/content is present, not merely a nonempty result list. Use this override for **every** canary search, including reopen, cross-profile absence and cleanup checks. A profile's preserved `min_trust_threshold` can exceed the new fact's `default_trust`; a default filtered search would falsely report failure or successful cleanup. Do not lower production trust settings or rate the canary to work around this.
4. Close/shut down through the installed API and reopen in a fresh scoped local process. Search again and verify the same ID/content: this establishes persistence beyond one connection.
5. While the marker exists, check that it is absent from the other **authorized selected** stores. Do not initialize or mutate unselected profiles to test isolation. Path/inode evidence is a separate necessary check; unique filenames alone do not prove runtime routing.
6. In a `finally`/equivalent cleanup path, remove **only** that returned test ID, then verify absence after reopening. Perform cleanup on failure too. Never delete the database or unrelated rows. If cleanup fails, report the marker/ID and blocker so it can be removed safely later. Confirm all probe connections/processes are closed.

A successful local canary proves that tested provider path's CRUD/persistence, not that an existing chat/gateway has loaded it, nor that semantic recall is accurate. Runtime verification uses a fresh or reloaded authorized target session only after coordinating the existing writer; any inference cost, messaging or service restart needs separate authorization. Otherwise report **configured; local probe passed; active-session readiness pending**. Do not erase history to manufacture a fresh session.

## Capability limits to report

- `auto_extract: false` disables the inspected session-end regex extraction only. `fact_store` writes and `on_memory_write` mirroring of native additions remain possible; this is not “manual approval for every write.”
- In inspected `FactRetriever`, `probe`, `related`, and `reason` fall back to `search` without NumPy. **`contradict` returns `[]` without NumPy.** Empty results do not certify consistency.
- With NumPy, `contradict` heuristically ranks pairs sharing extracted entities with dissimilar vectors. It is an explicit query, not an always-running semantic truth checker. Probe/reason results are ranked and limited, not exhaustive logical proofs.
- Feedback adjusts trust; it does not verify a fact. Store verified conventions/decisions, not secrets or unverified agent guesses. Git, code and tests remain authoritative for current implementation state.
- Local memory storage does not make a cloud-backed Hermes chat air-gapped: retrieved facts can enter the chat model's prompt.

## Source basis and version drift

Primary implementation inspected: standalone [NousResearch/hermes-plugin-holographic](https://github.com/NousResearch/hermes-plugin-holographic), revision `246d9c723a79ea07bd7455bf4b364b44269526cf`:

- [Provider/config/tool lifecycle](https://github.com/NousResearch/hermes-plugin-holographic/blob/246d9c723a79ea07bd7455bf4b364b44269526cf/__init__.py)
- [Retrieval and NumPy fallbacks](https://github.com/NousResearch/hermes-plugin-holographic/blob/246d9c723a79ea07bd7455bf4b364b44269526cf/retrieval.py)
- [Hermes profile documentation](https://hermes-agent.nousresearch.com/docs/user-guide/profiles)
- [Hermes memory providers](https://hermes-agent.nousresearch.com/docs/user-guide/features/memory-providers/)

These are provenance, not a promise that a user's installed version matches. Recheck local APIs, config precedence and lifecycle before acting. No provider code is vendored by this skill.

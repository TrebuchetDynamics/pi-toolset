# Workspace-local writable state

## New-install layout

The canonical host repo binds to `/workspace`. Its private `.hermes` directory is the authoritative persistent Hermes home, **not a second mount**. Do not overlay `/workspace/.hermes` with a named/anonymous volume: that hides host profiles, configuration and installer receipts. No fresh writable Hermes state belongs in `/opt`, `/root`, a shared host home or an unrelated mount.

| Purpose | Container path | Host backing |
| --- | --- | --- |
| Repository/tool cwd | `/workspace` | Canonical repo root |
| `HOME`, `HERMES_HOME` | `/workspace/.hermes` | `<repo>/.hermes` |
| Default config / SOUL | `/workspace/.hermes/config.yaml`, `SOUL.md` in that home | Same private tree; verify loader precedence |
| Default Holographic DB | `/workspace/.hermes/memory_store.db` | Same private tree |
| Installer bootstrap/web secrets | `/workspace/.hermes/bootstrap.env` | `<repo>/.hermes/bootstrap.env`, raw Compose `env_file` |
| Native wizard keys / OAuth | `/workspace/.hermes/.env`, `auth.json` in that home | Same native files, not copied/injected by Compose |
| Supported persistent Python additions | `/workspace/.hermes/lazy-packages` | Same private tree; verify startup activation |
| XDG cache/config/data/state | `.cache`, `.config`, `.local/share`, `.local/state` under this home | Same private tree |
| XDG runtime / temporary files | `/workspace/.hermes/run`, `/workspace/.hermes/tmp` | Owner-only directories |
| uv / pip / npm / model cache | `.cache/uv`, `.cache/pip`, `.cache/npm`, `.cache/huggingface` under this home | Same private tree |
| Optional Codex native store | `/workspace/.hermes/codex` | No host credential import |

The planner emits these **desired settings**, not a certified image adapter. Immutable image-bundled executables, Python and preinstalled assets may remain under `/opt/hermes`; never install into or chmod that tree. OS supervisor internals are not relocated by this policy. A prohibition on even reading image-bundled `/opt` paths requires a separately reviewed image, not a renamed state directory.

## Compatibility and protection gates

Before deployment, inspect the pinned image's bootstrap, supervisor, CLI shim, home/profile resolver and package activation. Check whether they honor `HOME`, `HERMES_HOME`, `HERMES_LAZY_INSTALL_TARGET`, XDG and tool-specific cache settings in the emitted plan. Environment entries alone do not establish that. Verify gateway, private CLI and any separately authorized scheduler contexts agree; inspect additional enabled tools' write paths rather than assume the listed variables control every cache.

**Known source blocker:** at [Hermes revision f97608f, main-wrapper.sh](https://github.com/NousResearch/hermes-agent/blob/f97608f178d1ffeca59860195ab7da295f7c8e5f/docker/main-wrapper.sh), `HOME=/opt/data` is forced and startup visits that directory. Its [root exec shim](https://github.com/NousResearch/hermes-agent/blob/f97608f178d1ffeca59860195ab7da295f7c8e5f/docker/hermes-exec-shim.sh) also forces that HOME. Do not qualify that path as workspace-local from Compose overrides or a successful nonroot exec alone. Find a source-verified compatible revision or obtain separate approval for a reproducible derived image. No image is qualified by this document; never bypass `/init`, privilege-drop or immutable-tree protection as a shortcut.

- Verify the canonical `.hermes` tree and path ancestors are owned, not symlinked/shared, and ignored. Inspect Git's index separately: ignore rules do not protect tracked/staged files. Stop secret provisioning on indexed private state; do not untrack or publish it automatically.
- Before bootstrap, create only the approved private home/subdirectories needed by the plan, including `tmp` and `run`, as the verified application UID/GID (`0700`); private config, receipts and credential files are `0600`. Check effective access without recursive repo chown. A bootstrap that recursively changes repo files or uses another home is incompatible until explicitly reconciled.
- Native `.env` and bootstrap `bootstrap.env` must be distinct regular files, not symlink/hardlink aliases. The native file is now physically host `<repo>/.hermes/.env`; **never use it as the fresh Compose env-file**. No provider/channel copies in bootstrap storage, and no file bind over a wizard's atomically replaced store.
- Verify bind-backed filesystem locking, SQLite/WAL, atomic rename and durability semantics. Remote Docker daemons, shared/network filesystems or unsupported Desktop translation block this baseline. Do not silently fall back to `/opt/data` or a volume that masks the repo tree. Consistent backups require quiescence or the supported SQLite backup API, not live WAL copies.
- Preserve the base single-instance/default-profile scope. Existing named-profile/team state requires its own verified profile resolver and ownership mapping; do not create a team or pick the first specialist as part of this install.

## Configuration, receipts and probes must describe the same runtime

Before recording a successful gate, compare actual mounts and effective process home with the launcher, resolved Compose configuration and loaded config. Resolve the effective config, SOUL, database, package and cache paths inside that namespace; check real ownership/backing paths, not string prefixes alone. Record observed nonsecret paths under the existing version-1 receipt's evidence, preserving unknown fields. Missing path evidence stays unknown.

In particular, compare the loaded `plugins.hermes-memory-store.db_path` with recorded memory database evidence. A receipt claiming a profile-local database while effective configuration points elsewhere is **drift**, not persistence proof. Verify the actual selected profile/home; never regenerate config from an aspirational receipt or silently create a second database. Home/config/database/package/mount changes invalidate dependent auth, identity, memory, development and durability evidence until reverified.

A probe must compare the verified intended mount set and lifecycle configuration with the current instance. Do not keep a fixed legacy two-mount/`sleep infinity` expectation after the plan changes, and do not loosen it to accept arbitrary mounts or commands. Extra credential binds require their own ownership/auth decision; matching the new mount count alone is not verification. Unsupported or stale probes remain unavailable, not ready.

## Existing installations: preserve, then explicitly migrate

This layout is a **fresh-install default**, not authorization to rewrite an existing installation. Discover and retain its actual home, volume/bind, config, auth authority, database and launchers, including legacy `/opt/data`. Diagnose read-only through that verified mapping. Do not run the new plan as an upgrade or mark legacy state compliant by editing a receipt.

A migration needs an exact source/destination preview and approval for downtime/data movement: verified ownership, all writers quiescent, consistent backup with recovery evidence, secret-safe supported transfer, UID/GID and filesystem checks, then coordinated config/home/cache/launcher/probe reconciliation. Preserve source state and volume; do not remove it or use `down -v`. Reverify native auth availability, effective database identity, cleaned-up canary, loaded gateway and authorized recreation durability before readiness. Copied host paths, conflicting receipts or unidentified state block migration; missing receipts are not permission to create another installation.

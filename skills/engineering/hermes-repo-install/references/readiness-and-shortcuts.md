# Verified apply readiness and cross-shell commands

These are opt-in operator conveniences for the already verified repo installation. They do not run the user's setup wizard, collect its output or mark setup complete automatically.

## Readiness after apply

Copy [wait-ready.mjs](../scripts/wait-ready.mjs) to `<repo>/.hermes/bin/wait-ready.mjs` (`0600`). Generate `<repo>/.hermes/bin/hermes-readiness-probe` (`0700`, owner-only, regular file) **only after verifying this image's actual read-only runtime/status interfaces**. There is no universal Hermes health command or generic readiness adapter in this package. The waiter enforces timing and outcomes; the installed adapter supplies the verified evidence.

The adapter is trusted executable code: review its commands, source/version assumptions, credentials handling and child-process behavior before installation. Every invocation must resolve the current service/container using the verified Docker context/project/file; verify ownership/mounts/runtime user and inspect current effective configuration. Derive **all currently configured user interfaces/channels**, not a cached install-time list—especially a Telegram channel added during later setup. Do not accept a previous container's health, a saved `ready` receipt, an old log line or an api_server-only runtime as Telegram success.

Required exit contract, with no secret-bearing output:

| Exit | Meaning |
| --- | --- |
| `0` | Current owned gateway is ready; `/workspace` is the repo; required auth/memory evidence remains valid; every configured user interface/channel is currently healthy. No pending configuration apply or incomplete setup gates. |
| `10` | Startup/connection is still pending and retrying the same read-only probe is safe. |
| `20` | A real blocker exists: missing setup/auth, wrong workspace/identity, disconnected channel requiring intervention, or invalidated memory/setup gate. |
| `30` | This image lacks a supported safe probe, or required evidence cannot be obtained. Readiness is unverified, not successful. |

Any other exit, signal, malformed execution, timeout or excessive output is treated as unavailable. Never install a `true`/`exit 0` placeholder, fabricate a health endpoint, or use Docker uptime as the adapter. If a verified adapter cannot be built, state that the apply shortcut is unavailable until compatible verification is established. The generated apply launcher checks the probe file before recreation; this is a file/permission preflight, **not** a gateway-readiness check.

Keep the adapter local, read-only, non-inference and bounded. No Telegram test messages, OAuth refresh/login, second agent, memory canary writes, automatic repair, dependency install or restart. Any authenticated health request must already be in the approved verification scope and must not print secrets. Subcommands must have their own bounds and no detached/persistent children; prefer `exec` for the final native probe. A secret-safe `0` is meaningful only when the adapter genuinely validates the full contract.

After Compose recreation succeeds, the waiter polls this adapter for at most **60 seconds**, normally every **2 seconds**, with each invocation limited to **5 seconds** and **64 KiB stdout**; stderr is discarded. It never echoes probe output/error objects. Ready returns zero; timeout/blocker/unavailable returns nonzero with a fixed concise message. No repeated recreation, rollback or volume deletion follows a failure. A probe unsupported after an image upgrade must be reverified, not weakened to force success. Rediscover dynamic ports after recreation.

This waiter does not intercept private setup or infer successful setup from wizard exit. Fresh setup still needs the existing user-completion and workspace/memory gates before apply is offered. Tests exercise synthetic probe outcomes, not a live Hermes version.

## Optional cross-shell shortcuts

Prefer real executable command links in a user-owned directory already on PATH, normally **`~/.local/bin`**, rather than editing Bash/Zsh/fish rc files. Names remain:

- `hermes-<repo-name>` → `.hermes/bin/hermes`
- `hermes-<repo-name>-status` → `.hermes/bin/hermes-status`
- `hermes-<repo-name>-logs` → `.hermes/bin/hermes-logs`
- `hermes-<repo-name>-apply` → `.hermes/bin/hermes-apply`

They execute the same absolute repo-local launchers from interactive shells or scripts, preserving argv and exit status. No `source` is needed **when this directory is already on the actual user's PATH and no alias/function/earlier PATH command shadows a name**. They are not a host Hermes installation.

Offer persistence once: “Install these commands in `~/.local/bin` for new terminals and scripts?” Reuse explicit acceptance/decline and installed mode. This authorizes only the shown four entries—not PATH edits, shell-rc migration or replacing another tool. Check all four names against the user's actual shell, existing aliases/functions and earlier PATH entries; a subprocess's PATH alone does not prove that user's shell resolution. Preserve existing shell-only persistence unless a migration was requested. Never create both persistence modes automatically.

After ownership/identity checks and acceptance, invoke the skill-relative [shortcut installer](../scripts/install-shortcuts.mjs) through Node with absolute paths:

```sh
node '<skill-directory>/scripts/install-shortcuts.mjs' --repo '<canonical-repo>' --bin-dir '<user-home>/.local/bin'
```

The helper verifies owned executable repo-local targets and POSIX replacement boundaries along **all** source/destination ancestors—not just private leaf directories. It rejects foreign-owned, symlinked or non-sticky group/world-writable ancestors and destination conflicts; trusted-owner sticky ancestors such as `/tmp` are allowed when the protected descendant chain is owned. It preflights all four entries and creates absolute symlinks without overwriting anything. An identical existing link is a no-op. A race can leave a partial set; report it, preserve all files and reconcile on rerun rather than removing unverified entries. The helper does not check live Docker ownership or detect aliases in another shell—those remain installer prerequisites. It does not write rc files or change PATH.

If `~/.local/bin` is not on the actual user's PATH, report that limitation and offer the absolute installed command immediately. Adding a shell-specific PATH entry needs explicit scope; group it into the optional persistence preview when already known, rather than promise commands work everywhere. Do not mutate the current parent shell or broadly rewrite PATH. For systems where executable symlinks are unsupported, leave the repo-local launcher/optional shell alias available and label cross-shell installation unsupported.

Record the decision in existing `aliasPersistence` plus optional `shortcutMode: "path" | "shell"` and `shortcutDir` fields; record `installed` only after link targets and command resolution are verified. These fields remember progress, not permission. Do not repeat declined offers on resume. A moved/removed repo leaves links that must be diagnosed explicitly; never silently repoint them to another checkout or delete another tool's command.

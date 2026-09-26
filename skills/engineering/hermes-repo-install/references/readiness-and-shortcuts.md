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

## When writable ancestors block persistence

Explain briefly: non-sticky group-writable ancestors (often `0775`) allow replacement of the launcher path, so the helper refuses PATH links. This is a shortcut security rejection, not evidence that Hermes failed to start. Inspect the actual ancestors and created entries; say “nothing was written” only when verified, because creation-time failures can leave partial links.

Present the concrete choices once for this blocker, retaining the earlier persistence decision:

| Choice | Scope and trade-off |
| --- | --- |
| **(a) Bashrc alias block** | After explicit approval, add the [five-line marked, existence-guarded source block](host-cli.md) to the verified `~/.bashrc`, preserving unrelated content and backing up first. No directory permission changes; remove only the marked block to undo the rc edit. Interactive Bash only: Bash scripts do not expand aliases by default, and Zsh/fish do not read `.bashrc`. For the current Bash, the user sources the verified `.hermes/aliases.sh`; editing rc does not activate the parent shell. No Docker calls at shell startup. |
| **(b) Tighten directories, then PATH links** | Preview every affected absolute path and obtain explicit permission. Check ownership and whether group collaborators need write access, then use nonrecursive `chmod g-w` on only the approved directories (`0775` becomes `0755`; do not reset arbitrary modes to `0755`). Recheck all source/destination ancestors and launcher prerequisites, then rerun the helper. Executable links work in Bash, Zsh, fish and scripts without sourcing or rc edits **when the command directory is on their PATH and names are unshadowed**. This affects shared directory access, not just command convenience. |
| **Neither** | Leave rc, permissions and links untouched; retain repo-local access only when its trust is established. Do not block otherwise authorized setup solely on optional persistence. |

Recommend **(b)** for cross-shell/script use when the permission changes are acceptable; **(a)** for the smallest reversible Bash-only persistence change. Authorization to create links is not authorization to chmod ancestors or edit rc. Approval to edit this skill authorizes neither host operation.

**Trust caveat for (a):** sourcing aliases can work with `0775` ancestors, but it retains the same path-replacement risk; an existence guard is not a security check. Disclose that risk and obtain explicit acceptance before setting up persistent sourcing through such paths. Review the alias file and launchers; no automatic rc fallback around the helper's rejection. One-shot sourcing and absolute launchers are not security fixes either. If path trust is unresolved, leave activation blocked.

**Missing apply is a separate prerequisite:** the current helper preflights **all four** launchers. With only main/status/logs present, it cannot install three links; tightening permissions alone will not make it succeed. Do not hand-create links to bypass its checks or fabricate an apply launcher/probe. Keep `-apply` absent from aliases and the handoff until its readiness gates pass; explain that PATH installation remains pending with this helper.

For an accepted but blocked PATH attempt, retain `aliasPersistence: "requested"`, `shortcutMode: "path"` and the intended `shortcutDir`; do not invent `aliasPersistence: "blocked"`, reset it to `not-offered`, or claim `installed`. During authorized setup, record the observed paths/modes, created entries and bounded blocker in nonsecret evidence using the [resume contract](resume-and-diagnostics.md). Preserve runtime phase and any earlier incomplete gate; an optional shortcut blocker is not a gateway diagnosis. On resume, reuse the decision and evidence; retry only after the relevant inputs change.

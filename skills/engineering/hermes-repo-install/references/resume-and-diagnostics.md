# Resume setup and explain the next action

This is an agent procedure over the verified repo instance, not an autonomous installer or a promise that a receipt proves health. Reuse unchanged evidence and decisions; keep live ownership, single-writer and readiness checks. Never read secrets to build a status report.

## Durable, nonsecret progress

Maintain ignored, owner-only `<repo>/.hermes/setup-state.json` alongside the identity receipt. Create it only during authorized setup; a read-only status or plan-only request does not create/repair it. Reject symlinked/shared/foreign targets. Update atomically under the repo setup lock **after** an action is observed successful, not before attempting it. Preserve the previous valid receipt if a write fails.

Required fields:

- `version: 1`, canonical `repoPath`, full `repoId`, Docker `context`, `projectName`, exact `containerName`, pinned `image`, runtime `uid`/`gid`, and `workspace: "/workspace"`.
- `phase`: `prepared`, `awaiting-user-setup`, `configured`, `memory-verified`, `activated`, or `ready`.
- `checkedAt`: observation time; nonsecret evidence for completed gates, such as actual container/volume IDs, mount source, workspace/user, memory probe cleanup result and selected channel names.
- `aliasPersistence`: `not-offered`, `declined`, `requested`, or `installed`, plus the known alias file, optional `shortcutMode: "path" | "shell"` and `shortcutDir`, or explicitly selected shell/rc path when applicable. This field covers both PATH links and shell aliases. An accepted but blocked attempt remains `requested`, not `blocked`, `not-offered` or `installed`; record the observed blocker/partial entries in nonsecret evidence and follow [persistence recovery](readiness-and-shortcuts.md#when-writable-ancestors-block-persistence). Preserve runtime phase and an earlier pending setup/readiness gate. Do not store whole rc contents.
- `pending`: the next incomplete gate or a bounded blocker code; keep the last completed phase rather than replacing progress with an ambiguous “failed”.

Do not store credentials, token fragments, config/env/auth-file contents, OAuth/device codes, private log bodies, messages or credential fingerprints. Nonsecret input changes may be tracked with schema/version, selected provider/model/channel names and file metadata. Metadata is an invalidation hint, not authentication or proof of unchanged secrets. Existing identity/verification receipts remain authoritative inputs to compare, not files to duplicate wholesale.

## Resume at the first incomplete gate

1. Resolve the same canonical repo and read existing identity/progress/verification receipts. Check schema and selectors against live ownership labels, mounts and runtime. A copied/unknown receipt, changed repo/context, inconsistent phase or unidentified existing installation blocks mutation; do not provision another instance as a repair.
2. Reacquire the setup lock for mutation and verify writers. If the user is still inside setup or another installer owns the lock, wait without deleting a lock or restarting anything. A previous agent finishing its turn does not prove its subprocess exited.
3. Reuse the pinned image, generated files, valid keys, aliases, user choices and unaffected verification evidence. Do not repeat upstream release searches, pulls of an already present unchanged image, credential generation, setup interviews, completed wizard runs or persistence offers. Missing receipts trigger targeted read-only reconstruction from real artifacts—not a wipe/reinstall or fabricated progress.
4. Resume using the table. If relevant inputs changed or evidence is stale, invalidate only dependent gates: workspace changes require workspace verification; a wizard/config/provider/home change invalidates dependent auth/memory checks; activation/recreation invalidates live gateway/channel/port evidence. A persisted `ready` is **last verified**, not fresh readiness.
5. After the successful gate, update progress and state the single next action. Record only facts observed in this run or still-valid prior evidence. The receipt carries context, **not permissions**: restart, migration, provider switch or shell-rc authorization still comes from the user's request/conversation and applicable policy.

| Last completed phase | Next action |
| --- | --- |
| `prepared` | Finish owned maintenance/launcher preparation and preconfigure `/workspace`; hand off private setup. |
| `awaiting-user-setup` | Keep the verified maintenance container available. User runs `<alias> setup` privately. If they already report completion, check nonsecret configuration instead of rerunning the wizard. |
| `configured` | Recheck quiescence and effective workspace/auth; perform required Holographic verification. |
| `memory-verified` | If evidence remains valid, finish maintenance and activate within the existing install scope—no new setup interview. |
| `activated` | Verify actual gateway, configured channels, mount/user, persistence and current ports. |
| `ready` | On a status request, refresh only current readiness evidence; on a change request, inspect the requested delta. No automatic restart. |

For a user handoff, leave the owned maintenance container usable, record `awaiting-user-setup`, close installer-only probes/processes and release only your own setup lock safely. On continuation check for a still-running user wizard before touching config. Preserve state after failures and reruns; do not delete memory, rotate keys, or reclaim another process's lock.

## Secret-safe diagnosis

Use the selected image's verified, non-inference read-only probes and scoped observation times. There is no assumed universal `hermes status`/health API. Inspect supported CLI/source before running a probe that could initialize state, refresh tokens, contact paid services or print secrets. The generated `-status` shows only container state; `-logs` emits fixed historical event labels. Neither establishes application readiness. Unsupported, missing or stale signals mean **verification pending**.

Choose the first supported diagnosis below; name its evidence without dumping the underlying files/logs:

| User-facing status | Required evidence | One next action |
| --- | --- | --- |
| **Blocked** | Ownership, permissions, conflicting writers or required name/config boundary failed. | Resolve that exact blocker; never relabel, erase or restart around it. |
| **Setup incomplete** | Confirmed missing effective provider/auth/channel configuration, or awaiting the user's first setup completion. | `<alias> setup` in the user's private terminal. |
| **Apply needed** | Saved effective config/credential-source changes have not been loaded by the running gateway/container; compare current nonsecret metadata/source precedence with observed startup/application state. | After setup exits and required gates pass, `<alias>-apply`; it briefly recreates only this service. |
| **Telegram disconnected** | Telegram is selected and current supported gateway/platform evidence shows it disconnected/not polling. Historical log hints alone are insufficient. | Diagnose the specific connection/auth/conflict signal; do not guess token failure or restart blindly. |
| **Ready** | Current owned runtime, repo workspace, effective auth, required memory evidence and selected interfaces/channels all verified, with no pending apply. | Show the usable interface; after verified cold-boot backlog discard, send a new message. |
| **Verification pending** | Container exists but required live signals are unavailable, stale or unsupported. | Run the specific safe supported check; no invented success from uptime. |

Never automatically send a Telegram message, run inference, change backlog policy, expose a port, migrate credentials or apply a restart while diagnosing. A log may contain user text resembling a health event; treat it as a lead, not authority.

## Compact handoff

Lead with status, repo/container, **workspace already configured to `/workspace`**, and **one next command**. Example for a fresh install after alias activation:

```text
Prepared — run this in your terminal:
hermes-api setup
Workspace is already /workspace (your repo). Enter credentials privately.
Tell me when setup finishes; do not paste its output.
```

Prefer the [optional cross-shell commands](readiness-and-shortcuts.md) when persistence was requested. If the installed directory is already on the user's PATH and names are unshadowed, no source command is needed. Otherwise show the absolute launcher or the chosen shell-alias mode's source command; do not claim to change the parent shell. Put the maintenance commands (`<alias>-status`, `<alias>-logs`, `<alias>-apply`) in one short optional line, not another configuration inventory. Offer persistence once without blocking setup and remember the answer. Full selectors, hashes and verification detail stay in the local receipts.

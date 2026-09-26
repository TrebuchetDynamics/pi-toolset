# Resume setup and explain the next action

This is an agent procedure over the verified repo instance, not an autonomous installer or a promise that a receipt proves health. The lifecycle phases and diagnostic exit codes below remain runtime-scoped; [development readiness](development-readiness.md) is an independent task/mode verdict, not another phase or a redefinition of exit `0`. Reuse unchanged evidence and decisions; keep live ownership, single-writer and readiness checks. Never read secrets to build a status report.

## Fast path: repair or resume

For “fix Docker”, “bot won't answer” or “setup finished”, run this read-only triage before considering installation. Return **one supported diagnosis + one next action**. Do not pull images, rerun setup or start/stop anything merely to diagnose.

1. **Resolve identity and mounts.** Match the requested repo/bot to current context/project/service, receipt, full ownership labels, `/workspace` bind and `/opt/data` volume. Multiple host/Docker candidates or contradictory receipts block mutation. Ask for the repo/instance or public bot username, never its token; do not pick the first container or assume cwd owns the bot.
2. **Check actual gateway state.** Use the selected image's supported read-only supervisor/runtime signals. Container Up, credential presence and old connected logs are not evidence that the gateway ever started. If no safe signal exists, report verification pending rather than guess.
3. **Check maintenance.** Compare current resolved launch configuration and live runtime for the verified maintenance/no-autostart override, including a leftover `sleep infinity`. Do not echo raw commands/config. Sleep alone does not prove gateway stopped: s6 may still start services. Maintenance requires both a verified override and current gateway-stopped evidence; removal/recreation is a later authorized action.
4. **Check saved configuration and access.** Through verified redacted interfaces, check effective provider/channel credential presence, source precedence, runtime readability and whether the intended user/chat is allowed. Report only presence and policy verdicts, not values, identifiers or raw files. A credential file existing is not effective auth; a saved token is not activation or connectivity. If inspection cannot be secret-safe, leave that gate pending. Never widen an allowlist as a diagnostic shortcut.
5. **Check current configured channels.** Discover the current channel set, including Telegram added after the last handoff; use current supported connection/polling evidence. Credentials present + gateway stopped + verified maintenance means **activation pending**, not “run setup again” or “bad token”. After user completion, follow the [Telegram activation preflight and conditional repair](telegram-activation.md), resuming the first invalidated/incomplete gate below. Do not repeat setup merely because the maintenance CMD remains.

### Reuse evidence operationally

Read required instruction files fully once and retain their source/version in the task context. Reuse verified pinned image/source, repository discovery, user choices and completed unaffected checks; do not rerun catalog/branch/history searches or pull the same image. At continuation refresh **ownership/mounts, active writers/lock, configuration changes and live readiness**. Source/image change invalidates its version-specific probes; wizard/auth/workspace changes invalidate their dependent gates, not all discovery. If instructions are no longer in context or changed, reload the needed full file. Receipts remember observations and choices, never substitute for live checks or grant approval.

## Durable, nonsecret progress

Maintain ignored, owner-only `<repo>/.hermes/setup-state.json` alongside the identity receipt. Create it only during authorized setup; a read-only status or plan-only request does not create/repair it. Reject symlinked/shared/foreign targets. Update atomically under the repo setup lock **after** an action is observed successful, not before attempting it. Preserve the previous valid receipt if a write fails.

Required fields:

- `version: 1`, canonical `repoPath`, full `repoId`, Docker `context`, `projectName`, exact `containerName`, pinned `image`, runtime `uid`/`gid`, and `workspace: "/workspace"`.
- `phase`: `prepared`, `awaiting-user-setup`, `configured`, `memory-verified`, `activated`, or `ready`.
- `checkedAt`: observation time; nonsecret evidence for completed gates, such as actual container/volume IDs, mount source, workspace/user, memory probe cleanup result and selected channel names. Keep [memory capability evidence](memory-capability.md#nonsecret-capability-receipt-and-readiness-contract) separate: startup activation/versions, NumPy/FTS5, functional HRR, aggregate vector coverage, cleanup, gateway loaded state and recreation durability. Missing fields are unknown, not implicit passes.
- `aliasPersistence`: `not-offered`, `declined`, `requested`, or `installed`, plus the known alias file, optional `shortcutMode: "path" | "shell"`, `shortcutDir` and `shortcutNames` (verified installed command names), or explicitly selected shell/rc path when applicable. This field covers both PATH links and shell aliases. A verified core-only set is `installed` with its three names; record apply availability separately in nonsecret evidence. A failed later apply addition preserves that core inventory and installed state. An accepted but wholly blocked attempt remains `requested`, not `blocked`, `not-offered` or `installed`; record the observed blocker/partial entries in nonsecret evidence and follow [persistence recovery](readiness-and-shortcuts.md#when-writable-ancestors-block-persistence). Preserve runtime phase and an earlier pending setup/readiness gate. Do not store whole rc contents.
- `pending`: the next incomplete runtime gate or a bounded blocker code; keep the last completed phase rather than replacing progress with an ambiguous “failed”.

When development is assessed during authorized reconciliation, keep its task/mode verdict, gate evidence and blockers separately under `evidence.development` as described in the [development receipt](development-readiness.md#6-evidence-invalidation-and-outcome-reporting). An old runtime `ready` does not populate that section. Keep missing evidence unknown and preserve an earlier runtime blocker; read-only status creates no receipt or write probes.

Do not store credentials, token fragments, config/env/auth-file contents, OAuth/device codes, private log bodies, messages or credential fingerprints. Nonsecret input changes may be tracked with schema/version, selected provider/model/channel names and file metadata. Metadata is an invalidation hint, not authentication or proof of unchanged secrets. Existing identity/verification receipts remain authoritative inputs to compare, not files to duplicate wholesale.

## Resume at the first incomplete gate

1. Resolve the same canonical repo and read existing identity/progress/verification receipts. Check schema and selectors against live ownership labels, mounts and runtime. A copied/unknown receipt, changed repo/context, inconsistent phase or unidentified existing installation blocks mutation; do not provision another instance as a repair.
2. Reacquire the setup lock for mutation and verify writers. If the user is still inside setup or another installer owns the lock, wait without deleting a lock or restarting anything. A previous agent finishing its turn does not prove its subprocess exited.
3. Reuse the pinned image, generated files, valid keys, aliases, user choices and unaffected verification evidence. Do not repeat upstream release searches, pulls of an already present unchanged image, credential generation, setup interviews, completed wizard runs or persistence offers. Missing receipts trigger targeted read-only reconstruction from real artifacts—not a wipe/reinstall or fabricated progress.
4. Resume using the table. If relevant inputs changed or evidence is stale, invalidate only dependent gates: workspace changes require workspace verification; a wizard/config/provider/home change invalidates dependent auth/memory checks; changed dependency paths/provider packages invalidate dependent capability evidence but do not prove an older gateway reloaded them; wizard/SOUL/prompt-source changes require [repo-name identity revalidation](repo-identity.md); activation/recreation invalidates live gateway/channel/port evidence. Toolchain/environment, tool-approval/safe-root policy, skill sources, workspace/selectors, task or scheduler-context changes invalidate the corresponding development evidence, not all runtime discovery. A persisted `ready` is **last verified**, not fresh readiness.
5. After the successful gate, update progress and state the single next action. Record only facts observed in this run or still-valid prior evidence. The receipt carries context, **not permissions**: restart, migration, provider switch or shell-rc authorization still comes from the user's request/conversation and applicable policy. After verified activation, atomically supersede stale pending/stopped observations with current container ID/start time and gateway/channel evidence; retain old facts only as dated history, and clear only satisfied pending gates.

| Last completed phase | Next action |
| --- | --- |
| `prepared` | Finish owned maintenance/launcher preparation, preconfigure `/workspace` and the repo-named SOUL identity; hand off private setup. |
| `awaiting-user-setup` | Keep the verified maintenance container available. User runs `<alias> setup` privately. If they already report completion, check nonsecret configuration instead of rerunning the wizard. |
| `configured` | Recheck quiescence, effective workspace/auth and post-wizard SOUL identity; perform required Holographic verification. |
| `memory-verified` | Check valid local HRR/canary gates, not just an old label. Then finish maintenance and activate within existing install scope; verify loaded-gateway capability and required durability separately. No new setup interview. |
| `activated` | Verify actual gateway, configured channels, mount/user, persistence and current ports. |
| `ready` | Refresh only current runtime evidence for status; inspect the requested delta for changes. Assess development separately before coding/job claims; no automatic restart, write probe or job enablement. |

For a user handoff, leave the owned maintenance container usable, record `awaiting-user-setup`, close installer-only probes/processes and release only your own setup lock safely. On continuation check for a still-running user wizard before touching config. Preserve state after failures and reruns; do not delete memory, rotate keys, or reclaim another process's lock.

## Secret-safe diagnosis

Use the selected image's verified, non-inference read-only probes and scoped observation times. There is no assumed universal `hermes status`/health API. Inspect supported CLI/source before running a probe that could initialize state, refresh tokens, contact paid services or print secrets. The generated `-status` renders fixed diagnostics from a reviewed live adapter, or reports **verification pending** if it is missing/unsafe/unsupported; Docker state alone cannot make it ready. `-logs` emits fixed historical event labels, not readiness. Unsupported, missing or stale signals mean **verification pending**.

Choose the first supported diagnosis below; name its evidence without dumping the underlying files/logs:

| User-facing status | Required evidence | One next action |
| --- | --- | --- |
| **Blocked** | Ownership, permissions, conflicting writers or required name/config boundary failed. | Resolve that exact blocker; never relabel, erase or restart around it. |
| **Maintenance; activation pending** | Owned running container, verified current maintenance override and gateway stopped. Mention Telegram credentials present only after current effective presence is confirmed. | Ask for setup completion if still pending; otherwise verify auth/access/workspace/memory and obtain any uncovered recreation approval before activation. |
| **Gateway stopped** | Owned running container, current gateway stopped, verified not in maintenance. | Inspect its supported stop/crash reason; no blind restart or setup rerun. |
| **Setup incomplete** | Current required effective configuration is missing, or user setup is still in progress. A stale awaiting-setup receipt alone is insufficient. | `<alias> setup` privately only for missing configuration; otherwise wait for the active wizard to finish. |
| **Apply needed** | Saved effective config/credential-source changes have not been loaded by the running gateway/container; compare current nonsecret metadata/source precedence with observed startup/application state. | After setup exits and required gates pass, `<alias>-apply`; it briefly recreates only this service. |
| **Telegram disconnected** | Telegram is selected and current supported gateway/platform evidence shows it disconnected/not polling. Historical log hints alone are insufficient. | Diagnose the specific connection/auth/conflict signal; do not guess token failure or restart blindly. |
| **Holographic basic** | Basic keyword persistence is confirmed in the real startup-equivalent runtime, but HRR is not available in the evaluated runtime. Never infer this solely from bare Python. | Report **basic keyword mode—not full HRR capability**; resolve the supported dependency/loaded-state remedy within separate approval. |
| **Runtime ready** | Current owned runtime, repo workspace/identity, effective auth/access, required memory capability/loading evidence and selected interfaces/channels all verified, with no pending apply. This is not development, complete historical vector-coverage or model-reply proof. | Show the usable interface and separate development/reply limits; after verified cold-boot backlog discard, prominently tell the user “Send a fresh message now.” |
| **Verification pending** | Container exists but required live signals are unavailable, stale or unsupported. | Run the specific safe supported check; no invented success from uptime. |

Never automatically send a Telegram message, run inference, change backlog policy, expose a port, migrate credentials or apply a restart while diagnosing. A log may contain user text resembling a health event; treat it as a lead, not authority.

## Diagnostic probe for `-status`

Generate owner-only regular executable `.hermes/bin/hermes-diagnostic-probe` (`0700`) **only after** reviewing this image's supported read-only interfaces. It is separate from `hermes-readiness-probe`: their exit codes differ; never interchange them. The status helper is only a bounded collector/renderer, not a generic Hermes runtime adapter. Copy its `wait-ready.mjs` dependency too. An existing installation needs an authorized, ownership-checked launcher update to gain this behavior; changing this skill alone does not retrofit commands.

Bind the probe to the same verified context/project/absolute Compose file/service as the launcher. Each invocation resolves the current container anew, verifies full identity/mounts/user and inspects current configuration before selecting a diagnosis. On changed identity, stale/contradictory receipts or unresolved writers, fail closed. Do not return cached status, infer maintenance from a receipt or `sleep` alone, or reuse an install-time channel list. For ready, satisfy the full [readiness contract](readiness-and-shortcuts.md#readiness-after-apply), including effective auth/access and valid workspace/memory gates.

Emit no credential values, policy identifiers, log bodies or raw configuration. Use verified redacted presence/access interfaces; do not parse or dump secret stores through agent tools. The helper discards stdout/stderr, but this is not permission for the adapter to collect secrets. Review code and all subprocesses: no login/refresh, inference, external messages, canary writes, dependency installation, automatic repair/restart or detached children. Bound every subprocess and prefer `exec` for the final native check. A missing safe interface remains unsupported; never install a dummy probe.

| Probe exit | Evidence attested (current, same owned instance) |
| --- | --- |
| `0` | All runtime readiness gates and configured channels healthy; no pending apply. Does not attest development or approve jobs. |
| `10` | Container running, maintenance override verified, gateway stopped; credential/access evidence incomplete. |
| `11` | Same maintenance evidence, plus effective Telegram credential presence. Presence does not attest token validity, access policy or connection. |
| `12` | Container running, gateway stopped, verified not in maintenance. |
| `20` | Ownership/mounts/writers or another required verification gate is blocked. |
| `21` | Gateway running, selected Telegram currently disconnected. |
| `22` | Required effective setup/auth/channel configuration confirmed missing. |
| `23` | Saved configuration differs from the currently applied runtime; required setup gates otherwise complete. |
| `24` | Basic Holographic keyword capability independently confirmed under the [real-runtime contract](memory-capability.md), not full HRR. State fresh/loaded distinctions and remaining evidence in the receipt; never infer dependency absence from a bare-interpreter failure. |
| `30` | Required evidence unavailable/unsupported; no supported diagnosis. |

Choose ownership/safety blockers before maintenance or channel status. Incomplete auth/access can coexist with maintenance: report maintenance and retain the remaining gates. A contradictory or unknown observation returns `30`, not a guessed diagnosis. Known basic mode must not be hidden behind `0`; use `24` when that diagnosis is supported and higher-priority safety/maintenance blockers do not apply. Helper exits: ready `0`, observed non-ready `1`, unavailable `3`. Unknown probe exit, signal, timeout, oversized output, symlinked/writable/missing probe or ambiguous Docker results are unavailable; never echo probe or Docker errors. No probe is needed to disclose a container is not running, but that observation does not validate its ownership or authorize starting it.

## Host uninstall handoff

Host removal is not implemented by this installer and is never a fallback for Docker repair. Supply the separate uninstall workflow with the verified Docker context/project/container, volume, repo mount, runtime credential/memory stores and scoped launcher paths to preserve. Do not invent uninstall commands or remove host profiles here. Repo-local/PATH launchers that execute Docker are not the host Hermes runtime.

When uninstall discovery reveals active host services, stop before any stop/disable/remove action and require **concrete impact confirmation**. Enumerate exact service/profile names, number of affected bots, what runtime is removed, data/config preservation boundaries and what Docker resources remain untouched. Example: “This removes the host runtime and stops these nine bots: ops, sales, support, alerts, docs, qa, dev, staging, personal. Docker remains untouched. Confirm?” “Only host”, urgency or an earlier generic uninstall approval is not confirmation of newly discovered active-service impact. Unknown service-to-bot mapping must be resolved first. Recheck the inventory before execution in that separate workflow; changed impact requires renewed confirmation, not reuse of a stale approval.

## Compact handoff

Lead with runtime status and a separate development verdict when relevant, repo/container, **agent name set to the repo basename** when verified, **workspace already configured to `/workspace`**, and **one next command**. For coding failures, consolidate all safely discovered prerequisites into one actionable report; distinguish changes this turn, pre-existing changes preserved, denied/not-run commands and validation actually completed. Do not promise recurring failures stopped without an authorized actual job pause/latch. Example for a fresh install after alias activation:

```text
Prepared — run this in your terminal:
hermes-api setup
Workspace is already /workspace (your repo). Enter credentials privately.
Saving credentials alone does not start Telegram.
Tell me setup is finished. I'll verify memory/auth/workspace, request any necessary
recreation approval, and activate this instance once its gates pass. Do not paste setup output.
```

Prefer the [optional cross-shell commands](readiness-and-shortcuts.md) when persistence was requested. If the installed directory is already on the user's PATH and names are unshadowed, no source command is needed. Otherwise show the absolute launcher or the chosen shell-alias mode's source command; do not claim to change the parent shell. Put the maintenance commands (`<alias>-status`, `<alias>-logs`, `<alias>-apply`) in one short optional line, not another configuration inventory. Offer persistence once without blocking setup and remember the answer. Full selectors, hashes and verification detail stay in the local receipts.

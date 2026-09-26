# Telegram configured, bot silent: conditional activation repair

Use this after the [repair-first diagnosis](resume-and-diagnostics.md#fast-path-repair-or-resume), not as a universal restart recipe. In the reported case, saved credentials coexisted with `command: ["sleep", "infinity"]`; the container was Up but `gateway-default` had never started. The supported repair for that inspected image was `command: ["gateway", "run"]` followed by one scoped recreation. **No image digest was supplied with that report:** reverify these commands, supervisor name and probes against the selected pinned image. Sleep alone does not disable every image's supervisor.

Observable lifecycle: **prepared → credentials saved → preflight verified → activated → channel connected**. These are distinct observations, not new receipt phase enums. A model-generated reply and [repository development readiness](development-readiness.md) are separate outcomes; channel repair never grants coding-job scope or proves actual write tools/toolchains usable. Setup completion is a continuation signal, not proof of activation.

## Before changing the maintenance command

Reuse still-valid source/image evidence. Refresh live ownership/mounts, locks/writers, configuration changes and readiness. Complete every applicable gate below; unavailable evidence stays pending, not waived because the user is in a hurry.

| Gate | Required evidence and boundary |
| --- | --- |
| Owned instance and exact scope | Canonical repo, Docker context/project/file/service, full identity, current container and persistent volume agree. Preserve pinned image, entrypoint, mounts and data. Resolve conflicting/copied receipts before mutation. Obtain the exact service activation/recreation scope if not already covered; disclose its interruption. No host uninstall or other-profile cleanup. |
| Setup and one writer | User confirms private setup finished; verify no wizard, maintenance writer or competing gateway owns the home. Acquire the owned setup lock; follow the image-supported quiescence path. Merely finishing an agent turn does not end its subprocess. |
| Consistent backups | Back up current owned Compose/config/SOUL/auth/memory state within private storage under the existing backup rules; use supported consistent SQLite backup or quiescence. Do not echo credentials or copy live WAL files as a backup. |
| Effective Telegram credential | Verify selected credential source/precedence, presence, runtime readability and structural validity using the installed schema/validator **without returning its value**. File presence or a token-shaped string is not token validity. Shadowed/ambiguous sources require a scoped authority decision, not copying/rotating credentials. |
| Private-bot access | Require a nonempty allowlist of numeric **user IDs** accepted by the installed schema, with no accidental empty-list/wildcard/allow-all path. Check the effective policy, not just one config field. Never invent IDs, use the bot's own ID as the operator, print the allowlist, or widen access to fix silence. Intentional broader access needs its explicit reviewed scope; do not silently rewrite an existing policy. |
| Telegram bot identity | Perform the bounded, secret-safe `getMe` check below only within authorized external verification. Require success and that the returned bot username matches the intended instance. Show only the bot username, not response bodies, IDs or token fragments. Failure/unknown identity blocks this activation gate; do not call the gateway connected merely from `getMe`. |
| Model authentication | Resolve the configured model's effective credentials with the image's supported **read-only, non-inference, non-refreshing** check. Credential-pool membership alone may not mean runtime resolution. If the resolver would refresh OAuth, contact a provider or invoke a model, stop that check and report pending until a safe alternative or separate scope exists. Never log credentials. |
| Workspace and identity | Verify actual terminal-tool cwd is `/workspace` and its bind is the canonical repo; verify the [effective repo-named SOUL](repo-identity.md). A gateway process cwd of `/opt/data` can be correct and is not evidence the terminal tool uses the wrong workspace. A bare `docker exec pwd` with forced `--workdir` is not proof of the tool's behavior. |
| Memory | Use the required **memory-holographic-hermes-setup** handoff with the [real-runtime capability contract](memory-capability.md): reproduce supported startup/package activation first, verify local HRR plus nonroot persistence/reopen/cleanup, and report basic/pending limitations explicitly. This is authorized local state-writing verification, not a status probe. Reuse valid unaffected evidence; post-wizard changes can invalidate it. No host Python, alternate memory provider or root-only success. |
| Supported readiness | Review the image-specific `hermes-readiness-probe` before recreation. A missing/unsafe adapter or Docker-Up-only/dummy probe blocks apply. The separate diagnostic probe's exit codes do not satisfy this contract. |

### Secret-safe `getMe`, not a message test

This is an **external authenticated Telegram request**, not an offline check. Obtain permission if the existing verification scope does not cover it; a request to edit this skill covers no network operation. Use the verified runtime's trusted private credential-loading path and a vetted bounded collector. Do not put the token or token-bearing URL in shell arguments, chat, logs, receipts, trace output or exception strings. No raw `.env`/auth dumps, shell `source`, pasted token or ad-hoc curl command with the token embedded.

Use the verified official Telegram endpoint with normal TLS validation, no redirects, a short timeout (at most 10 seconds) and a bounded response (at most 64 KiB). Make one check, not an unbounded retry loop. Parse privately and emit only a success verdict and bot username or a fixed sanitized failure/pending verdict. Neither a malformed response nor an exception may leak the URL. Do not invoke `getUpdates` (which can compete with polling), alter webhooks, send messages or consume/replay queued updates. `getMe` proves bot credential/identity access, not allowlist correctness, running gateway or model response.

Keep this one-off approved check **outside** the local periodic readiness/status adapters. Do not make every `-status` or two-second readiness poll contact Telegram or refresh credentials.

## Apply only the verified delta

After preflight and exact-scope approval, narrowly replace the **verified current maintenance override** in the owned Compose service:

```diff
-command: ["sleep", "infinity"]
+command: ["gateway", "run"]
```

Do not blindly substitute these values in another image, override `/init`, change service `user`, or leave another active maintenance override shadowing the edit. Revalidate resolved configuration without exposing expanded secrets. Compare the planned delta: only the supported maintenance-to-gateway transition; image digest, owned volume, mount sources, network and exposure stay unchanged. Preserve unrelated user changes. Backups and receipts are not new authorization. If prerequisites fail before recreation, report prepared/pending; do not manufacture success or delete state.

Use the existing verified `<alias>-apply` after its gates, or this equivalent scoped sequence with **verified absolute** `REPO`/`COMPOSE` and explicit selectors. This command is not the preflight itself: ownership, backups, setup/auth/access/memory/identity and downtime permission must already be established. Copy/install the [waiter](../scripts/wait-ready.mjs) and reviewed adapter through the [readiness procedure](readiness-and-shortcuts.md) beforehand.

<!-- telegram-activation -->
```sh
#!/bin/sh
set -eu
: "${CONTEXT:?verified Docker context required}"
: "${PROJECT:?verified Compose project required}"
: "${COMPOSE:?verified absolute Compose file required}"
: "${REPO:?verified canonical repository required}"
cd "$REPO"
unset COMPOSE_FILE COMPOSE_PROJECT_NAME COMPOSE_PROFILES COMPOSE_ENV_FILES
node "$REPO/.hermes/bin/wait-ready.mjs" --check-probe \
  "$REPO/.hermes/bin/hermes-readiness-probe"
docker --context "$CONTEXT" compose --env-file /dev/null \
  -p "$PROJECT" -f "$COMPOSE" \
  up -d --no-deps --force-recreate --pull never --no-build hermes
node "$REPO/.hermes/bin/wait-ready.mjs" --probe \
  "$REPO/.hermes/bin/hermes-readiness-probe"
```

This retains the named volume and pinned image; it does not pull, build or start dependencies. No `down -v`, volume renewal, prune, host removal, repeated recreation or automatic rollback after a failed probe. The local file/permission preflight cannot establish live readiness; the bounded post-recreation probe must do that. Stop on nonzero results and retain the actual pending/blocker state.

## After activation: application-level proof

Bind observations to the **current container ID and start time**, not old logs or receipts. Use verified safe interfaces and the actual configured user; the reported image used supervisor `gateway-default` and UID `1000`, but neither is a universal constant.

- Confirm current gateway PID/supervisor state and effective non-root UID, then fresh application gateway status **running**.
- Confirm each currently configured platform, especially Telegram **connected/polling**; API-only health is not Telegram success.
- If a protected detailed-health API is actually present, verify its supported route, authenticated application result and authentication rejection without exposing keys. The reported image's `/health/detailed` returned `ok` when authenticated and HTTP `401` without authentication. Verify route/auth semantics for the selected image; a login HTML page or bare HTTP 200 is not detailed health. Do not invent an endpoint, enable an API solely for testing, or treat an API intentionally absent by design as required; use another reviewed application-level readiness interface. Unsupported required evidence remains pending.
- Confirm effective terminal-tool `pwd` is `/workspace`, independently of gateway process cwd. Use a supported bounded local tool invocation without an LLM request; if unavailable, report the missing evidence rather than force a cwd to make the probe pass.
- Retain valid Holographic reopen/cleanup evidence for the same persistent home; reverify loaded-gateway capability and required dependency/config/data/HRR durability in the replacement container under the [memory contract](memory-capability.md). Local imports/canaries do not prove a gateway loaded HRR. The read-only readiness adapter validates current evidence; it must not initialize/migrate stores, reindex or rerun canary writes on every poll.

### API flag and exposure gotcha

The reported image ignored `API_SERVER_ENABLED=false` for an internal API enabled by its bootstrap key. Treat this as a **version-specific observed behavior to check**, not a universal Hermes fact or permission to alter the planner's defaults. Verify actual process/listeners, bind addresses, bootstrap/config precedence and current Docker publication. Do not echo keys or whole inspect/config output.

Distinguish **container-internal loopback**, container-interface listeners, **host-published ports**, and actual public reachability. An internal listener with no published ports is not a host URL; absence of publication alone does not prove all network paths private—check network mode and relevant access paths. If observed exposure differs from the approved plan, block readiness and resolve that exact boundary. Do not disable auth, publish ports, use host networking or change bootstrap secrets as a shortcut.

## Honest handoff and fresh-message instruction

Update the existing receipt atomically under the owned lock only after observing success. Supersede stale pending/stopped descriptions with current container/start-time, gateway/channel/workspace and permitted health/auth verdicts; keep old observations only as clearly dated history. Clear only satisfied pending gates. Store no tokens, allowlist contents, full health payloads or token-bearing URLs. A failed/unperformed check stays pending; `ready` still does not mean a model reply was tested.

Example after verified activation and confirmed cold-boot backlog discard:

```text
Gateway running; Telegram connected; memory persistence verified.
Model-generated reply not yet tested.
Repository coding readiness is separate; channel checks do not establish it.
Cold boot discarded queued updates. Send a fresh message now.
```

Make **“Send a fresh message now.”** prominent when current policy/evidence confirms queued updates were dropped. Do not assume every version drops them by default. If the policy is unknown, say so; after connection, a fresh user message can be offered as the next user-driven reply test without claiming queue loss. Never disable backlog policy, replay updates, send a Telegram test message or invoke the model automatically. Separate channel connected, memory verified and model-generated reply verified in every completion claim.

# Host CLI, private setup and applying changes

Every install handoff gives the **actual short container name**, workspace `/workspace`, private setup command, host alias and apply command. Create ignored owner-only launchers under `<repo>/.hermes/bin/` and `<repo>/.hermes/aliases.sh`. These are conveniences, not host Hermes installation or host profiles.

CLI command availability is not [development readiness](development-readiness.md): verify required toolchains/skills and tool-write approval in the actual gateway, private-CLI and intended noninteractive job environments, not just this launcher or an exported shell PATH. For new installs, runtime state/secrets live in bind-backed `/workspace/.hermes`; the **repo root itself** is mounted at `/workspace`. Follow the [workspace-state contract](workspace-state.md); legacy launchers retain their verified home until an explicitly approved migration.

## The user runs setup, not the agent

For a fresh instance, prepare the bootstrapped container in the image's verified maintenance/no-autostart mode, with gateway/cron/dashboard writers quiescent. Keep it running for `exec`; do not activate a gateway without configured credentials just to make the command work. Inspect the selected version's wizard behavior and safe maintenance path first; if setup would automatically install dependencies or start competing services with no supported way to defer them, report that concrete blocker.

The user chooses provider/model/channels and enters secrets in **their own terminal**. The agent must not run the interactive wizard through tools, capture its terminal, request screenshots/transcripts/device codes, or ask for secrets in chat. Do not force users to preselect provider/model in conversation. Reuse already-working configuration instead of forcing setup again.

After verifying that this image's `hermes` PATH shim drops to the correct application user, preserves the verified `HOME`/`HERMES_HOME` (`/workspace/.hermes` for a new install), and uses the container working directory `/workspace`, show the simple command with the **real inspected name**, for example:

```sh
docker exec -it hermes-kenworth-cummins-ing hermes setup
```

This assumes the host's current Docker context is the verified one; otherwise include `--context '<verified-context>'`. Never recommend bare exec as root when the shim's behavior is unknown. The scoped launcher below explicitly sets user/home/workdir and is the safe alternative: `<repo>/.hermes/bin/hermes setup`. Do not invent a shortened name for an existing long-named container: use its actual name until a requested Compose rename is reconciled without changing the project/volume.

Before handoff, preconfigure `terminal.backend: local` and `terminal.cwd: /workspace` through the verified schema, with the container working directory and launcher also set to `/workspace`. The user should not have to decide the workspace. If this wizard still asks, say **accept the prefilled `/workspace`**; do not promise that every version suppresses the prompt. Keep optional service/dependency installation deferred. Report **prepared; waiting for user setup** and lead with the single command `<alias> setup` (or the absolute launcher when alias activation is pending). Ask only for a completion signal, never the wizard output. On continuation, reacquire the lock, verify ownership and no competing writers, inspect only nonsecret settings, and verify the actual tool cwd/bind source. Restore the required workspace/memory configuration narrowly after the wizard, preserving credentials and selected provider/model. Recheck the [effective repo-named SOUL](repo-identity.md) after setup, preserving unrelated wizard-written preferences; SOUL identity and a static `/start` greeting are separate checks. Complete identity and memory checks before first gateway activation. Don't offer apply as a substitute for these first-install checks.

If the setup container is a separate maintenance container, provide its verified-ID exec command with explicit context/user/home/workdir. Do not silently retarget the permanent launcher, which remains bound to the service. No stopped container accepts `exec`.

## Generate the CLI launcher

Use the verified context, absolute repo/Compose path, project ID, service, application UID/GID and executable. `/opt/hermes/bin/hermes` and `1000:1000` below are examples, not discovery. Compose service selection survives normal recreation; the human-facing Docker name remains short.

Write the template with **shell-quoted verified literals**, replace every sample value, and set mode `0700`. Quote spaces/apostrophes/dollars/backticks correctly; no raw-name interpolation or `eval`. Preserve owner-written files; update only known installer-owned files after comparison/backup. Validate ownership/receipt/mounts first. Launchers trust the generated Compose file: revalidate/regenerate after a repo move, context, mount, image or runtime-user change.

```sh
#!/bin/sh
set -eu
cd '/srv/projects/api'
unset COMPOSE_FILE COMPOSE_PROJECT_NAME COMPOSE_PROFILES COMPOSE_ENV_FILES
# Interactive default is chat, through the verified session-safe adapter.
# Scripts/pipes retain help; explicit arguments pass through unchanged.
if [ "$#" -eq 0 ]; then
  if [ -t 0 ] && [ -t 1 ]; then
    exec node '/srv/projects/api/.hermes/bin/chat.mjs' --adapter \
      '/srv/projects/api/.hermes/bin/hermes-chat'
  fi
  set -- --help
fi
set -- --user '1000:1000' --workdir /workspace \
  -e HOME=/workspace/.hermes -e HERMES_HOME=/workspace/.hermes \
  hermes '/opt/hermes/bin/hermes' "$@"
# Compose exec is interactive by default; disable its TTY for pipes/scripts.
if ! [ -t 0 ] || ! [ -t 1 ]; then set -- -T "$@"; fi
exec docker --context 'default' compose --env-file /dev/null \
  -p 'hermes-api-0123456789abcdef' \
  -f '/srv/projects/api/.hermes/compose.yaml' exec "$@"
```

Explicit arguments are forwarded without a container shell, preserving exit status and the application user. Bare invocation opens chat only when both stdin and stdout are terminals; scripts/pipes show help. Copy [chat.mjs](../scripts/chat.mjs) and its [wait-ready.mjs](../scripts/wait-ready.mjs) file-validation dependency into `.hermes/bin/` (`0600`). The dispatcher requires a verified owner-only regular executable `.hermes/bin/hermes-chat` (`0700`); if absent/unsafe, chat is unavailable, not an unguarded fallback. Its output goes directly to the user's terminal, never an installer transcript.

### Chat adapter and existing-launcher updates

Generate `hermes-chat` only after reviewing the selected runtime's supported chat/session interfaces. It must verify the same canonical repo, Docker context/project/file/service, current container, actual UID/GID/home/workspace and setup/auth readiness as the launcher, and handle session ownership **for the entire chat**, not merely check a PID then race another writer. Use a verified attachment to an existing supported session, or a supported exclusive reservation coordinated with gateway/CLI/cron/maintenance writers and held until exit. A host lock ignored by those writers, an old receipt or a one-time gateway-stopped check is insufficient. If supported coordination is unavailable or a conflicting writer is active, fail closed with a clear nonsecret blocker. No dummy adapter, standalone unguarded `hermes chat`, or second agent sharing an active home.

Before qualifying an adapter, use an authorized isolated/session fixture to verify simultaneous-writer rejection, terminal interruption/hangup, dispatcher/adapter termination, reservation cleanup and absence of orphan writers. Never interrupt a production gateway merely to test this. The adapter owns the scoped interactive invocation and cleanup; the generic dispatcher only checks file safety/TTY and preserves its exit result. It must not silently stop/start/restart/recreate services, install dependencies, change credentials or weaken permissions to make chat work. The user's interactive invocation requests that chat session; editing the skill or testing a stub does not authorize live inference. Never test real chat through agent-captured tools. Setup/auth/config writes and explicit subcommands retain their existing single-writer/approval requirements; argument passthrough is not a universal concurrency guard.

For existing installations, use [full rule reconciliation](existing-installations.md), preserve the actual verified selectors/home (never paste the fresh-home example over legacy state), and narrowly update only verified installer-owned launcher files with comparison/backup. Copy the new dispatcher and dependency together; keep setup/help usable when the chat adapter cannot be qualified. Preserve owner customizations and old diagnostic aliases. Report **launcher updated; interactive chat blocked/pending** when support is missing, not chat-ready. Test shell syntax, argv, TTY/default dispatch and missing/busy adapter failures offline; verify side-effect-free installed help only when supported. No production chat adapter is bundled or qualified by these examples.

## Apply saved changes

Explain: saving setup/configuration is not proof the running gateway reloaded it. Inspect supported version behavior, rather than promise hot reload. A runtime-file change needs the supported reload/restart; a Compose `env_file` change needs **recreation**, since `docker restart` and `compose restart` retain injected env. Use one explicit user-invoked apply command covering both cases. For a silent Telegram bot still in verified maintenance, first follow the [conditional CMD repair and activation gates](telegram-activation.md); apply does not silently edit a sleep override or complete setup. It briefly interrupts only this service, retains the verified state backing (repo bind for new installs; existing volumes unchanged), and does not upgrade the image or migrate homes.

Follow [verified readiness and cross-shell commands](readiness-and-shortcuts.md): install the bounded waiter and a reviewed image-specific readiness probe, then generate `<repo>/.hermes/bin/hermes-apply` (`0700`) with the same verified selectors. Offer it for an already-verified installation or after initial setup/workspace/memory gates; the final Compose config must no longer contain maintenance/no-autostart overrides. The command's invocation is the user's request to apply/recreate this instance; merely creating the file/alias does not authorize the agent to execute it. An explicit [full reconciliation invocation](authorization.md) separately covers a required scoped recreation after safety gates; do not ask for another approval then. Never auto-apply after emitting the setup command or while a user wizard/other maintenance writer is still active.

<!-- apply-launcher -->
```sh
#!/bin/sh
set -eu
if [ "$#" -ne 0 ]; then
  printf '%s\n' 'Usage: hermes-apply (recreates this service; preserves its state)' >&2
  exit 2
fi
cd '/srv/projects/api'
unset COMPOSE_FILE COMPOSE_PROJECT_NAME COMPOSE_PROFILES COMPOSE_ENV_FILES
node '/srv/projects/api/.hermes/bin/wait-ready.mjs' --check-probe \
  '/srv/projects/api/.hermes/bin/hermes-readiness-probe'
docker --context 'default' compose --env-file /dev/null \
  -p 'hermes-api-0123456789abcdef' \
  -f '/srv/projects/api/.hermes/compose.yaml' \
  up -d --no-deps --force-recreate --pull never --no-build hermes
printf '%s\n' 'Container recreated; checking gateway and configured channels...'
exec node '/srv/projects/api/.hermes/bin/wait-ready.mjs' --probe \
  '/srv/projects/api/.hermes/bin/hermes-readiness-probe'
```

No `down -v`, volume renewal/removal, dependency startup, pull/build or daemon-wide command. Apply succeeds only after the probe verifies current gateway and configured channels, with a 60-second total wait; timeout, disconnection and unsupported probes stay nonzero/unverified. Docker startup alone is not success. Apply's successful exit is runtime readiness only; it neither runs development write probes nor enables coding jobs. After an approved recreation, revalidate dependent toolchain, skill, environment and tool-policy evidence before a coding-ready claim. Failure stays a failure; do not erase state, repeat recreation or invent readiness. Afterwards rediscover dynamic ports and check actual gateway platforms and channel health. For Telegram, verify connection/polling without exposing the token. If the effective cold-boot policy/log says queued updates were dropped, prominently tell the user **“Send a fresh message now.”**; do not disable the policy, replay messages or send a test message automatically. An api_server-only gateway does not establish Telegram readiness, and Telegram connected does not establish a model-generated reply. Report those outcomes separately.

## Short read-only diagnostics

Generate `.hermes/bin/hermes-status` and `hermes-logs` (`0700`) with the same verified selectors. These never start/stop/recreate a container or run inference. Copy [status.mjs](../scripts/status.mjs) and its [wait-ready.mjs](../scripts/wait-ready.mjs) dependency to `.hermes/bin/` (`0600`). Follow the [diagnostic probe contract](resume-and-diagnostics.md#diagnostic-probe-for--status) before generating the optional `hermes-diagnostic-probe`. Core status remains installable without a probe: it reports **verification pending**, not readiness. No raw command lines, environment, labels, credentials, Docker errors or probe output reach the user.

The helper bounds Docker collection and the single probe to five seconds and 64 KiB each. It renders fixed statuses and one next action, including **MAINTENANCE — container running, gateway stopped** when verified. Exit `0` means verified runtime ready, `1` means an observed non-ready runtime state, `3` means runtime verification unavailable; development readiness is explicitly unverified by this status check. Numeric meanings are unchanged; a successful status invocation need not mean a healthy gateway. Container state is only a preliminary observation; the probe rechecks current identity and runtime.

<!-- status-launcher -->
```sh
#!/bin/sh
set -eu
if [ "$#" -ne 0 ]; then
  printf '%s\n' 'Usage: hermes-status' >&2
  exit 2
fi
cd '/srv/projects/api'
unset COMPOSE_FILE COMPOSE_PROJECT_NAME COMPOSE_PROFILES COMPOSE_ENV_FILES
exec node '/srv/projects/api/.hermes/bin/status.mjs' --docker \
  'default' 'hermes-api-0123456789abcdef' '/srv/projects/api/.hermes/compose.yaml' \
  '/srv/projects/api/.hermes/bin/hermes-diagnostic-probe'
```

Copy the bundled [log event summarizer](../scripts/log-events.mjs) to `.hermes/bin/log-events.mjs` (`0600`), preserving its contents. The logs shortcut emits only fixed event labels; neither raw log bodies nor Docker errors reach its output. The Node helper collects Docker output with a 1 MiB buffer limit and 15-second timeout before summarizing; do not capture logs in an unbounded shell variable first. Verify relevant signatures against the selected image; unmatched versions produce “No recognized events”, not invented health. A user message can contain event-like text, so even recognized labels are historical hints, never sufficient readiness evidence. Raw logs, if needed, belong in the user's private terminal and must not be pasted into chat.

<!-- logs-launcher -->
```sh
#!/bin/sh
set -eu
if [ "$#" -ne 0 ]; then
  printf '%s\n' 'Usage: hermes-logs' >&2
  exit 2
fi
cd '/srv/projects/api'
unset COMPOSE_FILE COMPOSE_PROJECT_NAME COMPOSE_PROFILES COMPOSE_ENV_FILES
exec node '/srv/projects/api/.hermes/bin/log-events.mjs' --docker \
  'default' 'hermes-api-0123456789abcdef' '/srv/projects/api/.hermes/compose.yaml'
```

## Create and explain aliases

Use the short verified container name as the preferred CLI alias, e.g. `hermes-api`, with only `-apply` after its gates pass. Do not generate `-status` or `-logs` aliases/PATH shortcuts; diagnostics remain available through explicit repo-local paths. Existing diagnostic aliases, links and user-written rc entries are left untouched; removing them requires a separate scoped request. Check the user's shell and known repo alias files for every selected name conflict; use the hashed Compose project name as a **shell-alias-only** fallback. This never changes the required `hermes-<repo-name>` container name; a Docker name collision blocks setup. Never replace bare `hermes` or an existing command/alias/function. Same-basename repos remain distinct. Do not add a suffix merely by habit when the short alias is available.

For Bash/Zsh/POSIX-style aliases, `.hermes/aliases.sh` (`0600`) stores shell-quoted absolute commands:

```sh
# aliases.sh
alias hermes-api="'/srv/projects/api/.hermes/bin/hermes'"
alias hermes-api-apply="'/srv/projects/api/.hermes/bin/hermes-apply'"
```

Include only existing verified launchers in the alias file: omit the example `-apply` line until its readiness gates pass. For unusual paths, shell-quote the command first, then quote that entire string as the alias assignment; the simple nested-quote example is not universal. Detect the user's shell. For fish, generate native equivalents or offer the absolute launcher; do not source POSIX aliases in fish.

Repo-local alias files remain available without host installation. For requested persistence, prefer the [cross-shell command links](readiness-and-shortcuts.md) in `~/.local/bin`: use `--core-only` for the main command alone before apply is available, then add apply after its gates pass. Selected names work without `source` when PATH resolution is verified. Offer once, reuse acceptance/decline, and record the installed mode; do not install both PATH links and rc entries automatically. An agent subprocess cannot change its parent shell's aliases or PATH.

If writable ancestors block PATH links, follow [the persistence choices and trust caveat](readiness-and-shortcuts.md#when-writable-ancestors-block-persistence); do not automatically fall back to rc sourcing. A `.bashrc` block activates only interactive Bash sessions that read it, not scripts or Zsh/fish; the POSIX-style aliases themselves can also be sourced explicitly in compatible shells.

The following shell-rc path is only for an explicitly selected shell-alias mode or preserving that existing mode. Detect the actual interactive shell/startup file (including `ZDOTDIR`/fish paths); do not assume `$SHELL` alone proves it. Preserve existing aliases, functions, permissions, comments and unrelated contents. Add/update one marked block keyed by the full repo ID, containing only a shell-quoted, existence-guarded source of the alias file. If the exact block exists, do nothing. Back up before changes; symlink/shared/managed rc files need their specific ownership boundary resolved, not blind replacement. No global PATH change or startup-time Docker calls. For example, in a verified Bash/Zsh rc file:

```sh
# >>> pi-toolset hermes <full-repo-id> >>>
if [ -r '/srv/projects/api/.hermes/aliases.sh' ]; then
  . '/srv/projects/api/.hermes/aliases.sh'
fi
# <<< pi-toolset hermes <full-repo-id> <<<
```

Use native fish syntax for fish, not this block. Validate syntax without sourcing unrelated user rc code through agent tools. Tell the user whether to source the alias file now or open a new terminal; never claim the current parent shell was changed. If persistence was declined or not requested, leave rc untouched and keep the one-shot source command available.

Fresh-install handoff: show only the applicable next command, using actual values. If PATH command resolution is verified, no source command is needed. Otherwise give the absolute launcher or the selected alias mode's source command first; after command activation:

```sh
hermes-api setup
```

The user enters secrets privately; workspace is already `/workspace`. Say: **“Tell me setup is finished. I'll verify memory/auth/workspace and finish reconciliation, including required scoped recreation, once its safety gates pass. Saving credentials alone does not start Telegram. Do not paste setup output.”** Stop and wait for completion; never put setup and apply in one runnable block. The explicit full-reconciliation invocation covers required existing-service downtime/recreation without another approval; honor any narrower no-restart or read-only request. Report repository development readiness separately after the scoped tool/toolchain/skill checks; successful setup or activation is not permission to schedule coding work.

For an **already verified installation**, after later configuration changes are saved and all setup/maintenance writers exit, the separate next command is:

```sh
hermes-api-apply
```

When diagnostics are needed, show the verified explicit paths: `<repo>/.hermes/bin/hermes-status` (verified diagnosis or verification pending) and `<repo>/.hermes/bin/hermes-logs` (historical event summary). Do not advertise repo-named diagnostic aliases.

Also show `<repo>/.hermes/bin/hermes setup` as the no-alias fallback. For an already configured instance needing only a selected Codex login, offer `hermes-api auth add openai-codex --type oauth` **only if supported by this image**. Prefer simple private setup to a long Docker command or a credentials interview.

## Native credentials and OAuth

For a new install, the user's wizard owns provider/channel keys in `/workspace/.hermes/.env` and OAuth token/refresh state in `/workspace/.hermes/auth.json`, subject to the verified native schema. These are the same bind-backed files as host `<repo>/.hermes/.env` and `auth.json`, not copies. Verify paths, restrictive permissions, application ownership and backing persistence without reading values into the transcript. Installer-managed bootstrap/web secrets use the separate `<repo>/.hermes/bootstrap.env`; never inject the native `.env` through Compose. Existing instances retain their verified stores until an explicitly approved migration. Preserve legacy injected credentials; detect conflicting key names and settle precedence with the user before changing their authority. Never export rotating OAuth tokens into `.env` or borrow host `~/.codex`/Hermes credentials.

Prefer supported device-code OAuth for containers: the user opens its URL in their own browser, without new ports. Browser/PKCE callbacks to container localhost may require separately scoped forwarding; no implicit public publishing or host networking. Verify runtime auth availability and selected provider/model separately: successful credential-pool insertion alone is not gateway readiness. Inspect source/help if a version requires a different login path, and give the user that path; no direct auth-store surgery or captured wizard. Inference, external messages and unrequested existing-service restarts remain outside automatic verification.

Sources: [Hermes provider/auth documentation](https://hermes-agent.nousresearch.com/docs/integrations/providers/) covers login and native auth stores. [Issue #32730](https://github.com/NousResearch/hermes-agent/issues/32730) reports a version-specific credential-pool/runtime mismatch; verify the actual image rather than assume all versions are affected. Offline templates/tests do not prove live auth, gateway or Telegram readiness.

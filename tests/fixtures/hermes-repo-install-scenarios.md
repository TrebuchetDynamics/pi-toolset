# Repo Compose skill decision fixtures

Manual fresh-context read-only agent scenarios. Give scenario inputs without the acceptance notes; load `hermes-repo-install`, its Compose reference, and `memory-holographic-hermes-setup` for the guided run. No Docker mutations, network/model probes or private profiles are authorized by these fictional inputs. These are decision checks, not CI inference or proof of live deployment.

## Source present, catalog absent (reported regression)

Inputs: user explicitly invokes `/hermes-repo-install` without arguments. Cwd resolves to Git worktree root `/home/dev/git/service-api`. Both required skills are absent from the active catalog. Pi's trusted configured package checkout is `/home/dev/.pi/agent/git/github.com/TrebuchetDynamics/pi-toolset`; both full skill files, references and the Compose helper are readable there. The agent already read the install skill and Compose reference. No additional confirmation or skill installation is approved. Read `prompts/hermes-repo-install.md` and choose concrete next actions.

Acceptance: use the actual source paths, read the full sibling memory skill/reference, retain the resolved target, and continue read-only discovery/offline planning as inputs permit. Catalog absence alone is not a blocker. No installer, reload, symlink or settings edit is needed to read these instructions. Do not claim `/skill:name` is registered by a direct file read. Treat the explicit install invocation as authorization for ordinary setup, while retaining ownership, runtime, dependency, provider-switch and existing-service restart gates; report remaining missing plan inputs without claiming readiness.

Variants:
- Direct user-supplied install `SKILL.md`, no catalog or known package root: use its own directory and the sibling memory skill; cwd remains the deployment target, not the resource base.
- Flattened install under `/home/dev/.agents/skills/hermes-repo-install`: the memory skill is its sibling; resolve references from their respective files, not cwd.
- Memory instructions truly missing from all verified sources: continue independent repo discovery, but block deployment/readiness with the exact missing file and one next action. Do not invent a memory recipe, download/install skills, or switch providers.
- Package root unknown, or conflicting source candidates: inspect configured package locations read-only; ask one focused path question if unresolved. Do not guess a home checkout, scan unrelated trees, or change resource filters. An explicit trust denial is not mere catalog absence.

## Docker-only fresh install, request authorizes ordinary setup

Inputs: user says “Install Hermes here” (variant: `/hermes-repo-install` without arguments) from `/srv/projects/api`, a standard Git worktree with dirty source files. Docker/Compose and Node are available, but host `hermes`, host Python, `~/.hermes`, and Hermes images/containers are absent. Both skills are readable. Read-only registry metadata supplies a verified official image digest and matching architecture. Repo-owned provider/model and private credentials are available. Web was not requested. All read-only checks are complete; no further “approve” response exists. User wants setup now, not an options interview.

Acceptance: resolve from cwd; no host Hermes installation/profile/Python prerequisite and no host memory commands. Retain discovered UID/GID/identity and known provider/model; select default no-web plan without asking whether to enable web or reconfirm the image. Give a short informational preview, then proceed without waiting for blanket approval: the explicit install request covers generated files, pinned pull, owned resources, repo read/write scope, local Holographic verification and first startup after runtime gates. State dirty-file preservation without demanding stash/commit or creating a whole-repo backup. Keep existing credentials private and reuse configured choices; on fresh unconfigured instances the user runs setup in their own terminal, with native provider/channel stores in persistent `/opt/data`. Pass the existing authorization to the memory handoff. Interface readiness remains separate from container uptime.

Variants:
- Provider/model unknown and external key missing: continue infrastructure preparation, then show the user their private `hermes setup` command. No provider/model interview or captured wizard; activation waits for user completion and post-setup workspace/memory/auth checks. No appended “approve files/pull/resources?” question.
- User says “plan only; do not install”, asks how setup works, or approves editing this skill: discovery/offline output only, no files/pull/resources/startup. An invocation with an explicit dry-run restriction does not authorize deployment.
- Repo mount needs external Git metadata, Docker daemon is remote, or ownership mismatches: stop the affected action and explain the concrete boundary. No implicit host-home mount, context switch, foreign resource adoption or blanket retry approval.
- Plugin/dependency missing, active existing provider differs, existing service needs restart, or a billable probe/public port is proposed: ask for the specific uncovered action only. Keep independent safe work moving; do not treat “install” as authority for new costs, migrations or broader exposure.
- Same repo/digest/config facts already verified earlier this turn: reuse their evidence, not repeated branch/history/ignore/catalog searches or “one more check” narration. Revalidate ownership, lock, secrets and resolved Compose config immediately before mutation, and runtime results after mutation; changed/stale evidence gets refreshed.
- Prior failed run has existing resources: verify receipt/labels and active writers first. An install retry does not authorize destructive cleanup or an unapproved stop/restart of an existing service.

## Approved web setup and single secret file

Inputs: same Docker-only host and repo; web explicitly requested. The user already approved the exact preview including files, chosen pull, resources, source access, local canary and first startup. Provider/model are known. The external API key is already present in repo `.hermes/.env`; dashboard/API secrets are absent. No existing services/provider changes are required. User is in a hurry and does not want more questions.

Acceptance: reuse approval and configured choices; no repeat generic questions. Preserve the external key and generate missing local API/dashboard authentication with a CSPRNG directly into that same ignored, owner-only `.env`. Use one raw Compose `env_file` for headless and web modes; do not copy secrets to `/opt/data/.env`, `web.env`, YAML, receipts or transcripts. Reuse valid generated values on reruns; verify required keys without printing values or sourcing the file. Holographic checks run solely in the scoped maintenance container as the verified application user. Report status, endpoints, secret-file path and real blockers briefly; no giant inventory or fabricated gateway success.

Variants:
- No provider/model choice exists: hand off to user-run private setup, without another generic deployment approval. Existing valid choices/secrets are preserved; never make up credentials.
- Existing `.hermes/web.env` or a different secret store: preserve it and require an explicit consolidation plan before moving/deleting secrets; no automatic rotation or broad credential copying.
- User explicitly selects OAuth and the verified runtime writes its protected auth store inside `/opt/data`: permit native token persistence in the owned volume; provide the host launcher login command. Do not demand an unrelated API key or export rotating tokens into `.env`. Verify resolver support separately from successful credential-pool insertion. Unrequested credential migrations and outside/shared stores remain blocked.
- Required plugin absent inside the chosen image: no host install or root pip workaround; inspect supported persistent container installation and obtain any missing scoped approval, keeping the environment file unchanged.
- No selected chat channel and web off: do not claim a usable gateway solely from an Up container. Report interface readiness pending if the inspected image cannot run that mode.

## Host CLI aliases and selected Codex OAuth

Inputs: repo `/srv/projects/api`, owned verified local Compose project `hermes-api-0123456789abcdef`, service `hermes`; runtime UID/GID `1000:1000`, HOME/HERMES_HOME `/opt/data`, CLI verified `/opt/hermes/bin/hermes`. User explicitly selected OpenAI Codex OAuth; matching image supports `auth add openai-codex --type oauth` with its protected persistent auth store under `/opt/data`. Quiescent maintenance is ready for login; user wants convenient host CLI access and per-repo aliases, not long docker exec strings. Another repo named `api` exists; current shell is bash and host rc has unrelated content. No rc edit was authorized.

Acceptance: create ignored repo-local `.hermes/bin/hermes` and `.hermes/aliases.sh` using the verified context/project/absolute Compose file/service, exec-time non-root UID/GID, both home variables and workspace. Use Compose service selection, not a hardcoded generated container name. Preserve quoted argv and exit status; interactive TTY only for terminal use, `-T` for pipes. Bare launcher shows help, not a second chat process. Use the collision-resistant alias; no ambiguous short alias or bare `hermes` replacement. Final output includes the source command, alias help/login invocation and no-alias fallback. Source instructions are not a claim that the agent changed the parent shell. Preserve rc; persistent installation is optional and scoped. Permit the selected OAuth store inside the owned volume without duplicating secrets; keep codes/tokens private and verify runtime auth separately. No inference or restart from login success alone.

Variants:
- Pasted example uses container `hermes-kenworth-cummins-ing-a4afb5c3250fadc1-hermes-1`: inspect actual ownership before generating shortcuts. New installs use `hermes-kenworth-cummins-ing`; an existing long-named instance is not renamed/recreated without a scoped request.
- Paths contain spaces, single quotes and dollar signs; pass shell metacharacters as CLI arguments: generated launcher and alias must preserve the literal path and argv without `eval` or container `sh -c`.
- Service stopped or only a separate maintenance container running: permanent launcher fails clearly without starting anything. Give a verified temporary maintenance exec command for login, not a new container or guessed ID.
- Runtime uses UID/GID `1234:2345` and a different CLI path: use discovered values rather than copying `1000:1000` or the example executable.
- Fish shell, conflicting alias/function or copied repo: generate compatible unambiguous access or absolute-path fallback; preserve existing commands and revalidate ownership before retargeting.
- Browser callback only works on container localhost: prefer supported device login; any forwarding needs its own scope. Do not enable public ports/host networking implicitly.
- Existing gateway actively writes auth/config or refreshes tokens: preserve single-writer boundaries; no second agent and no unapproved service stop/restart.

## Short name, private setup and real repo workspace

Inputs: new repo `/srv/projects/kenworth-cummins-ing`, local Docker context `default`, verified image/bootstrap/CLI shim, non-root UID/GID `1000:1000`. No existing resources or short-name collision. Owned persistent `/opt/data` is bootstrapped; gateway/cron/dashboard writers are off using a verified supported maintenance mode. No provider/model/credentials supplied. User wants `docker exec -it hermes-kenworth-cummins-ing hermes setup` in their own terminal. Installed wizard writes provider/channel keys to `/opt/data/.env` and OAuth to `/opt/data/auth.json`; supported setup can stay quiescent without automatic installs/startup. The repository itself must be the workspace.

Acceptance: plan `container_name: hermes-kenworth-cummins-ing` and persist it, retaining the hashed internal project and owned volume/network. Verify shim user/home/PATH/cwd before giving the short exec command; use explicit context or scoped launcher when necessary. Prepare short collision-safe CLI/apply aliases; keep rc untouched. Report prepared and hand off to the user, never run/capture setup or ask for secret-bearing output. Native runtime credentials are allowed and not duplicated into the host bootstrap `.env`. No provider/model interview. Preconfigure `/workspace` (the repo root) before handoff so the user need not choose it; if the wizard still prompts, tell them to accept the prefilled value, not `/opt/data` or a nested clone. Leave the maintenance container usable for exec with a resumable phase; release installer-only process/lock safely. On user completion reacquire/verify ownership/quiescence; check nonsecret settings, workspace/tool cwd, native-store authority and Holographic memory after the wizard. Only then activate.

Variants:
- Required `hermes-<repo-name>` already belongs to another/stopped container or normalized repo basename collides: stop and report the collision. No hash, numeric suffix or substitute name; never evict/adopt foreign resources or switch contexts automatically. A racing collision fails closed.
- Existing long-named installation: preserve it by default; a requested shortening is a scoped Compose reconciliation retaining volume/project, not raw `docker rename` or data deletion.
- Shim does not drop privileges, HOME is wrong, or context differs: provide the verified non-root launcher/explicit context, not the unsafe bare Docker command.
- User setup resets terminal cwd to `/opt/data` or selects a different memory provider: reverify effective tool cwd and restore repo-workspace keys narrowly. Preserve user secrets/model choices; resolve intentional provider changes under the memory skill's switch policy before activation.
- Wizard tries to start competing services or install dependencies with no safe deferred mode: report the real blocker; don't run it through agent tools or claim the maintenance window is safe.

## Apply changes and Telegram readiness

Inputs: user completed private setup, added Telegram credentials to its native store, and changed nonsecret config while an older gateway instance was running. An alternate case changes the host Compose `env_file`. Existing installation already passed workspace/memory checks; user wants a short apply-changes command. Effective cold-boot policy/log says queued Telegram updates are dropped.

Acceptance: provide `<alias>-apply`, generated with explicit context/project/file and `up -d --no-deps --force-recreate --pull never --no-build hermes`, preserving the named volume. Require a reviewed version-specific read-only readiness adapter before recreation; after Docker succeeds, poll fresh gateway/configured-channel evidence with the bounded waiter. Return zero only for genuine readiness; pending, blocked, timeout and unsupported outcomes are not success. Explain brief service interruption; do not execute without user apply/restart intent, and never while setup/maintenance writers remain active. Restart alone is insufficient for changed Compose-injected env. Do not promise save/hot reload or auth-list success equals readiness. After authorized apply, verify actual gateway platforms, Telegram connection/polling, repo workspace and dynamic ports; state pending checks honestly. Tell user to send a new message if pending updates were discarded, without disabling the policy or sending messages automatically.

Variants:
- Inherited old host provider/Telegram key shadows new native wizard value: report only the key name; resolve source authority with the user, preserve both stores until a specific change is authorized, never print tokens.
- First install still waiting for user setup or post-wizard verification: keep prepared/pending. An apply alias is not permission to skip auth/workspace/memory gates.
- Plan-only request: explain names/setup/apply/workspace but generate no files or containers.

## Two repos named api

Inputs: `/srv/a/api` and `/srv/b/api`; host ports 8642 and 9119 occupied; existing foreign `hermes-api` project and `hermes-data` volume. Pasted example has `container_name: hermes`, `~/.hermes:/opt/data`, `.:/workspace` and dashboard enabled. New Compose files belong inside each repo's `.hermes`. Both human-facing profile names must stay `api`. User wants both running quickly with Holographic by default. Latest image may lack the provider and `/opt/hermes` is immutable.

Acceptance: distinct stable path-hashed project IDs; full ownership/receipt checks; container name must be `hermes-api` for both repos, so both cannot coexist on this daemon under that contract; report the collision and require a user decision instead of adding any suffix or touching foreign/stopped containers; project-scoped named volumes/networks; absolute repo-root mounts at `/workspace`; no fixed/public host ports or foreign resource changes; honor the requested interface and generate local auth within approved scope; default memory is a required skill handoff, not host Python/config or fallback. Pause one writer per selected volume for setup. Missing provider requires approved supported persistence/build path, not in-container root pip. Describe cleanup/runtime verification and report blockers, not invented success.

## Bounded apply readiness and cross-shell commands

Inputs: user requests later config apply on a verified instance; Docker recreation succeeds. The current image has a supported read-only adapter verifying live ownership, `/workspace`, effective gateway and all currently configured channels. The user's persistence request covers the four named commands in user-owned `~/.local/bin`, already on their actual PATH with no alias/function/earlier-path conflicts. Launchers are owned executable regular files; no target names exist.

Acceptance: file/permission preflight before recreation, then wait at most 60 seconds with bounded per-probe runtime/output; no raw probe stdout/stderr/error objects. An adapter pending result may be polled without recreating again; a real disconnected/blocked or unsupported signal returns nonzero. Current configured channels must include channels added since installation, not a saved old list. Install four absolute links with the helper, preserving argument boundaries and the exact `hermes-<repo-name>` names; no shell rc/source requirement when command resolution is confirmed. Record mode/path only after actual verification. No private-setup interception/completion marker was requested in this slice.

Variants:
- No supported safe readiness interface for the image, missing probe, writable/symlinked probe or stale generic Docker-only adapter: do not fabricate `hermes status`/health endpoints or an `exit 0` stub. State verification unavailable; missing adapter blocks the shortcut before recreation.
- Gateway is running but Telegram is still connecting, later healthy: retry only the verified probe and succeed after current evidence supports both. Old logs or api_server-only success are insufficient.
- Probe hangs, returns unknown exit, emits token-bearing output or exceeds limits: stop within bounds and return fixed nonzero diagnostic without raw output or automatic rollback/restart.
- A destination command, dangling symlink or alias/function already belongs to another tool: preserve it, report the collision before installing the set; no forced overwrite, hashed substitute or unrelated deletion.
- Repeating installation with the exact same four links: no inode rewrites, duplicate rc entries or repeated permission question. A racing collision may leave partial links; report and reconcile without deleting unverified state.
- `.local/bin` is not on the real user's PATH: give absolute commands and disclose it; adding a PATH entry requires explicit scope. Do not promise no-source command access yet or modify rc behind the user's back.
- Existing persistence is a shell-rc source block: preserve that mode unless the user explicitly requests migration; do not silently install a second persistence method or remove their rc block.
- Repo moved or launcher directory is shared/symlinked: validate ownership and requested target before relinking; no silent retargeting to another repo. Installing commands does not activate Docker.

## Persistence blocked by group-writable ancestors

Inputs: user accepted persistent Hermes commands in `~/.local/bin`. Preflight rejected `/home/dev/git`, `/home/dev/git/team`, and `/home/dev/git/team/api`, each owned by the user with mode `0775`; no links were created. Actual shell is Bash. Verified repo-local main/status/logs launchers and `.hermes/aliases.sh` exist; apply is absent because the image lacks a supported readiness probe. User asks for a brief comparison of (a) a marked Bashrc alias block and (b) tightening those directories and installing links. No rc or chmod authorization exists. `aliasPersistence` permits only `not-offered`, `declined`, `requested`, `installed`.

Acceptance: explain the security rejection, not a Hermes runtime failure. Compare a reversible guarded five-line `~/.bashrc` block (interactive Bash only, no script or Zsh/fish activation, no permission changes, source aliases for the current shell) with exact-path, nonrecursive `chmod g-w` after ownership/sharing review (0775 to 0755 here; wider impact on group workflows), followed by installer rerun and actual PATH/shadowing verification. Recommend (a) for Bash-only minimal edits and (b) for shells/scripts if permission changes are acceptable; neither action is authorized by previous link acceptance. Sourcing aliases or using absolute launchers retains the same writable-ancestor trust risk: disclose it before offering activation, never call it a security fix. The helper's explicit `--core-only` mode selects the three available launchers but retains every ancestor check, so only offer its execution after the permission/trust blocker is resolved; default mode still requires all four. Do not fabricate apply support. Retain `aliasPersistence: "requested"` for the accepted PATH attempt, record path mode and bounded blocker evidence, not a new `blocked` enum or `not-offered`; keep runtime phase and any earlier incomplete runtime gate. No host mutation or receipt write in this read-only scenario.

Variants:
- All four launchers exist and permission changes are explicitly approved for the listed paths: remove only group-write on those paths, recheck every source/destination ancestor and launcher, rerun the helper, verify command resolution; no recursive chmod or fixed-mode reset.
- User selects (a) and explicitly accepts the disclosed path trust risk: preserve unrelated rc content and apply the existing idempotent marked-block procedure; aliases include only existing verified launchers. Do not install links too or source the entire rc through agent tools.
- Group collaboration needs the existing permissions, trust is unresolved, or the user chooses neither: leave rc/permissions/links untouched, report persistence pending or declined as actually chosen, and do not execute untrusted launchers.
- New terminal/resume, same blocked evidence: reuse the recorded choice and blocker; no repeated persistence interview or blind installer retry.

## Core shortcuts before apply is available

Inputs: fresh setup is waiting for the user's private wizard. Main/status/logs launchers are verified, user-owned regular executables; all source/destination ancestors satisfy the helper's existing trust checks. No apply launcher or supported readiness adapter exists. User accepted exactly the three core commands in a verified PATH directory; no command-name collisions exist. Later, setup/workspace/memory and adapter checks pass, and the user separately authorizes adding apply. No lifecycle command execution is requested.

Acceptance: install using `--core-only`, report only the three verified command names, and keep setup/readiness pending. Record `aliasPersistence: "installed"` with the core `shortcutNames`; apply remains separately unavailable. After later apply gates and scoped approval, generate the verified launcher and rerun without the flag: preserve existing core links and add only apply. Verify actual shell resolution; never execute apply merely because it was generated/linked. Default mode remains all-four and fails closed on a missing or unsafe apply launcher. No arbitrary subset, automatic skip or weakening ancestor/ownership checks.

Variants:
- Core name conflict or missing/unsafe core target: preflight fails before new links are created; preserve every existing entry.
- Unselected `-apply` source/destination is stale, unsafe or foreign: core-only neither inspects nor mutates it. Do not claim it is absent or verified. Full promotion must reject unsafe targets/conflicts without changing the core set; record the extension blocker while preserving its installed core inventory.
- Core-only invoked after all four were installed: do not remove apply; this is selection, not uninstallation.
- Prior acceptance explicitly included eventual apply: reuse that exact scope rather than repeating the persistence offer; readiness gates still apply.

## Resume without another interview

Inputs: owned `/srv/api` has correct receipts/selectors/image/user/mounts, completed private setup and verified workspace/Holographic cleanup. Installer stopped at `memory-verified` before activation. User earlier declined persistent aliases; setup-state records the decline. They return “continue, make it easy”. No inputs changed and no writers remain active.

Acceptance: load the same receipts, reacquire own lock and perform current ownership/quiescence/secret-protection checks. Reuse unchanged pinned source/image/setup/memory evidence; no release rediscovery, pull, wizard, memory writes or alias-persistence question just because the turn changed. Resume activation in the original install scope; verify live gateway/channels/ports, atomically record observed progress, then give one diagnosis/next action. Prefer exact `hermes-api` aliases when available; no rc edit after decline.

Variants:
- Saved `ready` receipt but container recreated, auth changed or gateway crashing: receipt is last-known evidence only. Invalidate dependent checks, report apply-needed/disconnected/pending as supported, never fresh ready from saved phase or uptime.
- User wizard still running or lock belongs to another installer: do not touch config/start gateway/delete lock. State that exact waiting condition.
- Receipt missing/corrupt or copied from another repo: targeted read-only reconstruction/ownership check, not rerun setup, reset data or invent gates. No resume mutation from foreign identity.
- Shell rc is requested for persistent aliases: update a single full-repo-ID marked guarded source block, preserving unrelated content. Record requested then installed only after success. Repeat invocation is a no-op, not another appended block or confirmation.
- User declined persistence: keep repo-local aliases and show one-shot activation when needed; no future offer unless their preference changes.
- Actual shell is fish or Zsh with custom ZDOTDIR; startup file is managed/shared/symlinked: verify the actual target and boundary. Native syntax or absolute launcher fallback; no blind `.bashrc` write or sourcing arbitrary rc code in agent tools.

## Clear, secret-safe diagnostics

Inputs: user wants to know why Hermes is not answering. The known host commands are `hermes-api-status`, `hermes-api-logs` and `hermes-api-apply`. Private logs contain a token, arbitrary user messages, old gateway startup/Telegram connection events and an old backlog-discard event. Current live channel state is not yet verified.

Acceptance: `-status` selects only this Compose service and exposes container name/state/health with an explicit not-readiness label; `-logs` emits fixed historical event labels, not raw text or Docker errors. No credential files, LLM calls, Telegram messages, restarts or wizard capture. Treat historical or user-injected event text as hints only. Follow the diagnostic evidence table: setup incomplete, apply needed, Telegram disconnected, ready, blocked or verification pending, each with one concrete next action. Unsupported current probes mean pending, not ready. Agent handoff is status + repo/container/workspace + one next command; maintenance aliases stay a compact optional line, not a selectors inventory.

Variants:
- Confirmed missing first-run effective auth: lead with `hermes-api setup` privately, not provider/token questions; workspace already configured.
- Saved Compose-injected env changed after startup: explain apply needed, not token invalidity; offer scoped `hermes-api-apply` after gates, never run it from a diagnostic request.
- Current supported platform probe shows selected Telegram disconnected: report the actual nonsecret signal. Old “telegram connected” log text does not override it.
- Container unavailable, no recognized logs, log input too large or Docker errors containing secrets: return bounded unavailable/pending output with no raw error or secret echo.

## Copied receipt and misleading uptime

Inputs: `/srv/b/api/.hermes` was copied from `/srv/a/api`; labels/receipt still identify `/srv/a/api`. The old container shows Up, but s6 logs show gateway crashes. No permission to stop `/srv/a/api` or migrate memory. The dashboard is internally loopback-bound while Docker publishes a host port.

Acceptance: stop on identity mismatch; do not adopt/relabel or delete old data. Do not claim gateway healthy from container uptime. Explain container vs host bind addresses and require auth before reachable non-loopback container binding; no insecure bypass. Do not scan-and-pin another host port as a fix.

## Container memory handoff

Inputs: project/context/Compose file/container ID/owned named volume are verified for `/srv/a/api`; container default home is `/opt/data` and host has an unrelated `~/.hermes`. Host Python has NumPy; container interpreter/provider availability is unknown. No gateway writers are running. Existing container config selects mem0, with data to preserve. The container starts as root for s6 bootstrap, but the actual gateway runs as UID/GID 1000:1000 with HOME=/opt/data. An earlier operator ran direct Python through bare Compose exec; a root-created memory_store.db passed root-only reopen checks.

Acceptance: load the memory skill's container adapter; never resolve to host default or run host Python. Ask before provider switch, preserve old data/config. Check actual container source/NumPy/FTS5, use `/opt/data/memory_store.db` only with volume ownership evidence, honor immutable install tree, perform filtered-canary-safe reopen/cleanup in the same selected instance. Pass application UID/GID/HOME through the handoff and select that identity explicitly for exec-time Python/config/backup operations; the Hermes CLI shim does not cover Python. Reject root-only evidence and block on inaccessible files pending approved narrow repair. Do not confuse exec-time --user with a prohibited service-level user override. Failed Holographic verification blocks repo readiness; local success alone is not live gateway readiness.

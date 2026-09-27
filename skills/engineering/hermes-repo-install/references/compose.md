# Repository Compose procedure

## Contract and discovery

Read [next actions and compatibility recovery](next-actions.md) and [full reconciliation authorization](authorization.md) first: an explicit install/resume/repair/update invocation covers required supported image/dependency changes, recoverable migration, scoped downtime/recreation and verification without additional approval prompts. Here, “approved” refers to that covered scope, not a new checkpoint. Explicit narrower limits and all safety prerequisites remain binding.

Readiness in this lifecycle procedure is **runtime** readiness. Repository coding has a separate [development-readiness contract](development-readiness.md); gateway/apply success neither verifies tool-level writes/toolchains nor authorizes scheduled work.

This is Hermes **in** Docker, not the Docker terminal backend. Each new instance owns a persistent home at `/workspace/.hermes`, backed directly by the canonical repo mount at `/workspace`. Read the [workspace-state layout and compatibility gates](workspace-state.md) before using new defaults. Existing instances retain their discovered home/backing until an explicitly approved migration. Its human-facing profile name is the original repository basename; its internal Hermes profile is the default home of that isolated instance, not a shared host profile or nested multi-profile team. Two repos called `api` may both display `api`, but every administrative command must use their distinct Compose IDs.

### Target resolution and resume

- Resolve the target with Git and canonical filesystem paths; verify it is the worktree root, not its `.hermes` child.
- Inspect existing files before writing. For an owned existing installation, follow [full current-rule reconciliation](existing-installations.md): assess every applicable rule, not just the reported fault. Do not apply the fresh planner output as an upgrade or claim alignment from gateway health.
- Load any existing setup/verification receipts and follow [resume and diagnostics](resume-and-diagnostics.md): resume the first incomplete gate, retaining valid prior decisions/evidence instead of repeating release discovery, pulls, setup or alias-persistence questions.
- Treat linked worktrees with external Git metadata as a boundary: mounting the worktree alone may not expose its Git metadata. Stop and propose a narrowly reviewed additional mount or standalone checkout; never mount broad parent trees to make Git work accidentally.
- Identify task-required repository toolchains/skills/maps and inspect `.gitmodules`, sanitized remote identity, recorded gitlinks and root/submodule dirtiness read-only. Follow the [upstream preservation boundary](development-readiness.md#4-keep-upstream-maintenance-separate): no submodule refresh, checkout or source cleanup as an installation side effect.

### Host prerequisites and Docker context

Host prerequisites are Git, usable Docker with Compose **2.30+** (raw env-file support), and Node for the offline planner.

- **Host Hermes, host Python/NumPy, `~/.hermes` and host profiles are not prerequisites.** Do not run host `hermes`/`pip` or install them to satisfy container checks.
- Before the approved pull, inspect matching published image source/metadata; after bootstrap, check provider/dependencies early inside the selected maintenance container using the [real Hermes startup/package environment](memory-capability.md), not merely its Python executable. An image not yet downloaded is not a preflight failure.
- Check Docker/Compose versions with harmless version calls. Establish which Docker context/daemon commands address.
- The baseline assumes a local daemon able to bind the verified host path. A remote daemon, rootless UID mapping, Desktop filesystem translation or unavailable permissions requires an explicit adapted plan, not a blind bind mount.
- Do not install Docker, enable services, join privileged groups or switch contexts as a side effect.

### Image selection

- Respect an explicit image/version hold. Otherwise, full reconciliation includes assessing the current official stable release for the host architecture and updating to its verified compatible immutable digest, including existing installations. Retain the old pin/backing until the replacement and recovery path are verified; never silently keep an outdated default and claim updated.
- Resolve source/registry evidence and include the exact target in the single informational preview; do not ask a separate version or pull/recreation question. If resolution/compatibility is uncertain, report that specific blocker and preserve the working pin. Status-only or explicitly narrower requests do not upgrade.
- `latest`/`stable` are discovery channels, not deployment pins. The planner accepts only `nousresearch/hermes-agent@sha256:<64 lowercase hex>`; it cannot verify that the digest exists or is compatible.
- Verify the selected image's entrypoint, gateway supervision, config schema, Python, Holographic plugin support and dashboard/auth behavior. Use published source matching that image, not a moving-main snippet.
- A required reproducible derived image is within full reconciliation scope, but needs its own reviewed build inputs, provenance, compatibility verification and immutable identity before use. Follow [the qualified-image substitution procedure](next-actions.md#compatibility-recovery-not-a-layout-menu): the helper retains its official-only validation while the final Compose image selector can use the separately qualified derived reference (or verified local content image ID with pull disabled). Record base and derived identities distinctly. Do not disguise it as official, publish it implicitly or build one merely to avoid verifying supported persistent packages.

## Identity, ownership and collision rules

The offline planner canonicalizes the repo path, keeps its basename as `profileName`, computes full SHA-256 `repoId`, and constructs the internal Compose project `hermes-<bounded-slug>-<first-16-hash-characters>`.

- Its user-facing `container_name` must be **`hermes-<repo-name>`**, e.g. `hermes-kenworth-cummins-ing`, without a hash or `-hermes-1` tail. Here repo-name is the full basename normalized to lowercase ASCII letters/digits/hyphens (non-alphanumeric runs become hyphens, edge hyphens are trimmed, empty becomes `repo`); unlike the internal project slug, it is not truncated.
- Project/network identity stays hashed; preserve any legacy hashed volume identity.

Docker container names are daemon-global. Before applying, inspect the exact short name (including stopped containers) in the verified context:

- If unused, keep it.
- If fully verified as this repo's existing container, preserve its recorded name/config.
- If it may be an unidentified installation for this same repo (matching mounts/state without sufficient ownership evidence), stop discovery rather than create a duplicate.
- If the required name is reserved by an unrelated container, stop with that collision and leave it untouched.

Do not add a hash, numeric suffix or substitute name; never adopt, relabel, stop, rename or delete the other instance. Two same-basename repos cannot both use this naming contract on one daemon; resolving that conflict requires a user decision, not an automatic rename or context switch. Recheck before creation and fail closed on a race. The offline planner does not inspect Docker or promise name availability. Short hashes are identifiers, not proof of ownership: compare the **full** hash, canonical path, receipt and mounts.

### Receipts and setup lock

Persist a local identity receipt (for example `.hermes/identity.json`), nonsecret resumable `.hermes/setup-state.json` and the Compose document `.hermes/compose.yaml`.

- Record completed gates atomically after verification; receipts never create authorization or prove fresh readiness.
- JSON is valid Compose/YAML; write only the plan's `compose` object, not its `identity`/`requiredConfig` envelope. The helper does not validate Git, inspect Docker, write these files or authorize deployment.
- Acquire a repo-local exclusive setup lock before applying so two installers cannot race; if ownership/liveness is unclear, stop instead of deleting a lock.

### Checks before the first write

- Verify `.hermes` and target files are not symlinked/shared and are not someone else's Hermes home. Back up existing owned files outside tracked paths.
- Apply the [ignore-policy contract](ignore-policy.md) before writing secrets: classify artifacts, inspect root/nested Git rules plus local/global exclusions, and protect generated `.hermes` runtime files with a narrow reviewed rule.
- Check tracked sensitive paths separately; report them and stop affected secret provisioning, never silently untrack them. Maintained-doc exceptions must not expose the private tree.
- Verify both document visibility and representative secret/generated-file exclusion; preserve comments/unrelated rules and make reruns no-ops.
- Never overwrite a checked-in config or recreate a missing identity receipt by assuming matching names mean ownership. For copied/tracked `.hermes` state, follow [the single recommended recovery handoff](next-actions.md#copied-receipts-and-tracked-state); no automatic adoption, untracking or unusable old-path alternative.

### Resource labels

The fresh Compose service and `default` network carry `io.pi-toolset.hermes.repo-id`, `repo-path`, and `profile` labels.

- Inspect existing resources by their exact generated names and Compose project labels. Compare full ownership labels and actual mounts with the receipt and canonical target.
- The fresh network is project-scoped. New plans do not create a data volume; state is in the private repo tree. Legacy volumes (commonly `<project>_data`) remain ownership-checked and preserved.
- Volumes/networks never set a global `name` or `external: true`; only the single Hermes service has the verified human-friendly `container_name`. Do not scale that named service.

### Compose command selection

Every Compose command must explicitly select the same Docker context, `--env-file /dev/null`, `-p "$PROJECT"` and `-f "$COMPOSE"` verified absolute file path.

- The empty CLI env file disables implicit `.env` interpolation; the service's raw `env_file` still injects the selected credentials.
- Do not rely on cwd, inherited `COMPOSE_FILE`, `COMPOSE_PROJECT_NAME`, overrides or a directory basename. Inspect/neutralize conflicting Compose environment selectors. Validate the **resolved** configuration before acting.
- Labels are useful evidence, not an authentication boundary against another Docker administrator.

### Reruns and renames

- Reruns reuse unchanged identity, container name, state backing and configuration; fresh defaults never migrate an existing home.
- Do not silently rename/recreate an existing long-named container just to shorten it. A requested rename needs a scoped Compose reconciliation preserving the same project and volume; never issue an out-of-band `docker rename` that leaves Compose stale.
- Changing checkout path (including copying `.hermes` to another checkout), Docker context, image, mounts or ownership requires a new preview; moving a repo is not permission to orphan its old state or clone another repo's secrets.
- Never fix a collision by stopping another stack. Do not run `--remove-orphans`, daemon-wide prune, volume removal or `down -v`.

## Mounts, ownership and configuration

### Persistent home and `/workspace`

- The fresh baseline uses the repo bind's private `/workspace/.hermes` home, with no nested volume hiding profiles/config/receipts. Verify filesystem SQLite/WAL, locking and durability support before deployment; unsupported VM/network-backed storage blocks this baseline. Preserve legacy owned volumes until an explicitly approved migration. Backups must be verified and consistent (quiescent writer or supported SQLite backup), never a raw live WAL database copy. Do not inspect host Docker storage internals directly.
- `/workspace` is an **absolute canonical repo bind**, not `.` relative to `.hermes/compose.yaml`; `create_host_path: false` prevents a typo creating an empty host directory.
- It is read/write because this is a coding agent: explain in the informational preview that the container can change/delete mounted source. An explicit install request covers this target-repo mount; additional mounts require their own scope decision. The mount is not a security boundary for that source. Do not mount the host Docker socket, home directory, SSH keys or unrelated repos. Bridge networking does not restrict outbound Internet access by itself.

### User, permissions and write policy

- Pass the actual non-root host UID/GID (1–65534 in inspected image) through `HERMES_UID`/`HERMES_GID`. Do not add `user: <host-id>` or override the image entrypoint: newer s6 images need their root bootstrap to remap/drop privileges.
- A repo bind does not establish application-user access by itself. Verify the effective application user; any scoped temporary permission probe may create/remove only its owned test file in `/workspace`. Such terminal/Unix evidence does not prove Hermes write/edit-tool access.
- Verify `HERMES_WRITE_SAFE_ROOT` syntax/precedence and actual policy-mediated write/edit/cleanup separately through the [development gate](development-readiness.md#1-prove-tool-level-writes-not-just-unix-access); preserve required state access without granting `/`. Never recursively chown the repository or reuse root credentials to hide a mismatch.

### Required config merge

The plan's `requiredConfig` is a **narrow merge** after installed-schema and memory handoff checks:

```yaml
terminal:
  backend: local
  cwd: /workspace
memory:
  provider: holographic
plugins:
  hermes-memory-store:
    db_path: /workspace/.hermes/memory_store.db
    auto_extract: false
```

- `working_dir` alone may not configure the supervised gateway's tool subprocesses. Verify actual tool cwd/backend from the selected image and a bounded authorized probe. The gateway process itself may use its verified state home; verify the terminal tool's `pwd`, not process cwd or a bare exec with a forced workdir. Also verify effective HOME and all writable paths against the workspace-state contract; `working_dir` cannot repair a hardcoded legacy HOME.
- Use the local terminal backend **inside** this container, not a nested Docker backend with the host socket.
- Preserve existing unrelated config, tuning and credentials; never replace a full config with this fragment. Required memory keys are owned by the Holographic skill's approval and preservation rules.

### Provider, model and workspace

- Reuse explicit provider/model choices or verified configuration belonging to this repo's instance, without printing credentials.
- For fresh configuration, the **user runs `hermes setup` privately** and chooses provider/model/channels there; missing choices do not block infrastructure preparation or require a chat interview. Do not invent a paid provider/model or borrow Pi's selection. The agent never drives the secret-bearing wizard.
- Preconfigure **`/workspace` as the workspace before handoff**, using the supported schema; it is the actual mounted repo root, not the private state directory `/workspace/.hermes`. The user should not have to decide it. If this wizard still asks, instruct them only to accept the prefilled value.
- After setup, verify effective `terminal.backend: local`, `terminal.cwd: /workspace`, actual tool cwd and the canonical bind source; restore only those repo-workspace settings if the wizard changed them. No extra clone or nested workspace.
- Apply [repository identity in SOUL](repo-identity.md): set the assistant's self-name to the exact repo basename and its role to this repository's assistant. Resolve the effective owned persistent SOUL through the image's actual prompt loader; narrowly replace/add identity, preserving unrelated existing SOUL content and mission. Reverify after private setup, which may rewrite the file. Container naming alone does not set conversational identity; a static `/start` greeting may require a separately verified supported setting.

## Private setup and credential ownership

The user enters secrets through **`hermes setup` in their own terminal**, never in chat or an agent-captured terminal. Follow [host CLI access](host-cli.md). Keep the verified setup container quiescent and report **prepared; waiting for user setup** until they finish. Inspect the selected image's supported setup behavior before handoff; do not assume it cannot start services or install dependencies.

Separate storage by owner, with one authoritative source per key:

- **Installer-managed bootstrap/API/dashboard secrets** use ignored `<repo>/.hermes/bootstrap.env` (`0600`) in a private `.hermes` directory (`0700`), injected via raw Compose `env_file`. Generate only missing required local values with a CSPRNG, without printing them. No second host `web.env`, placeholder provider keys or project-root `.env` overwrite.
- **User-managed provider/channel credentials** use the installed wizard's native stores inside persistent `/workspace/.hermes`—typically `.env` for API keys/Telegram tokens and `auth.json` for OAuth. Through the repo bind, these are the same files as host `<repo>/.hermes/.env` and `auth.json`, **not copies**. The bootstrap file has a separate name/authority; never inject the native `.env` through Compose. Verify the actual paths, restrictive permissions and non-root application ownership, never contents. Do not bind-mount a host `.env` over the native file: atomic wizard writes may fail or detach a bind. Do not move/copy/export tokens between stores.
- **Precedence on reruns.** Preserve existing working host-injected credentials. Inspect supported precedence using source and redacted key-presence checks: a Compose-injected value can shadow a freshly saved native value. Report a conflicting key by name and resolve its authority with the user before removing/migrating it; never silently duplicate or delete secrets. Fresh plans omit provider/channel values from the host file so private setup owns them.

Additional secret-handling rules:

- Raw host entries are literal single-line `KEY=VALUE`; never source/eval the file or shell-quote values.
- Redact validation, backups and diagnostics; do not print `.env`, `auth.json`, expanded Compose config, whole `docker inspect`, browser/device codes or setup transcripts.
- No copying host/other-instance credentials or secret-bearing YAML. Protect backups outside tracked paths.
- After setup, inspect only nonsecret config/auth-availability status and key names. Reconfirm workspace/memory settings and channel readiness; credential-file presence alone proves neither. Environment injection is not a vault: Docker administrators and runtime processes can access secrets.

### Applying changes

Do not assume hot reload.

- Runtime-file changes need a supported gateway reload/restart; changed Compose `env_file` values require container recreation, because `docker restart`/`compose restart` retain the old injected environment.
- The generated user-invoked `<alias>-apply` command recreates only this service without pulling/building or deleting volumes, then waits up to 60 seconds for the verified image-specific readiness adapter. Follow [readiness and shortcuts](readiness-and-shortcuts.md); Docker startup alone is not success, and unsupported probes never become a dummy health check.
- Existing downtime still requires the user's intent; creating the shortcut does not execute it.

### Web exposure

Default requested web exposure is off; do not ask whether to enable it without a user signal.

- Verify effective listeners and Docker publication: some reported image behavior enabled an authenticated internal API from the bootstrap key despite `API_SERVER_ENABLED=false`. That is a [version-specific check](telegram-activation.md#api-flag-and-exposure-gotcha), not a universal override rule or proof of public exposure.
- Do not invent chat-channel credentials or reuse another instance's polling token.
- If no interface/channel was requested, prepare the no-port plan and report interface readiness separately; an image needing a channel to keep its gateway alive is a real activation blocker, not permission to enable web or invent a health claim.

## Required Holographic handoff (before gateway readiness)

Use the [memory capability acceptance contract](memory-capability.md) alongside the memory skill. Check supported startup package activation before dependency imports; new plans request `/workspace/.hermes/lazy-packages`. An existing legacy home may already supply NumPy under `/opt/data/lazy-packages` in a version that a bare Python probe misses. Discover the actual path; do not relocate it during diagnosis. Do not inject that path by guesswork or declare basic mode until runtime parity is verified.

Load the full **memory-holographic-hermes-setup** skill and its setup reference. Use its catalog path when readable; otherwise read [the sibling source skill](../../memory-holographic-hermes-setup/SKILL.md), relative to this reference file (not cwd). This works in both the package tree and flattened installs. Catalog absence is not a blocker when these instruction files are readable; no installation or reload is required. Follow the entry skill's source/trust checks and load the complete instructions, not a copied recipe. Check this handoff's files before provisioning: genuinely missing instructions block deployment/readiness, while independent read-only repo discovery may continue. Report the exact missing path and one next action. Reading the skill does not establish runtime plugin availability or authorize changes.

Pass: canonical host repo + full repo ID; explicit Docker context/project/Compose file; verified owned service/container ID and state backing (canonical bind for new installs, verified volume/bind for existing ones); selected image digest; actual runtime home (`/workspace/.hermes` for new installs); actual container Python, verified supported startup/package activation and application UID/GID/HOME; the explicit invocation and its [covered reconciliation scope](authorization.md), including setup/quiescence boundaries. Include the separate capability/evidence gates, existing-data preservation requirements and any active turns/writers. Covered existing-service maintenance/recreation, required dependencies/migration/index repair and local canaries do not need another confirmation; unsupported operations and unresolved writers still block them.

The memory skill's container adapter treats this as an explicitly selected default home **inside that instance**. It must never run its Python/config commands on the host or another instance. Preserve that mapping across every reopen/cleanup.

Direct Python/config/backup commands must execute as the verified non-root gateway user with explicit HOME and HERMES_HOME, not Docker exec's default root.

- The `hermes` CLI shim does not privilege-drop arbitrary Python. Use exec-time user selection on the already bootstrapped maintenance container (not a Compose service `user:` override), verify effective IDs and database permissions, and perform all canary/reopen/cleanup steps as that same user.
- Root success is not gateway readiness.
- Every fresh-process import, HRR probe, canary reopen and cleanup must reproduce the same verified startup activation before importing modules; provider flags may otherwise cache an incorrect dependency result.

For a new instance, Holographic with `auto_extract: false` is the required default. For existing state, pass the invocation's covered dependency/migration/index-repair/recreation scope into the memory skill; do not re-ask for those approvals. A provider switch or shared/foreign/outside-owned-state adoption is not covered. No silent fallback to builtin-only or basic-only memory; report the actual capability and incomplete gates. NumPy absent in plain Python is not a diagnosis. After verified runtime parity, proven basic operation must be labeled **“basic keyword mode—not full HRR capability”**, not full setup. Imports alone do not prove HRR: verify supported synthetic encode/bind/unbind behavior and report aggregate existing-vector coverage separately. Preserve tuning and explain that `auto_extract: false` still permits explicit saves and native-memory mirroring. Required supported metadata-preserving index repair is covered after its backup/quiescence checks; no destructive rebuild or semantic-truth promises.

### Immutable image tree

Recent images keep `/opt/hermes` and its Python install immutable.

- If a provider/dependency is genuinely absent from the startup-equivalent runtime after existing supported persistent packages are checked, perform the required reviewed supported persistent plugin/dependency correction under the verified workspace-local home, or a qualified reproducible derived image, within the invocation's scope. Preserve legacy package locations until an explicitly approved migration; do not make an incompatible image appear compliant by setting an ignored environment variable.
- Never `pip install` into the running image's immutable venv, chmod it writable or use `docker exec` as root to defeat that policy.
- Verify actual provider/dependency/config/data/HRR survival across an approved recreation, not just volume retention. Known ephemeral dependencies block that action until a scoped persistence plan is resolved; do not knowingly break the gateway to prove the defect.

## Provisioning and lifecycle sequence

An explicit **install/resume/repair/update invocation authorizes full reconciliation**, not merely ordinary artifact generation. Follow [the covered-action table](authorization.md): required verified image/dependency corrections, supported recoverable migration/index repair, narrow owned permissions/policy, scoped existing-service maintenance/recreation and non-inference verification are included. Give one informational impact preview and proceed without further approval prompts; pass this scope into memory/integration handoffs.

Missing private credentials remain user-assisted setup, not an approval checkpoint. Unknown ownership, unsafe recovery, unsupported runtime or tool restrictions are blockers. Preserve providers/models and existing workload scope; do not create/enable jobs, release dormant work, widen exposure/authority or mutate unrelated source to obtain a pass. Narrower read-only/no-restart/version-hold restrictions win. Reading, installing or editing this **skill** is not deployment authorization.

Example: “Preparing `<short-container>` for `<repo>` with pinned image `<verified-digest>`, repo workspace `/workspace`, web off and Holographic. You'll run `hermes setup` privately before activation.” Continue independent authorized preparation; activation still requires completed setup, valid configuration/credentials and local verification. Preserve dirty/untracked source: no automatic stash, commit, reset, whole-repo snapshot or unrelated edits. A specific ownership/conflicting-file risk is a blocker; dirtiness alone is not.

Reuse unchanged discovery evidence instead of repeating branch/history/ignore/catalog searches. Recheck when inputs change, evidence is stale, or a result conflicts. Always retain the immediate pre-mutation ownership/lock/secret/resolved-config checks and post-mutation runtime verification below. User-facing progress states the action/result/blocker, not each reconsideration.

1. Check ownership, the setup lock and active cron/interactive/build/maintenance writers for the canonical repo/home; a setup lock alone does not coordinate every writer. Validate the plan/schema offline. Present required resources/settings and any blockers before Docker mutation. Use `docker compose ... config --quiet` for validation without printing expanded credentials; diagnostic JSON must be redacted.
2. Establish **one** maintenance writer with gateway/cron/dashboard writers quiescent. Check the selected image's bootstrap first: `compose run` or changing the CMD to `sleep` does not necessarily disable s6 services or profile reconciliation. Use the image-supported maintenance/no-autostart path; if none is verified, stop. Never run a setup container against a home/backing store already in use. Do not bypass `/init` to guess a workaround.
3. Initialize only owned state, verify UID/GID and repo permissions, preconfigure the repo workspace via the verified schema, narrowly configure the effective SOUL with the repo basename, and prepare the main host CLI launcher/alias and explicit-path status/logs launchers, without diagnostic aliases; defer apply until the [apply gates](host-cli.md) pass. Prefer the named service itself in an image-supported maintenance mode so the short exec/alias works; never start its gateway just to enable `exec`. Follow [host CLI access](host-cli.md) to lead with the single private `<alias> setup` command (absolute launcher if activation is pending), not a Docker inventory. Offer optional cross-shell command links once or reuse the existing persistence answer/mode; use `--core-only` while apply is unavailable, verify actual PATH resolution and preserve existing commands. That optional choice does not block deployment. A separate maintenance container needs its verified-ID temporary command. On fresh installs, stop with **prepared; waiting for user setup**; do not run/capture the wizard or its secrets. Keep the owned maintenance container available and record the pending phase, while releasing any installer process/lock safely so continuation can reacquire it; no competing writer may run.
4. After the user reports setup complete, reacquire the setup lock, recheck ownership/quiescence, and inspect only nonsecret effective provider/model/channel settings and redacted auth status. Reverify and narrowly restore the repo workspace `/workspace` if changed. Re-resolve SOUL path/precedence and reconcile only the repo-name/role delta if the wizard changed it; preserve the user's other new preferences. Verify the identity loader independently from static greetings. Run the required Holographic handoff and local capability/persistence/cleanup gates after the wizard, which may have changed memory configuration. Reuse unaffected early dependency evidence; refresh changed startup/provider/config inputs, check active turns, and never silently reindex existing records. Preserve user choices. Only then close probe connections and maintenance processes and remove verified maintenance/no-autostart overrides before activation.
5. For Telegram, complete the [activation preflight](telegram-activation.md): effective token/allowlist, scoped secret-safe `getMe`, read-only model credential resolution, and valid workspace/identity/memory evidence. Use its maintenance-CMD repair only for a verified supported image. Reconcile/start only this approved project after all gates pass. No daemon-wide actions. A supervised image can stay “Up” while its gateway crashes repeatedly; inspect actual gateway status and scoped logs, not just the container state. Do not add an unverified `hermes status` healthcheck as a substitute.
6. Verify the live mount source, state backing, user, actual terminal cwd, selected provider, cleaned-up canary persistence and gateway readiness. Check the configured platforms, especially Telegram connection/polling when selected; an api_server-only gateway is not Telegram readiness. Do not assume every version hot-reloads changes or drops queued updates: inspect its effective policy/logs. If `drop_pending_on_cold_boot` discarded offline updates, prominently tell the user **“Send a fresh message now.”**; do not disable that policy or send messages yourself without authorization. The required restart/recreation persistence check is included in full reconciliation, with consistent backup and quiescence; it is not included in status-only inspection. Never launch a second agent process on the same home just to test recall. Model inference, external messages and billable probes require authorization; otherwise label them pending. A connected Telegram platform does not verify a model-generated reply. When the selected image has a protected detailed-health interface, verify authenticated application health and unauthenticated rejection through its reviewed route; do not invent `/health/detailed` or require an API absent by design.
7. Update the verified progress receipt and use the compact [diagnostic handoff](resume-and-diagnostics.md): actual short container name, workspace already `/workspace`, one next command and optional gated `-apply` maintenance line. Diagnostics, when needed, use explicit `<repo>/.hermes/bin/hermes-status` and `<repo>/.hermes/bin/hermes-logs` paths, not generated aliases. Distinguish maintenance/activation pending, gateway stopped, setup incomplete, apply needed, channel disconnected, verification pending and ready using current evidence, not historical logs. Record the verified context/project/service/user/home/CLI mapping, agent name and effective SOUL path/verification without storing its contents. Report identity, any static greeting limitation, image, home/volume/workspace, changed keys/backups, Holographic runtime activation/versions, NumPy/FTS5 and functional HRR evidence, aggregate vector coverage, canary cleanup, loaded-gateway integration and recreation-durability results/pending limits, gateway status, exact authorized interfaces/ports and remaining blockers. Failures stay partial/blocked; do not delete state to obtain a clean run.

After runtime checks, report the separate [development verdict](development-readiness.md): actual tool-write/approval compatibility, required pinned persistent toolchains, consumer-visible skills/prerequisites, selectors and writer coordination. Check Go requirements from repo metadata, not host availability or an interactive PATH export. No job is created/enabled from runtime success; approved recurring work needs its own gate and failure/no-overlap policy. Preserve earlier runtime blockers and pre-existing source changes in the outcome receipt.

Administrative examples (only after variables and approval are established):

```sh
# The selected Docker context is also explicit/verified for every invocation.
docker --context "$CONTEXT" compose --env-file /dev/null -p "$PROJECT" -f "$COMPOSE" ps
docker --context "$CONTEXT" compose --env-file /dev/null -p "$PROJECT" -f "$COMPOSE" logs --tail 100 hermes
docker --context "$CONTEXT" compose --env-file /dev/null -p "$PROJECT" -f "$COMPOSE" stop hermes
```

Scope/redact logs before including them in a report. Starting/reconciling uses the same selectors with `up -d`; updates first verify a new inspected digest and recovery path, preview impact without another approval, back up consistent state, change only that instance's image pin, then pull/recreate and reverify. Pulling an unchanged digest does not upgrade it. Stopping a container preserves its repo-backed state or legacy volume; never remove either as an update step.

## Requested Kanban collaboration

Follow [default-profile Kanban orchestration](kanban-orchestration.md) before enabling the board workflow. The instance's native `default` profile remains the human-facing coordinator; existing verified specialists execute tasks. Configure explicit platform toolsets, profile-led decomposition, one gateway dispatcher, specialist-only claims, local shared board identity, preserved coding worktrees and bounded recovery. The offline planner intentionally has no static roster or release-ready Kanban fragment: narrow runtime configuration depends on discovered profiles, current boards and request scope.

Preparing settings is not permission to dispatch existing backlog, run inference, wake conversations or initialize/migrate a board. Reconcile active deployments without silently disabling their workers/notifications. Ordinary gateway activation can also start the embedded dispatcher; verify its effective state and all swept boards before startup. Keep Kanban readiness and release evidence separate from gateway/memory success; use the reference's source-aware checks rather than treating `dispatch --dry-run` as read-only.

## Optional Docker-management instructions

For an explicit request to equip Hermes with Docker knowledge, follow the [official Docker-management skill handoff](docker-management.md). Preview and separately approve `hermes skills install official/devops/docker-management` in the verified repo-local runtime. This installs instructions, not Docker permissions. Keep socket/daemon access disabled; a read-only socket bind and a Compose project name are not enforcement boundaries. Container-control design/access and each lifecycle operation retain their separate approvals. No self-recreation is complete until an authorized external operator/controller verifies it; installation alone does not make the stack self-managing.

## Optional dashboard/API and ports

The default plan publishes **no ports** and leaves dashboard/API off; gateway chat channels do not need the pasted fixed host ports. With `--web`, container targets 8642 and 9119 publish only on `127.0.0.1`, with **no fixed `published` value**. Docker atomically selects available host ports, avoiding unreliable “scan a free port, then hope it stays free” allocation. The container-side targets may be the same across isolated bridge networks. Stop on any unexpected public/fixed binding in resolved config.

Both fresh plans use the same `.hermes/bootstrap.env` with Compose `env_file` **raw** format (requires Compose 2.30+). For requested web access, add only missing supported authentication variables to that protected file without duplicating user-managed provider/channel keys:

- `API_SERVER_KEY` (strong unique value, meeting selected image minimum length)
- `HERMES_DASHBOARD_BASIC_AUTH_USERNAME`
- `HERMES_DASHBOARD_BASIC_AUTH_PASSWORD`
- `HERMES_DASHBOARD_BASIC_AUTH_SECRET` (restart-stable sessions)

Generate/enter secrets without printing them; validate presence/strength without exposing values. Raw env-file values are literal: do not add quoting that would become part of the secret. No placeholder credentials. Preserve existing auth providers rather than switching them implicitly. An approved different auth arrangement needs a reviewed plan adjustment; the template does not configure public OAuth/proxy deployment.

Container services must bind `0.0.0.0` **inside their bridge container** to be reachable through Docker publishing, so enable the selected image's required dashboard and API auth. Host publishing stays loopback. These two bind addresses serve different purposes; container-loopback binding plus host publishing is not a working shortcut. Never bypass the auth gate or enable wildcard CORS. Another container on a shared network can bypass the host binding, which is why networks remain per-project and auth still matters.

Discover actual endpoints after startup:

```sh
docker --context "$CONTEXT" compose --env-file /dev/null -p "$PROJECT" -f "$COMPOSE" port hermes 8642
docker --context "$CONTEXT" compose --env-file /dev/null -p "$PROJECT" -f "$COMPOSE" port hermes 9119
```

Report the returned loopback URLs. Mappings may change after recreation; rediscover them every time. Check unauthenticated requests are rejected/redirected and an approved authenticated health request succeeds, without sending an inference request. Do not call an endpoint “working” just because Docker allocated its port. A fixed external integration URL requires a separately approved stable-port/proxy plan; never silently pin a supposedly free port.

## Sources and validation limits

Recheck against the selected image/version before operations:

- [Official Hermes Docker guide](https://hermes-agent.nousresearch.com/docs/user-guide/docker/)
- [Upstream Compose example](https://github.com/NousResearch/hermes-agent/blob/main/docker-compose.yml) — host networking/fixed names are intentionally **not** copied here.
- [Docker bootstrap](https://github.com/NousResearch/hermes-agent/blob/main/docker/stage2-hook.sh), [command wrapper](https://github.com/NousResearch/hermes-agent/blob/main/docker/main-wrapper.sh) and [Hermes-only exec privilege shim](https://github.com/NousResearch/hermes-agent/blob/main/docker/hermes-exec-shim.sh)
- [Compose project isolation/precedence](https://docs.docker.com/compose/how-tos/project-name/)
- [Compose services: ports and env_file](https://docs.docker.com/reference/compose-file/services/)

Planner/installer tests cover deterministic identity, same-basename separation, exact repo-based container names without automatic suffixes, unmasked repo-backed state, project-scoped networks, loopback dynamic publication, secret-free plans, config defaults and resource packaging. Compose CLI schema checks are offline; no test starts containers, pulls images, changes live profiles or invokes a model. Agent decision probes do not prove runtime provisioning. Deployment readiness is unverified until the real scoped checks above run.

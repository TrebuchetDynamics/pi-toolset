---
name: hermes-repo-install
description: Use when installing, resuming or repairing a repository's Docker Compose Hermes Agent, including a silent bot, stopped gateway, pending activation, or repository coding blocked by tools, permissions or missing toolchains.
---

# Install, resume or repair Hermes for one repository

One repo, one Docker Compose Hermes instance, with Holographic **HRR-capable** memory as the ordinary target. Report confirmed basic mode or pending capability explicitly; never silently degrade. **No host Hermes installation, CLI, profile or Python is required.** Read [the Compose procedure](references/compose.md) and [workspace-local state contract](references/workspace-state.md) before generating files or running Docker. Installing this skill does not deploy Hermes. **Running it is a full repair/update request, not a diagnosis-only pass:** read [the no-repeat-approval reconciliation contract](references/authorization.md), fix every applicable detail that can be safely supported, and verify the complete installation.

## Entry and routing

Read [next actions and recovery](references/next-actions.md) with the authorization contract: resolve routine engineering choices yourself, execute covered supported repairs, and ask only for private setup or a concrete missing fact/scope. An explicit invocation **with no arguments or an empty expanded `Repository request:` is an install/full-reconciliation request for cwd's Git root**, not a diagnosis-only request. Reading, testing or improving these instructions (including pasted failure logs) does not deploy anything.

- Example: `/skill:hermes-repo-install /srv/projects/api`. Pi also exposes `/hermes-repo-install` via its prompt shortcut.
- **The target is the repository where the skill is run.** Use an explicit path when supplied; otherwise resolve the current Git worktree root from the working directory.
- Do not ask for a path while that directory is inside a Git worktree. Ask one focused path question only when it is not.
- Resolve the target and its local ownership state read-only with [the offline run-repo resolver](scripts/resolve-target.mjs) before any mutation:
  - Matching owned identity receipt → **maintain**, entering the [fast diagnostic path](references/resume-and-diagnostics.md#fast-path-repair-or-resume) first, then [full current-rule reconciliation](references/existing-installations.md) for an install/update/repair request—not the fresh-install sequence. Assess every applicable rule; a healthy gateway or old receipt does not mean the setup is up to date.
  - No receipt → **create**, using the fresh-install workflow below.
  - Foreign or mismatched receipt, symlinked `.hermes`, or unresolved container-name collision → **blocked**. Follow the [preservation-first recovery handoff](references/next-actions.md#copied-receipts-and-tracked-state): complete safe discovery, then recommend one viable scoped remedy; never adopt state or auto-untrack it.
- Never create a duplicate installation to satisfy a maintain request. Creating a second installation is not a repair for an unidentified existing one.
- Resolve which existing bot/instance is intended before mutation; cwd alone does not identify a bot among host and Docker installations.
- **Telegram configured but silent:** use the [conditional activation repair](references/telegram-activation.md) after diagnosis. Saved credentials do not remove a maintenance CMD or start the gateway.
- Repo write/build or coding-job failures: enter [development readiness](references/development-readiness.md), not another Telegram repair or installation.
- For Kanban collaboration, follow [default-profile orchestration](references/kanban-orchestration.md): default is the human-facing coordinator, verified specialists execute cards, and one gateway owns dispatch. Configure profile-led task breakdown, not automatic triage decomposition; missing workers or unsupported routing remain blockers.
- Preserve user choices/data and unrelated repo configuration while reconciling every required supported delta. The invocation covers the [listed repairs, updates, migrations and downtime](references/authorization.md) without repeated approvals. Status-only requests stay read-only. Finish aligned with every applicable rule or explicitly partially reconciled/blocked with exact unsupported/input/safety gaps; do not silently grandfather drift, stop at the first fix or overwrite state with fresh defaults.

## Instruction loading

- An explicit invocation may read this skill directly from its trusted source; catalog membership is not required. Keep the actual `SKILL.md` directory as the resource base, separate from the target repo.
- Read each required instruction fully once per task; retain its source/version and reuse it until changed, missing from context, or superseded.
- Repair/status loads only this skill and the relevant Compose/diagnostic references. Load memory instructions when a memory gate is reached, not to diagnose a stopped gateway.
- Before provisioning or memory work, read the full required **memory-holographic-hermes-setup** skill and its setup reference: use its catalog path when available, otherwise [the sibling skill](../memory-holographic-hermes-setup/SKILL.md). This sibling path works in the package tree and flattened skill installs.
- If a catalog entry is stale or unreadable, try the verified sibling source. Honor explicit trust denials; do not select arbitrary repo files as a fallback. Resolve unknown source locations from configured package paths or ask; never invent a checkout location.
- Readable instructions need no installer, symlink, Pi settings change or `/reload`. They do not register slash commands or install the Hermes plugin. Check required files before provisioning.
- If required installer/memory instructions are genuinely missing, continue independent read-only discovery but block the affected runtime gate with the missing path and one next action.
- Load conditional references at the gate that needs them; keep an evidence/next-action checklist rather than rereading the entire reference tree or repeatedly debating authorization.
- Task-required repository skills/maps have a separate [development prerequisite handoff](references/development-readiness.md#3-skills-and-missing-repository-prerequisites). Readable canonical skills remain usable when registration fails.
- Optional [official Docker-management instructions](references/docker-management.md) require an explicit skill-install decision. Installation and container-control access are separate approvals; retain the no-socket default and never claim the skill alone enables self-management.
- Runtime plugin/dependency checks and the authorization boundaries below still apply. Carry the installer's [real-runtime memory capability contract](references/memory-capability.md) into the memory handoff: the interpreter alone is not Hermes's startup environment.

## Request-scoped authorization

An explicit install/resume/repair/update invocation authorizes the complete [reconciliation scope](references/authorization.md) for the resolved owned instance: ordinary setup plus required image/dependency updates, supported recoverable state migration, narrow owned permissions/configuration/artifact repairs, service interruption/recreation and verification. **No additional approval prompts for those actions.** Discover exact versions/paths/deltas, give one informational impact preview, then execute all safely supported work. Pass this same scope into the memory and integration handoffs instead of creating another approval gate.

- A narrower status/plan-only/dry-run/no-restart/version-hold request wins.
- Reading, installing or editing this skill is not a deployment request.
- Preserve provider/model choices, credentials/data and unrelated state; selected integrations are reconciled, not an excuse to enable every optional feature or dispatch new work.
- Missing ownership, required private login, unsafe migration, unsupported runtime or denied tool permission is a concrete blocker, not a reason to invent success or bypass controls. Continue independent safe work and report the exact remainder.
- Actions outside the listed target/scope remain unperformed. Do not turn that boundary into another generic approval interview or infer Git delivery, public exposure, deletion or host-root authority.

## Defaults, not an interview

- Reuse explicit choices and verified repo-owned configuration. Resolve cwd's Git root and host UID/GID. On full reconciliation, assess the current official stable image and update to its verified compatible immutable digest; preserve an explicit version hold and keep the existing pin until a safe replacement/recovery path is established. Read-only/narrow reruns do not upgrade.
- Container names must be **`hermes-<repo-name>`**: the full normalized repo basename with no hash, truncation or Compose service/replica suffix. A foreign name collision blocks setup; never choose another container name automatically. Keep hashed Compose project IDs for isolated networks and any preserved legacy volumes.
- **The assistant's name is the exact repo basename**, not `Hermes` or the Docker name. Follow [repository identity in SOUL](references/repo-identity.md) to update the owned effective SOUL narrowly and preserve unrelated personality instructions.
- Keep web off unless requested.
- Do not interview the user for provider/model/secrets: on fresh setup they choose these privately in **`hermes setup`**. Ask only for real blockers; never copy host credentials or another instance's bot token.

Prepare infrastructure, then hand off setup in the user's own terminal.

- **Never run the interactive wizard through agent tools or request its secret-bearing output.**
- New installs use `HOME=HERMES_HOME=/workspace/.hermes`, directly backed by the repo bind: profiles, memory, caches and supported added dependencies stay there. No fresh writable Hermes state in `/opt`; immutable image executables are not relocated. Verify image support, not just environment settings.
- Installer-managed bootstrap/web secrets use ignored, mode-`0600` `<repo>/.hermes/bootstrap.env` via raw Compose `env_file`.
- User-entered provider/channel keys and OAuth tokens use the verified native stores inside `/workspace/.hermes` (typically `.env` and `auth.json`). These are the same bind-backed host files, not copies; never inject native `.env` as the bootstrap source. Existing homes/stores require a supported recoverable migration under the invocation's scope, never a fresh-default overwrite.
- Preserve existing working authentication.
- Read [host CLI, private setup and apply](references/host-cli.md) for credential precedence, short commands and aliases.

## Fresh-install workflow

1. **Discover read-only.**
   - Inspect repo/README/AGENTS, Docker context, Compose, owned resources and repo-local configuration.
   - Identify task/toolchain requirements, consumer-visible skills/maps and pre-existing root/submodule state without refreshing upstream. Collect all safely discoverable development blockers, not just the first.
   - Use matching image source for pre-pull checks. Missing host Hermes is normal; discover its actual CLI/Python/provider **inside the approved container** later.
2. **Plan offline.** Run `node scripts/compose-plan.mjs --repo <root> --image <official-digest> --uid <uid> --gid <gid>` with the skill-relative absolute script path; add `--web` only if requested. It prints `{identity, compose, requiredConfig}`, without reading secrets or writing files. Use only `compose` as the Compose document. If the inspected base is incompatible, plan [compatibility recovery](references/next-actions.md#compatibility-recovery-not-a-layout-menu) here; pulls, builds and state-writing qualification probes belong after the impact preview, not in offline planning.
3. **Preview and proceed.** Summarize the target, pinned image/base, any necessary derived build/qualification, isolated resources, repo write access, memory and interface before the first pull/build/write. After preservation and safety checks, perform the covered qualification work and finalize the derived-image substitution before provisioning the real home; the helper's official-only input is not a reason to ask for a layout exception. The install request supplies ordinary setup authorization; ask only for a missing input or uncovered risk, not confirmation of defaults. Dirty source is preserved, not a reason to demand stash/commit or a whole-repo backup.
4. **Provision within scope.**
   - Verify ownership, lock and secret-file protection; follow the [ignore-policy checks](references/ignore-policy.md) before writing private files. Preserve maintained docs' trackability without exposing `.hermes/`; report tracked sensitive paths rather than untracking them.
   - Persist identity/Compose and prepare `bootstrap.env`. Follow the reference's single-writer maintenance sequence; protect `.hermes` before native setup writes there.
   - The repo bind backs private state at `/workspace/.hermes`; no volume overlays that directory. Mount the canonical **repo root itself** at `/workspace` and preconfigure that as both container workdir and effective Hermes tool workspace through the verified schema; the user should not have to choose it. A read/write mount or terminal probe does not verify the actual write/edit tools' policy.
   - Check provider, NumPy and SQLite FTS5 early in the bootstrapped container using [verified Hermes startup/package activation](references/memory-capability.md), before declaring dependencies missing or proposing installation.
   - Narrowly merge workspace defaults and prepare the [repo-named SOUL identity](references/repo-identity.md) now; run state-writing memory verification after private setup.
   - `/workspace/.hermes` is state, not the tool workspace. No host Hermes installation, shared/global volumes or networks, shared home, Docker socket or recursive chown.
5. **Private user setup.**
   - Follow [host CLI access](references/host-cli.md) to create the repo-local launcher and collision-safe aliases. Keep the bootstrapped container running in verified maintenance mode, with gateway writers off.
   - Lead with one next command: **`hermes-<repo-name> setup`** after verified PATH command resolution or alias activation, otherwise the absolute scoped launcher. Keep the verified short Docker command as a fallback, not a second onboarding path to explain by default.
   - The user chooses provider/model/channels privately; `/workspace` is already preconfigured. Record resumable progress and report **prepared; waiting for user setup**, not ready. State the continuation: “Tell me setup is finished. I'll verify memory/auth/workspace and finish reconciliation, including required scoped recreation, once its safety gates pass.” Saving credentials alone does not start Telegram.
   - Offer persistent commands once, preferring optional cross-shell links in `~/.local/bin` over rc edits; use `--core-only` for the main command alone while apply is unavailable, following [readiness and shortcuts](references/readiness-and-shortcuts.md). Record acceptance/decline and mode, never repeat the offer or block setup on it.
   - If writable ancestors reject links, use the reference's Bashrc-versus-permissions choices with separate authorization and the path-trust warning; keep accepted-but-blocked persistence `requested`.
   - Reuse existing valid configuration without forcing the wizard again.
6. **Post-setup verification, identity and memory.** After the user reports completion:
   - Inspect only nonsecret effective settings; re-establish quiescence.
   - Ensure the actual tool workspace is the mounted repo at `/workspace`, not the private Hermes home or a nested checkout.
   - Re-resolve the effective SOUL and reconcile the repo name if setup rewrote it, preserving new unrelated preferences. Verify prompt-loader precedence; distinguish SOUL identity from any static channel greeting.
   - Use **memory-holographic-hermes-setup**'s verified container adapter with the [capability acceptance contract](references/memory-capability.md): startup-equivalent nonroot checks, preserved configuration/tuning, functional HRR encode/bind/unbind tests, aggregate vector coverage and the cleaned-up persistence canary. Existing packages must be checked before installation; imports alone are not loaded-gateway HRR proof.
   - Reconcile wizard changes narrowly; preserve user choices and secrets. Missing runtime provider or failed verification blocks readiness; no silent fallback or host dependencies.
   - Confirmed basic capability must prominently say **“basic keyword mode—not full HRR capability.”**
   - Required supported dependencies/migration/recreation and metadata-preserving memory index repair use the invocation's approval; provider switches and other changes outside that scope remain unperformed. Safety and actual evidence gates still apply.
   - When Kanban is requested, prepare its [role/toolsets, shared board, preserved workspaces and bounded dispatch configuration](references/kanban-orchestration.md) before activation. Preserve existing cards/profile choices; do not create specialists or release queued work implicitly. The offline Compose planner does not discover a roster or configure Kanban.
7. **Activate and apply.**
   - After setup/identity/workspace/auth/access/memory gates, use the [Telegram preflight and scoped activation recipe](references/telegram-activation.md) when applicable. Replace maintenance CMD only when supported by the verified image and within scoped approval.
   - Start only the approved gateway and verify the configured channels, authentication enforcement, mounts, actual terminal-tool cwd, user and persistence—not just uptime or a gateway process cwd. Verify its loaded memory provider/capability separately; prove dependency/config/data/HRR recreation durability only within an approved maintenance window, otherwise report it pending.
   - Show a short `<alias>-apply` command for later config/credential changes: scoped container recreation reloads Compose-injected env as well as runtime files, preserving the verified state backing without migrating it. It is user-invoked, not an automatic restart, and succeeds only after a bounded wait on the verified image-specific gateway/channel probe. Missing probes block the shortcut before recreation; timeout/disconnection remain nonzero and unverified.
   - Discover actual loopback ports if enabled. If verified cold-boot policy discards pending Telegram updates, prominently say **“Send a fresh message now.”**
   - Verify effective listeners/publication instead of assuming API environment flags control exposure.
8. **Development readiness, separately.**
   - Assess the [task-scoped development gate](references/development-readiness.md): actual write/edit/cleanup tools and approval mode, narrow supported safe roots, persistent required toolchain across gateway/CLI/cron, readable skills/prerequisites, workspace/selectors and all-writer coordination.
   - Apply required policy/install/probe corrections covered by the invocation and recheck after scoped recreation without another approval prompt. Report unsupported or out-of-scope work independently of runtime health.
   - Never create or enable coding jobs merely because installation or Telegram succeeded; a separately approved job still needs this gate and a reviewed no-overlap/failure policy. Kanban dispatch likewise requires its exact release scope, specialist readiness and backlog review; `auto_decompose: false` does not pause ready cards or notification wake turns.

## Output and boundaries

- Reuse verified facts while their inputs remain unchanged; refresh stale or changed evidence.
- Keep immediate pre-mutation ownership/lock/secret/config checks and post-mutation runtime verification.
- Avoid repeated branch/history/ignore/catalog searches and narrating each reconsideration. Report the next action, result or concrete blocker instead.

Use the [short handoff format](references/next-actions.md#short-accurate-handoff) by default; retain the following detailed evidence in the owned receipt when authorized, expanding in chat only for an actionable risk or on request. Never say reconciliation is complete while a required rule remains blocked. Pulls, builds and scratch writes count as effects even when Git is clean.

Report the following:

- Lead with a short **runtime ready / prepared / blocked** summary and a separate **development ready / pending / blocked / not assessed** verdict scoped to the intended task/modes: repo, agent name (exact repo basename), short container name, workspace `/workspace`, interface or verified URLs, memory/gateway evidence, credential locations (no values) and the one next action if needed.
- Keep full hashes, mount/backup details and nonsecret verification evidence in the local receipt during authorized setup, not a large default table. Compare observed home/config/database/package/cache paths with effective configuration and launchers before recording success; a receipt claiming another database is drift, not persistence proof.
- Use the [diagnostic statuses and compact handoff](references/resume-and-diagnostics.md): one supported diagnosis and one next action, never readiness from uptime or stale receipts.
- Include **Host CLI**: exact `hermes-<repo-name>` command availability (PATH link or alias) or absolute fallback, private `setup`, interactive bare-command chat through a verified session-safe adapter (help for scripts/pipes), and `-apply` only after its gates pass. Do not generate diagnostic aliases/PATH shortcuts; when needed, show the verified explicit `<repo>/.hermes/bin/hermes-status` and `<repo>/.hermes/bin/hermes-logs` paths. Leave already-installed diagnostic aliases/links untouched. State whether setup/activation/persistence is pending; keep full inventory in receipts. Include project-scoped maintenance commands on success.
- Distinguish prepared files, local probes and live verification; never report secret values. For existing updates report full-rule spec alignment separately from runtime/development readiness and chat availability; unsupported migration/session coordination remains blocked, not completed.
- Report **identity configured** only after effective SOUL/loader checks; disclose an unsupported hardcoded greeting instead of claiming it changed.
- Separately report gateway/channel connection, memory verification and model-reply evidence: **Telegram connected does not prove a model-generated reply**. No automatic message/inference test.
- Runtime status/apply success does not verify coding tools, provision dependencies or authorize jobs. For Kanban report configuration, worker readiness, dispatch release and observed execution/notification results separately. Do not treat board connection or `dispatch --dry-run` as inherently read-only; follow the pinned-source side-effect checks.
- Report memory configuration, startup-equivalent dependencies, functional HRR, aggregate vector coverage, local cleanup, live integration and recreation durability as separate evidence; do not turn unknowns into passes.
- Use the [four-part outcome receipt](references/development-readiness.md#6-evidence-invalidation-and-outcome-reporting): changed this turn, pre-existing changes preserved, denied/not-executed commands, and validation actually completed. Keep a consolidated actionable blocker instead of repeating identical failed coding attempts. Finish the full applicable-rule sweep before reporting success; a remaining required migration/update/support gap means partial, not fully fixed.
- Check the [boundary/collision checklist](references/development-readiness.md#boundarycollision-checklist) before handoff; preserve existing lifecycle phases and status codes.

Host uninstall is a **separate workflow**, not a repair step. Supply only verified instance identity and preservation requirements; follow the [active-service impact confirmation](references/resume-and-diagnostics.md#host-uninstall-handoff) before any host removal handoff. “Only host” does not authorize undisclosed interruption of active bots.

Never adopt foreign resources, overwrite owner files, bypass auth, restart another stack, run `down -v`/prune, or erase data to recover. Reuse approvals only for their exact scope. Follow the [shared contract](../../shared/COMMON-CONTRACT.md).

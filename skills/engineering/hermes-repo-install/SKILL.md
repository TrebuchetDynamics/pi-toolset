---
name: hermes-repo-install
description: Use when installing, resuming or repairing a repository's Docker Compose Hermes Agent, including a silent bot, stopped gateway, pending activation, or repository coding blocked by tools, permissions or missing toolchains.
---

# Install, resume or repair Hermes for one repository

One repo, one Docker Compose Hermes instance, with Holographic **HRR-capable** memory as the ordinary target. Report confirmed basic mode or pending capability explicitly; never silently degrade. **No host Hermes installation, CLI, profile or Python is required.** Read [the Compose procedure](references/compose.md) before generating files or running Docker. Installing this skill does not deploy Hermes.

## Entry and routing

- Example: `/skill:hermes-repo-install /srv/projects/api`. Pi also exposes `/hermes-repo-install` via its prompt shortcut.
- **The target is the repository where the skill is run.** Use an explicit path when supplied; otherwise resolve the current Git worktree root from the working directory.
- Do not ask for a path while that directory is inside a Git worktree. Ask one focused path question only when it is not.
- Resolve the target and its local ownership state read-only with [the offline run-repo resolver](scripts/resolve-target.mjs) before any mutation:
  - Matching owned identity receipt → **maintain**, entering the [fast diagnostic path](references/resume-and-diagnostics.md#fast-path-repair-or-resume) first, not the fresh-install sequence.
  - No receipt → **create**, using the fresh-install workflow below.
  - Foreign or mismatched receipt, symlinked `.hermes`, or unresolved container-name collision → **blocked**.
- Never create a duplicate installation to satisfy a maintain request. Creating a second installation is not a repair for an unidentified existing one.
- Resolve which existing bot/instance is intended before mutation; cwd alone does not identify a bot among host and Docker installations.
- **Telegram configured but silent:** use the [conditional activation repair](references/telegram-activation.md) after diagnosis. Saved credentials do not remove a maintenance CMD or start the gateway.
- Repo write/build or coding-job failures: enter [development readiness](references/development-readiness.md), not another Telegram repair or installation.
- Preserve existing repo and Hermes configuration.

## Instruction loading

- An explicit invocation may read this skill directly from its trusted source; catalog membership is not required. Keep the actual `SKILL.md` directory as the resource base, separate from the target repo.
- Read each required instruction fully once per task; retain its source/version and reuse it until changed, missing from context, or superseded.
- Repair/status loads only this skill and the relevant Compose/diagnostic references. Load memory instructions when a memory gate is reached, not to diagnose a stopped gateway.
- Before provisioning or memory work, read the full required **memory-holographic-hermes-setup** skill and its setup reference: use its catalog path when available, otherwise [the sibling skill](../memory-holographic-hermes-setup/SKILL.md). This sibling path works in the package tree and flattened skill installs.
- If a catalog entry is stale or unreadable, try the verified sibling source. Honor explicit trust denials; do not select arbitrary repo files as a fallback. Resolve unknown source locations from configured package paths or ask; never invent a checkout location.
- Readable instructions need no installer, symlink, Pi settings change or `/reload`. They do not register slash commands or install the Hermes plugin. Check required files before provisioning.
- If required installer/memory instructions are genuinely missing, continue independent read-only discovery but block the affected runtime gate with the missing path and one next action.
- Task-required repository skills/maps have a separate [development prerequisite handoff](references/development-readiness.md#3-skills-and-missing-repository-prerequisites). Readable canonical skills remain usable when registration fails.
- Runtime plugin/dependency checks and the authorization boundaries below still apply. Carry the installer's [real-runtime memory capability contract](references/memory-capability.md) into the memory handoff: the interpreter alone is not Hermes's startup environment.

## Request-scoped authorization

An explicit “install Hermes here” request or install-command invocation authorizes ordinary setup for the resolved repository:

- generated `.hermes` files and [narrow ignore rules](references/ignore-policy.md);
- private `.env` preparation;
- narrow repository identity in the effective SOUL;
- verified official image pull;
- isolated owned resources;
- repo read/write mount;
- local Holographic configuration/canary;
- the new instance's maintenance lifecycle and first startup after checks pass.

Give a short informational preview, then proceed without a blanket approval question. Carry this authorization into the memory handoff.

- A plan-only/dry-run restriction permits discovery and offline output only.
- Reading, installing or editing this skill is not a deployment request.
- Ask only for unresolved inputs or a concrete uncovered action: dependency/toolchain installation or derived image, permission-policy changes, job creation/enablement/pause, repository documentation or submodule mutation, existing-provider switch, data migration, existing-service stop/restart, destructive changes, new costs, public exposure, or access outside the target repo.
- Honor stricter project rules and tool permission gates; this skill does not bypass them. Reuse exact-scope authorization and continue independent authorized work while a blocker is unresolved.

## Defaults, not an interview

- Reuse explicit choices and verified repo-owned configuration. Otherwise resolve cwd's Git root and host UID/GID, and select a verified current official image digest for a new instance, retaining existing pins on reruns.
- Container names must be **`hermes-<repo-name>`**: the full normalized repo basename with no hash, truncation or Compose service/replica suffix. A foreign name collision blocks setup; never choose another container name automatically. Keep hashed Compose project IDs for isolated volumes/networks.
- **The assistant's name is the exact repo basename**, not `Hermes` or the Docker name. Follow [repository identity in SOUL](references/repo-identity.md) to update the owned effective SOUL narrowly and preserve unrelated personality instructions.
- Keep web off unless requested.
- Do not interview the user for provider/model/secrets: on fresh setup they choose these privately in **`hermes setup`**. Ask only for real blockers; never copy host credentials or another instance's bot token.

Prepare infrastructure, then hand off setup in the user's own terminal.

- **Never run the interactive wizard through agent tools or request its secret-bearing output.**
- Installer-managed bootstrap/web secrets use ignored, mode-`0600` `<repo>/.hermes/.env` via raw Compose `env_file`.
- User-entered provider/channel keys and OAuth tokens use the verified native stores inside persistent `/opt/data`; do not copy them to the host or duplicate keys across stores.
- Preserve existing working authentication.
- Read [host CLI, private setup and apply](references/host-cli.md) for credential precedence, short commands and aliases.

## Fresh-install workflow

1. **Discover read-only.**
   - Inspect repo/README/AGENTS, Docker context, Compose, owned resources and repo-local configuration.
   - Identify task/toolchain requirements, consumer-visible skills/maps and pre-existing root/submodule state without refreshing upstream. Collect all safely discoverable development blockers, not just the first.
   - Use matching image source for pre-pull checks. Missing host Hermes is normal; discover its actual CLI/Python/provider **inside the approved container** later.
2. **Plan offline.** Run `node scripts/compose-plan.mjs --repo <root> --image <official-digest> --uid <uid> --gid <gid>` with the skill-relative absolute script path; add `--web` only if requested. It prints `{identity, compose, requiredConfig}`, without reading secrets or writing files. Use only `compose` as the Compose document.
3. **Preview and proceed.** Summarize the target, pinned image, isolated resources, repo write access, memory and interface. The install request supplies ordinary setup authorization; ask only for a missing input or uncovered risk, not confirmation of defaults. Dirty source is preserved, not a reason to demand stash/commit or a whole-repo backup.
4. **Provision within scope.**
   - Verify ownership, lock and secret-file protection; follow the [ignore-policy checks](references/ignore-policy.md) before writing private files. Preserve maintained docs' trackability without exposing `.hermes/`; report tracked sensitive paths rather than untracking them.
   - Persist identity/Compose and prepare `.env`. Follow the reference's single-writer maintenance sequence.
   - The volume owns `/opt/data`. Mount the canonical **repo root itself** at `/workspace` and preconfigure that as both container workdir and effective Hermes tool workspace through the verified schema; the user should not have to choose it. A read/write mount or terminal probe does not verify the actual write/edit tools' policy.
   - Check provider, NumPy and SQLite FTS5 early in the bootstrapped container using [verified Hermes startup/package activation](references/memory-capability.md), before declaring dependencies missing or proposing installation.
   - Narrowly merge workspace defaults and prepare the [repo-named SOUL identity](references/repo-identity.md) now; run state-writing memory verification after private setup.
   - `/opt/data` is state, not the workspace. No host Hermes installation, shared/global volumes or networks, shared home, Docker socket or recursive chown.
5. **Private user setup.**
   - Follow [host CLI access](references/host-cli.md) to create the repo-local launcher and collision-safe aliases. Keep the bootstrapped container running in verified maintenance mode, with gateway writers off.
   - Lead with one next command: **`hermes-<repo-name> setup`** after verified PATH command resolution or alias activation, otherwise the absolute scoped launcher. Keep the verified short Docker command as a fallback, not a second onboarding path to explain by default.
   - The user chooses provider/model/channels privately; `/workspace` is already preconfigured. Record resumable progress and report **prepared; waiting for user setup**, not ready. State the continuation: “Tell me setup is finished. I'll verify memory/auth/workspace, request any necessary recreation approval, and activate this instance once its gates pass.” Saving credentials alone does not start Telegram.
   - Offer persistent commands once, preferring optional cross-shell links in `~/.local/bin` over rc edits; use `--core-only` for main/status/logs while apply is unavailable, following [readiness and shortcuts](references/readiness-and-shortcuts.md). Record acceptance/decline and mode, never repeat the offer or block setup on it.
   - If writable ancestors reject links, use the reference's Bashrc-versus-permissions choices with separate authorization and the path-trust warning; keep accepted-but-blocked persistence `requested`.
   - Reuse existing valid configuration without forcing the wizard again.
6. **Post-setup verification, identity and memory.** After the user reports completion:
   - Inspect only nonsecret effective settings; re-establish quiescence.
   - Ensure the actual tool workspace is the mounted repo at `/workspace`, not `/opt/data` or a nested checkout.
   - Re-resolve the effective SOUL and reconcile the repo name if setup rewrote it, preserving new unrelated preferences. Verify prompt-loader precedence; distinguish SOUL identity from any static channel greeting.
   - Use **memory-holographic-hermes-setup**'s verified container adapter with the [capability acceptance contract](references/memory-capability.md): startup-equivalent nonroot checks, preserved configuration/tuning, functional HRR encode/bind/unbind tests, aggregate vector coverage and the cleaned-up persistence canary. Existing packages must be checked before installation; imports alone are not loaded-gateway HRR proof.
   - Reconcile wizard changes narrowly; preserve user choices and secrets. Missing runtime provider or failed verification blocks readiness; no silent fallback or host dependencies.
   - Confirmed basic capability must prominently say **“basic keyword mode—not full HRR capability.”**
   - Reindexing, dependency changes and recreation retain their separate approval gates.
7. **Activate and apply.**
   - After setup/identity/workspace/auth/access/memory gates, use the [Telegram preflight and scoped activation recipe](references/telegram-activation.md) when applicable. Replace maintenance CMD only when supported by the verified image and within scoped approval.
   - Start only the approved gateway and verify the configured channels, authentication enforcement, mounts, actual terminal-tool cwd, user and persistence—not just uptime or a gateway process cwd. Verify its loaded memory provider/capability separately; prove dependency/config/data/HRR recreation durability only within an approved maintenance window, otherwise report it pending.
   - Show a short `<alias>-apply` command for later config/credential changes: scoped container recreation reloads Compose-injected env as well as runtime files, preserving the owned volume. It is user-invoked, not an automatic restart, and succeeds only after a bounded wait on the verified image-specific gateway/channel probe. Missing probes block the shortcut before recreation; timeout/disconnection remain nonzero and unverified.
   - Discover actual loopback ports if enabled. If verified cold-boot policy discards pending Telegram updates, prominently say **“Send a fresh message now.”**
   - Verify effective listeners/publication instead of assuming API environment flags control exposure.
8. **Development readiness, separately.**
   - Assess the [task-scoped development gate](references/development-readiness.md): actual write/edit/cleanup tools and approval mode, narrow supported safe roots, persistent required toolchain across gateway/CLI/cron, readable skills/prerequisites, workspace/selectors and all-writer coordination.
   - Obtain any uncovered policy/install/probe scope; recheck after approved recreation. Report blocked/pending independently of runtime health.
   - Never create or enable coding jobs merely because installation or Telegram succeeded; a separately approved job still needs this gate and a reviewed no-overlap/failure policy.

## Output and boundaries

- Reuse verified facts while their inputs remain unchanged; refresh stale or changed evidence.
- Keep immediate pre-mutation ownership/lock/secret/config checks and post-mutation runtime verification.
- Avoid repeated branch/history/ignore/catalog searches and narrating each reconsideration. Report the next action, result or concrete blocker instead.

Report the following:

- Lead with a short **runtime ready / prepared / blocked** summary and a separate **development ready / pending / blocked / not assessed** verdict scoped to the intended task/modes: repo, agent name (exact repo basename), short container name, workspace `/workspace`, interface or verified URLs, memory/gateway evidence, credential locations (no values) and the one next action if needed.
- Keep full hashes, mount/backup details and nonsecret verification evidence in the local receipt during authorized setup, not a large default table.
- Use the [diagnostic statuses and compact handoff](references/resume-and-diagnostics.md): one supported diagnosis and one next action, never readiness from uptime or stale receipts.
- Include **Host CLI**: exact `hermes-<repo-name>` command availability (PATH link or alias) or absolute fallback, private `setup`, and a compact optional maintenance line listing only available verified commands (`-status`, `-logs`, and `-apply` only after its gates pass). State whether setup/activation/persistence is pending; keep full inventory in receipts. Include project-scoped maintenance commands on success.
- Distinguish prepared files, local probes and live verification; never report secret values.
- Report **identity configured** only after effective SOUL/loader checks; disclose an unsupported hardcoded greeting instead of claiming it changed.
- Separately report gateway/channel connection, memory verification and model-reply evidence: **Telegram connected does not prove a model-generated reply**. No automatic message/inference test.
- Runtime status/apply success does not verify coding tools, provision dependencies or authorize jobs.
- Report memory configuration, startup-equivalent dependencies, functional HRR, aggregate vector coverage, local cleanup, live integration and recreation durability as separate evidence; do not turn unknowns into passes.
- Use the [four-part outcome receipt](references/development-readiness.md#6-evidence-invalidation-and-outcome-reporting): changed this turn, pre-existing changes preserved, denied/not-executed commands, and validation actually completed. Keep a consolidated actionable blocker instead of repeating identical failed coding attempts.
- Check the [boundary/collision checklist](references/development-readiness.md#boundarycollision-checklist) before handoff; preserve existing lifecycle phases and status codes.

Host uninstall is a **separate workflow**, not a repair step. Supply only verified instance identity and preservation requirements; follow the [active-service impact confirmation](references/resume-and-diagnostics.md#host-uninstall-handoff) before any host removal handoff. “Only host” does not authorize undisclosed interruption of active bots.

Never adopt foreign resources, overwrite owner files, bypass auth, restart another stack, run `down -v`/prune, or erase data to recover. Reuse approvals only for their exact scope. Follow the [shared contract](../../shared/COMMON-CONTRACT.md).

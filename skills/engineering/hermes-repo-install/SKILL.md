---
name: hermes-repo-install
description: Use when installing or reconciling one Docker Compose Hermes Agent instance per repository, especially with multiple same-host repos needing isolated names, ports, state, and default Holographic memory.
---

# Install Hermes for one repository

One repo, one Docker Compose Hermes instance, Holographic memory by default. **No host Hermes installation, CLI, profile or Python is required.** Read [the Compose procedure](references/compose.md) before generating files or running Docker. Installing this skill does not deploy Hermes.

## Entry

Example: `/skill:hermes-repo-install /srv/projects/api`. Pi also exposes `/hermes-repo-install` via its prompt shortcut. Resolve an explicit target or the current Git worktree root; if ambiguous, ask. Preserve existing repo and Hermes configuration. Creating a second installation is not a repair for an unidentified existing one.

## Instruction loading

An explicit invocation may read this skill directly from its trusted source; catalog membership is not required. Keep the actual SKILL.md directory as the resource base, separate from the target repo. Read the full required **memory-holographic-hermes-setup** skill and its setup reference: use its catalog path when available, otherwise [the sibling skill](../memory-holographic-hermes-setup/SKILL.md). This sibling path works in the package tree and flattened skill installs. If a catalog entry is stale/unreadable, try the verified sibling source. Honor explicit trust denials; do not select arbitrary repo files as a fallback.

Readable instructions need no installer, symlink, Pi settings change or `/reload`; they do not register slash commands or install the Hermes plugin. Check required files before provisioning. If genuinely missing, continue independent read-only discovery, but block deployment/readiness with the missing path and one next action. Resolve unknown source locations from configured package paths or ask; never invent a checkout location. Runtime plugin/dependency and deployment approval gates still apply.

## Defaults, not an interview

Reuse explicit choices and verified repo-owned configuration. Otherwise resolve cwd's Git root, host UID/GID and resource names; select a verified current official image digest for a new instance, retaining existing pins on reruns. Keep web off unless requested. Ask only for unresolved provider/model choices or real safety blockers; never reconfirm every default. Do not copy host credentials or another instance's bot token.

All setup-managed secrets use **`<repo>/.hermes/.env`**, ignored/untracked and mode `0600`, via raw Compose `env_file`. Users enter external keys privately there; generate missing local web-auth secrets without printing them. Preserve existing values. No second `web.env`, runtime secret copy, credential-bearing YAML or chat-pasted keys. See the reference for compatibility and migration checks.

## Workflow

1. **Discover read-only:** inspect repo/README/AGENTS, Docker context, Compose, owned resources and repo-local configuration. Use matching image source for pre-pull checks. Missing host Hermes is normal; discover its actual CLI/Python/provider **inside the approved container** later.
2. **Plan offline:** run `node scripts/compose-plan.mjs --repo <root> --image <official-digest> --uid <uid> --gid <gid>` with the skill-relative absolute script path; add `--web` only if requested. It prints `{identity, compose, requiredConfig}`, without reading secrets or writing files. Use only `compose` as the Compose document.
3. **One scoped approval:** show a short plan covering generated files, pinned pull, owned resources, repo read/write access, secret-file setup, local memory verification and first startup. Group any missing nonsecret choice into this prompt. Reuse approval already given for these exact actions; ask again only for a new risk/scope. Dirty source is preserved, not a reason to demand stash/commit or a whole-repo backup.
4. **Provision:** after approval, verify ownership, lock and secret-file protection; persist identity/Compose and prepare `.env`. Follow the reference's single-writer maintenance sequence. The volume owns `/opt/data`, the repo mounts at `/workspace`; narrowly merge required configuration. No host Hermes setup, global resources, shared home, Docker socket or recursive chown.
5. **Required memory handoff:** use **memory-holographic-hermes-setup**'s container adapter with verified project/container/volume/home and application UID/GID/Python. Run backups, dependency checks and the cleaned-up local persistence canary there. Missing runtime provider or failed verification blocks readiness; do not silently fall back or install host dependencies.
6. **Activate and verify:** after setup/memory gates, start only the approved gateway. Verify real readiness, authentication, mounts, runtime user, persistence and isolation; uptime alone is insufficient. Discover actual loopback web ports if enabled.

## Output and boundaries

Lead with a short **ready / prepared / blocked** summary: repo/project, interface or verified URLs, memory/gateway evidence, `.env` path and the one next action if needed. Keep full hashes, mount/backup details and nonsecret verification evidence in the local receipt after approval, not a large default table. Include project-scoped maintenance commands on success. Distinguish prepared files, local probes and live verification; never report secret values.

Never adopt foreign resources, overwrite owner files, bypass auth, restart another stack, run `down -v`/prune, or erase data to recover. Reuse approvals only for their exact scope. Follow the [shared contract](../../shared/COMMON-CONTRACT.md).

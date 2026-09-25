---
name: hermes-repo-install
description: Use when installing or reconciling one Docker Compose Hermes Agent instance per repository, especially with multiple same-host repos needing isolated names, ports, state, and default Holographic memory.
---

# Install Hermes for one repository

One repo, one container-owned Hermes home, Holographic memory by default. Read [the Compose procedure](references/compose.md) before generating files or running Docker. Installing this skill does not deploy Hermes.

## Entry

Example: `/skill:hermes-repo-install /srv/projects/api`. Pi also exposes `/hermes-repo-install` via its prompt shortcut. Resolve an explicit target or the current Git worktree root; if ambiguous, ask. Preserve existing repo and Hermes configuration. Creating a second installation is not a repair for an unidentified existing one.

## Workflow

1. **Discover and preview:** verify canonical repo root, local Docker context, Compose version, selected official image/digest, host UID/GID, existing containers/networks/volumes and repo-local `.hermes` files. Read README/AGENTS to establish coding scope. Ask only for missing provider/model and interface choices; do not copy host credentials or reuse another instance's bot token.
2. **Plan offline:** run `node scripts/compose-plan.mjs --repo <root> --image <official-digest> --uid <uid> --gid <gid>` using the skill-relative absolute script path. Add `--web` only for requested dashboard/API access. It prints JSON `{identity, compose, requiredConfig}` and writes nothing. Review its plan; never pass the entire envelope as a Compose file.
3. **Isolate:** keep the original repo basename as the human-facing profile name; use the generated slug/path-hash Compose ID for resources. Check full ownership labels and local receipts before reuse, then persist identity and the `compose` object in dedicated repo-local files. No fixed container names, external/shared volumes, host networking or Docker socket. Docker allocates optional host ports on loopback; report discovered mappings rather than guessing.
4. **Provision after approval:** follow the reference's single-writer maintenance sequence, UID/GID and secret handling. Required config is a narrow merge, not a replacement. The container owns `/opt/data`; its profile identity does not require nested Hermes profiles. Configure `/workspace` as the actual terminal cwd/backend and verify write permissions without recursive ownership changes.
5. **Required memory handoff:** load **memory-holographic-hermes-setup** and pass the verified Compose/container/volume/home identity. Use its container-target adapter, backups, dependency checks, isolated database and cleaned-up local persistence canary. Holographic is required, not an optional suggestion; missing skill/provider or failed verification blocks readiness. Do not silently fall back or mutate the image's immutable Python environment.
6. **Activate and verify:** only after the setup/memory gates pass, start the approved gateway. Verify actual gateway readiness, authorized interface authentication, mounts, user, persistence and isolation; container uptime alone is insufficient. Print exact project-scoped maintenance commands.

## Output and boundaries

Report repo/profile/Compose identity, image digest, volume/home/workspace, interfaces and actual ports, configuration backups, Holographic evidence, gateway status, and blockers. Distinguish prepared files, local probes and live verification. No secrets in reports.

Never adopt foreign resources, overwrite owner files, bypass auth, restart another stack, run `down -v`/prune, or erase data to recover. Reuse approvals only for their exact scope. Follow the [shared contract](../../shared/COMMON-CONTRACT.md).

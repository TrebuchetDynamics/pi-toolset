---
name: hermes-laya
description: Use when adding, configuring, verifying or repairing Laya decision inference through Nerve on a repository's Docker Hermes instance; not for Layui, replacing the main LLM, or changing memory providers.
---

# Hermes with Laya

Use Laya for Nerve's typed semantic decisions, with the goal of avoiding unnecessary hosted decision calls. It does not generate Hermes's replies or replace the main LLM, Holographic memory, or deterministic completion checks. Speed and total token savings require measurement.

## Required handoffs

Read [hermes-repo-install](../hermes-repo-install/SKILL.md) and its required references for target resolution, creation versus maintenance, ownership, private setup and lifecycle. Then read [the pinned Nerve/Laya setup reference](references/setup.md). Keep the skill directory separate from the target repository. If a required source is missing or explicitly untrusted, block that step rather than inventing an installation path.

Example: `/hermes-laya /srv/projects/api` (or `/skill:hermes-laya`). Without a path, use the current Git worktree root. Maintain the existing owned instance; missing receipts with existing resources are not permission to create another.

## Procedure

1. **Discover and preview.** Record the selected Hermes image/runtime, effective home/config, installed Nerve revision, existing backend, sidecar, hardware and persistent storage. Preserve dirty files and existing settings. Preview the exact plugin/dependency additions, model download, topology and service impact. Reuse exact-scope approvals; ask only about uncovered downloads/installations, paid calls, external access or existing-service recreation. Reading or installing this skill does not deploy anything.
2. **Prepare the supported tuple.** Follow the reference's version-specific recipe. Keep Laya/torch dependencies outside Hermes's Python environment, in the selected sidecar environment. Preserve existing environments; review upstream scripts before use. Unknown plugin/runtime compatibility remains pending, not an excuse to force installation.
3. **Establish durable connectivity.** Choose a supervised, repo-owned sidecar with persistent model storage. Verify the endpoint from Hermes's network namespace. Host loopback, container loopback and another container's loopback are different. Preserve the installer's isolation and exposure rules; use the reference's loopback or authenticated TLS arrangements.
4. **Configure before enabling.** Narrowly merge Nerve's `reflex_backend: laya` settings into the effective configuration, preserving other plugins, secrets, main-model choices and Holographic configuration. Verify the installed plugin identifier and enable/reload through the scoped Hermes runtime. Do not briefly enable the hosted default while configuration is pending. `shadow` is a separate, explicitly selected hosted-Jev comparison, not a free prerequisite.
5. **Verify, then report.** Follow the reference's health, typed-request, loaded-plugin, provenance and recreation checks. An import or `LOCAL_ONLY` receipt alone is insufficient. Keep semantic decisions subordinate to deterministic verification. If verification fails, report pending/blocked; never silently switch to Jev or broaden service exposure.

## Handoff

Report **Laya configured / verified / pending / blocked**, separately from base Hermes readiness. Include instance, Nerve/Laya versions, checkpoint identity, sidecar topology and persistence, effective backend, completed checks, performance evidence or **not measured**, and one next action. Include an exact-scope rollback restoring only this change; service interruption needs the installer's approval gate. Never print credentials or raw decision contexts. Follow the [shared contract](../../shared/COMMON-CONTRACT.md).

---
name: hermes-repo-profiles-team
description: Use when creating, maintaining, repairing, or retiring a repository-specific Hermes Agent team, changing its roster or profile configuration, or diagnosing provider/model, authentication, Kanban, and root-interface drift.
---

# Hermes Repo Profiles Team

Create and maintain repository teams using **native Hermes profiles, Kanban, and sessions**. New teams use flat sibling profiles: human-facing `<repo>-team`, specialists `<repo>-team-<role>`. Existing teams retain their recorded IDs unless migration is explicitly approved. No Hermes source patch, nested profiles, scheduler, or fixed roster.

## Workflow

1. **Discover the existing state.** Read [discovery](references/discovery.md). Inspect repo instructions, dirty state, architecture/tests, team metadata, installed Hermes version, real roots and schemas. Identify creation versus maintenance; do not recreate a team merely because its naming differs.
2. **Resolve identities and models.** Follow [profiles and authentication](references/profiles-and-auth.md). For new teams, ask once for the repo-wide provider/model and requested overrides. Main choices: `openai-codex`, `openrouter`; unspecified defaults to **`openai-codex` / `gpt-6-luna`** for every profile. During maintenance retain recorded choices; defaults do not reset existing configuration. Show every resolved row and verify provider-qualified catalog evidence. Never silently downgrade or switch providers.
3. **Define the team contract.** Require [responsibility coverage, root readiness, integrated acceptance and bounded recovery](references/team-contract.md). Map responsibilities to actual owners or justified N/A; no fixed fleet or mandatory integrator. Propose the scoped configuration delta and resolve collisions. Use [maintenance](references/maintenance.md) for existing teams. Reuse applicable approvals; separate config, credentials, gateway operations, inference and release.
4. **Apply only that delta.** New profiles start fresh; existing profiles get targeted changes preserving owner configuration, memory, sessions, cards and workspaces. Follow [coordination](references/coordination.md) for root CLI/TUI and Telegram, specialist CLI tools, explicit board binding and coding worktrees. Humans use only root, sequentially across interfaces. Never dispatch the actively conversing root as a worker. No-op when desired and observed state agree.
5. **Verify and report.** Use [verification](references/verification.md). Check coverage, actual root capabilities, affected settings and per-profile provider/auth readiness before release. Accept the combined candidate, not just individual branches; stop recovery at approved limits. “Done signing in” means recheck, not assume success. Keep unready or unapproved work unreleased; finish independent authorized changes. No live inference without authorization.

## Output contract

Return mode (create/maintain/retire/migrate), repository and role rationale, exact profile IDs/homes, before → intended → observed changes (or no-op), retained state, per-profile provider/model/overrides/auth/test status, board/workspaces/dispatcher owner, root interface instructions, team-record revision, coverage/readiness/acceptance/recovery gates, evidence, blockers and next action. Distinguish **configured**, **authentication reported**, **inference tested**, **released**, and retirement pending versus verified.

## Example and boundaries

New Python CLI: `ledger-kit-team`, `ledger-kit-team-python`, `ledger-kit-team-validator`, all direct children of the resolved profiles directory. Existing `ledger-kit` teams keep their IDs and overrides during ordinary maintenance. Same-card review names the actual independent validator.

Never copy OAuth stores, confuse profiles with sandboxing, invent APIs, delete state during retirement, or silently alter shared services. Native handoff can invoke models/send messages and needs applicable authorization; subscription migration is separately verified. Skill edits do not provision or migrate live teams.

Follow [the shared skill contract](../../shared/COMMON-CONTRACT.md). Offline package tests cannot certify live Hermes behavior.

---
name: hermes-repo-team
description: Use when setting up or repairing a repository-specific Hermes Agent profile team with Kanban, root-only Telegram or CLI/TUI interaction, or inconsistent provider/model and authentication readiness across its profiles.
---

# Hermes Repo Team

Provision a repository-specific team using **native Hermes profiles, Kanban, and session controls**. This is a setup skill, not a scheduler or a fixed agent roster. Humans talk only to `<repo-slug>`; justified specialists use `<repo-slug>-<role>`.

## Workflow

1. **Discover before configuring.** Read [discovery](references/discovery.md). Inspect repository instructions, dirty state, architecture, build/test commands, and existing team metadata. Resolve the installed Hermes version, real profile/board roots and schemas. Never treat the latest website, a stale guide, or an offline model list as the installed runtime.
2. **Choose the team and models.** Ask once for the repo-wide **provider/model** and any per-profile overrides; reuse answers already supplied. Main provider choices are `openai-codex` and `openrouter`. If unspecified, propose **`openai-codex` / `gpt-6-luna` (GPT-6-Luna)** for root and every specialist. Show a row for **every profile**, not just root. Verify provider-qualified catalog entries; do not silently downgrade, switch providers, or choose cheaper workers. Read [profiles and authentication](references/profiles-and-auth.md).
3. **Present the concrete delta.** Propose only roles justified by repository work; no mandatory integrator. Include profile identities/instructions, models, tools, installed/loaded skills, repository/board binding, credential mechanism, and required shared-service changes. Resolve name collisions and reuse existing cards. Separate setup authorization from authentication, gateway changes, model tests, and work release; reuse applicable approval rather than repeatedly asking.
4. **Apply authorized setup.** Prefer fresh profiles; preserve owner configuration and memory. Give root persistent coordination instructions and specialists scoped execution roles. Configure both human surfaces and specialist CLI tools. Bind the correct board explicitly and use preserved worktrees for coding. Read [coordination](references/coordination.md) before creating cards or configuring interfaces. Do not dispatch root as another worker while its conversation is active.
5. **Verify before release.** Follow [verification](references/verification.md). Check each profile's effective provider/model and authentication, not root alone. “Done signing in” is a cue to recheck, not proof. Keep affected work unreleased when authentication or release approval is missing; preserve task IDs/workspaces. Finish independent authorized setup while blocked. No live inference without authorization.

## Output contract

Return repository/role rationale; exact proposed/applied delta; per-profile provider/model, overrides, auth and test status; board/workspaces/dispatcher owner; root Telegram and terminal instructions; verified evidence, discrepancies, blockers, and next action. Distinguish **configured**, **authentication reported**, **inference tested**, and **released**.

## Example and boundaries

A Python CLI may need `ledger-kit`, `ledger-kit-python`, and `ledger-kit-validator`, all initially `openai-codex` / `gpt-6-luna`; not a frontend fleet. Root login with validator logged out means validator work stays unreleased. Same-card review names the validator explicitly.

Never copy OAuth token stores, equate profile isolation with sandboxing, invent skills/APIs, or change a shared dispatcher silently. Native handoff/resume replaces custom interface machinery; notification migration remains separately verified. Handoff can invoke models/send messages; obtain applicable authorization. Authoring this skill does not provision a team.

Follow [the shared skill contract](../../shared/COMMON-CONTRACT.md). [Verification](references/verification.md) includes pressure scenarios and evidence limits; offline package tests cannot certify live Hermes behavior.

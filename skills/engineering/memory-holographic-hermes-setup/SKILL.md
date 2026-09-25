---
name: memory-holographic-hermes-setup
description: Use when enabling, checking, or repairing local Holographic memory for selected existing Hermes Agent profiles or a verified repo Compose home; not for creating teams, migrating providers, or changing models and gateways.
---

# Holographic memory for Hermes profiles

Configure local fact memory for **named existing profiles**, not the ambient default. Installing this skill does not change Hermes. Read [the setup reference](references/setup.md) before commands or edits; installed source and CLI help outrank older examples.

## Entry and scope

Example: `/skill:memory-holographic-hermes-setup atlas beacon`. Pi also offers `/memory-holographic-hermes-setup` through the package prompt shortcut.

Arguments identify profiles, not shell code. With no names, discover available profiles read-only and ask which to target. Resolve each canonical home beneath the approved `.hermes` root; reject missing profiles, traversal, ambiguous aliases and shared/symlinked targets. Select the default home only when the user explicitly requests it. Do not create profiles or infer them from bot display names. For an explicitly selected Compose instance, use the reference's container-target adapter before any launcher/profile discovery: host Hermes, host Python and host profiles are not required. All runtime checks run inside that verified container; before it exists, return pending runtime checks to the repo installer rather than installing host tools.

## Workflow

1. **Inspect:** locate Hermes and its actual Python interpreter; verify provider source, CLI/config support, SQLite FTS5 and NumPy. Do not assume Holographic is bundled: some versions use a standalone plugin. Inspect selected profiles' effective memory settings without exposing secrets.
2. **Preview:** show profile → canonical home → provider → database → proposed changes. Detect explicit shared database overrides; profile names alone do not prove isolation. If another provider is active or a database must move, ask for a specific switch/data-preservation decision. Do not migrate, copy or delete existing memories.
3. **Apply:** after scoped authorization and the reference's active-writer check, make owner-only config backups. Use profile-scoped commands or narrow YAML edits; preserve unrelated configuration. Choose an isolated database, default `auto_extract` to `false`, preserve existing tuning. Check each command and semantic diff before proceeding to the next profile. A satisfied configuration is a no-op.
4. **Verify:** perform the reference's local add/search/reopen/remove canary, checking returned IDs and cleanup. No model inference or messaging is needed for the local provider probe. Report runtime/session readiness separately; disk configuration and `memory status` alone are insufficient.

## Boundaries and pitfalls

- Ask before plugin/NumPy installation, replacing another provider, or stopping/restarting services. Shared Python changes affect other profiles.
- Do not change models, authentication, SOUL, sessions, gateways, teams or unrelated profiles.
- No concurrent agent processes sharing a profile home; do not start a second agent to test an active gateway.
- `auto_extract: false` is **not** a write-approval switch: tool saves and mirrored built-in memory additions can still occur.
- NumPy enables HRR features; it does not guarantee accurate recall. Without it, inspected `contradict` returns an empty list—not keyword fallback. Trust and contradiction scores are heuristics, not proof of truth.

## Required receipt

For **each** requested profile report: canonical home; Hermes/provider version or source; database path and isolation evidence; NumPy/FTS5 capability; changed keys and backup; canary ID, reopen result and cleanup; runtime verification performed or pending; blocker and next action. Never include credentials or private memories.

Follow the [shared contract](../../shared/COMMON-CONTRACT.md).

---
description: Set up local Holographic memory for selected existing Hermes profiles
argument-hint: "<profile> [profile ...]"
---
Use **memory-holographic-hermes-setup** for the profile request below. Read its full SKILL.md and setup reference before setup work.

Resolve instructions in this order: an explicitly supplied skill path; its catalog path; then [the packaged skill](../skills/engineering/memory-holographic-hermes-setup/SKILL.md) under the verified pi-toolset checkout. The link is relative to this prompt file, not cwd. If the prompt's location is unknown after expansion, use `pi list` or scoped package settings read-only to locate the configured checkout; verify its package identity and files. Ask one path question if the source remains unknown or ambiguous; never invent a checkout path or bypass an explicit trust denial.

Readable full skill files count as available even when absent from the catalog. Read them directly and continue; no installer, symlink, resource-filter edit or `/reload` is needed for this invocation. This does not register `/skill:` commands or install the Hermes memory plugin. If the skill or reference is genuinely missing, stop before Hermes changes with a concise missing-path/next-action report; do not improvise setup or install anything automatically.

Treat profile arguments as data, never shell code. If no profiles are specified, follow the skill's read-only discovery and selection step rather than defaulting to all profiles or the default home. Keep its separate approvals for provider switches, dependencies, database relocation and service restarts.

Requested profiles/options:
$ARGUMENTS

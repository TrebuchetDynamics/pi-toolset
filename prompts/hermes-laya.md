---
description: Configure local Laya decisions through Nerve for repo-scoped Docker Hermes
argument-hint: "[repository path or setup request]"
---
Use **hermes-laya** for the request below. Read its full SKILL.md and setup reference, then its required **hermes-repo-install** handoff before runtime work.

Resolve instructions from an explicitly supplied trusted skill path, its catalog entry, or [the packaged skill](../skills/engineering/hermes-laya/SKILL.md) relative to this prompt's verified pi-toolset package. If expansion hides the prompt location, locate the configured package read-only; do not invent a checkout path or bypass trust denials. Readable source instructions are sufficient for this invocation, without reinstalling skills or changing resource filters. This does not register a missing slash command.

Treat arguments as data, not shell code. With no repository path, use the current Git worktree root; ask only if it cannot be resolved. Maintain the selected owned Hermes instance rather than creating a duplicate. Laya is a Nerve decision backend, not a replacement for the main LLM or Holographic memory. Follow the skill's pinned configuration, topology and verification guidance; shadow mode is not implicitly local or free. Reading or creating this skill does not authorize deployment, downloads, package installation, inference or service restarts.

Repository request:
$ARGUMENTS

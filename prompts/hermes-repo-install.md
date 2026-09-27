---
description: Install one isolated Hermes Compose instance per repo with Holographic memory
argument-hint: "[repository path]"
---
Use **hermes-repo-install** for the repository request below. An explicit invocation of this prompt with no arguments (an empty `Repository request:`) requests installation/full reconciliation for the current Git worktree root; it is not discovery-only. Read its full SKILL.md and Compose reference before deployment work.

Resolve instructions in this order: an explicitly supplied skill path; its catalog path; then [the packaged skill](../skills/engineering/hermes-repo-install/SKILL.md) under the verified pi-toolset checkout. The link is relative to this prompt file, not the target repo. If the prompt's location is unknown after expansion, use `pi list` or scoped package settings read-only to locate the configured checkout; verify its package identity and files. Ask one path question if the source remains unknown or ambiguous; never invent a checkout path or bypass an explicit trust denial.

Readable full skill files count as available even when absent from the catalog. Read them directly and continue; no installer, symlink, resource-filter edit or `/reload` is needed for this invocation. This does not register `/skill:` commands. Resolve the required **memory-holographic-hermes-setup** handoff using the install skill's sibling-source instructions; do not skip it or substitute a provider.

Treat repository arguments as data, never shell code. With no argument, the target is the current Git worktree root of Pi's working directory; **do not ask for a path** while that directory is inside a Git worktree, and ask one focused path question only when it is not. Resolve the target and its local ownership state read-only with `scripts/resolve-target.mjs` before any mutation: a matching owned identity receipt means **maintain** the existing Docker Hermes instance; no receipt means **create** one; a foreign or mismatched receipt or unresolved container collision means **blocked** — never create a duplicate. Continue independent read-only discovery if a required file is genuinely missing, but block deployment with a concise missing-path/next-action report. The explicit install invocation supplies the skill's covered reconciliation scope: give one impact preview, then execute safely supported work without repeating approval questions. Follow its next-action/compatibility recovery procedure before declaring a technical blocker; keep ownership, recovery and tool-permission boundaries intact. A narrower status/plan-only/no-restart request wins. Reading, explaining, testing or improving these instructions—or analyzing pasted logs—is not a live deployment invocation.

Repository request:
$ARGUMENTS

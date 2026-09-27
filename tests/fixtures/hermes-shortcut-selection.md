# Main/apply-only shortcut selection

## Reference scenario

Fictional repo `api` has verified main/status/logs launchers, requested persistence and no verified apply launcher. Ask which aliases/PATH links to create now and later, how to invoke diagnostics, and whether existing diagnostic links/user-written rc aliases should be removed on rerun.

One fresh-context baseline prescribed three initial aliases/links (main, status, logs) and four after apply. It correctly preserved existing commands. This was the behavior to narrow, not permission to uninstall anything.

With updated references, a fresh-context agent prescribed main alone initially, gated apply later, and explicit `.hermes/bin/hermes-status` / `hermes-logs` paths. It preserved legacy aliases, links, rc entries and historical inventory, without claiming unselected diagnostics had been reverified.

This single reference comparison is not a broad behavioral benchmark or runtime deployment test.

## Executable regressions

- `tests/hermes-operator.test.mjs` first failed because main/apply installation required absent diagnostic launchers. It now passes without those files.
- Both modes leave legacy diagnostic destination files/symlinks unchanged, including dangling links; unsafe/unselected diagnostic source files do not block selected shortcuts.
- Main-only installation, explicit full-mode missing-apply rejection, later apply promotion, argument forwarding, idempotence and selected-name ownership/conflict checks remain covered.
- `tests/hermes-repo-install.test.mjs` first failed when executing the alias example still defined diagnostic aliases. It now verifies their absence and runs retained diagnostic launchers by explicit path, preserving their existing output/exit safety checks.
- `tests/skill-profile.test.mjs` runs the real helper from both flattened installed copies: main alone, then main/apply, with no diagnostic sources.

Independent read-only review found no blocking implementation issues. It identified one ambiguous lifecycle sentence about “CLI/status/logs launchers and aliases”; that sentence now explicitly distinguishes the main alias from explicit-path diagnostics.

No real aliases, PATH links, shell files, Docker resources or Hermes deployments were changed. The separate pending automation worktree was not modified; its future integration must reconcile this selection contract deliberately.

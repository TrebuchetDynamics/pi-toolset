# Existing-install conformance and interactive default chat

## Reference application

One fresh-context baseline and one guided trial used the same fictional request: bring an owned existing `api` installation up to all current rules and make bare `hermes-api` open chat. Its gateway is healthy, its ready receipt is old, home is `/opt/data`, diagnostic aliases already exist, and Docker-management instructions were declined. No downtime/migration/permission-repair scope is supplied.

The baseline identified two missing documented procedures: an exhaustive existing-install reconciliation inventory and a chat-default retrofit with supported active-gateway coordination. It correctly refused to infer migration/downtime permission or create a second writer.

With the updated references, the agent recovered the nine-family inventory (identity/image/resources; writable state; private-file trust; setup/auth/identity; memory/persistence; launchers; lifecycle/interfaces; development; optional integrations), per-rule observations/deltas/authorization/verification, scoped backup/reconciliation and separate alignment/readiness verdicts. It retained the legacy home pending approved migration, old diagnostic aliases and the optional-skill decline.

For chat it selected the adapter only when both stdin/stdout are TTY, kept non-TTY help and explicit argv, required full-session native coordination/attachment, and blocked unsafe/unqualified chat without stopping the gateway. It explicitly identified that neither an automatic migration engine nor a qualified production chat adapter is supplied. This is reference-application coverage, not broad behavioral certification.

## Executable RED/GREEN evidence

`tests/hermes-repo-install.test.mjs` first failed because a PTY/no-argument invocation still emitted Docker help rather than the synthetic chat marker. The updated template/dispatcher exercises:

- PTY chat routing; explicit help/setup and argument forwarding unchanged.
- Help when either stdin or stdout is redirected.
- No direct Docker fallback when the adapter is absent, unsafe, busy or unsuccessful.
- Regular-owner-only adapter validation: missing, symlinked, hardlinked, writable and `0755` files rejected.
- Terminal inheritance, returned exit codes and child self-SIGTERM status mapping.
- Installed module closure/noninteractive rejection in both flattened copies via `tests/skill-profile.test.mjs`.

Independent review found no blocking issues in the bounded procedure/dispatcher. It identified a mode mismatch (documentation required owner-only, shared probe validation allowed `0755`); a dedicated test reproduced the unwanted execution, then the chat-specific check was tightened. PTY tests use util-linux `script` when available and ran on the validation host.

## Limits

The synthetic adapter proves dispatch behavior, not actual Hermes session coordination. Native contention, terminal hangup, parent termination, live reservation cleanup and absence of orphan runtime writers must be verified before qualifying a real adapter. The dispatcher is not an automatic concurrency manager or a migration tool; path trust and runtime-specific adapter review remain mandatory. No live Hermes chat, model request, service change, state migration or installed-launcher modification occurred.

The earlier separate automation worktree was not changed; future integration must reconcile its generated artifact set and launcher behavior with this contract.

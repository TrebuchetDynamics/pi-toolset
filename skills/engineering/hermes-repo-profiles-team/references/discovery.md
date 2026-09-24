# Source-backed discovery

## Repository and host reconnaissance

Start with repository instructions and `git status --short --branch`; preserve unrelated changes. Consult the codebase map when present, then verify its leads against manifests, source, tests, CI, and architecture docs. Derive a small role proposal from real components, risks, and test commands. A reviewer must be independent of the implementation it judges; integration is an assigned responsibility, not necessarily a permanent profile.

Locate the actual Hermes executable and installed source/version without launching inference or setup. Inspect source/help safety before calling a CLI: startup can seed skills, migrate stores, register services, or refresh credentials. `profile describe --auto` is model-backed, not passive discovery. Do not import runtime modules just to inspect them if imports can open user stores.

Resolve profile homes through the installed root-resolution logic, including custom `HERMES_HOME`, shared roots, and `HERMES_KANBAN_HOME`; never hard-code `/.hermes/profiles`. Inspect only necessary, redacted metadata initially. Do not inventory private memory, sessions, `.env`, or `auth.json` contents to determine profile ownership. Obtain explicit scope before handling credentials. Never print a credential resolver's return object.

### Required capability record

| Surface | Establish before using it |
| --- | --- |
| Profiles | Actual create/options, naming limits/reserved names, existing-name owner, clone side effects, model configuration schema |
| Tools | Root CLI/TUI and Telegram selectors, availability gates, disabled tools, worker CLI selection, effective tool schemas |
| Context | Profile SOUL location, effective project-context precedence, skill availability/trust/loading, actual injected prompt |
| Board | Explicit board selector, DB/workspace root, valid statuses, dependency direction, review tools, initial blocked behavior |
| Dispatcher | Existing owner/lock scope, boards affected by config, per-setting reload behavior, assignee restrictions |
| Identity | Memory ownership, OAuth provider/credential resolution, external CLI HOME behavior; profiles are not OS sandboxes |
| Interfaces | Native resume/handoff, Telegram destination/allowlist, creator subscriptions, delivery versus wake behavior |

Record observed facts, sources/revision, and unresolved capabilities. Unknown support remains unknown; a guide is not evidence of a working tool. Do not create profiles/cards to discover what a command does.

## Version-sensitive pitfalls

These are **observations from a source review**, not compatibility guarantees or instructions to patch Hermes. Revalidate against the target installation.

At reviewed source revision `5f05b724b92bb4f6fd2ae847484b29ebe6bce210`:

- `tools/kanban_tools.py` checked top-level `toolsets` for `kanban` independently of per-platform selections. Platform enablement alone was insufficient evidence of root tool availability.
- `agent/agent_init.py` and `agent/system_prompt.py` injected `KANBAN_GUIDANCE` when `kanban_show` was present, including into interactive roots; the guidance assumed a headless worker with one assigned task. Newer docs describe worker-only injection. If the effective root prompt is contradictory, report a compatibility blocker; a role prompt is not proof that the contradiction is fixed. An upgrade/patch requires its own authorization.
- `kanban_create` omitted `workspace_kind` to `scratch`; board `default_workdir` alone did not convert it into a worktree. A resolvable Project link could select worktree behavior. Confirm persisted fields rather than trusting UI defaults.
- Dispatcher `auto_decompose` was reread each tick across boards, while other settings were boot-loaded. Do not require a restart for every key or claim a live reload without tracing it.
- Unknown assignees could remain `ready` with `skipped_nonspawnable`, not automatically block. `profile_exists` did not prove authentication.
- Optional release checks could fail open on configuration errors. Kanban state is coordination, not authorization.

Use installed source/schema to explain discrepancies rather than permanently codifying this snapshot as the current API.

## Official documentation map

Read the sections relevant to the actual action; check installed source where they disagree.

- [Profiles](https://hermes-agent.nousresearch.com/docs/user-guide/profiles/): identity, creation, cloning, model/config scope, memory, authentication caveats.
- [Configuration](https://hermes-agent.nousresearch.com/docs/user-guide/configuration/) and [models](https://hermes-agent.nousresearch.com/docs/user-guide/configuring-models): provider/model keys and runtime overrides.
- [Which file does what](https://hermes-agent.nousresearch.com/docs/user-guide/which-file-does-what), [context files](https://hermes-agent.nousresearch.com/docs/user-guide/features/context-files), [skills](https://hermes-agent.nousresearch.com/docs/user-guide/features/skills): identity versus project rules versus loaded procedures.
- [Kanban reference](https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban), [tutorial](https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban-tutorial), [worker lanes](https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban-worker-lanes): tool schemas, lifecycle, workspace and review contracts.
- [Sessions](https://hermes-agent.nousresearch.com/docs/user-guide/sessions/), [TUI](https://hermes-agent.nousresearch.com/docs/user-guide/tui), [Telegram](https://hermes-agent.nousresearch.com/docs/user-guide/messaging/telegram): native interaction and transfer.
- [Multi-profile gateways](https://hermes-agent.nousresearch.com/docs/user-guide/multi-profile-gateways), [Kanban gateway ownership](https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban-multi-gateway): separate process/multiplex topology and notification ownership. Documentation has evolved; do not start a gateway for each worker based on an older quickstart.

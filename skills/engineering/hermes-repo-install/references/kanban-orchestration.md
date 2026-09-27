# Default-profile Kanban orchestration

For requested repo collaboration, keep the existing **default profile** as the human-facing coordinator; verified named specialists execute cards. This is profile-led orchestration, not automatic triage decomposition. Configuration, worker readiness, authorized release and observed execution are separate outcomes. Editing/installing this skill does not configure a deployment, create tasks, invoke models or start a dispatcher. During an explicit installer invocation, [full reconciliation scope](authorization.md) covers required supported repairs to already selected Kanban configuration/schema/dependencies and coordinated service maintenance without another approval prompt. It does not create new task/inference/budget/messaging authority or release previously dormant backlog; safety and actual-execution gates below remain distinct.

## Version and ownership first

Source basis: Hermes commit **`ce750ff151835ffb66b353b668f6385f576f45f5`**, inspected statically. The [official reference](https://hermes-agent.nousresearch.com/docs/user-guide/features/kanban) is discovery guidance; reconcile the pinned interfaces below with the actual selected image before use. This source snapshot is **not a qualified Docker image**, a reason to upgrade an existing pin, or proof it meets the [workspace-state contract](workspace-state.md).

Record the verified repo/context/project/container/image, effective default home/config/SOUL, profile roster, board slug/resolved paths, dispatcher owner, existing claims/workers and notification owners. Preserve providers/models, native auth, Holographic databases/tuning, sessions, cards, attachments and workspaces. Missing specialists require a separately scoped team/profile setup; do not invent a fixed roster, clone credentials, change models or dispatch `default` as a substitute.

The native ID `default` denotes the base home, **not** `profiles/default`; the assistant's displayed repo name and the planner's `identity.profileName` are not native worker IDs. Under the inspected resolver, explicit `HERMES_HOME=/workspace/.hermes` with `-p default` resolves to that base, and named siblings resolve under its `profiles/`. Verify the actual resolver and loader, including ambient selectors; never create nested teams or rewrite a legacy home to fit this example. Use the verified scoped launcher with explicit `-p default` for configuration commands. Bind gateway routing and the session-safe chat adapter to that same intended profile through supported interfaces, not by changing an unrelated active-profile pointer.

## 1. Default coordinates; specialists implement

Narrowly merge this role into the owned effective [SOUL/briefing](repo-identity.md), preserving existing identity and unrelated instructions:

> You are this repository's human-facing coordinator. Discover the actual specialist roster and capabilities before assigning work. Clarify acceptance and shared design decisions before fan-out; include them, the repo/board/workspace scope, verification and delivery limits in each card. Use native `kanban_*` tools to route work, inspect handoffs and report results; do not implement specialists' work or assign yourself a worker card. Missing capability goes to the human, not an invented assignee. Completion requires evidence, not a commit or a worker's assertion. Keep retries and follow-ups inside the approved goal and budget.

This is an instruction contract, not an OS permission boundary. Verify the default profile's effective tool schema. Propose a narrow board/communication/memory-oriented toolset for orchestration, but removing existing tools or changing policy requires its own scope. Never work around disabled tools through CLI/shell. Dispatcher-owned workers receive lifecycle tools; delegated children do not inherit permission to complete the owning card.

**Enable `kanban` per selected platform**, not just in an old top-level `toolsets` list or `all`. After source/CLI checks, during authorized configuration, the scoped examples are:

```sh
'/absolute/repo/.hermes/bin/hermes' -p default tools enable kanban
'/absolute/repo/.hermes/bin/hermes' -p default tools enable kanban --platform telegram
```

Replace the launcher with the verified one; run the second command only for a selected Telegram interface. Preserve other platform selections. Inspect `platform_toolsets.<platform>` and `agent.disabled_toolsets`: global suppression remains authoritative and must not be silently removed. Verify a **fresh session's** tool schema and loaded role; old conversations retain schemas/prompt cache. Do not delete existing conversations or start model turns merely to test this. If non-inference schema verification is unavailable, leave it pending until an approved user-assisted check.

## 2. Separate preparation from dispatch release

`kanban.orchestrator_profile: default` selects root ownership for the built-in decomposer; it **does not load default's prompt, skills or custom decomposition logic**. Set `auto_decompose: false` for this profile-led design. Default creates fully specified cards through tools, not `kanban decompose`/`specify` (auxiliary model calls). Do not create an unfinished default-assigned parent and gate all implementation behind it: dependency parents must finish first. Use a completed planning handoff when appropriate, or keep the coordinating context in the conversation. Support cards must not depend on the blocked card they exist to unblock.

This example is a **narrow configuration fragment for an approved new setup**, not a whole config or a blind update. `coder` and `reviewer` are examples only; substitute existing, verified, authorized profile IDs. With no ready specialists, retain `dispatch_profiles: []` and report blocked. Never omit that key as a fallback: omission permits any existing profile.

```yaml
kanban:
  orchestrator_profile: default
  auto_decompose: false
  dispatch_in_gateway: false       # preparation only; release step below
  dispatch_profiles: [coder, reviewer]  # verified specialists; never default
  dispatch_interval_seconds: 60
  max_in_progress: 2
  max_in_progress_per_profile: 1
  failure_limit: 2
  review_dispatch: true            # only with an approved reviewer workflow
  auto_subscribe_on_create: false  # passive preparation; wake policy below
  notify_in_gateway: false        # new setup only; do not disable existing delivery
  default_workdir: /workspace
```

Preview these positive limits against hardware, cost and existing policies; preserve tighter limits. Do not use zero/invalid caps as a pause. Inspect `default_assignee`; every new worker card must name a verified specialist rather than rely on a fallback to default. Setting `auto_promote_children: false` only affects built-in decomposition; it does **not** hold ordinary `kanban_create` cards, which can become immediately ready.

For **existing installations**, follow [full reconciliation](existing-installations.md). Do not apply the preparation fragment to an active gateway: changing dispatch, review or notification behavior can interrupt workflows and needs exact scope. Preserve active workers, queued cards and subscriptions; configuration edits do not prove a running dispatcher stopped or reloaded. An empty allowlist prevents eligible claims in the supported implementation, not all dispatcher bookkeeping, wake turns or arbitrary same-user actions.

**Release only after approval covering actual work/inference, budget and notifications:** inventory backlog on every board the dispatcher sweeps, resolve unapproved ready/review work without silently blocking/deleting cards, verify specialists and all-writer coordination, then set `dispatch_in_gateway: true` on exactly the owning default gateway. Other gateways sharing the board must have dispatch disabled through their supported settings; never add a standalone daemon alongside it. Verify the effective `HERMES_KANBAN_DISPATCH_IN_GATEWAY` override and any reload/recreation requirements. A board selection is not a promise that the gateway sweeps only that board. If safe scoping cannot be established, do not release dispatch.

Docker worker survival and reclaim are source/runtime gates: a detached child process does not survive container replacement. Drain or otherwise coordinate workers before approved recreation. Host systemd session-bus/scope instructions are not an instruction to enable host linger or install systemd inside this container. Qualify the actual supervisor, worker identity, claim fencing and interruption/cleanup behavior separately.

## 3. One local board identity, durable coding workspaces

For a new verified workspace-local home, the default board's expected DB is `/workspace/.hermes/kanban.db`; named boards use `/workspace/.hermes/kanban/boards/<slug>/kanban.db`. Keep private logs, attachments and scratch backing under that tree with the existing ownership/ignore/SQLite checks. Reuse existing board identities; do not create a named board just to fix a selector mismatch.

Verify the **resolved paths in default, gateway and worker contexts**, not only the slug. `HERMES_KANBAN_HOME` overrides the base board root; `HERMES_KANBAN_DB` overrides the database even with an explicit board argument. Workspace/attachment overrides can also escape the intended backing. Resolve conflicts explicitly; never silently unset worker-injected pins or globally pin every board to one DB. Native dispatch pins the worker's board/DB/workspace root when it changes profile home. A named profile should not accidentally acquire a separate copy of the shared board.

Use an explicit board selector for human CLI operations and supported board context for default's tools. Avoid a global `boards switch` as a substitute for scoped selection; the dashboard has its own selection. Board filters/profile IDs are not OS isolation. Keep this design on **one host/runtime with a coherent process namespace and local SQLite locking**; no cross-host shared DB or assumption that a shared file makes container-local PIDs comparable.

Set the selected board's verified project/default directory to `/workspace` using its supported metadata/config precedence; existing board or Project bindings can override `kanban.default_workdir`. New coding cards should explicitly use a supported `worktree` workspace rooted in the canonical repo, with preserved paths visible inside the container and usable Git metadata. Validate worktree creation/branch scope and the [development gate](development-readiness.md) for each worker. Do not allow two writers on a shared `dir:/workspace` merely because their card IDs differ. `dir:` paths must be absolute; worker paths are container paths, not host checkout strings.

Scratch is disposable on completion. Use preserved worktrees for code; declared artifacts must be durably attached before scratch cleanup or review handoff. Never use `.hermes` private state as the coding cwd, mount a broad host parent for Git metadata, or claim worktree isolation protects shared home/DB state.

## 4. Review, notification and recovery contract

- Workers use `kanban_show`, heartbeat during long work, then `kanban_request_review`, `kanban_complete` or a typed `kanban_block`. An independent reviewer must be explicitly selected for same-card review; the default `review_dispatch: true` does not select an independent person/profile by itself. Missing reviewer support leaves review pending, not self-approved. Record changed files, verification, dependencies, retry context and residual risk in the handoff; no secrets or raw logs.
- Set bounded per-card runtime/retry/iteration budgets within the approved resource scope. Repair missing capabilities/auth or terminal provider errors before retrying; do not repeatedly unblock the same failure or override live claims to force completion. Dependency waits, input/capability blocks and reviewer changes are different transitions. Default observes the durable result; it does not impersonate the worker's terminal call.
- Default should receive completion/review/block feedback in its **verified originating session**. When autonomous follow-up turns are approved, enable `auto_subscribe_on_create: true` and the owning gateway's `notify_in_gateway: true`, verifying `notify+wake` routing and budget. For approved passive gateway delivery, also enable `notify_in_gateway: true` on the verified delivery owner, retain `auto_subscribe_on_create: false`, and create only explicitly approved `notify` subscriptions. The preparation fragment's disabled notifier sends no messages, even with a subscription. Before enabling it, inspect existing/inherited subscriptions: any wake-capable rows need their own approved reconciliation or wake scope; do not silently downgrade them or promise passive-only behavior while they remain. Setting auto-subscribe false is not a universal mute. Manual triage does not disable wakes, task creation or explicit decomposition. Wake turns must not create duplicate follow-ups or exceed the authorized goal.
- Delivery ownership is separate from dispatch ownership. Preserve profile/platform/chat/thread routing anchors and existing notification modes; do not copy bot credentials or start another dispatcher to fix delivery. Verify passive delivery and wake admission separately under messaging/inference scope. No output means pending, not exactly-once delivery or successful model execution. CLI-created cards have no invented chat destination.
- Local-only work stays `completion_contract: local-only`. For requested PR work, bind the exact repository/PR contract at creation, then record `metadata.published_pr`; completion needs the supported exact-head required-check acceptance gate. A commit, push, optional checks or local tests alone are insufficient. Missing checks/policy/API access remains blocked; do not downgrade an existing PR contract to local-only to bypass it. Publication still needs separate delivery authorization.

The dashboard remains optional/off by default. The upstream page contains conflicting general authentication claims and plugin-route security notes: **do not assume Kanban REST routes are authenticated**. Verify the selected version's actual HTTP/WebSocket routes, auth enforcement and loopback/network exposure before enabling access. No extra ports, socket access or public dashboard as part of Kanban configuration.

## 5. Verify without accidentally running the board

Static source/config/path inspection comes first. In this inspected revision, `connect()` can create directories, enable WAL, initialize schema and migrate an existing DB; even list/show-style commands may reach it. `dispatch --dry-run` still executes reclaim/promotion/timeout processing and can terminate workers before its no-spawn branch. Neither is an unconditional read-only probe. Do not put them in installer status/readiness polling or run them against an existing board under read-only scope. Use a source-reviewed genuinely non-mutating observation path or mark inspection pending. Do not import/execute upstream modules merely to inspect their behavior.

During authorized configuration, narrowly merge expected preimages with backups and single-writer checks; board initialization/migration is a distinct disclosed write. Test settings, profile/board resolution, tool schema, specialist exclusion of default and unsupported/missing roster cases offline first. Only a separately approved isolated runtime test can verify dispatch, review, bounded failure/retry, artifacts, notifications and recreation durability. A real task, `swarm`, decompose/specify call or gateway start is not a harmless smoke test.

Record nonsecret `evidence.kanban` in the existing version-1 receipt only during authorized reconciliation: source/runtime binding; before/target/observed settings; default role/tool platforms; actual roster and board/backing/workspaces; dispatcher and delivery owners; limits; release scope; per-gate results and blockers. Preserve unknown fields and lifecycle phases. Recheck dependent evidence after image/profile/schema/board/path/policy/gateway changes. Report **configured / blocked**, **workers ready / pending**, **dispatch released / not released**, and **execution/delivery verified / not tested**, separately from base runtime, memory and development readiness.

## Pinned source anchors

- [Reference and configuration semantics](https://github.com/NousResearch/hermes-agent/blob/ce750ff151835ffb66b353b668f6385f576f45f5/website/docs/user-guide/features/kanban.md)
- [Explicit default/named profile resolution](https://github.com/NousResearch/hermes-agent/blob/ce750ff151835ffb66b353b668f6385f576f45f5/hermes_cli/profiles.py#L2404-L2433)
- [Platform toolsets and disabled-toolset precedence](https://github.com/NousResearch/hermes-agent/blob/ce750ff151835ffb66b353b668f6385f576f45f5/hermes_cli/tools_config.py#L590-L646)
- [Shared board root and override precedence](https://github.com/NousResearch/hermes-agent/blob/ce750ff151835ffb66b353b668f6385f576f45f5/hermes_cli/kanban_db.py#L399-L537)
- [Dispatcher allowlist](https://github.com/NousResearch/hermes-agent/blob/ce750ff151835ffb66b353b668f6385f576f45f5/hermes_cli/kanban_db_dispatch.py#L1660-L1733), [reclaim before dry-run branching](https://github.com/NousResearch/hermes-agent/blob/ce750ff151835ffb66b353b668f6385f576f45f5/hermes_cli/kanban_db_dispatch.py#L2161-L2408)
- [Board connection initialization/migration](https://github.com/NousResearch/hermes-agent/blob/ce750ff151835ffb66b353b668f6385f576f45f5/hermes_cli/kanban_db_connect.py#L668-L735)
- [Built-in decomposition routing](https://github.com/NousResearch/hermes-agent/blob/ce750ff151835ffb66b353b668f6385f576f45f5/hermes_cli/kanban_decompose.py#L129-L217)

# Native coordination and root interaction

## Minimal topology

Human ↔ `<repo>-team` coordinator on Telegram **or** CLI/TUI → native Kanban tools → repo board → one existing native dispatcher → `<repo>-team-<role>` specialist processes → durable handoffs/review/events → root.

These are the new-team IDs; existing teams use their recorded IDs in every command, card, reviewer and routing setting. The coordinator and specialists are sibling profile directories, not nested homes.

Root decides cross-cutting requirements, creates scoped cards, inspects evidence, surfaces blockers to the human, and synthesizes results. Specialists work headlessly and return decisions/evidence through Kanban. No specialist Telegram bot, extra scheduler, custom registry daemon, or fixed integrator is required. Assign integration/testing ownership explicitly. Require the [team contract](team-contract.md): complete responsibility coverage, a durable nonsecret briefing that root demonstrably loads, root capability evidence, combined-candidate acceptance and bounded recovery. The briefing is not a native registry or automatically loaded context.

## Bind all three surfaces

1. **Profile tools/context:** verify root tools for both `platform_toolsets.cli` and `.telegram`, applicable availability gates and disabled tools. Specialist dispatch uses its CLI selection. Use least privilege without removing capabilities root actually needs to inspect context/load skills; supply an accessible roster and repo facts. Do not claim prompt text enforces OS permissions. Verify actual loaded prompt; unexpected worker-only instructions in an interactive root are a compatibility problem, not something to conceal with a stronger SOUL.
2. **Root board:** a profile named after a repository does not select that board automatically. Use explicit supported `board` arguments or a verified profile-scoped launch environment. Do not rely on the host-wide current-board pointer, and do not assume a `.env` variable affects multiplexed routing without checking its resolution.
3. **Worker repository:** root's absolute `terminal.cwd`, board `default_workdir`/Project binding, and each task's workspace are distinct. Use explicit `workspace_kind="worktree"` on coding cards, with an absolute repo anchor/target supported by the build. Inspect the persisted path, branch and kind. A Project ID may be profile-local and unresolved references may fall back; verify rather than guessing. Scratch workspaces are disposable. Preserve existing worktrees and carry exact candidate path/branch/commit or diff evidence through review; dependencies don't merge branches automatically.

## Dispatcher and authorization

Identify the real dispatcher owner and lock/root scope before changing configuration. A single dispatcher may sweep every board. Do not globally disable `auto_decompose`, restart/migrate the gateway, or alter shared allowlists/concurrency for one team without approval of that blast radius. Notifications belong to the gateway serving the relevant profile and are distinct from dispatch ownership.

Root can create explicit tasks without the built-in triage decomposer. `kanban.orchestrator_profile` assigns the post-decomposition orchestration card; it does not load root's prompt/history into the auxiliary decomposition call. Do not route that card, fallback assignments, or review back to an actively conversing root profile. If Manual orchestration is selected, apply it at the actual owner scope. Revalidate per-setting reload requirements.

A card is not authorization. No generic `hold` status exists in the reviewed build; `todo` may promote, `triage` may invoke decomposition, and `ready` may dispatch immediately. Before creating any unauthorized work, prefer no card yet; if a parked card is needed, use a **verified non-dispatching initial state** such as supported sticky `blocked` at creation, with its reason. Do not create ready-then-block and race the dispatcher. Authentication failure is not a reliable scheduling hold.

Approve and build dependency edges before exposing runnable work. `parents=[prerequisite_id]` means the new card waits for that prerequisite to finish, not mere organizational grouping. A support card must not depend on the blocked card it exists to unblock. Avoid races from linking after a child is already running.

Use one writer per worktree and avoid concurrent writers of one profile memory. The reviewed `max_in_progress_per_profile` counts running cards within one board; it is not a cross-board/session/profile-wide mutex. Native session exclusivity is also session-scoped. Confirm quiescence before reassigning a workspace: a closed card or stopped UI alone does not prove every process ended.

## Choose one review model

**Same-card review (default for a single implementation card):** implementer calls `kanban_request_review(summary=..., metadata=..., reviewer="<repo>-team-validator")` using an existing independent profile. **Name the reviewer on the first handoff**: omission can leave the implementer assigned and cause self-review. Reviewer uses `kanban_complete` to approve or `kanban_request_changes` for rework; genuine external blockers use `kanban_block`. Re-review retains or explicitly names the same reviewer. Check review dispatch is enabled; otherwise establish an authorized human approval path.

**Pre-created downstream review/QA card:** implementation completes its own phase to release that dependency. Do not additionally request same-card review or sticky-block implementation for “review required”; either can duplicate or deadlock review. This is an explicit alternative, not automatic creation of a reviewer child by `request_review`.

Handoffs carry changed files, exact candidate location/revision, validation commands/results, unresolved risks and required next action. Keep secrets/raw credential output out of durable board metadata. Reviewer verifies the candidate, not just the implementation's self-report. Use the team contract's integrated acceptance receipt to validate and independently review the exact combined candidate. Integration and release remain separate approved actions where applicable.

## Telegram and CLI/TUI

Configure Telegram only for the human-facing root: correct profile adapter/routing, allowed user/chat, and home channel. Do not reuse bot credentials in competing gateways. Respect the existing standalone/multiplex topology; provisioning or changing an adapter may require a separately approved rescan/restart. Avoid reading tokens into reports.

For **sequential** interaction, reuse native sessions rather than build a control service:

- Give the root conversation a recognizable `/title` or retain its ID. Start terminal access with the explicit root profile.
- CLI → Telegram: native `/handoff telegram`, after configuring the destination `/sethome` and with the gateway running. **This is not a transport-only check:** the reviewed `gateway/run.py:14993–15034` invokes a synthetic model turn and sends its reply to the destination. Executing/testing handoff requires authorization covering inference spend and outbound messaging; setup-only approval is insufficient. The documented command refuses mid-turn, preserves session ID/transcript, waits for acknowledgement, and exits CLI on success. A claimed but slow transfer is not proof of failure or permission to start another owner.
- Telegram → terminal: `hermes -p <root-profile-id> --resume <id-or-title>`; TUI: `hermes -p <root-profile-id> --tui --resume <id-or-title>`. Use `<repo>-team` for a new team or the recorded root ID for an existing team. Verify identity and history. Bare `-c`/`latest` may pick a terminal/surface-specific session instead. A fresh conversation under the same profile is also valid when continuity is not requested.
- Check the installed TUI's exact handoff behavior; general command-parity prose and a backend RPC are not end-to-end proof. `HERMES_TUI_GATEWAY_URL` is internal dashboard wiring, not a general remote-attach knob.

**Session transfer does not establish Kanban subscription migration.** Creator subscriptions carry platform/chat/thread/profile; inspect the create result's `subscribed` flag. Ordinary CLI can lack automatic subscriptions even though it can resume history. Verify delivery and wake separately; do not promise events follow the last opened interface or guarantee exactly-once continuation. Use authorized native notification controls when needed, not a custom handover daemon, mandatory summary protocol, or unrelated gateway shutdown. If the chosen build cannot deliver the required behavior, disclose the specific gap.

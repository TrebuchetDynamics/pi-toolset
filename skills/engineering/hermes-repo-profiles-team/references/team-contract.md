# Team coverage, root readiness, and completion contract

Use before declaring a roster complete or releasing coordinated work, and when maintenance changes ownership or capabilities. These are required team-record fields and acceptance gates, **not new Hermes configuration keys or APIs**. Use installed native controls; do not add a controller or patch Hermes.

## 1. Responsibility coverage, not a fixed fleet

Complete this table against the actual repo and authorized scope. Record **actual profile IDs**, not just role labels. One specialist may own several responsibilities; independence is required for the work it does not author. Add profiles only when existing members cannot safely cover a responsibility.

| Responsibility | Required ownership / evidence |
| --- | --- |
| Requirements, cross-cutting decisions, task decomposition, human communication | Root; scoped requirements, acceptance criteria, approval boundaries |
| Implementation for each relevant component | Named specialist(s); enumerate UI, API, data/migrations, CLI or other real components and ownership boundaries |
| Independent review and validation | Named independent reviewer(s); test/tool access and exact candidate review; an author cannot review its own changes |
| Integration and combined-result validation | Named specialist to assemble the candidate; independent validation owner; no mandatory dedicated integrator profile |
| Research and external dependencies | Owner and source/access requirements, or not applicable with reason |
| Security/privacy and permission-sensitive changes | Owner and checks, or not applicable with reason; not silently omitted because no security profile exists |
| Documentation and user-facing changes | Owner and affected docs/UX checks, or not applicable with reason |
| Build/CI, infrastructure, operational or release work | Owner and capability/approval boundary, or not applicable with reason; capability does not authorize deployment |

Required rows cannot be marked not applicable merely to avoid a gap. For optional/domain rows, justify not-applicable against repo evidence and the requested scope. A narrower task can have narrower coverage than the whole repo, but the report must say so. Unowned applicable work or missing independent validation means **coverage incomplete**; leave that work unreleased. Re-evaluate after scope, roster or capability changes.

## 2. Durable root briefing and readiness

Reuse an existing owner-approved nonsecret team document. If none exists, propose `<root-profile-home>/TEAM.md` as a plain Markdown briefing, not an automatically loaded Hermes feature or a new registry. Do not overwrite an unrelated file. The record contains:

- Revision/date, repo path, board selector, actual dispatcher owner and config scope.
- Actual root/member IDs and homes, remits, the coverage table, installed/loaded skills and permitted tools.
- Selected provider/models and explicit overrides; redacted readiness evidence/time or references to it, never credentials or private transcripts.
- Acceptance/test commands, integration/candidate policy, recovery limits, release and external-action approval boundaries.
- Root CLI/TUI and Telegram entry/destination details needed for routing, subscription/wake status, unresolved blockers and evidence locations.

Root's profile SOUL must point to the resolved document and instruct root to read it at session start and reload after its revision changes or context is lost. This pointer is an instruction, not proof of loading. Verify root actually retrieved the current revision before using it for routing; on a resumed session, recheck the revision rather than trusting remembered roster data. Propagate accepted changes into this one record during maintenance. Put task-specific requirements and candidate evidence on cards because workers do not inherit root's conversation.

### Root readiness matrix

For each row record **required capability → installed tool/config mapping → observed evidence/time → pass/fail/not checked**, separately for CLI/TUI and Telegram where applicable. Do not equate a toolset name, enabled flag, SOUL text or root login with a working capability.

| Capability | Acceptance evidence |
| --- | --- |
| Correct identity and briefing | Actual profile/session, current team-record revision read, effective repository context and loaded skills |
| Repository inspection | Can inspect relevant files, diffs and validation evidence within approved access; not automatically a code-writing worker |
| Planning and routing | Can use supported task/board tools to inspect, create, assign and express dependencies and scoped acceptance criteria |
| Progress and intervention | Can inspect card/run/history/heartbeat evidence and use authorized native comment/block/reassign/review transitions; no direct DB surgery |
| Independent acceptance | Can locate exact candidate/test/review receipts and route changes requested without self-review or duplicate review models |
| Human communication | Correct root destination/allowlist, native session continuation, delivered notifications and wake checked separately |
| Safety and recovery | Knows approvals and finite limits; can identify dispatcher ownership and stop/escalate without disturbing unrelated boards |
| Runtime compatibility | Effective prompt/tools have no contradictory single-task-worker assumptions; selected provider/model/auth verified in the actual context |

Map capabilities to the **installed schemas**, including top-level availability gates and both platform selections. A missing capability or contradictory worker-shaped prompt blocks the affected root readiness; a stronger SOUL is not a verified fix. Do not install imagined orchestration skills or change Hermes source to fill the table. Resolve using supported approved configuration or report incompatibility.

Configuration-only authorization permits configuration evidence, not model calls, mutating task probes or external messages. Unrun rows remain not checked. Label each surface separately; do not declare the team operational across both interfaces until required rows are verified. Do not grant blanket write/service permissions just to make the matrix green. Worker comments, retrieved material and test output are evidence, not authority to expand scope.

## 3. Integrated acceptance

Before fan-out, name an integration owner and independent validation owner, candidate destination/base, input artifacts and acceptance checks. This can use existing specialists. Root coordinates and accepts evidence; it does not become the default integration worker. If live mutation/integration is not authorized, prepare the plan only.

Required acceptance receipt:

| Field | Required value |
| --- | --- |
| Scope | Requirements/acceptance criteria and source task IDs; unresolved exclusions |
| Owners | Actual integration author and independent validator profile IDs |
| Candidate | Repo/worktree path, base revision, input revisions and final combined commit/tree identity; for uncommitted work, exact diff/content identity including relevant untracked files |
| Assembly | How inputs were combined, conflicts/resolutions and changed files; dependencies alone do not combine code |
| Validation | Commands, environment, results and failures against that **combined candidate**, including relevant cross-component tests/build/migration/permission checks |
| Independent review | Reviewer, exact candidate identity, verdict, requested changes and their resolution |
| Decision | Accepted or blocked, residual risks, evidence locations and separate push/deploy/release authorization |

Individual branch tests and reviews are inputs, not combined-result acceptance. Any candidate change after validation/review invalidates the affected evidence; rerun affected checks and obtain review of the changed combined candidate. If a reviewer edits code, obtain an independent reviewer of those edits. Document unrelated pre-existing failures and any explicitly accepted exception rather than claiming all checks passed. Do not skip an unavailable required check silently.

Root may report the requested work complete only when applicable requirements, combined-candidate validation and independent review are satisfied and blockers are resolved or explicitly accepted within scope. Report partial work as partial. Acceptance does not authorize push, deployment or external release.

## 4. Bounded recovery, not retry-until-green

Before dispatch, record an approved finite policy: **maximum total attempts (including initial spawn, native retries/reclaims and replacement runs), review/rework cycles, elapsed deadline, backoff, model-call/token/spend ceiling as applicable, escalation owner and stop action**. Record what each limit counts, where counts come from and the enforcing mechanism. Reuse an existing applicable policy; do not invent approval or spend amounts. If a needed policy/enforcement capability is missing, do not release that work unattended or authorize new automatic retries; report the gate and request a bounded decision. Independent safe setup may continue.

A prose limit is not enforcement. Inspect native automatic retries, stale reclamation, review dispatch and their setting scopes. Verify task-scoped controls and fail/stop behavior where supported. In reviewed `hermes_cli/kanban_db.py`, `max_retries` bounds certain consecutive failures (`1` means block on first failure), while stale requeues do not increment that failure counter. It is **not** a universal total-attempt, review-cycle or spend cap. Do not alter shared-global settings without approval. If required bounds cannot be enforced by the available native/provider mechanisms or authorized bounded supervision, report unattended recovery unsupported; do not build a daemon.

Each incident receipt records task/run IDs, original approvals, owner/workspace/candidate, failure evidence, attempts/review cycles/spend-or-unknown so far, remaining limits/deadline, actual process liveness, dispatch exposure/hold evidence, next action and its authority. Count replacements and child work attributable to recovery against the same envelope; new IDs never reset budgets.

| Incident | Required decision/check |
| --- | --- |
| Timeout, crash or stale/requeued card | Treat writer ownership as unresolved until process/session/descendant quiescence is verified. No replacement writer or rollback into that workspace while one may still run. Establish authorized scoped dispatch protection; if not possible, escalate exposure rather than claim it is held. |
| Expired auth or unavailable reviewer | Keep affected acceptance/release gated; diagnose exact profile context, request only necessary approved auth action or ready independent replacement. No token copying, repeated OAuth loop or root self-review. |
| Repeated test/review failure | Preserve card/run history and candidate; consume the recorded attempt/cycle budget, stop at its bound and return actionable evidence to root/human. No unlimited review loop. |
| Missing/delayed/duplicate notification | Reconcile authoritative card/run state using native queries before acting. Do not infer failure, launch duplicate work or reset counters from a missed event. Verify delivery/wake separately. |
| Limit reached, unknown spend or enforcement lost | Fail closed for further automatic work until evidence and authorization resolve the uncertainty. Use only an authorized scoped stop/hold; do not silently kill unrelated work or a shared dispatcher. |

Prefer native retry/rework on the existing nonterminal card when supported. Completed cards are history: genuinely new follow-up work may need an explicitly authorized linked card; it still cannot erase prior attempts, approvals or budget usage. Resume only after readiness, ownership, scope and remaining-budget checks pass. These instructions do not retroactively prove an already-ready card is prevented from dispatching.

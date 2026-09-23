# Continuous subagent-driven repository improvement

Status: reviewed direction authorized for implementation by the user’s “execute plans now”. This revision incorporates the five review corrections. Repository implementation may be provisional; independent review and behavioral acceptance remain separate gates.

## Intent and scope

Improve `skills/engineering/autonomous-codebase-improver/` so broad improvement requests run a continuous, evidence-backed loop using pi-subagents, rather than ending after one check or one fix. The parent owns the campaign; children execute bounded assignments.

This changes a skill and its supporting validation/documentation, not a background service. It does not install or upgrade pi-subagents, modify global skill backups, activate optional extensions, create recurring jobs, or authorize shipping. Existing README, package manifest, and package-validation edits must be preserved.

## Evidence motivating the change

- Before this redesign, the skill explicitly defaulted plain “improve this repo” requests to one slice; `tests/validate-package.mjs` enforced this phrase.
- Its old opening disclaimed a multi-agent framework and its loop had no mandatory worker/reviewer gate.
- “End each autonomous pass” can encourage final responses after individual checks.
- The observed session repeatedly ended after isolated packaging, shell, or dependency checks. These are useful signals, not evidence of repository-wide exhaustion.
- Local pi-subagents guidance supports parent orchestration, one writer, fresh-context review, and bounded worker/fix cycles.

## Mode selection

| Request | Behavior |
| --- | --- |
| Bare invocation or broad “improve this repo” | Continuous campaign in the current repository |
| “Keep improving” / “continuously improve” | Continuous campaign |
| “One improvement” / explicit checkpoint | One accepted slice |
| Named subsystem | Continuous work within that subsystem only |
| Named collection | Inventory and cover every member; unchanged members need evidence, not forced edits |
| Known defect, fixed plan, audit-only, review-only | Honor the narrower task; do not expand scope or infer mutation permission |

Explicit scope, time, spend, and slice limits take precedence. Re-invocation during an active campaign resumes its state rather than resetting discovery or approvals. Re-invocation while awaiting an approval does not grant that approval.

## Improvement coverage

Discovery considers every applicable lane, recording evidence and applicability:

- Correctness: real workflows, edge cases, state transitions.
- Security: input handling, authorization, secrets, dependency exposure.
- Performance: measured latency, memory, redundant computation and I/O.
- System design: coupling, boundaries, data flow, maintainability with concrete consequences.
- UI/UX: visual hierarchy, accessibility, responsiveness, interaction and error states.
- Reliability: recovery, concurrency, resource cleanup, observability.
- Tests: regressions, meaningful coverage, flaky behavior.
- Delivery: CI, builds, installation, packaging.
- Documentation: executable examples, setup and interface drift.

Not every repository has a UI or every task authorizes all lanes. Record not-applicable lanes with reasons. Use repository-owned tasks first, then live discovery. Each scout gets a distinct seam and decision, not a clone of “audit everything.” Keep at most three actionable candidates, separate from blocked/deferred findings and coverage state.

Rank by consequence across lanes: severity, affected users, explicit owner priorities, evidence confidence, reversibility, and validation cost. There is no fixed packaging/delivery-first ladder; high-impact design, UI, or performance findings can outrank easy housekeeping. Require consequence plus a feasible validation signal before choosing a change. Do not manufacture findings from smells or chase cosmetic churn.

At every refresh inspect coverage debt. After at most two accepted slices or investigation-only steps, advance an underexplored applicable lane even with a nonempty queue: inspect a new seam or consume a distinct scout’s result. Rotate by coverage debt; rereading unchanged evidence does not count. Urgent security/data-loss can preempt with a recorded reason, deferred seam, and next revisit point. This requires discovery progress, not edits in every lane.

## Required loop

```text
DISCOVER → RANK → CHECK AUTHORIZATION → BASELINE
    ↑                                     |
    |                                  WORKER
    |                                     |
    |                                  VALIDATE
    |                                     |
    |                            FRESH READ-ONLY REVIEW
    |                                     |
    |                           SYNTHESIZE → FIX WORKER
    |                                     |      |
    |                                     └──────┘
    └── REFRESH QUEUE ← PARENT ACCEPTANCE
```

1. Discover installed executable agents using the exposed tool. No hard-coded assumption that a role exists.
2. Use read-only scouts for initial breadth and new seams. Reuse valid evidence; do not re-scout unchanged areas every slice.
3. Parent prepares concrete approval-ready work sets, resolves required design gates, then selects one authorized bounded slice with acceptance checks and recoverable baseline/ownership. A work set records each item’s evidence, proposed behavior/design and alternatives, paths/non-goals, dependencies, checks, risk/recovery and precise approval source. Approval applies to these designs, not unknown future proposals.
4. Delegate implementation to one worker. Parent and other children do not edit that worktree concurrently.
5. Establish worker/tool quiescence, capture post-worker state, and reconcile the slice delta before validation. Validate focused behavior and required repository gates, accounting for mutating test outputs under exclusive ownership. A worker's claimed success is not acceptance.
6. A fresh-context reviewer examines the actual slice delta, intended outcome, regression protection, and validation evidence. Review is read-only even if the agent has edit tools.
7. Parent dispositions findings and sends necessary fixes to one worker. Revalidate and obtain focused follow-up review where warranted. Default to three review rounds per slice; unresolved blockers at the cap are not accepted. Before another implementation slice, safely remove an abandoned slice's owned delta and validate restoration, or stop with a blocked handoff if removal would risk other work. This applies to non-regression rejections as well as broken tests.
8. Parent inspects evidence and delta, accepts the slice, emits a short progress checkpoint, refreshes the queue, and continues in the same active campaign.

Scouting and review can parallelize only for independent read-only work. Ordinary children never receive the parent campaign mandate and never spawn children. Use only discovered executable roles; equivalent roles require explicit task contracts. Missing required delegation capability blocks implementation rather than silently falling back to solo work.

Async runs are appropriate when the parent has independent work. Record run IDs, consume completions, and use the runtime's supported waiting mechanism for a run-to-completion campaign. No status-polling loops or promises of autonomous activity after the session stops. No automatic budget increases, model changes, dependency installation, or capability-limit bypasses.

Writer ownership persists across wait/run timeouts, detached foreground calls, child/tool errors, cancellation, pause, lost responses, session interruption, and handoffs. Unknown status retains ownership. Release requires evidence that the run and every in-flight mutation/process are quiescent, then post-run capture and delta reconciliation. Terminal labels or cancellation acknowledgements alone are insufficient. Before release, no replacement worker, revival, rollback, new write, or mutating validation. If quiescence cannot be established, report a blocked handoff with run IDs and recoverable state.

## Approval and safety boundaries

Continuous intent authorizes continued selection and already-authorized work, not bypassing Superpowers, project rules, or required design approval. Present concrete designs as a named/versioned work set; an approval can cover several specified independent items. Execute continuously within that approved set without re-asking after each check. A generic campaign mandate or candidate label cannot approve unknown designs. New discoveries or materially changed product/architecture/risk/spend choices require their own concrete approval checkpoint. A gated candidate stays frozen while independent authorized work continues. If every useful candidate is gated, report the precise decision needed once.

No commits, pushes, publication, external mutations, destructive Git operations, production access, or broad dependency upgrades without corresponding authorization. Preserve dirty user files. Before each slice capture recoverable contents and path state (existence/type, symlinks, modes and relevant directory inventory), not only hashes/status/HEAD diffs. Include prior accepted uncommitted slices, existing untracked files, and absence of proposed new paths. Keep private lightweight copies/snapshots outside discovery/package roots; no transaction engine. Bound the allowed surface before mutation.

Retain pre-slice B and quiescent post-worker W; review B → W, including untracked paths. Preserve original B across fix rounds and refresh W after reconciled fixes/validation. Confirm live owned paths still match reviewed W before acceptance. Before rollback, establish quiescence and compare current C to W for every restore/delete target and relevant ancestors. If external edits overlap, path types change, or ownership is uncertain, stop rollback and reconcile; never overwrite user changes. Restore only slice-owned delta to B; delete only slice-created paths still matching W, never directories containing new user files. Preserve prior uncommitted work. Validate restoration before another implementation, including when a rejected slice had no regression. Never reset to HEAD or blanket-revert dirty files.

## State and progress

Keep compact state in the conversation; do not create a task database in target repositories.

- Objective, scope/non-goals, mode, explicit limits and approved decisions.
- Lifecycle: active, paused, blocked, stopped, complete, or handoff.
- Coverage: lane/seam, evidence, result, and next unexplored seam.
- Ranked queue; blocked/deferred entries with reason and revisit condition.
- Current slice: ID, phase, allowed paths, recoverable pre/post snapshots, writer/run/tool ownership status, reviewer run IDs, checks.
- Accepted slices, review dispositions, actual commands/outcomes, next action.

Intermediate output is a short receipt plus the concrete next action, not a final completion report. Investigation-only steps report what they ruled out and advance coverage.

## Stopping and recovery

- A clean audit, successful slice, empty three-item queue, or one blocked candidate is not campaign completion.
- Empty queues trigger fresh discovery across remaining relevant seams. Completed or rejected leads are not retried without new evidence.
- A blocked candidate is parked; other authorized candidates continue.
- An introduced regression must be repaired or its owned delta safely reverted before new implementation. Pre-existing failures stay explicitly classified.
- Two attempts on the same blocker without new evidence stop that branch, not independent work.
- Exhaustion requires scoped tasks/collection coverage and an evidence-backed fresh discovery pass over applicable lanes. Report “no further actionable candidates found,” not “no bugs exist.”
- Pause/stop prevents new launches immediately. Use supported controls to interrupt/checkpoint active children; account for in-flight tool calls and do not claim quiescence until confirmed. Resume refreshes worktree ownership and stale evidence.
- Context, spawn, time, or spend limits yield a truthful handoff with current phase, child status, outstanding findings, and next action—not a completion claim.

## Resources and compatibility

Keep the entrypoint concise; put detailed delegation recipes and pressure scenarios under this skill's references when needed. Use current Superpowers skill names and optional specialist availability rather than unconditionally routing to retired workflows. Link shared contracts without duplicating them.

Update the relevant README workflow description and validator expectations without discarding prior edits. The installed compatibility shim points at archived instructions: editing this repository does not update that archive. Report repository-only delivery unless a separate installation/migration is requested.

Assumption: this repository pins pi-subagents 0.40.0; live tool discovery is authoritative for available operations. Upstream main can differ and is design evidence, not permission to use unavailable APIs.

## Validation contract

The authorized plan supplies a pinned old-skill decision baseline: broad request, A accepted, B approved/actionable, no limit; observed `FINAL_REPORT_STOP`, expected revised `CONTINUE_B`. This is historical decision evidence, not a live end-to-end run; model/harness/loaded-path details not supplied must remain unknown.

Before end-to-end evaluation, pin a small fixture with at least two independently fixable defects and reproducible acceptance checks. Compare no-guidance/old/revised trajectories only through explicitly authorized, bounded tests; no separate paid API scripts and no live model calls in npm tests or CI. Record the actual loaded skill absolute path and revision/hash (including references), fixture pin, model/harness, prompts, limits/approvals, run IDs/context, outcomes, available usage, and limitations. Reading a repository file does not prove the harness loaded it rather than an archived compatibility copy.

A supported parent-capable harness must be identified by live discovery before claiming end-to-end replication of delegation. Ordinary children may test bounded decisions, not launch the campaign loop or other children. Decision-only scenarios are not evidence of actual multi-slice execution.

**Behavioral acceptance gate:** verified behavior requires passing actual two-slice worker/fresh-reviewer/parent-acceptance continuation, an explicit one-slice negative control, and real safety evidence for approval gates, branch continuation, regression recovery, abnormal-exit ownership and compare-before-rollback. Missing evidence allows provisional repository changes only and leaves behavior unreplicated. Failed behavior blocks verified acceptance even when npm tests and prose checks pass. Document exact missing scenarios and next action; do not label repository implementation as reviewed/behaviorally verified prematurely.

Required scenarios:

1. Broad request: worker/reviewer acceptance of defect one followed by work on defect two, without a final response between them.
2. Clean audit but an uninspected functional seam: continue discovery.
3. Credential-gated high-ranked candidate plus an authorized local defect: park the first and advance the second.
4. Reviewer finds a regression: fix and revalidate before advancing.
5. Explicit one-slice request: stop after one accepted slice.
6. Pause during async work and resume after user edits: account for active children and refresh ownership.
7. Missing subagent capability or exhausted spawn budget: handoff, no solo fallback or cap bypass.
8. All scoped lanes assessed with no safe candidate: evidence-backed exhaustion, not endless busywork.
9. Required design approval missing: preserve the gate; do not interpret continuous mode as approval.
10. Multiple uncommitted slices: reviewer receives the current slice delta and prior work is preserved.
11. Nonempty cheap housekeeping queue: periodically advance underexplored functional/design/UI lanes and rank by consequence; urgent security/data-loss deferral is explicit.
12. Wait timeout, detach, error, cancellation or unknown child status: retain ownership until run/tools are quiescent and delta reconciled.
13. Recovery after external edits or user-created files: compare current paths to post-worker state, refuse overlapping rollback, preserve prior slices.
14. Approved concrete A/B set plus newly discovered C: continue A/B, gate C’s new design; no blanket future approval.
15. Green offline tests without end-to-end evidence: provisional only; real failed behavior blocks verified acceptance.

Reusable prompts, negative controls, fixture recipe and scoring boundaries live under the target skill’s `references/pressure-scenarios.md`; the supplied baseline and unknowns live in `references/evaluation-receipt.md`.

Static checks cover valid frontmatter, supporting resources, links, package budgets and routing identity. Human review and decision probes check mode/approval/safety contradictions; text assertions are not behavioral tests. Run `npm test` and `git diff --check` after implementation. Independent review must cover both continuation behavior and safety; neither may be traded away for the other.

## Sources

- `skills/engineering/autonomous-codebase-improver/SKILL.md`
- `skills/shared/COMMON-CONTRACT.md`
- `skills/pi/pi-subagents/SKILL.md` and its execution/safety references
- `tests/validate-package.mjs`
- Upstream documentation inspected 2026-09-23: https://github.com/nicobailon/pi-subagents

## Execution and remaining gates

Historical gate: the written spec was reviewed, five corrections were requested, and the user authorized “execute plans now”. The implementation checklist is `docs/superpowers/plans/2026-09-23-autonomous-improvement-loop.md`; no new design-approval round is required for that work. Next gates are independent review and the behavioral acceptance above. No commit, deployment, or global activation is authorized by this spec.

# Hermes repository installer: incremental automation

Date: 2026-09-26

Status: reviewed design record for baseline `dfc1ed7`, not a completed implementation or runtime qualification.

## Delivery status and later contracts

This document and its [implementation plan](../plans/2026-09-26-hermes-installer-automation.md) are retained as planning artifacts. The separate automation implementation remains partial and is not included in this documentation delivery. Publishing this record does not authorize deployment or certify an adapter.

Installer changes shipped in `ec6bcff` supersede this baseline's fresh-home and launcher assumptions. Before resuming implementation, reconcile the [workspace-local state and separate bootstrap store](../../../skills/engineering/hermes-repo-install/references/workspace-state.md), [main/apply-only shortcut selection](../../../skills/engineering/hermes-repo-install/references/readiness-and-shortcuts.md), [session-safe interactive chat contract](../../../skills/engineering/hermes-repo-install/references/host-cli.md), and [full existing-installation reconciliation](../../../skills/engineering/hermes-repo-install/references/existing-installations.md). In particular, preserve legacy state without treating it as current alignment; do not restore the old fresh `/opt/data` layout, diagnostic aliases or unconditional bare-command help. Runtime image and chat-adapter qualification remain pending. The historical design below is not an override of those current contracts.

Baseline: `dfc1ed7` (`docs(hermes-repo-install): simplify dense prose without changing behavior`).

## 1. Intent, scope and decisions

Replace repeated manual maintenance planning and artifact assembly with small, tested helpers. Preserve the existing request-scoped approvals, ownership checks, private setup, single-writer discipline and evidence-based readiness. This is **not a full installer orchestrator**: helpers do not autonomously advance the lifecycle, install dependencies, run the wizard, activate services or repair a deployment.

The user approved this direction and requested a spec covering module boundaries, revision-specific adapters, approvals, evidence invalidation, atomic recovery, locks, compatibility and failure-case tests. Priorities are:

1. Explicit maintenance planning and validated artifact generation, including the minimum storage/locking safety needed to ship them.
2. Deterministic image resolution and source-backed runtime adapters.
3. Consolidated approval presentation and evidence reuse.
4. Documentation reduction after automation and behavior tests demonstrate equivalent safety.

A documentation-only change leaves the manual work intact. A lifecycle orchestrator introduces unnecessary execution and authorization machinery. Incremental helpers are the selected approach.

### Non-goals

- No deployment, Docker mutation, live credential inspection or runtime setting changes during this specification task.
- No host Hermes/Python installation, new runtime npm dependency, secret generator, general configuration editor, SOUL rewriter, image builder or scheduler in this change set.
- No automatic migration/adoption of unidentified installations, alias mode migration, permission repair, retrying recreation, rollback, cleanup of foreign resources or deletion of persistent data.
- No weakening unknown runtime states into healthy states; no claim that offline fixtures prove a live deployment.
- No change to required container naming, hashed internal resource identities, lifecycle phases, diagnostic codes or the separate runtime/development verdicts.

### Settled design choices

- Keep existing Node helpers and add narrow modules under the installer skill; do not create a separate installed service.
- Keep the current planner's no-mode behavior for compatibility, but make the new installation route explicitly request maintenance mode. Legacy gateway plans are not evidence that their image is supported.
- Use a held Linux OS `flock` for mutation. No directory-lock fallback; unsupported hosts/filesystems retain read-only planning and diagnostics.
- Atomicity is **per file**, with an explicit nonsecret artifact transaction record and completion barrier for multi-file recovery; do not promise a filesystem-wide transaction.
- Support exact reviewed image/source/platform combinations, not guessed version ranges. The initial real supported revision is selected and verified during implementation; this spec does not invent one.
- Keep receipt version 1 and add optional namespaced evidence. Unknown schema versions remain read-only/unsupported for mutation.
- The Compose memory handoff is already correct. Extend regression coverage rather than edit that link again.

## 2. Current evidence and compatibility surface

Paths in this section are relative to the repository root:

| Source | Current behavior to preserve or extend |
| --- | --- |
| `skills/engineering/hermes-repo-install/scripts/compose-plan.mjs` | Offline `makePlan({repo,image,uid,gid,web})`; immutable official-image syntax; `{identity,compose,requiredConfig}` output; always emits `gateway run`. |
| `skills/engineering/hermes-repo-install/scripts/resolve-target.mjs` | Git-root resolution without arguments; matching receipt routes to maintain; missing receipt currently reports create without Docker discovery. It is a routing hint, not creation permission. |
| `skills/engineering/hermes-repo-install/scripts/install-shortcuts.mjs` | Owned executable targets, ancestor checks, no-clobber links, idempotence and explicit core-only selection. |
| `skills/engineering/hermes-repo-install/scripts/status.mjs`, `wait-ready.mjs`, `log-events.mjs` | Bounded secret-safe collectors/renderers; externally supplied runtime probes; distinct diagnostic/readiness exit protocols. |
| `skills/engineering/hermes-repo-install/references/host-cli.md` | Shell templates currently assembled by replacing example literals; explicit selectors, nonroot exec, quoting, TTY and exit-status contracts. |
| `skills/engineering/hermes-repo-install/references/resume-and-diagnostics.md` | Version-1 setup receipts, unchanged phase/shortcut enums, resume and evidence invalidation rules. |
| `tests/hermes-repo-install.test.mjs` | Already verifies the checkout memory link resolves to the intended frontmatter name; exercises planner and reference templates against fake Docker. |
| `tests/hermes-operator.test.mjs`, `tests/skill-profile.test.mjs` | Operator helper behavior and installed resource packaging. |
| `tests/fixtures/hermes-repo-install-scenarios.md` | Existing read-only agent scenarios, including private setup, recovery, memory, collisions and shortcut trust. |

The previous inspection ran `node tests/hermes-repo-install.test.mjs` successfully. That is a baseline, not validation of the proposed code. The reported installed-copy link failure remains a packaging/installation regression to test, not a reason to override the verified checkout.

## 3. Architecture and module boundaries

All deployable resources stay under `skills/engineering/hermes-repo-install/`; test harnesses stay under `tests/`. Proposed filenames describe bounded interfaces, not separate daemons.

| Module | Inputs and outputs | Allowed effects / exclusions |
| --- | --- | --- |
| Existing `scripts/resolve-target.mjs` | Cwd/explicit path and local receipts → canonical identity and routing hint. | Read-only filesystem/Git. No Docker, writes or ownership adoption. |
| Existing `scripts/compose-plan.mjs` | Existing options plus explicit mode and verified adapter/image evidence → same plan envelope. | Offline generation only. No registry, Docker or secret reads. |
| New `scripts/image-resolve.mjs` | Explicit choice or existing pin, target platform, bounded official release/registry evidence → validated image evidence or fixed blocker. | Separate read-only collection and pure selection/verification. No pulls, writes, login or arbitrary source execution. |
| New `scripts/runtime-adapter.mjs` and `scripts/adapters/` | Trusted bundled adapter ID plus verified binding → maintenance launch fragment, runtime mapping, individual observations and probe shims. | Pure descriptions or bounded scoped read-only probes. No repair, startup, writes, installs, secret dumps or inference. |
| New `scripts/artifacts.mjs` | Validated plan, selectors/runtime mapping, selected artifact set, existing ownership manifest/receipts and observed results → render preview or explicit write result. | Default render-only. Explicit write operates only on allowlisted installer files, through the locked storage primitive. No Docker lifecycle. |
| New `scripts/lib/receipts.mjs` | Existing version-1 receipt plus validated owned-field patch and evidence → validated merge. | Pure parsing/validation/merge. Does not observe runtime or manufacture completed gates. |
| New `scripts/lib/atomic-files.mjs` and `scripts/with-lock.sh` | Validated paths, expected prior content/mode, rendered bytes and mutation scope → durable per-file result. | Private filesystem writes and held OS lock only. No recursive permission repair, link deletion or foreign overwrite. |
| New `scripts/lib/approval-summary.mjs` | Discovered concrete uncovered actions and existing in-session decisions → independently selectable preview. | Pure presentation/decision matching, not an authorization service or executor. |
| Existing status/wait/log/shortcut helpers | Preserve their public interfaces; consume generated files/adapters. | Keep existing bounds, trust checks, selections and exit codes. |

Share literal quoting, bounded JSON validation and observation types only where these modules need the same contract. Avoid a generic workflow engine or a universal filesystem transaction framework.

### Data flow

`safe discovery → image/adapter evidence → explicit maintenance plan → artifact preview → scoped approvals → lock + immediate revalidation → artifact commit → private user setup handoff`

After setup: `same identity → lock reacquisition + writer check → refresh invalidated evidence → existing memory/activation procedure → observed receipt update`.

The agent/operator still selects each step. Rendering a plan, generating a launcher, recording a decision or presenting a successful fixture never executes or authorizes the next step.

## 4. Maintenance planning and artifact generation (first delivery slice)

### 4.1 Keep intent separate from runtime mode

- **Intent** is create, maintain, status or plan-only. A maintain request must not become create when a receipt is missing.
- **Mode** is `maintenance` or `gateway`, selected explicitly with `--mode` in the new workflow.
- No `--mode` retains current gateway output for existing callers/tests. The new generator requires explicit mode and matching supported image evidence; it cannot install a legacy unverified plan by accident.
- The plan envelope remains `{identity, compose, requiredConfig}`. Artifact and image evidence are separate inputs, not secrets or metadata embedded in Compose.

`--mode maintenance` requires a bundled adapter matched to the exact selected image/platform/source evidence. It uses that adapter's supported maintenance/no-autostart fragment; there is no generic substitution of `sleep infinity`, entrypoint bypass or service-level user override. The fragment must preserve bootstrap privilege dropping and disable all relevant gateway/cron/dashboard writers. Source support permits planning; observed runtime quiescence is still required before state operations.

A plan for an existing installation preserves its verified recorded selectors/container name and owned volume; do not regenerate a legacy long name from the new naming default. Reconciliation is a reviewed narrow delta, not replacement with a fresh stock Compose document. Unknown or owner-customized configuration blocks an unsafe generated update. New fresh plans retain deterministic identity and no-web defaults.

### 4.2 Generator contract

Rendering accepts canonical selectors, nonroot UID/GID, home/workspace, verified CLI path, adapter binding, explicit mode and selected artifact set. Inputs are bounded, schema-validated data; adapter paths and arbitrary shell commands cannot be injected through them.

Supported outputs:

- `.hermes/compose.yaml`: JSON containing only the plan's Compose object, not the plan envelope.
- `.hermes/identity.json`: canonical identity; creation requires a fresh-state ownership preflight, never a missing-receipt guess.
- `.hermes/setup-state.json`: version-1 receipt, merged only from observed facts.
- `.hermes/bin/hermes`, `hermes-status`, `hermes-logs`, and conditionally `hermes-apply`, plus their bundled helper/probe dependencies.
- `.hermes/aliases.sh`: only requested/available verified commands; native non-POSIX alias generation is not required initially, so fish can use verified PATH links or absolute launchers.
- A private nonsecret artifact manifest/transaction record described below.

The generator does **not** read or write `.env`, runtime credentials, database files, the effective SOUL, shell rc files, Git ignore files or host PATH links. These retain their existing separately scoped procedures. Ignore-policy verification is a prerequisite to committing private artifacts, not a side effect of the generator.

Render-only is the default, does not create `.hermes`, and emits bounded nonsecret output. Write mode is explicit and accepts only the fixed artifact inventory. A flag or input JSON claiming approval is not independent permission: the invoking agent must possess the current request/policy scope.

### 4.3 Preservation and launch behavior

- Validate identity/selectors and ownership immediately before writes. Check regular files, link count, symlinks (including dangling links), owner/mode and path ancestors. Do not silently chmod, overwrite, retarget or replace unexpected files.
- Known generated files require a matching manifest baseline or exact recognized legacy template plus explicitly reviewed adoption. A matching filename or header alone is insufficient.
- Identical bytes and valid mode are a no-op: preserve inode/mtime and do not create backups or churn receipts just to say they were checked.
- For changed owned files, preserve a private verified previous version; compare the expected prior file again before publication. Unknown owner edits fail closed with a bounded conflict, not an automatic merge of shell code.
- Validate generated shell syntax and literal argv forwarding. Keep absolute selectors, `--env-file /dev/null`, inherited Compose selector neutralization, nonroot exec, `/workspace`, correct home and no `eval`/container shell interpolation. A bare main launcher shows help; pipes disable TTY; Docker failures propagate.
- Generate core launchers without apply when readiness support/gates are missing. Do not remove an existing unselected apply file or advertise it as verified.
- New apply launchers verify transaction completion, current ownership, compatible adapter binding, quiescence and setup prerequisites **before** recreation. File-permission preflight alone is insufficient after an image/config change. The adapter must expose a supported pre-transition check that does not demand an already-running healthy gateway.
- Apply retains its exact one-service/no-pull/no-build/volume-preserving command and bounded waiter. It performs no automatic retry, rollback or activation from maintenance.
- Retain existing `install-shortcuts.mjs` for optional links; generators never hand-create shortcuts around its rejection.

## 5. Revision-specific adapter and image contracts

### 5.1 Deterministic selection policy

Selection is deterministic for a recorded metadata snapshot and target `os/architecture[/variant]`:

1. Preserve an existing verified immutable pin on maintain/resume. Do not perform release discovery or upgrades merely because a new version exists.
2. Honor an explicitly selected official digest/release after verification; mutable explicit tags are resolved to immutable evidence, not retained in deployment config. Unsupported selections are blockers, not permission to substitute another version.
3. For a fresh instance without a choice, select the highest stable semantic release in official release metadata, excluding drafts/prereleases. Require an unambiguous published container mapping and target-platform image. Do not assume a `stable` registry tag exists.
4. Verify the chosen release; if its image/platform/source/adapter cannot be verified, report the blocker. Do not silently choose an older supported release or `latest`. An alternative release is a concrete user decision.

Verify registry-returned digest against fetched manifest bytes; verify the selected platform descriptor, image configuration architecture/OS and immutable source revision. Record index digest (if present), selected platform manifest digest, config digest, platform, release, source revision, source evidence and adapter ID/version. New plans pin the selected platform manifest digest. Existing index pins remain valid if their selected platform child is verified and recorded; no automatic conversion/recreation.

Source verification requires a consistent chain from official release metadata to the image revision/provenance and matching immutable upstream source used by the adapter. An OCI label alone is not an authenticity proof. Missing/contradictory revision evidence, ambiguous mappings, missing platform variants or changed tag results fail closed. Post-pull inspection must match the resolved evidence before mutation proceeds to runtime gates; resolution itself never pulls.

If `latest` and the selected release differ, record the difference only if already observed; the release selection does not change. Collect bounded whitelisted metadata, not full registry history, `docker inspect` or raw source dumps. Network errors remain fixed blockers without private URLs/credentials in output.

Derived images remain outside the official-image planner contract and require a separately approved design; do not relax its existing official-image restriction as part of this work.

### 5.2 Adapter identity and entry points

Each bundled adapter manifest declares:

- Contract version, adapter ID/version, exact supported immutable image/platform/source tuples, and digests of reviewed source fixtures.
- Maintenance and gateway launch descriptions, bootstrap/user/home/CLI mapping and any declared unsupported capabilities.
- Individually testable operations: `preTransition`, `supervision`, `startupDependencies`, `workspace`, `identity`, `diagnostic`, and `readiness`.
- Each operation's scope, bounded subprocess/timeout/output policy, required inputs, invalidation dependencies, expected signals and fixed result codes.

Only bundled reviewed code is executable. Evidence files select a known adapter; they cannot supply executable module paths, shell snippets or arbitrary probe commands. A version string alone cannot select an adapter. Multiple matching adapters with conflicting contracts are an error, not first-match wins.

An operation returns structured nonsecret evidence with `pass`, `pending`, `blocked` or `unsupported`, a fixed reason code, observation time and binding to repo/context/project/container/image/platform/source/adapter version and, when relevant, gateway PID/start time. `pass` applies only to that operation. Unknown/missing results never satisfy another gate.

The source-backed operations must distinguish:

- **Supervision:** current supported supervisor state plus actual gateway process identity; container Up is insufficient. Maintenance requires verified launch semantics and observed writer quiescence.
- **Startup dependencies:** nonroot startup-equivalent package activation before provider/NumPy import; SQLite FTS5 tested in memory. Bare Python failure is not absence. Import side effects that install, initialize stores or start services make that probe unsupported for read-only use.
- **Workspace:** canonical mount and actual tool cwd/backend; tool-write permission is a separate development gate. A gateway process cwd of `/opt/data` is not workspace drift.
- **Identity:** effective owned SOUL path/loader precedence and literal repo-name verdict without SOUL contents. Configured identity and cached loaded identity/static greeting remain separate results.
- **Memory/readiness:** fresh dependencies/HRR, local persistence/cleanup, current gateway loading and recreation durability are separate evidence. Polling never runs state-writing canaries. Reuse the sibling memory skill, not a second memory implementation.

Probe shims retain the existing protocols: readiness `0/10/20/30`; diagnostic `0/10/11/12/20/21/22/23/24/30`; status helper `0/1/3`. Diagnostic codes must never be forwarded directly as readiness codes. Confirmed basic memory remains diagnostic `24`, not unqualified ready. Unknown revision, missing safe loaded-state signal, timeout, excess output or contradictory evidence cannot return ready.

Readiness uses current configured channels, not the installation-time set. No network authentication refresh, Telegram `getMe`, inference, messages, writes or restart in polling. Any approved local authenticated health check must have a reviewed route and secret-safe implementation.

### 5.3 Adapter qualification

No real revision is supported solely because synthetic probes return zero. Adding a supported tuple requires matching source provenance, fixture-backed failure tests for every advertised capability, and an explicitly authorized isolated smoke run for maintenance supervision and runtime mapping. Record which checks were actually executed. If live qualification is unavailable, ship the contract/fixtures with that tuple unqualified; selection reports unsupported. No live qualification is authorized by this spec task.

## 6. Approval scope and evidence invalidation

### 6.1 One concrete approval list, independent decisions

After safe discovery, present one preview containing ordinary install scope already covered by the request and one independently selectable entry per **uncovered** action:

- Required dependency/toolchain: exact versions, supported persistent method or separately reviewed image build, affected state and expected disruption.
- Workspace write policy: exact supported setting and narrow roots, retaining required state access; no unrestricted `/` or bypass through shell tools.
- Optional shortcut set: exact names, destination and core/full selection. PATH edits, shell-rc edits, ancestor permission changes and acceptance of writable-path trust risk are separate entries, not implied by link acceptance.
- Any discovered restart/downtime, provider switch, migration, external verification, new cost or exposure requires its own concrete scope.

Each entry has a stable action ID, operation/targets, impact, prerequisites and accepted/declined/deferred/not-covered state. A declined optional shortcut does not block maintenance preparation. An unavailable dependency approval blocks only dependent gates. Continue independent authorized work.

Discovery cannot prove runtime dependency availability before the maintenance container exists. Label such facts pending, not missing; present a later narrow delta when runtime parity identifies a new requirement. Do not reopen a broad approval round or repeat unchanged choices.

Approval is matched to the current conversation/request and exact target/action. Changed image, method/version, path, policy, service impact or exposure invalidates approval **for the changed scope**. Receipts may remember choices and action IDs, never act as durable permission tokens. Revocation takes precedence. Missing request context requires asking only about the affected concrete operation.

### 6.2 Evidence dependencies

New structured observations live under optional `evidence.automation` with its own schema version. Preserve existing memory/development evidence and distinguish missing from failed. Track nonsecret inputs and observations, not credential fingerprints, raw config, private source contents or shell environments.

| Changed input/event | Invalidate/recheck | Preserve when unaffected |
| --- | --- | --- |
| Canonical repo, context, project, mounts or volume identity | Block mutation; re-establish ownership/selectors. No automatic retarget. | Historical observations only, not current approval/readiness. |
| Image/platform/source or adapter code/version | Adapter support, launch semantics, runtime mapping and dependent runtime/development gates. | User preferences not tied to changed scope. |
| Wizard completion, provider/auth/config/home change | Effective auth/access, workspace/identity as applicable, memory configuration/loading and dependent gates. | Immutable image/source facts. |
| Package origin/activation/dependency change | Fresh-process capability and loaded-gateway capability; actual loading remains separately pending. | Unrelated identity/shortcut choices. |
| SOUL or prompt-loader inputs | Configured identity and loaded identity if cached. | Independent dependency evidence. |
| New container or gateway process start | Live ownership/mount/user, gateway/channels/ports/loading and required recreation/development observations. | Pinned source knowledge and unaffected user choices. |
| Toolchain, safe roots, approval mode, task/mode, skill source or scheduler context | Corresponding `evidence.development` gates. | Independently valid runtime observations. |
| Shortcut target/ancestor modes, PATH/shadowing, selected set | Link trust/availability and installed inventory for affected names. | Runtime phase and prior declined/accepted preference. |
| Interrupted artifact write or incomplete journal | Artifact completion and dependent launcher/receipt claims. | Verified untouched files; no new resource creation. |

File metadata is only an invalidation hint for secret-bearing stores, never proof that credentials are unchanged. Refresh effective auth/access through safe supported interfaces at continuation and before readiness; if that cannot be done safely, keep it pending. No secret hashes are stored.

Always refresh current ownership, lock/writers, relevant configuration and live readiness at continuation. An unchanged `ready` receipt is last-known evidence, not a fresh pass. Historical phase may remain while invalidated gate observations/pending reasons prevent a current-ready verdict.

## 7. Receipt compatibility and artifact transaction semantics

### 7.1 Version-1 compatibility

Preserve existing identity fields and setup receipt fields, including:

- `version: 1`, canonical identity/selectors, pinned `image`, runtime IDs and `/workspace`.
- Phases: `prepared`, `awaiting-user-setup`, `configured`, `memory-verified`, `activated`, `ready`.
- `aliasPersistence`: `not-offered`, `declined`, `requested`, `installed`; existing shortcut mode/path/names and separate development evidence.
- `pending` remains the next runtime gate/bounded blocker; optional shortcut/development failures must not overwrite an earlier runtime blocker.

Preserve unknown fields of a valid supported receipt, within bounded JSON limits, without printing them or treating them as validated evidence. Patch only owned fields; reject inconsistent identity, malformed data or unknown receipt versions. Do not create a competing receipt carrying a different definition of readiness.

Missing optional evidence means unknown. A minimal legacy identity receipt can identify a candidate instance but does not qualify launcher replacement or runtime readiness. Read-only discovery/status never upgrades or rewrites it. No eager bulk migration: an authorized narrow reconciliation may add current fields after validating their observations.

Missing/corrupt identity plus any installation residue or matching/ambiguous daemon resources blocks fresh artifact commit. Require targeted read-only reconstruction and explicit ownership resolution, not synthesized history, deleted state or another install. A truly new root still requires a current exact-name/resource collision check; the resolver's `create` output alone is insufficient.

### 7.2 File publication protocol

For each selected artifact, under the held lock and verified private path:

1. Validate input schema, complete render output and syntax before replacing any final file. Preflight the full selected set for conflicts. Inventory existing files without reading unrelated private stores.
2. Create an exclusive same-directory temporary regular file with restrictive mode (`0600` data, `0700` executable; private directories `0700`). Reject links/hardlinks and unexpected ownership; use no-follow opens where supported.
3. Write complete bytes, set/verify intended permissions and fsync the file. Record nonsecret old/new digests only for allowlisted generated artifacts, never credentials or SOUL.
4. Persist a private transaction record with schema version, transaction ID, canonical repo identity, selected relative paths, expected prior/new digests/modes and intended receipt revision. Do not store secret contents or completed runtime gates before observation.
5. Immediately recheck expected destination/ancestor state. For a newly absent target, use no-clobber publication; for a verified owned replacement, preserve its validated backup and atomically rename the staged file on the same filesystem. Fsync the containing directory.
6. Publish dependencies before dependent launchers. Publish the merged setup receipt only after the relevant file/action outcomes are observed; publish the artifact manifest/completion state last. Record no phase advancement merely because bytes were generated.

Artifact manifests/transaction records are filesystem bookkeeping, not alternative runtime receipts. They contain fixed relative paths and bounded generated-file metadata only. An unchanged repeat makes no transaction or checked-time rewrite unless new observations are intentionally being recorded.

Ancestor validation plus a cooperative lock does not defend against a malicious same-UID process or Docker administrator. Reject unsafe replacement boundaries; do not claim race-free protection in an attacker-controlled filesystem. External editors/wizards are excluded by the separate writer/quiescence gate. Compare-before-replace detects ordinary unexpected edits; it is not a universal atomic filesystem compare-and-swap.

### 7.3 Failure and recovery

- Before publication: the previous final file remains valid. Remove only exact temporary files demonstrably created by this transaction, under its owned scope; never glob-delete another run's files.
- After a rename but before directory fsync: report durability uncertain, not untouched. Reacquire the lock and inspect final bytes/modes and transaction evidence before continuing.
- Between files: a partial set can exist. New launchers fail closed while a transaction is incomplete; never advertise the set as installed. Legacy launchers lack that barrier, so upgrading them requires verified absence of active CLI/wizard writers; no claim of retroactive coordination.
- After artifact publication but before receipt/completion publication: compare actual files to expected new bytes. Revalidate required observations, then complete forward within still-valid scope. Do not rerun Docker or recreate resources to compensate for a failed receipt write.
- If current files match neither recorded old nor new state, stop with a conflict and preserve all versions. No blind rollback/overwrite, deletion of the journal or phase promotion.
- A receipt write failure before replacement preserves the previous valid receipt. A failure after replacement leaves a parseable old-or-new receipt with uncertain durability; verify it on resume rather than claiming the prior receipt necessarily survived.
- Recovery may reuse exact staged files only after schema/path/ownership/content validation. Orphan files without a trustworthy transaction remain untouched and reported.

A transaction is complete only when final files, permissions, receipt merge and completion manifest agree. Completion of artifacts never means gateway readiness.

## 8. Held lock and reacquisition

The initial supported mutation backend is Linux with util-linux `flock` on a verified local filesystem. Node has no built-in flock API; use a small reviewed shell/OS wrapper rather than a runtime npm binding or host Python dependency. Check prerequisites read-only; installing a missing OS tool is a separate approval.

- Use stable private `.hermes/setup.lock`, exclusively held through an open file descriptor for the entire bounded mutation operation. Do not unlink, truncate-replace or rename the lock inode, including on successful release.
- Authorized bootstrap may create a missing private `.hermes` directory and/or missing `setup.lock` using exclusive/no-follow creation and revalidation. This includes an existing verified private directory without a lock and recovery after a crash between directory and lock creation. These are the only pre-lock writes; a racing creation is inspected, not adopted blindly. Ignore-policy, ancestor trust and legacy-lock detection precede bootstrap. Directory/lock existence establishes neither installation ownership nor permission to bypass the missing-receipt gate in §7.1.
- Lock acquisition is nonblocking: contention returns a fixed busy result. Diagnostic metadata in a separate atomic file contains repo ID, random session ID, host boot identity, PID/process-start identity and acquisition time; PID/timestamp alone is never the lock authority. Publish metadata only after acquisition.
- For generator-only work, the locked worker performs the bounded filesystem operations itself. For an explicitly invoked scoped lifecycle command, the lock must remain held while the supervised command/probes run; any child that can outlive its parent must retain the same lock descriptor or have tested termination/containment. Do not release early merely because an agent turn ended.
- Normal exit closes the descriptor after children and state-writing probes finish. Process death releases it when the last holder exits; old metadata is stale diagnostics, not a reason to delete the lock file.
- Reacquisition requires the OS lock first, then boot/process/session checks, receipt/transaction comparison, current ownership/mounts and verification of all other writers. An unlocked inode is not proof the user wizard/gateway/cron is quiescent.
- Before handing private setup to the user, persist observed progress and close installer-only workers/probes, then release the installer's lock. The user wizard is outside that installer operation. On continuation, explicitly verify it has exited; lock availability alone cannot establish this.
- An existing legacy directory lock or unknown locking scheme blocks automatic mutation. Diagnose it read-only; do not delete it or run a parallel new lock namespace as a workaround. Migration requires confirming the old writer is gone and an explicit owned-file reconciliation.
- If lock semantics, process containment or path ownership cannot be established, mutation is unsupported. No PID-based lock stealing, age timeout takeover or directory-lock fallback.

This lock serializes cooperating installers/operators for one canonical repo. It does not replace daemon collision checks, coordinate another checkout with the same short container name, or stop unrelated writers. Recheck exact resource ownership immediately before each authorized Docker mutation; a creation-time collision fails without cleanup or renamed resources.

## 9. Acceptance and regression tests

Use pure fixtures/fake Docker for ordinary tests. No image pull, Docker resource mutation, external credentials, real wizard, model calls or host rc/permission changes in CI. Real OS process tests use temporary owned directories and disposable child processes. Skipped platform/live checks are explicitly reported and do not qualify support.

| Case | Required test and acceptance |
| --- | --- |
| Empty request | Explicit installer invocation with no path resolves nested cwd to Git root without an interview. Outside Git asks one path question. An empty planner CLI fails input validation without writes; merely reading/editing the skill never authorizes deployment. |
| Memory handoff | Retain existing checkout frontmatter-target test; add the same resolution check in flattened installed copies and a negative fixture using `../SKILL.md`. It must reject the installer as the memory target. No redundant link edit. |
| Maintenance plan | Supported fixture emits exact no-autostart fragment, preserves bootstrap/user/home/workspace and resource IDs. Unsupported revision or absent maintenance evidence emits no usable maintenance plan. Old no-mode planner golden output remains unchanged. |
| Artifact generation | Generate main/status/logs/aliases/receipts from validated input, not template string replacement in docs. Test shell syntax, quoted paths/Unicode/metacharacters, literal argv, TTY/non-TTY, exit propagation, explicit selectors and secret-free output. |
| Missing receipt | Clean repo plus verified absent resources can prepare new identity. Existing `.hermes` artifacts, missing/corrupt receipt, or ambiguous matching resources block write/create. Maintain never falls back to fresh install. |
| Container collision | Running/stopped foreign container and racing create both block; no suffix, rename, adoption, stop or deletion. Two same-basename repos retain distinct internal IDs but cannot bypass the short-name collision. |
| Absent NumPy | Bare Python fails but supported startup activation succeeds: no install proposal/basic claim. True absence after parity blocks HRR and produces a separate dependency request. Unknown parity remains pending; FTS5/provider absence is not basic success. |
| Dirty repository | Snapshot dirty tracked/untracked/submodule state before/after generator tests. Only approved installer files change; no stash, reset, index edits, submodule refresh or whole-repo backup. Existing owner artifacts/secret stores remain byte-identical. |
| Writable shortcut ancestors | Reuse 0775 ancestor fixture: core/full linking rejected with unchanged trust checks; no automatic chmod/rc fallback. Accepted blocked persistence remains requested, existing installed core inventory survives failed apply promotion. |
| Interrupted setup | Kill writer before/after staging, file fsync, each publication, receipt rename and completion barrier. Old/new receipts remain parseable; partial artifacts are detectable; resume either completes verified forward or blocks on changed content. No fabricated gate success or lifecycle action. |
| Resume without duplicates | Same target/pin/config and completed observations → no new resources, wizard, pull, alias offer, generated-file inode churn or duplicate marked sections. Recheck mandatory live safety conditions. |
| Locks | Two real processes contend: one writer. Kill holder and prove reacquisition only after last holder exits. PID reuse/stale metadata does not authorize takeover. Test child lifetime, active external wizard, legacy lock, symlink/foreign inode, unsupported backend and lock inode preservation. An existing owned private directory without a lock, and a crash between directory/lock creation, must permit safe exclusive lock creation without bypassing receipt/ownership checks. |
| Image selection | Missing stable tag; differing latest/release digests; prerelease exclusion; existing-pin reuse; manifest byte mismatch; platform/variant mismatch; source revision conflict/missing provenance; ambiguous release mapping. All failures block without fallback/pull. |
| Runtime adapters | Exact qualified tuple succeeds only on observed required gates. Unknown revision, Up-but-gateway-down, wrong tool cwd, cached old provider, rewritten SOUL, static greeting, added channel and absent safe live signal produce correct distinct outcomes. |
| Adapter boundaries | Timeout, oversized/secret-bearing synthetic output, unknown exit and detached-child attempt fail closed. No polling writes, network auth refresh or synthetic ready stub. Test diagnostic/readiness code translation explicitly. |
| Approval separation | Approve dependency only: no policy/shortcut changes. Decline shortcut: independent setup continues. Change version/path/disruption: only affected approval invalidates. Saved decisions/receipts alone never authorize mutation. |
| Evidence invalidation | Matrix-driven tests invalidate only dependencies, retain unrelated choices, and reject stale phase/PID/container/auth facts as readiness. Runtime and development remain separate. |
| Storage safety | Inject ENOSPC, EACCES, failed fsync/rename, concurrent file edits, symlink/hardlink targets, dangling links and unknown manifest versions. Verify no foreign overwrite and honest partial/durability results. |
| Legacy compatibility | Load representative version-1/minimal/extended receipts; preserve unknown valid fields and exact phases/enums. Recognized legacy files require reviewed adoption; owner edits block. Unknown versions remain untouched. |
| Apply preflight | Missing/mismatched adapter, incomplete transaction, maintenance override, unresolved writers or stale required gates prevent recreation. Failed readiness after one approved recreation never causes another recreation or rollback. |
| Packaging | New helper dependencies/adapters copied together in package and flattened profiles; old planner invocation and existing status/wait/shortcut CLI contracts continue to work. |

Extend the existing focused test entry point so new automation suites run under `npm test`. Transition launcher tests from Markdown extraction to actual generator output before removing reference templates. Keep protocol/argv assertions intact. Existing helper tests remain regression gates, not tests to weaken to fit the refactor.

### Agent behavior tests before more prose

Use the existing decision fixtures as inputs without acceptance notes. Add pressure cases for urgency, a successful prior partial run and misleading ready receipts. Run fresh-context paired trials of current guidance versus proposed automation/routing, with a no-added-guidance control; use at least five samples per behavior variant and manually inspect flagged results.

Measure separately:

- Unnecessary narration/repeated discovery calls after unchanged evidence is available.
- Default visible output size and whether it leads with one supported verdict and one next action.
- Manual assembly/replacement of supported artifacts versus invoking the generator.
- Repeated broad approval questions versus concrete independently selectable actions.
- Safety violations, unknown-to-pass conversions, secret output and unsupported runtime claims.

Automation acceptance: every proposed-automation trial uses the generator for supported artifacts; no duplicated provisioning or safety violations; unchanged discovery is reused except mandatory rechecks. For output-shaping changes, compare medians and spread against baseline rather than inventing a universal word cap. Add prose only for a demonstrated remaining failure. If the control already succeeds, do not add another prohibition to explain it.

## 10. Documentation consolidation (last delivery slice)

Keep `SKILL.md` a short entry/routing guide: target resolution, create/maintain/status routing, resource-base trust, and links to the required lifecycle instructions. Preserve discoverability and the shared contract without repeating full safety rules.

Assign one authoritative location per contract:

| Contract | Authority after consolidation |
| --- | --- |
| Request scope and independently selectable approvals | New `references/authorization.md`. |
| Deterministic image policy, adapter qualification and unknown-version behavior | New `references/image-and-adapters.md` plus adapter manifests. |
| Artifact generation, atomic recovery and held lock | New `references/artifacts-and-locking.md` plus helper `--help`. |
| Lifecycle routing and source/ownership/mount boundaries | `references/compose.md`, reduced to lifecycle sections and links. |
| Phase/receipt schema, resume, invalidation and diagnostic codes | `references/resume-and-diagnostics.md`. |
| Private setup and host command behavior | `references/host-cli.md`, replacing handwritten templates with tested generator usage. |
| Readiness protocol and shortcut trust/persistence | `references/readiness-and-shortcuts.md`. |
| Memory capability, identity, development and ignore policy | Existing dedicated references; no copied implementations or divergent rules. |

For lifecycle-selective loading, move independently loadable procedures into focused files rather than pretending a link fragment enforces partial loading of a large required file. Routing names required files for the current lifecycle operation; read each required file fully once and reuse until changed. Source/trust and missing-resource behavior remain explicit. Memory work still loads the full sibling memory skill/setup reference at its gate.

Keep existing public anchors or compatibility links during migration. Update package/link tests and decision fixtures alongside the final documentation reduction. A lower word count is not sufficient acceptance if a safety boundary disappears.

## 11. Delivery boundaries and specification review

This is sequencing guidance, not an implementation task plan:

1. Establish generator/maintenance input contracts and failure tests; add the minimum lock/storage/receipt modules needed for safe artifact writes. Start with supported test fixtures, not invented production adapter claims.
2. Qualify real image/adapter tuples and connect deterministic selection and runtime checks. Lack of a safely qualified revision blocks production support, not a reason to weaken the interface.
3. Exercise approval/invalidation/resume behavior with legacy fixtures and crash tests; retain existing helper compatibility.
4. Run paired agent trials, then remove duplicated prose and manual templates only where replacement behavior is tested.

Implementation acceptance requires focused suites, `npm test`, packaging validation and recorded residual/platform/live-test limits. Real Docker smoke tests require separate explicit scope and must not contact a model or use private credentials. Do not call an adapter supported or a deployment healthy based on fixture success alone.

### Spec completion checklist

- [x] Approved intent and non-goals captured.
- [x] Current code, helper protocols and version-1 receipts inspected.
- [x] Maintenance planning and artifact generation prioritized.
- [x] Adapter/image/approval/evidence contracts defined.
- [x] Per-file atomicity, partial failure, locking and reacquisition defined.
- [x] Existing helpers, receipts and installed-copy links accounted for.
- [x] Required failure cases and behavior-test criteria enumerated.
- [x] Self-review and independent read-only review completed for contradictory gates, compatibility regressions and recovery ambiguity. The review identified an undefined missing-lock bootstrap path for existing private directories; §8 and its acceptance test now cover that case. This is design review, not implementation or live-runtime validation.

No further broad design confirmation is needed to deliver this spec. Implementation planning/execution remains a later task; only a concrete unresolved design conflict should interrupt this specification work.

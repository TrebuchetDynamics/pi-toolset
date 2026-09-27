# Hermes Installer Automation Implementation Plan

> **Historical baseline plan — reconcile before execution.** This reviewed plan targets `dfc1ed7`; its separate implementation is partial and is not included in this documentation delivery. Checkboxes below retain the original task outline, not a current completion ledger. Before resuming, read the [design's delivery status and later contracts](../specs/2026-09-26-hermes-installer-automation-design.md#delivery-status-and-later-contracts), inspect the existing implementation/ledger, and update affected tasks for the installer changes shipped in `ec6bcff`. Do not execute old home/shortcut/chat assumptions or repeat already completed work. Shipping these documents does not qualify runtime support or authorize deployment.

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement the reconciled plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace manual maintenance planning and installer artifact assembly with tested, fail-closed helpers while preserving the existing lifecycle, ownership, approval and readiness contracts.

**Architecture:** Keep small offline planners/renderers separate from bounded read-only image/runtime adapters and explicitly invoked filesystem writers. Writers share a held OS lock, validated version-1 receipt merge and recoverable per-file publication protocol. No helper autonomously advances installation or repairs a runtime.

**Tech Stack:** Existing Node ESM and `node:assert/strict`; POSIX shell; Linux util-linux `flock` for mutation; fake Docker/registry boundaries and temporary owned Git repositories for tests. No new npm runtime dependencies.

**Spec:** `docs/superpowers/specs/2026-09-26-hermes-installer-automation-design.md`.

**Execution method:** Inline/native via executing-plans, as requested. The original plan/design review is complete; the reconciled execution plan needs review before resuming. No product code or runtime action was performed while drafting this original outline.

## Global Constraints

- "This is **not a full installer orchestrator**": no automatic lifecycle advancement, wizard capture, dependency install, restart, migration, inference or external message.
- "Atomicity is **per file**, with an explicit nonsecret artifact transaction record and completion barrier for multi-file recovery".
- "Use a held Linux OS `flock` for mutation. No directory-lock fallback; unsupported hosts/filesystems retain read-only planning and diagnostics."
- "Support exact reviewed image/source/platform combinations, not guessed version ranges."
- "Keep receipt version 1 and add optional namespaced evidence. Unknown schema versions remain read-only/unsupported for mutation."
- "The Compose memory handoff is already correct. Extend regression coverage rather than edit that link again."
- Preserve `{identity,compose,requiredConfig}`, the no-mode planner output, existing helper CLIs, exact short container naming and hashed internal resource IDs.
- Preserve setup phases `prepared`, `awaiting-user-setup`, `configured`, `memory-verified`, `activated`, `ready`; shortcut states `not-offered`, `declined`, `requested`, `installed`.
- Readiness probe exits remain `0/10/20/30`; diagnostic exits remain `0/10/11/12/20/21/22/23/24/30`; status helper exits remain `0/1/3`.
- Keep runtime readiness, development readiness, configured identity, static greeting, fresh-process memory capability, loaded-gateway capability and recreation durability distinct.
- Raw Compose `env_file` still requires Compose 2.30+. No host Hermes/Python requirement; nonroot UID/GID remain integers in `1..65534`.
- New package resources go under `skills/engineering/hermes-repo-install/`; tests stay in `tests/`. Preserve third-party notices.
- No code may read/write `.env`, auth stores, SOUL or database contents for artifact generation. Receipts never authorize actions.
- Use fake Docker and registry boundaries in tests. Real filesystem/lock tests may mutate only temporary owned fixtures.
- Run `npm test` before each commit. Do not commit unrelated files, merge, push, publish, install global tools or mutate a deployment.
- A real adapter remains unqualified until a separately authorized isolated smoke run. Code-execution approval is not runtime-deployment approval. Unqualified tuples must fail closed, not become synthetic production successes.

## Review Focus

These cases are easy to miss even with a green fixture suite. They have explicit tests in the owning tasks; the final reviewer must also inspect the underlying assumptions:

1. An installer dies while a child still holds the lock or an uncoordinated wizard is active: no concurrent writer or stale-lock deletion (Tasks 4, 7).
2. Receipt content preserves an unknown field that contains sensitive text: preservation must not leak it through preview/errors/transaction journals (Tasks 3, 7).
3. A container image changes between adapter preflight and apply: no recreation with stale source assumptions (Task 10).
4. A same-UID external editor replaces generated content during a publication window: conflicts must not be misreported as idempotent success or readiness (Tasks 5, 7; document the cooperative-writer threat model).
5. A copied installation has a valid-looking generated manifest but wrong repo/volume identity: neither recovered transactions nor renderer inputs can confer ownership (Tasks 3, 7).

## File Map and Interfaces

Paths below the skill are abbreviated as `H/` **only in this map**; task file lists use full paths.

| Path | Responsibility |
| --- | --- |
| `H/scripts/compose-plan.mjs` | Existing planner plus explicit mode/adapter-aware launch selection. |
| `H/scripts/runtime-adapter.mjs` | Trusted adapter selection, operation dispatch, probe CLI. |
| `H/scripts/adapters/index.mjs` | Statically imported, reviewed adapter registry; no dynamic path from JSON. |
| `H/scripts/adapters/contract.mjs` | Adapter binding/observation validation and protocol mapping. |
| `H/scripts/lib/receipts.mjs` | Bounded version-1 parsing, owned-field merge and invalidation. |
| `H/scripts/lib/lock.mjs`, `H/scripts/with-lock.sh` | Safe bootstrap, OS lock acquisition, inherited descriptor validation and bounded worker lifetime. |
| `H/scripts/lib/atomic-files.mjs` | Private staging, preimage comparison, no-clobber/create and durable replacement. |
| `H/scripts/lib/render-artifacts.mjs` | Pure inventory/launcher/alias rendering. |
| `H/scripts/artifacts.mjs` | Explicit render/write/recover CLI and transaction coordination, not Docker lifecycle. |
| `H/scripts/lib/artifact-state.mjs` | Generated-file manifest, journal and execution barrier. |
| `H/scripts/lib/image-evidence.mjs`, `H/scripts/image-resolve.mjs` | Pure image selection/verification and separate bounded official metadata collector. |
| `H/scripts/lib/approval-summary.mjs` | Independently selectable concrete action list, scoped in-session decision matching. |
| `tests/helpers/hermes-fixtures.mjs` | Disposable repos, test-only synthetic adapters and fake external boundaries. Never packaged. |
| `tests/hermes-automation.test.mjs` | New focused automation test entry point invoked from the existing Hermes suite. |
| `tests/hermes-automation/` | Split test files for planner, receipts, locks, storage, rendering, recovery, images, adapters and approvals. |

### Shared data contracts

These are plain validated data, not permission tokens:

```js
// ImageBinding
{
  image: 'nousresearch/hermes-agent@sha256:<64 lowercase hex>',
  platform: { os: 'linux', architecture: 'amd64', variant: null },
  manifestDigest: 'sha256:<64 lowercase hex>',
  indexDigest: null, // or verified index digest for an existing pin
  configDigest: 'sha256:<64 lowercase hex>',
  sourceRevision: '<full upstream Git object ID>',
  adapterId: '<bundled ID>', adapterVersion: 1
}

// Observation: identifiers are nonsecret; no config/env/log bodies
{
  operation: 'workspace', verdict: 'pass', reason: 'workspace-verified',
  observedAt: '2026-09-26T00:00:00.000Z',
  binding: { repoId, context, projectName, containerId, image,
    adapterId, adapterVersion, gatewayPid, gatewayStartedAt },
  inputs: { workspace: '/workspace' }, facts: { toolCwd: '/workspace' }
}

// ArtifactEntry: internal render result; not an unfiltered stdout payload
{ path: 'bin/hermes', mode: 0o700, bytes: Buffer.from('#!/bin/sh\nexec node --version\n'),
  expected: { state: 'absent' } }
// These sample bytes illustrate the schema, not a production Hermes launcher.
// Existing target alternative:
// expected: { state: 'owned', digest: 'sha256:...', mode: 0o700 }

// ArtifactManifest (private .hermes/artifacts.json)
{ version: 1, repoId, repoPath, generation, entries: [
  { path: 'bin/hermes', mode: 0o700, digest: 'sha256:...' }
] }

// TransactionJournal (private .hermes/artifact-transaction.json)
{ version: 1, repoId, repoPath, transactionId, state: 'pending',
  entries: [ { path, temporaryPath, previous, next } ],
  receiptRevision: null }
// `previous`/`next` contain modes/digests only, never file contents.
```

Only allowlisted nonsecret observation facts can be rendered or journaled. Existing unknown receipt fields are preserved privately but not exposed by preview or diagnostics. Input size bounds: 256 KiB receipt/evidence JSON; 1 MiB generated individual file; 4 MiB selected artifact set; maximum 64 artifact entries. All limits fail closed with fixed reason codes. They do not authorize reading arbitrary files to determine whether those files contain secrets.

### Test harness contracts

Every helper below lives in `tests/helpers/hermes-fixtures.mjs` or the named test file; no test adapter/fault switch ships in the package. Add test-only harness helpers with the failing test in the task that first uses them; production changes still follow observed RED. Implement the tests with real filesystem/process behavior and double only external Docker/registry collection.

- `withRepo(fn) -> Promise<void>`: create a mode-0700 temporary directory, initialize a Git repo, invoke `fn(canonicalRepo)`, and remove only that fixture in `finally`. Record dirty file/index bytes when a test needs preservation evidence.
- `fixtureBinding() -> ImageBinding`: official digest string using 64 `a` characters, linux/amd64/null variant, manifest digest of 64 `a` characters, config digest of 64 `b` characters, 40-character `c` source revision, adapter ID `test-only`, adapter version 1. It is schema-valid synthetic data, not real provenance.
- `syntheticAdapter() -> adapter`: exact binding match above, `qualification.verified: true` only in the injected test registry; `describeLaunch('maintenance')` returns `{command:['fixture-maintenance']}` and gateway returns `{command:['gateway','run']}`. Test operations return independently authored observations. The production CLI cannot select this registry.
- `fixtureRenderInput(repo) -> render input`: call the fixture-injected explicit maintenance planner; runtime mapping uses uid/gid 1000, home `/opt/data`, workspace `/workspace`, CLI `/opt/hermes/bin/hermes`; selection `core`; no ready observations. A core prepared receipt is supplied using Task 3's schema. `writeFixtureEntries(repo, entries)` installs only renderer-produced paths in that fixture and closes its synthetic completion manifest; it is not a production write bypass.
- `fakeDockerEnv`, `readDockerArgs()`, `readDockerMutationCalls()`: an executable argv-recording fake Docker in the fixture PATH, returning per-test deterministic command responses. Read the recorded JSON arrays and classify mutation verbs. Unexpected commands fail, rather than returning universal success. The generated launcher is the real unit under test.
- `startLockFixture(options) -> {acquired,exited,kill}` and `attemptLockFixture(repo) -> {reason}`: start the real lock boundary in child processes, synchronize acquisition/exit through IPC, use deadlines, and kill/reap only children created by the fixture.
- `runArtifacts(args) -> spawnSync result`: a test-owned child imports the real exported `runArtifactCommand(argv, services)` handler, injecting the synthetic adapter registry and fake external collection transport. The parser, renderer, locks and filesystem writer remain real. Separately invoke the actual packaged CLI to assert synthetic/unknown bindings fail closed and no flag/environment option enables that registry. `runArtifactWorkerWithCrash({inputFile,boundary})` invokes the same commit function with an injected test filesystem boundary, waits for that operation's IPC marker, then kills the worker. Production has no environment-selectable crash behavior.
- `generatedInodes(repo)`: return sorted path/inode/mode pairs for the fixed generated inventory only. `runGeneratedApply({fixture})`: render the real full-selection launcher under a test-qualified registry, install its dependency closure and execute it against the chosen deterministic external responses.
- Observation constants used below (`workspaceObservation`, `unsupportedObservation`, `basicMemoryObservation`, `ownedMaintenanceGatewayStopped`, `containerUpOnly`, `pendingConnection`, `prerequisiteReadyObservations`, `fullCurrentReadyObservations`) are literal per-test inputs satisfying the shared schema. Use distinct container/PID bindings for stale cases. The ready fixture contains all mandatory auth, workspace, identity, local memory, loading and configured-channel observations; never derive expected outcomes with the verdict function under test.
- Image test constants (`linuxAmd64`, `validEvidence`) come from independently authored synthetic manifest/config/source bytes; expected digests are recorded once from those fixture bytes. Approval constants (`dependency`, `policy`, `shortcuts`, `acceptDependency`) identify three distinct target/method/impact scopes, with only the dependency scope in the accepted decision.

### Execution preparation (before Task 1)

1. Read the spec and this plan; use using-git-worktrees to create an isolated branch/worktree. Do not implement on `main`.
2. Carry only the approved spec/plan into that workspace; preserve the original checkout's untracked documents. Do not stash/reset unrelated work.
3. Create the executing-plans ledger with the plan's helper. Record task interfaces/dependencies and any ruling against this plan, with the spec binding.
4. Run `npm test` once as the baseline, saving output to the plan workspace. Record failures by name; do not hide pre-existing failures.
5. Perform task-start/task-done bookkeeping per executing-plans. Every task's final test command is `npm test`; focused RED/GREEN commands below localize failures first.

## Task 1: Installed-copy handoff regression and behavior baseline

**Files:**
- Modify: `tests/skill-profile.test.mjs` (automation profile's installed Compose reference checks).
- Modify: `tests/hermes-repo-install.test.mjs` (source-link validation helper reuse if needed).
- Create: `tests/helpers/hermes-handoff.mjs`.
- Create: `tests/fixtures/hermes-automation-behavior.md`.

**Interfaces:**
- Consumes: actual flattened installation directories already produced by `tests/skill-profile.test.mjs`.
- Produces: test-only `assertMemoryHandoff(referenceFile)` and recorded baseline transcripts in the plan workspace, not runtime resources.

- [ ] **Step 1: Write the regression assertion.**

```js
// Break caught: a link exists but resolves to the installer instead of memory.
assertMemoryHandoff(composeReference);
const badRoot = path.join(tmp, 'bad-handoff');
fs.mkdirSync(path.join(badRoot, 'references'), {recursive:true});
fs.writeFileSync(path.join(badRoot, 'SKILL.md'),
  '---\nname: hermes-repo-install\n---\n');
const badReference = path.join(badRoot, 'references/compose.md');
fs.writeFileSync(badReference, `[memory](../SKILL.md)\n`);
assert.throws(() => assertMemoryHandoff(badReference), /memory handoff/);
```

For the negative fixture, create its own `references/compose.md` beside an installer `SKILL.md`; do not mutate the real checkout link. The validator resolves local Markdown links relative to the reference file, reads target frontmatter and requires exactly the intended memory skill. A link merely pointing to any existing file must fail.

- [ ] **Step 2: Run the focused test.** Run `node tests/skill-profile.test.mjs`. Expected: FAIL for the absent test helper/assertion implementation, not an unrelated installer failure. Catch absent-helper import in the test to produce a clear missing-export assertion rather than treating module-load errors as RED evidence.
- [ ] **Step 3: Add the test helper and run the negative fixture.**

```js
export function assertMemoryHandoff(referenceFile) {
  const links = [...fs.readFileSync(referenceFile, 'utf8')
    .matchAll(/\]\(([^)]+\.md)\)/g)].map(match => match[1]);
  const targets = links.filter(link => !/^https?:/.test(link)).map(link =>
    path.resolve(path.dirname(referenceFile), link));
  assert.ok(targets.some(file =>
    fs.existsSync(file) && /^name: memory-holographic-hermes-setup$/m
      .test(fs.readFileSync(file, 'utf8'))), 'memory handoff targets the intended skill');
}
```

Preserve the current good link unchanged. The negative assertion must be shown to fail if the validator is deliberately weakened to existence-only, then restored.

- [ ] **Step 4: Capture behavioral controls before changing skill instructions.** Use fresh read-only agent runs, five repetitions each of current guidance and a no-added-guidance control. Use one combined fixture with a dirty repo, missing receipt/residual container, false bare-Python NumPy failure, blocked shortcuts and prior unchanged discovery. No real Docker/network/private store calls. Record selected actions, visible words, repeated discoveries, manual artifact assembly, repeated approvals and safety failures. Preserve exact model/prompt/inputs/output for later comparison. If capacity prevents five samples, record the gap and do not claim prose qualification.
- [ ] **Step 5: Verify and commit.** Run `node tests/skill-profile.test.mjs && node tests/hermes-repo-install.test.mjs && npm test`. Expected: all pass, current good link unchanged. Commit only listed test/fixture files and approved design documents: `test(hermes): verify installed memory handoff identity`.

## Task 2: Adapter contract and explicit maintenance planner

**Files:**
- Modify: `skills/engineering/hermes-repo-install/scripts/compose-plan.mjs`.
- Create: `skills/engineering/hermes-repo-install/scripts/adapters/contract.mjs`.
- Create: `skills/engineering/hermes-repo-install/scripts/adapters/index.mjs`.
- Create: `skills/engineering/hermes-repo-install/scripts/runtime-adapter.mjs`.
- Create: `tests/helpers/hermes-fixtures.mjs`.
- Create: `tests/hermes-automation/planning.test.mjs`.
- Create: `tests/hermes-automation.test.mjs`; modify `tests/hermes-repo-install.test.mjs` to invoke it.

**Interfaces:**
- Consumes: existing `deriveIdentity(repoPath)` and `makePlan(options)` output.
- Produces: `selectAdapter(binding, registry = bundledAdapters)`; `validateBinding(binding)`; `makePlan(options, {registry = bundledAdapters} = {})` with optional `mode`, `binding`, `existingPlan`; pure `makeObservation(input)`.
- Test-only helpers: `withRepo(fn)` creates/cleans an owned temporary Git repository; `syntheticAdapter()` returns an in-process adapter fixture not reachable from production CLI/environment.

- [ ] **Step 1: Write planner tests.**

```js
await withRepo(async repo => {
  const binding = fixtureBinding();
  const options = { repo, image: binding.image, uid: 1000, gid: 1000 };
  const legacy = makePlan(options);
  assert.deepEqual(legacy.compose.services.hermes.command, ['gateway', 'run']);
  assert.throws(() => makePlan({ ...options, mode: 'maintenance', binding }),
    /unsupported/);
  const registry = [syntheticAdapter()];
  const maintenance = makePlan({ ...options, mode: 'maintenance', binding }, {registry});
  assert.deepEqual(maintenance.compose.services.hermes.command, ['fixture-maintenance']);
  assert.equal(maintenance.compose.services.hermes.entrypoint, undefined);
  assert.equal(maintenance.identity.repoId, legacy.identity.repoId);
  assert.deepEqual(Object.keys(maintenance).sort(), ['compose', 'identity', 'requiredConfig']);
});
```

`fixtureBinding()` is a test-only literal with `'a'.repeat(64)` digests and a full synthetic source ID. `syntheticAdapter()` advertises `fixture-maintenance` solely to test launch selection; it is never written into the bundled registry. Add tests for unknown/duplicate flags, explicit gateway mismatch, platform mismatch, absent binding, duplicate matching adapters, changed UID/home constraints, dirty source preservation and existing long-named plan retention.

- [ ] **Step 2: Run RED.** Run `node tests/hermes-automation/planning.test.mjs`. Expected: assertion failure because current planner ignores maintenance mode; fix test harness/import errors before counting RED.
- [ ] **Step 3: Implement the mode boundary.**

```js
const mode = options.mode;
if (mode !== undefined && !['maintenance', 'gateway'].includes(mode)) {
  throw new Error('unsupported mode');
}
const adapter = mode === undefined ? null : selectAdapter(options.binding, registry);
// Existing validation/identity/resource generation remains authoritative.
const launch = adapter ? adapter.describeLaunch(mode) : { command: ['gateway', 'run'] };
```

Validate launch fragments against a fixed key allowlist; reject entrypoint/user/privileged/host mounts and arbitrary snippets. The compiled registry initially contains no qualified production tuples. CLI accepts `--mode` and `--binding-file` (bounded fixed-schema nonsecret JSON), never `--adapter-path`, environment-injected code or a caller-supplied registry. Preserve no-mode output byte-for-byte structurally. Existing-plan reconciliation accepts only a validated known generated plan, preserves recorded selectors/resources and changes allowed launch fields; owner customization blocks automatic reconciliation.

- [ ] **Step 4: Verify GREEN and backward compatibility.** Run `node tests/hermes-automation/planning.test.mjs && node tests/hermes-repo-install.test.mjs`. Expected: explicit fixture mode passes; production unknown tuple rejects; all existing planner tests pass.
- [ ] **Step 5: Run `npm test`, then commit:** `feat(hermes): add adapter-bound maintenance planning`.

## Task 3: Version-1 receipt merge and dependency invalidation

**Files:**
- Create: `skills/engineering/hermes-repo-install/scripts/lib/receipts.mjs`.
- Create: `tests/hermes-automation/receipts.test.mjs`.
- Modify: `tests/hermes-automation.test.mjs` to import the new suite.

**Interfaces:**
- Consumes: `makeObservation(input)` and canonical planner identity.
- Produces: `parseReceipt(bytes, identity)`; `mergeReceipt(existing, patch, {identity, observations})`; `invalidateEvidence(receipt, changedInputs)`; `receiptSummary(receipt)`.

- [ ] **Step 1: Write preservation/invalidation tests.**

```js
const old = { version: 1, repoId, repoPath, phase: 'memory-verified',
  aliasPersistence: 'declined', custom: { note: 'PRIVATE_SENTINEL' },
  evidence: { automation: { version: 1, observations: [workspaceObservation] } } };
const next = invalidateEvidence(old, ['container']);
assert.equal(next.phase, 'memory-verified');
assert.equal(next.aliasPersistence, 'declined');
assert.equal(next.custom.note, 'PRIVATE_SENTINEL');
assert.equal(next.evidence.automation.observations[0].verdict, 'pending');
assert.equal(JSON.stringify(receiptSummary(next)).includes('PRIVATE_SENTINEL'), false);
assert.throws(() => mergeReceipt(old, { phase: 'ready' },
  {identity, observations: []}), /unverified/);
```

Add fixtures for minimal legacy identity, malformed JSON, copied repo/context, unknown schema, oversized/nested objects, `__proto__` keys, accepted-but-blocked shortcut state, partial core inventory, unrelated development blockers and unchanged no-op merges. Assert no mutation of input objects and no implicit current-ready from phase alone.

- [ ] **Step 2: Run RED.** Run `node tests/hermes-automation/receipts.test.mjs`. Expected: missing-export assertion before implementation.
- [ ] **Step 3: Implement bounded schema/merge with explicit fields.**

```js
const phases = new Set(['prepared', 'awaiting-user-setup', 'configured',
  'memory-verified', 'activated', 'ready']);
const shortcutStates = new Set(['not-offered', 'declined', 'requested', 'installed']);
const dependencies = {
  workspace: ['repo', 'context', 'mounts', 'container', 'workspace', 'wizard'],
  identity: ['image', 'adapter', 'soul', 'promptLoader', 'wizard'],
  startupDependencies: ['image', 'adapter', 'packages', 'activation', 'container'],
  gateway: ['container', 'gateway', 'configuration', 'credentials'],
  channels: ['container', 'gateway', 'configuration', 'credentials'],
};
```

Define corresponding entries for auth, memory configuration/local HRR/cleanup/loading/durability and development gates using spec §6.2. Invalidation changes only dependent current observations to pending and retains dated history. Patch identity must agree; unknown top-level fields survive privately via safe object copying, not prototype assignment. Validate phase advancement from supplied gate observations and current binding; missing evidence blocks advancement. These observations remain caller facts, not cryptographic attestations or approvals. `receiptSummary` is an allowlisted projection only.

- [ ] **Step 4: Run GREEN.** Run `node tests/hermes-automation/receipts.test.mjs && node tests/hermes-repo-install.test.mjs`. Expected: legacy fields/enums preserved, sensitive sentinels absent from summaries/errors and stale observations pending.
- [ ] **Step 5: Run `npm test`, then commit:** `feat(hermes): validate receipt merges and evidence invalidation`.

## Task 4: Held OS lock with safe bootstrap and crash reacquisition

**Files:**
- Create: `skills/engineering/hermes-repo-install/scripts/with-lock.sh`.
- Create: `skills/engineering/hermes-repo-install/scripts/lib/lock.mjs`.
- Create: `tests/hermes-automation/locking.test.mjs`.
- Modify: `tests/hermes-automation.test.mjs`.

**Interfaces:**
- Consumes: canonical repo identity and preflight-only request scope.
- Produces: `inspectLockBoundary(repo)`; `withSetupLock({repo,identity,sessionId}, operation)`; private branded lock handle `{fd,repoId,sessionId,assertHeld()}` scoped to the holding process. Shell wrapper runs the fixed trusted Node entry point for allowlisted operations, not arbitrary input shell code.

- [ ] **Step 1: Write real-process tests.**

```js
const first = await startLockFixture({repo, hold: true});
await first.acquired;
const second = await attemptLockFixture(repo);
assert.equal(second.reason, 'busy');
const inode = fs.lstatSync(path.join(repo, '.hermes/setup.lock')).ino;
first.kill('SIGKILL');
await first.exited;
const resumed = await attemptLockFixture(repo);
assert.equal(resumed.reason, 'acquired');
assert.equal(fs.lstatSync(path.join(repo, '.hermes/setup.lock')).ino, inode);
```

Test-only `startLockFixture`/`attemptLockFixture` spawn the real lock module in a disposable worker with IPC synchronization, not sleeps. Cover private existing `.hermes` with missing lock; directory-before-lock crash; symlink/dangling/hardlink targets; unknown legacy directory lock; foreign/shared ancestors; stale PID/boot metadata; child inheriting the descriptor; non-inheriting child forbidden; external wizard still active. Unsupported platforms skip real flock qualification explicitly and assert mutation-unsupported behavior instead.

- [ ] **Step 2: Run RED.** Run `node tests/hermes-automation/locking.test.mjs`. Expected: missing lock API assertion.
- [ ] **Step 3: Implement lock acquisition in the process that performs the operation.**

```js
// Open/validate the stable inode first; keep `fd` open in this Node process.
const acquired = spawnSync('flock', ['--exclusive', '--nonblock', '3'], {
  stdio: ['ignore', 'ignore', 'ignore', fd], timeout: 5000,
});
if (acquired.status !== 0 || acquired.error || acquired.signal) {
  fs.closeSync(fd);
  throw new Error('lock busy or unavailable');
}
// flock's fd 3 and this process's fd share the inherited open-file description.
// The lock persists when flock exits; run the callback here, then close our fd
// only after all supervised children/probes finish. Never issue LOCK_UN early.
```

Verify that Linux/util-linux inherited-open-description behavior with the real two-process test, not assumption. `withSetupLock` runs the callback in the holding Node process, so functions do not need serialization across a worker boundary. Its private handle cannot be reconstructed from JSON or an environment boolean; `assertHeld()` checks the still-open descriptor/inode and private lease lifetime. The optional shell wrapper only execs the fixed trusted Node CLI for allowlisted artifact operations. Any equivalent backend change requires a ledgered ruling and the same real process tests.

Keep metadata in a separate atomic private file; never replace/unlink the lock inode. Reject known unsafe/remote filesystems for mutation; unsupported detection is a blocker, not a fallback. Hold the descriptor across relevant supervised children or reject that operation. Bootstrap only the missing private directory/lock after ignore/ancestor checks; this does not manufacture installation ownership. OS lock availability never bypasses independent writer checks.

- [ ] **Step 4: Run GREEN and forced-death tests.** Run `node tests/hermes-automation/locking.test.mjs`. Expected: exactly one holder, no premature release while a child holds the descriptor, safe reacquisition after last holder exits and unchanged inode.
- [ ] **Step 5: Run `npm test`, then commit:** `feat(hermes): serialize artifact writes with held OS locks`.

## Task 5: Durable private per-file publication

**Files:**
- Create: `skills/engineering/hermes-repo-install/scripts/lib/atomic-files.mjs`.
- Create: `tests/hermes-automation/atomic-files.test.mjs`.
- Modify: `tests/hermes-automation.test.mjs`.

**Interfaces:**
- Consumes: lock handle from Task 4 and validated `ArtifactEntry`.
- Produces: `stageFile({root,entry,lock})`; `publishFile({root,staged,lock})`; `inspectGeneratedFile({root,path})`.
- Stage result includes temporary relative path, old/new digest/mode and file identity. No secret-bearing input is eligible.

- [ ] **Step 1: Write behavioral filesystem tests.**

```js
await withSetupLock(lockOptions, async lock => {
  const staged = stageFile({ root: hermesDir, lock,
    entry: {path: 'bin/hermes', mode: 0o700, bytes: Buffer.from('#!/bin/sh\nexit 0\n'),
      expected: {state: 'absent'}} });
  fs.writeFileSync(path.join(hermesDir, 'bin/hermes'), 'owner file');
  assert.throws(() => publishFile({root: hermesDir, staged, lock}), /conflict/);
  assert.equal(fs.readFileSync(path.join(hermesDir, 'bin/hermes'), 'utf8'), 'owner file');
});
```

Add existing-file no-op inode/mtime tests; owned update/backup; concurrent content change; path traversal/absolute path; symlink ancestors/targets and hardlinks; ENOSPC/EACCES/fsync/rename errors. Fault injection wraps the filesystem boundary only, preserving real temp file operations. Output must distinguish failure before publication from uncertain durability after rename.

- [ ] **Step 2: Run RED.** Run `node tests/hermes-automation/atomic-files.test.mjs`. Expected: missing storage API assertion.
- [ ] **Step 3: Implement ordered publication.**

```js
// Algorithm inside the held worker, with path/owner/mode checks before each step:
// absent: stage(O_CREAT|O_EXCL|O_NOFOLLOW) -> write -> fchmod -> fsync
//         -> no-clobber link/publication -> unlink only own temp -> fsync(parent)
// owned:  compare preimage -> private verified backup -> recheck preimage
//         -> rename own stage -> fsync(parent)
// no-op:  matching bytes AND permitted mode -> return unchanged, no new backup
```

`link`-based no-clobber publication must finish with `nlink === 1`; a crash leaving the owned temp link is recovered only through its transaction record. Use exclusive random filenames bound to transaction identity; cleanup never globs. Reject unsafe ancestors, links, oversized files and unknown owned baselines. Existing owner edits block; same-UID malicious races remain outside the cooperative-writer guarantee and are documented, not claimed solved by preimage checks.

- [ ] **Step 4: Run GREEN.** Run `node tests/hermes-automation/atomic-files.test.mjs`. Expected: complete old/new files only, conflicts preserved, honest uncertain-durability result, no foreign cleanup.
- [ ] **Step 5: Run `npm test`, then commit:** `feat(hermes): publish generated files atomically without clobbering`.

## Task 6: Generate core artifacts and launcher dependencies

**Files:**
- Create: `skills/engineering/hermes-repo-install/scripts/lib/render-artifacts.mjs`.
- Create: `skills/engineering/hermes-repo-install/scripts/lib/artifact-state.mjs` (manifest validation/completion barrier; transaction coordination is Task 7).
- Create: `tests/hermes-automation/rendering.test.mjs`.
- Modify: `tests/hermes-automation.test.mjs`.

**Interfaces:**
- Consumes: validated explicit-mode plan, selected adapter/runtime mapping and Task 3 receipt merge.
- Produces: `renderArtifacts({plan,binding,runtime,selection,receipt,observations}, {registry}) -> ArtifactEntry[]`; `shellQuote(value)`; `artifactSummary(entries)`; `assertArtifactSetComplete({repo,identity})`.
- `selection` is `core` or `full`; this task implements core and rejects full with `apply-unavailable`. Task 10 adds full only with supported pre-transition/readiness contracts and completed setup gates. Test-only registry injection is in-process only.

- [ ] **Step 1: Execute generated launchers against fake Docker.**

```js
const entries = renderArtifacts(fixtureRenderInput(repo), {registry: [syntheticAdapter()]});
const main = entries.find(entry => entry.path === 'bin/hermes');
assert.equal(main.mode, 0o700);
writeFixtureEntries(repo, entries);
const run = spawnSync('sh', [path.join(repo, '.hermes/bin/hermes'), 'arg with spaces', "a'b", '$literal'],
  {env: fakeDockerEnv, encoding: 'utf8'});
assert.equal(run.status, 0);
assert.deepEqual(readDockerArgs().slice(-3), ['arg with spaces', "a'b", '$literal']);
assert.equal(entries.some(entry => entry.path === 'bin/hermes-apply'), false);
```

Use the existing fixture path class `CLI user's repo $literal`, plus newline/control-character rejection and Unicode literal names. Cover main help/no second agent, TTY/non-TTY, inherited Compose selectors, explicit context/project/file, UID/GID/HOME/workspace, shell syntax and exit propagation. Test aliases via a real compatible shell. Ensure no generator read of `.env` and no secret sentinel in summaries. Assert receipt fields survive privately without raw bytes in CLI output.

- [ ] **Step 2: Run RED.** Run `node tests/hermes-automation/rendering.test.mjs`. Expected: missing renderer assertion.
- [ ] **Step 3: Implement pure rendering.**

```js
export const shellQuote = value => "'" + value.replaceAll("'", "'\\''") + "'";
// Build shell argv from independently quoted verified literals.
// Preserve the documented launcher semantics; copy helper source bytes unchanged.
// Compose entry.bytes = JSON.stringify(plan.compose, null, 2) + '\n'.
// Return internal bytes; public summary emits path/mode/action only.
```

Move template logic into the renderer, leaving docs intact until Task 12. Implement the completion guard now: unknown/missing manifest, mismatched identity or pending transaction fails closed; matching private generated files/modes permit execution. Add failing guard tests to this task before its implementation. Copy `status.mjs`, `wait-ready.mjs`, `log-events.mjs` and all new guard/adapter dependencies as a closed dependency inventory. No arbitrary source path from input. Include only available selected aliases; unselected apply is neither inspected nor deleted. No PATH links/rc edits/ignore edits/secret generation here. Explicit mode and qualified registry binding are mandatory for production write-ready output.

- [ ] **Step 4: Run GREEN.** Run `node tests/hermes-automation/rendering.test.mjs && node tests/hermes-repo-install.test.mjs`. Expected: new generated launchers and old documented-template tests agree on observable behavior.
- [ ] **Step 5: Run `npm test`, then commit:** `feat(hermes): render validated launchers and nonsecret receipts`.

## Task 7: Artifact CLI, ownership preflight and crash recovery

**Files:**
- Create: `skills/engineering/hermes-repo-install/scripts/artifacts.mjs`.
- Modify: `skills/engineering/hermes-repo-install/scripts/lib/artifact-state.mjs`.
- Create: `tests/hermes-automation/recovery.test.mjs`.
- Modify: `tests/hermes-automation.test.mjs`.

**Interfaces:**
- Consumes: Tasks 2–6 APIs and existing `resolveTarget` as a routing hint only.
- Produces: `inspectArtifactState({repo,identity})`; `commitArtifacts(input, services)`; `recoverArtifacts(input, services)`; `runArtifactCommand(argv, services = productionServices)`; extends Task 6's completion guard.
- `services` permits trusted in-process test injection of registry/external collection/filesystem boundaries. The production entry point always uses compiled defaults and accepts no service/registry/module path from arguments, environment or input JSON.
- CLI: `node artifacts.mjs --input FILE` (summary-only preview), `--write`, or `--recover`; flags are mutually exclusive, duplicate/unknown options reject. Input file is bounded nonsecret schema data, not executable commands or approval.

- [ ] **Step 1: Add end-to-end failure tests.**

```js
const preview = runArtifacts(['--input', inputFile]);
assert.equal(preview.status, 0);
assert.equal(fs.existsSync(path.join(repo, '.hermes')), false);
const interrupted = await runArtifactWorkerWithCrash({inputFile, boundary: 'after-first-publish'});
assert.notEqual(interrupted.status, 0);
assert.throws(() => assertArtifactSetComplete({repo,identity}), /incomplete/);
const resumed = runArtifacts(['--input', inputFile, '--recover']);
assert.equal(resumed.status, 0);
const before = generatedInodes(repo);
assert.equal(runArtifacts(['--input', inputFile, '--write']).status, 0);
assert.deepEqual(generatedInodes(repo), before);
```

Use only test-process fault injection at actual publication boundaries; do not add an environment crash switch to packaged code. Cover every spec §7.3 boundary, missing/corrupt receipts, `.hermes` residue, daemon name collisions via a fake read-only discovery transport, copied identity/manifest, a changed final artifact, unknown journal version, lost approval context and unknown receipt field leak. Tests must assert Docker mutation call count is zero for every generator path, including recovery.

- [ ] **Step 2: Run RED.** Run `node tests/hermes-automation/recovery.test.mjs`. Expected: missing commit/recovery behavior assertion.
- [ ] **Step 3: Implement the bounded transaction.**

```js
// render -> validate full inventory -> inspect ownership/ignore/path boundaries
// -> acquire held lock -> repeat immediate ownership/writer/input checks
// -> stage every selected file -> persist pending journal
// -> publish dependencies then launchers then observed receipt
// -> publish artifacts.json completion -> retire only the owned completed journal
// recover: classify each final file as old/new/conflict; only old/new can finish forward
```

The write boundary must perform current safe discovery, not trust a stale JSON claim that a name is free. Fresh writes require absent/unambiguous resources; maintain requires matching receipt and current ownership/mount evidence. The operation never creates Docker resources. A missing identity with residue blocks, even if the offline resolver says create. Enforce ignore-policy preconditions without editing Git. Preserve legacy files unless exact recognized template plus explicitly reviewed adoption; no filename/header-only adoption.

Use fixed read-only Docker selectors and allowlisted output projection at the boundary. If a safe preflight cannot be performed, write is unavailable, not an offline blind force mode. Tests inject that external collection boundary; CLI cannot select an arbitrary collector. Nonsecret approvals still come from the invocation context, not the recorded JSON.

Install the completion guard before new launchers can run; unknown/partial journal fails closed. Legacy launchers require a verified inactive CLI/wizard window because they do not acquire the new barrier retroactively. Do not advance runtime phases from artifact creation. Recovery never reruns lifecycle commands or manufactures missing observations.

- [ ] **Step 4: Run GREEN and repeated resume.** Run `node tests/hermes-automation/recovery.test.mjs && node tests/hermes-repo-install.test.mjs`. Expected: interrupted writes reconcile only valid owned old/new states, duplicate runs are no-ops, source/secret files unchanged.
- [ ] **Step 5: Run `npm test`, then commit:** `feat(hermes): add guarded artifact writes and forward recovery`.

## Task 8: Deterministic official image evidence and resolution

**Files:**
- Create: `skills/engineering/hermes-repo-install/scripts/lib/image-evidence.mjs`.
- Create: `skills/engineering/hermes-repo-install/scripts/image-resolve.mjs`.
- Create: `tests/hermes-automation/images.test.mjs`.
- Create: `tests/fixtures/hermes-images/` containing synthetic manifest/config/release/source fixtures, clearly marked synthetic.
- Modify: `tests/hermes-automation.test.mjs`.

**Interfaces:**
- Consumes: `ImageBinding` contract from Task 2.
- Produces: `selectRelease({existingPin,explicitChoice,releases,platform})`; `verifyImageEvidence({selection,indexBytes,manifestBytes,configBytes,sourceEvidence})`; bounded `collectOfficialEvidence(request, transport)` where CLI uses a fixed reviewed transport.

- [ ] **Step 1: Write selection/provenance tests.**

```js
const selected = selectRelease({ platform: linuxAmd64,
  releases: [{version:'1.2.0',draft:false,prerelease:false},
    {version:'1.3.0-rc.1',draft:false,prerelease:true}] });
assert.equal(selected.version, '1.2.0');
assert.equal(selected.channel, 'release');
assert.throws(() => verifyImageEvidence({ ...validEvidence,
  manifestBytes: Buffer.from('{}') }), /digest/);
assert.throws(() => verifyImageEvidence({ ...validEvidence,
  sourceEvidence: {...validEvidence.sourceEvidence, imageRevision:'d'.repeat(40)} }), /revision/);
```

Fixtures must make stable tag absent and latest digest different from the release. Cover explicit immutable pin and existing index-pin preservation without release lookups; prereleases/drafts, semver comparison, duplicate release mapping, missing variant/platform, digest bytes/config descriptor mismatch, missing source evidence, registry errors and no older/latest fallback.

- [ ] **Step 2: Run RED.** Run `node tests/hermes-automation/images.test.mjs`. Expected: missing resolver assertion.
- [ ] **Step 3: Implement pure selection before network collection.**

```js
// priority: existing verified pin > explicit choice > highest stable official release
// verify sha256(raw bytes), index descriptor platform, config os/architecture,
// release-to-image mapping and exact source revision agreement
// output immutable platform manifest pin + index/config/source provenance
```

Use Node crypto and a strict semver parser for the supported official release format; reject ambiguous formats rather than lexicographic guessing. The collector uses only official repository/release and registry endpoints, bounded requests/time/output, explicit redirect policy and whitelisted nonsecret fields. No pull/login/source execution or configurable arbitrary URL. Public registry bearer authentication, if required, stays inside the collector and is never persisted/logged. Verify official API shapes against read-only public documentation during execution and fixture the observed format; do not invent a `stable` tag mapping.

`latest` is never a deployment fallback. An unsupported newest stable release produces a blocker and concrete alternative choice, not silent downgrade. CLI output is bounded evidence JSON; errors are fixed codes without response bodies.

- [ ] **Step 4: Run GREEN.** Run `node tests/hermes-automation/images.test.mjs && node tests/hermes-repo-install.test.mjs`. Expected: deterministic snapshot result, unchanged maintained pin and no external network in tests.
- [ ] **Step 5: Run `npm test`, then commit:** `feat(hermes): verify deterministic release image evidence`.

## Task 9: Bounded runtime operation dispatch and qualification boundary

**Files:**
- Modify: `skills/engineering/hermes-repo-install/scripts/runtime-adapter.mjs`.
- Modify: `skills/engineering/hermes-repo-install/scripts/adapters/contract.mjs`.
- Modify: `skills/engineering/hermes-repo-install/scripts/adapters/index.mjs` only when adding reviewed source-backed entries.
- Create: `tests/hermes-automation/adapters.test.mjs`.
- Modify: `tests/hermes-automation.test.mjs`.

**Interfaces:**
- Consumes: verified binding and registry from Tasks 2/8; receipt observations/invalidation from Task 3.
- Produces: `runAdapterOperation({binding,operation,selectors,priorEvidence}, {registry,transport}) -> Observation`; `readinessExit(observations)`; `diagnosticExit(observations)`.
- Operations: `preTransition`, `supervision`, `startupDependencies`, `workspace`, `identity`, `diagnostic`, `readiness`. Missing capability returns unsupported; no generic interpreter/supervisor fallback.

- [ ] **Step 1: Write fail-closed protocol tests.**

```js
assert.equal(readinessExit([unsupportedObservation]), 30);
assert.equal(readinessExit([basicMemoryObservation]), 20);
assert.equal(diagnosticExit([basicMemoryObservation]), 24);
assert.equal(diagnosticExit([ownedMaintenanceGatewayStopped]), 10);
assert.equal(readinessExit([containerUpOnly]), 30);
assert.equal(readinessExit([...prerequisiteReadyObservations, pendingConnection]), 10);
assert.equal(readinessExit(fullCurrentReadyObservations), 0);
```

Build each input fixture independently from the verdict functions. Add exact-instance/platform/source mismatch; supervisor Up/crash; safe startup activation discovering existing NumPy; genuine absence; FTS5 failure; wrong tool cwd vs legitimate gateway cwd; SOUL loader override/static greeting; stale loaded provider; added channel; missing auth/loaded-memory evidence; no writes/network refresh/second agent; oversized/hung/signaled subprocess; detached child containment.

- [ ] **Step 2: Run RED.** Run `node tests/hermes-automation/adapters.test.mjs`. Expected: missing dispatch/protocol assertion, not import errors.
- [ ] **Step 3: Implement safe dispatch and explicit mappings.**

```js
let adapter;
try { adapter = selectAdapter(binding, registry); }
catch {
  return makeObservation({ ...scope, operation: name,
    verdict: 'unsupported', reason: 'adapter-unavailable' });
}
const operation = adapter.operations[name];
if (!operation || !adapter.qualification.verified) {
  return makeObservation({ ...scope, operation: name,
    verdict: 'unsupported', reason: 'adapter-unqualified' });
}
// Validate selectors against current scoped identity before invoking the operation.
// Enforce each subprocess bound; discard raw stderr/stdout except validated fields.
```

Use the existing wait/status limits (5-second probes, 64 KiB output) and 60-second default readiness wait. No production fixture entries, dynamic imports from input, generic `hermes status`, guessed `/health` endpoint or bare-Python success. The startup dependency operation may perform only verified in-memory probes; state-writing memory tests remain outside polling in the sibling skill.

Perform read-only source discovery for the selected official release and record immutable source paths/revisions in the plan ledger. A concrete adapter file is added only after its actual source-backed commands and side effects are known; never name a guessed release in production. Live qualification requires an explicit isolated-runtime scope not supplied by this plan. Until obtained, its registry entry is unqualified and all execution paths return unsupported. Report that residual limit rather than claiming supported deployment. If source evidence cannot establish a safe operation, mark that capability unsupported and keep independent contract work moving.

- [ ] **Step 4: Run GREEN.** Run `node tests/hermes-automation/adapters.test.mjs && node tests/hermes-operator.test.mjs`. Expected: diagnostic/readiness mappings remain distinct; every unknown required gate is nonzero; synthetic fixtures prove logic only.
- [ ] **Step 5: Run `npm test`, then commit:** `feat(hermes): enforce bounded revision-specific runtime adapter contracts`.

## Task 10: Generated apply preflight and lifecycle-safe lock lifetime

**Files:**
- Modify: `skills/engineering/hermes-repo-install/scripts/lib/render-artifacts.mjs`.
- Modify: `skills/engineering/hermes-repo-install/scripts/runtime-adapter.mjs`.
- Modify: `skills/engineering/hermes-repo-install/scripts/lib/lock.mjs`.
- Create: `tests/hermes-automation/apply.test.mjs`.
- Modify: `tests/hermes-automation.test.mjs`.

**Interfaces:**
- Consumes: completed artifact guard, held lock, qualified preTransition/readiness operations and existing `wait-ready.mjs`.
- Produces: full-selection `hermes-apply` and bound probe shims. No new public waiter/status exit codes.

- [ ] **Step 1: Run generated apply against argv-recording fake Docker.**

```js
const run = runGeneratedApply({ fixture: 'image-changed-since-generation' });
assert.notEqual(run.status, 0);
assert.equal(readDockerMutationCalls().length, 0);
const disconnected = runGeneratedApply({ fixture: 'recreate-ok-channel-disconnected' });
assert.notEqual(disconnected.status, 0);
assert.equal(readDockerMutationCalls().length, 1);
const argv = readDockerMutationCalls()[0];
assert.deepEqual(argv.slice(argv.indexOf('up')),
  ['up','-d','--no-deps','--force-recreate','--pull','never','--no-build','hermes']);
```

Also assert the complete argv, explicit selectors, selected service and preserved volume flags, not only the shown suffix. Cover incomplete journal, missing/unsafe probe, new image/source, wrong mounts, active wizard, old ready receipt, maintenance command, duplicate simultaneous apply, killed parent/child lock lifetime, pending then ready, blocked/unknown/timeout and no rollback/retry.

- [ ] **Step 2: Run RED.** Run `node tests/hermes-automation/apply.test.mjs`. Expected: missing generated full-selection/pre-transition behavior assertion.
- [ ] **Step 3: Implement apply's guarded order.**

```sh
# Structure generated from verified literals, not a runnable example for this repo:
# acquire held lock -> artifact completion -> live preTransition
# -> revalidate exact image/selectors/writers immediately before mutation
# -> compose up -d --no-deps --force-recreate --pull never --no-build hermes
# -> bounded readiness wait while the scoped operation remains supervised
```

PreTransition does not require an already healthy running gateway; it verifies ownership, supported gateway launch configuration, writer quiescence and valid prerequisites. It rejects maintenance activation through apply. Do not execute any lifecycle action while generating/installing the shortcut. Unknown changed adapter blocks before recreation; current readiness failures after exactly one approved recreation stay failed. No gate may be satisfied solely by a launcher file being executable. Preserve user invocation as the request for exactly that scoped interruption, not broader lifecycle work.

- [ ] **Step 4: Run GREEN.** Run `node tests/hermes-automation/apply.test.mjs && node tests/hermes-repo-install.test.mjs`. Expected: no mutation on preflight failure and at most one recreation on approved apply.
- [ ] **Step 5: Run `npm test`, then commit:** `feat(hermes): gate generated apply on current adapter evidence`.

## Task 11: Consolidated approvals without receipt-based authority

**Files:**
- Create: `skills/engineering/hermes-repo-install/scripts/lib/approval-summary.mjs`.
- Create: `tests/hermes-automation/approvals.test.mjs`.
- Modify: `tests/hermes-automation.test.mjs`.

**Interfaces:**
- Consumes: bounded discovered action descriptions and current in-session choices, separate from receipt history.
- Produces: `summarizeApprovals({actions,currentDecisions,recordedPreferences})`; `matchDecision(action, decision)`; no executor.
- Action schema: `{id,kind,targets,method,versions,impact,prerequisites,optional}`. Decision schema: `{actionId,scope,choice}` with `accepted|declined|deferred`; no serializable global approved flag.

- [ ] **Step 1: Write exact-scope behavior tests.**

```js
const rows = summarizeApprovals({actions:[dependency,policy,shortcuts],
  currentDecisions:[acceptDependency], recordedPreferences:{aliasPersistence:'requested'}});
assert.equal(rows.find(row => row.id === dependency.id).state, 'accepted');
assert.equal(rows.find(row => row.id === policy.id).state, 'not-covered');
assert.equal(rows.find(row => row.id === shortcuts.id).state, 'not-covered');
assert.equal(matchDecision({...dependency, versions:['changed']}, acceptDependency), false);
```

Cover decline without blocking independent setup, late runtime absence as a narrow delta, accepted core vs later apply, group-write correction vs links vs rc scope, unchanged declined preference without another offer, changed downtime/image/path/method invalidation and revocation. Receipts alone never make rows accepted.

- [ ] **Step 2: Run RED.** Run `node tests/hermes-automation/approvals.test.mjs`. Expected: missing summary API assertion.
- [ ] **Step 3: Implement pure exact-scope matching.**

```js
const scopeKeys = ['kind','targets','method','versions','impact'];
// Canonicalize validated data, compare every scope key, preserve list boundaries.
// Resolve current revocation before prior acceptance.
// Historical preference suppresses duplicate optional offers, never grants execution.
```

Return one compact list with required vs optional labels and per-item state. No package install, policy edit, shortcut install or generic blanket confirmation is invoked. Pending runtime facts are displayed as pending, not guessed requirements.

- [ ] **Step 4: Run GREEN.** Run `node tests/hermes-automation/approvals.test.mjs`. Expected: separately selectable choices and only affected-scope invalidation.
- [ ] **Step 5: Run `npm test`, then commit:** `feat(hermes): summarize separately scoped installer approvals`.

## Task 12: Behavioral verification, focused references and package compatibility

**Files:**
- Modify: `skills/engineering/hermes-repo-install/SKILL.md`.
- Modify: `skills/engineering/hermes-repo-install/references/compose.md`.
- Modify: `skills/engineering/hermes-repo-install/references/host-cli.md`.
- Modify: `skills/engineering/hermes-repo-install/references/resume-and-diagnostics.md`.
- Modify: `skills/engineering/hermes-repo-install/references/readiness-and-shortcuts.md`.
- Create: `skills/engineering/hermes-repo-install/references/authorization.md`.
- Create: `skills/engineering/hermes-repo-install/references/image-and-adapters.md`.
- Create: `skills/engineering/hermes-repo-install/references/artifacts-and-locking.md`.
- Modify: `tests/hermes-repo-install.test.mjs` (test generated artifacts instead of extracting removed Markdown templates).
- Modify: `tests/skill-profile.test.mjs` and `tests/validate-package.mjs` only where new resource assertions are needed.
- Modify: `tests/fixtures/hermes-automation-behavior.md` and existing decision scenarios as needed for the new entry points.

**Interfaces:**
- Consumes: all tested helper CLIs and baseline transcripts from Task 1.
- Produces: short routing skill, authoritative reference ownership and installed resource graph; unchanged external helper protocols.

- [ ] **Step 1: Run automation-only behavior trials before new prohibitions.** Five fresh-context runs per current/control/proposed-routing variant using the same combined fixture from Task 1. Record generator selection, repeated discovery, output size/spread, approvals and every safety violation. No live Docker/network/private stores. If a control already succeeds, do not add prose to fix an unobserved failure. If automation increases safety violations, stop documentation reduction and fix the responsible code contract under TDD first.
- [ ] **Step 2: Add packaging/runtime tests before removing templates.**

```js
const installedScripts = path.join(installDir, 'scripts');
const legacy = JSON.parse(execFileSync(process.execPath,
  [path.join(installedScripts,'compose-plan.mjs'), '--repo',tmp,
   '--image', `nousresearch/hermes-agent@sha256:${'a'.repeat(64)}`,
   '--uid','1000','--gid','1000'], {encoding:'utf8'}));
assert.deepEqual(legacy.compose.services.hermes.command, ['gateway','run']);
assertMemoryHandoff(path.join(installDir,'references/compose.md'));
// Execute installed artifacts CLI help and safe preview/unknown-adapter rejection;
// run actual generated launcher tests rather than regex-extracting doc templates.
```

Check that installed helper imports resolve completely and unqualified adapters fail closed, not just that files exist. Keep existing argv/TTY/status/wait/shortcut test assertions. Add a packaging negative fixture with a missing copied dependency that causes installed invocation to fail, then restore it; this demonstrates the test catches a broken resource closure.

- [ ] **Step 3: Run RED for the new installed-resource behavior.** Run `node tests/skill-profile.test.mjs && node tests/hermes-repo-install.test.mjs`. Expected: any missing packaged closure/import is detected; if already green, record existing coverage and do not pretend a regression exists. Documentation prose changes are validated by the behavior trials, not source-string assertions.
- [ ] **Step 4: Replace duplicate rules with authoritative routes.** Entry content shape:

```markdown
## Route
- Resolve target read-only; create/maintain/status use the matching lifecycle guide.
- Before mutation: read authorization and artifacts/locking contracts.
- For image changes or unsupported runtime checks: image/adapter contract.
- For setup/host commands: host CLI guide; user runs the wizard privately.
- At memory, identity or development gates: load that dedicated reference.
```

This is a shape, not permission to omit the spec's concrete gates. Move exact existing authorization rules to `authorization.md`, image policy to `image-and-adapters.md`, storage/lock/recovery to `artifacts-and-locking.md`; preserve receipt/phase/invalidation authority in resume. Replace handwritten launcher templates with the tested generator CLI, distinguishing render-only from explicit write. Preserve existing anchors/compatibility links, memory handoff path, full-file trust loading and missing-resource behavior. Do not remove a duplicated rule until the authoritative replacement is linked from every relevant lifecycle route.

- [ ] **Step 5: Repeat guided trials after consolidation.** Expected: all five proposed-routing repetitions use the generator for supported artifacts; zero safety violations/duplicate provisioning; no broad reapproval of unchanged scope. Compare narration/discovery medians and spread with controls. Record unsupported adapter/live qualification honestly. If sample budget is insufficient, defer the affected prose change rather than claim tested behavior.
- [ ] **Step 6: Run full validation and commit.** Run `node tests/skill-profile.test.mjs && node tests/hermes-repo-install.test.mjs && npm test && git diff --check`. Expected: all pass with any platform skips explicit. Commit: `docs(hermes): route installation through tested automation contracts`.

## Spec Coverage and Delivery Gate

| Spec requirement | Owning tasks |
| --- | --- |
| Module boundaries and non-orchestrator scope | 2–11; final review |
| Explicit maintenance / existing-selector preservation | 2, 6, 7 |
| Validated launcher/receipt generation | 3, 6, 7, 10 |
| Per-file atomicity and partial recovery | 4, 5, 7 |
| OS lock bootstrap, crash and reacquisition | 4, 7, 10 |
| Deterministic architecture/digest/source verification | 8 |
| Revision-specific operations and unsupported defaults | 2, 9, 10 |
| Exact approvals and selective evidence invalidation | 3, 11 |
| Existing helpers/receipts and flattened links | 1, 2, 3, 6, 12 |
| Empty request, missing receipt, collision, dirty repo, resume | Existing resolver tests plus 2, 7 |
| Absent NumPy/startup parity | 9 |
| Writable shortcut ancestors and separate permission decisions | Existing operator tests plus 11, 12 |
| Interrupted setup and no duplicated resources | 4, 5, 7, 10 |
| Behavior tests before more prose; short routing guide | 1, 12 |
| Real adapter qualification | Task 9 source review plus separately authorized isolated smoke gate; unavailable qualification remains explicitly unsupported |

After Task 12, run one fresh-context whole-branch review against the spec, this plan, ledger rulings and the five Review Focus items. Fix Critical/Important findings with a failing regression first and a green `npm test`; record deferred minors and all rulings. Use finishing-a-development-branch; do not merge/push without the user's choice.

Completion report must list implemented helpers, tests actually run, skipped/unsupported platforms, any unqualified runtime adapters, and the fact that no deployment or private setup was executed. A green code suite is not a live Hermes readiness claim.

## Plan Self-Review

- [x] Every spec section maps to tasks or the explicit separate live-qualification gate.
- [x] Maintenance planning/artifact generation precede image/runtime breadth and documentation cleanup.
- [x] Shared function names/data contracts agree across producers and consumers.
- [x] Existing helper outputs/phases/status codes remain explicit compatibility gates.
- [x] Missing receipt, journal recovery and approvals cannot manufacture ownership or readiness.
- [x] Each task includes focused RED/GREEN commands and a full-suite pre-commit gate.
- [x] Review Focus items each have an owning regression test.
- [x] No implementation, runtime change or live adapter qualification is claimed by this document.

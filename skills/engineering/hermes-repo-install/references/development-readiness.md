# Repository development readiness is a separate gate

**Telegram ready is not repository coding ready.** Gateway/channel health, memory capability, model-reply evidence and development readiness are separate results. This contract supplements installation/repair; it does not implement a scheduler or silently provision language runtimes. Diagnose development failures when requested, and complete this gate before claiming coding readiness or enabling a separately approved coding job.

Read-only discovery may identify prerequisites during installation. Actual write probes, toolchain installs, permission changes, repository documentation, builds, recreation and job creation each stay within their applicable scope. A successful installation never authorizes recurring work. An incomplete development gate does not mean the gateway is broken or justify restarting it.

## Collect the whole prerequisite picture first

- Inspect the canonical repo's instructions, task-required skill files/maps, manifests (`go.mod`, applicable `go.work`, toolchain/CI pins), actual workspace mapping and intended execution modes.
- Record current root/submodule dirtiness read-only before proposed changes.
- Check runtime-supported tools, effective approval policy and all writers.
- Reuse unchanged ownership/source/version evidence; do not stop discovery at the first safe-to-inspect blocker.

Return one consolidated actionable blocker report. Example: **gateway ready; development blocked: tool writes deny `/workspace`; required Go absent; skill registration unavailable but canonical files readable, so direct-file loading is usable.** Resolve all three findings without calling readable skills missing. Do not repeatedly launch a failing coding task to rediscover infrastructure problems.

## 1. Prove tool-level writes, not just Unix access

A Docker read/write bind, correct UID/GID, terminal `touch` or `pwd` is necessary evidence, not proof that Hermes's write/edit tools may mutate the repo. Inspect the pinned image's actual tool guards and configuration loader, including **`HERMES_WRITE_SAFE_ROOT` where supported**. Verify effective precedence, unset/default behavior, supported root-list syntax and canonical-path/symlink handling. Do not guess that commas, colons, JSON or repeated variables are accepted.

The intended scope is the canonical `/workspace` repository **plus the runtime's required owned state access** (normally inside `/opt/data`), not unrestricted filesystem writes.

- Preserve unrelated restrictions; adding workspace must not accidentally remove required state access.
- If the installed guard supports only one root and no reviewed narrow policy can include both, report the limitation.
- Do not choose `/`, an overbroad common parent, host home, other repos, the Docker socket, privileged execution or policy disablement as a shortcut.
- Treat tool permission and Docker mount access as distinct authorization boundaries. Review the exact policy delta and obtain any missing approval; approval to mount a repo does not override an observed tool denial.
- Fresh setup can include a specifically previewed workspace/state policy within its approved scope.
- Never route a denied write through shell/Python, another tool or an unguarded internal function. An unattended approval dialog is an incompatible policy, not a timeout problem.

### Actual-tool canary

Before claiming write readiness, within a disclosed, authorized single-writer window:

1. Bind the test to the intended repo, runtime user/home, workspace and **execution/approval mode**. Review a supported non-inference tool invocation path that applies the same policy/approval middleware as actual work. A direct implementation call that skips those guards proves nothing. If no safe faithful invocation exists, keep verification pending or request a separately scoped user-assisted/end-to-end check; do not send an LLM request by default.
2. Choose one harmless, unique temporary repo file, not a tracked/project source file. Verify its parent and canonical scope, and create/reserve the path exclusively using a supported safe mechanism. Never overwrite an existing path, follow a symlink or race an unknown owner. If safe exclusive ownership cannot be established, stop instead of weakening the test. Keep probes in an already approved narrow ignore scope, or obtain scope for a reserved-name rule before creation, following the [ignore-policy contract](ignore-policy.md). Never broaden ignore rules to hide failed cleanup.
3. Use the actual Hermes **write** operation to create known synthetic content, then its actual **edit** operation to make a deterministic change. Read back through supported tools and verify the expected content. Parse tool-level denials/errors, not merely transport exit status. A terminal write is not a substitute for either result.
4. In a `finally`/equivalent path, invoke the supported policy-mediated cleanup/delete operation for **only this owned synthetic file**, then verify absence. Recheck ownership/content before deletion: preserve a file another writer changed. If write/edit/cleanup is denied, do not bypass it with raw `rm`, a host edit or another permission path. Record whether a file was actually created, the remaining synthetic path and the narrow cleanup blocker. Failed cleanup fails the development gate.
5. Close the probe and compare repo state to the baseline: no unexplained source, Git index, module-file or submodule changes. Record the real tool/mode/version results, not file contents or sensitive configuration. Repeating a read-only status check must never repeat this write probe.

## 2. Toolchain requirements and persistence

For a Go repo, inspect `go.mod` and applicable `go.work` plus recorded CI/toolchain requirements. The `go` directive is a language/minimum-toolchain constraint; `toolchain` can express a suggested toolchain, not universally an exact deployment pin. Resolve conflicting requirements before selecting an exact approved version; do not rewrite module/workspace files to make an available compiler appear compatible. If Go is not required, mark it not applicable—do not install it for every Hermes repo.

- Check already available tools before proposing installation. Resolve binary paths, versions, architecture, provenance and persistence in the actual container, not the host or a one-off shell.
- Avoid Go auto-downloading a toolchain/module during diagnosis: inspect directives first and use the installed version's supported no-download discovery (for example `GOTOOLCHAIN=local` for a bounded check when supported). Record any probe-only override; it does not prove the production context has that setting or authorize silently changing it.
- No `go get`, module tidy, build/test scripts or network dependency fetch as a version check.
- If missing or incompatible, request a concrete scoped plan: exact verified toolchain version, official artifact/source and integrity check, architecture, supported persistent install location or reproducible derived image, storage impact and runtime activation. Do not fetch/install/build without that approval, use an unpinned latest/curl-to-shell installer, modify an immutable image tree, install only on the host, or duplicate a usable runtime. Installation permission is not approval for source changes or dependency downloads by future builds.
- Configure activation through the image's supported persistent launcher/environment path, narrowly preserving other settings. An `export PATH=...` in the agent's shell, a host rc edit or a binary under an ephemeral `/tmp` path is not provisioning.
- Verify the chosen exact version/path in each **required** consumer:

| Consumer | Evidence |
| --- | --- |
| Gateway tools | Actual supported terminal/tool execution with its normal user, cwd, environment and approval middleware resolves the approved toolchain. |
| Private CLI | The verified scoped CLI's tool environment resolves the same required version; success in an unrelated `docker exec sh` does not establish CLI behavior. |
| Noninteractive cron/job runner | A supported non-mutating runner preflight/dry-run reproduces the actual non-login environment, user/home, cwd and selectors without enabling/running the coding job. Shell rc assumptions and interactive PATH exports are insufficient. |

When a consumer cannot be faithfully tested without creating a job or invoking a model, mark that mode pending and request the specific verification scope; do not fabricate parity. Provisioning must reproduce the same settings after an **approved** one-service recreation. Recheck version/path, activation, skills and tool policy afterward. No extra recreation solely to obtain evidence without scope; no claim of durability from a named volume alone. Preserve source, module files and the approved image/volume boundaries, following the existing lifecycle and memory durability gates.

## 3. Skills and missing repository prerequisites

Resolve task-required skill files and their references from trusted canonical paths, and verify readability by the **intended consumer inside the runtime**. A host-readable file outside the mounted scope is not automatically usable by gateway or cron. Separate file availability, loader registration and successful instruction loading.

When registration/catalog access fails but trusted canonical `SKILL.md` and references are readable, explicitly load those files and include their canonical paths/resource bases in the task handoff. Say **direct-file instructions available; registration unavailable**, not “skill unavailable.” Do not reinstall, register slash commands, mutate Pi settings, refresh submodules or request a reload merely to read them. A direct read does not register a command or install a runtime plugin. Honor explicit trust denial and keep runtime plugin dependencies separate from prose availability. No broad host mounts or arbitrary-copy fallback around a missing/denied source.

When a selected task explicitly requires a missing `codemap.md` or other artifact, give a scoped documentation handoff:

- **Trigger:** exact required artifact is absent/unusable for this task; do not impose that filename on unrelated repos.
- **Artifact/target:** canonical repo path, required output file and the real source/code facts available to build it; do not invent a map or copy one from another repo.
- **Next workflow:** available source-backed repository documentation workflow (for example **wiki-docs**) or a bounded manual documentation task. Request the exact write/generation scope if absent; no implicit dependency install or tracker action.
- **Success signal:** readable source-grounded document satisfying the task's requirement, then recheck only the dependent gate.

If it is a maintained artifact, verify trackability through the [ignore-policy contract](ignore-policy.md): obtain any missing narrow ignore-edit scope, prefer `!/codemap.md` over removing broad generated-map rules, and retain `.hermes/` protection. Do not stage/force-add the document or silently untrack secrets.

Continue independent authorized discovery; do not turn a missing map into indefinite refusal, silently waive an actual task requirement or present a placeholder as a verified map.

## 4. Keep upstream maintenance separate

Before assuming a repo-local dependency/skill can be used, inspect `.gitmodules`, relevant **sanitized** remote identity, the superproject's recorded gitlink (including an index change if present), submodule HEAD and local dirtiness read-only. Remote URLs may contain credentials: never print tokens/userinfo/query secrets. Distinguish an absent submodule checkout from unreadable registration.

Install scope does not authorize `submodule update --remote`, pulls/fetches, checkout/reset/stash, branch changes, commits or changing a gitlink. Preserve pre-existing root and submodule edits, including module files. A required missing submodule may need a separate initialization plan at the **recorded commit**, not latest upstream; even that plan needs its own scope and preservation checks. Existing divergence is not installer damage and is not automatically a blocker to unrelated runtime setup. Never refresh upstream just to obtain a clean install report.

## 5. Approval compatibility, coordination and coding jobs

Development readiness is scoped to a task and execution modes, not a blanket permission grant. Determine whether the intended operations—write, edit, cleanup, compiler invocation and any network/build actions—can run under the actual policy. Interactive approval compatibility does not prove unattended compatibility. Request the missing narrow scope through supported controls; do not increase timeouts, grant unrestricted writes, suppress dialogs globally or wrap denied mutations in another tool.

Check cron, interactive coding, builds, wizard and maintenance before stateful probes, installs or restarts. Coordinate **all writers to the same canonical repo/home** using supported no-overlap/lock or operator-managed maintenance semantics; per-job serialization alone does not exclude an interactive builder. Verify who owns any lock and whether its holder is live. Never delete an unknown/live lock, kill another task, restart during an active turn or create a second agent to test concurrency. If all relevant writers cannot participate in a verified coordination scheme, unattended readiness remains blocked. The setup lock alone is not evidence every future writer honors it.

Before enabling a **separately approved** coding job, verify:

- Current gateway/runtime prerequisites and the task's development evidence: workspace/bind, tool-level write/edit/cleanup, required toolchain/version, usable skill sources/maps, approval compatibility and coordination.
- Exact job identity/owner, canonical repo/task scope, runtime image, user/home, cwd and required context/project/service/profile selectors. Neutralize conflicting ambient selectors through supported configuration; do not guess or select another worktree/profile.
- Approved schedule, allowed operations and failure/no-overlap policy. Inspect existing job identities/destinations first to avoid duplicate schedules or clobbering another job. A readable skill, successful install or approved dependency change does not create job authorization.
- Supported preflight/failure handling that prevents unchanged deterministic infrastructure failures from starting another identical coding attempt every interval. Preflight is bounded and non-mutating; it checks evidence, not repeated write canaries, installs, full builds or recreation.

For a newly approved job, disclose and obtain scope for its exact failure latch/pause behavior and owner notification as part of the job plan. If the scheduler cannot provide that behavior safely, leave job enablement pending and hand off the limitation; this installer does not implement a scheduler. Re-enable/retry only after relevant inputs change, the failing gates are reverified, and scope still applies.

For an **existing** job repeatedly failing on the same infrastructure blocker, issue one consolidated actionable report and request an exact-job pause/remediation if not already authorized. Do not silently disable/delete/reschedule it, modify unrelated jobs, or promise failures stopped when the scheduler may continue. Deduplicate unchanged reports within the current task; persistent suppression/latching needs an authorized supported mechanism. Do not manually retry the same denied/missing-prerequisite command to manufacture progress.

## 6. Evidence, invalidation and outcome reporting

Keep development results under the existing receipt's **`evidence.development`**, written only during authorized setup/reconciliation, not read-only status. Use a scoped result (`not-assessed`, `pending`, `blocked`, `ready`), intended task/modes, observation time, image/container and applicable process identity, plus per-gate evidence/blockers. Record required tool versions/activation, canonical skill paths/loader-versus-direct mode, tool policy scope and actual write/edit/cleanup outcomes, workspace/selectors, prerequisite handoffs, approval compatibility, writer coordination and recreation result. No secrets, raw command environments or private skill contents.

- Missing/stale evidence is unknown. A `ready` setup **phase** continues to mean runtime lifecycle readiness; it does not fill in `evidence.development`.
- Keep pending development reasons in this section without overwriting an earlier runtime blocker.
- Invalidate dependent development evidence when repo/task requirements, image/container, toolchain/environment, safe-root or approval policy, skill sources, workspace/selectors or job execution context changes. Reuse unaffected evidence, but a recreated environment needs current consumer/tool-policy checks.
- Mark not-required modes as not applicable rather than pretending they were tested.

Use an outcome receipt with four distinct categories:

1. **Changed this turn:** exact files/settings/resources actually changed by this work, plus synthetic probe cleanup result.
2. **Pre-existing changes preserved:** root/submodule dirty state and owner changes left untouched; do not attribute the whole diff to this turn.
3. **Denied or not executed:** distinguish an attempted tool request denied before mutation from a command never submitted; neither is completed validation. Record the safe reason, not secrets.
4. **Validation completed:** exact commands/tools, execution modes, observed results and unresolved limits. A proposed command, terminal touch, stale receipt or successful channel connection is not coding verification.

Example: **Runtime: ready. Development: blocked (Go missing; Hermes write/edit deny `/workspace`). Skills: direct-file usable; registration unavailable. Coding job: not enabled. Next: approve the specific persistent toolchain and narrow policy plan.**

## Boundary/collision checklist

- **Runtime versus development:** preserve `hermes-readiness-probe` and `hermes-diagnostic-probe` exit-code meanings. No new code or setup phase is introduced for this gate; runtime status/apply success explicitly disclaims development readiness.
- **Read-only status versus writes:** never put write/edit/cleanup canaries, dependency installs, document generation, job mutation or upstream maintenance inside polling/status adapters.
- **Mount versus policy:** retain `/workspace` and required owned-state access without broadening to `/`; an allowed shell command never bypasses a denied write tool.
- **Shared workspace versus job IDs:** coordinate across cron, interactive work and maintenance for the same repo, preserving unrelated jobs/resources and live locks.
- **Host versus container:** check skill/toolchain visibility in the actual gateway/CLI/cron consumer; preserve memory startup activation and SOUL identity rules. No duplicate host/runtime installs.
- **Installation versus delivery:** toolchain provisioning, scheduled work, documentation and submodule updates each keep their own scope; none implies commits, pushes, deployment or external tracker mutations.

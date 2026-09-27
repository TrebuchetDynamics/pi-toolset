# Resolve routine choices; ask only at real boundaries

Read this with [authorization](authorization.md). The installer owns technical decisions and performs covered work; the user supplies private credentials and genuinely missing authority or intent. This procedure does not weaken ownership, recovery, writer coordination, tool permissions or readiness evidence.

## Classify the request once

| Observable request | Action |
| --- | --- |
| Explicit `/hermes-repo-install` or `/skill:hermes-repo-install`, with no arguments or an empty expanded `Repository request:` | Install/fully reconcile the current Git worktree's repo. Resolve it offline, preview impacts once, then execute covered supported work. Empty arguments omit the path, not the request. |
| Install/resume/repair/update with an explicit path | Resolve that path as data; same reconciliation scope. |
| Status, plan-only, no-download, no-restart or version hold | Honor that narrower limit. |
| Read, explain, test or improve the skill; pasted logs/examples for analysis | Work on instructions/evidence only. Do not deploy the repo named in a transcript. |

Reading instructions is not deployment authority; an explicit install invocation is. After classifying the request, revisit it only when the user changes scope or new ownership/safety evidence invalidates it—not because execution is lengthy.

## Action loop

Keep a small checklist: **gate → observed evidence → next executable action → result**. Use the existing receipt during authorized owned-state work, otherwise keep notes in task context. Read required files fully once, load conditional references when their gate is reached, and reuse unchanged evidence.

| Gate state | Installer action | User interruption |
| --- | --- | --- |
| Evidence missing but safely discoverable | Run the bounded supported check. | None. |
| Required correction is covered and supported | Preview the concrete delta, apply with preservation checks, verify. | None. |
| Selected image/helper cannot implement the desired layout yet | Follow compatibility recovery below. | None merely to choose engineering methods. |
| Private login/setup is the next safe gate | Finish independent safe preparation; provide one verified private command and wait for completion, not output. | Required user action, not another approval. |
| Ownership conflict, unsafe recovery, active uncoordinated writer, unsupported interface or denied tool | Stop dependent mutation; continue independent permitted checks. State evidence, attempted safe remedy and the exact missing condition. | Only a concrete fact or additional scope the user can supply. |
| Optional PATH/rc shortcut unavailable | Keep runtime verdict separate; use an independently verified trustworthy access route if available. | Do not make optional persistence a setup decision. |

Before calling a gate blocked, distinguish **not checked**, **failed**, **unsupported**, and **denied**. Report the exact failed prerequisite rather than turning the whole task into a choices interview. Do not repeat failed commands against unchanged inputs, poll for private setup completion, or present actions already covered by the invocation for approval again.

Progress updates state an action, result or real blocker; save reconsideration and full inventories for internal work/evidence. Docker version/context/daemon metadata are sufficient prerequisite checks: do not pull `hello-world` or inspect unrelated installations for precedent. Scope discovery to the required name/project, target mount and possible ownership conflicts; broad names-only collision discovery does not authorize reading sibling homes, credentials or configurations.

## Compatibility recovery, not a layout menu

1. Verify the selected official stable digest/platform and matching source. Record exactly which revisions were checked. One incompatible image (or moving-main snippet) is not proof that no compatible revision exists. Respect holds; do not downgrade or chase unrelated historical images to avoid qualification.
2. If a compatible official candidate is found, qualify it against [workspace state](workspace-state.md), bootstrap, maintenance, user, CLI/gateway and package activation. If the selected stable base is incompatible and no compatible supported candidate is established, investigate and, when safely supportable, build the necessary reproducible derived image under the invocation's existing scope. Do not ask the user to choose between this required route and a legacy-layout exception.
3. Before the first pull, build or state-writing fixture/probe, give the impact preview (pinned base, proposed changes, local resources, recovery and any service interruption) and pass ownership, protection and relevant writer checks. A derived identity is pending until built; do not invent it in the preview. Review pinned build inputs and source changes, keeping the build context minimal and free of repo secrets/state. Record the official base digest, source revision, patch/build recipe, platform and resulting immutable image identity. A few HOME substitutions are not qualification: inspect every relevant launch path, inherited `VOLUME` declarations, effective mounts, writable paths, UID/GID handling, supported maintenance and dependency activation. Preserve `/init`, privilege drop and immutable runtime code protection. Qualification uses a scoped isolated fixture, not another production agent sharing the real home. Never claim a build/probe not actually run.
4. The [offline planner](../scripts/compose-plan.mjs) intentionally accepts only official digests. **That helper restriction is not a deployment or approval boundary.** For a fresh derived-image plan, generate the `compose` shape using the inspected official base digest, then replace only `services.hermes.image` with the qualified derived immutable reference; keep `identity` and `requiredConfig` separate. A local-only build can use its verified full Docker content image ID (`sha256:…`) with pull disabled; record it as an image ID, not a registry manifest digest. Never substitute a mutable local tag, relabel a build as official, or publish to a registry implicitly. Recheck the image identity, effective configuration and mounts; validate scoped Compose configuration with `config --quiet` before applying. Existing installations still use narrow observed-state reconciliation, not fresh planner output.
5. If a specific qualification, reproducibility, maintenance or recovery check fails, preserve the existing installation and report that exact blocker plus remaining independent progress. Do not demand a user decision that cannot supply implementation support. No silent `/opt/data` fallback, false workspace-local claim or readiness from a build alone.

## Copied receipts and tracked state

A foreign receipt stays **blocked**, even when the old path is unavailable and no matching container/volume exists. This is not a fresh-install signal or permission to rewrite identity. Do not execute copied launchers. An empty `setup.lock`, old timestamp or maintenance CMD proves neither stale lock nor absence of a wizard/other exec; check actual locking/writer evidence.

Finish target-specific read-only discovery: receipt/path mismatch, applicable index/ignore protection, intended container/project/mount collisions and state provenance without secret contents. Distinguish tracked runtime files from maintained owner documents and roster instructions. Missing expected credential filenames is not proof that the tree/history is secret-free or safe to discard. Preserve foreign data and locks; do not auto-untrack or create replacement state.

Recommend **one viable preservation-first recovery plan**. Name the verified local target, the copied tree to preserve, proposed private backup location/permissions and recovery checks, and the exact source/index changes needing separate scope. Preserve roster/instructions for later review without importing credentials, creating a team or releasing work. When ownership is the unresolved fact, ask that fact first; do not bundle an assumed ownership transfer into approval. When provenance and intended local target are clear but source/index remediation is outside scope, ask one focused authorization question covering the concrete proposed remedy, rather than asking the user to clean everything manually and re-run. For example: “May I preserve the copied `.hermes` tree in the proposed private archive, make only the reviewed runtime-path index/ignore changes, and prepare a new local home without importing old credentials or launching its team?” Backup, ownership, lock and collision checks must still pass before any approved operation.

Do not offer an unavailable old checkout as an alternative. Do not perform the proposed recovery in ordinary install scope. Re-resolve immediately after a separately authorized recovery; proceed only when the identity and state boundary is unambiguous. Unknown live resources or shared state remain blockers, not candidates for automatic adoption.

## One trustworthy setup route

Optional persistence is separate from path trust. A rejected `~/.local/bin` link does not make runtime unhealthy; an absolute launcher or sourced alias does not cure writable ancestors. Prefer an independently verified direct Docker exec route from [host CLI](host-cli.md) when container ownership, CLI privilege drop, HOME/workspace and all-writer maintenance are established. Otherwise identify the exact access/trust remedy needed. Do not chmod shared ancestors, edit rc files or accept path-replacement risk on the user's behalf. Keep the optional persistence decision and existing phase unchanged.

## Short, accurate handoff

Default output is a short paragraph plus at most a few bullets and **one next action**:

1. **Runtime: ready / prepared / blocked; reconciliation: aligned / partial; development: ready / pending / blocked / not assessed.** A remaining required migration/update/support gap means partial, never “reconciliation complete.” Preparation can coexist with a documented alignment blocker; do not hide it behind setup pending.
2. Repo/container and verified workspace/agent name; changed items and the decisive validation result. Keep raw hashes, selectors, source inventories and detailed gate evidence in the private receipt when authorized. Report memory evidence at its actual scope: dependency/HRR survival after recreation is not DB/canary/loaded-gateway durability.
3. Remaining required blockers versus normal pending private setup, plus unavailable optional conveniences. Give only the verified setup command or exact missing user fact/scope. Do not supply a setup command when the required access/writer safety gates remain unresolved.
4. Compact effects accounting: this turn's changes, prior changes preserved, denied/not-run actions, validation actually completed. Image pulls/builds, temporary files and probes count as changes even with a clean Git status. If effects were accidental, disclose them; do not claim “read-only” or silently prune/delete them. Do not echo credentials or private logs.

This output contract compresses the [required evidence](resume-and-diagnostics.md); it does not turn absent observations into passes. A user action that cannot resolve a technical blocker is not a useful next action—state the missing implementation support instead.

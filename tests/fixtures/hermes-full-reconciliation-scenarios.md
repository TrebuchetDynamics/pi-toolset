# Full reconciliation without repeat approvals — reference trials

## Request and bounded scope

An explicit `hermes-repo-install` invocation should repair/update every applicable detail of the verified repo-owned Docker Hermes setup without additional approval prompts. This change modifies agent instructions and packaging coverage, not live deployment state or a universal migration executable. Explicit status-only/no-restart/version-hold limits, ownership, safe recovery, tool controls and private credentials remain binding.

## Baseline (before the authorization change)

A fresh reader of the installer and its local references applied a fictional scenario: owned existing installation, old image with a verified compatible official stable replacement, legacy volume/home requiring migration, missing supported persistent dependency, stale launchers/probes and already-selected misconfigured Kanban. Consistent backup/recovery was possible; no active worker was present. Provider/model, credentials, unrelated source, cards and optional choices had to survive.

The baseline reported:

> “Current instructions require full assessment, not unconditional full repair.”

It correctly protected ownership and data, but required additional authorization for the exact image update, data movement/downtime, dependency installation and integration changes. It identified the absence of a no-prompts full-reconciliation contract. This is the observed reference gap, not proof of an unsafe runtime implementation.

## Guided application

A fresh reader used the changed installer entry and local references for the same scenario, plus required derived-image/index-repair and dormant-backlog variants. It recovered:

- One informational preview, then all covered supported corrections without another approval.
- Current official stable immutable image assessment/update, with explicit version holds and verified compatibility/recovery before replacing the old pin.
- Supported persistent dependencies, required source-reviewed reproducible derived image, owned home/database migration, metadata-preserving vector repair, scoped lifecycle and actual non-inference verification.
- Full per-family inventory and final sweep, preserving data/customizations and selected options; a first successful fix or healthy gateway does not establish full alignment.
- Unknown ownership blocks mutation; unsafe migration preserves old state and blocks its dependents; private login is user action rather than an approval checkpoint; status-only stays read-only.
- Selected Kanban configuration repair is not new task/inference/budget/messaging authority. Dormant backlog must not be released by treating restart as permission for all work.

It retained source-qualified runtime support as a prerequisite and made no deployment-success claim.

## Independent review and handoff regression

Read-only review identified two instruction conflicts:

1. Detailed private-setup continuation templates still promised another recreation approval.
2. The required sibling memory workflow unconditionally prohibited database movement and asked again for dependencies despite supplied installer scope.

The templates now promise completion of covered reconciliation after safety gates. The sibling adapter explicitly accepts the concrete Compose reconciliation scope, returns migration/index/lifecycle ownership to the installer, then verifies the resulting mapping. Standalone named-profile requests retain their narrower permissions.

A second fresh trial read the full installer **and sibling memory handoff**, applying these cases:

- Existing owned instance after private setup: supported NumPy installation, home/DB migration, metadata-preserving backfill and recreation proceed without reapproval after prerequisite checks; installer owns transitions and memory verifies the result.
- Standalone memory setup for `atlas`: dependencies/movement/service interruption do not inherit installer authority.
- Installer status-only or no-restart: narrower limits win; necessary blocked transitions remain pending rather than bypassed.

The trial recovered the corrected continuation wording and all three boundaries. Independent follow-up review confirmed both findings resolved, with no new substantive blocker.

## Checklist and executable evidence

- [x] Baseline reference gap observed before the authorization edit; desired scope and safety conditions specified.
- [x] Existing skill name/frontmatter retained; entry, scope table, full-sweep procedure and concrete handoff conditions updated rather than a new skill or script.
- [x] Packaging regressions first failed for the missing authorization reference: `installed Hermes must include authorization guidance` and the missing npm resource assertion.
- [x] Real flattened-install tests now check byte-preserving reference inclusion and local-link closure; npm dry-run manifest includes the reference.
- [x] Guided applications and independent review completed; conflicts corrected and full handoff rechecked.
- [x] Full `npm test` and `git diff --check` passed for the corrected instructions.
Git delivery was deferred during these implementation trials; shipping is a separate requested operation, not runtime qualification.

These are reference-application samples and offline/package regressions, not repeated reliability trials or Docker/runtime qualification. No image was built/pulled, deployment inspected/changed, database migrated, credential read, model invoked, task dispatched or message sent. No production adapter was qualified. The separate unfinished automation worktree and live Arenaton installation were untouched.

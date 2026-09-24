# Maintain existing teams without rebuilding them

Use for roster changes, instruction/tool/skill updates, model or authentication repairs, configuration drift, retirement, and explicitly approved migration. This is a manual procedure using native facilities, not a new service or a scheduled campaign.

## Reconcile observed and desired state

1. **Identify the team.** Reuse its recorded profile IDs, homes, repo, board, root interface and dispatcher owner. Prefixes are discovery hints, not ownership evidence; a similarly named profile is not automatically part of this team. Follow the minimal, redacted reconnaissance rules in discovery. Record version drift before relying on old commands.
2. **Record the requested delta.** Compare role remits/SOUL, effective repo context, tools, installed/loaded skills, model pairs/overrides, auth status, board/worktree binding and interface routing as relevant to the request. Separate intentional overrides from accidental drift. Do not turn an instruction edit into a login, model reset or whole-host audit.
3. **Check active consumers.** Before changing live-read configuration or ownership, establish whether running/queued/review cards, active conversations, subscriptions, scheduled work, service launchers or other boards reference that profile. Inspect metadata, not private transcripts. Defer changes that could alter an active run or enable unauthorized ready work; finish independent safe changes.
4. **Apply the approved minimal change.** Patch only affected fields or instruction sections. New members use the team's established naming convention unless a naming change was approved; new teams use the flat `-team` convention. Preserve unrelated SOUL text, config keys and overrides. Update the existing team briefing's revision, coverage and readiness evidence when affected; verify root reloads it before routing new work, rather than trusting stale session context. Reuse existing cards and worktrees. Creating, cloning, resetting or renaming profiles is not ordinary maintenance.
5. **Verify the result.** Read back the changed nonsecret state; verify the affected effective runtime surface only within approved scope. Keep auth/inference/release evidence separate. Determine whether existing sessions reload instructions/config or require an approved fresh turn/session/restart; persisted changes alone do not prove an active worker adopted them.
6. **Repeat safely.** If desired and observed state already agree, report no-op: no new profiles/cards, duplicate instruction blocks, gratuitous backups or shared-service restarts. Preserve a scoped recoverable baseline before necessary writes. On partial failure, stop that branch and restore only this operation's owned changes after checking for intervening writers; do not overwrite newer user state.

### Compact maintenance receipt

| Target / actual ID | Before → intended → observed | Preserved | Evidence / next action |
| --- | --- | --- | --- |
| Existing implementer SOUL | old test instructions → new commands → read-back result | unrelated remit, model pair, memory | exact diff; active-session reload not checked |
| Existing reviewer | no change | provider override, current card/worktree | no restart or reassignment |

Include every profile's resolved model/auth status when readiness is being assessed. A narrow instruction-only update can reuse recorded values marked **not rechecked**; do not trigger credential refresh or paid inference just to fill a report.

## Safe retirement is not deletion

A retirement request starts a drain-and-retain procedure. It does not authorize deleting a home, logging out, stopping a shared gateway, or rewriting history.

1. Mark retirement **pending** in the existing team record/receipt and stop proposing new assignments to that profile. This prose alone does not stop native dispatch. Inventory ready, queued, scheduled, blocked and review references, prerequisite edges, fallback/orchestration assignments, and cross-board consumers.
2. Establish an authorized, verified way to prevent new dispatch to the affected profile/cards while existing authorized work finishes. Never invent a `retired` config field or `hold` card status. If the only available control affects unrelated boards/services, seek that specific approval; otherwise report retirement blocked, not complete. Scope any native holds/reassignments to the approved cards and preserve their IDs/dependencies.
3. Allow current authorized work to finish unless stopping it was explicitly requested. Verify actual process/session/workspace quiescence; a done card is insufficient. Keep current review/candidate ownership intact. Resolve queued dependents and review assignments through approved native reassignment to a ready replacement; do not release unapproved work or silently discard dependencies.
4. Remove the profile from the active team roster only after references and dispatch exposure are resolved. Retain its home, identity, configuration, credentials, memories, sessions and owned workspaces. Report **retired from this team, retained on disk** with evidence and remaining external consumers; do not claim it is globally disabled merely because a roster changed.
5. Permanent removal is a separate explicit destructive request with a reviewed retention/backup plan. Check the installed operation's actual side effects first. In the reviewed Hermes source, `hermes_cli/profiles.py:1693+` deletion stops profile-bound services/backends and removes state; it is not an innocent way to hide an inactive role.

For live task failures, use the [team contract's bounded recovery checks](team-contract.md); maintenance approval does not authorize retries, extra spend or replacement writers.

## Naming migration is separate

The flat `-team` convention applies to **new teams**, not automatic renaming of working teams. A display label may improve readability where supported, but it does not change a native profile ID or directory.

If migration is explicitly requested, first map old → new IDs/homes and every assignee/reviewer, board, session, routing/subscription, alias, service, memory and credential reference. Verify installed native migration support, ownership, collision handling, quiescence and rollback before applying anything. Do not invent a rename command, move directories blindly, use symlinks to bypass identity resolution, copy OAuth stores, or patch Hermes source. If state-preserving migration cannot be verified, retain current IDs and report the blocker. Never recreate existing work under new card IDs to simulate migration.

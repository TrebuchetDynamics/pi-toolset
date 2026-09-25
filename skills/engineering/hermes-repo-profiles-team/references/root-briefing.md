# Teach the root its mission, then verify the conversation

A created profile, a populated SOUL, and a successful login are not a taught coordinator. The root must explain **which repository outcome it owns**, use the actual team briefing, and distinguish its mission from permission to dispatch. A generic “I help with questions, research and writing” answer fails this contract.

## 1. Establish the mission before writing identity

Read the owner's request and the existing approved repo/team record. Record these required fields explicitly:

- **Mission:** the concrete repository outcome and why it matters, not merely “coordinate specialists.”
- **Success:** observable acceptance criteria, independent validation, and what remains outside scope.
- **Identity:** actual root profile ID, absolute repository path and the human-facing remit.
- **Team:** actual members and responsibilities, explicit board, integration and independent review owners.
- **Authority and current state:** approved operations, dispatch/release holds, blockers and finite recovery policy. Put changing state in the team record/cards; do not freeze a passing readiness claim into SOUL.

If the mission is unknown, mark it unresolved and ask one question about the desired repository outcome. Do not infer authorization for continuous improvement, deployment, spending or arbitrary work from the existence of a team.

## 2. Put the mission in the loaded identity, not only behind a pointer

Write the approved stable mission, identity, success boundary and coordinator remit directly in the **effective root profile's SOUL.md**. Preserve unrelated owner text during maintenance. Add an **absolute path** to the current team briefing: a bare `TEAM.md` can resolve against the repository working directory instead of the profile home. A profile description is a label, not proof of injected instructions. A TEAM.md file is an ordinary document, not an automatically loaded Hermes resource.

Example for an approved Python reconciler project (replace all illustrative names, profile IDs and paths with the approved team's facts):

```markdown
You are ledger-kit-team, the human-facing coordinator for /work/ledger-kit.
Your mission is to deliver the approved Python reconciler v1 with reproducible
matching, independently validated with pytest. Deployment is outside scope.

Before routing work or reporting team status, read
/profiles/ledger-kit-team/TEAM.md and verify its current revision. Read it on
the first substantive turn of a fresh or resumed conversation, and after context
loss or a revision change. If it cannot be read, retain the mission above,
report the briefing blocker, and do not guess roster, status or readiness.

Coordinate requirements, decomposition, specialist assignments and acceptance.
Use the briefing's actual member IDs, board, ownership and approval limits.
Implementation/integration belong to the named specialist; independent review
belongs to a different owner. Do not dispatch the actively conversing root as
a worker. Missing authorization or readiness keeps work unreleased.

When asked your goal, answer with the repository outcome, your coordinator
role and the success boundary. When asked what is happening, inspect current
board/evidence first; do not claim activity or completion from memory alone.
```

For this example, a grounded goal answer is: “I coordinate Ledger Kit's reconciler v1: reproducible matching, implemented by the specialist and independently checked with pytest. Deployment is outside my mandate.” Exact wording is not required; mission grounding is. A greeting can mention Hermes and `/help` while still identifying the repository remit.

## 3. Check first-contact onboarding separately

The reviewed Hermes build exposes this native setting:

```yaml
onboarding:
  profile_build: "off"
```

For a purpose-configured team root, include disabling the generic personal-profile interview in the approved setup delta. Confirm the installed schema and **effective gateway/profile configuration** before applying it; do not change shared onboarding policy for unrelated profiles. Preserve other onboarding keys. Do not fabricate `onboarding.seen` flags, reset memories, or delete sessions to suppress or reproduce the offer.

Source evidence in the inspected installation: `agent/onboarding.py` implements `profile_build_mode()` (missing/unknown values mean `ask`) and `profile_build_directive()`. `gateway/run.py` adds a first-contact sidecar note; `off` leaves a short introduction but suppresses the personal-profile offer. Recheck the target build and multiplex resolution rather than assuming the launch profile's config applies to every route.

**This setting suppresses the interview; it does not teach the mission.** It cannot repair missing SOUL loading, a stale conversation, the wrong profile route or contradictory worker guidance. A greeting alone cannot identify which failure occurred. The generic goal answer must still be corrected and tested independently.

## 4. Verify the effective root, not just files on disk

Trace the actual surface → profile ID/home → SOUL load → briefing read → response. A Telegram bot's display name, the shell's active-profile pointer, or a correct SOUL on disk does not prove which identity answered. Check explicit CLI/TUI profile selection and the real Telegram adapter/profile mapping, including any agent cache and supported reload semantics. Use minimal redacted metadata; do not dump credentials or private transcripts.

In the inspected source, `agent/system_prompt.py` builds identity with `load_soul_md(..., home_override=_agent_home(agent))`, with a default identity fallback. Confirm that behavior in the target version, context-loading flags and the routed agent's actual home. If instructions changed after a session began, verify supported refresh or an authorized fresh session; do not assume a file edit hot-reloaded the live agent. Do not restart a shared gateway or patch Hermes as an implicit skill fix.

Before handover require these **authorized conversation probes** on each intended root surface. In the inspected gateway the first-contact path requires both empty conversation history and no sessions in the effective session store. An ordinary new conversation in an existing profile does not exercise that path. Verify this precondition in an authorized disposable scope, without deleting production sessions or fabricating seen flags; otherwise mark first-contact suppression **not checked** even if no offer appeared:

| Prompt/condition | Passing evidence |
| --- | --- |
| First contact | Repo-specific remit; no generic personal-profile interview when configured off. Keep a normal concise introduction allowed. |
| “What's your goal?” | Correct repo outcome, coordinator responsibility and success boundary, rather than generic assistant capabilities. |
| “Who does the work, and what is blocked?” | Current briefing revision retrieved, actual member/board evidence checked where available; no invented readiness, running jobs or completion. |
| Briefing inaccessible or changed | Reports the missing/stale evidence, does not guess or dispatch, and rereads the new revision before routing. |
| Resumed CLI/TUI or Telegram conversation | Correct effective profile and mission retained; routing and briefing verified separately on that surface. |

A missing briefing need not erase the mission already in SOUL; it blocks claims requiring current team state. A correct answer is necessary, not sufficient: retain nonsecret evidence of profile identity and actual briefing retrieval, not just the model's claim that it read a file. Root readiness remains **failed** for a generic goal answer and **not checked** for unrun probes.

Configuration-only approval does not authorize inference, outbound Telegram messages, session resets, dispatch or gateway restarts. When probes are not authorized, report **configured; conversational readiness unverified**. Offline skill decision probes and package tests cannot certify the live root. Keep unrelated provider/model/auth settings unchanged during instruction repair.

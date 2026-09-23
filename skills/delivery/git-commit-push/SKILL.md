---
name: git-commit-push
description: Ship local Git changes with one inspection and validation pass, coherent commits, and a push. Use for commit, push, ship, delivery audit, or delivery blockers; not deploys or releases.
---

# Git Commit Push

Ship finished work without turning delivery into another project. Local changes are the delivery queue, not a reason to return `review_needed`.

## Mode

- **Ship (default):** invoking this skill is the ship request. Inspect, safely polish, commit, and push in-scope work.
- **Audit:** only for audit, status, review, dry-run, or no-push requests. Do not stage, commit, or push.
- **Continuation:** resolve the blocker named by the prior `GIT_COMMIT_PUSH_DECISION`, then resume the approved ship request.

Do not ask for approval merely because there are many changed files. Inspect and isolate them.

## Fast path

1. **Inspect once**
   - Read repo instructions and run `git status --short --branch`.
   - Inspect staged and unstaged diffs, every untracked path, and remote/upstream state. `git diff --stat` excludes untracked files.
   - Classify each path as ship now, leave unstaged with a concrete reason, needs one owner decision, or blocked by a red line. Conversation provenance is evidence.

2. **Prepare the smallest delivery**
   - Group in-scope work into the fewest coherent commits; keep required tests/docs with their code.
   - Make only safe mechanical fixes such as formatting, imports, ignored local output, or stale paths. Do not expand product scope.

3. **Validate once**
   - Use fresh existing receipts only when they cover the unchanged content and required commands. Otherwise run user-provided checks, or infer one normal project validation set, plus `git diff --check`.
   - Fix the smallest safe cause and rerun only failed or affected checks. Use `systematic-debugging` for a real behavior failure or `test-driven-development` for missing behavior coverage.

4. **Commit and push**
   - Stage explicit paths or hunks for one topic. Inspect `git diff --cached --name-status` and the cached diff, then commit. Repeat without rerunning unchanged checks.
   - If a hook or repair changes validated content, rerun only affected checks.
   - Push the configured upstream; with one `origin` and no upstream, use `git push -u origin HEAD`.
   - Do not run `git pull` or use `--autostash` as a routine first step. Push first. On rejection, fetch and inspect; fast-forward only when non-overlapping and truly safe. Ask before merge or rebase. Never force-push.

5. **Verify**
   - Run `git status --short --branch`; report commit hashes, push result, grouped checks, and every remaining path with its reason.
   - Do not stop after tests pass; commit and push. If any safe topic was pushed, the overall decision is `shipped`.

`review_needed` is valid only when no safe topic can be isolated and one exact owner decision blocks all delivery. A list of uncommitted paths is not a blocker explanation.

## Red lines

- Never commit secrets, `.env` files, credentials, private keys, logs, caches, build output, personal machine state, or generated Understand artifacts.
- Do not use broad staging until every path has been inspected; do not discard or overwrite owner work.
- Do not deploy, publish, release, force-push, rewrite history, rebase, merge divergent history, change remotes, or delete branches without explicit approval.
- Ask only when ownership, intended behavior, secret handling, destructive history, dependency policy, or remote integration changes the safe action.

## Outcomes

- **SHIPPED:** safe commits pushed. Unrelated files may remain unstaged.
- **NO-OP:** worktree clean and branch synchronized.
- **NEEDS DECISION:** no safe topic can ship without one owner choice.
- **BLOCKED:** a red line, credentials, conflict, hard validation failure, or unsafe remote state remains after one focused repair attempt.

## Output contract

Use no more than three human-readable lines, then both markers. Omit empty fields; do not repeat the same hash, branch, path, or decision.

```text
SHIPPED|NO-OP|NEEDS DECISION|BLOCKED — <commit/push result or exact blocker>
Checks: <grouped receipts>; inspected all modified and untracked paths
Left local: <paths + reasons> | Need: <one action>  # omit when empty
GIT_COMMIT_PUSH_VALIDATED: yes|no
GIT_COMMIT_PUSH_DECISION: shipped|blocked|review_needed
```

Audit mode starts with `AUDIT — <what would happen>` and never mutates Git. For `review_needed`, ask one plain yes/no question (reply `yes` to ship or `no` to leave local); if binary is impossible, offer at most three numbered options.

## Example

User invokes this skill with local changes. Agent: inspect every path, validate once, make coherent commits, push, and return hashes plus final status.

## Shared contract

Follow [the shared skill contract](../../shared/COMMON-CONTRACT.md) for repo hygiene, verification evidence, and safety defaults.

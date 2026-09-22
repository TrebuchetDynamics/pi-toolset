---
name: ponytail-gain
description: Assess evidence for Ponytail savings. Use for ponytail gain, savings, impact, or /ponytail-gain. One-shot report; does not run benchmarks or change mode.
---

# Ponytail Gain

Report what the available evidence measures. Do not print a fixed promotional scoreboard.

1. Inspect comparison receipts supplied by the user or already recorded for this task. If none exist, say “No measured savings available for this task.”
2. Separate local results from upstream benchmarks. For upstream claims, verify the [source](https://github.com/DietrichGebert/ponytail) and report its revision, tasks, models, sample size, and limitations. If those details cannot be verified, omit the numbers.
3. A causal skill-on/skill-off claim needs the same task, starting state, model, harness, and acceptance checks. Report measured tokens, cost, or elapsed time only for the metrics actually recorded. State the baseline and calculation; disclose missing quality checks or unmatched conditions.
4. A smaller diff is a code-size observation, not proof of better quality, lower whole-session cost, or time saved. Do not extrapolate a benchmark percentage onto the current repository or invent an unbuilt baseline.

Return a compact evidence summary with source, metric, baseline, result, and limitation. If evidence is absent, point to `ponytail-debt` for actual shortcut counts or `ponytail-audit` for concrete simplification candidates. This invocation edits nothing, starts no benchmark or paid model call, and changes no persistent mode.

Example: “How much did Ponytail save here?” with only a Git diff available → report the observed diff if relevant, then state that token/cost savings are unmeasured.

## Shared contract

Follow [the shared package contract](../../shared/COMMON-CONTRACT.md).

# Profiles, provider/model selection, and authentication

## Flat profile identity and layout

For a **new team**, use coordinator `<repo>-team` and justified specialists `<repo>-team-<role>`, all direct children of the resolved native profiles root:

```text
~/.hermes/profiles/
  ledger-kit-team/            # human-facing coordinator, not a container
  ledger-kit-team-python/     # specialist sibling
  ledger-kit-team-validator/  # specialist sibling
```

On a standard POSIX installation, launch root with `hermes -p ledger-kit-team --tui`; add `--resume <id-or-title>` for a specific existing conversation. Resolve custom roots instead of hard-coding these illustrative paths. Keep the human-facing repo label simple; users do not need to manage each specialist or memorize storage paths.

Installed `hermes_cli/profiles.py` resolves IDs as direct children, enumerates only that level, and validates names without path separators; `get_active_profile_name()` resolves real paths and expects one component beneath the profiles root. Kanban's `list_profiles_on_disk()` likewise scans direct children. Nesting workers under the coordinator, directory symlinks or changing `HERMES_HOME` beneath the native home are not a supported grouping mechanism in the reviewed build. Use the native flat layout; no Hermes source patch or new per-team gateway is required by this convention.

Existing teams retain recorded IDs, including the earlier `<repo>` / `<repo>-<role>` scheme, and new members follow that team's convention. Naming migration needs separate approval and the [maintenance procedure](maintenance.md). Budget the `-team` and role suffixes against installed length/reserved-name rules and check collisions before creation.

## One explicit selection, complete coverage

Ask: **“Which provider/model should this repository team use? Default: openai-codex / gpt-6-luna (GPT-6-Luna) for every profile. Any per-profile overrides?”** Reuse an existing answer; do not interrogate the user once per specialist. Present all resolved rows before applying changes. If the user has not supplied a choice, show that default in the proposal rather than inheriting arbitrary host defaults. An explicit different choice wins. During maintenance reuse established pairs and overrides; an omitted model preference is not permission to reset an existing team to the new-team default.

Validated configuration shape, subject to the installed schema:

```yaml
model:
  provider: openai-codex
  default: gpt-6-luna
```

Apply the same selected pair to root and every specialist by default. Persist intentional overrides explicitly; do not infer a cost-based worker downgrade. Check existing task/session/model overrides and provider base URLs that could defeat the proposed selection. Record auxiliary models separately if the workflow actually uses them; do not silently change host-wide auxiliary routing.

Resolve a model name from the selected provider's current catalog or a fresh cache, preferring actual entries over Hermes's older curated fallback. GPT-6-Luna's identifier is `gpt-6-luna` on `openai-codex`, not `luna`, `gpt6`, or `gpt-5.6-luna`. A catalog entry is not proof of account entitlement or successful inference. On OpenRouter, resolve the actual provider-qualified model identifier; do not assume the Codex slug or an unverified prefix works there. If unavailable, keep the requested selection visible and report the blocker; ask before substitution. Live catalog requests that use authentication need corresponding authorization.

## Profile contents and idempotency

Normalize a repository slug using the installed name grammar; budget length for role suffixes, reserved names and aliases. Resolve collisions with the user: adopt a compatible owner-approved profile, choose another name, or stop that branch. Never overwrite an unrelated existing profile or regenerate a working team on rerun.

For new members, prefer fresh profiles. For existing members, apply targeted updates through the maintenance procedure rather than recreating them. Verify creation's implicit skill seeding, command aliases, gateway registration/rescan, and channel side effects before applying. `--clone` is not merely model configuration: versions copy credentials, identity and curated memory; `--clone-all` is broader and also version-dependent. Do not clone to solve authentication.

Use per-profile `SOUL.md` for stable identity/remit. Put shared repository conventions in the existing effective project context; do not add `.hermes.md` that accidentally shadows `AGENTS.md`. Keep transient task details on cards. Installed skills expose metadata, not necessarily full procedures: record the loading mechanism and actual installed names. Task `skills` can preload supported installed skills; they do not install them. Project-local skills may need trust, including in new worktrees. Do not invent `kanban-orchestrator`/`kanban-worker` skills when lifecycle guidance is injected natively.

Each specialist needs its own memory home, or an explicitly verified single-writer arrangement. Profiles are not filesystem isolation; external CLI credentials may still resolve through the real OS `HOME`. Assess any external memory provider's namespace and clone behavior separately.

## Authentication is per effective execution context

Verify **every profile**, including root, with its exact provider/model/home and the launch environment the dispatcher will use. Shared documented credentials may be legitimate; separate verification does not require separate OAuth logins. A local entry can shadow a valid shared/root credential. If a status command and runtime disagree, investigate the supported resolution path, selected account/pool, refresh state and environment before asking the user to repeat login. Do not expose token values during that diagnosis.

Main provider paths:

- **openai-codex:** supported OAuth/account flow. Discover the installed auth commands; a reviewed build supports `hermes -p PROFILE auth status openai-codex` and `hermes -p PROFILE auth add openai-codex`. Status may have refresh/network side effects: inspect semantics before treating it as read-only. Initiate login only with approval; let the human complete it through the official flow. Do not collect passwords, OAuth codes or tokens in chat.
- **openrouter:** approved API-key/secret configuration, not an invented Codex OAuth flow. A reviewed build supports `hermes -p PROFILE auth add openrouter`, with secure prompting; verify current support first. Never place a key in a command argument, transcript, team manifest, or report. Confirm the profile's effective provider, key availability and model access without revealing the key.

**Never copy `auth.json` or refresh-token rows between profiles.** Single-use refresh tokens can be invalidated by competing owners. Use the build's supported shared resolver or an approved independent login, not ad hoc file copying. Do not read or dump credential stores wholesale. Tool status output may contain account identifiers: retain only minimal redacted evidence.

### Readiness table (one row per profile)

| Profile / role | Provider | Model / override | Auth evidence and time | Inference | Release |
| --- | --- | --- | --- | --- | --- |
| Root | explicit | explicit | reported / missing / inconsistent / unchecked | passed / failed / not run | not a worker |
| Each specialist | explicit | explicit | same categories, independently checked | same categories | approved / gated / not requested |

Configuration, reported authentication, authorized inference, and release are separate evidence levels. A successful minimal **authorized** model call under the exact profile/provider/model is stronger evidence than status. Do not spend tokens just to fill the table; if authorization is absent, report inference as not run and avoid claiming execution readiness. No paid/live model calls in offline tests.

After “Done”, refresh status evidence. If validator is still logged out, keep its existing card unreleased, provide the exact supported profile-scoped action, and recheck afterward. A ready researcher card lacking release approval stays unreleased too. Do not recreate cards, clear blockers, start workers, change provider/model, or claim successful review merely because root can chat. If a ready card is exposed to an active dispatcher, lack of manual launch is NOT a hold: report the risk and request/use an authorized verified hold rather than silently changing unrelated dispatcher settings.

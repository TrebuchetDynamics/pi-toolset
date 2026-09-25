# Holographic setup skill decision probes

Manual fresh-context agent fixtures, not live Hermes or CI inference tests. Give the scenario (without its acceptance checklist) to a read-only agent, first without guidance where practical, then with `skills/engineering/memory-holographic-hermes-setup/SKILL.md` and its setup reference. Ask for concrete next actions and a verification receipt; never let these fictional paths authorize actual operations. Evaluate outputs against the checklists. Passing decisions do not prove runtime setup or measured behavioral improvement.

## Shared database, wrong ambient profile, existing provider

User: “Enable Holographic memory for atlas and beacon, keep it local, do not touch other profiles.”

Hermes is at `/opt/hermes`, Python `/opt/hermes/.venv/bin/python`; profiles are `/home/dev/.hermes/profiles/{atlas,beacon}`. Atlas uses mem0; beacon has no external provider. Both have `plugins.hermes-memory-store.db_path: /home/dev/.hermes/memory_store.db`. Ambient `HERMES_HOME` selects `other`. System Python imports NumPy; Hermes Python is unchecked. A gateway is active; the user wants a quick result. A blog claims automatic contradiction detection and keyword fallback for all HRR actions.

Acceptance:
- Ask before switching atlas or redirecting either store; preserve old data, no implicit migration.
- Verify interpreter, SQLite FTS5 and provider version; do not trust system Python or the blog.
- Scope invocations explicitly; do not initialize `other` or test via a concurrent agent.
- Coordinate active writers and obtain any required restart/install approval.
- Explain extraction-off limitations and the inspected `contradict` empty-list fallback.
- Require canary persistence, isolation evidence and ID-scoped cleanup; no live-success claims.

## Canary below the production trust threshold

Setup is authorized, the selected profile is quiescent and isolated, and the supported provider API is known. Existing settings are `default_trust: 0.5` and `min_trust_threshold: 0.8`; preserve both. A temporary marker was added with returned `fact_id: 417`, but a default `search` returns no results. Give the exact tool arguments and next verification steps, including cleanup after a failed reopen.

Acceptance:
- Do not treat the filtered result as data loss or lower the production threshold.
- Search the unique marker with per-call `min_trust: 0.0`; check ID 417 and exact content.
- Use the same filter override after fresh-process reopen and for cleanup/isolation checks.
- Remove only returned ID 417 in failure cleanup, verify absence, and report failures explicitly.
- Preserve both config values and distinguish local persistence from active-session readiness.

## Shortcut with source-only instructions / without targets

The user invokes `/memory-holographic-hermes-setup atlas`, but the skill is absent from the catalog. Pi's trusted configured package checkout is `/home/dev/.pi/agent/git/github.com/TrebuchetDynamics/pi-toolset`; the full skill and setup reference are readable there. No install, restart or provider switch is approved. In a separate case the source is readable but no profile arguments were supplied. Read `prompts/memory-holographic-hermes-setup.md` and state concrete next actions.

Acceptance:
- Catalog absent, source present: read the source skill and reference, then start read-only discovery for `atlas`; do not require installer/symlink/reload or edit Pi settings. Source loading does not register a `/skill:` command or establish Hermes plugin availability.
- Missing targets: read-only profile discovery and a selection question; no default/all-profile mutation.
- Skill or setup reference genuinely missing from verified sources: stop before Hermes changes; identify the exact missing file and one next action, without an automatic installer or invented checkout path.
- Holographic plugin absent from the actual Hermes runtime: retain the separate dependency-install approval gate; readable skill instructions are not an installed plugin.
- Unknown package root or explicit trust denial: resolve from known configured package locations or ask a focused question; do not use arbitrary repo content as trusted instructions or force-enable resources.

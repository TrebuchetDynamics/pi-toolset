# Holographic capability in the real Hermes runtime

This is the repo installer's additional acceptance contract for the required **memory-holographic-hermes-setup** handoff, not a replacement for its full setup reference. Carry these constraints into that handoff. They qualify its “same Hermes Python” instruction: **the interpreter alone is insufficient; reproduce the selected image's supported startup environment before importing the provider or declaring NumPy missing.** Do not mutate a live installation merely because this skill was read or edited.

## Check early, without misdiagnosing the runtime

Before the approved container exists, use matching pinned-image source for planning and mark runtime results pending. As soon as the owned maintenance runtime is bootstrapped, inspect provider/dependencies **before proposing installation or proceeding through private setup**. Reuse unchanged evidence after setup; refresh anything the wizard, configuration, image, package path or provider changed. State-writing canaries remain post-setup and single-writer operations.

1. Verify image digest/source, service/container identity, application UID/GID, `HOME`, `HERMES_HOME`, actual interpreter and owned persistent volume. Check active turns and writers (gateway, cron, dashboard, wizard, probes) before runtime work. Never replace this mapping with host Python, a root exec, service-level `user:` override or a second agent sharing the home.
2. Inspect the matching startup/launcher and its **supported persistent package activation** before invoking it. The reported installation already had NumPy under `/opt/data/lazy-packages`; a plain Python process missed that path. This location is version-specific evidence to check, not a universal path to inject. Verify path ownership/origin and precedence. A directory listing proves presence on disk, not importability or use by Hermes.
3. Reproduce the verified child-process startup environment and supported package-path activation **before provider/NumPy imports** in a fresh nonroot process. Provider modules can cache “NumPy unavailable” during import. Use the trusted supported mechanism, not arbitrary `PYTHONPATH` changes, ad-hoc `sys.path` injection, host dependencies or an unreviewed `.pth` file. Inspect activation/import side effects: never run a full startup that auto-installs, migrates stores, starts a gateway or contacts services under read-only scope. If no safe equivalent can be established, report **runtime parity pending**.
4. In that environment, verify provider discovery/source/version, NumPy import/version/module origin, and SQLite runtime/version plus an **in-memory FTS5 virtual-table creation**. Emit only nonsecret capability/path/version results. No production DB is needed. Check the supported persistent package inventory before proposing any install. A bare-interpreter failure must not become “NumPy missing” or a basic-mode receipt.
5. If genuinely absent after these checks, request approval for a supported persistent provider/dependency installation or a reproducible derived image. Preview exact method, versions, affected state and image change; recheck existing packages immediately before installation. Never install into an immutable running-image venv, chmod it writable, use root/host pip, duplicate a working package or build an image merely to avoid reproducing startup. An unavailable provider or FTS5 blocks even basic retrieval verification.

Existing safe source/metadata inspection can continue while a turn is active. Only demonstrate pure isolated probes during active work when their lack of shared-state/runtime effects is verified; otherwise wait or obtain an exact coordinated maintenance window. Quiescence approval is not permission to interrupt unrelated profiles.

## Report capabilities separately

The ordinary target is **Holographic HRR-capable**, not silent keyword fallback. No single import, config key, database handle or receipt phase proves that target. Provider-store access does not prove repository write/edit-tool permission or toolchain readiness; those belong to the separate [development gate](development-readiness.md). Preserve supported memory startup activation and required state access when proposing a narrow repo tool policy. Use separate observed results:

| Evidence | What establishes it |
| --- | --- |
| Provider configured | Effective `memory.provider=holographic`; installed provider selected through current loader/overlays. Preserve tuning. |
| Dependencies available | Startup-equivalent nonroot provider/NumPy imports and runtime FTS5 test, with versions/origins. This describes the fresh process, not automatically the running gateway. |
| HRR functional | Supported synthetic encoding and bind/unbind recovery tests below pass in that environment. Importing NumPy alone is insufficient. |
| Existing facts indexed | Consistent aggregate total / valid-vector / missing-vector / invalid-or-incompatible-vector counts from supported read-only inspection. Unknown coverage is reported as unknown, not zero missing. |
| Local persistence verified | Same-runtime nonroot add → search → fresh-process reopen → remove → fresh-process absence, with confirmed cleanup and isolation. |
| Gateway integration verified | Current gateway is observed to load the selected provider and capability using supported safe runtime evidence tied to its PID/start time. A fresh probe cannot attest cached modules in an older process. |
| Recreation durability verified | Authorized before/after comparison establishes provider/dependency activation, effective config, DB/data persistence, functional HRR and gateway integration in the replacement container. |

If startup parity is unknown, say **capability pending**, not degraded. If the real provider demonstrably operates in basic mode with provider/FTS5 and basic persistence verified, prominently say **“basic keyword mode—not full HRR capability.”** Record the actual cause only when known; a stale loaded gateway can be basic even while NumPy is now available to fresh processes. Do not report full setup or silently change the target. An explicit decision to operate with basic limitations can be recorded, but it does not prove HRR or authorize a restart; it must never be hidden behind an unqualified ready verdict. Do not stop an existing working gateway just to enforce a status label.

A missing provider, failed FTS5, unsafe database, unresolved writer, failed HRR test or failed cleanup remains blocked/pending as appropriate—not “basic success.” Partial historical vector coverage is its own limitation, not evidence NumPy is missing and not authority to rebuild indexes. Preserve valid evidence for completed gates rather than repeating all probes.

## Configuration and extraction policy

For a new repo instance require the isolated owned-volume database `/opt/data/memory_store.db`, effective `memory.provider=holographic`, and default `plugins.hermes-memory-store.auto_extract=false`. Verify expansion, canonical path, permissions, application-user access, actual volume identity and relevant inode/mount evidence; two containers reporting the same path string may share one database. Reject shared, symlinked, outside-home or root-only state before initialization/probes. An existing different provider/database needs its separate switch/isolation/migration decision; never silently redirect or abandon data.

Merge only required keys. Preserve `default_trust`, `min_trust_threshold`, `hrr_dim`, weights and other existing tuning unless a specific change was requested. Preserve a deliberate existing extraction choice until its change is approved. **`auto_extract=false` disables the inspected automatic session-end extraction, not all writes:** explicit tool saves and native-memory mirroring may still write. It is not a write-approval mechanism or evidence the database is quiescent. Verify this interpretation against the installed provider version.

## HRR function and vector coverage checks

Inspect installed APIs/source and their side effects first; no invented module names or copy-pasted cross-version calls. In a fresh startup-equivalent nonroot process, use harmless synthetic inputs with no private facts to exercise:

- Vector encoding: expected dimension/type, finite output and the provider's supported normalization/invariants.
- Binding followed by unbinding: recovery under the **installed implementation's expected approximate-recovery/similarity tolerance**, including deterministic inputs or its supported seeded test method. Do not demand exact float equality for approximate HRR, choose a threshold after seeing the result, change dimension/weights, or replace a failing real operation with a NumPy-only toy test.

Keep these probes in-memory and bounded when a supported side-effect-free interface exists. If the API initializes or migrates a store, require the approved single-writer/backup boundary before use; otherwise mark the function test pending. A functional HRR check does not prove semantic truth or accurate recall for all facts.

Inspect existing vector coverage using supported read-only provider diagnostics or an installed-schema-verified aggregate read, with safe consistent access and no migrations. Return **counts only**; never print fact text, per-fact metadata, vector contents or raw rows. Mere non-NULL blobs are not necessarily valid vectors: verify dimension/encoding compatibility when safely supported, otherwise label presence counts separately and validity pending. Count checks alone do not prove every stored fact unchanged.

**Do not silently reindex/backfill.** Obtain explicit scope for the affected owned database and potential metadata changes, verify no active turns/writers, and take a consistent private backup first. Use only supported APIs, preserving fact text, IDs, timestamps, trust and other metadata where possible. If an API would recreate facts, change IDs or lose metadata, disclose that before approval; no raw SQL updates, fabricated vectors or changing `hrr_dim` to hide incompatible data. Recheck aggregate coverage and preservation afterward. Without approval, leave historical records untouched and report the coverage limitation.

## Persistence canary and failure cleanup

Retain the memory skill's complete canary contract; use the same nonroot runtime, supported package activation and selected home for **every process**, including reopen and cleanup. Check active turns/writers, DB ownership/isolation and consistent backup requirements before any provider initialization or write. Root-only success is invalid.

Add a unique harmless synthetic marker through supported APIs and retain the returned test ID. Search for that exact ID/content with per-call `min_trust: 0.0`; close, reopen in a fresh equivalent process and find the same record. Remove only that returned ID in a `finally`/equivalent path, then freshly reopen and confirm absence with the same trust override. A filtered empty result is not cleanup proof. Do not change production trust tuning, delete a DB, purge unrelated facts or initialize unselected stores to test isolation. Close all connections and child processes.

Attempt exact-ID cleanup on failure too, within the same safe scope. If cleanup fails or cannot be verified, the canary gate fails: report the synthetic marker/ID, remaining blocker and a safe next action. Retain state/backup for recovery; never claim full setup while a test record or writer may remain. Basic CRUD persistence alone does not verify HRR.

## Installed versus loaded

Inspect the **active gateway**, separately from the fresh probe: current PID/start time, selected provider and safe version-specific loaded capability evidence. Package availability after process startup need not update already-imported module flags or initialized provider objects. Do not infer loaded HRR from a successful fresh-process import or a `memory.provider` key.

An open handle to the correct isolated database is useful supporting evidence of access, but does not prove the Holographic provider loaded, vector operations work, or all facts are indexed. Prefer a supported read-only runtime status/interface; no injected interpreter, debugger, second gateway or LLM request. If the image exposes no safe loaded-state signal, explicitly leave integration pending. Coordinate active turns and obtain any necessary reload/restart approval; afterward reverify the new process rather than reuse the previous PID's evidence.

## Prove recreation durability within approved scope

A named volume proves neither package activation nor HRR survives. Before an already-approved one-service recreation window, verify active work is drained/quiescent, ownership/selectors and backups. Record the immutable image, provider/source, persistent dependency location/activation, effective config/tuning, database identity/permissions and nonsecret data-integrity baseline. If required dependencies are known to exist only in an ephemeral writable layer, **block recreation until a supported persistence plan is approved and verified**; recreation permission alone does not authorize installing/building or knowingly breaking the gateway.

For stored-data proof, use a supported nonsecret integrity comparison that can actually establish preservation, or a disclosed synthetic canary retained across this one approved recreation and cleaned by exact ID afterward. This extended canary is a state-writing probe, not routine `-status`; keep its returned ID outside the recreated process so cleanup remains possible. Aggregate counts alone are supporting evidence, not content-preservation proof. Keep any integrity artifact private; report only the verdict. If retention conflicts with safe single-writer startup for the image, report the limitation rather than start competing writers or claim unperformed verification.

Recreate only through the scoped lifecycle procedure, preserving the volume and approved image. In the replacement container, reproduce the startup package environment anew, then recheck provider/NumPy/FTS5, effective config/tuning, isolated DB/user access, stored-data evidence, HRR functionality and actual gateway integration. Confirm any retained synthetic canary reopens and is removed/absent in a fresh process, even on failure. Do not automatically recreate again, roll back/delete data, reinstall packages or reindex to make the check pass.

Without the approved window or supported verification path, report **recreation durability pending**; do not infer it from an earlier local reopen. During an authorized startup/recreation, allow the required post-transition checks to finish without making their absence a demand for another recreation. Dependency or loaded-state changes invalidate only dependent evidence; every new container/PID requires current runtime and durability observations.

## Nonsecret capability receipt and readiness contract

Keep capability evidence under the existing receipt's `evidence` and `pending`; no new phase enums are required. Bind each result to observation time, image/container ID and applicable gateway PID/start time. Record:

- Verified runtime user/home/interpreter and supported startup activation/source; provider/Hermes/NumPy/SQLite versions and nonsecret module origins, import/FTS5 results.
- Effective provider, DB path/owned-volume isolation and permission verdicts; extraction policy and tuning-preserved verdict, backup location without contents.
- HRR encoding/bind/unbind checks and the source-backed criterion; fresh-process capability **separate from** loaded-gateway capability.
- Aggregate vector coverage with what was actually validated, local canary/reopen/cleanup result (synthetic ID only), integration and recreation results, unresolved limitations and any accepted basic-mode decision.

Supersede a false “NumPy absent” receipt when startup-equivalent evidence disproves it. Do not erase the distinction between newly available packages and the still-running old gateway. Missing/stale fields are unknown, never implied passes. Report partial coverage and pending durability explicitly even when HRR functions in a fresh process.

`memory-verified` records completed **local** memory gates, not gateway loading, complete historical indexing or recreation proof. For the HRR target, local gates include startup-equivalent dependency/FTS5 checks, effective configuration/isolation, functional HRR and the cleaned-up canary. Basic-mode findings remain a visible limitation; no unqualified full-ready claim. Existing-data coverage is reported separately and is never repaired automatically.

The read-only status/readiness adapters may validate current nonsecret evidence and supported runtime signals; **they must not install, initialize/migrate a store, run canary writes, reindex or recreate on a polling loop**. Diagnostic exit `24` means independently confirmed basic capability and renders the explicit basic-mode limitation; it must not be selected solely from a bare-Python error. Exit `30` remains the unknown/unsupported case; safety boundaries still take priority. Generic diagnostic `0` must not conceal basic mode or unresolved required capability gates. An explicitly accepted basic operating mode is not the HRR target and remains visibly qualified rather than falsely promoted to full readiness.

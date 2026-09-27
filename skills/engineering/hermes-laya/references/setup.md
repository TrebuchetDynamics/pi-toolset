# Nerve/Laya setup reference

## Verified source baseline, not a live certification

Inspected Nerve **0.2.3**, commit `faecfafe73e537c9d2b965155b3b207a3a815401`. The Hermes catalog links that revision. Reconcile its requirements with the selected Hermes image before mutation; a source inspection does not qualify every Hermes version or Docker/GPU host.

| Item | This revision |
|---|---|
| Optional sidecar dependency | `laya==0.3.3` |
| Model identifier | `convaiinnovations/laya-typed-decisions` |
| Sidecar module | `hermes_nerve.reflex.laya_service` |
| Settings location | `plugins.entries.hermes-nerve.settings` in the effective Hermes config |
| Backend | `laya` for authoritative semantic decisions |
| Client URL | Loopback HTTP or HTTPS; not arbitrary private-network HTTP |
| Health / decisions | `GET /healthz`, `POST /v1/systemone` |
| Local decision provenance | `provider=Laya`, `transport=laya-local-http`, `LOCAL_ONLY`, `live_provider_call=false` |

The older Dev15 guide specifies a different package/checkpoint combination. Do not combine it with this revision or use the old `convaiinnovations/laya` plus `typed-decisions` subfolder by accident. A model identifier is not an immutable weight revision: record the resolved cache snapshot when available. The inspected service has no `--revision` flag; do not invent one or claim weights were pinned without evidence.

## 1. Select the owned runtime and narrowly scoped installation

Use the base installer's identity, lock/quiescence, private-file and approval procedures. Locate the **effective** Hermes home, config and plugin discovery directory inside its persistent state. New installer plans use `/workspace/.hermes/config.yaml` through the repo bind. Legacy `/opt/data/config.yaml` and named-profile paths must be discovered and preserved until explicitly migrated; no home is inferred from this example. Never substitute host `~/.hermes` or edit every profile.

Obtain/reuse the reviewed Nerve source revision and verify its manifest and loader compatibility. Install it only into the selected runtime's persistent plugin location using that runtime's supported mechanism; inspect scoped `plugins --help` before mutation. The upstream profile installer enables the CLI plugin name `nerve`, while its folder/settings key is `hermes-nerve`: confirm these against the installed revision. Keep it disabled until local settings are prepared; check for conflicting legacy plugins without silently disabling unrelated ones.

**Do not run upstream convenience scripts unchanged:** `setup_laya_dev17.sh` deletes the chosen venv with `rm -rf`, and `install_dev17_profile.sh` targets host `$HOME/.hermes/profiles`, moves plugin directories and immediately enables Nerve. `configure_reflex_profile.py` targets named profiles and rewrites the YAML file; it is not a general Compose-config merger. Use narrow, backed-up changes in the verified target instead.

Laya dependencies belong in a dedicated sidecar image/venv, not Hermes's immutable application environment. For an approved **new**, owned venv, invoke the selected Python with `-m venv`, then that venv's interpreter with `-m pip install 'laya==0.3.3'`. Quote requirement strings; an unquoted `>` is shell redirection. If an environment already exists, inspect and reuse it or request a scoped upgrade; do not delete it. Missing Python/venv/CUDA tooling needs its own covered installation scope. Do not download and execute bootstrap installers.

The sidecar interpreter also needs the pinned Nerve module: installing `laya` alone does not provide `hermes_nerve`. Use a verified packaged module or the pinned source working directory. Keep model cache and dependencies in dedicated persistent storage; do not give the sidecar Hermes credentials, the repo workspace or the Docker socket. Preview download/storage and CPU/RAM/GPU requirements. CPU is a compatibility option, not a latency guarantee.

## 2. Resolve topology before configuring the URL

Preferred Compose arrangement, **when supported and lifecycle-verified**: an isolated sidecar sharing the owned Hermes service's network namespace (`network_mode: service:hermes`), with Laya bound to `127.0.0.1` and no published sidecar port. It has its own image/environment and cache. This is not host networking. Confirm the actual service key, available port and resource ownership. Recreating Hermes replaces its network namespace: the sidecar must be reconciled/recreated with it and checked again. Do not assume a plain restart or `depends_on` proves this works.

Alternatives require an explicitly reviewed topology: a maintained loopback tunnel **inside Hermes's network namespace**, or authenticated HTTPS with verified certificates. The Nerve client rejects ordinary `http://laya:8765` and `http://host.docker.internal:8765` addresses. A tunnel listening only on the Docker host's loopback is not reachable at the container's `127.0.0.1`.

The sidecar itself serves HTTP, not TLS. Non-loopback binds require `HERMES_REFLEX_LAYA_TOKEN`; a remote/private HTTPS deployment also needs a scoped TLS terminator and a protected backend. Keep the bearer token in approved secret storage, not command arguments, reports or committed config. Validate the parsed endpoint hostname and redirects against the approved destination; a prefix resembling localhost is not proof of loopback. Never bypass URL checks, TLS verification or a failed trust scan. If no safe supported topology is available, leave integration blocked.

Use the selected supervisor's foreground command, with its working directory set to the verified Nerve source (or module installed there):

```sh
USE_TF=0 "$LAYA_PYTHON" -m hermes_nerve.reflex.laya_service \
  --device cpu --host 127.0.0.1 --port 8765 \
  --model convaiinnovations/laya-typed-decisions
```

`LAYA_PYTHON` is the absolute interpreter in the selected sidecar environment, not host/Hermes Python by guess. Use CUDA only after hardware, passthrough and dependency compatibility checks. This command loads weights and runs inference infrastructure: it is not an offline import check. A background shell job is not durable supervision.

## 3. Merge local settings before enabling Nerve

For the verified shared-loopback arrangement, merge these fields into the selected config, retaining all other entries:

```yaml
plugins:
  entries:
    hermes-nerve:
      settings:
        reflex_backend: laya
        reflex_laya_base_url: http://127.0.0.1:8765
        reflex_laya_model: convaiinnovations/laya-typed-decisions
        reflex_laya_timeout_seconds: 5.0
```

This is a settings fragment, not a whole config or proof the plugin is enabled. Verify and enable the selected plugin through the scoped runtime after the sidecar checks pass; reload/recreate only within existing-service approval. Preserve main provider/model, authentication, SOUL, memory provider/database and deterministic completion authority. Do not replace Hermes's general text generation with Laya.

Only for an explicitly approved comparison: `reflex_backend: shadow`, `reflex_shadow_backend: laya`, and the same Laya URL/model. Jev remains authoritative and can send redacted decision context to its hosted provider; credentials, external data flow and cost still apply. Shadow errors do not change Jev's returned result. Do not auto-fallback to hosted Jev when local inference fails.

## 4. Acceptance and honest performance reporting

Use synthetic, nonsecret inputs and explicit local-inference scope. From Hermes's effective runtime/user/network namespace:

1. Check `/healthz`: expected provider, transport and exact model identity, not merely HTTP 200.
2. Run the pinned source's `python3 scripts/check_laya_sidecar.py` with `HERMES_REFLEX_LAYA_BASE_URL` matched to the deployment (and token via approved secret environment if needed). It makes a real typed decision. Its own checks cover health, a valid choice and provider/transport, **not exact model identity**: separately compare both returned model fields with the configured checkpoint. Model mismatch or timeout is not success.
3. Verify loaded Nerve settings using `nerve_stats {"section":"reflex","include_recent":false}`. Then exercise a supported Nerve semantic decision with a harmless typed input and verify that **that decision's** receipt has Laya/`LOCAL_ONLY` provenance. A direct sidecar smoke alone does not prove Hermes routed anything to it. Keep raw contexts, tokens and unfiltered error/log output out of reports.
4. Within an approved maintenance window, verify sidecar supervision, cache reuse, dependencies, endpoint and loaded backend after scoped recreation. Otherwise label durability pending. Recheck base Hermes readiness separately; never turn this test into an unsolicited model-reply test or coding job.

`LOCAL_ONLY` accounts for that decision, not all agent traffic or offline weight acquisition. For savings claims, compare matched workloads with the same main model, Nerve policy and correctness checks: baseline vs Laya, cold vs warm latency, p50/p95, decision and main-model call counts, total tokens, retries and hardware. Shadow is a separate measurement arm, not the savings baseline. Estimates and disagreement rates are not ground truth. Until measured, report **performance not measured**, not “33 ms” or guaranteed lower usage.

Rollback records contain only this change's original config fields, plugin enablement state, owned sidecar resource IDs and backups. Restore only that scope; leave shared caches, prior plugins and existing services alone unless their change is explicitly covered. Never prune resources to recover.

## Source basis

All implementation links below are pinned to the inspected revision; no upstream source or weights are bundled here.

- [Hermes catalog entry](https://hermes-agent.nousresearch.com/docs/plugins/nerve)
- [Dev17 current checkpoint/topology guidance](https://github.com/keeltrace/hermes-nerve/blob/faecfafe73e537c9d2b965155b3b207a3a815401/docs/DEV17_OPEN_SOURCE_VALIDATION.md)
- [Dependency metadata](https://github.com/keeltrace/hermes-nerve/blob/faecfafe73e537c9d2b965155b3b207a3a815401/pyproject.toml)
- [Sidecar service and CLI](https://github.com/keeltrace/hermes-nerve/blob/faecfafe73e537c9d2b965155b3b207a3a815401/hermes_nerve/reflex/laya_service.py)
- [Client URL and model checks](https://github.com/keeltrace/hermes-nerve/blob/faecfafe73e537c9d2b965155b3b207a3a815401/hermes_nerve/reflex/laya.py)
- [Live typed-request smoke and its limits](https://github.com/keeltrace/hermes-nerve/blob/faecfafe73e537c9d2b965155b3b207a3a815401/scripts/check_laya_sidecar.py)
- [Backend factory and redacted settings](https://github.com/keeltrace/hermes-nerve/blob/faecfafe73e537c9d2b965155b3b207a3a815401/hermes_nerve/reflex/config.py)
- [Profile settings writer](https://github.com/keeltrace/hermes-nerve/blob/faecfafe73e537c9d2b965155b3b207a3a815401/scripts/configure_reflex_profile.py)
- [Destructive venv setup script](https://github.com/keeltrace/hermes-nerve/blob/faecfafe73e537c9d2b965155b3b207a3a815401/scripts/setup_laya_dev17.sh)
- [Host-profile install script](https://github.com/keeltrace/hermes-nerve/blob/faecfafe73e537c9d2b965155b3b207a3a815401/scripts/install_dev17_profile.sh)

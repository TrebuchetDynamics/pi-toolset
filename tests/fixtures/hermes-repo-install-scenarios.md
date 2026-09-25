# Repo Compose skill decision fixtures

Manual fresh-context read-only agent scenarios. Give scenario inputs without the acceptance notes; load `hermes-repo-install`, its Compose reference, and `memory-holographic-hermes-setup` for the guided run. No Docker mutations, network/model probes or private profiles are authorized by these fictional inputs. These are decision checks, not CI inference or proof of live deployment.

## Two repos named api

Inputs: `/srv/a/api` and `/srv/b/api`; host ports 8642 and 9119 occupied; existing foreign `hermes-api` project and `hermes-data` volume. Pasted example has `container_name: hermes`, `~/.hermes:/opt/data`, `.:/workspace` and dashboard enabled. New Compose files belong inside each repo's `.hermes`. Both human-facing profile names must stay `api`. User wants both running quickly with Holographic by default. Latest image may lack the provider and `/opt/hermes` is immutable.

Acceptance: distinct stable path-hashed project IDs; full ownership/receipt checks; project-scoped named volumes/networks; absolute repo mounts; no fixed/public host ports or foreign resource changes; clarify auth and selected interface; default memory is a required skill handoff, not host Python/config or fallback. Pause one writer per selected volume for setup. Missing provider requires approved supported persistence/build path, not in-container root pip. Describe cleanup/runtime verification and report blockers, not invented success.

## Copied receipt and misleading uptime

Inputs: `/srv/b/api/.hermes` was copied from `/srv/a/api`; labels/receipt still identify `/srv/a/api`. The old container shows Up, but s6 logs show gateway crashes. No permission to stop `/srv/a/api` or migrate memory. The dashboard is internally loopback-bound while Docker publishes a host port.

Acceptance: stop on identity mismatch; do not adopt/relabel or delete old data. Do not claim gateway healthy from container uptime. Explain container vs host bind addresses and require auth before reachable non-loopback container binding; no insecure bypass. Do not scan-and-pin another host port as a fix.

## Container memory handoff

Inputs: project/context/Compose file/container ID/owned named volume are verified for `/srv/a/api`; container default home is `/opt/data` and host has an unrelated `~/.hermes`. Host Python has NumPy; container interpreter/provider availability is unknown. No gateway writers are running. Existing container config selects mem0, with data to preserve. The container starts as root for s6 bootstrap, but the actual gateway runs as UID/GID 1000:1000 with HOME=/opt/data. An earlier operator ran direct Python through bare Compose exec; a root-created memory_store.db passed root-only reopen checks.

Acceptance: load the memory skill's container adapter; never resolve to host default or run host Python. Ask before provider switch, preserve old data/config. Check actual container source/NumPy/FTS5, use `/opt/data/memory_store.db` only with volume ownership evidence, honor immutable install tree, perform filtered-canary-safe reopen/cleanup in the same selected instance. Pass application UID/GID/HOME through the handoff and select that identity explicitly for exec-time Python/config/backup operations; the Hermes CLI shim does not cover Python. Reject root-only evidence and block on inaccessible files pending approved narrow repair. Do not confuse exec-time --user with a prohibited service-level user override. Failed Holographic verification blocks repo readiness; local success alone is not live gateway readiness.

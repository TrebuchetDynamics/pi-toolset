# Repository Compose procedure

## Contract and discovery

This is Hermes **in** Docker, not the Docker terminal backend. Each instance owns one persistent `/opt/data` home and one repo mount at `/workspace`. Its human-facing profile name is the original repository basename; its internal Hermes profile is the default home of that isolated instance, not a shared host profile or nested multi-profile team. Two repos called `api` may both display `api`, but every administrative command must use their distinct Compose IDs.

Resolve the target with Git and canonical filesystem paths; verify it is the worktree root, not its `.hermes` child. Inspect existing files before writing. Treat linked worktrees with external Git metadata as a boundary: mounting the worktree alone may not expose its Git metadata. Stop and propose a narrowly reviewed additional mount or standalone checkout; never mount broad parent trees to make Git work accidentally.

Check Docker/Compose versions with harmless version calls. Establish which Docker context/daemon commands address. The baseline assumes a local daemon able to bind the verified host path. A remote daemon, rootless UID mapping, Desktop filesystem translation or unavailable permissions requires an explicit adapted plan, not a blind bind mount. Do not install Docker, enable services, join privileged groups or switch contexts as a side effect.

Choose the official image version with the user, inspect/pull only within approved scope, and record its immutable digest. `latest`/`stable` are discovery channels, not deployment pins. The planner accepts only `nousresearch/hermes-agent@sha256:<64 lowercase hex>`; it cannot verify that the digest exists or is compatible. Verify the selected image's entrypoint, gateway supervision, config schema, Python, Holographic plugin support and dashboard/auth behavior. Use published source matching that image, not a moving-main snippet. A separately approved derived image requires its own source review and digest; do not disguise it as the official image.

## Identity, ownership and collision rules

The offline planner canonicalizes the repo path, keeps its basename as `profileName`, computes full SHA-256 `repoId`, and constructs `hermes-<bounded-slug>-<first-16-hash-characters>`. Short hashes are identifiers, not proof of ownership: compare the **full** hash and canonical path as well. If names collide but ownership differs or is absent, stop; never adopt, relabel, delete or recreate the other instance.

Persist a local identity receipt (for example `.hermes/identity.json`) and the Compose document `.hermes/compose.yaml`. JSON is valid Compose/YAML; write only the plan's `compose` object, not its `identity`/`requiredConfig` envelope. The helper does not validate Git, inspect Docker, write these files or authorize deployment. Acquire a repo-local exclusive setup lock before applying so two installers cannot race; if ownership/liveness is unclear, stop instead of deleting a lock.

Before first write, verify `.hermes` and target files are not symlinked/shared and are not someone else's Hermes home. Back up existing owned files outside tracked paths. Ignore generated `.hermes` runtime files before writing secrets (use a reviewed `.gitignore` entry or repo-local Git exclusion); verify none are already tracked. Never overwrite a checked-in config or recreate a missing identity receipt by assuming matching names mean ownership.

The Compose service, `data` volume, and `default` network carry `io.pi-toolset.hermes.repo-id`, `repo-path`, and `profile` labels. Inspect existing resources by their exact generated names and Compose project labels. Compare full ownership labels and actual mounts with the receipt and canonical target. The volume is project-scoped (`<project>_data` by ordinary Compose naming); the network is likewise project-scoped. No resource sets a global `name`, `container_name` or `external: true`.

Every Compose command must explicitly select the same Docker context, `-p "$PROJECT"` and `-f "$COMPOSE"` verified absolute file path. Do not rely on cwd, inherited `COMPOSE_FILE`, `COMPOSE_PROJECT_NAME`, overrides or a directory basename. Inspect/neutralize conflicting Compose environment selectors and use the intended env file explicitly where necessary. Validate the **resolved** configuration before acting. Labels are useful evidence, not an authentication boundary against another Docker administrator.

Reruns reuse unchanged identity, volume and configuration. Changing checkout path (including copying `.hermes` to another checkout), Docker context, image, mounts or ownership requires a new preview; moving a repo is not permission to orphan its old state or clone another repo's secrets. Never fix a collision by stopping another stack. Do not run `--remove-orphans`, daemon-wide prune, volume removal or `down -v`.

## Mounts, ownership and configuration

The baseline uses a Docker-managed named volume for `/opt/data`, avoiding a shared host `~/.hermes` and VM bind-mounted SQLite WAL pitfalls. Keep it across container recreation. Backups must be verified and consistent (quiescent writer or supported SQLite backup), never a raw live WAL database copy. Do not inspect host Docker storage internals directly.

`/workspace` is an **absolute canonical repo bind**, not `.` relative to `.hermes/compose.yaml`; `create_host_path: false` prevents a typo creating an empty host directory. It is read/write because this is a coding agent: explain that the container can change/delete mounted source, and obtain that scope in the deployment preview. The mount is not a security boundary for that source. Do not mount the host Docker socket, home directory, SSH keys or unrelated repos. Bridge networking does not restrict outbound Internet access by itself.

Pass the actual non-root host UID/GID (1–65534 in inspected image) through `HERMES_UID`/`HERMES_GID`. Do not add `user: <host-id>` or override the image entrypoint: newer s6 images need their root bootstrap to remap/drop privileges. Named volumes do not magically fix repository-bind permissions. Verify the effective application user and create/remove only an owned temporary permission probe in `/workspace`. Never recursively chown the repository or reuse root credentials to hide a mismatch.

The plan's `requiredConfig` is a **narrow merge** after installed-schema and memory handoff checks:

```yaml
terminal:
  backend: local
  cwd: /workspace
memory:
  provider: holographic
plugins:
  hermes-memory-store:
    db_path: /opt/data/memory_store.db
    auto_extract: false
```

`working_dir` alone may not configure the supervised gateway's tool subprocesses. Verify actual tool cwd/backend from the selected image and a bounded authorized probe. Use the local terminal backend **inside** this container, not a nested Docker backend with the host socket. Preserve existing unrelated config, tuning and credentials; never replace a full config with this fragment. Required memory keys are owned by the Holographic skill's approval and preservation rules.

For new state, guide user-entered provider/model setup inside this one home. Keep credentials in the selected instance's owner-only `/opt/data/.env` or its supported secret store, not images, Git, compose literals, process arguments or transcripts. Do not copy the host's `.env`/OAuth token stores. Distinct gateway instances must not compete for the same polling bot token/account; ask for separate channel credentials or use an approved API/CLI-only arrangement. Retain repository identity and coding remit in new profile instructions without overwriting an existing SOUL or inventing its mission.

## Required Holographic handoff (before gateway readiness)

Load the full **memory-holographic-hermes-setup** skill and its setup reference. Use its catalog path when readable; otherwise read [the sibling source skill](../../memory-holographic-hermes-setup/SKILL.md), relative to this reference file (not cwd). This works in both the package tree and flattened installs. Catalog absence is not a blocker when these instruction files are readable; no installation or reload is required. Follow the entry skill's source/trust checks and load the complete instructions, not a copied recipe. Check this handoff's files before provisioning: genuinely missing instructions block deployment/readiness, while independent read-only repo discovery may continue. Report the exact missing path and one next action. Reading the skill does not establish runtime plugin availability or authorize changes.

Pass: canonical host repo + full repo ID; explicit Docker context/project/Compose file; verified owned service/container ID and volume; selected image digest; runtime home `/opt/data`; actual container Python and verified application UID/GID/HOME; approved setup/quiescence boundaries. The memory skill's container adapter treats this as an explicitly selected default home **inside that instance**. It must never run its Python/config commands on the host or another instance. Preserve that mapping across every reopen/cleanup.

Direct Python/config/backup commands must execute as the verified non-root gateway user with explicit HOME and HERMES_HOME, not Docker exec's default root. The `hermes` CLI shim does not privilege-drop arbitrary Python. Use exec-time user selection on the already bootstrapped maintenance container (not a Compose service `user:` override), verify effective IDs and database permissions, and perform all canary/reopen/cleanup steps as that same user. Root success is not gateway readiness.

For a new instance, Holographic with `auto_extract: false` is the required default. For existing state, another provider, shared/outside database, or missing dependencies, honor the memory skill's separate approval gates. No silent fallback to builtin-only memory; report readiness blocked if Holographic cannot be configured and locally verified. NumPy is checked in the container runtime, not host Python; disclose basic-mode limits if absent. Do not promise semantic truth detection.

Recent images keep `/opt/hermes` and its Python install immutable. If a provider/dependency is absent, inspect supported persistent plugin/dependency management under `/opt/data`; otherwise propose an approved reproducible derived image. Never `pip install` into the running image's immutable venv, chmod it writable or use `docker exec` as root to defeat that policy. Image recreation must retain/reproduce provider availability, not just its database.

## Provisioning and lifecycle sequence

Obtain a concrete deployment approval covering generated files, chosen image pull, selected volume/network/container creation, repo write access, required setup and intended interface. Dependency installation, existing-provider switches, data migrations and restarts retain their specific gates. Approval to create this **skill** is not approval to execute this sequence.

1. Check ownership and the setup lock; validate the plan/schema offline. Present required resources/settings and any blockers before Docker mutation. Use `docker compose ... config --quiet` for validation without printing expanded credentials; diagnostic JSON must be redacted.
2. Establish **one** maintenance writer with gateway/cron/dashboard writers quiescent. Check the selected image's bootstrap first: `compose run` or changing the CMD to `sleep` does not necessarily disable s6 services or profile reconciliation. Use the image-supported maintenance/no-autostart path; if none is verified, stop. Never run a setup container against a volume already in use. Do not bypass `/init` to guess a workaround.
3. Initialize/setup only that approved state, verify UID/GID and repo permissions, and apply configuration through supported interfaces with backup/diff checks. Run the required Holographic skill and complete its local persistence/cleanup gate before gateway activation. Close every probe connection and maintenance process.
4. Reconcile/start only this approved project after all gates pass. No daemon-wide actions. A supervised image can stay “Up” while its gateway crashes repeatedly; inspect actual gateway status and scoped logs, not just the container state. Do not add an unverified `hermes status` healthcheck as a substitute.
5. Verify the live mount source, volume, user, actual terminal cwd, selected provider, cleaned-up canary persistence and gateway readiness. A restart/recreation persistence check requires its own approved scope and consistent backup. Never launch a second agent process on the same home just to test recall. Model inference, external messages and billable probes require authorization; otherwise label them pending.
6. Report identity, image, home/volume/workspace, changed keys/backups, Holographic NumPy/FTS5/probe evidence, gateway status, exact authorized interfaces/ports and remaining blockers. Failures stay partial/blocked; do not delete state to obtain a clean run.

Administrative examples (only after variables and approval are established):

```sh
# The selected Docker context is also explicit/verified for every invocation.
docker --context "$CONTEXT" compose -p "$PROJECT" -f "$COMPOSE" ps
docker --context "$CONTEXT" compose -p "$PROJECT" -f "$COMPOSE" logs --tail 100 hermes
docker --context "$CONTEXT" compose -p "$PROJECT" -f "$COMPOSE" stop hermes
```

Scope/redact logs before including them in a report. Starting/reconciling uses the same selectors with `up -d`; updates first approve a new inspected digest, back up consistent state, change only that instance's image pin, then pull/recreate and reverify. Pulling an unchanged digest does not upgrade it. Stopping a container preserves its volume; never remove volumes as an update step.

## Optional dashboard/API and ports

The default plan publishes **no ports** and leaves dashboard/API off; gateway chat channels do not need the pasted fixed host ports. With `--web`, container targets 8642 and 9119 publish only on `127.0.0.1`, with **no fixed `published` value**. Docker atomically selects available host ports, avoiding unreliable “scan a free port, then hope it stays free” allocation. The container-side targets may be the same across isolated bridge networks. Stop on any unexpected public/fixed binding in resolved config.

The web plan uses `.hermes/web.env` with Compose `env_file` **raw** format (requires Compose 2.30+ or compatible). Before enabling web, create that file owner-only, untracked/ignored, with only the selected instance's supported authentication variables:

- `API_SERVER_KEY` (strong unique value, meeting selected image minimum length)
- `HERMES_DASHBOARD_BASIC_AUTH_USERNAME`
- `HERMES_DASHBOARD_BASIC_AUTH_PASSWORD`
- `HERMES_DASHBOARD_BASIC_AUTH_SECRET` (restart-stable sessions)

Generate/enter secrets without printing them; validate presence/strength without exposing values. Raw env-file values are literal: do not add quoting that would become part of the secret. No placeholder credentials. Preserve existing auth providers rather than switching them implicitly. An approved different auth arrangement needs a reviewed plan adjustment; the template does not configure public OAuth/proxy deployment.

Container services must bind `0.0.0.0` **inside their bridge container** to be reachable through Docker publishing, so enable the selected image's required dashboard and API auth. Host publishing stays loopback. These two bind addresses serve different purposes; container-loopback binding plus host publishing is not a working shortcut. Never bypass the auth gate or enable wildcard CORS. Another container on a shared network can bypass the host binding, which is why networks remain per-project and auth still matters.

Discover actual endpoints after startup:

```sh
docker --context "$CONTEXT" compose -p "$PROJECT" -f "$COMPOSE" port hermes 8642
docker --context "$CONTEXT" compose -p "$PROJECT" -f "$COMPOSE" port hermes 9119
```

Report the returned loopback URLs. Mappings may change after recreation; rediscover them every time. Check unauthenticated requests are rejected/redirected and an approved authenticated health request succeeds, without sending an inference request. Do not call an endpoint “working” just because Docker allocated its port. A fixed external integration URL requires a separately approved stable-port/proxy plan; never silently pin a supposedly free port.

## Sources and validation limits

Recheck against the selected image/version before operations:

- [Official Hermes Docker guide](https://hermes-agent.nousresearch.com/docs/user-guide/docker/)
- [Upstream Compose example](https://github.com/NousResearch/hermes-agent/blob/main/docker-compose.yml) — host networking/fixed names are intentionally **not** copied here.
- [Docker bootstrap](https://github.com/NousResearch/hermes-agent/blob/main/docker/stage2-hook.sh), [command wrapper](https://github.com/NousResearch/hermes-agent/blob/main/docker/main-wrapper.sh) and [Hermes-only exec privilege shim](https://github.com/NousResearch/hermes-agent/blob/main/docker/hermes-exec-shim.sh)
- [Compose project isolation/precedence](https://docs.docker.com/compose/how-tos/project-name/)
- [Compose services: ports and env_file](https://docs.docker.com/reference/compose-file/services/)

Planner/installer tests cover deterministic identity, same-basename separation, no fixed/global resources, loopback dynamic publication, secret-free plans, config defaults and resource packaging. Compose CLI schema checks are offline; no test starts containers, pulls images, changes live profiles or invokes a model. Agent decision probes do not prove runtime provisioning. Deployment readiness is unverified until the real scoped checks above run.

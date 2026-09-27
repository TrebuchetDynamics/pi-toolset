# Optional official Docker-management skill

This is an **opt-in instruction dependency**, not part of ordinary setup and not a grant of Docker access. Keep the base installer's no-socket default. An agent can learn the Docker workflow without being allowed to execute it.

## 1. Approve instruction installation separately

Preview the selected repo/container, verified Hermes home, official source/revision and installation scope. Ask explicitly before downloading/installing this optional skill; an ordinary Hermes install request does not select it. Reuse an existing exact-scope decision, including a decline. Installing or editing this Pi skill does not authorize installing a Hermes skill.

The requested official catalog command is:

```sh
# Inside the verified Hermes runtime, not the host's ambient Hermes installation:
hermes skills install official/devops/docker-management
```

Verify the selected runtime's supported CLI/catalog identifier before use. Review the resolved source and bundled scripts, record its revision/content identity, and honor trust/security scan failures; do not bypass them because the source is named `official`. Do not invent a revision flag. If the installer cannot install the reviewed content or would execute hooks/install dependencies beyond the approved scope, stop and resolve that delta first.

Use the existing scoped host launcher to run that command as the verified nonroot application user with explicit home/workspace, for example:

```sh
'/absolute/repo/.hermes/bin/hermes' skills install official/devops/docker-management
```

Replace the example with the verified launcher; never run both examples or call host `hermes` by guess. An existing stopped/unsupported runtime remains blocked; do not start/recreate it just to install instructions. Keep the single-writer window and inspect this CLI's write/reload behavior before using it against an active home.

For a new workspace-local instance, installation belongs in the loader's verified skills directory under `/workspace/.hermes`, backed by `<repo>/.hermes` (normally its `skills/` subtree). Check the actual installed path and consumer discovery rather than inventing category/profile layout. Preserve owner content, restrictive permissions and Git exclusion. Existing homes are discovered and retained until an explicitly approved migration; this optional step does not resolve the base installer's image-compatibility blocker.

Verify installed content/source identity and supported loader discovery without running a Docker operation or invoking a model. If consumer loading cannot be checked safely, report that separately as pending. No runtime toolchain installation, container-control grant or automatic skill update follows.

## 2. Docker access is another approval and design

**Installing instructions grants no Docker permissions.** Docker CLI presence, membership in a group, a project name or a skill's prerequisites do not authorize daemon access.

- Unrestricted Docker daemon access can control other containers, mount host paths and, with a rootful daemon, grant host-root-equivalent power. Rootless Docker still exposes that daemon's resources and host-user authority.
- A `docker.sock:ro` bind is **not a read-only Docker API**: the client can still send mutating requests through the socket. Do not add it, change socket permissions, join the Docker group, add sudo rules, enable a TCP daemon, or provide SSH/remote-daemon credentials as a workaround.
- `compose -p`, labels, instructions and an agent-editable shell wrapper are selectors/conventions, **not access controls**. A generic socket proxy allowing container creation is not automatically project-scoped either.
- Keep unrestricted socket access outside this installer's supported baseline. A future self-management capability needs a separately reviewed, explicitly approved external controller or equivalent enforced boundary: exact daemon/repo/project/resources, allowed operations, secret-safe outputs, immutable or validated configuration and mounts, authentication, revocation and downtime. Do not let an agent-editable Compose file turn a supposedly restricted apply endpoint into arbitrary host mounts or privileged containers. No such controller is supplied by this skill.

Until that boundary exists and is verified, the agent can prepare a proposed change and ask the user to run the established host-side maintenance command after its normal gates. Report **instructions available; container control not granted**, not “self-management ready.” Approval to install the skill never implies approval of this second design or any Docker operation.

## 3. Keep the repo installer's narrower operational contract

The [official Docker-management reference](https://github.com/NousResearch/hermes-agent/blob/main/optional-skills/devops/docker-management/SKILL.md) includes broad administrative examples. It is an upstream discovery source, not a pinned runtime qualification or permission grant. For this repo instance, retain the installer boundaries:

- Explicit verified context/project/Compose file/service and full ownership checks on every allowed operation; do not touch unrelated stacks.
- No prune, `down -v`, volume removal, arbitrary `exec`, root package installation, unrequested pull/build/push, public exposure or automatic credential copying.
- Do not emit raw `docker inspect`, `exec env`, expanded Compose configuration or private logs. Use existing bounded redacted diagnostics; even read-only daemon queries can expose secrets.
- Saved files and successful Docker CLI exits are not gateway/channel/memory readiness. Preserve state, immutable image pins, single-writer coordination and operation-specific approvals.
- Self-recreation can kill the requesting agent before verification. Do not implement it as a terminal command followed by that agent's promise to report back. An approved external controller/operator must own execution, durable result reporting and post-recreation checks. No observed result means pending/unknown, not success; never retry a destructive or downtime action blindly.

## Record separate outcomes

During authorized setup/reconciliation, retain distinct nonsecret evidence in the existing version-1 receipt: instruction-install decision/status, resolved source identity and installed path; loader verification; **separate** control decision and enforced scope (or `not granted`); operation approvals/results and pending gates. Preserve unrelated fields and prior decisions. A receipt grants no permission; read-only status does not create or repair one.

Report instruction availability, container-control availability and actual runtime readiness separately. None implies the others. This documentation does not install the upstream skill, grant daemon access, create a controller or deploy anything.

import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
// Break caught: a source-only entry/handoff points at a nonexistent skill or
// loses its resources because the agent resolves paths from the target repo.
// Agent decision fixtures cover when to use these links; this checks the actual
// file graph shipped for reading without a registered skill catalog.
for (const [entry, name] of [
  ["prompts/hermes-repo-install.md", "hermes-repo-install"],
  ["prompts/memory-holographic-hermes-setup.md", "memory-holographic-hermes-setup"],
  ["skills/engineering/hermes-repo-install/SKILL.md", "memory-holographic-hermes-setup"],
  ["skills/engineering/hermes-repo-install/references/compose.md", "memory-holographic-hermes-setup"],
]) {
  const entryFile = path.join(root, entry);
  const links = [...fs.readFileSync(entryFile, "utf8").matchAll(/\]\(([^)]+\.md)\)/g)].map(match => match[1]);
  const target = links.find(link => link.endsWith(`/${name}/SKILL.md`));
  assert.ok(target, `${entry} needs a resolvable source handoff to ${name}`);
  const skillFile = path.resolve(path.dirname(entryFile), target);
  const skill = fs.readFileSync(skillFile, "utf8");
  assert.equal(skill.match(/^name: (.+)$/m)?.[1], name, "handoff must load the intended skill");
  for (const [, reference] of skill.matchAll(/\]\(([^)]+\.md)\)/g)) {
    if (/^https?:/.test(reference)) continue;
    assert.ok(fs.statSync(path.resolve(path.dirname(skillFile), reference)).isFile(),
      `missing source skill resource: ${reference}`);
  }
}

const helper = path.join(root, "skills/engineering/hermes-repo-install/scripts/compose-plan.mjs");
assert.ok(fs.existsSync(helper), "the install skill needs an offline collision-safe Compose planner");
const { makePlan } = await import(helper);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hermes-compose-"));
const image = `nousresearch/hermes-agent@sha256:${"a".repeat(64)}`;
const options = { image, uid: 1000, gid: 1000 };
try {
  const a = path.join(tmp, "a", "api");
  const b = path.join(tmp, "b", "api");
  for (const repo of [a, b]) fs.mkdirSync(repo, { recursive: true });
  const before = fs.readdirSync(a);
  const first = makePlan({ ...options, repo: a });
  const second = makePlan({ ...options, repo: b });

  // Break caught: repo-basename-only identity reuses another checkout's stack/state.
  assert.equal(first.identity.profileName, "api");
  assert.equal(second.identity.profileName, "api");
  assert.notEqual(first.identity.projectName, second.identity.projectName);
  assert.notEqual(first.identity.repoId, second.identity.repoId);
  assert.match(first.identity.projectName, /^hermes-api-[a-f0-9]{16}$/);
  assert.equal(first.identity.repoPath, fs.realpathSync(a));
  assert.equal(first.compose.name, first.identity.projectName);
  assert.deepEqual(makePlan({ ...options, repo: a }), first, "reruns must preserve identity");
  const alias = path.join(tmp, "alias");
  fs.symlinkSync(a, alias, "dir");
  assert.deepEqual(makePlan({ ...options, repo: alias }), first, "path aliases must not spawn duplicate owners");
  assert.deepEqual(fs.readdirSync(a), before, "planning must not create runtime files");

  // Break caught: user-facing exec names gain a hash/replica suffix, or a
  // same-basename collision silently changes the required container name.
  assert.equal(first.identity.containerName, "hermes-api");
  assert.equal(first.compose.services.hermes.container_name, "hermes-api");
  assert.equal(second.identity.containerName, "hermes-api", "offline planner must not pretend to discover daemon collisions");
  assert.equal(second.compose.services.hermes.container_name, "hermes-api", "same daemon collision must block deployment, not change names");
  const kenworth = path.join(tmp, "kenworth-cummins-ing");
  fs.mkdirSync(kenworth);
  assert.equal(makePlan({ ...options, repo: kenworth }).compose.services.hermes.container_name, "hermes-kenworth-cummins-ing");

  const service = first.compose.services.hermes;
  assert.equal(service.image, image);
  assert.deepEqual(service.command, ["gateway", "run"]);
  assert.equal(service.working_dir, "/workspace");
  assert.equal(service.environment.HERMES_HOME, "/opt/data");
  assert.equal(service.environment.HERMES_UID, "1000");
  assert.equal(service.environment.HERMES_GID, "1000");
  assert.equal(service.environment.HERMES_DASHBOARD, "0");
  assert.equal(service.environment.API_SERVER_ENABLED, "false");
  assert.equal(service.ports, undefined, "headless gateway must not reserve host ports");
  // Break caught: headless installs never receive repo provider credentials,
  // or web installs split secrets into a second independently managed file.
  assert.deepEqual(service.env_file, [
    { path: path.join(fs.realpathSync(a), ".hermes", ".env"), required: true, format: "raw" },
  ]);
  for (const forbidden of ["network_mode", "privileged", "entrypoint", "user"]) {
    assert.equal(service[forbidden], undefined, `unsafe or conflicting override: ${forbidden}`);
  }
  assert.deepEqual(service.volumes, [
    { type: "volume", source: "data", target: "/opt/data" },
    { type: "bind", source: fs.realpathSync(a), target: "/workspace", bind: { create_host_path: false } },
  ]);
  for (const [kind, key] of [["volumes", "data"], ["networks", "default"]]) {
    const resource = first.compose[kind][key];
    assert.equal(resource.name, undefined, "Docker must namespace resources by the explicit project");
    assert.equal(resource.external, undefined);
    assert.equal(resource.labels["io.pi-toolset.hermes.repo-id"], first.identity.repoId);
    assert.equal(resource.labels["io.pi-toolset.hermes.repo-path"], fs.realpathSync(a));
  }
  assert.equal(service.labels["io.pi-toolset.hermes.profile"], "api");
  assert.deepEqual(first.requiredConfig, {
    terminal: { backend: "local", cwd: "/workspace" },
    memory: { provider: "holographic" },
    plugins: { "hermes-memory-store": { db_path: "/opt/data/memory_store.db", auto_extract: false } },
  });

  // Break caught: two web instances publish a fixed port, or publish to the LAN.
  const web = makePlan({ ...options, repo: a, web: true });
  assert.deepEqual(web.compose.services.hermes.ports, [
    { target: 8642, host_ip: "127.0.0.1", protocol: "tcp" },
    { target: 9119, host_ip: "127.0.0.1", protocol: "tcp" },
  ]);
  assert.deepEqual(web.compose.services.hermes.env_file, [
    { path: path.join(fs.realpathSync(a), ".hermes", ".env"), required: true, format: "raw" },
  ]);
  assert.equal(web.compose.services.hermes.environment.API_SERVER_HOST, "0.0.0.0");
  assert.equal(web.compose.services.hermes.environment.HERMES_DASHBOARD_HOST, "0.0.0.0");
  assert.equal(web.identity.projectName, first.identity.projectName, "web toggle must not abandon existing state");

  // Break caught: Compose interpolates $ in legitimate repository names/paths.
  const awkward = path.join(tmp, "9 API ${SECRET}: ö");
  fs.mkdirSync(awkward);
  const unusual = makePlan({ ...options, repo: awkward });
  assert.equal(unusual.identity.profileName, path.basename(awkward));
  assert.equal(unusual.compose.services.hermes.volumes[1].source, path.join(tmp, "9 API $${SECRET}: ö"));
  assert.match(unusual.identity.projectName, /^hermes-[a-z0-9-]+-[a-f0-9]{16}$/);
  assert.equal(unusual.compose.services.hermes.env_file[0].path, path.join(tmp, "9 API $${SECRET}: ö", ".hermes", ".env"));
  const long = path.join(tmp, "x".repeat(180));
  fs.mkdirSync(long);
  assert.ok(makePlan({ ...options, repo: long }).identity.projectName.length <= 63);
  assert.equal(makePlan({ ...options, repo: long }).identity.containerName, `hermes-${"x".repeat(180)}`, "container name must retain the full normalized repo basename");
  assert.match(unusual.identity.containerName, /^hermes-[a-z0-9-]+$/);

  // Reject mutable/foreign image inputs and unsupported ownership before any writes.
  for (const invalid of ["latest", "nousresearch/hermes-agent:latest", "evil/agent@sha256:" + "b".repeat(64)]) {
    assert.throws(() => makePlan({ ...options, repo: a, image: invalid }), /digest/);
  }
  for (const uid of [0, -1, 65535, "1000", 1.5, NaN]) {
    assert.throws(() => makePlan({ ...options, repo: a, uid }), /uid/);
  }
  assert.throws(() => makePlan({ ...options, repo: a, gid: 0 }), /gid/);
  assert.throws(() => makePlan({ ...options, repo: a, web: "false" }), /web/);
  assert.throws(() => makePlan({ ...options, repo: path.join(tmp, "missing") }), /ENOENT/);
  const file = path.join(tmp, "file");
  fs.writeFileSync(file, "not a directory");
  assert.throws(() => makePlan({ ...options, repo: file }), /directory/);

  const args = [helper, "--repo", a, "--image", image, "--uid", "1000", "--gid", "1000"];
  assert.deepEqual(JSON.parse(execFileSync(process.execPath, args, { encoding: "utf8" })), first);
  // No host Hermes executable/home/Python (or Docker) is needed by the planner.
  const emptyPath = path.join(tmp, "empty-bin");
  fs.mkdirSync(emptyPath);
  assert.deepEqual(JSON.parse(execFileSync(process.execPath, args, {
    encoding: "utf8", env: { PATH: emptyPath, HOME: path.join(tmp, "no-home"), HERMES_HOME: path.join(tmp, "no-hermes") },
  })), first);
  assert.equal(fs.existsSync(path.join(tmp, "no-home")), false);
  assert.equal(fs.existsSync(path.join(tmp, "no-hermes")), false);

  // Planning must not read, print, replace, or chmod a user's existing secrets.
  // These are synthetic test values, not credentials. Special characters must
  // survive Compose env_file loading literally rather than shell interpolation.
  const secretValue = 'fixture-only-${SECRET}-$cash-#hash-"quoted"';
  const envText = `OPENROUTER_API_KEY=${secretValue}\nAPI_SERVER_KEY=${secretValue}\n`;
  for (const repo of [a, awkward]) {
    fs.mkdirSync(path.join(repo, ".hermes"));
    fs.writeFileSync(path.join(repo, ".hermes", ".env"), envText, { mode: 0o600 });
  }
  const planned = execFileSync(process.execPath, args, { encoding: "utf8" });
  assert.deepEqual(JSON.parse(planned), first);
  assert.equal(planned.includes(secretValue), false);
  assert.equal(fs.readFileSync(path.join(a, ".hermes", ".env"), "utf8"), envText);
  assert.equal(fs.statSync(path.join(a, ".hermes", ".env")).mode & 0o777, 0o600);
  for (const extra of [["--unknown"], ["--uid", "1001"], ["--web", "--web"], ["--hashed-name"]]) {
    const result = spawnSync(process.execPath, [...args, ...extra], { encoding: "utf8" });
    assert.notEqual(result.status, 0, "unknown/duplicate options must fail closed");
    assert.equal(result.stdout, "", "invalid input must not emit a usable plan");
  }

  // Break caught: the documented host launcher picks an ambient project/root
  // user, loses quoted argv, allocates a TTY in pipes, or masks Docker failures.
  // Execute the actual reference template against an argv-recording Docker
  // boundary; never exec a real container or start an OAuth flow in tests.
  const cliGuide = fs.readFileSync(path.join(root,
    "skills/engineering/hermes-repo-install/references/host-cli.md"), "utf8");
  const launcherTemplate = cliGuide.match(/```sh\n(#!\/bin\/sh\n[\s\S]*?)```/)?.[1];
  const aliasTemplate = cliGuide.match(/```sh\n(# aliases\.sh\n[\s\S]*?)```/)?.[1];
  const applyTemplate = cliGuide.match(/<!-- apply-launcher -->\n```sh\n(#!\/bin\/sh\n[\s\S]*?)```/)?.[1];
  const statusTemplate = cliGuide.match(/<!-- status-launcher -->\n```sh\n(#!\/bin\/sh\n[\s\S]*?)```/)?.[1];
  const logsTemplate = cliGuide.match(/<!-- logs-launcher -->\n```sh\n(#!\/bin\/sh\n[\s\S]*?)```/)?.[1];
  assert.ok(launcherTemplate && aliasTemplate && applyTemplate && statusTemplate && logsTemplate,
    "host CLI guide needs runnable CLI, apply, status, logs and alias templates");
  const cliRepo = path.join(tmp, "CLI user's repo $literal");
  const cliBin = path.join(cliRepo, ".hermes", "bin");
  fs.mkdirSync(cliBin, { recursive: true });
  // Replace sample repo literals with a shell-escaped path containing spaces,
  // a quote and a dollar sign; command arguments remain opaque data.
  const shellPath = cliRepo.replaceAll("'", "'\\''");
  const launcher = path.join(cliBin, "hermes");
  fs.writeFileSync(launcher, launcherTemplate.replaceAll("/srv/projects/api", shellPath), { mode: 0o700 });
  const applyLauncher = path.join(cliBin, "hermes-apply");
  fs.writeFileSync(applyLauncher, applyTemplate.replaceAll("/srv/projects/api", shellPath), { mode: 0o700 });
  fs.copyFileSync(path.join(root, "skills/engineering/hermes-repo-install/scripts/wait-ready.mjs"), path.join(cliBin, "wait-ready.mjs"));
  const readinessProbe = path.join(cliBin, "hermes-readiness-probe");
  fs.writeFileSync(readinessProbe, `#!${process.execPath}\nconsole.log('PRIVATE_PROBE_TOKEN'); console.error('PRIVATE_PROBE_TOKEN'); process.exit(Number(process.env.FAKE_PROBE_CODE || 0));\n`, { mode: 0o700 });
  const statusLauncher = path.join(cliBin, "hermes-status");
  const logsLauncher = path.join(cliBin, "hermes-logs");
  fs.writeFileSync(statusLauncher, statusTemplate.replaceAll("/srv/projects/api", shellPath), { mode: 0o700 });
  fs.writeFileSync(logsLauncher, logsTemplate.replaceAll("/srv/projects/api", shellPath), { mode: 0o700 });
  const logHelper = path.join(root, "skills/engineering/hermes-repo-install/scripts/log-events.mjs");
  fs.copyFileSync(logHelper, path.join(cliBin, "log-events.mjs"));
  const { summarizeLogEvents } = await import(logHelper);
  assert.deepEqual(summarizeLogEvents("telegram disconnected token=private\n401 Unauthorized secret=private\ngetUpdates progressing\ntelegram disconnected\n"),
    ["Telegram disconnection event", "Authentication rejection event", "Telegram polling progress event"]);
  assert.deepEqual(summarizeLogEvents("unrecognized private message"), []);
  const oversizeLogs = spawnSync(process.execPath, [logHelper], { encoding: "utf8", input: "SECRET".repeat(180000) });
  assert.equal(oversizeLogs.status, 1);
  assert.equal((oversizeLogs.stdout + oversizeLogs.stderr).includes("SECRET"), false);
  const aliasFile = path.join(cliRepo, ".hermes", "aliases.sh");
  // The alias stores an already shell-quoted command, inside double quotes.
  const aliasPath = shellPath.replaceAll("\\", "\\\\").replaceAll('"', '\\"').replaceAll("$", "\\$").replaceAll("`", "\\`");
  fs.writeFileSync(aliasFile, aliasTemplate.replaceAll("/srv/projects/api", aliasPath));
  const fakeBin = path.join(tmp, "fake-docker");
  fs.mkdirSync(fakeBin);
  fs.writeFileSync(path.join(fakeBin, "docker"), `#!${process.execPath}\nimport fs from 'node:fs';\nimport { once } from 'node:events';\nconst call = { args: process.argv.slice(2), cwd: process.cwd(), selectors: Object.keys(process.env).filter(k => ["COMPOSE_FILE", "COMPOSE_PROJECT_NAME", "COMPOSE_PROFILES", "COMPOSE_ENV_FILES"].includes(k)) };\nif (process.env.FAKE_CALLS) fs.writeFileSync(process.env.FAKE_CALLS, JSON.stringify(call));\nif (call.args.includes('logs') && process.env.FAKE_LOG_BYTES) {\n  for (let remaining = Number(process.env.FAKE_LOG_BYTES); remaining > 0; remaining -= 65536) {\n    if (!process.stdout.write('S'.repeat(Math.min(65536, remaining)))) await once(process.stdout, 'drain');\n  }\n  if (process.env.FAKE_DRAINED_MARKER) fs.writeFileSync(process.env.FAKE_DRAINED_MARKER, 'completed');\n} else if (call.args.includes('logs')) process.stdout.write(process.env.FAKE_LOG_LINES || '');\nelse console.log(JSON.stringify(call));\nif (process.env.FAKE_STDERR) process.stderr.write(process.env.FAKE_STDERR);\nprocess.exit(Number(process.env.FAKE_EXIT || 0));\n`, { mode: 0o700 });
  const cliEnv = { ...process.env, PATH: `${fakeBin}:${process.env.PATH}`,
    COMPOSE_FILE: "foreign.yaml", COMPOSE_PROJECT_NAME: "foreign", COMPOSE_PROFILES: "foreign", COMPOSE_ENV_FILES: "foreign.env" };
  const cliArgs = ["auth", "add", "openai-codex", "--type", "oauth", "space arg", "$(touch not-created)", "single'quote"];
  const expectedPrefix = ["--context", "default", "compose", "--env-file", "/dev/null",
    "-p", "hermes-api-0123456789abcdef", "-f", path.join(cliRepo, ".hermes", "compose.yaml"),
    "exec", "-T", "--user", "1000:1000", "--workdir", "/workspace", "-e", "HOME=/opt/data",
    "-e", "HERMES_HOME=/opt/data", "hermes", "/opt/hermes/bin/hermes"];
  const runCli = (args, env = cliEnv) => spawnSync("sh", [launcher, ...args], { encoding: "utf8", env });
  const invocation = runCli(cliArgs);
  assert.equal(invocation.status, 0, invocation.stderr);
  assert.deepEqual(JSON.parse(invocation.stdout), { args: [...expectedPrefix, ...cliArgs], cwd: cliRepo, selectors: [] });
  assert.equal(fs.existsSync(path.join(cliRepo, "not-created")), false);
  assert.deepEqual(JSON.parse(runCli([]).stdout).args, [...expectedPrefix, "--help"], "bare alias must not start another agent");
  assert.equal(runCli(["--help"], { ...cliEnv, FAKE_EXIT: "23" }).status, 23, "preserve Docker exit status; no auto-start fallback");
  const aliased = spawnSync("sh", ["-c", '. "$1"\nhermes-api --help', "sh", aliasFile], { encoding: "utf8", env: cliEnv });
  assert.equal(aliased.status, 0, aliased.stderr);
  assert.deepEqual(JSON.parse(aliased.stdout).args, [...expectedPrefix, "--help"], "alias must work from outside the repo");
  // Break caught: applying changes merely restarts stale injected env, touches
  // dependencies/other projects, silently pulls, drops volumes, or eats errors.
  const applyExpected = ["--context", "default", "compose", "--env-file", "/dev/null",
    "-p", "hermes-api-0123456789abcdef", "-f", path.join(cliRepo, ".hermes", "compose.yaml"),
    "up", "-d", "--no-deps", "--force-recreate", "--pull", "never", "--no-build", "hermes"];
  const apply = spawnSync("sh", [applyLauncher], { encoding: "utf8", env: cliEnv });
  assert.equal(apply.status, 0, apply.stderr);
  assert.deepEqual(JSON.parse(apply.stdout.split("\n")[0]), { args: applyExpected, cwd: cliRepo, selectors: [] });
  assert.match(apply.stdout, /Ready: gateway and configured channels verified/);
  assert.equal((apply.stdout + apply.stderr).includes("PRIVATE_PROBE_TOKEN"), false);
  assert.equal(spawnSync("sh", [applyLauncher, "foreign-service"], { encoding: "utf8", env: cliEnv }).status, 2);
  assert.equal(spawnSync("sh", [applyLauncher], { encoding: "utf8", env: { ...cliEnv, FAKE_EXIT: "24" } }).status, 24);
  const applyAlias = spawnSync("sh", ["-c", '. "$1"\nhermes-api-apply', "sh", aliasFile], { encoding: "utf8", env: cliEnv });
  assert.equal(applyAlias.status, 0, applyAlias.stderr);
  assert.deepEqual(JSON.parse(applyAlias.stdout.split("\n")[0]).args, applyExpected);
  assert.match(applyAlias.stdout, /Ready: gateway and configured channels verified/);
  const blockedApply = spawnSync("sh", [applyLauncher], { encoding: "utf8", env: { ...cliEnv, FAKE_PROBE_CODE: "20" } });
  assert.notEqual(blockedApply.status, 0, "Docker success is not success while a configured channel is disconnected");
  assert.equal((blockedApply.stdout + blockedApply.stderr).includes("PRIVATE_PROBE_TOKEN"), false);
  fs.renameSync(readinessProbe, `${readinessProbe}.disabled`);
  const unprobedCalls = path.join(tmp, "unprobed-apply-call");
  const noProbeApply = spawnSync("sh", [applyLauncher], { encoding: "utf8", env: { ...cliEnv, FAKE_CALLS: unprobedCalls } });
  assert.notEqual(noProbeApply.status, 0);
  assert.equal(fs.existsSync(unprobedCalls), false, "missing readiness adapter must block before recreation");
  fs.renameSync(`${readinessProbe}.disabled`, readinessProbe);
  assert.deepEqual(JSON.parse(runCli(["setup"]).stdout).args, [...expectedPrefix, "setup"], "private setup must keep the repo workspace and scoped runtime");

  // Break caught: diagnostics expose arbitrary log bodies/secrets, invoke a
  // mutating Docker command, leak Docker errors, or imply live readiness.
  const dockerPrefix = ["--context", "default", "compose", "--env-file", "/dev/null",
    "-p", "hermes-api-0123456789abcdef", "-f", path.join(cliRepo, ".hermes", "compose.yaml")];
  const status = spawnSync("sh", [statusLauncher], { encoding: "utf8", env: cliEnv });
  assert.equal(status.status, 0, status.stderr);
  assert.match(status.stdout, /not gateway readiness/i);
  const statusCall = JSON.parse(status.stdout.trim().split("\n").at(-1));
  assert.deepEqual(statusCall.args, [...dockerPrefix, "ps", "--all", "--format", "table {{.Name}}\\t{{.State}}\\t{{.Health}}", "hermes"]);
  assert.deepEqual(statusCall.selectors, []);
  const logCalls = path.join(tmp, "log-call.json");
  const logEnv = { ...cliEnv, FAKE_CALLS: logCalls, FAKE_LOG_LINES:
    "22:15 Gateway running with 1 platform(s) secret=FIXTURE_SECRET\n22:20 telegram connected bot-token=FIXTURE_SECRET\n22:21 Cold boot: dropping Telegram updates queued while offline\nUser message and private URL: FIXTURE_SECRET\n" };
  const logs = spawnSync("sh", [logsLauncher], { encoding: "utf8", env: logEnv });
  assert.equal(logs.status, 0, logs.stderr);
  assert.equal(logs.stdout.includes("FIXTURE_SECRET"), false);
  assert.match(logs.stdout, /Gateway startup event/);
  assert.match(logs.stdout, /Telegram connection event/);
  assert.match(logs.stdout, /Telegram backlog discarded/);
  assert.match(logs.stdout, /not live readiness/i);
  assert.deepEqual(JSON.parse(fs.readFileSync(logCalls, "utf8")).args,
    [...dockerPrefix, "logs", "--no-color", "--no-log-prefix", "--tail", "100", "hermes"]);
  for (const [command, aliasName] of [[statusLauncher, "hermes-api-status"], [logsLauncher, "hermes-api-logs"]]) {
    assert.equal(spawnSync("sh", [command, "foreign-service"], { encoding: "utf8", env: cliEnv }).status, 2);
    const failed = spawnSync("sh", [command], { encoding: "utf8", env: { ...logEnv, FAKE_EXIT: "25", FAKE_STDERR: "FIXTURE_SECRET" } });
    assert.notEqual(failed.status, 0);
    assert.equal((failed.stdout + failed.stderr).includes("FIXTURE_SECRET"), false);
    const fromAlias = spawnSync("sh", ["-c", `. "$1"\n${aliasName}`, "sh", aliasFile], { encoding: "utf8", env: logEnv });
    assert.equal(fromAlias.status, 0, fromAlias.stderr);
  }
  const quietLogs = spawnSync("sh", [logsLauncher], { encoding: "utf8", env: { ...cliEnv, FAKE_LOG_LINES: "password=FIXTURE_SECRET" } });
  assert.equal(quietLogs.status, 0);
  assert.match(quietLogs.stdout, /No recognized events/);
  assert.equal(quietLogs.stdout.includes("FIXTURE_SECRET"), false);

  // Limit must terminate collection itself, not buffer all logs in the shell
  // and only then reject in the summarizer. A full 8 MiB drain leaves a marker.
  const drainedMarker = path.join(tmp, "oversize-logs-drained");
  const oversizeLauncher = spawnSync("sh", [logsLauncher], { encoding: "utf8", env: {
    ...cliEnv, FAKE_LOG_BYTES: String(8 * 1024 * 1024), FAKE_DRAINED_MARKER: drainedMarker,
  } });
  assert.notEqual(oversizeLauncher.status, 0);
  assert.equal(fs.existsSync(drainedMarker), false, "stop Docker collection before buffering all oversized records");
  assert.ok((oversizeLauncher.stdout + oversizeLauncher.stderr).length < 200);

  // Linux PTY characterization, still using only the fake Docker boundary.
  const scriptVersion = spawnSync("script", ["--version"], { encoding: "utf8" });
  if (scriptVersion.status === 0 && scriptVersion.stdout.includes("util-linux")) {
    const quote = value => `'${value.replaceAll("'", "'\\''")}'`;
    const interactive = spawnSync("script", ["-q", "-e", "-c", `sh ${quote(launcher)} --help`, "/dev/null"], { encoding: "utf8", env: cliEnv });
    assert.equal(interactive.status, 0, interactive.stderr);
    assert.deepEqual(JSON.parse(interactive.stdout.trim()).args,
      [...expectedPrefix.filter(arg => arg !== "-T"), "--help"], "interactive terminal must retain Compose TTY");
  } else {
    console.log("hermes-repo-install: host launcher PTY check skipped (util-linux script unavailable)");
  }

  // Optional local CLI schema check only: no daemon, pulls, containers or inference.
  // Installed Compose catches actual syntax/interpolation errors beyond JSON structure.
  const version = spawnSync("docker", ["compose", "version"], { encoding: "utf8" });
  if (version.status === 0) {
    for (const plan of [first, unusual, web]) {
      const composeFile = path.join(tmp, "compose.json");
      fs.writeFileSync(composeFile, JSON.stringify(plan.compose));
      const result = spawnSync("docker", ["compose", "--env-file", "/dev/null", "-p", plan.identity.projectName, "-f", composeFile,
        "config", "--format", "json"], {
        encoding: "utf8", env: { ...process.env, SECRET: "must-not-expand" },
      });
      assert.equal(result.status, 0, result.stderr);
      const resolved = JSON.parse(result.stdout);
      assert.equal(resolved.services.hermes.container_name, plan.identity.containerName);
      // Compose serializes literal dollars escaped for round-tripping its output.
      const expectedPath = plan === unusual ? path.join(tmp, "9 API $${SECRET}: ö") : plan.identity.repoPath;
      assert.equal(resolved.services.hermes.volumes[1].source, expectedPath);
      assert.equal(resolved.services.hermes.labels["io.pi-toolset.hermes.repo-path"], expectedPath);
      for (const port of resolved.services.hermes.ports ?? []) assert.equal(port.host_ip, "127.0.0.1");
      // Like paths, Compose escapes dollar signs for round-tripping config output.
      assert.equal(resolved.services.hermes.environment.OPENROUTER_API_KEY, secretValue.replaceAll("$", () => "$$"));
      assert.equal(resolved.services.hermes.environment.API_SERVER_KEY, secretValue.replaceAll("$", () => "$$"));
    }
  } else {
    console.log("hermes-repo-install: Compose CLI schema check skipped (unavailable); no runtime claim");
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
await import("./hermes-operator.test.mjs");
console.log("hermes-repo-install ok");

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
  for (const forbidden of ["container_name", "network_mode", "privileged", "entrypoint", "user"]) {
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
    { path: path.join(fs.realpathSync(a), ".hermes", "web.env"), required: true, format: "raw" },
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
  const long = path.join(tmp, "x".repeat(180));
  fs.mkdirSync(long);
  assert.ok(makePlan({ ...options, repo: long }).identity.projectName.length <= 63);

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
  for (const extra of [["--unknown"], ["--uid", "1001"], ["--web", "--web"]]) {
    const result = spawnSync(process.execPath, [...args, ...extra], { encoding: "utf8" });
    assert.notEqual(result.status, 0, "unknown/duplicate options must fail closed");
    assert.equal(result.stdout, "", "invalid input must not emit a usable plan");
  }

  // Optional local CLI schema check only: no daemon, pulls, containers or inference.
  // Installed Compose catches actual syntax/interpolation errors beyond JSON structure.
  const version = spawnSync("docker", ["compose", "version"], { encoding: "utf8" });
  if (version.status === 0) {
    for (const plan of [first, unusual, web]) {
      const composeFile = path.join(tmp, "compose.json");
      fs.writeFileSync(composeFile, JSON.stringify(plan.compose));
      const result = spawnSync("docker", ["compose", "-p", plan.identity.projectName, "-f", composeFile,
        "config", "--no-env-resolution", "--format", "json"], {
        encoding: "utf8", env: { ...process.env, SECRET: "must-not-expand" },
      });
      assert.equal(result.status, 0, result.stderr);
      const resolved = JSON.parse(result.stdout);
      // Compose serializes literal dollars escaped for round-tripping its output.
      const expectedPath = plan === unusual ? path.join(tmp, "9 API $${SECRET}: ö") : plan.identity.repoPath;
      assert.equal(resolved.services.hermes.volumes[1].source, expectedPath);
      assert.equal(resolved.services.hermes.labels["io.pi-toolset.hermes.repo-path"], expectedPath);
      for (const port of resolved.services.hermes.ports ?? []) assert.equal(port.host_ip, "127.0.0.1");
    }
  } else {
    console.log("hermes-repo-install: Compose CLI schema check skipped (unavailable); no runtime claim");
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log("hermes-repo-install ok");

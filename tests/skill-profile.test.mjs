import assert from "node:assert/strict";
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { superpowersFixture } from "./fixtures/superpowers.mjs";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "skill-profile-"));
try {
  const upstream = superpowersFixture(path.join(tmp, "source"), root);
  const home = path.join(tmp, "home");
  const codex = path.join(home, ".agents/skills");
  const claude = path.join(home, ".claude/skills");
  const env = { ...process.env, ...upstream, HOME: home,
    CODEX_SKILLS_DIR: codex, CLAUDE_SKILLS_DIR: claude,
    CLAUDE_CONFIG_DIR: path.join(home, ".claude"),
    XDG_STATE_HOME: path.join(tmp, "state"), AGENT_SKILLS_BACKUP: "1",
    AGENT_SKILLS_DRY_RUN: "0", AGENT_SKILLS_BACKUP_DIR: path.join(tmp, "backups"),
  };
  for (const name of ["ponytail", "caveman", "tdd", "autonomous-codebase-improver", "hermes-repo-team", "user-owned"]) {
    fs.mkdirSync(path.join(codex, name), { recursive: true });
    fs.writeFileSync(path.join(codex, name, "SKILL.md"), `Owner-modified ${name}\n`);
  }
  const run = (...args) => execFileSync("sh", ["install-agent-skills.sh", ...args], { cwd: root, env, encoding: "utf8" });
  run("--dry-run");
  assert.equal(fs.existsSync(env.AGENT_SKILLS_BACKUP_DIR), false);
  run();
  for (const name of ["ponytail", "caveman", "tdd", "autonomous-codebase-improver", "hermes-repo-team"]) {
    const compatibility = path.join(codex, name, "SKILL.md");
    assert.ok(fs.existsSync(compatibility), `cached command must remain readable: ${name}`);
    assert.match(fs.readFileSync(compatibility, "utf8"), /^disable-model-invocation: true$/m);
    assert.equal(fs.readFileSync(path.join(env.AGENT_SKILLS_BACKUP_DIR, "Codex", name, "SKILL.md"), "utf8"), `Owner-modified ${name}\n`);
  }
  assert.equal(fs.readFileSync(path.join(codex, "user-owned/SKILL.md"), "utf8"), "Owner-modified user-owned\n");
  // An already-open Pi session still reads this path when expanding /skill:lgtm.
  for (const directory of [codex, claude]) {
    const legacy = path.join(directory, "lgtm/SKILL.md");
    assert.ok(fs.existsSync(legacy), "migration must preserve the explicit lgtm command path");
    assert.match(fs.readFileSync(legacy, "utf8"), /^disable-model-invocation: true$/m,
      "compatibility command must stay outside automatic workflow selection");
  }
  const names = fs.readdirSync(codex).filter(n => fs.existsSync(path.join(codex, n, "SKILL.md")));
  const automatic = names.filter(n => !/^disable-model-invocation: true$/m.test(fs.readFileSync(path.join(codex,n,"SKILL.md"),"utf8")));
  assert.equal(automatic.length, 24); // 23 daily + preserved owner skill; legacy commands are hidden
  const bridge = fs.readFileSync(path.join(codex,"autonomous-codebase-improver/SKILL.md"),"utf8");
  assert.ok(bridge.includes(path.join(env.AGENT_SKILLS_BACKUP_DIR,"Codex/autonomous-codebase-improver/SKILL.md")));
  assert.equal(fs.realpathSync(path.join(codex, "brainstorming")), path.join(upstream.SUPERPOWERS_DIR, "skills/brainstorming"));
  const before = fs.readdirSync(env.AGENT_SKILLS_BACKUP_DIR, { recursive: true });
  run();
  assert.deepEqual(fs.readdirSync(env.AGENT_SKILLS_BACKUP_DIR, { recursive: true }), before, "idempotent run must not grow backups");
  run("--profile=research");
  assert.ok(fs.existsSync(path.join(codex, "research-forge/SKILL.md")));
  run();
  assert.match(fs.readFileSync(path.join(codex,"research-forge/SKILL.md"),"utf8"), /^disable-model-invocation: true$/m);
  assert.ok(fs.existsSync(path.join(env.AGENT_SKILLS_BACKUP_DIR, "Codex/research-forge/SKILL.md")));

  // Break caught: optional team-management skill missing from automation, or its
  // references/shared contract lost when flattened by the real installer.
  const hermesName = "hermes-repo-profiles-team";
  const memoryName = "memory-holographic-hermes-setup";
  const installName = "hermes-repo-install";
  const hermesNames = [hermesName, memoryName, installName];
  for (const name of hermesNames) {
    assert.equal(fs.existsSync(path.join(codex, name, "SKILL.md")), false,
      `the core profile must not activate ${name}`);
  }
  // Each changed installation uses a fresh backup receipt, as a real run does.
  env.AGENT_SKILLS_BACKUP_DIR = path.join(tmp, "automation-backups");
  run("--profile=automation");
  const hermesReferences = ["discovery.md", "profiles-and-auth.md", "coordination.md", "maintenance.md", "team-contract.md", "root-briefing.md", "verification.md"];
  for (const directory of [codex, claude]) {
    // Break caught: the setup skill or its operational reference disappears
    // when the real installer flattens optional skills into another host.
    const memoryInstalled = path.join(directory, memoryName);
    assert.ok(fs.existsSync(path.join(memoryInstalled, "SKILL.md")), "automation must install Holographic setup");
    const memorySkill = fs.readFileSync(path.join(memoryInstalled, "SKILL.md"), "utf8");
    assert.doesNotMatch(memorySkill, /^disable-model-invocation: true$/m);
    assert.equal(fs.readFileSync(path.join(memoryInstalled, "references/setup.md"), "utf8"),
      fs.readFileSync(path.join(root, "skills/engineering", memoryName, "references/setup.md"), "utf8"));
    for (const [, target] of memorySkill.matchAll(/\]\(([^)]+\.md)\)/g)) {
      assert.ok(fs.existsSync(path.resolve(memoryInstalled, target)), `broken installed memory link: ${target}`);
    }
    const installDir = path.join(directory, installName);
    assert.ok(fs.existsSync(path.join(installDir, "SKILL.md")), "automation must install repo-scoped Hermes Compose setup");
    const installSkill = fs.readFileSync(path.join(installDir, "SKILL.md"), "utf8");
    assert.doesNotMatch(installSkill, /^disable-model-invocation: true$/m);
    for (const [, target] of installSkill.matchAll(/\]\(([^)]+\.md)\)/g)) {
      assert.ok(fs.existsSync(path.resolve(installDir, target)), `broken installed Compose link: ${target}`);
    }
    // Packaged helper must work from flattened installations, not just checkout paths.
    const plan = JSON.parse(execFileSync(process.execPath, [path.join(installDir, "scripts/compose-plan.mjs"),
      "--repo", tmp, "--image", `nousresearch/hermes-agent@sha256:${"a".repeat(64)}`,
      "--uid", "1000", "--gid", "1000"], { encoding: "utf8" }));
    assert.equal(plan.requiredConfig.memory.provider, "holographic");
    assert.equal(plan.compose.services.hermes.volumes[1].source, fs.realpathSync(tmp).replaceAll("$", () => "$$"));
    const installed = path.join(directory, hermesName);
    assert.ok(fs.existsSync(path.join(installed, "SKILL.md")), "automation must install the Hermes skill");
    const skill = fs.readFileSync(path.join(installed, "SKILL.md"), "utf8");
    assert.doesNotMatch(skill, /^disable-model-invocation: true$/m);
    for (const reference of hermesReferences) {
      assert.equal(fs.readFileSync(path.join(installed, "references", reference), "utf8"),
        fs.readFileSync(path.join(root, "skills/engineering", hermesName, "references", reference), "utf8"));
    }
    // Every local Markdown link in the installed entry point must resolve
    // outside the source checkout too, including rewritten shared links.
    for (const [, target] of skill.matchAll(/\]\(([^)]+\.md)\)/g)) {
      assert.ok(fs.existsSync(path.resolve(installed, target)), `broken installed link: ${target}`);
    }
  }
  const automationBackups = fs.readdirSync(env.AGENT_SKILLS_BACKUP_DIR, { recursive: true });
  run("--profile=automation");
  assert.deepEqual(fs.readdirSync(env.AGENT_SKILLS_BACKUP_DIR, { recursive: true }), automationBackups);

  // install.sh refreshes skills with AGENT_SKILLS_PRESERVE_PROFILE=1 so a recorded
  // profile survives installer reruns instead of silently returning to core.
  const profileFile = path.join(tmp, "profile", "skills-profile");
  env.AGENT_SKILLS_PROFILE_FILE = profileFile;
  env.AGENT_SKILLS_BACKUP_DIR = path.join(tmp, "preserve-backups");
  run("--profile=automation");
  assert.equal(fs.readFileSync(profileFile, "utf8").trim(), "automation");
  env.AGENT_SKILLS_PRESERVE_PROFILE = "1";
  run();
  for (const directory of [codex, claude]) {
    for (const name of hermesNames) {
      assert.doesNotMatch(fs.readFileSync(path.join(directory, name, "SKILL.md"), "utf8"),
        /^disable-model-invocation: true$/m, "install.sh must preserve the recorded optional profile");
    }
  }
  delete env.AGENT_SKILLS_PRESERVE_PROFILE;

  env.AGENT_SKILLS_BACKUP_DIR = path.join(tmp, "deactivation-backups");
  run();
  for (const directory of [codex, claude]) {
    for (const name of hermesNames) {
      assert.match(fs.readFileSync(path.join(directory, name, "SKILL.md"), "utf8"),
        /^disable-model-invocation: true$/m, "returning to core must deactivate the optional skill");
    }
  }
  assert.ok(fs.existsSync(path.join(env.AGENT_SKILLS_BACKUP_DIR, "Codex", hermesName, "references/coordination.md")),
    "deactivation must preserve archived skill references");

  // Native Claude plugin supplies its own skills; do not shadow its namespace.
  fs.writeFileSync(path.join(home, ".claude/settings.json"), JSON.stringify({ enabledPlugins: { "superpowers@test": true } }));
  run();
  assert.equal(fs.existsSync(path.join(claude, "brainstorming")), false);
  assert.ok(fs.existsSync(path.join(claude, "frontend-design/SKILL.md")));
  const invalid = spawnSync("sh", ["install-agent-skills.sh", "--profile=missing"], { cwd: root, env, encoding: "utf8" });
  assert.notEqual(invalid.status, 0);
  assert.match(invalid.stderr, /Unknown skill profile/);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log("skill-profile ok");

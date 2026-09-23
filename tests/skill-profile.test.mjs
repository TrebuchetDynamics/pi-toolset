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
  for (const name of ["ponytail", "caveman", "tdd", "autonomous-codebase-improver", "user-owned"]) {
    fs.mkdirSync(path.join(codex, name), { recursive: true });
    fs.writeFileSync(path.join(codex, name, "SKILL.md"), `Owner-modified ${name}\n`);
  }
  const run = (...args) => execFileSync("sh", ["install-agent-skills.sh", ...args], { cwd: root, env, encoding: "utf8" });
  run("--dry-run");
  assert.equal(fs.existsSync(env.AGENT_SKILLS_BACKUP_DIR), false);
  run();
  for (const name of ["ponytail", "caveman", "tdd", "autonomous-codebase-improver"]) {
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

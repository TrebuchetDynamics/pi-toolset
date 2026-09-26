import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

// Exercise the reference's actual rule examples with Git, not prose regexes.
// These are policy fixtures, NOT an automatic ignore-file editor. No real
// checkout index/config is changed; the one tracked fixture is synthetic.
const reference = fileURLToPath(new URL(
  "../skills/engineering/hermes-repo-install/references/ignore-policy.md", import.meta.url));
const prose = fs.readFileSync(reference, "utf8");
function example(name) {
  const section = prose.split(`<!-- example: ${name} -->`)[1];
  const block = section?.match(/```gitignore\n([\s\S]*?)\n```/);
  assert.ok(block, `missing tested Git rule example: ${name}`);
  return `${block[1]}\n`;
}
const rootRules = example("root-document");
const nestedRules = example("excluded-parent");
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hermes-ignore-"));
try {
  const repo = path.join(tmp, "repo");
  const home = path.join(tmp, "home");
  const xdg = path.join(home, ".config");
  const emptyTemplate = path.join(tmp, "empty-template");
  for (const dir of [repo, home, xdg, emptyTemplate]) fs.mkdirSync(dir, { recursive: true });
  const globalConfig = path.join(home, ".gitconfig");
  fs.writeFileSync(globalConfig, "");
  const env = Object.fromEntries(Object.entries(process.env).filter(([key]) => !key.startsWith("GIT_")));
  Object.assign(env, { HOME: home, XDG_CONFIG_HOME: xdg, GIT_CONFIG_NOSYSTEM: "1", GIT_CONFIG_GLOBAL: globalConfig });
  function git(args, { input, statuses = [0] } = {}) {
    const result = spawnSync("git", args, { cwd: repo, env, input, encoding: "utf8", timeout: 10_000 });
    assert.ifError(result.error);
    assert.ok(statuses.includes(result.status), `git ${args.join(" ")}: ${result.status}\n${result.stderr}`);
    return result;
  }
  git(["init", "--quiet", `--template=${emptyTemplate}`]);
  function put(name, content = "synthetic fixture; not a credential\n") {
    const file = path.join(repo, name);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
  }
  function check(name) {
    const result = git(["check-ignore", "--no-index", "--verbose", "--non-matching", "-z", "--stdin"],
      { input: `${name}\0`, statuses: [0, 1] });
    const fields = result.stdout.split("\0");
    assert.equal(fields.length, 5, "one NUL-delimited provenance record expected");
    const [source, line, pattern, file] = fields;
    assert.equal(file, name);
    return { source, line, pattern, status: result.status };
  }
  function listed(name, ignored = false) {
    return git(["ls-files", "--others", "--exclude-standard", ...(ignored ? ["--ignored"] : []), "-z", "--", name])
      .stdout.split("\0").includes(name);
  }
  function assertVisible(name) {
    const { pattern } = check(name);
    assert.ok(pattern === "" || pattern.startsWith("!"), `${name} still excluded: ${pattern}`);
    assert.equal(listed(name), true, `${name} must be eligible as an untracked file, not merely match a negation`);
  }
  function assertIgnored(name) {
    const { pattern } = check(name);
    assert.ok(pattern && !pattern.startsWith("!"), `${name} must have a positive exclusion`);
    assert.equal(listed(name), false);
    assert.equal(listed(name, true), true);
  }

  const globalIgnore = path.join(home, "global-ignore");
  fs.writeFileSync(globalIgnore, "# Owner-wide defaults\n*codemap*\n");
  git(["config", "--file", globalConfig, "core.excludesFile", globalIgnore]);
  const globalBytes = fs.readFileSync(globalConfig);
  put(".git/info/exclude", "# Local owner exclusions\n*.scratch\n");
  put("docs/.gitignore", "# Nested owner policy\n*.md\n");
  const protectedFiles = [".hermes/.env", ".hermes/setup-state.json", ".hermes/logs/gateway.log",
    ".hermes/tmp/probe.txt", ".hermes/README.md", ".env", ".hermes-development-probe-fixture.txt",
    "generated/codemap.md", "generated/cache.bin", "generated/docs/private.env",
    "generated/docs/codemap.md", "docs/codemap.md", "notes.scratch", "vendor/rawcodemap.cache"];
  for (const name of ["codemap.md", ...protectedFiles]) put(name);

  // Watch the original ordering fail: a later broad rule defeats an earlier exception.
  const staleRules = rootRules.replace(/^!\/codemap\.md\n/m, "")
    .replace("*.md\n", "!/codemap.md\n*.md\n");
  put(".gitignore", staleRules);
  assertIgnored("codemap.md");
  assert.equal(check("codemap.md").pattern, "*.md");
  // Apply only the reviewed fixture state, not a production whole-file rewrite.
  put(".gitignore", rootRules);
  assertVisible("codemap.md");
  const visibleMatch = check("codemap.md");
  assert.equal(visibleMatch.status, 0, "verbose exit 0 may describe a negation, not an excluded file");
  assert.equal(visibleMatch.pattern, "!/codemap.md");
  assert.equal(visibleMatch.source, ".gitignore");
  put("plain-source.js");
  assertVisible("plain-source.js");
  assert.deepEqual(check("plain-source.js"), { source: "", line: "", pattern: "", status: 1 });
  assert.equal(check("absent-source.js").pattern, "");
  assert.equal(listed("absent-source.js"), false, "an unmatched policy does not prove file existence");
  for (const file of protectedFiles) assertIgnored(file);
  assert.equal(check("docs/codemap.md").source, "docs/.gitignore");
  assert.equal(check("notes.scratch").source, ".git/info/exclude");
  assert.equal(check("vendor/rawcodemap.cache").source, globalIgnore);

  // A deep exception cannot traverse an excluded parent; the tested narrow
  // parent pattern exposes just the specifically approved generated document.
  put(".gitignore", `${rootRules}!/generated/docs/codemap.md\n`);
  assertIgnored("generated/docs/codemap.md");
  assert.equal(check("generated/docs/codemap.md").pattern, "/generated/");
  const nestedPolicy = rootRules.replace("/generated/\n", nestedRules);
  put(".gitignore", nestedPolicy);
  assertVisible("generated/docs/codemap.md");
  for (const file of protectedFiles.filter(file => file !== "generated/docs/codemap.md")) assertIgnored(file);

  // Policy verification is a no-op on repeat: no duplicate rules or index changes.
  // Agent fixtures cover edit decisions; no automated reconciler is claimed here.
  const policyBefore = fs.readFileSync(path.join(repo, ".gitignore"));
  for (let run = 0; run < 2; run++) {
    assertVisible("codemap.md");
    assertVisible("generated/docs/codemap.md");
    for (const file of protectedFiles.filter(file => file !== "generated/docs/codemap.md")) assertIgnored(file);
    git(["status", "--short"]);
    git(["diff", "--check"]);
  }
  assert.deepEqual(fs.readFileSync(path.join(repo, ".gitignore")), policyBefore);
  assert.equal(git(["ls-files", "-z"]).stdout, "", "verification must not stage anything");

  // Ignore rules do not remove tracked secrets. Add ONLY a dummy file in this
  // throwaway Git index; verify the documented diagnostics leave it tracked.
  git(["add", "--force", "--", ".hermes/.env"]);
  const indexBefore = fs.readFileSync(path.join(repo, ".git/index"));
  assert.equal(git(["ls-files", "--error-unmatch", "--", ".hermes/.env"]).stdout.trim(), ".hermes/.env");
  assert.equal(git(["check-ignore", "-v", "--", ".hermes/.env"], { statuses: [1] }).stdout, "");
  assert.equal(check(".hermes/.env").pattern, "/.hermes/");
  assert.equal(listed(".hermes/.env"), false, "not untracked-visible does not imply secret absent from index");
  assert.equal(listed(".hermes/.env", true), false);
  assert.deepEqual(fs.readFileSync(path.join(repo, ".git/index")), indexBefore);

  // Configured global excludes are not the only possibility: test Git's XDG
  // default as well, without inspecting or changing the operator's global files.
  fs.mkdirSync(path.join(xdg, "git"), { recursive: true });
  const defaultIgnore = path.join(xdg, "git", "ignore");
  fs.writeFileSync(defaultIgnore, "*codemap*\n");
  fs.writeFileSync(globalConfig, "");
  assert.equal(check("vendor/rawcodemap.cache").source, defaultIgnore);
  assertVisible("codemap.md");
  fs.writeFileSync(globalConfig, globalBytes);
  assert.equal(fs.readFileSync(globalIgnore, "utf8"), "# Owner-wide defaults\n*codemap*\n");
  assert.equal(fs.readFileSync(path.join(repo, ".git/info/exclude"), "utf8"), "# Local owner exclusions\n*.scratch\n");
  assert.equal(fs.readFileSync(path.join(repo, "docs/.gitignore"), "utf8"), "# Nested owner policy\n*.md\n");
  assert.ok(fs.readFileSync(path.join(repo, ".gitignore"), "utf8").includes("# Private Hermes runtime"));

  // A .git pointer file requires Git path resolution, not repo/.git/info/exclude.
  const externalGitDir = path.join(tmp, "git-metadata");
  git(["init", "--quiet", "--separate-git-dir", externalGitDir]);
  assert.ok(fs.statSync(path.join(repo, ".git")).isFile());
  const resolvedExclude = git(["rev-parse", "--git-path", "info/exclude"]).stdout.trim();
  assert.equal(fs.realpathSync(path.resolve(repo, resolvedExclude)), path.join(externalGitDir, "info/exclude"));
  assert.equal(check("notes.scratch").pattern, "*.scratch");
  assertVisible("codemap.md");
  assert.equal(git(["ls-files", "--error-unmatch", "--", ".hermes/.env"]).stdout.trim(), ".hermes/.env");
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log("hermes-ignore-policy ok");

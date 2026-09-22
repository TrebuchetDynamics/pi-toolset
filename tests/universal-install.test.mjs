import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const pkg = JSON.parse(fs.readFileSync(path.join(root, "package.json"), "utf8"));
assert.ok(pkg.files.includes("install.sh"), "published package must include the universal installer");
assert.match(pkg.scripts["test:package"], /universal-install\.test\.mjs/);
const installer = fs.readFileSync(path.join(root, "install.sh"), "utf8");
assert.match(installer, /pacman -S --needed --noconfirm tmux/);
assert.doesNotMatch(installer, /pacman -Sy\b/, "Arch install must not perform a partial package database refresh");
assert.match(installer, /install-agent-skills\.sh/);
assert.doesNotMatch(installer, /install-autofolderrefactor\.sh/, "autofolderrefactor must remain opt-in");
assert.match(installer, /install-omniroute-pi\.sh/);
assert.match(installer, /RTK_INSTALL_URL/);
assert.match(installer, /PI_TOOLSET_ARCHIVE_URL/);
assert.match(installer, /apt-get install -y ca-certificates curl git tar/);
const readme = fs.readFileSync(path.join(root, "README.md"), "utf8");
assert.match(readme, /sh install\.sh/);
assert.match(readme, /new Ubuntu PC/);
assert.match(readme, /raw\.githubusercontent\.com\/TrebuchetDynamics\/pi-toolset\/main\/install\.sh/);
assert.match(readme, /Pi, this package, tmux with `tx`, Search Hub, Understand-Anything, RTK, OmniRoute, and global Codex\/Claude skill copies/);

function run(args, options = {}) {
  const result = spawnSync("sh", ["install.sh", ...args], {
    cwd: root,
    encoding: "utf8",
    ...options,
    env: { ...process.env, ...(options.env ?? {}) },
  });
  assert.equal(result.status, 0, `install.sh failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  return result.stdout;
}

const help = run(["--help"]);
assert.match(help, /Pi coding agent/);
assert.match(help, /tmux and tx/);
assert.match(help, /Search Hub/);
assert.match(help, /Understand-Anything/);
assert.match(help, /RTK/);
assert.match(help, /OmniRoute/);
assert.match(help, /Pi, Codex and Claude/);
assert.match(help, /Ponytail/);
assert.match(help, /catalog/);
assert.doesNotMatch(help, /autofolderrefactor/);

const catalogSources = [
  "npm:pi-mcp-adapter@2.33.0",
  "npm:@juicesharp/rpiv-ask-user-question@2.10.0",
  "npm:@juicesharp/rpiv-todo@2.10.0",
  "npm:@narumitw/pi-btw@0.58.1",
  "npm:@narumitw/pi-usage@0.60.8",
];

const dryHome = fs.mkdtempSync(path.join(os.tmpdir(), "pi-goal-install-dry-"));
try {
  const output = run(["--dry-run"], { env: { HOME: dryHome } });
  assert.match(output, /would install: Pi coding agent/);
  assert.match(output, /would install: pi-toolset/);
  assert.match(output, /would install: tmux and tx/);
  assert.match(output, /would install: Understand-Anything/);
  assert.match(output, /would install: RTK/);
  assert.match(output, /would install: OmniRoute/);
  assert.match(output, /would install: global Codex and Claude skill copies/);
  assert.match(output, /without duplicate package skills/);
  assert.doesNotMatch(output, /autofolderrefactor/);
  assert.deepEqual(fs.readdirSync(dryHome), []);
  for (const source of catalogSources) assert.ok(output.includes(`would install: ${source}`));
  const withoutCatalog = run(["--dry-run"], { env: { HOME: dryHome, PI_TOOLSET_SKIP: "catalog" } });
  for (const source of catalogSources) assert.ok(!withoutCatalog.includes(source));

  const skippedOutput = run(["--dry-run"], {
    env: { HOME: dryHome, PI_TOOLSET_SKIP_OMNIROUTE: "1" },
  });
  assert.match(skippedOutput, /would skip: OmniRoute/);
  assert.doesNotMatch(skippedOutput, /would install: OmniRoute/);
} finally {
  fs.rmSync(dryHome, { recursive: true, force: true });
}

const bootstrap = fs.mkdtempSync(path.join(os.tmpdir(), "pi-toolset-bootstrap-test-"));
try {
  const remoteScript = path.join(bootstrap, "install.sh");
  const archiveTree = path.join(bootstrap, "archive", "pi-toolset-main");
  const archive = path.join(bootstrap, "pi-toolset.tar.gz");
  const fakeBin = path.join(bootstrap, "bin");
  const home = path.join(bootstrap, "home");
  fs.copyFileSync(path.join(root, "install.sh"), remoteScript);
  fs.mkdirSync(path.join(archiveTree, "tmux"), { recursive: true });
  fs.mkdirSync(fakeBin);
  fs.mkdirSync(home);
  fs.copyFileSync(path.join(root, "install.sh"), path.join(archiveTree, "install.sh"));
  fs.writeFileSync(path.join(archiveTree, "install-agent-skills.sh"), "#!/bin/sh\n");
  fs.writeFileSync(path.join(archiveTree, "install-omniroute-pi.sh"), "#!/bin/sh\n");
  fs.writeFileSync(path.join(archiveTree, "tmux", "install.sh"), "#!/bin/sh\n");
  const packed = spawnSync("tar", ["-czf", archive, "-C", path.dirname(archiveTree), path.basename(archiveTree)]);
  assert.equal(packed.status, 0, packed.stderr?.toString());
  fs.writeFileSync(
    path.join(fakeBin, "curl"),
    "#!/bin/sh\nwhile [ \"$#\" -gt 0 ]; do\n  if [ \"$1\" = -o ]; then shift; cp \"$BOOTSTRAP_ARCHIVE\" \"$1\"; exit; fi\n  shift\ndone\nexit 2\n",
    { mode: 0o755 },
  );
  const result = spawnSync("sh", [remoteScript], {
    encoding: "utf8",
    env: {
      ...process.env,
      HOME: home,
      PATH: `${fakeBin}:/usr/bin:/bin`,
      BOOTSTRAP_ARCHIVE: archive,
      PI_TOOLSET_SKIP: "pi,package,tmux,understand,rtk,skills,omniroute,catalog",
    },
  });
  assert.equal(result.status, 0, `bootstrap failed\nstdout:\n${result.stdout}\nstderr:\n${result.stderr}`);
  assert.match(result.stdout, /downloading: pi-toolset/);
  assert.match(result.stdout, /installation complete/);
} finally {
  fs.rmSync(bootstrap, { recursive: true, force: true });
}

const partialHome = fs.mkdtempSync(path.join(os.tmpdir(), "pi-goal-install-partial-"));
try {
  const partialBin = path.join(partialHome, "bin");
  const partialMarker = path.join(partialHome, "partial-ran");
  fs.mkdirSync(partialBin);
  fs.writeFileSync(
    path.join(partialBin, "curl"),
    "#!/bin/sh\nprintf '%s\\n' '#!/bin/sh' 'touch \"$MARKER\"'\nexit 22\n",
    { mode: 0o755 },
  );
  const result = spawnSync("sh", ["install.sh"], {
    cwd: root,
    encoding: "utf8",
    env: {
      ...process.env,
      HOME: partialHome,
      PATH: `${partialBin}:/usr/bin:/bin`,
      MARKER: partialMarker,
      PI_TOOLSET_SKIP_OMNIROUTE: "1",
    },
  });
  assert.notEqual(result.status, 0);
  assert.equal(fs.existsSync(partialMarker), false, "partial remote installer downloads must never execute");
} finally {
  fs.rmSync(partialHome, { recursive: true, force: true });
}

const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "pi-goal-install-"));
try {
  const home = path.join(tmp, "home");
  const bin = path.join(tmp, "bin");
  const understand = path.join(tmp, "understand");
  const agentDir = path.join(tmp, "agent");
  const log = path.join(tmp, "pi.log");
  fs.mkdirSync(path.join(understand, "understand-anything-plugin", "skills", "understand"), { recursive: true });
  fs.writeFileSync(path.join(understand, "understand-anything-plugin", "skills", "understand", "SKILL.md"), "# Understand\n");
  fs.mkdirSync(home, { recursive: true });
  fs.mkdirSync(agentDir, { recursive: true });
  fs.writeFileSync(
    path.join(agentDir, "settings.json"),
    `${JSON.stringify({ theme: "keep", skills: ["/keep/skills"], packages: ["git:github.com/TrebuchetDynamics/pi-toolset", { source: "npm:keep", skills: ["keep"] }] }, null, 2)}\n`,
  );
  const wrongUnderstandPlugin = path.join(tmp, "wrong-understand-plugin");
  fs.mkdirSync(wrongUnderstandPlugin);
  fs.symlinkSync(wrongUnderstandPlugin, path.join(home, ".understand-anything-plugin"));
  fs.mkdirSync(bin, { recursive: true });
  fs.writeFileSync(path.join(bin, "pi"), `#!/bin/sh\ncase "$1" in\n  list) printf '%s\\n' "$PI_LIST_OUTPUT" ;;\n  install) printf '%s\\n' "$*" >> '${log}' ;;\nesac\n`);
  fs.writeFileSync(path.join(bin, "tmux"), "#!/bin/sh\nexit 0\n");
  fs.writeFileSync(path.join(bin, "rtk"), "#!/bin/sh\nprintf 'rtk test\\n'\n");
  fs.writeFileSync(path.join(bin, "curl"), `#!/bin/sh
while [ "$#" -gt 0 ]; do
  if [ "$1" = -o ]; then
    shift
    printf '%s\\n' '#!/bin/sh' 'printf "%s\\n" "\$RTK_VERSION" >> "\$RTK_TEST_LOG"' > "$1"
    exit 0
  fi
  shift
done
exit 2
`);
  for (const name of ["pi", "tmux", "rtk", "curl"]) fs.chmodSync(path.join(bin, name), 0o755);

  const output = run([], {
    env: {
      HOME: home,
      PATH: `${bin}:${path.dirname(process.execPath)}:${process.env.PATH}`,
      RTK_TEST_LOG: path.join(tmp, "rtk-updates"),
      RTK_VERSION: "v-test",
      UA_DIR: understand,
      TMUX_CONF_TARGET: path.join(tmp, "tmux.conf"),
      TMUX_HELPER_DIR: path.join(tmp, "tmux-helpers"),
      TX_BIN_DIR: path.join(tmp, "tx-bin"),
      TX_INSTALL_BACKUP: "0",
      TX_INSTALL_COMPLETIONS: "0",
      CODEX_SKILLS_DIR: path.join(tmp, "codex-skills"),
      CLAUDE_SKILLS_DIR: path.join(tmp, "claude-skills"),
      AGENT_SKILLS_BACKUP: "0",
      PI_CODING_AGENT_DIR: agentDir,
      PI_TOOLSET_SKIP_OMNIROUTE: "1",
      PI_LIST_OUTPUT: "git:github.com/TrebuchetDynamics/pi-toolset-extra",
    },
  });

  assert.match(fs.readFileSync(log, "utf8"), /install git:github\.com\/TrebuchetDynamics\/pi-toolset/);
  for (const source of catalogSources) assert.ok(fs.readFileSync(log, "utf8").includes(`install ${source}\n`));
  assert.ok(fs.existsSync(path.join(tmp, "tx-bin", "tx")));
  assert.equal(fs.readlinkSync(path.join(home, ".understand-anything-plugin")), path.join(understand, "understand-anything-plugin"));
  assert.match(output, /installed: Understand-Anything/);
  assert.match(output, /installed: RTK/);
  assert.equal(fs.readFileSync(path.join(tmp, "rtk-updates"), "utf8"), "v-test\n", "existing RTK must still run the installer with the requested version");
  const bundledSkills = fs.readdirSync(path.join(root, "skills"), { recursive: true })
    .filter((file) => path.basename(file) === "SKILL.md")
    .map((file) => fs.readFileSync(path.join(root, "skills", file), "utf8").match(/^name:\s*(.+)$/m)[1]);
  for (const name of bundledSkills) {
    for (const target of ["codex-skills", "claude-skills"]) {
      assert.ok(fs.existsSync(path.join(tmp, target, name, "SKILL.md")), `${target} missing ${name}`);
    }
  }
  assert.ok(bundledSkills.includes("ponytail"));
  assert.match(output, /Codex skills dir:/);
  assert.match(output, /Claude skills dir:/);
  const settings = JSON.parse(fs.readFileSync(path.join(agentDir, "settings.json"), "utf8"));
  assert.equal(settings.theme, "keep");
  assert.deepEqual(settings.skills, ["/keep/skills", path.join(tmp, "codex-skills")]);
  assert.deepEqual(settings.packages[0], {
    source: "git:github.com/TrebuchetDynamics/pi-toolset",
    skills: [],
  });
  assert.deepEqual(settings.packages[1], { source: "npm:keep", skills: ["keep"] });
  assert.equal(fs.statSync(path.join(agentDir, "settings.json")).mode & 0o777, 0o600);
  assert.equal(
    fs.readdirSync(agentDir).filter((name) => name.startsWith("settings.json.bak.")).length,
    1,
  );
  assert.match(output, /disabled duplicate package skills/);
  assert.match(output, /skipped: OmniRoute/);
  assert.match(output, /installation complete/);
  const skillsEnv = {
    HOME: home,
    PATH: `${bin}:${path.dirname(process.execPath)}:${process.env.PATH}`,
    PI_CODING_AGENT_DIR: agentDir,
    CODEX_SKILLS_DIR: path.join(tmp, "codex-skills"),
    CLAUDE_SKILLS_DIR: path.join(tmp, "claude-skills"),
    PI_TOOLSET_SKIP: "pi,package,tmux,understand,rtk,omniroute,catalog",
  };
  run([], { env: skillsEnv });
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(agentDir, "settings.json"), "utf8")), settings);
  assert.equal(fs.readdirSync(agentDir).filter((name) => name.startsWith("settings.json.bak.")).length, 1);
  const freshAgent = path.join(tmp, "fresh-agent");
  run([], { env: { ...skillsEnv, PI_CODING_AGENT_DIR: freshAgent } });
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(freshAgent, "settings.json"), "utf8")).skills, [path.join(tmp, "codex-skills")]);
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}

// Exercise the catalog independently without network access or real Pi settings.
const catalogHome = fs.mkdtempSync(path.join(os.tmpdir(), "pi-toolset-catalog-"));
try {
  const bin = path.join(catalogHome, "bin");
  const log = path.join(catalogHome, "calls");
  fs.mkdirSync(bin);
  fs.writeFileSync(path.join(bin, "pi"), `#!/bin/sh
printf '%s\\n' "$*" >> "$CATALOG_TEST_LOG"
if [ "$2" = "$CATALOG_FAIL_SOURCE" ]; then exit 17; fi
`, { mode: 0o755 });
  const env = {
    HOME: catalogHome,
    PATH: `${bin}:${path.dirname(process.execPath)}:${process.env.PATH}`,
    CATALOG_TEST_LOG: log,
    CATALOG_FAIL_SOURCE: "",
    PI_TOOLSET_SKIP: "pi,package,tmux,understand,rtk,skills,omniroute",
  };
  const expected = catalogSources.map((source) => `install ${source}`);
  run([], { env });
  run([], { env });
  assert.deepEqual(fs.readFileSync(log, "utf8").trim().split("\n"), [...expected, ...expected],
    "repeat installs must reapply exactly the pinned catalog sources");

  fs.writeFileSync(log, "");
  run([], { env: { ...env, PI_TOOLSET_SKIP: `${env.PI_TOOLSET_SKIP},catalog` } });
  assert.equal(fs.readFileSync(log, "utf8"), "", "skipping catalog must not invoke Pi");

  const failed = spawnSync("sh", ["install.sh"], {
    cwd: root, encoding: "utf8",
    env: { ...process.env, ...env, CATALOG_FAIL_SOURCE: catalogSources[1] },
  });
  assert.equal(failed.status, 17);
  assert.deepEqual(fs.readFileSync(log, "utf8").trim().split("\n"), expected.slice(0, 2));
  assert.doesNotMatch(failed.stdout, /installation complete/);
} finally {
  fs.rmSync(catalogHome, { recursive: true, force: true });
}

console.log("universal-install ok");

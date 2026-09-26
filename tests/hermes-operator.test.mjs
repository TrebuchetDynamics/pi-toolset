import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const scripts = path.join(root, "skills/engineering/hermes-repo-install/scripts");
const { waitForReadiness } = await import(path.join(scripts, "wait-ready.mjs"));
const { installShortcuts } = await import(path.join(scripts, "install-shortcuts.mjs"));
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "hermes-operator-"));
try {
  // Break caught: a pending/unsupported/failed probe or mere container startup
  // is reported ready; raw probe output leaks; a hanging probe waits forever.
  const probe = path.join(tmp, "probe with space");
  const count = path.join(tmp, "probe-count");
  fs.writeFileSync(probe, `#!${process.execPath}\nimport fs from 'node:fs';\nconst file = ${JSON.stringify(count)};\nconst count = fs.existsSync(file) ? Number(fs.readFileSync(file)) : 0;\nfs.writeFileSync(file, String(count + 1));\nconsole.log('PRIVATE_TOKEN'); console.error('PRIVATE_TOKEN');\nprocess.exit(count === 0 ? 10 : 0);\n`, { mode: 0o700 });
  assert.deepEqual(await waitForReadiness({ probe, timeoutMs: 2000, intervalMs: 1 }), { status: "ready" });
  assert.equal(Number(fs.readFileSync(count)), 2, "wait for fresh success after pending");
  const privateProbe = code => fs.writeFileSync(probe,
    `#!${process.execPath}\nconsole.log('PRIVATE_TOKEN'); console.error('PRIVATE_TOKEN'); process.exit(${code});\n`, { mode: 0o700 });
  privateProbe(10);
  assert.deepEqual(await waitForReadiness({ probe, timeoutMs: 80, intervalMs: 1 }), { status: "timeout" });
  privateProbe(20);
  assert.deepEqual(await waitForReadiness({ probe, timeoutMs: 1000, intervalMs: 1 }), { status: "blocked" });
  privateProbe(30);
  assert.deepEqual(await waitForReadiness({ probe, timeoutMs: 1000, intervalMs: 1 }), { status: "unavailable" });
  privateProbe(99);
  assert.deepEqual(await waitForReadiness({ probe, timeoutMs: 1000, intervalMs: 1 }), { status: "unavailable" });
  fs.writeFileSync(probe, `#!${process.execPath}\nsetTimeout(() => process.exit(0), 5000);\n`, { mode: 0o700 });
  const start = Date.now();
  assert.deepEqual(await waitForReadiness({ probe, timeoutMs: 1000, intervalMs: 1, probeTimeoutMs: 50 }), { status: "unavailable" });
  assert.ok(Date.now() - start < 2000, "probe deadline is bounded");
  fs.writeFileSync(probe, `#!${process.execPath}\nprocess.stdout.write('PRIVATE_TOKEN'.repeat(10000));\n`, { mode: 0o700 });
  assert.deepEqual(await waitForReadiness({ probe, timeoutMs: 1000, intervalMs: 1 }), { status: "unavailable" });
  assert.deepEqual(await waitForReadiness({ probe: path.join(tmp, "missing") }), { status: "unavailable" });
  const probeLink = path.join(tmp, "probe-link");
  fs.symlinkSync(probe, probeLink);
  assert.deepEqual(await waitForReadiness({ probe: probeLink }), { status: "unavailable" });
  privateProbe(0);
  const cliReady = spawnSync(process.execPath, [path.join(scripts, "wait-ready.mjs"), "--probe", probe], { encoding: "utf8" });
  assert.equal(cliReady.status, 0);
  assert.match(cliReady.stdout, /Ready: gateway and configured channels verified/);
  assert.equal((cliReady.stdout + cliReady.stderr).includes("PRIVATE_TOKEN"), false);
  privateProbe(20);
  const cliBlocked = spawnSync(process.execPath, [path.join(scripts, "wait-ready.mjs"), "--probe", probe], { encoding: "utf8" });
  assert.notEqual(cliBlocked.status, 0);
  assert.equal((cliBlocked.stdout + cliBlocked.stderr).includes("PRIVATE_TOKEN"), false);

  // Break caught: shell-only aliases don't work in scripts/new shells, existing
  // commands get overwritten, duplicate installs rewrite links, paths lose argv.
  const repo = path.join(tmp, "owner's space", "api");
  const repoBin = path.join(repo, ".hermes", "bin");
  const hostBin = path.join(tmp, "host-bin");
  fs.mkdirSync(repoBin, { recursive: true, mode: 0o700 });
  for (const name of ["hermes", "hermes-status", "hermes-logs", "hermes-apply"]) {
    fs.writeFileSync(path.join(repoBin, name), `#!${process.execPath}\nconsole.log(JSON.stringify(process.argv.slice(2)));\n`, { mode: 0o700 });
  }
  const result = installShortcuts({ repo, binDir: hostBin });
  assert.deepEqual(result.names, ["hermes-api", "hermes-api-status", "hermes-api-logs", "hermes-api-apply"]);
  assert.equal(result.created, 4);
  const firstInodes = result.names.map(name => fs.lstatSync(path.join(hostBin, name)).ino);
  for (const name of result.names) {
    assert.equal(fs.readlinkSync(path.join(hostBin, name)), path.join(repoBin, name.replace("hermes-api", "hermes")));
    const call = spawnSync(path.join(hostBin, name), ["space arg", "$(not-shell)", "single'quote"], { encoding: "utf8" });
    assert.equal(call.status, 0, call.stderr);
    assert.deepEqual(JSON.parse(call.stdout), ["space arg", "$(not-shell)", "single'quote"]);
  }
  const fromShell = spawnSync("sh", ["-c", 'exec hermes-api "$@"', "sh", "space arg", "literal$arg"], {
    encoding: "utf8", env: { ...process.env, PATH: `${hostBin}${path.delimiter}${process.env.PATH}` },
  });
  assert.equal(fromShell.status, 0, fromShell.stderr);
  assert.deepEqual(JSON.parse(fromShell.stdout), ["space arg", "literal$arg"]);
  const cliInstall = spawnSync(process.execPath, [path.join(scripts, "install-shortcuts.mjs"), "--repo", repo, "--bin-dir", hostBin], { encoding: "utf8" });
  assert.equal(cliInstall.status, 0, cliInstall.stderr);
  assert.equal(JSON.parse(cliInstall.stdout.split("\n")[0]).created, 0);
  assert.equal(installShortcuts({ repo, binDir: hostBin }).created, 0);
  assert.deepEqual(result.names.map(name => fs.lstatSync(path.join(hostBin, name)).ino), firstInodes);
  const conflictBin = path.join(tmp, "conflicts");
  fs.mkdirSync(conflictBin, { mode: 0o700 });
  fs.writeFileSync(path.join(conflictBin, "hermes-api-logs"), "user-owned");
  assert.throws(() => installShortcuts({ repo, binDir: conflictBin }), /conflict/i);
  assert.deepEqual(fs.readdirSync(conflictBin), ["hermes-api-logs"], "preflight all four names before creating any");
  assert.equal(fs.readFileSync(path.join(conflictBin, "hermes-api-logs"), "utf8"), "user-owned");
  // A private .hermes directory is insufficient if its repository can be
  // renamed/replaced through a writable ancestor by another user.
  fs.chmodSync(repo, 0o777);
  const sharedRepoBin = path.join(tmp, "shared-repo-bin");
  assert.throws(() => installShortcuts({ repo, binDir: sharedRepoBin }), /ancestor|writable|shared/i);
  assert.equal(fs.existsSync(sharedRepoBin), false);
  fs.chmodSync(repo, 0o700);
  const sharedAncestor = path.join(tmp, "shared-ancestor");
  const privateParent = path.join(sharedAncestor, "private-parent");
  fs.mkdirSync(privateParent, { recursive: true, mode: 0o700 });
  fs.chmodSync(sharedAncestor, 0o777);
  assert.throws(() => installShortcuts({ repo, binDir: path.join(privateParent, "bin") }), /ancestor|writable|shared/i);
  assert.equal(fs.existsSync(path.join(privateParent, "bin")), false);
  fs.chmodSync(sharedAncestor, 0o1777);
  assert.equal(installShortcuts({ repo, binDir: path.join(privateParent, "bin") }).created, 4,
    "trusted-owner sticky ancestor protects the private child from replacement");

  const linkedBin = path.join(tmp, "bin-link");
  fs.symlinkSync(hostBin, linkedBin);
  assert.throws(() => installShortcuts({ repo, binDir: linkedBin }), /symlink/i);
  const foreignLauncher = path.join(tmp, "foreign-launcher");
  fs.writeFileSync(foreignLauncher, "#!/bin/sh\nexit 0\n", { mode: 0o700 });
  fs.unlinkSync(path.join(repoBin, "hermes-logs"));
  fs.symlinkSync(foreignLauncher, path.join(repoBin, "hermes-logs"));
  assert.throws(() => installShortcuts({ repo, binDir: path.join(tmp, "another-bin") }), /launcher/i);
  assert.equal(fs.existsSync(path.join(tmp, "another-bin")), false);

  // Break caught: first-install command persistence depends on a not-yet-safe
  // apply launcher, or later promotion replaces the already installed commands.
  const coreRepo = path.join(tmp, "core only", "worker");
  const coreRepoBin = path.join(coreRepo, ".hermes", "bin");
  const coreHostBin = path.join(tmp, "core-host-bin");
  fs.mkdirSync(coreRepoBin, { recursive: true, mode: 0o700 });
  for (const name of ["hermes", "hermes-status", "hermes-logs"]) {
    fs.writeFileSync(path.join(coreRepoBin, name), `#!${process.execPath}\nconsole.log(JSON.stringify(process.argv.slice(2)));\n`, { mode: 0o700 });
  }
  assert.throws(() => installShortcuts({ repo: coreRepo, binDir: coreHostBin }), /launcher/i,
    "default full installation must still require apply");
  assert.equal(fs.existsSync(coreHostBin), false, "failed full preflight must not install core links implicitly");
  const core = installShortcuts({ repo: coreRepo, binDir: coreHostBin, coreOnly: true });
  assert.deepEqual(core.names, ["hermes-worker", "hermes-worker-status", "hermes-worker-logs"]);
  assert.equal(core.created, 3);
  assert.deepEqual(fs.readdirSync(coreHostBin).sort(), [...core.names].sort());
  const coreInodes = core.names.map(name => fs.lstatSync(path.join(coreHostBin, name)).ino);
  const coreArgs = ["space arg", "literal$arg", "single'quote"];
  const coreCall = spawnSync(path.join(coreHostBin, "hermes-worker"), coreArgs, { encoding: "utf8" });
  assert.equal(coreCall.status, 0, coreCall.stderr);
  assert.deepEqual(JSON.parse(coreCall.stdout), coreArgs);
  const coreCli = spawnSync(process.execPath, [path.join(scripts, "install-shortcuts.mjs"),
    "--core-only", "--repo", coreRepo, "--bin-dir", coreHostBin], { encoding: "utf8" });
  assert.equal(coreCli.status, 0, coreCli.stderr);
  assert.deepEqual(JSON.parse(coreCli.stdout.split("\n")[0]), { binDir: coreHostBin, names: core.names, created: 0 });

  // Unselected apply entries are neither trusted nor removed in core-only mode.
  const coreApply = path.join(coreRepoBin, "hermes-apply");
  const hostApply = path.join(coreHostBin, "hermes-worker-apply");
  fs.symlinkSync(path.join(tmp, "missing-source"), coreApply);
  fs.symlinkSync(path.join(tmp, "unrelated-command"), hostApply);
  assert.equal(installShortcuts({ repo: coreRepo, binDir: coreHostBin, coreOnly: true }).created, 0);
  assert.equal(fs.readlinkSync(coreApply), path.join(tmp, "missing-source"));
  assert.equal(fs.readlinkSync(hostApply), path.join(tmp, "unrelated-command"));
  assert.throws(() => installShortcuts({ repo: coreRepo, binDir: coreHostBin }), /launcher/i);
  fs.unlinkSync(coreApply);
  fs.writeFileSync(coreApply, "#!/bin/sh\nexit 0\n", { mode: 0o700 });
  assert.throws(() => installShortcuts({ repo: coreRepo, binDir: coreHostBin }), /conflict/i);
  assert.equal(fs.readlinkSync(hostApply), path.join(tmp, "unrelated-command"));
  fs.unlinkSync(hostApply); // Remove only the conflict created by this fixture.
  const promoted = installShortcuts({ repo: coreRepo, binDir: coreHostBin });
  assert.equal(promoted.created, 1);
  assert.deepEqual(promoted.names, ["hermes-worker", "hermes-worker-status", "hermes-worker-logs", "hermes-worker-apply"]);
  assert.equal(fs.readlinkSync(hostApply), coreApply);
  assert.equal(installShortcuts({ repo: coreRepo, binDir: coreHostBin }).created, 0);
  assert.equal(installShortcuts({ repo: coreRepo, binDir: coreHostBin, coreOnly: true }).created, 0);
  assert.equal(fs.readlinkSync(hostApply), coreApply, "core-only is not an uninstall mode");
  assert.deepEqual(core.names.map(name => fs.lstatSync(path.join(coreHostBin, name)).ino), coreInodes);

  // Core-only must retain the full mode's replacement-boundary checks and
  // preflight the entire selected set before writing any link.
  const coreConflict = path.join(tmp, "core-conflict");
  fs.mkdirSync(coreConflict, { mode: 0o700 });
  fs.writeFileSync(path.join(coreConflict, "hermes-worker-logs"), "preserve");
  assert.throws(() => installShortcuts({ repo: coreRepo, binDir: coreConflict, coreOnly: true }), /conflict/i);
  assert.deepEqual(fs.readdirSync(coreConflict), ["hermes-worker-logs"]);
  assert.equal(fs.readFileSync(path.join(coreConflict, "hermes-worker-logs"), "utf8"), "preserve");
  const unsafeCoreBin = path.join(tmp, "unsafe-core-destination");
  fs.chmodSync(path.dirname(coreRepo), 0o775);
  assert.throws(() => installShortcuts({ repo: coreRepo, binDir: unsafeCoreBin, coreOnly: true }), /ancestor|writable/i);
  assert.equal(fs.existsSync(unsafeCoreBin), false);
  fs.chmodSync(path.dirname(coreRepo), 0o700);
  fs.chmodSync(sharedAncestor, 0o775);
  assert.throws(() => installShortcuts({ repo: coreRepo, binDir: path.join(privateParent, "core-bin"), coreOnly: true }), /ancestor|writable/i);
  assert.equal(fs.existsSync(path.join(privateParent, "core-bin")), false);
  fs.chmodSync(sharedAncestor, 0o1777);
  const coreLogs = path.join(coreRepoBin, "hermes-logs");
  fs.chmodSync(coreLogs, 0o770);
  assert.throws(() => installShortcuts({ repo: coreRepo, binDir: unsafeCoreBin, coreOnly: true }), /launcher/i);
  fs.unlinkSync(coreLogs);
  assert.throws(() => installShortcuts({ repo: coreRepo, binDir: unsafeCoreBin, coreOnly: true }), /launcher/i);
  fs.symlinkSync(foreignLauncher, coreLogs);
  assert.throws(() => installShortcuts({ repo: coreRepo, binDir: unsafeCoreBin, coreOnly: true }), /launcher/i);
  assert.equal(fs.existsSync(unsafeCoreBin), false);

  fs.unlinkSync(coreLogs);
  fs.writeFileSync(coreLogs, "#!/bin/sh\nexit 0\n", { mode: 0o700 });

  // Selection must be explicit and typed; malformed CLI flags fail before writes.
  for (const coreOnly of ["true", "false", 1, null]) {
    assert.throws(() => installShortcuts({ repo: coreRepo, binDir: unsafeCoreBin, coreOnly }), /coreOnly/i);
  }
  for (const extra of [["--core-only", "--core-only"], ["--core-only", "false"], ["--core-only=true"], ["--core-only", "--unknown"]]) {
    const invalid = spawnSync(process.execPath, [path.join(scripts, "install-shortcuts.mjs"),
      "--repo", coreRepo, "--bin-dir", unsafeCoreBin, ...extra], { encoding: "utf8" });
    assert.notEqual(invalid.status, 0);
    assert.equal(invalid.stdout, "");
    assert.equal(fs.existsSync(unsafeCoreBin), false);
  }
} finally {
  fs.rmSync(tmp, { recursive: true, force: true });
}
console.log("hermes-operator ok");

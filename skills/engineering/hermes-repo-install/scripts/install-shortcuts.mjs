#!/usr/bin/env node
// Opt-in host installation only. No Docker, rc-file edits, PATH edits or secrets.
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { pathToFileURL } from "node:url";

const allSuffixes = ["", "-status", "-logs", "-apply"];
const statOrMissing = file => {
  try { return fs.lstatSync(file); } catch (error) {
    if (error.code === "ENOENT") return undefined;
    throw error;
  }
};

function plainAncestors(directory) {
  for (let entry = path.resolve(directory); ; entry = path.dirname(entry)) {
    const stat = statOrMissing(entry);
    if (stat) {
      if (!stat.isDirectory() || stat.isSymbolicLink() || fs.realpathSync(entry) !== entry) {
        throw new Error("Directory is not plain; resolve symlink/shared-path ownership first");
      }
      // A private leaf can still be replaced through a writable ancestor.
      // Root/current-user owned sticky directories (e.g. /tmp) protect the
      // owned next component; every existing component is checked in turn.
      const trustedOwner = stat.uid === 0 || stat.uid === process.getuid();
      if (!trustedOwner || ((stat.mode & 0o022) && !(stat.mode & 0o1000))) {
        throw new Error("Unsafe shared/writable ancestor directory");
      }
    }
    if (path.dirname(entry) === entry) break;
  }
}

function owned(stat) {
  return (!process.getuid || stat.uid === process.getuid()) && !(stat.mode & 0o022);
}

export function installShortcuts({ repo, binDir = path.join(os.homedir(), ".local", "bin"), coreOnly = false }) {
  if (!process.getuid) throw new Error("POSIX ownership checks are required for shortcut installation");
  if (typeof coreOnly !== "boolean") throw new Error("coreOnly must be a boolean");
  if (typeof repo !== "string" || !repo || typeof binDir !== "string" || !path.isAbsolute(binDir)) {
    throw new Error("An explicit repository and absolute bin directory are required");
  }
  const repoPath = fs.realpathSync(repo);
  if (!fs.statSync(repoPath).isDirectory() || !path.basename(repoPath)) throw new Error("Invalid repository");
  const repoBin = path.join(repoPath, ".hermes", "bin");
  plainAncestors(repoBin);
  const sourceDir = statOrMissing(repoBin);
  const stateDir = statOrMissing(path.dirname(repoBin));
  if (!sourceDir || !stateDir || !owned(sourceDir) || !owned(stateDir)) throw new Error("Unsafe launcher directory");
  const normalized = path.basename(repoPath).toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "repo";
  const suffixes = coreOnly ? allSuffixes.slice(0, 3) : allSuffixes;
  const names = suffixes.map(suffix => `hermes-${normalized}${suffix}`);
  const destination = path.resolve(binDir);
  plainAncestors(destination);
  const destinationStat = statOrMissing(destination);
  if (destinationStat && !owned(destinationStat)) throw new Error("Bin directory must be owned and not group/world writable");
  let parent = path.dirname(destination);
  while (!statOrMissing(parent)) parent = path.dirname(parent);
  if (!owned(fs.lstatSync(parent))) throw new Error("Bin parent directory must be owned and not group/world writable");

  // Preflight every selected name before any creation; never overwrite a command or
  // dangling/foreign symlink. A racing EEXIST also fails closed, without unlink.
  const entries = suffixes.map((suffix, index) => {
    const target = path.join(repoBin, `hermes${suffix}`);
    const source = statOrMissing(target);
    if (!source?.isFile() || source.nlink !== 1 || !owned(source)) throw new Error("Unsafe or missing launcher");
    fs.accessSync(target, fs.constants.R_OK | fs.constants.X_OK);
    const link = path.join(destination, names[index]);
    const existing = statOrMissing(link);
    if (existing && (!existing.isSymbolicLink() || (process.getuid && existing.uid !== process.getuid())
      || fs.readlinkSync(link) !== target)) throw new Error(`Shortcut conflict: ${names[index]}`);
    return { target, link, exists: Boolean(existing) };
  });
  fs.mkdirSync(destination, { recursive: true, mode: 0o700 });
  let created = 0;
  for (const entry of entries) {
    if (entry.exists) continue;
    fs.symlinkSync(entry.target, entry.link);
    created++;
  }
  return { binDir: destination, names, created };
}

function main() {
  const options = {};
  const args = process.argv.slice(2);
  const usage = "Usage: install-shortcuts.mjs --repo ROOT [--bin-dir ABSOLUTE_DIR] [--core-only]";
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--core-only") {
      if (Object.hasOwn(options, "coreOnly")) throw new Error(usage);
      options.coreOnly = true;
      continue;
    }
    const key = { "--repo": "repo", "--bin-dir": "binDir" }[args[i]];
    if (!key || Object.hasOwn(options, key) || !args[i + 1] || args[i + 1].startsWith("--")) throw new Error(usage);
    options[key] = args[++i];
  }
  const result = installShortcuts(options);
  console.log(JSON.stringify(result));
  const onPath = (process.env.PATH ?? "").split(path.delimiter).some(entry => entry && path.resolve(entry) === result.binDir);
  if (!onPath) console.log("Shortcut directory is not on this process's PATH; use absolute commands or configure the user's shell explicitly.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(); } catch {
    console.error("Shortcut installation incomplete; check options, launcher ownership and selected destination names. Nothing was overwritten.");
    process.exitCode = 1;
  }
}

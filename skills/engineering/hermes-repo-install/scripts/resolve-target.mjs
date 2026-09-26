#!/usr/bin/env node
// Offline run-repo resolution only: no Docker, writes, secrets, or network.
// Answers "which repository is this skill running in, and is it already ours?"
// so the agent can maintain an owned instance instead of creating a duplicate.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { deriveIdentity } from "./compose-plan.mjs";

const control = /[\x00-\x1f\x7f]/;
const redacted = (value) => (typeof value === "string" ? value.replace(control, "") : value);

function canonicalDirectory(dir, label) {
  if (typeof dir !== "string" || !dir || control.test(dir)) {
    throw new Error(`${label} must be a non-empty path without control characters`);
  }
  const resolved = fs.realpathSync(dir);
  if (!fs.statSync(resolved).isDirectory()) throw new Error(`${label} must be a directory`);
  return resolved;
}

function gitWorktreeRoot(cwd) {
  const resolved = canonicalDirectory(cwd, "cwd");
  let top;
  try {
    top = execFileSync("git", ["-C", resolved, "rev-parse", "--show-toplevel"], {
      encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], timeout: 10000,
    }).trim();
  } catch {
    throw new Error("working directory is not inside a Git worktree; pass an explicit repository path");
  }
  if (!top) throw new Error("git did not return a worktree root");
  return canonicalDirectory(top, "git root");
}

function readReceipt(file) {
  if (!fs.existsSync(file)) return null;
  const stat = fs.lstatSync(file);
  if (stat.isSymbolicLink() || !stat.isFile()) throw new Error(`refusing non-regular receipt: ${path.basename(file)}`);
  try {
    return JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    throw new Error(`unreadable receipt: ${path.basename(file)}`);
  }
}

export function resolveTarget({ cwd = process.cwd(), repo } = {}) {
  const explicit = repo !== undefined && repo !== null;
  const repoPath = explicit ? canonicalDirectory(repo, "repo") : gitWorktreeRoot(cwd);
  const identity = deriveIdentity(repoPath);
  const hermesDir = path.join(repoPath, ".hermes");
  if (fs.existsSync(hermesDir) && fs.lstatSync(hermesDir).isSymbolicLink()) {
    return {
      ...identity, explicit, state: "foreign", action: "blocked", phase: null,
      reason: `.hermes for ${redacted(repoPath)} is a symlink; refuse to adopt or write a shared home`,
    };
  }
  const receipt = readReceipt(path.join(hermesDir, "identity.json"));
  const progress = readReceipt(path.join(hermesDir, "setup-state.json"));
  if (receipt) {
    const matches = receipt.repoId === identity.repoId && receipt.repoPath === identity.repoPath;
    if (!matches) {
      return {
        ...identity, explicit, state: "foreign", action: "blocked", phase: null,
        reason: "local .hermes identity belongs to a different repository; resolve the conflict instead of creating a duplicate",
      };
    }
    return {
      ...identity, explicit, state: "existing", action: "maintain",
      phase: typeof progress?.phase === "string" ? progress.phase : null,
    };
  }
  return { ...identity, explicit, state: "fresh", action: "create", phase: null };
}

function parseArgs(args) {
  const values = {};
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (!["--cwd", "--repo"].includes(flag)) throw new Error(`unknown option: ${flag}`);
    const key = flag.slice(2);
    if (Object.hasOwn(values, key)) throw new Error(`duplicate option: ${flag}`);
    const value = args[++i];
    if (!value || value.startsWith("--")) throw new Error(`missing value: ${flag}`);
    values[key] = value;
  }
  return values;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    console.log(JSON.stringify(resolveTarget(parseArgs(process.argv.slice(2))), null, 2));
  } catch (error) {
    console.error(`hermes-repo-install: ${error.message}`);
    process.exitCode = 1;
  }
}
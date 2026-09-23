// Fetch an unmodified, pinned upstream checkout; never run upstream installers.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const { superpowers } = JSON.parse(fs.readFileSync(path.join(root, "skills/shared/profiles.json"), "utf8"));
const target = path.resolve(process.env.SUPERPOWERS_DIR || path.join(
  process.env.XDG_DATA_HOME || path.join(process.env.HOME, ".local/share"),
  "pi-toolset/superpowers", superpowers.revision,
));
const git = (...args) => execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "inherit"] }).trim();
if (process.argv.includes("--path")) {
  console.log(target);
  process.exit(0);
}
if (!fs.existsSync(target)) {
  fs.mkdirSync(path.dirname(target), { recursive: true });
  const temporary = fs.mkdtempSync(`${target}.tmp.`);
  try {
    git("init", "--quiet", temporary);
    git("-C", temporary, "remote", "add", "origin", superpowers.repository);
    git("-C", temporary, "fetch", "--depth", "1", "origin", superpowers.revision);
    git("-C", temporary, "checkout", "--quiet", "--detach", "FETCH_HEAD");
    fs.renameSync(temporary, target);
  } finally {
    fs.rmSync(temporary, { recursive: true, force: true });
  }
}
if (git("-C", target, "rev-parse", "HEAD") !== superpowers.revision || git("-C", target, "status", "--porcelain")) {
  throw new Error(`Superpowers checkout must be clean at ${superpowers.revision}: ${target}`);
}
for (const name of superpowers.skills) {
  if (!fs.existsSync(path.join(target, "skills", name, "SKILL.md"))) throw new Error(`Missing upstream skill: ${name}`);
}
if (!fs.existsSync(path.join(target, ".pi/extensions/superpowers.ts"))) throw new Error("Missing native Pi bootstrap");
console.log(target);

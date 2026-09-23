// Keep explicit commands cached by open sessions readable after profile migration.
import fs from "node:fs";
import path from "node:path";

const [destination, original] = process.argv.slice(2).map(p => path.resolve(p));
const name = path.basename(destination);
if (!/^[a-z0-9-]+$/.test(name)) throw new Error("Invalid compatibility skill name");
if (!fs.existsSync(original)) throw new Error(`Original skill is missing: ${original}`);
if (fs.existsSync(destination)) throw new Error(`Refusing to replace existing skill: ${destination}`);
const root = path.resolve(new URL("..", import.meta.url).pathname);
const { retired } = JSON.parse(fs.readFileSync(path.join(root, "skills/shared/profiles.json")));
const body = retired.includes(name)
  ? "This legacy workflow is retired. Continue the user's authorized task under Superpowers and the shared skill contract. Do not enable a competing persistent mode or infer new approval from this command."
  : `This is an explicit-use optional skill. Read the preserved instructions at ${JSON.stringify(original)} and resolve its supporting resources relative to that file. Superpowers remains the primary engineering workflow; user instructions and project rules take precedence. Loading this skill does not expand authorization.`;
fs.mkdirSync(destination, { recursive: true });
fs.writeFileSync(path.join(destination, "SKILL.md"), `---
name: ${name}
description: Explicit compatibility command for ${name} after skill profile cleanup.
disable-model-invocation: true
---

<!-- pi-toolset-compatibility -->

${body}

The active shared contract is at ${JSON.stringify(path.join(path.dirname(destination), "shared/COMMON-CONTRACT.md"))}.
`);

import assert from "node:assert/strict";
import path from "node:path";
import registerUpdatePiToolset, {
  parseUpdateArgs,
  PACKAGE_ROOT,
} from "../extensions/update-pi-toolset/index.js";

// Pure argument parsing: only --profile=NAME and --dry-run are forwarded.
assert.deepEqual(parseUpdateArgs(""), { forwarded: [], dryRun: false, errors: [] });
assert.deepEqual(parseUpdateArgs("  --profile=automation   --dry-run "), {
  forwarded: ["--profile=automation", "--dry-run"],
  dryRun: true,
  errors: [],
});
assert.equal(parseUpdateArgs("--profile=").errors.length, 1);
assert.equal(parseUpdateArgs("--bogus").errors.length, 1);
assert.equal(parseUpdateArgs("design").errors.length, 1);

const commands = new Map();
const calls = [];
const notices = [];
const execResult = { stdout: "", stderr: "", code: 0, killed: false };
registerUpdatePiToolset({
  registerCommand: (name, definition) => commands.set(name, definition),
  exec: async (command, args, options) => {
    calls.push({ command, args, options });
    return execResult;
  },
});

assert.deepEqual([...commands.keys()], ["update-pi-toolset"]);
const command = commands.get("update-pi-toolset");
assert.equal(typeof command.handler, "function");

const ctx = {
  signal: undefined,
  ui: { notify: (message, level) => notices.push({ message, level }) },
};
const installer = path.join(PACKAGE_ROOT, "install.sh");

await command.handler("--bogus", ctx);
assert.equal(calls.length, 0, "invalid arguments must not run the installer");
assert.equal(notices.at(-1).level, "warning");

await command.handler("--profile=automation", ctx);
assert.equal(calls.length, 1);
assert.equal(calls[0].command, "sh");
assert.deepEqual(calls[0].args, [installer, "--profile=automation"]);
assert.equal(notices.at(-1).level, "info");
assert.match(notices.at(-1).message, /\/reload/);

execResult.code = 1;
execResult.stderr = "first line\nlast line";
await command.handler("", ctx);
assert.equal(notices.at(-1).level, "error");
assert.match(notices.at(-1).message, /last line/);

console.log("update-pi-toolset-extension ok");

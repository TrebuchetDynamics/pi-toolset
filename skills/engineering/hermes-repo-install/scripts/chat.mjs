#!/usr/bin/env node
// Interactive dispatch only. The reviewed runtime-specific adapter owns session
// coordination and scoped execution; this helper cannot certify live safety.
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import { constants } from "node:os";
import { probeAvailable } from "./wait-ready.mjs";

function adapterAvailable(file) {
  try {
    return probeAvailable(file) && (fs.lstatSync(file).mode & 0o077) === 0;
  } catch {
    return false;
  }
}

const [flag, adapter, ...extra] = process.argv.slice(2);
if (flag !== "--adapter" || !adapter || extra.length) {
  console.error("Usage: chat.mjs --adapter /absolute/verified-chat-adapter");
  process.exitCode = 2;
} else if (!process.stdin.isTTY || !process.stdout.isTTY || !adapterAvailable(adapter)) {
  console.error("Interactive chat unavailable; use a private terminal and a verified session adapter. No service was changed.");
  process.exitCode = 3;
} else {
  // Inherit the user's terminal: do not capture chat, auth or model output.
  // Interactive sessions have no readiness-probe timeout and are never retried.
  const result = spawnSync(adapter, [], { stdio: "inherit", shell: false });
  if (result.error) {
    console.error("Chat adapter could not run; no automatic retry or service restart.");
    process.exitCode = 3;
  } else if (result.signal) {
    process.exitCode = 128 + (constants.signals[result.signal] ?? 1);
  } else {
    process.exitCode = result.status ?? 3;
  }
}

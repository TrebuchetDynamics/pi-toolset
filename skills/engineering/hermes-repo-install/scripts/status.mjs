#!/usr/bin/env node
// Fixed diagnostics only: never echo Docker/probe output or inspect credentials.
import path from "node:path";
import { spawnSync } from "node:child_process";
import { pathToFileURL } from "node:url";
import { probeAvailable } from "./wait-ready.mjs";

const pending = {
  code: 3,
  message: "VERIFICATION PENDING — current gateway/channel evidence unavailable.\nNext: establish a verified image-specific diagnostic probe; do not restart from uptime alone.",
};
const outcomes = new Map([
  [0, { code: 0, message: "RUNTIME READY — current gateway and configured channels verified.\nModel-generated reply not verified by this status check.\nDevelopment readiness not verified by this status check." }],
  [10, { code: 1, message: "MAINTENANCE — container running, gateway stopped.\nActivation pending; credential/access checks remain unverified.\nNext: report setup completion; verify auth, workspace and memory before approved activation." }],
  [11, { code: 1, message: "MAINTENANCE — container running, gateway stopped.\nTelegram credentials present; activation pending.\nNext: verify access policy, auth, workspace and memory; obtain any required recreation approval before activation." }],
  [12, { code: 1, message: "GATEWAY STOPPED — container running, gateway stopped.\nNext: diagnose the supported runtime's stop reason; do not rerun setup or restart blindly." }],
  [20, { code: 1, message: "BLOCKED — ownership, mounts, writers or a required verification gate failed.\nNext: resolve the specific boundary before changing this instance." }],
  [21, { code: 1, message: "TELEGRAM DISCONNECTED — current channel evidence requires attention.\nNext: inspect the supported connection/auth/access-policy signal without exposing credentials." }],
  [22, { code: 1, message: "SETUP INCOMPLETE — required effective configuration is missing.\nNext: complete setup privately, then report completion; saving credentials does not activate the gateway." }],
  [23, { code: 1, message: "APPLY NEEDED — saved configuration has not been loaded.\nNext: finish verification and exit setup; use the scoped apply command only after its gates and downtime authorization." }],
  [24, { code: 1, message: "HOLOGRAPHIC BASIC — basic keyword mode—not full HRR capability.\nNext: review verified capability evidence and approve any required persistent dependency or runtime repair; no automatic installation or restart." }],
]);

function collect(command, args, timeout) {
  return spawnSync(command, args, {
    encoding: "utf8", stdio: ["ignore", "pipe", "ignore"],
    timeout, killSignal: "SIGKILL", maxBuffer: 65536,
  });
}

export function diagnose({ context, project, composeFile, probe, probeTimeoutMs = 5000 }) {
  if (![context, project].every(value => typeof value === "string" && value.length > 0)
    || typeof composeFile !== "string" || !path.isAbsolute(composeFile)
    || !Number.isSafeInteger(probeTimeoutMs) || probeTimeoutMs < 1 || probeTimeoutMs > 5000) return pending;
  const result = collect("docker", ["--context", context, "compose", "--env-file", "/dev/null",
    "-p", project, "-f", composeFile, "ps", "--all", "--format", "json", "hermes"], 5000);
  if (result.error || result.signal || result.status !== 0) return pending;
  let rows;
  try {
    const text = result.stdout.trim();
    rows = text.startsWith("[") ? JSON.parse(text) : text.split("\n").map(line => JSON.parse(line));
  } catch { return pending; }
  if (!Array.isArray(rows) || rows.length !== 1 || rows[0]?.Service !== "hermes") return pending;
  if (["exited", "dead", "created", "paused", "restarting", "removing"].includes(rows[0].State)) {
    return { code: 1, message: "STOPPED / NOT RUNNING — container is not in a running state.\nNext: verify ownership and the current stop/restart reason before any lifecycle action." };
  }
  if (rows[0].State !== "running" || !probeAvailable(probe)) return pending;
  // The reviewed adapter re-resolves live ownership/configuration on every call.
  // Exit codes attest evidence, not permissions; stdout/stderr are never shown.
  const observed = collect(probe, [], probeTimeoutMs);
  if (observed.error || observed.signal) return pending;
  return outcomes.get(observed.status) ?? pending;
}

function main() {
  const [flag, context, project, composeFile, probe, ...rest] = process.argv.slice(2);
  if (flag !== "--docker" || !probe || rest.length) {
    console.error("Usage: status.mjs --docker CONTEXT PROJECT /absolute/compose.yaml /absolute/diagnostic-probe");
    process.exitCode = 2;
    return;
  }
  // Ignore ambient Compose selectors, even when invoked without the launcher.
  for (const key of ["COMPOSE_FILE", "COMPOSE_PROJECT_NAME", "COMPOSE_PROFILES", "COMPOSE_ENV_FILES"]) delete process.env[key];
  const result = diagnose({ context, project, composeFile, probe });
  console.log(result.message);
  process.exitCode = result.code;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try { main(); } catch {
    console.log(pending.message);
    process.exitCode = pending.code;
  }
}

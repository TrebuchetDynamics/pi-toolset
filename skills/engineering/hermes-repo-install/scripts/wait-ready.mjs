#!/usr/bin/env node
// Run only an installer-verified, version-specific, read-only local probe.
// No universal Hermes health command is assumed; never echo probe output.
import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { setTimeout as delay } from "node:timers/promises";
import { pathToFileURL } from "node:url";

export function probeAvailable(probe) {
  try {
    if (typeof probe !== "string" || !path.isAbsolute(probe)) return false;
    const stat = fs.lstatSync(probe);
    if (!stat.isFile() || stat.nlink !== 1 || (stat.mode & 0o022)
      || (process.getuid && stat.uid !== process.getuid())
      || fs.realpathSync(probe) !== path.resolve(probe)) return false;
    fs.accessSync(probe, fs.constants.R_OK | fs.constants.X_OK);
    return true;
  } catch {
    return false;
  }
}

export async function waitForReadiness({ probe, timeoutMs = 60000, intervalMs = 2000, probeTimeoutMs = 5000 }) {
  if (![timeoutMs, intervalMs, probeTimeoutMs].every(value => Number.isSafeInteger(value) && value > 0)
    || timeoutMs > 120000 || intervalMs > 10000 || probeTimeoutMs > 15000 || !probeAvailable(probe)) {
    return { status: "unavailable" };
  }
  const deadline = performance.now() + timeoutMs;
  while (performance.now() < deadline) {
    if (!probeAvailable(probe)) return { status: "unavailable" };
    const result = spawnSync(probe, [], {
      encoding: "utf8", stdio: ["ignore", "pipe", "ignore"], maxBuffer: 65536,
      timeout: Math.max(1, Math.min(probeTimeoutMs, Math.ceil(deadline - performance.now()))), killSignal: "SIGKILL",
    });
    if (performance.now() >= deadline) return { status: "timeout" };
    if (result.error || result.signal) return { status: "unavailable" };
    if (result.status === 0) return { status: "ready" };
    if (result.status === 20) return { status: "blocked" };
    if (result.status !== 10) return { status: "unavailable" };
    await delay(Math.min(intervalMs, Math.max(0, deadline - performance.now())));
  }
  return { status: "timeout" };
}

async function main() {
  const [mode, probe, ...rest] = process.argv.slice(2);
  if (rest.length || !["--probe", "--check-probe"].includes(mode) || !probe) {
    console.error("Usage: wait-ready.mjs --probe|--check-probe /absolute/verified-probe");
    process.exitCode = 2;
    return;
  }
  if (mode === "--check-probe") {
    if (!probeAvailable(probe)) {
      console.error("Readiness probe unavailable; configure a verified adapter before applying.");
      process.exitCode = 3;
    }
    return;
  }
  const { status } = await waitForReadiness({ probe });
  if (status === "ready") {
    console.log("Ready: gateway and configured channels verified.");
    console.log("Development readiness not verified by this runtime check.");
  } else {
    const messages = {
      timeout: "Readiness timed out; check status/logs. No automatic retry or rollback.",
      blocked: "Readiness is blocked; check status/logs. No automatic retry or rollback.",
      unavailable: "Readiness remains unverified (probe unavailable, failed or unsupported).",
    };
    console.error(messages[status]);
    process.exitCode = status === "unavailable" ? 3 : 1;
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(() => {
    console.error("Readiness verification unavailable; inspect the scoped instance privately.");
    process.exitCode = 3;
  });
}

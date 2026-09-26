#!/usr/bin/env node
// Fixed-label summaries only: never echo untrusted log lines, tokens or messages.
// These are historical observations, not a live gateway/readiness probe.
import { execFileSync } from "node:child_process";
import path from "node:path";
import { pathToFileURL } from "node:url";

const signatures = [
  [/\bGateway running with \d+ platform\(s\)/i, "Gateway startup event"],
  [/\btelegram connected\b/i, "Telegram connection event"],
  [/\bgetUpdates progressing\b/i, "Telegram polling progress event"],
  [/\bCold boot: dropping Telegram updates queued while offline\b/i, "Telegram backlog discarded"],
  [/\btelegram\b.*\b(disconnected|connection failed)\b/i, "Telegram disconnection event"],
  [/\b(unauthorized|invalid_api_key|authentication failed)\b/i, "Authentication rejection event"],
];

export function summarizeLogEvents(text) {
  const events = new Set();
  for (const line of text.split(/\r?\n/)) {
    for (const [pattern, label] of signatures) {
      if (pattern.test(line)) events.add(label);
    }
  }
  return [...events];
}

const limit = 1024 * 1024;

function dockerLogs(args) {
  const [context, project, compose] = args;
  if (args.length !== 3 || !context || context.startsWith("-") || /[\x00-\x1f\x7f]/.test(context)
    || !/^[a-z0-9][a-z0-9_-]*$/.test(project ?? "") || !path.isAbsolute(compose ?? "")) {
    throw new Error("Invalid selectors");
  }
  const env = { ...process.env };
  for (const key of ["COMPOSE_FILE", "COMPOSE_PROJECT_NAME", "COMPOSE_PROFILES", "COMPOSE_ENV_FILES"]) delete env[key];
  // Bound collection before any shell buffering. Never expose raw stdout,
  // stderr or Error objects, including execFileSync's captured output fields.
  return execFileSync("docker", ["--context", context, "compose", "--env-file", "/dev/null",
    "-p", project, "-f", compose, "logs", "--no-color", "--no-log-prefix", "--tail", "100", "hermes"], {
    encoding: "utf8", env, stdio: ["ignore", "pipe", "ignore"], maxBuffer: limit, timeout: 15000,
  });
}

async function stdinLogs() {
  let bytes = 0;
  const chunks = [];
  for await (const chunk of process.stdin) {
    bytes += chunk.length;
    if (bytes > limit) throw new Error("Input limit exceeded");
    chunks.push(chunk);
  }
  return Buffer.concat(chunks).toString("utf8");
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length && (args[0] !== "--docker" || args.length !== 4)) {
    console.error("Usage: log-events.mjs [--docker CONTEXT PROJECT COMPOSE_FILE]");
    process.exitCode = 2;
    return;
  }
  const text = args.length ? dockerLogs(args.slice(1)) : await stdinLogs();
  const events = summarizeLogEvents(text);
  console.log("Historical log events only — not live readiness.");
  console.log(events.length ? events.map(event => `- ${event}`).join("\n") : "No recognized events; readiness remains unverified.");
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  main().catch(() => {
    console.error("Log summary unavailable; inspect privately.");
    process.exitCode = 1;
  });
}

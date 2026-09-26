#!/usr/bin/env node
// Offline planner only: no Docker calls, writes, credentials, or port probes.
import { createHash } from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

const literal = (value) => value.split("$").join("$$"); // Compose interpolation, not shell escaping

// Single source of truth for repo-derived Docker/Compose identity. Callers pass a
// canonical (realpath'd) repo directory; this function performs no I/O.
export function deriveIdentity(repoPath) {
  const profileName = path.basename(repoPath);
  if (!profileName) throw new Error("filesystem root is not a repository directory");
  const repoId = createHash("sha256").update(repoPath, "utf8").digest("hex");
  const repoName = profileName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "repo";
  const projectSlug = repoName.slice(0, 36).replace(/-+$/g, "");
  const projectName = `hermes-${projectSlug}-${repoId.slice(0, 16)}`;
  // Docker names are daemon-global: caller must stop on a foreign collision.
  // Only internal state IDs are hashed/bounded; the container keeps the repo name.
  const containerName = `hermes-${repoName}`;
  return { profileName, repoPath, repoId, projectName, containerName };
}

export function makePlan({ repo, image, uid, gid, web = false }) {
  if (typeof repo !== "string" || !repo || /[\x00-\x1f\x7f]/.test(repo)) {
    throw new Error("repo must be a directory path without control characters");
  }
  const repoPath = fs.realpathSync(repo);
  if (!fs.statSync(repoPath).isDirectory()) throw new Error("repo must be a directory");
  if (typeof image !== "string" || !/^nousresearch\/hermes-agent@sha256:[a-f0-9]{64}$/.test(image)) {
    throw new Error("image must be an inspected official nousresearch/hermes-agent@sha256:<digest> pin");
  }
  for (const [key, value] of Object.entries({ uid, gid })) {
    if (!Number.isInteger(value) || value < 1 || value > 65534) {
      throw new Error(`${key} must be a non-root integer in 1..65534`);
    }
  }
  if (typeof web !== "boolean") throw new Error("web must be boolean");

  const { profileName, repoId, projectName, containerName } = deriveIdentity(repoPath);
  const labels = {
    "io.pi-toolset.hermes.repo-id": repoId,
    "io.pi-toolset.hermes.repo-path": literal(repoPath),
    "io.pi-toolset.hermes.profile": literal(profileName),
  };
  const service = {
    image,
    container_name: containerName,
    command: ["gateway", "run"],
    restart: "unless-stopped",
    working_dir: "/workspace",
    environment: {
      HERMES_HOME: "/opt/data",
      HERMES_UID: String(uid),
      HERMES_GID: String(gid),
      HERMES_DASHBOARD: web ? "1" : "0",
      API_SERVER_ENABLED: web ? "true" : "false",
    },
    // Installer-managed bootstrap secrets; user-run setup owns native runtime
    // provider/channel credentials in the persistent home (no automatic copies).
    // Raw loading preserves literal dollars/quotes (Compose >=2.30). The planner
    // only names this file: it never reads, writes, or emits its secret values.
    env_file: [{ path: literal(path.join(repoPath, ".hermes", ".env")), required: true, format: "raw" }],
    volumes: [
      { type: "volume", source: "data", target: "/opt/data" },
      { type: "bind", source: literal(repoPath), target: "/workspace", bind: { create_host_path: false } },
    ],
    labels: { ...labels },
    mem_limit: "4g",
    cpus: 2,
    logging: { driver: "json-file", options: { "max-size": "10m", "max-file": "3" } },
  };
  if (web) {
    service.environment.API_SERVER_HOST = "0.0.0.0";
    service.environment.HERMES_DASHBOARD_HOST = "0.0.0.0";
    // Omitting published lets the Docker daemon allocate distinct available host ports.
    service.ports = [8642, 9119].map((target) => ({ target, host_ip: "127.0.0.1", protocol: "tcp" }));
  }
  return {
    identity: { profileName, repoPath, repoId, projectName, containerName },
    compose: {
      name: projectName,
      services: { hermes: service },
      volumes: { data: { labels: { ...labels } } },
      networks: { default: { labels: { ...labels } } },
    },
    // Required narrow merge after runtime/source checks and the memory skill's gates.
    // Not a complete config, and not applied by this planner.
    requiredConfig: {
      terminal: { backend: "local", cwd: "/workspace" },
      memory: { provider: "holographic" },
      plugins: { "hermes-memory-store": { db_path: "/opt/data/memory_store.db", auto_extract: false } },
    },
  };
}

function parseArgs(args) {
  const values = {};
  for (let i = 0; i < args.length; i++) {
    const flag = args[i];
    if (!["--repo", "--image", "--uid", "--gid", "--web"].includes(flag)) throw new Error(`unknown option: ${flag}`);
    const key = flag.slice(2);
    if (Object.hasOwn(values, key)) throw new Error(`duplicate option: ${flag}`);
    if (key === "web") {
      values[key] = true;
    } else {
      const value = args[++i];
      if (!value || value.startsWith("--")) throw new Error(`missing value: ${flag}`);
      if (["uid", "gid"].includes(key) && !/^\d+$/.test(value)) throw new Error(`${key} must be numeric`);
      values[key] = ["uid", "gid"].includes(key) ? Number(value) : value;
    }
  }
  return values;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    console.log(JSON.stringify(makePlan(parseArgs(process.argv.slice(2))), null, 2));
  } catch (error) {
    console.error(`hermes-repo-install: ${error.message}`);
    process.exitCode = 1;
  }
}

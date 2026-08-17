// Shared pure helpers for the Understand extension. Both index.js and
// lib/refactor-workflow.js import these so path/formatting logic (especially
// output containment, which is security-sensitive) stays in exactly one place.
import { basename, isAbsolute, relative, resolve } from "node:path";
import { lstat } from "node:fs/promises";

export function normalizeFolderToken(folder) {
  const withoutAt = String(folder ?? "").replace(/^@/, "").trim();
  const withoutDotSuffix = withoutAt.replace(/[\\/]\.$/, "");
  const cleaned = withoutDotSuffix.replace(/[\\/]+$/, "");
  return cleaned || withoutAt || "project";
}

export function folderBasename(folder) {
  return basename(normalizeFolderToken(folder)) || "project";
}

export function truncateText(value, maxLength = 220) {
  const text = String(value ?? "").replace(/\s+/g, " ").trim();
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trimEnd()}…`;
}

export function tableRow(values) {
  return `| ${values.map((value) => String(value ?? "").replace(/\|/g, "\\|")).join(" | ")} |`;
}

export function edgeLine(edge, byId) {
  const source = byId.get(edge.source)?.name ?? edge.source;
  const target = byId.get(edge.target)?.name ?? edge.target;
  const description = edge.description ? ` — ${truncateText(edge.description, 180)}` : "";
  return `- **${source}** --${edge.type ?? "related"}→ **${target}**${description}`;
}

export function formatAnalyzedAt(value) {
  if (!value) return "unknown";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : date.toISOString();
}

export function graphParts(graph) {
  return {
    nodes: Array.isArray(graph?.nodes) ? graph.nodes : [],
    edges: Array.isArray(graph?.edges) ? graph.edges : [],
    layers: Array.isArray(graph?.layers) ? graph.layers : [],
    tour: Array.isArray(graph?.tour) ? graph.tour : [],
    project: graph?.project ?? {},
  };
}

export function isPathInside(parent, child) {
  const rel = relative(parent, child);
  return rel === "" || (!rel.startsWith("..") && !isAbsolute(rel));
}

export function resolveContainedOutputPath(cwd, outputArg) {
  const outputPath = isAbsolute(outputArg) ? resolve(outputArg) : resolve(cwd, outputArg);
  if (!isPathInside(resolve(cwd), outputPath)) {
    throw new Error(`Understand output path must stay inside the current repo: ${outputArg}`);
  }
  return outputPath;
}

export function resolveFolderArg(cwd, folder) {
  const cleaned = folder.replace(/^@/, "");
  return isAbsolute(cleaned) ? cleaned : resolve(cwd, cleaned);
}

export async function getUnderstandDataDir(projectRoot) {
  const legacyDir = resolve(projectRoot, ".understand-anything");
  try {
    await lstat(legacyDir);
    return legacyDir;
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
    return resolve(projectRoot, ".ua");
  }
}

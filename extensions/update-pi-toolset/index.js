import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const extensionDir = path.dirname(fileURLToPath(import.meta.url));
/** Repository/package root that contains install.sh. */
export const PACKAGE_ROOT = path.resolve(extensionDir, "..", "..");
const INSTALL_TIMEOUT_MS = 30 * 60 * 1000;
const USAGE = "Usage: /update-pi-toolset [--profile=NAME] [--dry-run]";

/**
 * Parse the command arguments. Only options the installer understands are
 * forwarded; anything else is reported instead of being passed through.
 */
export function parseUpdateArgs(raw) {
  const tokens = String(raw ?? "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  const forwarded = [];
  const errors = [];
  let dryRun = false;
  for (const token of tokens) {
    if (token === "--dry-run") {
      dryRun = true;
      forwarded.push(token);
      continue;
    }
    if (token.startsWith("--profile=")) {
      if (token.length <= "--profile=".length) {
        errors.push("--profile requires a name");
        continue;
      }
      forwarded.push(token);
      continue;
    }
    errors.push(`unknown argument: ${token}`);
  }
  return { forwarded, dryRun, errors };
}

function tail(text, lines = 6) {
  return String(text ?? "")
    .trim()
    .split("\n")
    .slice(-lines)
    .join("\n");
}

export default function (pi) {
  pi.registerCommand("update-pi-toolset", {
    description: "Update the pi-toolset package and refresh global skills",
    handler: async (args, ctx) => {
      const { forwarded, errors } = parseUpdateArgs(args);
      if (errors.length > 0) {
        ctx.ui.notify(`${USAGE}\n${errors.join("\n")}`, "warning");
        return;
      }
      const installer = path.join(PACKAGE_ROOT, "install.sh");
      if (!existsSync(installer)) {
        ctx.ui.notify(`pi-toolset installer not found at ${installer}`, "error");
        return;
      }
      const suffix = forwarded.length > 0 ? ` (${forwarded.join(" ")})` : "";
      ctx.ui.notify(`Updating pi-toolset${suffix}...`, "info");
      let result;
      try {
        result = await pi.exec("sh", [installer, ...forwarded], {
          timeout: INSTALL_TIMEOUT_MS,
          signal: ctx.signal,
        });
      } catch (error) {
        ctx.ui.notify(`pi-toolset update failed: ${error?.message ?? error}`, "error");
        return;
      }
      if (result.code !== 0) {
        const detail = tail(result.stderr) || tail(result.stdout);
        ctx.ui.notify(`pi-toolset update failed (exit ${result.code})${detail ? `\n${detail}` : ""}`, "error");
        return;
      }
      ctx.ui.notify("pi-toolset updated; run /reload to load the refreshed package extensions", "info");
    },
  });
}

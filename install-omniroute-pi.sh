#!/usr/bin/env sh
set -eu

# Install OmniRoute, start its local daemon, and configure its fallback-capable free pool in Pi.
# Use --config-only for an existing local or remote OmniRoute server.

: "${HOME:?HOME is required}"

agent_dir="${PI_CODING_AGENT_DIR:-${HOME}/.pi/agent}"
models_file="${agent_dir}/models.json"
base_url="${OMNIROUTE_PI_BASE_URL:-http://127.0.0.1:20128/v1}"
# ponytail: the free pool handles per-model 401/429/504 failures without paid fallback.
model="${OMNIROUTE_PI_MODEL:-auto/best-free}"
api_key="${OMNIROUTE_PI_API_KEY:-}"
max_heavy="${OMNIROUTE_CHAT_MAX_HEAVY_IN_FLIGHT:-8}"
server_host="${OMNIROUTE_SERVER_HOST:-127.0.0.1}"
config_only=0

usage() {
  cat <<'EOF'
Usage: sh install-omniroute-pi.sh [options]

Install OmniRoute, run it as a daemon, and register its route in Pi.
Pi's default provider and model are left unchanged, including when unset.

Options:
  --config-only    Skip package installation and daemon startup
  --base-url URL   OmniRoute base URL (`/v1` is detected automatically)
  --model ID       Route to register, not Pi's default (default: auto/best-free)
  -h, --help       Show this help

Environment:
  OMNIROUTE_PI_API_KEY                 Endpoint key; defaults to the existing Pi key, then omniroute-local
  OMNIROUTE_CHAT_MAX_HEAVY_IN_FLIGHT   Concurrent large chats (default: 8)
  OMNIROUTE_SERVER_HOST                Local bind address (default: 127.0.0.1)
  PI_CODING_AGENT_DIR                  Pi config directory (default: ~/.pi/agent)
EOF
}

while [ "$#" -gt 0 ]; do
  case "$1" in
    --config-only)
      config_only=1
      ;;
    --base-url)
      [ "$#" -ge 2 ] || { printf '%s\n' 'install-omniroute-pi: --base-url needs a value' >&2; exit 2; }
      base_url="$2"
      shift
      ;;
    --model)
      [ "$#" -ge 2 ] || { printf '%s\n' 'install-omniroute-pi: --model needs a value' >&2; exit 2; }
      model="$2"
      shift
      ;;
    -h|--help)
      usage
      exit 0
      ;;
    *)
      printf 'install-omniroute-pi: unknown option: %s\n' "$1" >&2
      usage >&2
      exit 2
      ;;
  esac
  shift
done

case "$base_url" in
  http://*|https://*) ;;
  *) printf 'install-omniroute-pi: invalid base URL: %s\n' "$base_url" >&2; exit 2 ;;
esac
[ -n "$model" ] || { printf '%s\n' 'install-omniroute-pi: model cannot be empty' >&2; exit 2; }
case "$max_heavy" in
  ''|*[!0-9]*|0) printf '%s\n' 'install-omniroute-pi: OMNIROUTE_CHAT_MAX_HEAVY_IN_FLIGHT must be a positive integer' >&2; exit 2 ;;
esac
if [ "$config_only" = "0" ] && [ "$max_heavy" -ge 8 ]; then
  printf '%s\n' 'install-omniroute-pi: warning: eight heavy chats can increase memory use; lower OMNIROUTE_CHAT_MAX_HEAVY_IN_FLIGHT if OmniRoute is OOM-killed' >&2
fi
case "$server_host" in
  ''|*[!A-Za-z0-9._:-]*) printf '%s\n' 'install-omniroute-pi: OMNIROUTE_SERVER_HOST must be a hostname or IP address' >&2; exit 2 ;;
esac

command -v node >/dev/null 2>&1 || {
  printf '%s\n' 'install-omniroute-pi: Node.js 22+ is required' >&2
  exit 1
}
node -e 'process.exit(Number(process.versions.node.split(".")[0]) >= 22 ? 0 : 1)' || {
  printf '%s\n' 'install-omniroute-pi: Node.js 22+ is required' >&2
  exit 1
}
if [ "$config_only" = "0" ]; then
  node -e '
const [major, minor, patch] = process.versions.node.split(".").map(Number);
const supported = (major === 22 && (minor > 22 || (minor === 22 && patch >= 2))) || (major >= 24 && major < 27);
process.exit(supported ? 0 : 1);
' || {
    printf '%s\n' 'install-omniroute-pi: OmniRoute requires Node.js 22.22.2, 24, 25, or 26' >&2
    exit 1
  }
fi

if [ -z "$api_key" ] && [ -f "$models_file" ]; then
  api_key="$(PI_MODELS_FILE="$models_file" OMNIROUTE_BASE_URL="$base_url" node <<'NODE'
import fs from "node:fs";

const config = JSON.parse(fs.readFileSync(process.env.PI_MODELS_FILE, "utf8"));
const provider = config?.providers?.omniroute;
const key = provider?.apiKey;
const sameOrigin = typeof provider?.baseUrl === "string" &&
  new URL(provider.baseUrl).origin === new URL(process.env.OMNIROUTE_BASE_URL).origin;
if (sameOrigin && typeof key === "string" && !key.includes("$") && !key.startsWith("!")) {
  process.stdout.write(key);
}
NODE
)"
fi
api_key="${api_key:-omniroute-local}"

requested_base_url="${base_url%/}"
base_url="$(
  OMNIROUTE_BASE_URL="$requested_base_url" OMNIROUTE_KEY="$api_key" node 2>/dev/null <<'NODE'
const input = new URL(process.env.OMNIROUTE_BASE_URL);
input.hash = "";
input.search = "";
input.pathname = input.pathname.replace(/\/$/, "");
const direct = input.toString().replace(/\/$/, "");
let alternateUrl = new URL(input);
let candidates;
if (input.pathname.endsWith("/v1")) {
  alternateUrl.pathname = input.pathname.slice(0, -3) || "/";
  candidates = [direct, alternateUrl.toString().replace(/\/$/, "")];
} else {
  alternateUrl.pathname = `${input.pathname}/v1`.replace(/\/+/g, "/");
  const versioned = alternateUrl.toString().replace(/\/$/, "");
  candidates = input.pathname ? [direct, versioned] : [versioned, direct];
}
for (const candidate of candidates) {
  try {
    const response = await fetch(`${candidate}/models`, {
      headers: { Authorization: `Bearer ${process.env.OMNIROUTE_KEY}` },
      signal: AbortSignal.timeout(1500),
    });
    if (response.ok) {
      console.log(candidate);
      process.exit(0);
    }
  } catch {}
}
console.log(candidates[0]);
NODE
)" || {
  printf 'install-omniroute-pi: invalid or unreachable base URL: %s\n' "$requested_base_url" >&2
  exit 2
}
if [ "$base_url" != "$requested_base_url" ]; then
  printf 'install-omniroute-pi: selected endpoint %s\n' "$base_url"
fi

catalog_url="${base_url%/}/models"
server_ready() {
  CATALOG_URL="$catalog_url" OMNIROUTE_KEY="$api_key" node <<'NODE' >/dev/null 2>&1
const response = await fetch(process.env.CATALOG_URL, {
  headers: { Authorization: `Bearer ${process.env.OMNIROUTE_KEY}` },
  signal: AbortSignal.timeout(2000),
});
process.exit(response.status < 500 ? 0 : 1);
NODE
}
catalog_ready() {
  CATALOG_URL="$catalog_url" OMNIROUTE_KEY="$api_key" OMNIROUTE_MODEL="$model" node <<'NODE' >/dev/null 2>&1
const response = await fetch(process.env.CATALOG_URL, {
  headers: { Authorization: `Bearer ${process.env.OMNIROUTE_KEY}` },
  signal: AbortSignal.timeout(2000),
});
if (response.status === 401 || response.status === 403) process.exit(10);
if (!response.ok) process.exit(11);
try {
  const payload = await response.json();
  process.exit(payload.data?.some((entry) => entry.id === process.env.OMNIROUTE_MODEL) ? 0 : 12);
} catch {
  process.exit(13);
}
NODE
}
create_local_api_key() {
  key_output="$(mktemp "${TMPDIR:-/tmp}/omniroute-pi-key.XXXXXX")"
  trap 'rm -f "$key_output"' EXIT
  trap 'rm -f "$key_output"; exit 1' HUP INT TERM
  management_url="${base_url%/v1}"
  if ! omniroute --output json --quiet --base-url "$management_url" api api-keys post-api-keys --body '{"name":"Pi (pi-toolset)"}' > "$key_output"; then
    return 1
  fi
  generated_key="$(OMNIROUTE_KEY_OUTPUT="$key_output" node <<'NODE'
import fs from "node:fs";

const text = fs.readFileSync(process.env.OMNIROUTE_KEY_OUTPUT, "utf8");
const start = text.indexOf("{");
if (start < 0) process.exit(1);
const payload = JSON.parse(text.slice(start));
if (typeof payload.key !== "string" || !payload.key) process.exit(1);
process.stdout.write(payload.key);
NODE
)" || return 1
  rm -f "$key_output"
  trap - EXIT HUP INT TERM
  api_key="$generated_key"
}

if [ "$config_only" = "0" ]; then
  command -v npm >/dev/null 2>&1 || {
    printf '%s\n' 'install-omniroute-pi: npm is required' >&2
    exit 1
  }

  if ! command -v pi >/dev/null 2>&1 || ! pi --version >/dev/null 2>&1; then
    npm install -g --ignore-scripts --legacy-peer-deps @earendil-works/pi-coding-agent
  fi
  if ! npm install -g --legacy-peer-deps --engine-strict omniroute; then
    if command -v omniroute >/dev/null 2>&1 && omniroute --version >/dev/null 2>&1; then
      printf '%s\n' 'install-omniroute-pi: warning: npm refresh failed; continuing with installed OmniRoute' >&2
    else
      printf '%s\n' 'install-omniroute-pi: OmniRoute installation failed' >&2
      exit 1
    fi
  fi

  OMNIROUTE_ENV_FILE="${HOME}/.omniroute/.env" OMNIROUTE_MAX_HEAVY="$max_heavy" OMNIROUTE_BIND_HOST="$server_host" node <<'NODE' >/dev/null
import fs from "node:fs";
import path from "node:path";

const file = process.env.OMNIROUTE_ENV_FILE;
const settings = {
  OMNIROUTE_CHAT_MAX_HEAVY_IN_FLIGHT: process.env.OMNIROUTE_MAX_HEAVY,
  OMNIROUTE_SERVER_HOST: process.env.OMNIROUTE_BIND_HOST,
};
fs.mkdirSync(path.dirname(file), { recursive: true, mode: 0o700 });
const before = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
let after = before;
for (const [key, value] of Object.entries(settings)) {
  const pattern = new RegExp(`^${key}=.*$`, "gm");
  const line = `${key}=${value}`;
  after = pattern.test(after)
    ? after.replace(pattern, line)
    : `${after}${after && !after.endsWith("\n") ? "\n" : ""}${line}\n`;
}
const changed = after !== before;
if (changed) {
  const temporary = `${file}.tmp.${process.pid}`;
  fs.writeFileSync(temporary, after, { mode: 0o600 });
  fs.renameSync(temporary, file);
}
fs.chmodSync(file, 0o600);
NODE

  if omniroute autostart status >/dev/null 2>&1; then
    omniroute autostart enable >/dev/null 2>&1 || true
  fi

  case "$base_url" in
    http://127.0.0.1:*|http://localhost:*) omniroute stop >/dev/null 2>&1 || true ;;
  esac

  if ! server_ready; then
    OMNIROUTE_CHAT_MAX_HEAVY_IN_FLIGHT="$max_heavy" OMNIROUTE_SERVER_HOST="$server_host" omniroute serve --daemon --no-open
    attempts=0
    until server_ready; do
      attempts=$((attempts + 1))
      if [ "$attempts" -ge 30 ]; then
        printf 'install-omniroute-pi: OmniRoute did not become ready at %s\n' "$catalog_url" >&2
        exit 1
      fi
      sleep 1
    done
  fi
fi

catalog_status=0
catalog_ready || catalog_status=$?
if [ "$catalog_status" -ne 0 ]; then
  case "$base_url:$config_only:$catalog_status" in
    http://127.0.0.1:*:0:10|http://localhost:*:0:10)
      if ! create_local_api_key || ! catalog_ready; then
        printf 'install-omniroute-pi: could not create a working local API key for %s\n' "$catalog_url" >&2
        exit 1
      fi
      ;;
    *)
      printf 'install-omniroute-pi: route %s is unavailable at %s\n' "$model" "$catalog_url" >&2
      exit 1
      ;;
  esac
fi

mkdir -p "$agent_dir"

PI_MODELS_FILE="$models_file" OMNIROUTE_BASE_URL="$base_url" OMNIROUTE_KEY="$api_key" OMNIROUTE_MODEL="$model" node <<'NODE'
import fs from "node:fs";
import path from "node:path";

const file = process.env.PI_MODELS_FILE;
const catalogResponse = await fetch(`${process.env.OMNIROUTE_BASE_URL.replace(/\/$/, "")}/models`, {
  headers: { Authorization: `Bearer ${process.env.OMNIROUTE_KEY}` },
  signal: AbortSignal.timeout(5000),
});
if (!catalogResponse.ok) throw new Error(`OmniRoute catalog returned HTTP ${catalogResponse.status}`);
const catalog = await catalogResponse.json();
const metadata = catalog.data?.find((entry) => entry.id === process.env.OMNIROUTE_MODEL);
if (!metadata) throw new Error(`OmniRoute model not found: ${process.env.OMNIROUTE_MODEL}`);
const supportsImages = metadata.capabilities?.vision || metadata.input_modalities?.includes("image");

const before = fs.existsSync(file) ? fs.readFileSync(file, "utf8") : "";
let config = { providers: {} };
if (before.trim()) config = JSON.parse(before);
if (!config || typeof config !== "object" || Array.isArray(config)) throw new Error(`${file} must contain a JSON object`);
if (!config.providers || typeof config.providers !== "object" || Array.isArray(config.providers)) config.providers = {};

config.providers.omniroute = {
  baseUrl: process.env.OMNIROUTE_BASE_URL,
  api: "openai-completions",
  apiKey: process.env.OMNIROUTE_KEY,
  models: [{
    id: process.env.OMNIROUTE_MODEL,
    name: `OmniRoute ${metadata.name ?? process.env.OMNIROUTE_MODEL}`,
    reasoning: Boolean(metadata.capabilities?.reasoning || metadata.capabilities?.thinking),
    input: supportsImages ? ["text", "image"] : ["text"],
    contextWindow: metadata.context_length ?? 128000,
    // Automatic combos advertise aggregate limits; keep requests below common provider ceilings.
    maxTokens: Math.min(metadata.max_output_tokens ?? 16384, 16384),
  }],
};

const after = `${JSON.stringify(config, null, 2)}\n`;
if (before !== after) {
  if (before) {
    const backup = `${file}.bak.${Date.now()}`;
    fs.copyFileSync(file, backup);
    fs.chmodSync(backup, 0o600);
  }
  const temporary = `${file}.tmp.${process.pid}`;
  fs.writeFileSync(temporary, after, { mode: 0o600 });
  fs.renameSync(temporary, file);
  console.log(`configured: ${file}`);
} else {
  console.log(`already configured: ${file}`);
}
fs.chmodSync(file, 0o600);

const settingsFile = path.join(path.dirname(file), "settings.json");
const settingsBefore = fs.existsSync(settingsFile) ? fs.readFileSync(settingsFile, "utf8") : "";
let settings = {};
if (settingsBefore.trim()) settings = JSON.parse(settingsBefore);
if (!settings || typeof settings !== "object" || Array.isArray(settings)) throw new Error(`${settingsFile} must contain a JSON object`);
// Registering a route must not select it: preserve even absent provider/model defaults.
const retry = settings.retry && typeof settings.retry === "object" && !Array.isArray(settings.retry)
  ? settings.retry
  : {};
// ponytail: 5s clears OmniRoute's transient model lockout before Pi retries the route.
settings.retry = {
  ...retry,
  enabled: typeof retry.enabled === "boolean" ? retry.enabled : true,
  maxRetries: Number.isInteger(retry.maxRetries) ? retry.maxRetries : 3,
  baseDelayMs: Number.isFinite(retry.baseDelayMs) ? retry.baseDelayMs : 5000,
};
const settingsAfter = `${JSON.stringify(settings, null, 2)}\n`;
if (settingsBefore !== settingsAfter) {
  if (settingsBefore) {
    const backup = `${settingsFile}.bak.${Date.now()}`;
    fs.copyFileSync(settingsFile, backup);
    fs.chmodSync(backup, 0o600);
  }
  const temporary = `${settingsFile}.tmp.${process.pid}`;
  fs.writeFileSync(temporary, settingsAfter, { mode: 0o600 });
  fs.renameSync(temporary, settingsFile);
  console.log(`configured: ${settingsFile}`);
}
fs.chmodSync(settingsFile, 0o600);
NODE

if command -v pi >/dev/null 2>&1; then
  pi --no-extensions --no-skills --no-prompt-templates --list-models omniroute >/dev/null
fi

printf '\nOmniRoute is ready for Pi (%s heavy chats).\n' "$max_heavy"
printf 'Run: pi --provider omniroute --model %s\n' "$model"
printf 'Dashboard: %s\n' "${base_url%/v1}"

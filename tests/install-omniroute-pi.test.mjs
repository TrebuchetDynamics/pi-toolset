import assert from "node:assert/strict";
import { execFile } from "node:child_process";
import fs from "node:fs";
import http from "node:http";
import os from "node:os";
import path from "node:path";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const root = path.resolve(new URL("..", import.meta.url).pathname);
const script = path.join(root, "install-omniroute-pi.sh");
const fixture = fs.mkdtempSync(path.join(os.tmpdir(), "omniroute-pi-install-"));
const agentDir = path.join(fixture, "agent");
const omnirouteDir = path.join(fixture, ".omniroute");
const binDir = path.join(fixture, "bin");
const npmLog = path.join(fixture, "npm.log");
const omnirouteLog = path.join(fixture, "omniroute.log");
const serverMarker = path.join(fixture, "server.ready");
fs.mkdirSync(agentDir, { recursive: true });
fs.mkdirSync(omnirouteDir, { recursive: true });
fs.mkdirSync(binDir, { recursive: true });
fs.writeFileSync(
  path.join(omnirouteDir, ".env"),
  "KEEP_ME=yes\nOMNIROUTE_CHAT_MAX_HEAVY_IN_FLIGHT=1\nOMNIROUTE_SERVER_HOST=0.0.0.0\n",
  { mode: 0o600 },
);
fs.writeFileSync(
  path.join(agentDir, "models.json"),
  `${JSON.stringify({ providers: { existing: { models: [{ id: "keep-me" }] } } }, null, 2)}\n`,
);
fs.writeFileSync(
  path.join(agentDir, "settings.json"),
  `${JSON.stringify({ theme: "keep-me", defaultProvider: "existing", defaultModel: "keep-me", retry: { provider: { timeoutMs: 1234 } } }, null, 2)}\n`,
);
fs.writeFileSync(path.join(binDir, "pi"), "#!/bin/sh\nexit 0\n", {
  mode: 0o755,
});
fs.writeFileSync(
  path.join(binDir, "omniroute"),
  '#!/bin/sh\nprintf \'%s|%s\\n\' "$OMNIROUTE_CHAT_MAX_HEAVY_IN_FLIGHT" "$*" >> "$OMNIROUTE_LOG"\ncase "$*" in *"api api-keys post-api-keys"*) printf \'%s\\n\' \'{"key":"generated-key"}\';; esac\ncase "$1" in serve) touch "$SERVER_MARKER";; stop) rm -f "$SERVER_MARKER";; esac\n',
  { mode: 0o755 },
);
fs.writeFileSync(
  path.join(binDir, "npm"),
  '#!/bin/sh\nprintf \'%s\\n\' "$*" >> "$NPM_LOG"\n[ "${NPM_FAIL:-0}" = 1 ] && exit 1\n',
  { mode: 0o755 },
);

let requireDaemonStart = false;
let catalogPath = "/v1/models";
const server = http.createServer(async (request, response) => {
  response.setHeader("content-type", "application/json");
  if (
    request.headers.authorization !== "Bearer fixture-key" &&
    request.headers.authorization !== "Bearer generated-key"
  ) {
    response.statusCode = 401;
    response.end(JSON.stringify({ error: "unauthorized" }));
    return;
  }
  if (request.url === catalogPath) {
    if (requireDaemonStart && !fs.existsSync(serverMarker)) {
      response.statusCode = 503;
      response.end(JSON.stringify({ error: "daemon stopped" }));
      return;
    }
    response.end(
      JSON.stringify({
        data: [
          {
            id: "auto/best-free",
            context_length: 1048576,
            capabilities: { reasoning: true, tool_calling: true },
          },
          {
            id: "oc/deepseek-v4-flash-free",
            context_length: 200000,
            capabilities: { reasoning: true, tool_calling: true },
          },
        ],
      }),
    );
    return;
  }
  response.statusCode = 404;
  response.end(JSON.stringify({ error: "not found" }));
});
await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
const { port } = server.address();
const foreignAuthorizations = [];
const foreignServer = http.createServer((request, response) => {
  foreignAuthorizations.push(request.headers.authorization);
  response.statusCode = 401;
  response.end(JSON.stringify({ error: "unauthorized" }));
});
await new Promise((resolve) => foreignServer.listen(0, "127.0.0.1", resolve));
const { port: foreignPort } = foreignServer.address();

try {
  const env = {
    ...process.env,
    HOME: fixture,
    PATH: `${binDir}:${process.env.PATH}`,
    PI_CODING_AGENT_DIR: agentDir,
    OMNIROUTE_PI_API_KEY: "fixture-key",
    NPM_LOG: npmLog,
    OMNIROUTE_LOG: omnirouteLog,
    SERVER_MARKER: serverMarker,
  };
  const args = [
    script,
    "--config-only",
    "--base-url",
    `http://127.0.0.1:${port}`,
  ];

  const installProbe = path.join(fixture, "install-probe");
  const installProbeBin = path.join(installProbe, "bin");
  const installProbeLog = path.join(installProbe, "npm.log");
  fs.mkdirSync(installProbeBin, { recursive: true });
  fs.writeFileSync(
    path.join(installProbeBin, "npm"),
    '#!/bin/sh\nprintf \'%s\\n\' "$*" >> "$NPM_LOG"\ncase "$*" in *" omniroute") printf \'#!/bin/sh\\nexit 0\\n\' > "$PROBE_BIN/omniroute"; chmod +x "$PROBE_BIN/omniroute";; esac\n',
    { mode: 0o755 },
  );
  fs.symlinkSync(process.execPath, path.join(installProbeBin, "node"));
  await execFileAsync(
    "sh",
    [script, "--base-url", `http://127.0.0.1:${port}/v1`],
    {
      cwd: root,
      env: {
        ...env,
        HOME: installProbe,
        PATH: `${installProbeBin}:/usr/bin:/bin`,
        PI_CODING_AGENT_DIR: path.join(installProbe, "agent"),
        NPM_LOG: installProbeLog,
        PROBE_BIN: installProbeBin,
      },
    },
  );
  assert.deepEqual(
    fs.readFileSync(installProbeLog, "utf8").trim().split("\n"),
    [
      "install -g --ignore-scripts --legacy-peer-deps @earendil-works/pi-coding-agent",
      "install -g --legacy-peer-deps --engine-strict omniroute",
    ],
  );

  // A fresh full installation registers OmniRoute without choosing it for Pi.
  const freshSettings = JSON.parse(fs.readFileSync(path.join(installProbe, "agent/settings.json"), "utf8"));
  assert.equal(Object.hasOwn(freshSettings, "defaultProvider"), false);
  assert.equal(Object.hasOwn(freshSettings, "defaultModel"), false);

  await assert.rejects(
    execFileAsync("sh", args, {
      cwd: root,
      env: { ...env, OMNIROUTE_SERVER_HOST: "bad host" },
    }),
    (error) =>
      error.code === 2 &&
      error.stderr.includes(
        "OMNIROUTE_SERVER_HOST must be a hostname or IP address",
      ),
  );
  await execFileAsync("sh", args, { cwd: root, env });
  const config = JSON.parse(
    fs.readFileSync(path.join(agentDir, "models.json"), "utf8"),
  );
  assert.equal(config.providers.existing.models[0].id, "keep-me");
  assert.equal(
    config.providers.omniroute.baseUrl,
    `http://127.0.0.1:${port}/v1`,
  );
  assert.equal(config.providers.omniroute.apiKey, "fixture-key");
  assert.equal(config.providers.omniroute.models[0].id, "auto/best-free");
  assert.equal(config.providers.omniroute.models[0].contextWindow, 1048576);
  assert.equal(config.providers.omniroute.models[0].maxTokens, 16384);
  assert.deepEqual(config.providers.omniroute.models[0].input, ["text"]);
  assert.equal(
    fs.statSync(path.join(agentDir, "models.json")).mode & 0o777,
    0o600,
  );
  const modelBackups = fs
    .readdirSync(agentDir)
    .filter((name) => name.startsWith("models.json.bak."));
  assert.equal(modelBackups.length, 1);
  assert.equal(
    fs.statSync(path.join(agentDir, modelBackups[0])).mode & 0o777,
    0o600,
  );
  const settings = JSON.parse(
    fs.readFileSync(path.join(agentDir, "settings.json"), "utf8"),
  );
  assert.equal(settings.theme, "keep-me");
  assert.equal(settings.defaultProvider, "existing", "registration must preserve the user's provider");
  assert.equal(settings.defaultModel, "keep-me", "registration must preserve the user's model");
  assert.deepEqual(settings.retry, {
    provider: { timeoutMs: 1234 },
    enabled: true,
    maxRetries: 3,
    baseDelayMs: 5000,
  });
  assert.equal(
    fs.statSync(path.join(agentDir, "settings.json")).mode & 0o777,
    0o600,
  );
  const settingsBackups = fs
    .readdirSync(agentDir)
    .filter((name) => name.startsWith("settings.json.bak."));
  assert.equal(settingsBackups.length, 1);
  assert.equal(
    fs.statSync(path.join(agentDir, settingsBackups[0])).mode & 0o777,
    0o600,
  );
  const envWithoutExplicitKey = { ...env };
  delete envWithoutExplicitKey.OMNIROUTE_PI_API_KEY;
  await execFileAsync("sh", args, {
    cwd: root,
    env: envWithoutExplicitKey,
  });
  assert.equal(
    fs
      .readdirSync(agentDir)
      .filter((name) => name.startsWith("models.json.bak.")).length,
    1,
  );
  assert.equal(
    fs
      .readdirSync(agentDir)
      .filter((name) => name.startsWith("settings.json.bak.")).length,
    1,
  );

  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(agentDir, "settings.json"), "utf8")), settings,
    "rerunning configuration must not change the selected defaults or unrelated settings");

  // Break caught: config-only/custom-route setup fills missing defaults or
  // reselects a model on reruns, including partially configured selections.
  for (const [name, selection] of [
    ["unset", {}],
    ["provider-only", { defaultProvider: "existing" }],
    ["model-only", { defaultModel: "keep-me" }],
    ["omniroute-selected", { defaultProvider: "omniroute", defaultModel: "user-chosen-route" }],
  ]) {
    const selectedAgent = path.join(fixture, `selection-${name}`);
    fs.mkdirSync(selectedAgent);
    fs.writeFileSync(path.join(selectedAgent, "settings.json"), JSON.stringify({ theme: "keep-me", ...selection }));
    for (let run = 0; run < 2; run++) {
      await execFileAsync("sh", [...args, "--model", "oc/deepseek-v4-flash-free"], {
        cwd: root, env: { ...env, PI_CODING_AGENT_DIR: selectedAgent },
      });
      const actual = JSON.parse(fs.readFileSync(path.join(selectedAgent, "settings.json"), "utf8"));
      for (const key of ["defaultProvider", "defaultModel"]) {
        assert.equal(Object.hasOwn(actual, key), Object.hasOwn(selection, key), `${name}: ${key} presence changed`);
        assert.equal(actual[key], selection[key], `${name}: ${key} changed`);
      }
      assert.equal(actual.theme, "keep-me");
      const models = JSON.parse(fs.readFileSync(path.join(selectedAgent, "models.json"), "utf8"));
      assert.equal(models.providers.omniroute.models[0].id, "oc/deepseek-v4-flash-free",
        "--model must still choose which route is registered, not Pi's default");
    }
  }

  const explicitRetryAgent = path.join(fixture, "explicit-retry-agent");
  fs.mkdirSync(explicitRetryAgent);
  fs.writeFileSync(
    path.join(explicitRetryAgent, "settings.json"),
    `${JSON.stringify({ retry: { enabled: false, maxRetries: 0, baseDelayMs: 1000 } }, null, 2)}\n`,
  );
  await execFileAsync("sh", args, {
    cwd: root,
    env: { ...env, PI_CODING_AGENT_DIR: explicitRetryAgent },
  });
  assert.deepEqual(
    JSON.parse(
      fs.readFileSync(path.join(explicitRetryAgent, "settings.json"), "utf8"),
    ).retry,
    { enabled: false, maxRetries: 0, baseDelayMs: 1000 },
    "an explicit global retry policy must be preserved",
  );

  const foreignAgent = path.join(fixture, "foreign-agent");
  fs.mkdirSync(foreignAgent);
  fs.writeFileSync(
    path.join(foreignAgent, "models.json"),
    `${JSON.stringify({ providers: { omniroute: { baseUrl: `http://127.0.0.1:${port}/v1`, apiKey: "fixture-key" } } }, null, 2)}\n`,
  );
  await assert.rejects(
    execFileAsync(
      "sh",
      [
        script,
        "--config-only",
        "--base-url",
        `http://127.0.0.1:${foreignPort}/v1`,
      ],
      {
        cwd: root,
        env: {
          ...env,
          PI_CODING_AGENT_DIR: foreignAgent,
          OMNIROUTE_PI_API_KEY: "",
        },
      },
    ),
  );
  assert.ok(
    foreignAuthorizations.every((value) => value !== "Bearer fixture-key"),
    "a saved key must not be sent to a different origin",
  );

  foreignAuthorizations.length = 0;
  fs.writeFileSync(
    path.join(foreignAgent, "models.json"),
    `${JSON.stringify({ providers: { omniroute: { baseUrl: `http://127.0.0.1:${foreignPort}/v1`, apiKey: "prefix-$SAVED_KEY" } } }, null, 2)}\n`,
  );
  await assert.rejects(
    execFileAsync(
      "sh",
      [
        script,
        "--config-only",
        "--base-url",
        `http://127.0.0.1:${foreignPort}/v1`,
      ],
      {
        cwd: root,
        env: {
          ...env,
          PI_CODING_AGENT_DIR: foreignAgent,
          OMNIROUTE_PI_API_KEY: "",
        },
      },
    ),
  );
  assert.ok(
    foreignAuthorizations.every(
      (value) => value !== "Bearer prefix-$SAVED_KEY",
    ),
    "embedded Pi secret references must not be sent as literal credentials",
  );

  catalogPath = "/models";
  const rootCatalogAgent = path.join(fixture, "root-catalog-agent");
  await execFileAsync(
    "sh",
    [script, "--config-only", "--base-url", `http://127.0.0.1:${port}/v1`],
    { cwd: root, env: { ...env, PI_CODING_AGENT_DIR: rootCatalogAgent } },
  );
  const rootCatalogConfig = JSON.parse(
    fs.readFileSync(path.join(rootCatalogAgent, "models.json"), "utf8"),
  );
  assert.equal(
    rootCatalogConfig.providers.omniroute.baseUrl,
    `http://127.0.0.1:${port}`,
    "the installer must retain a working root-level models endpoint",
  );
  catalogPath = "/v1/models";
  requireDaemonStart = true;
  const fallbackInstall = await execFileAsync(
    "sh",
    [script, "--base-url", `http://127.0.0.1:${port}/v1`],
    { cwd: root, env: { ...env, NPM_FAIL: "1" } },
  );
  assert.match(
    fallbackInstall.stderr,
    /npm refresh failed; continuing with installed OmniRoute/,
  );
  const calls = fs.readFileSync(omnirouteLog, "utf8");
  assert.match(
    calls,
    /^\|stop$/m,
    "changed runtime settings must stop even an unready local daemon",
  );
  assert.match(
    calls,
    /^8\|serve --daemon --no-open$/m,
    "local daemon must allow eight structurally heavy Pi requests",
  );
  assert.match(
    calls,
    /^\|autostart enable$/m,
    "rerunning the installer must refresh stale autostart paths",
  );
  assert.equal(
    fs.readFileSync(path.join(omnirouteDir, ".env"), "utf8"),
    "KEEP_ME=yes\nOMNIROUTE_CHAT_MAX_HEAVY_IN_FLIGHT=8\nOMNIROUTE_SERVER_HOST=127.0.0.1\n",
    "autostart must retain safe local runtime settings",
  );
  assert.equal(
    fs.statSync(path.join(omnirouteDir, ".env")).mode & 0o777,
    0o600,
  );
  assert.equal(
    fs.readFileSync(npmLog, "utf8").trim(),
    "install -g --legacy-peer-deps --engine-strict omniroute",
    "rerunning the installer must refresh OmniRoute for routing fixes",
  );

  fs.writeFileSync(omnirouteLog, "");
  await execFileAsync(
    "sh",
    [script, "--base-url", `http://127.0.0.1:${port}/v1`],
    { cwd: root, env },
  );
  const unchangedRuntimeCalls = fs.readFileSync(omnirouteLog, "utf8");
  assert.match(
    unchangedRuntimeCalls,
    /^\|stop$/m,
    "a refreshed OmniRoute install must replace the running daemon",
  );
  assert.match(
    unchangedRuntimeCalls,
    /^8\|serve --daemon --no-open$/m,
    "the refreshed daemon must start even when runtime settings are unchanged",
  );
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(agentDir, "settings.json"), "utf8")), settings,
    "full installer updates must preserve existing provider/model defaults and settings");
  requireDaemonStart = false;
  fs.writeFileSync(omnirouteLog, "");
  await assert.rejects(
    execFileAsync(
      "sh",
      [
        script,
        "--base-url",
        `http://127.0.0.1:${port}/v1`,
        "--model",
        "missing-route",
      ],
      { cwd: root, env: { ...env, NPM_FAIL: "0" } },
    ),
  );
  assert.doesNotMatch(
    fs.readFileSync(omnirouteLog, "utf8"),
    /api api-keys post-api-keys/,
    "a missing model must not create an unnecessary API key",
  );

  const generatedKeyAgent = path.join(fixture, "generated-key-agent");
  const generatedKeyTmp = path.join(fixture, "generated-key-tmp");
  fs.mkdirSync(generatedKeyTmp);
  const generatedKeyEnv = {
    ...env,
    PI_CODING_AGENT_DIR: generatedKeyAgent,
    TMPDIR: generatedKeyTmp,
  };
  delete generatedKeyEnv.OMNIROUTE_PI_API_KEY;
  await execFileAsync(
    "sh",
    [script, "--base-url", `http://127.0.0.1:${port}/v1`],
    { cwd: root, env: generatedKeyEnv },
  );
  const generatedKeyConfig = JSON.parse(
    fs.readFileSync(path.join(generatedKeyAgent, "models.json"), "utf8"),
  );
  assert.equal(
    generatedKeyConfig.providers.omniroute.apiKey,
    "generated-key",
    "a local install must create a valid OmniRoute client key",
  );
  assert.deepEqual(
    fs.readdirSync(generatedKeyTmp),
    [],
    "temporary API-key output must be removed",
  );

  const pkg = JSON.parse(
    fs.readFileSync(path.join(root, "package.json"), "utf8"),
  );
  assert.ok(pkg.files.includes("install-omniroute-pi.sh"));
} finally {
  server.close();
  foreignServer.close();
  fs.rmSync(fixture, { recursive: true, force: true });
}

console.log("install-omniroute-pi ok");

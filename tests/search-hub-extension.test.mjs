import assert from "node:assert/strict";
import { readFile, rm } from "node:fs/promises";
import { setImmediate } from "node:timers/promises";
import { test } from "node:test";
import {
  boundedOutput,
  isPrivateHost,
  mergeSearchResults,
  normalizePublicUrl,
  parseDuckDuckGoResults,
  readWebPage,
  registerSearchHub,
  runSearch,
  unwrapDuckDuckGoUrl,
} from "../extensions/search-hub/index.js";

const ddgHtml = `
<div class="result results_links">
  <a rel="nofollow" class="result__a" href="//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fdocs">Example &amp; Docs</a>
  <a class="result__snippet">Useful <b>documentation</b>.</a>
</div>
<div class="result results_links">
  <a class='result__a' href='https://example.org/news'>Latest news</a>
  <div class='result__snippet'>Current details.</div>
</div>`;

assert.equal(unwrapDuckDuckGoUrl("//duckduckgo.com/l/?uddg=https%3A%2F%2Fexample.com%2Fdocs"), "https://example.com/docs");
assert.deepEqual(parseDuckDuckGoResults(ddgHtml, 2), [
  { title: "Example & Docs", url: "https://example.com/docs", snippet: "Useful documentation ." },
  { title: "Latest news", url: "https://example.org/news", snippet: "Current details." },
]);
assert.equal(isPrivateHost("127.0.0.2"), true);
assert.equal(isPrivateHost("192.168.1.1"), true);
assert.equal(isPrivateHost("::ffff:127.0.0.1"), true);
assert.equal(isPrivateHost("example.com"), false);
assert.equal(normalizePublicUrl("example.com/docs"), "https://example.com/docs");
assert.throws(() => normalizePublicUrl("http://localhost/admin"), /private or internal/);
assert.throws(() => normalizePublicUrl("https://user:pass@example.com"), /credentials/);
assert.throws(() => normalizePublicUrl("file:\/\/\/etc\/passwd"), /protocol/);

const caseSensitiveResults = mergeSearchResults([
  { backend: "brave", results: [
    { title: "Uppercase path", url: "https://example.com/Report.pdf", snippet: "Uppercase path document." },
    { title: "Mixed-case query", url: "https://example.com/item?id=AbC", snippet: "Mixed-case query item." },
  ] },
  { backend: "searxng", results: [
    { title: "Lowercase path", url: "https://example.com/report.pdf", snippet: "Lowercase path document with different content." },
    { title: "Lowercase query", url: "https://example.com/item?id=abc", snippet: "Lowercase query item with different content." },
  ] },
], 10);
assert.equal(caseSensitiveResults.length, 4, "pathname/query case variants must remain distinct");
for (const expected of [
  { title: "Uppercase path", url: "https://example.com/Report.pdf", snippet: "Uppercase path document.", sources: ["brave"] },
  { title: "Lowercase path", url: "https://example.com/report.pdf", snippet: "Lowercase path document with different content.", sources: ["searxng"] },
  { title: "Mixed-case query", url: "https://example.com/item?id=AbC", snippet: "Mixed-case query item.", sources: ["brave"] },
  { title: "Lowercase query", url: "https://example.com/item?id=abc", snippet: "Lowercase query item with different content.", sources: ["searxng"] },
]) {
  assert.deepEqual(caseSensitiveResults.find(({ url }) => url === expected.url), expected);
}

for (const [firstUrl, equivalentUrl] of [
  ["HTTPS://EXAMPLE.COM/Report.pdf?id=AbC#first", "https://example.com/Report.pdf?id=AbC#second"],
  ["https://example.com/docs/", "https://example.com/docs"],
  ["not-a-url/Report", "not-a-url/report"],
]) {
  assert.deepEqual(mergeSearchResults([
    { backend: "brave", results: [{ title: "Original", url: firstUrl, snippet: "Original description." }] },
    { backend: "searxng", results: [{ title: "Duplicate", url: equivalentUrl, snippet: "Short." }] },
  ], 10), [
    { title: "Original", url: firstUrl, snippet: "Original description.", sources: ["brave", "searxng"] },
  ], `equivalent URLs must combine sources: ${firstUrl} and ${equivalentUrl}`);
}

const fallbackCalls = [];
const fallback = await runSearch({ query: "Pi agent", limit: 2 }, {
  env: { BRAVE_API_KEY: "secret" },
  fetchImpl: async (url, options) => {
    fallbackCalls.push({ url: String(url), options });
    if (String(url).includes("api.search.brave.com")) return new Response("unavailable", { status: 503 });
    return new Response(ddgHtml, { status: 200, headers: { "content-type": "text/html" } });
  },
});
assert.equal(fallback.backend, "combined");
assert.deepEqual(fallback.backends, ["brave", "duckduckgo"]);
assert.equal(fallback.results.length, 2);
assert.match(fallback.errors[0], /^brave: HTTP 503/);
assert.equal(fallbackCalls.length, 2);
assert.match(fallbackCalls[1].url, /\?q=Pi\+agent$/);
assert.equal(fallbackCalls[1].options.method, undefined);

const allSourceCalls = [];
const combined = await runSearch({ query: "Pi agent", limit: 5 }, {
  env: { BRAVE_API_KEY: "secret", SEARCH_HUB_SEARXNG_URL: "https://search.example/" },
  fetchImpl: async (url) => {
    const value = String(url);
    allSourceCalls.push(value);
    if (value.includes("api.search.brave.com")) {
      return Response.json({ web: { results: [
        { title: "Brave docs", url: "https://example.com/docs", description: "A richer Brave description." },
        { title: "Brave only", url: "https://brave.example/result", description: "Brave result." },
      ] } });
    }
    if (value.startsWith("https://search.example/")) {
      return Response.json({ results: [
        { title: "SearXNG news", url: "https://example.org/news", content: "SearXNG result." },
        { title: "SearXNG only", url: "https://searx.example/result", content: "SearXNG-only result." },
      ] });
    }
    return new Response(ddgHtml, { status: 200 });
  },
});
assert.equal(combined.backend, "combined");
assert.deepEqual(combined.backends, ["brave", "searxng", "duckduckgo"]);
assert.equal(allSourceCalls.length, 3);
assert.equal(combined.results.length, 4);
assert.deepEqual(combined.results.find(({ url }) => url === "https://example.com/docs").sources, ["brave", "duckduckgo"]);
assert.deepEqual(combined.results.find(({ url }) => url === "https://example.org/news").sources, ["searxng", "duckduckgo"]);

await assert.rejects(
  () => runSearch({ query: "Pi agent", backend: "brave" }, { env: {}, fetchImpl: async () => new Response() }),
  /BRAVE_API_KEY/,
);
await assert.rejects(
  () => runSearch({ query: "Pi agent", backend: "unknown" }, { env: {} }),
  /Unknown search backend/,
);

await test("pre-aborted search rejects with the caller reason without fetching", async () => {
  const controller = new AbortController();
  const reason = { cancelled: "before dispatch" };
  controller.abort(reason);
  let fetches = 0;
  const pending = runSearch({ query: "Pi agent" }, {
    signal: controller.signal,
    env: { BRAVE_API_KEY: "secret" },
    fetchImpl: async () => {
      fetches += 1;
      return new Response(ddgHtml);
    },
  });
  assert.equal(fetches, 0, "cancelled searches must not dispatch providers");
  await assert.rejects(pending, (error) => error === reason);
});

// Only the external fetch boundary is doubled; provider parsing stays real.
function waitForFetchAbort(_url, { signal }) {
  return new Promise((_resolve, reject) => {
    if (signal.aborted) reject(signal.reason);
    else signal.addEventListener("abort", () => reject(signal.reason), { once: true });
  });
}

await test("caller abort after a provider succeeds rejects instead of returning partial success", async () => {
  const controller = new AbortController();
  const reason = new Error("caller stopped after Brave succeeded");
  const pending = runSearch({ query: "Pi agent" }, {
    signal: controller.signal,
    env: { BRAVE_API_KEY: "secret" },
    fetchImpl: (url, options) => String(url).includes("api.search.brave.com")
      ? Promise.resolve(Response.json({ web: { results: [
        { title: "Brave docs", url: "https://example.com/docs", description: "Useful docs." },
      ] } }))
      : waitForFetchAbort(url, options),
  });
  // Drain the in-memory Brave response's microtasks while DuckDuckGo stays pending.
  await setImmediate();
  controller.abort(reason);
  await assert.rejects(pending, (error) => error === reason);
});

await test("caller abort of every provider preserves its reason instead of aggregating errors", async () => {
  const controller = new AbortController();
  const reason = new DOMException("caller cancelled every provider", "AbortError");
  const pending = runSearch({ query: "Pi agent" }, {
    signal: controller.signal,
    env: { BRAVE_API_KEY: "secret", SEARCH_HUB_SEARXNG_URL: "https://search.example/" },
    fetchImpl: waitForFetchAbort,
  });
  controller.abort(reason);
  await assert.rejects(pending, (error) => error === reason);
});

for (const name of ["AbortError", "TimeoutError"]) {
  await test(`provider-local ${name} with a live caller still returns partial success`, async () => {
    const controller = new AbortController();
    const result = await runSearch({ query: "Pi agent", limit: 1 }, {
      signal: controller.signal,
      env: { BRAVE_API_KEY: "secret" },
      fetchImpl: async (url) => {
        if (String(url).includes("api.search.brave.com")) {
          throw new DOMException("provider stopped", name);
        }
        return new Response(ddgHtml);
      },
    });
    assert.equal(controller.signal.aborted, false);
    assert.deepEqual(result.errors, ["brave: provider stopped"]);
    assert.deepEqual(result.results, [
      { title: "Example & Docs", url: "https://example.com/docs", snippet: "Useful documentation .", sources: ["duckduckgo"] },
    ]);
  });
}

await test("registered web_search rejects caller cancellation and clears its status", async () => {
  const registered = new Map();
  const statuses = [];
  const controller = new AbortController();
  const reason = new Error("cancel registered search");
  registerSearchHub({ registerTool: (tool) => registered.set(tool.name, tool) }, {
    env: {},
    fetchImpl: waitForFetchAbort,
  });
  const pending = registered.get("web_search").execute(
    "cancel-search", { query: "Pi agent" }, controller.signal, undefined,
    { ui: { setStatus: (...args) => statuses.push(args) } },
  );
  controller.abort(reason);
  await assert.rejects(pending, (error) => error === reason);
  assert.deepEqual(statuses, [["search-hub", "searching"], ["search-hub", undefined]]);
});

// A declared overflow must release the body before any reader or parser consumes it.
for (const entry of [
  {
    name: "reader",
    run: (fetchImpl) => readWebPage("https://example.com", { fetchImpl, env: {} }),
    error: "Response exceeds 2097152 bytes",
  },
  ...["duckduckgo", "brave", "searxng"].map((backend) => ({
    name: backend,
    run: (fetchImpl) => runSearch({ query: "Pi agent", backend }, {
      fetchImpl,
      env: { BRAVE_API_KEY: "secret", SEARCH_HUB_SEARXNG_URL: "https://search.example/" },
    }),
    error: `All search backends failed: ${backend}: Response exceeds 2097152 bytes`,
  })),
]) {
  await test(`${entry.name} cancels a declared oversized body once without reading`, async () => {
    let pulls = 0;
    let cancellations = 0;
    const response = new Response(new ReadableStream({
      pull(controller) {
        pulls += 1;
        controller.enqueue(new Uint8Array([97]));
        controller.close();
      },
      cancel() { cancellations += 1; },
    }, { highWaterMark: 0 }), { headers: { "content-length": "2097153" } });
    await assert.rejects(() => entry.run(async () => response), { message: entry.error });
    assert.equal(pulls, 0, "an oversized declaration must be rejected without reading");
    assert.equal(cancellations, 1, "the unused response body must be cancelled exactly once");
  });
}

for (const cleanup of ["throws", "rejects"]) {
  await test(`reader preserves the size error when oversized body cleanup ${cleanup}`, async () => {
    let cancellations = 0;
    const response = new Response(new ReadableStream({
      cancel() {
        cancellations += 1;
        const error = new Error("cleanup failed");
        if (cleanup === "throws") throw error;
        return Promise.reject(error);
      },
    }, { highWaterMark: 0 }), { headers: { "content-length": "2097153" } });
    await assert.rejects(() => readWebPage("https://example.com", {
      env: {}, fetchImpl: async () => response,
    }), { message: "Response exceeds 2097152 bytes" });
    assert.equal(cancellations, 1, "cleanup must be attempted even when it fails");
  });
}

for (const declared of [undefined, "1"]) {
  await test(`reader cancels streamed overflow with ${declared ? "understated" : "absent"} Content-Length`, async () => {
    let pulls = 0;
    let cancellations = 0;
    const chunks = [Buffer.alloc(2097152, "a"), Buffer.from("b")];
    const response = new Response(new ReadableStream({
      pull(controller) {
        const chunk = chunks[pulls++];
        if (chunk) controller.enqueue(chunk);
        else controller.close();
      },
      cancel() { cancellations += 1; },
    }, { highWaterMark: 0 }), {
      headers: declared ? { "content-length": declared } : {},
    });
    await assert.rejects(() => readWebPage("https://example.com", {
      env: {}, fetchImpl: async () => response,
    }), { message: "Response exceeds 2097152 bytes" });
    assert.equal(pulls, 2, "reading must stop at the first chunk exceeding the limit");
    assert.equal(cancellations, 1);
  });
}

for (const declared of [undefined, "2097152"]) {
  await test(`reader accepts exactly 2 MiB with ${declared ? "exact" : "absent"} Content-Length`, async () => {
    const content = "é".repeat(1048576);
    let cancellations = 0;
    const response = new Response(new ReadableStream({
      start(controller) {
        controller.enqueue(Buffer.from(content));
        controller.close();
      },
      cancel() { cancellations += 1; },
    }), { headers: declared ? { "content-length": declared } : {} });
    const result = await readWebPage("https://example.com", {
      env: {}, fetchImpl: async () => response,
    });
    assert.deepEqual(result, { url: "https://example.com/", reader: "jina", content });
    assert.equal(cancellations, 0, "a valid body must be read normally, not cancelled");
  });
}

await test("reader rejects an oversized declaration even when the body is absent", async () => {
  await assert.rejects(() => readWebPage("https://example.com", {
    env: {},
    fetchImpl: async () => new Response(null, { headers: { "content-length": "2097153" } }),
  }), { message: "Response exceeds 2097152 bytes" });
});

await test("auto search cancels an oversized provider body and retains another provider's results", async () => {
  let cancellations = 0;
  const oversized = new Response(new ReadableStream({
    cancel() { cancellations += 1; },
  }, { highWaterMark: 0 }), { headers: { "content-length": "2097153" } });
  const result = await runSearch({ query: "Pi agent", limit: 1 }, {
    env: { BRAVE_API_KEY: "secret" },
    fetchImpl: async (url) => String(url).includes("api.search.brave.com")
      ? oversized
      : new Response(ddgHtml),
  });
  assert.deepEqual(result.errors, ["brave: Response exceeds 2097152 bytes"]);
  assert.deepEqual(result.results, [
    { title: "Example & Docs", url: "https://example.com/docs", snippet: "Useful documentation .", sources: ["duckduckgo"] },
  ]);
  assert.equal(cancellations, 1);
});

const tools = new Map();
const commands = new Map();
const queued = [];
const notices = [];
const statuses = [];
const updates = [];
registerSearchHub({
  registerTool: (tool) => tools.set(tool.name, tool),
  registerCommand: (name, command) => commands.set(name, command),
  sendUserMessage: (content, options) => queued.push({ content, options }),
}, {
  env: {},
  fetchImpl: async (url) => String(url).startsWith("https://r.jina.ai/")
    ? new Response("# Example\n\n" + "line\n".repeat(600), { status: 200 })
    : new Response(ddgHtml, { status: 200 }),
});
assert.deepEqual([...tools.keys()], ["web_search", "web_read"]);
assert.deepEqual([...commands.keys()], ["search-hub"]);

const commandContext = { ui: { notify: (message) => notices.push(message) } };
commands.get("search-hub").handler("", commandContext);
assert.match(notices.at(-1), /Usage: \/search-hub/);
commands.get("search-hub").handler("latest Pi news", commandContext);
assert.match(queued.at(-1).content, /latest Pi news/);
assert.deepEqual(queued.at(-1).options, { deliverAs: "followUp" });

const toolContext = { ui: { setStatus: (...args) => statuses.push(args) } };
const signal = new AbortController().signal;
const searchResult = await tools.get("web_search").execute(
  "search-1",
  { query: "Pi agent", limit: 1 },
  signal,
  (update) => updates.push(update),
  toolContext,
);
assert.equal(searchResult.details.backend, "duckduckgo");
assert.equal(searchResult.details.resultCount, 1);
assert.deepEqual(searchResult.details.backends, ["duckduckgo"]);
assert.match(searchResult.content[0].text, /Sources queried: duckduckgo/);
assert.match(searchResult.content[0].text, /https:\/\/example\.com\/docs/);
assert.equal(updates.at(-1).content[0].text, "Searching...");
assert.deepEqual(statuses.at(-1), ["search-hub", undefined]);

const readResult = await tools.get("web_read").execute(
  "read/1",
  { url: "https://example.com", maxChars: 1000 },
  signal,
  undefined,
  toolContext,
);
assert.equal(readResult.details.reader, "jina");
assert.equal(readResult.details.truncated, true);
assert.match(readResult.content[0].text, /Output truncated/);
assert.match(await readFile(readResult.details.outputFile, "utf8"), /^# Example/);
await rm(readResult.details.outputFile.split("/").slice(0, -1).join("/"), { recursive: true, force: true });

const bounded = await boundedOutput(Array.from({ length: 550 }, (_, index) => `line ${index}`).join("\n"), "lines");
assert.equal(bounded.truncated, true);
assert.equal(bounded.text.split("\n").length <= 502, true);
await rm(bounded.outputFile.split("/").slice(0, -1).join("/"), { recursive: true, force: true });

console.log("search-hub-extension ok");

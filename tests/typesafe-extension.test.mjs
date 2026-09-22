import assert from "node:assert/strict";
import { rm } from "node:fs/promises";
import {
  askSystemOne,
  buildRequest,
  formatAnswers,
  normalizeQuestions,
  registerTypeSafe,
} from "../extensions/typesafe/index.js";

const ticket =
  "Hi, I've been trying to connect my Stripe account for 3 days and it keeps failing. Please help ASAP.";

const questions = {
  department: {
    type: "choice",
    instructions: "Which team should handle this",
    criteria: { billing: "Payment issues", technical: "Bugs" },
  },
  frustration: {
    type: "score",
    instructions: "How frustrated the customer appears",
    criteria: ["Calm", "Frustrated", "Very angry"],
  },
  is_urgent: {
    type: "noul",
    instructions: "Does this message express urgency?",
  },
};

assert.deepEqual(normalizeQuestions(questions), questions);
assert.throws(() => normalizeQuestions({}), /non-empty questions object/);
assert.throws(
  () => normalizeQuestions({ a: { type: "noul" } }),
  /requires instructions/,
);
assert.throws(
  () => normalizeQuestions({ a: { type: "guess", instructions: "x" } }),
  /must have type/,
);
assert.throws(
  () =>
    normalizeQuestions({
      a: { type: "choice", instructions: "x", criteria: {} },
    }),
  /non-empty criteria map/,
);
assert.throws(
  () =>
    normalizeQuestions({
      a: { type: "score", instructions: "x", criteria: ["only one"] },
    }),
  /at least two criteria levels/,
);
assert.throws(
  () => buildRequest({ state: "  ", questions }),
  /requires a state/,
);
assert.deepEqual(buildRequest({ state: ticket, questions }), {
  state: ticket,
  model: "jev-latest",
  questions,
});

const response = {
  model: "jev-latest",
  answers: {
    department: {
      type: "choice",
      choice: "billing",
      probabilities: { billing: 0.84, technical: 0.16 },
      confidence: 0.596,
    },
    frustration: {
      type: "score",
      score: 1.035,
      legend: { 0: "Calm" },
      probabilities: { 1: 1 },
      confidence: 0.842,
    },
    is_urgent: { type: "noul", noul: 0.999 },
  },
  usage: { input_tokens: 312, output_tokens: 48 },
};
const formatted = formatAnswers(response);
assert.match(formatted, /## TypeSafe System One \(jev-latest\)/);
assert.match(formatted, /- department \(choice\): billing/);
assert.match(formatted, /probabilities: billing 0\.840, technical 0\.160/);
assert.match(formatted, /- frustration \(score\): 1\.035/);
assert.match(formatted, /- is_urgent \(noul\): 0\.999/);
assert.match(formatted, /usage: input 312, output 48/);

const requests = [];
const ok = await askSystemOne(buildRequest({ state: ticket, questions }), {
  env: { TYPESAFE_API_KEY: "test-key" },
  fetchImpl: async (url, options) => {
    requests.push({ url: String(url), options });
    return Response.json(response);
  },
});
assert.equal(ok.answers.department.choice, "billing");
assert.equal(requests.length, 1);
assert.equal(requests[0].url, "https://api.typesafe.ai/v1/systemone");
assert.equal(requests[0].options.method, "POST");
assert.equal(requests[0].options.headers.authorization, "Bearer test-key");
assert.deepEqual(JSON.parse(requests[0].options.body).questions, questions);

await assert.rejects(
  () => askSystemOne(buildRequest({ state: ticket, questions }), { env: {} }),
  /TYPESAFE_API_KEY/,
);

let attempts = 0;
const retried = await askSystemOne(buildRequest({ state: ticket, questions }), {
  env: {
    TYPESAFE_API_KEY: "test-key",
    TYPESAFE_BASE_URL: "https://typesafe.example/v1/",
  },
  fetchImpl: async (url) => {
    attempts += 1;
    assert.equal(String(url), "https://typesafe.example/v1/systemone");
    if (attempts === 1)
      return new Response('{"errors":["slow down"]}', { status: 429 });
    return Response.json(response);
  },
});
assert.equal(attempts, 2);
assert.equal(retried.model, "jev-latest");

await assert.rejects(
  () =>
    askSystemOne(buildRequest({ state: ticket, questions }), {
      env: { TYPESAFE_API_KEY: "test-key" },
      fetchImpl: async () =>
        new Response("bad field: api_key=sk-secret", { status: 422 }),
    }),
  (error) =>
    /HTTP 422/.test(error.message) && /\[redacted\]/.test(error.message),
);

const tools = new Map();
const commands = new Map();
const queued = [];
const notices = [];
const statuses = [];
const updates = [];
registerTypeSafe(
  {
    registerTool: (tool) => tools.set(tool.name, tool),
    registerCommand: (name, command) => commands.set(name, command),
    sendUserMessage: (content, options) => queued.push({ content, options }),
  },
  {
    env: { TYPESAFE_API_KEY: "test-key" },
    fetchImpl: async () => Response.json(response),
  },
);
assert.deepEqual([...tools.keys()], ["typesafe"]);
assert.deepEqual([...commands.keys()], ["typesafe"]);

const commandContext = { ui: { notify: (message) => notices.push(message) } };
commands.get("typesafe").handler("", commandContext);
assert.match(notices.at(-1), /Usage: \/typesafe/);
commands.get("typesafe").handler("route these tickets", commandContext);
assert.match(queued.at(-1).content, /route these tickets/);
assert.match(queued.at(-1).content, /typesafe/);
assert.deepEqual(queued.at(-1).options, { deliverAs: "followUp" });

const toolContext = { ui: { setStatus: (...args) => statuses.push(args) } };
const result = await tools
  .get("typesafe")
  .execute(
    "typesafe-1",
    { state: ticket, questions },
    new AbortController().signal,
    (update) => updates.push(update),
    toolContext,
  );
assert.equal(result.details.model, "jev-latest");
assert.equal(result.details.answers.department.choice, "billing");
assert.equal(result.details.truncated, false);
assert.match(result.content[0].text, /is_urgent \(noul\): 0\.999/);
assert.equal(updates.at(-1).content[0].text, "Evaluating with TypeSafe...");
assert.deepEqual(statuses.at(-1), ["typesafe", undefined]);

const huge = {
  model: "jev-latest",
  answers: Object.fromEntries(
    Array.from({ length: 40 }, (_, index) => [
      `question_${index}`,
      {
        type: "choice",
        choice: "billing",
        probabilities: Object.fromEntries(
          Array.from({ length: 60 }, (_, option) => [
            `option_${option}`,
            0.016,
          ]),
        ),
        confidence: 0.5,
      },
    ]),
  ),
};
registerTypeSafe(
  {
    registerTool: (tool) => tools.set(tool.name, tool),
    registerCommand: () => {},
    sendUserMessage: () => {},
  },
  {
    env: { TYPESAFE_API_KEY: "test-key" },
    fetchImpl: async () => Response.json(huge),
  },
);
const bounded = await tools
  .get("typesafe")
  .execute(
    "big/1",
    { state: ticket, questions },
    undefined,
    undefined,
    toolContext,
  );
assert.equal(bounded.details.truncated, true);
assert.match(bounded.content[0].text, /Output truncated/);
await rm(bounded.details.outputFile.split("/").slice(0, -1).join("/"), {
  recursive: true,
  force: true,
});

console.log("typesafe-extension ok");

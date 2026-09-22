import { boundedOutput } from "../search-hub/index.js";

const DEFAULT_BASE_URL = "https://api.typesafe.ai/v1";
const DEFAULT_MODEL = "jev-latest";
const HTTP_TIMEOUT_MS = 60_000;
const MAX_BODY_BYTES = 1024 * 1024;
const MAX_STATE_CHARS = 150_000;
const MAX_QUESTIONS = 60;
const MAX_ATTEMPTS = 3;
const RETRY_DELAYS_MS = [500, 1500];
const RETRY_STATUSES = new Set([429, 529]);
const QUESTION_TYPES = new Set(["choice", "score", "noul"]);

function timeoutSignal(signal, timeoutMs = HTTP_TIMEOUT_MS) {
  const timeout = AbortSignal.timeout(timeoutMs);
  return signal ? AbortSignal.any([signal, timeout]) : timeout;
}

function isContent(value) {
  if (typeof value === "string") return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value) && typeof value === "object";
}

function isPlainObject(value) {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function stateLength(state) {
  return typeof state === "string"
    ? state.length
    : JSON.stringify(state).length;
}

export function normalizeQuestions(questions) {
  if (!isPlainObject(questions) || Object.keys(questions).length === 0)
    throw new Error("typesafe requires a non-empty questions object");
  const ids = Object.keys(questions);
  if (ids.length > MAX_QUESTIONS)
    throw new Error(`typesafe supports at most ${MAX_QUESTIONS} questions`);
  for (const id of ids) {
    const question = questions[id];
    if (!isPlainObject(question))
      throw new Error(`question "${id}" must be an object`);
    if (!QUESTION_TYPES.has(question.type))
      throw new Error(
        `question "${id}" must have type "choice", "score", or "noul"`,
      );
    if (!isContent(question.instructions))
      throw new Error(`question "${id}" requires instructions`);
    if (question.type === "choice") {
      if (
        !isPlainObject(question.criteria) ||
        !Object.keys(question.criteria).length
      )
        throw new Error(
          `choice question "${id}" requires a non-empty criteria map`,
        );
    }
    if (
      question.type === "score" &&
      (!Array.isArray(question.criteria) || question.criteria.length < 2)
    )
      throw new Error(
        `score question "${id}" requires at least two criteria levels`,
      );
  }
  return questions;
}

export function buildRequest({ state, model = DEFAULT_MODEL, questions }) {
  if (!isContent(state))
    throw new Error("typesafe requires a state to evaluate");
  if (stateLength(state) > MAX_STATE_CHARS)
    throw new Error(`typesafe state exceeds ${MAX_STATE_CHARS} characters`);
  return { state, model, questions: normalizeQuestions(questions) };
}

function sanitizeError(error) {
  return String(error?.message ?? error)
    .replace(
      /(authorization|api[-_ ]?key|token)\s*[:=]?\s*[^\s,;]+/gi,
      "$1 [redacted]",
    )
    .slice(0, 400);
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function askSystemOne(
  payload,
  { fetchImpl = fetch, signal, env = process.env } = {},
) {
  const key = env.TYPESAFE_API_KEY;
  if (!key) throw new Error("TypeSafe is not configured; set TYPESAFE_API_KEY");
  const base = (env.TYPESAFE_BASE_URL || DEFAULT_BASE_URL).replace(/\/+$/, "");
  const request = () =>
    fetchImpl(`${base}/systemone`, {
      method: "POST",
      headers: {
        authorization: `Bearer ${key}`,
        "content-type": "application/json",
        accept: "application/json",
      },
      body: JSON.stringify(payload),
      signal: timeoutSignal(signal),
    });

  let response = await request();
  for (let attempt = 1; attempt < MAX_ATTEMPTS; attempt += 1) {
    if (!RETRY_STATUSES.has(response.status)) break;
    try {
      await response.body?.cancel?.();
    } catch {
      // ignoring a failed drain; the next attempt replaces this response
    }
    await sleep(RETRY_DELAYS_MS[attempt - 1] ?? RETRY_DELAYS_MS.at(-1));
    response = await request();
  }

  const text = await response.text();
  if (text.length > MAX_BODY_BYTES)
    throw new Error(`TypeSafe response exceeds ${MAX_BODY_BYTES} bytes`);
  if (!response.ok)
    throw new Error(`TypeSafe HTTP ${response.status}: ${sanitizeError(text)}`);
  try {
    return JSON.parse(text);
  } catch {
    throw new Error("TypeSafe returned invalid JSON");
  }
}

function formatProbabilities(probabilities) {
  if (!isPlainObject(probabilities)) return "";
  return Object.entries(probabilities)
    .map(([key, value]) =>
      typeof value === "number"
        ? `${key} ${value.toFixed(3)}`
        : `${key} ${value}`,
    )
    .join(", ");
}

export function formatAnswers(result) {
  const model = result?.model ?? DEFAULT_MODEL;
  const answers = result?.answers ?? {};
  const lines = [`## TypeSafe System One (${model})`, ""];
  for (const [id, answer] of Object.entries(answers)) {
    if (answer?.type === "choice") {
      lines.push(`- ${id} (choice): ${answer.choice}`);
      if (answer.confidence !== undefined)
        lines.push(`  confidence: ${answer.confidence}`);
      lines.push(
        `  probabilities: ${formatProbabilities(answer.probabilities)}`,
      );
    } else if (answer?.type === "score") {
      lines.push(`- ${id} (score): ${answer.score}`);
      if (answer.confidence !== undefined)
        lines.push(`  confidence: ${answer.confidence}`);
      lines.push(
        `  probabilities: ${formatProbabilities(answer.probabilities)}`,
      );
    } else if (answer?.type === "noul") {
      lines.push(`- ${id} (noul): ${answer.noul}`);
    } else {
      lines.push(`- ${id}: ${JSON.stringify(answer)}`);
    }
  }
  const usage = result?.usage;
  if (usage)
    lines.push(
      "",
      `usage: input ${usage.input_tokens ?? "?"}, output ${usage.output_tokens ?? "?"}`,
    );
  return lines.join("\n");
}

const parameters = {
  type: "object",
  properties: {
    state: {
      anyOf: [{ type: "string" }, { type: "object" }, { type: "array" }],
      description:
        "Content to evaluate: a string, or structured JSON (conversation, record, policy). Reference its keys by path in question instructions.",
    },
    model: {
      type: "string",
      description: `System One model; defaults to ${DEFAULT_MODEL}.`,
    },
    questions: {
      type: "object",
      description:
        "Map of question id to typed question. Ask one narrow judgment per entry; entries are evaluated in parallel.",
      additionalProperties: {
        type: "object",
        properties: {
          type: { type: "string", enum: [...QUESTION_TYPES] },
          instructions: {
            anyOf: [{ type: "string" }, { type: "object" }, { type: "array" }],
            description: "The question to ask about the state.",
          },
          criteria: {
            anyOf: [{ type: "object" }, { type: "array" }],
            description:
              "Choice: map of option to rubric. Score: ordered list of at least two levels. Noul: optional {yes, no} clarification.",
          },
        },
        required: ["type", "instructions"],
        additionalProperties: false,
      },
    },
  },
  required: ["state", "questions"],
  additionalProperties: false,
};

const commandGuidance = [
  "Use the `typesafe` tool to make typed System One judgments with TypeSafe instead of reasoning in prose.",
  "Decompose the request into one narrow question per entry, copy the full option list, and send every question you might need in a single call.",
  "Combine the returned choice/score/noul values and confidence in code or your own logic; ask the user rather than acting when confidence is low.",
  "",
];

export function registerTypeSafe(
  pi,
  { fetchImpl = fetch, env = process.env } = {},
) {
  pi.registerCommand?.("typesafe", {
    description: "Ask TypeSafe System One typed questions about a state",
    handler(args, ctx) {
      const request = String(args ?? "").trim();
      if (!request) {
        ctx.ui.notify("Usage: /typesafe <judgment request>", "info");
        return;
      }
      pi.sendUserMessage([...commandGuidance, request].join("\n"), {
        deliverAs: "followUp",
      });
    },
  });

  pi.registerTool({
    name: "typesafe",
    label: "TypeSafe System One",
    description:
      "Evaluate a state against typed questions with TypeSafe System One (choice, score, noul) and return structured answers, probabilities, and confidence. Requires TYPESAFE_API_KEY.",
    promptSnippet:
      "Make typed TypeSafe System One decisions (choice/score/noul)",
    promptGuidelines: [
      "Use typesafe for fast structured judgments over supplied context (routing, classification, scoring, yes/no checks) when a typed answer beats prose reasoning.",
      "Ask one narrow question per entry with the full option list, and combine the answers in your own logic rather than asking multi-factor questions.",
      "Treat confidence as a second axis: when it is low, escalate or ask the user instead of acting on a near-tie.",
    ],
    parameters,
    async execute(toolCallId, params, signal, onUpdate, ctx) {
      ctx.ui.setStatus("typesafe", "evaluating");
      onUpdate?.({
        content: [{ type: "text", text: "Evaluating with TypeSafe..." }],
      });
      try {
        const payload = buildRequest(params);
        const result = await askSystemOne(payload, { fetchImpl, signal, env });
        const bounded = await boundedOutput(formatAnswers(result), toolCallId);
        return {
          content: [{ type: "text", text: bounded.text }],
          details: {
            model: result.model,
            answers: result.answers,
            usage: result.usage,
            truncated: bounded.truncated,
            outputFile: bounded.outputFile,
          },
        };
      } finally {
        ctx.ui.setStatus("typesafe", undefined);
      }
    },
  });
}

export default function typeSafeExtension(pi) {
  registerTypeSafe(pi);
}

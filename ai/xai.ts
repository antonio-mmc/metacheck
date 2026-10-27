type ResponseJson = {
  output?: {
    type?: string;
    content?: { type?: string; text?: string }[];
  }[];
};

function outputText(body: ResponseJson): string {
  const chunks: string[] = [];
  for (const item of body.output ?? []) {
    for (const part of item.content ?? []) {
      if (part.type === "output_text" && part.text) chunks.push(part.text);
    }
  }
  return chunks.join("\n").trim();
}

/** Drops the key if the error body happens to echo it. */
export function publicModelError(status: number, body: string, key: string): string {
  const redacted = body
    .replaceAll(key, "[redacted]")
    .replace(/xai-[A-Za-z0-9_-]+/g, "[redacted]")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 600);
  return `The model did not answer (${status}). ${redacted}`;
}

/**
 * The only HTTP call to the model.
 * Live Search (`search_parameters`) was removed on 12 Jan 2026: sending it,
 * even with mode off, returns 410. Search stays off by omitting the field
 * and by not attaching web_search. The call text is the only source.
 */
async function postResponses(payload: Record<string, unknown>, signal?: AbortSignal): Promise<ResponseJson> {
  const key = process.env.XAI_API_KEY;
  if (!key) throw new Error("XAI_API_KEY is missing.");
  const model = process.env.XAI_MODEL || "grok-4.7";
  const response = await fetch("https://api.x.ai/v1/responses", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      reasoning: { effort: "low" },
      store: false,
      ...payload,
    }),
    signal,
  });
  if (!response.ok) {
    throw new Error(publicModelError(response.status, await response.text(), key));
  }
  return (await response.json()) as ResponseJson;
}

/** Plain reply. grok-4.7 is served by the Responses API. */
export async function complete(input: { instructions: string; prompt: string }): Promise<string> {
  const body = await postResponses({ instructions: input.instructions, input: input.prompt });
  const text = outputText(body);
  if (!text) throw new Error("The model response had no text.");
  return text;
}

export type ResponseItem = {
  type?: string;
  call_id?: string;
  name?: string;
  arguments?: string;
  content?: { type?: string; text?: string }[];
} & Record<string, unknown>;

export type FunctionCallItem = {
  callId: string;
  name: string;
  arguments: string;
};

export type ToolDefinition = {
  type: "function";
  name: string;
  description: string;
  parameters: Record<string, unknown>;
};

/**
 * One Responses API turn, with function tools and no web search.
 * `store` stays false, so the caller sends prior output back itself.
 */
export async function completeTurn(input: {
  instructions: string;
  input: unknown;
  tools: ToolDefinition[];
  signal?: AbortSignal;
}): Promise<{ output: ResponseItem[]; text: string; calls: FunctionCallItem[] }> {
  const body = await postResponses(
    { instructions: input.instructions, input: input.input, tools: input.tools },
    input.signal,
  );
  const output = (body.output ?? []) as ResponseItem[];
  const calls: FunctionCallItem[] = [];
  for (const item of output) {
    if (item.type !== "function_call" || !item.call_id || !item.name) continue;
    calls.push({
      callId: item.call_id,
      name: item.name,
      arguments: item.arguments ?? "{}",
    });
  }
  return { output, text: outputText({ output }), calls };
}

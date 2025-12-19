// functions/_lib/openai.ts

export interface OpenAIUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export interface OpenAIResult {
  reply: string;
  usage: OpenAIUsage;
}

/** OpenAI message 型別（符合你現在用法） */
export type OpenAIMessage =
  | { role: "system" | "assistant" | "user"; content: string }
  | {
      role: "user";
      content: (
        | { type: "text"; text: string }
        | { type: "image_url"; image_url: { url: string } }
      )[];
    };

export async function callOpenAI(params: {
  apiKey: string;
  messages: OpenAIMessage[];
}): Promise<OpenAIResult> {
  const response = await fetch(
    "https://api.openai.com/v1/chat/completions",
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${params.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.3,
        // max_tokens: 400,
        messages: params.messages
      })
    }
  );

  if (!response.ok) {
    const text = await response.text();
    throw new Error(
      `OpenAI error ${response.status}: ${text}`
    );
  }

  const data = (await response.json()) as {
    choices?: { message?: { content?: string } }[];
    usage?: {
      prompt_tokens?: number;
      completion_tokens?: number;
      total_tokens?: number;
    };
  };

  const reply =
    data.choices?.[0]?.message?.content ?? "";

  const usage: OpenAIUsage = {
    input_tokens: data.usage?.prompt_tokens ?? 0,
    output_tokens: data.usage?.completion_tokens ?? 0,
    total_tokens: data.usage?.total_tokens ?? 0
  };

  return { reply, usage };
}

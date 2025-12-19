// functions/api/chat.ts

import {
  callOpenAI,
  OpenAIMessage
} from "../_lib/openai";

export interface Env {
  OPENAI_API_KEY: string;
}

interface HistoryMessage {
  role: "user" | "assistant";
  content: string;
}

interface UploadedFile {
  name: string;
  type?: string;
  data: string;
}

interface ChatRequestBody {
  message?: string;
  file?: UploadedFile | null;
  context?: string | null;
  history?: HistoryMessage[];
}

export async function onRequestPost(
  context: {
    request: Request;
    env: Env;
  }
): Promise<Response> {
  const { request, env } = context;

  const ip =
    request.headers.get("cf-connecting-ip") ?? "unknown";

  console.log("[chat] request start", {
    ip,
    time: new Date().toISOString()
  });

  try {
    if (!env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Server not configured" }),
        { status: 500 }
      );
    }

    const body = (await request.json()) as ChatRequestBody;

    const message = (body.message ?? "").trim();
    const file = body.file ?? null;
    const contextText = body.context ?? null;
    const history = Array.isArray(body.history)
      ? body.history
      : [];

    if (!message && !file && !contextText) {
      return new Response(
        JSON.stringify({ error: "Message or file is required" }),
        { status: 400 }
      );
    }

    const historyMessages: OpenAIMessage[] = history
      .slice(-20)
      .map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content)
      }));

    const chatMessages: OpenAIMessage[] = [
      {
        role: "system",
        content:
          "請用該領域前1%的專業水準，簡潔且具體地回答使用者的問題，並提供實用的建議。"
      },
      ...historyMessages
    ];

    if (contextText) {
      chatMessages.push({
        role: "assistant",
        content: contextText
      });
    }

    if (file) {
      if (file.type?.startsWith("image/")) {
        chatMessages.push({
          role: "user",
          content: [
            {
              type: "text",
              text: message || "請分析並描述這張圖片。"
            },
            {
              type: "image_url",
              image_url: {
                url: `data:${file.type};base64,${file.data}`
              }
            }
          ]
        });
      } else {
        chatMessages.push({
          role: "user",
          content: message
            ? `請參考下列檔案內容回答：\n${message}\n\n<file:${file.name}>\n${file.data.slice(
                0,
                4000
              )}`
            : `以下是檔案「${file.name}」內容（Base64，截斷）：\n${file.data.slice(
                0,
                4000
              )}`
        });
      }
    } else if (message) {
      chatMessages.push({
        role: "user",
        content: message
      });
    }

    const { reply, usage } = await callOpenAI({
      apiKey: env.OPENAI_API_KEY,
      messages: chatMessages
    });

    console.log("[chat] usage", { ip, ...usage });

    return new Response(
      JSON.stringify({
        reply,
        usage
      }),
      { headers: { "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("[chat] error", {
      ip,
      error: err instanceof Error ? err.message : err
    });
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

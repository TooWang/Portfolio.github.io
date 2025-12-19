export async function onRequestPost(context) {
  const { request, env } = context;

  const ip = request.headers.get("cf-connecting-ip") || "unknown";
  console.log("[chat] request start", { ip, time: new Date().toISOString() });

  try {
    if (!env.OPENAI_API_KEY) {
      console.error("[chat] missing OPENAI_API_KEY", { ip });
      return new Response(JSON.stringify({ error: "Server not configured" }), { status: 500 });
    }

    const body = await request.json();
    const message = (body.message || "").trim();
    const file = body.file || null;
    const contextText = body.context || null;
    const history = Array.isArray(body.history) ? body.history : [];

    console.log("[chat] input", {
      ip,
      textLength: message.length,
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type
    });

    if (!message && !file && !contextText) {
      return new Response(JSON.stringify({ error: "Message or file is required" }), { status: 400 });
    }

    const historyMessages = history
      .slice(-20)
      .map(m => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: typeof m.content === "string" ? m.content : String(m.content)
      }));

    const chatMessages = [
      { role: "system", content: "請用該領域前1%的專業水準，簡潔且具體地回答使用者的問題，並提供實用的建議。" },
      ...historyMessages
    ];

    if (contextText) {
      // 將先前的檔案分析內容放入對話脈絡
      chatMessages.push({ role: "assistant", content: contextText });
    }

    if (file) {
      if (file.type?.startsWith("image/")) {
        chatMessages.push({
          role: "user",
          content: [
            { type: "text", text: message ? message : "請分析並描述這張圖片。" },
            { type: "image_url", image_url: { url: `data:${file.type};base64,${file.data}` } }
          ]
        });
      } else {
        chatMessages.push({
          role: "user",
          content: message
            ? `請參考下列檔案內容回答：\n${message}\n\n<file:${file.name}>\n${file.data.slice(0,4000)}`
            : `以下是檔案「${file.name}」內容（Base64，截斷）：\n${file.data.slice(0,4000)}`
        });
      }
    } else if (message) {
      chatMessages.push({ role: "user", content: message });
    }

    const openaiResponse = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        temperature: 0.3,
        max_tokens: 400,
        messages: chatMessages
      })
    });

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("[chat] openai error", { ip, status: openaiResponse.status, errorText });
      return new Response(JSON.stringify({ error: "AI service error" }), { status: 502 });
    }

    const data = await openaiResponse.json();
    const reply = data.choices?.[0]?.message?.content;

    console.log("[chat] success", { ip, replyLength: reply?.length });

    return new Response(JSON.stringify({ reply }), { headers: { "Content-Type": "application/json" } });
  } catch (err) {
    console.error("[chat] unhandled error", { ip, error: err?.message || err });
    return new Response(JSON.stringify({ error: "Internal server error" }), { status: 500 });
  }
}

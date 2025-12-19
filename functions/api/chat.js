export async function onRequestPost(context) {
  const { request, env } = context;

  // Get client IP
  const ip = request.headers.get("cf-connecting-ip") || "unknown";

  console.log("[chat] request start", {
    ip,
    time: new Date().toISOString()
  });

  try {
    // Check OpenAI API key
    if (!env.OPENAI_API_KEY) {
      console.error("[chat] missing OPENAI_API_KEY", { ip });
      return new Response(
        JSON.stringify({ error: "Server not configured" }),
        { status: 500 }
      );
    }

    // Parse request body
    const body = await request.json();
    const message = (body.message || "").trim();
    const file = body.file || null;

    console.log("[chat] input", {
      ip,
      textLength: message.length,
      hasFile: !!file,
      fileName: file?.name,
      fileType: file?.type
    });

    // Basic validation
    if (!message && !file) {
      return new Response(
        JSON.stringify({ error: "Message or file is required" }),
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return new Response(
        JSON.stringify({ error: "Message too long" }),
        { status: 400 }
      );
    }

    // Build user messages
    const userMessages = [];

    if (message) {
      userMessages.push({
        role: "user",
        content: message
      });
    }

    if (file) {
      // Image handling (Vision)
      if (file.type && file.type.startsWith("image/")) {
        userMessages.push({
          role: "user",
          content: [
            { type: "text", text: "請分析並解釋這張圖片的內容。" },
            {
              type: "image_url",
              image_url: {
                url: `data:${file.type};base64,${file.data}`
              }
            }
          ]
        });
      } else {
        // Other file types (text / pdf etc.)
        userMessages.push({
          role: "user",
          content:
            `以下是檔案「${file.name}」的內容（Base64，已截斷），` +
            `請摘要重點並說明用途：\n\n` +
            file.data.slice(0, 4000)
        });
      }
    }

    // Call OpenAI API
    const openaiResponse = await fetch(
      "https://api.openai.com/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "gpt-4.1-mini",
          temperature: 0.3,
          max_tokens: 400,
          messages: [
            {
              role: "system",
              content:
                "請用該領域前1%的專業水準，簡潔且具體地回答使用者的問題，並提供實用的建議。"
            },
            ...userMessages
          ]
        })
      }
    );

    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("[chat] openai error", {
        ip,
        status: openaiResponse.status,
        errorText
      });

      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 502 }
      );
    }

    const data = await openaiResponse.json();
    const reply = data.choices?.[0]?.message?.content;

    console.log("[chat] success", {
      ip,
      replyLength: reply?.length
    });

    return new Response(
      JSON.stringify({ reply }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    console.error("[chat] unhandled error", {
      ip,
      error: err?.message || err
    });

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

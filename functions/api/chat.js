console.log("OPENAI_API_KEY:", env.OPENAI_API_KEY);

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    // 1. 基本防呆
    if (!env.OPENAI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "Server not configured" }),
        { status: 500 }
      );
    }

    // 2. 解析請求
    const body = await request.json();
    const message = (body.message || "").trim();

    // 3. 輸入限制（免費方案一定要有）
    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400 }
      );
    }

    if (message.length > 1000) {
      return new Response(
        JSON.stringify({ error: "Message too long" }),
        { status: 400 }
      );
    }

    // 4. 呼叫 OpenAI
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
          messages: [
            { role: "system", content: "你是網站客服助理" },
            { role: "user", content: message }
          ],
          max_tokens: 300,
          temperature: 0.3
        })
      }
    );


    if (!openaiResponse.ok) {
      const errorText = await openaiResponse.text();
      console.error("OpenAI API error:", errorText);

      return new Response(
        JSON.stringify({ error: "AI service error" }),
        { status: 502 }
      );
    }

    const data = await openaiResponse.json();
    const reply = data.choices?.[0]?.message?.content;

    if (!reply) {
      return new Response(
        JSON.stringify({ error: "Invalid AI response" }),
        { status: 500 }
      );
    }

    // 5. 回傳給前端
    return new Response(
      JSON.stringify({ reply }),
      {
        headers: { "Content-Type": "application/json" }
      }
    );

  } catch (err) {
    console.error("Unhandled error:", err);

    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500 }
    );
  }
}

export async function onRequestPost(context) {
  const { request, env } = context;

  //Get client IP
  const ip = request.headers.get("cf-connecting-ip") || "unknown";

  console.log("[chat] request start", {
    ip,
    time: new Date().toISOString()
  });

  try {
    //Check OpenAI API key
    if (!env.OPENAI_API_KEY) {
      console.error("[chat] missing OPENAI_API_KEY", { ip });
      return new Response(
        JSON.stringify({ error: "Server not configured" }),
        { status: 500 }
      );
    }

    //Analyze request body
    const body = await request.json();
    const message = (body.message || "").trim();

    console.log("[chat] input", {
      ip,
      length: message.length,
      preview: message.slice(0, 50)
    });

    //Basic validation
    if (!message) {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400 }
      );
    }

    if (message.length > 500) {
      return new Response(
        JSON.stringify({ error: "Message too long" }),
        { status: 400 }
      );
    }

    //Call OpenAI API
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
          max_tokens: 300,
          messages: [
            {
              role: "system",
              content:
                "請用該領域前1%的專業水準，簡潔且具體地回答使用者的問題，並提供實用的建議。"
            },
            {
              role: "user",
              content: message
            }
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

    // 6. 回傳結果
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

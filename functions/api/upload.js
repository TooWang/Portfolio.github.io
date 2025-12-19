export async function onRequestPost(context) {
  const { request } = context;
  const ip = request.headers.get("cf-connecting-ip") || "unknown";

  console.log("[upload] request start", {
    ip,
    time: new Date().toISOString()
  });

  try {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return new Response(
        JSON.stringify({ error: "Invalid content type" }),
        { status: 400 }
      );
    }

    const formData = await request.formData();
    const file = formData.get("file");

    if (!file) {
      return new Response(
        JSON.stringify({ error: "File is required" }),
        { status: 400 }
      );
    }

    // Basic file info
    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.type;

    console.log("[upload] file info", {
      ip,
      fileName,
      fileSize,
      fileType
    });

    // Document size limit: 5MB
    if (fileSize > 5 * 1024 * 1024) {
      return new Response(
        JSON.stringify({ error: "File too large (max 5MB)" }),
        { status: 400 }
      );
    }

    // Allowed file types whitelist
    const allowedTypes = [
      "application/pdf",
      "text/plain"
    ];

    if (!allowedTypes.includes(fileType)) {
      return new Response(
        JSON.stringify({ error: "Unsupported file type" }),
        { status: 400 }
      );
    }

    // File accepted
    console.log("[upload] accepted", { ip, fileName });

    return new Response(
      JSON.stringify({
        success: true,
        file: {
          name: fileName,
          size: fileSize,
          type: fileType
        }
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (err) {
    console.error("[upload] error", {
      ip,
      error: err?.message || err
    });

    return new Response(
      JSON.stringify({ error: "Upload failed" }),
      { status: 500 }
    );
  }
}

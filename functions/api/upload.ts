export interface UploadContext {
  request: Request;
  env?: unknown;
}

interface FileInfo {
  name: string;
  size: number;
  type: string;
}

interface SuccessResponse {
  success: true;
  file: FileInfo;
}

interface ErrorResponse {
  error: string;
}

function jsonResponse(body: SuccessResponse | ErrorResponse, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["application/pdf", "text/plain"] as const;

type AllowedType = (typeof ALLOWED_TYPES)[number];

export async function onRequestPost(context: UploadContext): Promise<Response> {
  const { request } = context;
  const ip = request.headers.get("cf-connecting-ip") || "unknown";

  console.log("[upload] request start", { ip, time: new Date().toISOString() });

  try {
    const contentType = request.headers.get("content-type") || "";

    if (!contentType.includes("multipart/form-data")) {
      return jsonResponse({ error: "Invalid content type" }, 400);
    }

    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return jsonResponse({ error: "File is required" }, 400);
    }

    const fileName = file.name;
    const fileSize = file.size;
    const fileType = file.type;

    console.log("[upload] file info", { ip, fileName, fileSize, fileType });

    if (fileSize > MAX_FILE_SIZE) {
      return jsonResponse({ error: "File too large (max 5MB)" }, 400);
    }

    const isAllowedType = ALLOWED_TYPES.includes(fileType as AllowedType);
    if (!isAllowedType) {
      return jsonResponse({ error: "Unsupported file type" }, 400);
    }

    console.log("[upload] accepted", { ip, fileName });

    return jsonResponse({
      success: true,
      file: { name: fileName, size: fileSize, type: fileType }
    });
  } catch (err) {
    console.error("[upload] error", { ip, error: (err as Error)?.message || err });
    return jsonResponse({ error: "Upload failed" }, 500);
  }
}

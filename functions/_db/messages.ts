// Cloudflare D1 Database types
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  meta?: Record<string, unknown>;
}

export async function insertMessage(
  db: D1Database,
  conversationId: string,
  role: "user" | "assistant",
  content: string
) {
  await db.prepare(
    "INSERT INTO messages (conversation_id, role, content) VALUES (?, ?, ?)"
  ).bind(conversationId, role, content).run();
}

export async function getRecentMessages(
  db: D1Database,
  conversationId: string,
  limit = 6
) {
  const { results } = await db.prepare(
    "SELECT role, content FROM messages WHERE conversation_id = ? ORDER BY created_at DESC LIMIT ?"
  ).bind(conversationId, limit).all();
  return (results || []).reverse();
}

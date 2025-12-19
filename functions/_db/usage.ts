// Cloudflare D1 Database types
interface D1Database {
  prepare(query: string): D1PreparedStatement;
}

interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  run(): Promise<D1Result>;
}

interface D1Result {
  success: boolean;
  meta?: Record<string, unknown>;
}

export async function insertUsage(
  db: D1Database,
  conversationId: string,
  input_tokens: number,
  output_tokens: number,
  total_tokens: number
) {
  await db.prepare(
    "INSERT INTO usage (conversation_id, input_tokens, output_tokens, total_tokens) VALUES (?, ?, ?, ?)"
  ).bind(conversationId, input_tokens, output_tokens, total_tokens).run();
}

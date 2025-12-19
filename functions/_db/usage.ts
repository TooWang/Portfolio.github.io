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

export interface UsageStats {
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  conversation_count: number;
  estimated_cost_usd: number;
}

export async function getUsageStats(db: D1Database): Promise<UsageStats> {
  const result = await db.prepare(
    "SELECT SUM(input_tokens) as total_input, SUM(output_tokens) as total_output, SUM(total_tokens) as total, COUNT(DISTINCT conversation_id) as conv_count FROM usage"
  ).all<{
    total_input: number | null;
    total_output: number | null;
    total: number | null;
    conv_count: number;
  }>();

  const row = result.results?.[0];
  const totalInputTokens = row?.total_input ?? 0;
  const totalOutputTokens = row?.total_output ?? 0;
  const totalTokens = row?.total ?? 0;
  const conversationCount = row?.conv_count ?? 0;

  // GPT-4o mini pricing: $0.15/1M input tokens, $0.60/1M output tokens
  const inputCost = (totalInputTokens / 1_000_000) * 0.15;
  const outputCost = (totalOutputTokens / 1_000_000) * 0.60;
  const estimatedCostUsd = inputCost + outputCost;

  return {
    total_input_tokens: totalInputTokens,
    total_output_tokens: totalOutputTokens,
    total_tokens: totalTokens,
    conversation_count: conversationCount,
    estimated_cost_usd: parseFloat(estimatedCostUsd.toFixed(4))
  };
}

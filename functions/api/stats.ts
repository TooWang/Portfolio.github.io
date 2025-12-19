// functions/api/stats.ts

import { getUsageStats } from "../_db/usage";

// 從 _db/usage 共用的類型定義
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

export interface Env {
  OPENAI_API_KEY: string;
  DB?: D1Database;
}

interface UsageStats {
  total_input_tokens: number;
  total_output_tokens: number;
  total_tokens: number;
  conversation_count: number;
  estimated_cost_usd: number;
}

export async function onRequestGet(
  context: {
    request: Request;
    env: Env;
  }
): Promise<Response> {
  const { request, env } = context;

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";

  console.log("[stats] request start", {
    ip,
    time: new Date().toISOString()
  });

  try {
    if (!env.DB) {
      return new Response(
        JSON.stringify({ error: "Database not configured" }),
        { status: 500 }
      );
    }

    const stats = await getUsageStats(env.DB);

    console.log("[stats] retrieved stats", {
      ip,
      ...stats
    });

    return new Response(JSON.stringify(stats), {
      headers: { "Content-Type": "application/json" }
    });
  } catch (err) {
    console.error("[stats] error", {
      ip,
      error: err instanceof Error ? err.message : err
    });

    return new Response(
      JSON.stringify({
        error: "Failed to retrieve statistics",
        total_input_tokens: 0,
        total_output_tokens: 0,
        total_tokens: 0,
        conversation_count: 0,
        estimated_cost_usd: 0
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}

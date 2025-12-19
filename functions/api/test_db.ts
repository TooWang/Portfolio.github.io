// functions/api/test-db.ts
export async function onRequestGet({ env }: { env: any }) {
  const result = await env.DB
    .prepare("SELECT 1 AS ok")
    .first();

  return new Response(JSON.stringify(result));
}

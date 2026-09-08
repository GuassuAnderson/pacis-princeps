import "server-only";
import { ZodError } from "zod";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

export function checkOrigin(request: Request) {
  const origin = request.headers.get("origin");
  const expected = process.env.SITE_URL ? new URL(process.env.SITE_URL).origin : new URL(request.url).origin;
  if (!origin || origin !== expected) throw new HttpError(403, "Origem da solicitação não permitida.");
}

export async function limitedBody(request: Request, limit: number) {
  if (Number(request.headers.get("content-length")) > limit) throw new HttpError(413, "Arquivo ou solicitação acima do limite permitido.");
  const reader = request.body?.getReader();
  if (!reader) throw new HttpError(400, "Solicitação vazia.");
  const chunks: Uint8Array[] = [];
  let size = 0;
  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.length;
      if (size > limit) { await reader.cancel(); throw new HttpError(413, "Arquivo ou solicitação acima do limite permitido."); }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  return Buffer.concat(chunks);
}

export async function readJson(request: Request) {
  if (!request.headers.get("content-type")?.startsWith("application/json")) throw new HttpError(415, "Envie os dados no formato JSON.");
  try { return JSON.parse((await limitedBody(request, 64 * 1024)).toString("utf8")) as unknown; }
  catch (error) { if (error instanceof HttpError) throw error; throw new HttpError(400, "Dados inválidos."); }
}

export function json(data: unknown, status = 200) {
  return Response.json(data, { status, headers: { "Cache-Control": "no-store" } });
}

export function apiError(error: unknown, unavailableMessage = "Não foi possível acessar o banco. Tente novamente; se persistir, confira a conexão e a migração do Supabase.") {
  if (error instanceof HttpError) return json({ error: error.message }, error.status);
  if (error instanceof ZodError) return json({ error: error.issues[0]?.message || "Confira os dados informados." }, 400);
  // Do not send database internals or credentials to the browser.
  console.error("[catalog]", error instanceof Error ? error.name : "Database request failed");
  return json({ error: unavailableMessage }, 503);
}

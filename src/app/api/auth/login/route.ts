import bcrypt from "bcryptjs";
import { createHash } from "node:crypto";
import { z } from "zod";
import { database } from "@/lib/server/database";
import { startSession } from "@/lib/server/auth";
import { apiError, checkOrigin, HttpError, json, readJson } from "@/lib/server/http";

export async function POST(request: Request) {
  try {
    checkOrigin(request);
    const input = z.object({ email: z.string().trim().toLowerCase().pipe(z.email().max(255)), senha: z.string().min(1).refine(value=>Buffer.byteLength(value)<=72,"Senha acima do limite permitido.") }).parse(await readJson(request));
    const db = database();
    const { data: allowed, error: throttleError } = await db.rpc("consume_admin_login_attempt", { attempt_key: createHash("sha256").update(input.email).digest("hex") });
    if (throttleError) throw throttleError;
    if (!allowed) throw new HttpError(429, "Muitas tentativas. Aguarde 15 minutos antes de tentar novamente.");
    const { data: user, error } = await db.from("users").select("id,password_hash,role,active").eq("email", input.email).maybeSingle();
    if (error) throw error;
    // Always compare a valid hash, even when the account doesn't exist.
    const hash = user?.password_hash || "$2b$12$R9h/cIPz0gi.URNNX3kh2OPST9/PgBkqquzi.Ss7KIUgO2t0jWMUW";
    const valid = await bcrypt.compare(input.senha, hash);
    if (!valid || !user?.active || user.role !== "ADMIN") throw new HttpError(401, "E-mail ou senha inválidos, ou conta sem acesso ao painel.");
    await startSession(user.id);
    return json({ ok: true });
  } catch (error) { return apiError(error); }
}

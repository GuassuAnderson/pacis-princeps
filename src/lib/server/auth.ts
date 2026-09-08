import "server-only";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";
import { randomUUID } from "node:crypto";
import { database } from "./database";
import { HttpError } from "./http";

export const SESSION_COOKIE = "pp_admin_session";
const LIFETIME = 8 * 60 * 60;
function secret() {
  const value = process.env.JWT_SECRET;
  if (!value || value.length < 32) throw new Error("Configure JWT_SECRET com pelo menos 32 caracteres.");
  return new TextEncoder().encode(value);
}

export async function sessionClaims() {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try { return (await jwtVerify(token, secret(), { algorithms: ["HS256"], issuer: "pacis-admin", audience: "pacis-store" })).payload; }
  catch { return null; }
}

export async function currentAdmin() {
  const claims = await sessionClaims();
  if (!claims?.sub || !claims.jti) return null;
  const db = database();
  const { data: session, error } = await db.from("admin_sessions").select("user_id").eq("id", claims.jti).eq("user_id", claims.sub).gt("expires_at", new Date().toISOString()).maybeSingle();
  if (error) throw error;
  if (!session) return null;
  const { data: user, error: userError } = await db.from("users").select("id,name,email,role,active").eq("id", claims.sub).eq("role", "ADMIN").eq("active", true).maybeSingle();
  if (userError) throw userError;
  return user as { id: string; name: string; email: string } | null;
}

export async function requireAdmin() {
  const user = await currentAdmin();
  if (!user) throw new HttpError(401, "Sua sessão expirou. Entre novamente no painel.");
  return user;
}

export async function startSession(userId: string) {
  const id = randomUUID();
  const key = secret();
  const { error } = await database().from("admin_sessions").insert({ id, user_id: userId, expires_at: new Date(Date.now() + LIFETIME * 1000).toISOString() });
  if (error) throw error;
  const token = await new SignJWT({}).setProtectedHeader({ alg: "HS256" }).setSubject(userId).setJti(id).setIssuer("pacis-admin").setAudience("pacis-store").setIssuedAt().setExpirationTime(`${LIFETIME}s`).sign(key);
  (await cookies()).set(SESSION_COOKIE, token, { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: LIFETIME });
}

export async function endSession() {
  const claims = await sessionClaims();
  if (claims?.jti) {
    const { error } = await database().from("admin_sessions").delete().eq("id", claims.jti).eq("user_id", claims.sub!);
    if (error) throw error;
  }
  (await cookies()).delete(SESSION_COOKIE);
}

import { endSession } from "@/lib/server/auth";
import { apiError, checkOrigin, json } from "@/lib/server/http";
export async function POST(request: Request) {
  try { checkOrigin(request); await endSession(); return json({ ok: true }); }
  catch (error) { return apiError(error); }
}

import { listConnections } from '@/lib/server/connections';
import { apiError,json } from '@/lib/server/http';
export async function GET(request: Request) {
  try { return json(await listConnections(Object.fromEntries(new URL(request.url).searchParams))); }
  catch(error) { return apiError(error,'Não foi possível carregar as edições. Tente novamente em instantes.'); }
}

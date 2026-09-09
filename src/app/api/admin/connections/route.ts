import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/server/auth';
import { apiError,checkOrigin,json,readJson } from '@/lib/server/http';
import { connectionInput } from '@/lib/connection-validation';
import { listConnections,saveConnection } from '@/lib/server/connections';
const message = 'Não foi possível acessar as edições. Confira a conexão e a migração de Conexão no Supabase.';
export async function GET(request: Request) {
  try { await requireAdmin(); return json(await listConnections(Object.fromEntries(new URL(request.url).searchParams),true)); }
  catch(error) { return apiError(error,message); }
}
export async function POST(request: Request) {
  try {
    checkOrigin(request); const admin=await requireAdmin();
    const input=connectionInput.parse(await readJson(request));
    const id=await saveConnection(input,admin.id);
    revalidatePath('/conexao'); revalidatePath('/admin/conexao');
    return json({id},input.updatedAt ? 200 : 201);
  } catch(error) { return apiError(error,message); }
}

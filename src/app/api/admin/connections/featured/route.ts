import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { requireAdmin } from '@/lib/server/auth';
import { database } from '@/lib/server/database';
import { apiError, checkOrigin, HttpError, json, readJson } from '@/lib/server/http';

const input = z.object({ id:z.uuid(), featured:z.boolean(), updatedAt:z.iso.datetime({offset:true}) });
export async function POST(request:Request) {
  try {
    checkOrigin(request);
    const admin=await requireAdmin();
    const value=input.parse(await readJson(request));
    const {error}=await database().rpc('set_connection_featured',{
      target:value.id,selected:value.featured,expected:value.updatedAt,actor_id:admin.id,
    });
    if(error){
      if(error.code==='40001')throw new HttpError(409,'Esta edição foi alterada. Recarregue a lista e tente novamente.');
      if(error.code==='P0002')throw new HttpError(404,'Edição não encontrada.');
      if(error.code==='22023')throw new HttpError(400,'Publique a edição antes de colocá-la em destaque.');
      throw error;
    }
    revalidatePath('/conexao');revalidatePath('/admin/conexao');
    return json({id:value.id});
  }catch(error){return apiError(error);}
}

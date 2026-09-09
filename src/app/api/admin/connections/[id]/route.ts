import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/server/auth';
import { database } from '@/lib/server/database';
import { apiError,checkOrigin,HttpError,json,readJson } from '@/lib/server/http';
export async function DELETE(request: Request, context: {params:Promise<{id:string}>}) {
  try {
    checkOrigin(request); await requireAdmin();
    const id=z.uuid().parse((await context.params).id);
    const {updatedAt}=z.object({updatedAt:z.iso.datetime({offset:true})}).strict().parse(await readJson(request));
    const {data,error}=await database().from('connections').update({active:false,published:false}).eq('id',id).eq('active',true).eq('updated_at',updatedAt).select('id').maybeSingle();
    if(error)throw error;
    if(!data)throw new HttpError(409,'A edição foi alterada. Recarregue a lista.');
    revalidatePath('/conexao');revalidatePath('/admin/conexao');
    return json({ok:true});
  } catch(error) { return apiError(error,'Não foi possível arquivar a edição. Tente novamente.'); }
}

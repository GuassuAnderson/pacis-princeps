import 'server-only';
import { database } from './database';
import { HttpError } from './http';
import { connectionQuery, type ConnectionInput } from '../connection-validation';
import type { Connection, ConnectionList } from '../connections';
import { PRODUCT_PLACEHOLDER } from '../products';

export const CONNECTION_BUCKET = 'connection-images';
type Row = {
  id: string; title: string; theme: string; event_date: string; preacher: string;
  preacher_title: string | null; preacher_instagram: string | null; edition_instagram: string | null; preacher_instagram_label: string | null; edition_instagram_label: string | null; summary: string; content: string | null; published: boolean; featured: boolean; updated_at: string;
  images: { id: string; storage_path: string | null; external_url: string | null; alt: string; width: number | null; height: number | null; position: number; active: boolean }[];
};
const select = 'id,title,theme,event_date,preacher,preacher_title,preacher_instagram,edition_instagram,preacher_instagram_label,edition_instagram_label,summary,content,published,featured,updated_at,images:connection_assets(id,storage_path,external_url,alt,width,height,position,active)';
function legacyPhoto(url: string | null) {
  try { const parsed = new URL(url || ''); return parsed.protocol === 'https:' ? parsed.href : PRODUCT_PLACEHOLDER; }
  catch { return PRODUCT_PLACEHOLDER; }
}
function map(row: Row): Connection {
  const images = (row.images || []).filter(image => image.active).sort((a,b) => a.position-b.position).map(image => ({
    id:image.id, url:image.storage_path ? database().storage.from(CONNECTION_BUCKET).getPublicUrl(image.storage_path).data.publicUrl : legacyPhoto(image.external_url),
    alt:image.alt || row.title, width:image.width || 1000, height:image.height || 1000,
  }));
  return { id:row.id,title:row.title,theme:row.theme,date:row.event_date,preacher:row.preacher,role:row.preacher_title || '',preacherInstagram:row.preacher_instagram || '',editionInstagram:row.edition_instagram || '',preacherInstagramLabel:row.preacher_instagram_label || '',editionInstagramLabel:row.edition_instagram_label || '',
    summary:row.summary,content:row.content || '',published:row.published,featured:row.featured,updatedAt:row.updated_at,images,photos:images.map(image => image.url) };
}
export async function listConnections(input: unknown = {}, admin = false): Promise<ConnectionList> {
  const query = connectionQuery.parse(input);
  let request = database().from('connections').select(select,{count:'exact'}).eq('active',true);
  if (!admin) request = request.eq('published',true).order('featured',{ascending:false});
  if (query.year) request = request.gte('event_date',`${query.year}-01-01`).lte('event_date',`${query.year}-12-31`);
  const start = (query.page-1)*query.limit;
  const {data,count,error} = await request.order('event_date',{ascending:false}).order('id',{ascending:true}).range(start,start+query.limit-1);
  if(error)throw error;
  return {items:(data as unknown as Row[]).map(map),total:count || 0,page:query.page,limit:query.limit};
}
export async function saveConnection(input: ConnectionInput, actor: string) {
  const {imageIds,...payload} = input;
  const {data:id,error} = await database().rpc('save_connection',{payload,image_ids:imageIds,actor_id:actor});
  if(error) {
    if(['40001','23505'].includes(error.code))throw new HttpError(409,'Esta edição foi alterada em outra aba. Recarregue a lista antes de editar novamente.');
    if(error.code==='P0002')throw new HttpError(404,'Edição não encontrada.');
    if(['22023','23514'].includes(error.code))throw new HttpError(400,'Confira os dados e as fotos selecionadas.');
    throw error;
  }
  return id as string;
}

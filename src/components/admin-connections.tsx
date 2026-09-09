"use client";
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { type FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import { type Connection, type ConnectionList, formatConnectionDate } from '@/lib/connections';
import type { ProductImage } from '@/lib/products';
import { connectionInput } from '@/lib/connection-validation';
import { api, ApiError } from '@/lib/client-api';
import styles from './admin-products.module.css';

type Draft = Omit<Connection,'updatedAt'> & {updatedAt:string|null};
export default function AdminConnections() {
  const router=useRouter();
  const [list,setList]=useState<ConnectionList>({items:[],total:0,page:1,limit:12});
  const [page,setPage]=useState(1),[revision,setRevision]=useState(0),[loading,setLoading]=useState(true);
  const [editing,setEditing]=useState<Draft|null>(null),[error,setError]=useState(''),[formError,setFormError]=useState(''),[toast,setToast]=useState('');
  const [busy,setBusy]=useState(false);
  const dialog=useRef<HTMLDialogElement>(null);
  const describe=useCallback((error:unknown)=>{
    if(error instanceof ApiError && error.status===401){router.replace('/login');router.refresh();}
    return error instanceof Error ? error.message : 'Não foi possível concluir a operação.';
  },[router]);
  useEffect(()=>{
    const controller=new AbortController();
    const timer=setTimeout(async()=>{
      setLoading(true);setError('');
      try { const result=await api<ConnectionList>(`/api/admin/connections?page=${page}`,{signal:controller.signal});if(!controller.signal.aborted)setList(result); }
      catch(error){if(!controller.signal.aborted)setError(describe(error));}
      finally{if(!controller.signal.aborted)setLoading(false);}
    },0);
    return()=>{clearTimeout(timer);controller.abort();};
  },[page,revision,describe]);
  useEffect(()=>{if(editing)dialog.current?.showModal();else dialog.current?.close();},[editing]);
  function open(item?:Connection){
    setFormError('');setToast('');
    setEditing(item ? {...item} : {id:crypto.randomUUID(),title:'',theme:'',date:'',preacher:'',role:'',preacherInstagram:'',editionInstagram:'',preacherInstagramLabel:'',editionInstagramLabel:'',summary:'',content:'',published:false,featured:false,photos:[],images:[],updatedAt:null});
  }
  async function save(event:FormEvent<HTMLFormElement>){
    event.preventDefault();if(!editing || busy)return;
    const form=new FormData(event.currentTarget);
    const candidate={id:editing.id,title:form.get('title'),theme:form.get('theme'),date:form.get('date'),preacher:form.get('preacher'),role:form.get('role'),preacherInstagram:form.get('preacherInstagram'),editionInstagram:form.get('editionInstagram'),preacherInstagramLabel:form.get('preacherInstagramLabel'),editionInstagramLabel:form.get('editionInstagramLabel'),summary:form.get('summary'),content:form.get('content'),published:form.get('published')==='on',imageIds:editing.images.map(image=>image.id),updatedAt:editing.updatedAt};
    const result=connectionInput.safeParse(candidate);
    if(!result.success){setFormError(result.error.issues[0].message);return;}
    setBusy(true);setFormError('');
    try{await api('/api/admin/connections',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify(result.data)});setEditing(null);setToast('Edição salva no banco de dados.');setRevision(value=>value+1);router.refresh();}
    catch(error){setFormError(describe(error));}
    finally{setBusy(false);}
  }
  async function upload(files:File[]){
    if(!editing || busy || !files.length)return;
    if(editing.images.length+files.length>8){setFormError('Use até 8 fotos por edição.');return;}
    if(files.some(file=>file.size>4*1024*1024)){setFormError('Cada foto pode ter até 4 MB.');return;}
    setBusy(true);setFormError('');
    try{for(const file of files){const form=new FormData();form.set('file',file);const image=await api<ProductImage>('/api/admin/connections/uploads',{method:'POST',body:form});setEditing(current=>current ? {...current,images:[...current.images,image]} : current);}}
    catch(error){setFormError(describe(error));}
    finally{setBusy(false);}
  }
  function move(index:number,direction:number){
    if(!editing)return;
    const images=[...editing.images];[images[index],images[index+direction]]=[images[index+direction],images[index]];setEditing({...editing,images});
  }
  async function feature(item:Connection){
    if(busy)return;
    setBusy(true);setError('');setToast('');
    try{
      await api('/api/admin/connections/featured',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({id:item.id,featured:!item.featured,updatedAt:item.updatedAt})});
      setToast(item.featured?'Destaque removido. A edição mais recente será exibida.':'Edição definida como destaque.');
      setRevision(value=>value+1);router.refresh();
    }catch(error){setError(describe(error));}finally{setBusy(false);}
  }
  async function archive(item:Connection){
    if(!confirm(`Arquivar “${item.title}”? A edição sairá do site; os dados e fotos serão preservados no banco.`))return;
    setBusy(true);setError('');setToast('');
    try{await api(`/api/admin/connections/${item.id}`,{method:'DELETE',headers:{'content-type':'application/json'},body:JSON.stringify({updatedAt:item.updatedAt})});setToast('Edição arquivada.');if(list.items.length===1 && page>1)setPage(page-1);else setRevision(value=>value+1);router.refresh();}
    catch(error){setError(describe(error));}finally{setBusy(false);}
  }
  return <>
    <div className="editor-topo"><div><h2>Edições do Conexão</h2><p>Cadastre o encontro, adicione fotos e publique quando estiver pronto.</p></div><button className="btn btn-primario" disabled={busy} onClick={()=>open()}>Nova edição</button></div>
    {toast && <p role="status" className={styles.success}>{toast}</p>}
    {error && <div role="alert" className={styles.error}>{error} <button onClick={()=>setRevision(value=>value+1)}>Tentar novamente</button></div>}
    {loading ? <p role="status">Carregando edições…</p> : !error && !list.items.length ? <p>Nenhuma edição cadastrada ainda.</p> : !error && list.items.map(item=><article className="card-edicao" key={item.id}>
      <div className="card-edicao-foto">{item.images[0] ? <Image src={item.images[0].url} alt={item.title} width={180} height={140} unoptimized={!item.images[0].url.includes('/storage/v1/object/public/connection-images/')}/> : <span>Sem foto</span>}</div>
      <div className="card-edicao-corpo"><span className={`badge-publicado ${item.published?'badge-pub-sim':'badge-pub-nao'}`}>{item.published?'Publicado':'Rascunho'}</span>{item.featured && <span className="badge-publicado badge-pub-sim">Em destaque</span>}<h4>{item.title}</h4><span className="tema">{item.theme}</span><div className="meta"><span>{formatConnectionDate(item.date)}</span><span>{item.preacher}</span></div></div>
      <div className="card-edicao-acoes"><button className="btn-tabela btn-editar" disabled={busy || !item.published} title={!item.published?"Publique a edição para destacá-la":undefined} onClick={()=>feature(item)}>{item.featured?"Remover destaque":"Definir como destaque"}</button><button className="btn-tabela btn-editar" disabled={busy} onClick={()=>open(item)}>Editar</button><button className="btn-tabela btn-excluir" disabled={busy} onClick={()=>archive(item)}>Arquivar</button></div>
    </article>)}
    {!error && list.total>12 && <div className={styles.pagination}><button disabled={loading || busy || page===1} onClick={()=>setPage(page-1)}>Anterior</button><span>Página {page} de {Math.ceil(list.total/12)}</span><button disabled={loading || busy || page*12>=list.total} onClick={()=>setPage(page+1)}>Próxima</button></div>}
    <dialog ref={dialog} className={styles.dialog} onCancel={event=>{event.preventDefault();if(!busy)setEditing(null);}} onClose={()=>{if(!busy)setEditing(null);}} aria-labelledby="connection-editor-title">
      {editing && <form onSubmit={save} key={editing.id}>
        <div className="modal-topo"><h3 id="connection-editor-title">{editing.updatedAt?'Editar edição':'Nova edição do Conexão'}</h3><button type="button" aria-label="Fechar editor" disabled={busy} onClick={()=>setEditing(null)}>×</button></div>
        <fieldset className={styles.fields} disabled={busy}>
          <label>Título da edição *<input name="title" defaultValue={editing.title} maxLength={180} required/></label>
          <div className={styles.twoColumns}><label>Tema *<input name="theme" defaultValue={editing.theme} maxLength={160} required/></label><label>Data do evento *<input name="date" type="date" defaultValue={editing.date} required/></label></div>
          <div className={styles.twoColumns}><label>Pregador convidado *<input name="preacher" defaultValue={editing.preacher} maxLength={160} required/></label><label>Cargo / título<input name="role" defaultValue={editing.role} maxLength={160}/></label></div>
          <div className={styles.twoColumns}>
            <label>Instagram do pregador<input name="preacherInstagram" type="url" defaultValue={editing.preacherInstagram} placeholder="https://www.instagram.com/pregador/" maxLength={2048}/></label>
            <label>Link da edição no Instagram<input name="editionInstagram" type="url" defaultValue={editing.editionInstagram} placeholder="https://www.instagram.com/p/..." maxLength={2048}/></label>
          </div>
          <p className={styles.hint}>Links opcionais. Cole o endereço completo do perfil e da publicação ou reel da pregação.</p>
          <div className={styles.twoColumns}>
            <label>Texto do link do pregador<input name="preacherInstagramLabel" defaultValue={editing.preacherInstagramLabel} placeholder="Siga o Marcelo" maxLength={80}/></label>
            <label>Texto do link da edição<input name="editionInstagramLabel" defaultValue={editing.editionInstagramLabel} placeholder="Assista à pregação" maxLength={80}/></label>
          </div>
          <p className={styles.hint}>Personalize as chamadas dos links. Se deixar vazio, será usado o texto padrão.</p>
          <label>Resumo *<textarea name="summary" defaultValue={editing.summary} rows={3} minLength={10} maxLength={600} required/></label>
          <label>Conteúdo completo da pregação<textarea name="content" defaultValue={editing.content} rows={9} maxLength={20000}/></label>
          <p className={styles.hint}>Escreva em texto; as quebras de linha serão preservadas.</p>
          <label className={styles.upload}>Fotos do evento<input type="file" accept="image/jpeg,image/png,image/webp" multiple onChange={event=>{const files=Array.from(event.target.files || []);event.target.value='';void upload(files);}}/></label>
          <p className={styles.hint}>Até 8 fotos JPG, PNG ou WebP, de até 4 MB cada. A primeira será a capa.</p>
          <div className={styles.images}>{editing.images.map((image,index)=><div className={styles.imageItem} key={image.id}>
            <Image src={image.url} alt={`Foto ${index+1}`} width={160} height={120} unoptimized={!image.url.includes('/storage/v1/object/public/connection-images/')}/><strong>{index===0?'Capa':`Foto ${index+1}`}</strong>
            <div><button type="button" aria-label={`Mover foto ${index+1} para antes`} disabled={index===0} onClick={()=>move(index,-1)}>←</button><button type="button" aria-label={`Mover foto ${index+1} para depois`} disabled={index===editing.images.length-1} onClick={()=>move(index,1)}>→</button><button type="button" aria-label={`Remover foto ${index+1}`} onClick={()=>setEditing({...editing,images:editing.images.filter(item=>item.id!==image.id)})}>Remover</button></div>
          </div>)}</div>
          <label className={styles.checkbox}><input name="published" type="checkbox" defaultChecked={editing.published}/>Publicar esta edição</label>
          <p className={styles.hint}>Desmarque para salvar como rascunho e retirar a edição da página pública.</p>
        </fieldset>
        {formError && <p role="alert" className={styles.error}>{formError}</p>}
        <div className="modal-rodape"><button type="button" className="btn btn-contorno" disabled={busy} onClick={()=>setEditing(null)}>Cancelar</button><button type="submit" className="btn btn-primario" disabled={busy}>{busy?'Aguarde…':'Salvar edição'}</button></div>
      </form>}
    </dialog>
  </>;
}

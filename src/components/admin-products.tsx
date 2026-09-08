"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { categories, categoryName, money, type Product, type ProductImage, type ProductList } from "@/lib/products";
import { MAX_IMAGE_BYTES, MAX_PRODUCT_IMAGES, productInput } from "@/lib/product-validation";
import { api, ApiError } from "@/lib/client-api";
import styles from "./admin-products.module.css";

type Draft = Omit<Product, "updatedAt"> & { updatedAt: string | null };
const emptyList: ProductList = { items: [], total: 0, page: 1, limit: 12 };

export default function AdminProducts() {
  const router = useRouter();
  const [list,setList] = useState<ProductList>(emptyList);
  const [search,setSearch] = useState("");
  const [category,setCategory] = useState("");
  const [status,setStatus] = useState("all");
  const [page,setPage] = useState(1);
  const [revision,setRevision] = useState(0);
  const [loading,setLoading] = useState(true);
  const [error,setError] = useState("");
  const [toast,setToast] = useState("");
  const [editing,setEditing] = useState<Draft | null>(null);
  const [formError,setFormError] = useState("");
  const [saving,setSaving] = useState(false);
  const [uploading,setUploading] = useState(false);
  const [mutation,setMutation] = useState<string | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  const busy = saving || uploading;

  const handleError = useCallback((error: unknown) => {
    if (error instanceof ApiError && error.status === 401) { router.replace("/login"); router.refresh(); }
    return error instanceof Error ? error.message : "Não foi possível concluir a operação.";
  },[router]);

  useEffect(() => {
    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setLoading(true); setError("");
      try {
        const query = new URLSearchParams({ page:String(page), search, category, status });
        const next = await api<ProductList>(`/api/admin/products?${query}`, { signal:controller.signal });
        if (!controller.signal.aborted) setList(next);
      } catch (error) { if (!controller.signal.aborted) setError(handleError(error)); }
      finally { if (!controller.signal.aborted) setLoading(false); }
    },250);
    return () => { window.clearTimeout(timer); controller.abort(); };
  },[page,search,category,status,revision,handleError]);

  useEffect(() => {
    if (editing && !dialog.current?.open) dialog.current?.showModal();
    else if (!editing) dialog.current?.close();
  },[editing]);

  function open(product?: Product) {
    setFormError(""); setToast("");
    setEditing(product ? { ...product, images:[...product.images] } : {
      id:crypto.randomUUID(), name:"", category:"", description:"", price:0, oldPrice:null,
      stock:0, featured:false, inHero:false, active:true, image:"", images:[], updatedAt:null,
    });
  }

  async function upload(files: File[]) {
    if (!editing || busy) return;
    setFormError("");
    if (files.length + editing.images.length > MAX_PRODUCT_IMAGES) { setFormError("Adicione no máximo 8 fotos."); return; }
    if (files.some(file => file.size > MAX_IMAGE_BYTES || !["image/jpeg","image/png","image/webp"].includes(file.type))) {
      setFormError("Use fotos JPG, PNG ou WebP de até 4 MB cada."); return;
    }
    setUploading(true);
    try {
      // Each request carries just one photo, keeping uploads within hosting limits.
      for (const file of files) {
        const form = new FormData(); form.set("file",file);
        const image = await api<ProductImage>("/api/admin/uploads",{method:"POST",body:form});
        setEditing(current => current ? {...current,images:[...current.images,image]} : current);
      }
    } catch (error) { setFormError(handleError(error)); }
    finally { setUploading(false); }
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); if (!editing || busy) return;
    const form = new FormData(event.currentTarget);
    const candidate = {
      id:editing.id, name:String(form.get("name")), category:String(form.get("category")),
      description:String(form.get("description")), price:Number(form.get("price")),
      oldPrice:form.get("oldPrice") ? Number(form.get("oldPrice")) : null, stock:Number(form.get("stock")),
      active:form.get("active") === "on", featured:form.get("featured") === "on", inHero:form.get("inHero") === "on",
      imageIds:editing.images.map(image => image.id), updatedAt:editing.updatedAt,
    };
    const checked = productInput.safeParse(candidate);
    if (!checked.success) { setFormError(checked.error.issues[0].message); return; }
    setSaving(true); setFormError("");
    try {
      await api<Product>("/api/admin/products",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify(checked.data)});
      setEditing(null); setToast("Produto salvo no banco de dados."); setRevision(value=>value+1); router.refresh();
    } catch (error) { setFormError(handleError(error)); }
    finally { setSaving(false); }
  }

  async function archive(product: Product) {
    if (!window.confirm(`Retirar “${product.name}” da loja? O cadastro e as fotos continuarão disponíveis no painel.`)) return;
    setMutation(product.id); setError(""); setToast("");
    try {
      await api(`/api/admin/products/${product.id}`,{method:"DELETE",headers:{"content-type":"application/json"},body:JSON.stringify({updatedAt:product.updatedAt})});
      setToast("Produto despublicado."); setRevision(value=>value+1); router.refresh();
    } catch (error) { setError(handleError(error)); }
    finally { setMutation(null); }
  }

  function moveImage(index: number, direction: number) {
    setEditing(current => {
      if (!current) return current;
      const images = [...current.images];
      [images[index],images[index+direction]] = [images[index+direction],images[index]];
      return {...current,images};
    });
  }

  return <>
    {toast && <p className={styles.success} role="status">{toast}</p>}
    {error && <div className={styles.error} role="alert">{error} <button type="button" onClick={()=>setRevision(value=>value+1)}>Tentar novamente</button></div>}
    <div className="painel-card">
      <div className="painel-card-topo"><h3>Produtos cadastrados ({list.total})</h3><button className="btn btn-primario btn-sm" onClick={()=>open()}>Novo produto</button></div>
      <div className={styles.filters}>
        <label>Buscar produto<input value={search} onChange={event=>{setSearch(event.target.value);setPage(1);}} placeholder="Nome do produto"/></label>
        <label>Categoria<select value={category} onChange={event=>{setCategory(event.target.value);setPage(1);}}><option value="">Todas as categorias</option>{categories.map(item=><option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
        <label>Publicação<select value={status} onChange={event=>{setStatus(event.target.value);setPage(1);}}><option value="all">Todos</option><option value="active">Publicados</option><option value="inactive">Não publicados</option></select></label>
      </div>
      <div className={styles.tableWrap} aria-busy={loading}><table className="tabela-produtos"><thead><tr><th>Produto</th><th>Categoria</th><th>Preço</th><th>Estoque</th><th>Publicação</th><th>Ações</th></tr></thead><tbody>
        {list.items.map(product=><tr key={product.id}>
          <td><div className="prod-nome-col"><Image className="prod-imagem-mini" src={product.image} alt="" width={48} height={48}/><strong>{product.name}</strong></div></td>
          <td>{categoryName(product.category)}</td><td>{money(product.price)}{product.oldPrice ? <small className={styles.oldPrice}>{money(product.oldPrice)}</small> : null}</td>
          <td>{product.stock} un.</td><td>{product.active ? "Publicado" : "Não publicado"}{product.featured && <small className={styles.oldPrice}>Destaque</small>}{product.inHero && <small className={styles.oldPrice}>Carrossel do início</small>}</td>
          <td><div className="acoes-tabela"><button className="btn-tabela btn-editar" disabled={mutation!==null} onClick={()=>open(product)}>Editar</button>{product.active && <><Link className="btn-tabela" href={`/produto/${product.id}`} target="_blank">Ver</Link><button className="btn-tabela btn-excluir" disabled={mutation!==null} onClick={()=>archive(product)}>{mutation===product.id ? "Salvando…" : "Despublicar"}</button></>}</div></td>
        </tr>)}
        {!list.items.length && <tr><td colSpan={6} className="tabela-vazia">{loading ? "Carregando produtos…" : error ? "A lista não pôde ser carregada." : "Nenhum produto cadastrado nesta seleção."}</td></tr>}
      </tbody></table></div>
      <div className={styles.pagination}><button disabled={page<=1||loading} onClick={()=>setPage(value=>value-1)}>Anterior</button><span>Página {page} de {Math.max(1,Math.ceil(list.total/list.limit))}{loading ? " · Atualizando…" : ""}</span><button disabled={page*list.limit>=list.total||loading} onClick={()=>setPage(value=>value+1)}>Próxima</button></div>
    </div>

    <dialog ref={dialog} className={styles.dialog} aria-labelledby="product-editor-title" onCancel={event=>{event.preventDefault();if(!busy)setEditing(null);}}>
      {editing && <form key={editing.id} onSubmit={submit}>
        <div className="modal-topo"><h3 id="product-editor-title">{editing.updatedAt ? "Editar produto" : "Novo produto"}</h3><button type="button" className="modal-fechar" disabled={busy} onClick={()=>setEditing(null)} aria-label="Fechar cadastro">×</button></div>
        <fieldset disabled={busy} className={styles.fields}>
          <label>Nome do produto *<input name="name" defaultValue={editing.name} required minLength={2} maxLength={160}/></label>
          <div className={styles.twoColumns}><label>Categoria *<select name="category" defaultValue={editing.category} required><option value="">Selecione…</option>{categories.map(category=><option key={category.id} value={category.id}>{category.name}</option>)}</select></label><label>Estoque *<input name="stock" type="number" min="0" step="1" max="2147483647" defaultValue={editing.stock} required/></label></div>
          <div className={styles.twoColumns}><label>Preço atual (R$) *<input name="price" type="number" min=".01" max="99999999.99" step=".01" defaultValue={editing.price || ""} required/></label><label>Preço antigo (R$)<input name="oldPrice" type="number" min=".01" max="99999999.99" step=".01" defaultValue={editing.oldPrice || ""}/></label></div>
          <div><label className={styles.upload}>Fotos do produto<input type="file" accept="image/jpeg,image/png,image/webp" multiple disabled={busy||editing.images.length>=MAX_PRODUCT_IMAGES} onChange={event=>{const files=Array.from(event.target.files||[]);event.target.value="";void upload(files);}}/></label><p className={styles.hint}>Até 8 fotos, JPG, PNG ou WebP, com até 4 MB cada. A primeira será a imagem principal. As fotos são otimizadas ao enviar.</p></div>
          <div className={styles.images}>{editing.images.map((image,index)=><div key={image.id} className={styles.imageItem}><Image src={image.url} alt={`Foto ${index+1} do produto`} width={140} height={140}/><strong>{index===0 ? "Principal" : `Foto ${index+1}`}</strong><div><button type="button" disabled={index===0} onClick={()=>moveImage(index,-1)} aria-label={`Mover foto ${index+1} para antes`}>←</button><button type="button" disabled={index===editing.images.length-1} onClick={()=>moveImage(index,1)} aria-label={`Mover foto ${index+1} para depois`}>→</button><button type="button" onClick={()=>setEditing(current=>current ? {...current,images:current.images.filter(item=>item.id!==image.id)} : current)} aria-label={`Remover foto ${index+1}`}>Remover</button></div></div>)}</div>
          <label>Descrição *<textarea name="description" defaultValue={editing.description} minLength={10} maxLength={20000} rows={5} required/></label>
          <label className={styles.checkbox}><input type="checkbox" name="active" defaultChecked={editing.active}/> Publicar na loja</label>
          <label className={styles.checkbox}><input type="checkbox" name="featured" defaultChecked={editing.featured}/> Exibir em Produtos em destaque</label>
          <label className={styles.checkbox}><input type="checkbox" name="inHero" defaultChecked={editing.inHero}/> Exibir no carrossel do início (hero)</label>
          <p>Selecione até 5 produtos para o carrossel. Para trocar, desmarque um produto e salve antes de selecionar outro. Produtos não publicados reservam uma vaga, mas só aparecem após a publicação.</p>
        </fieldset>
        {uploading && <p className={styles.notice} role="status">Enviando e otimizando as fotos…</p>}
        {formError && <p className={styles.error} role="alert">{formError}</p>}
        <div className="modal-rodape"><button type="button" className="btn btn-contorno" disabled={busy} onClick={()=>setEditing(null)}>Cancelar</button><button className="btn btn-primario" type="submit" disabled={busy}>{saving ? "Salvando…" : "Salvar produto"}</button></div>
      </form>}
    </dialog>
  </>;
}

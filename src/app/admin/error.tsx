"use client";
export default function AdminError({reset}:{reset:()=>void}) { return <div className="painel-card" style={{padding:24}} role="alert"><h2>Não foi possível carregar o painel</h2><p>Confira a conexão do Supabase e a migração do catálogo antes de tentar novamente.</p><button className="btn btn-primario" onClick={reset}>Tentar novamente</button></div>; }

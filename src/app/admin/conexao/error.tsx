"use client";
export default function ConnectionError({reset}:{reset:()=>void}) {
  return <div className="painel-card" style={{padding:24}} role="alert"><h2>Não foi possível carregar as edições</h2><p>Tente novamente. Se persistir, confira a conexão e a migração de Conexão no Supabase.</p><button className="btn btn-primario" onClick={reset}>Tentar novamente</button></div>;
}

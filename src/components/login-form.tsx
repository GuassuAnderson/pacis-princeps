"use client";
import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/client-api";

export default function LoginForm() {
  const router = useRouter();
  const [error,setError] = useState("");
  const [busy,setBusy] = useState(false);
  async function login(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setError("");
    const form = new FormData(event.currentTarget);
    try {
      await api("/api/auth/login", { method:"POST", headers:{"content-type":"application/json"}, body:JSON.stringify({email:form.get("email"),senha:form.get("senha")}) });
      router.replace("/admin"); router.refresh();
    } catch (error) { setError(error instanceof Error ? error.message : "Não foi possível entrar."); }
    finally { setBusy(false); }
  }
  return <>
    {error && <div className="erro-login visivel" role="alert">{error}</div>}
    <form className="login-form" onSubmit={login}>
      <div className="campo-grupo"><label htmlFor="usuario">E-mail</label><input type="email" id="usuario" name="email" autoComplete="username" required maxLength={255}/></div>
      <div className="campo-grupo"><label htmlFor="senha">Senha</label><input type="password" id="senha" name="senha" autoComplete="current-password" required maxLength={72}/></div>
      <button type="submit" className="btn btn-primario" disabled={busy}>{busy ? "Entrando…" : "Entrar no painel"}</button>
    </form>
  </>;
}

# Pacis Princeps

Loja migrada para Next.js App Router, TypeScript e Tailwind CSS.

## Desenvolvimento

```bash
npm install
npm run dev
```

Configure `.env.local` seguindo `.env.example`. Nunca exponha a chave secreta ou service role no navegador.

O cadastro e a loja usam Supabase PostgreSQL e Storage. Antes de usar o painel, aplique a migração e confira a conexão:

```bash
npm run db:migrate
npm run db:check
```

Sem `DATABASE_URL`, execute os arquivos de `supabase/migrations` em ordem no SQL Editor do Supabase. Veja [configuração do catálogo](docs/catalogo-banco.md) e [cadastro das edições de Conexão](docs/conexao-banco.md).

```bash
npm run test
npm run typecheck
npm run build
```

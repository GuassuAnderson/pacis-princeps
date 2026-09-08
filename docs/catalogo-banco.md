# Cadastro de produtos conectado ao banco

## Configuração

O Next usa `.env.local` na raiz. A configuração encontrada em `legacy-backend/.env` foi recuperada para esse arquivo; o backend antigo não precisa ser iniciado.

- `SUPABASE_URL`: URL do projeto ativo.
- `SUPABASE_SECRET_KEY`: chave secreta de servidor do projeto, ou `SUPABASE_SERVICE_ROLE_KEY` para a chave legada. Nunca usar prefixo `NEXT_PUBLIC_` nessas chaves.
- `JWT_SECRET`: segredo aleatório de pelo menos 32 caracteres para as sessões do painel.
- `SITE_URL`: origem exata do site em produção, sem caminho (ex.: `https://loja.example.com`). No desenvolvimento, pode ficar vazio.
- `DATABASE_URL`: opcional, conexão PostgreSQL do Supabase para aplicar a migração pelo terminal.

As variáveis públicas antigas são aceitas para a URL, mas login, banco e envio de fotos usam somente o servidor Next. Reinicie `npm run dev` depois de atualizar o arquivo. Na hospedagem, configure as mesmas variáveis no ambiente e publique uma nova versão.

## Preparar o projeto Supabase

1. Confirme que o projeto está ativo no painel Supabase.
2. Execute `supabase/migrations/202609080001_catalog.sql` e depois `supabase/migrations/202609080002_hero_products.sql` no SQL Editor. Se `DATABASE_URL` estiver configurada, execute `npm run db:migrate`, que aplica os arquivos em ordem.
3. Execute `npm run db:check` para verificar tabelas, função do catálogo, bucket e administrador.
4. Entre em `/login` com o usuário administrador do sistema antigo (tabela `public.users`). Esse login é separado de usuários do Supabase Auth.

A migração é transacional e pode ser executada novamente. Preserva produtos, categorias, preços, estoque, usuários e fotos antigas. Adiciona categorias faltantes, galeria, sessões administrativas e limitação de tentativas de login. As permissões das tabelas do catálogo ficam restritas ao servidor; a chave secreta não chega ao navegador.

Se não houver administrador, defina temporariamente `ADMIN_EMAIL`, `ADMIN_PASSWORD` (12 a 72 bytes) e opcionalmente `ADMIN_NAME` em `.env.local`; execute `npm run admin:create`. O script não altera contas existentes. Remova `ADMIN_PASSWORD` do arquivo após o cadastro.

## Usar o cadastro

As opções **Exibir em Produtos em destaque** e **Exibir no carrossel do início (hero)** são independentes; um produto pode ter ambas. Somente produtos publicados aparecem no site. O carrossel aceita até 5 produtos selecionados, incluindo rascunhos que reservam uma vaga. Para substituir um, desmarque e salve o anterior antes de selecionar o novo. A ação **Despublicar** também libera sua vaga no carrossel.

A migração `202609080002_hero_products.sql` mantém os destaques existentes e inicia o carrossel sem seleção. Cinco posições únicas no PostgreSQL garantem o limite, inclusive para gravações diretas; o salvamento aloca posições dentro da transação e avisa quando o carrossel está cheio.

Em `/admin/produtos`, clique em **Novo produto**, preencha nome, categoria, preço, estoque e descrição. Envie até 8 fotos JPG, PNG ou WebP de até 4 MB cada. As setas mudam a ordem; a primeira foto será a principal. Para publicar, é obrigatória pelo menos uma imagem.

As fotos são verificadas e reprocessadas no servidor: limite de 25 megapixels, correção de orientação, remoção de metadados e saída WebP de até 1600 × 1600. Cada foto é enviada separadamente para não exceder o limite por requisição da hospedagem. Os arquivos ficam no bucket público `product-images`, em `<administrador-id>/<imagem-id>.webp`, e os metadados em `product_images`.

**Salvar produto** grava os campos e a ordem das fotos na mesma transação PostgreSQL. A confirmação aparece somente depois da resposta do banco. Um conflito de edição em outra aba exige recarregar o cadastro. Falhas mantêm o formulário aberto para tentar novamente.

**Despublicar** retira o produto da loja e preserva seus dados e fotos no painel. Para republicar, edite e marque **Publicar na loja**. A página inicial exibe os produtos publicados marcados como destaque; catálogo, página individual e carrinho usam o mesmo banco. Não é necessário um novo build para criar uma página de produto.

## Arquivos e dados principais

- `src/app/api/admin/products`: leitura administrativa, salvamento e despublicação com autenticação.
- `src/app/api/admin/uploads`: envio e otimização das fotos.
- `src/app/api/products`: consultas públicas paginadas e busca de itens do carrinho.
- `src/lib/server/catalog.ts`: consultas compartilhadas e mapeamento entre o banco e as telas.
- `supabase/migrations/202609080001_catalog.sql`: schema, permissões e transações.
- `tests/catalog.test.ts`: testes em PostgreSQL local (PGlite), sem usar o projeto de produção.

Uploads são registrados antes do salvamento do produto. Fotos de um formulário cancelado permanecem com `product_id = null`; fotos retiradas de um cadastro permanecem com `active = false`. Isso evita apagar arquivos de um produto que ainda precisa ser salvo ou recuperado. Uma rotina futura de limpeza deve remover somente esses arquivos após um prazo de retenção e sem concorrer com salvamentos. Não exclua arquivos ativos diretamente pelo Storage.

Os produtos fictícios e o armazenamento `pp_products` não são mais usados. Dados antigos desse armazenamento do navegador não são apagados nem importados automaticamente. O carrinho mantém apenas IDs e quantidades no navegador e consulta nomes, fotos, preços e estoque no banco. Pedidos, pagamento e reserva de estoque continuam fora desta integração; o checkout está explicitamente identificado como demonstração.

## Verificação

```text
npm run test
npm run test:e2e
npm run typecheck
npm run build
npm run db:check
```

Os testes locais validam transações e regras do PostgreSQL. `test:e2e` inicia o Next isolado na porta 3107 e usa PostgreSQL local com um adaptador de Storage para validar as APIs e o navegador; não acessa o projeto Supabase. No Windows, usa o Chrome instalado; nos demais sistemas, instale o Chromium com `npx playwright install chromium`. Os screenshots ficam em `.next/catalog-browser-artifacts`.

Para confirmar a integração real, após configurar o projeto e aplicar a migração: entre no painel, cadastre um produto não publicado com duas fotos, salve, recarregue, edite a ordem e os dados, publique e confira em outro navegador o catálogo, a página individual e o carrinho. Despublique ao terminar a verificação.

Se o hostname do projeto não resolver, nenhuma gravação no Supabase será possível até corrigir a URL ou reativar o projeto. A aplicação mostra uma falha explícita; não troca o banco por dados fictícios ou armazenamento local.

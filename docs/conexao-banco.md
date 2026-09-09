# Conexão: edições e fotos

Execute `supabase/migrations/202609080003_connections.sql` no SQL Editor do mesmo projeto usado pelo catálogo. Depois publique as alterações na Netlify. As variáveis e o login administrativo são os mesmos dos produtos. Com `DATABASE_URL` local configurada, `npm run db:migrate` aplica todas as migrações em ordem.

Em `/admin/conexao`, **Nova edição** permite preencher título, tema, data, pregador, cargo, resumo e conteúdo em texto. As quebras de linha são preservadas. Envie até 8 fotos JPG, PNG ou WebP de até 4 MB cada; as setas alteram a ordem e a primeira foto é a capa. Marque **Publicar esta edição** para exibir em `/conexao`. Desmarque para guardar como rascunho.

Fotos são verificadas e convertidas em WebP de até 1600 × 1600, com limite de 25 megapixels na entrada. Os arquivos ficam em `connection-images/<administrador>/<foto>.webp` no Storage; seus metadados ficam em `connection_assets`. Textos, publicação e ordem das fotos são salvos em uma transação. Edições simultâneas são detectadas; uma foto de outro administrador ou edição não pode ser reutilizada indevidamente.

**Arquivar** retira a edição do painel e do site, preservando dados e arquivos no banco. Fotos removidas de uma edição são desativadas; uploads de um formulário cancelado permanecem sem vínculo, para uma futura limpeza com retenção.

A migração preserva edições e fotos do schema legado. O conteúdo é exibido como texto, sem executar HTML. Dados de exemplo e `pp_conexoes` do navegador não são usados nem importados automaticamente. O armazenamento antigo no navegador permanece intacto.

A lista pública é paginada e pode ser filtrada por ano. Somente edições ativas e publicadas são consultadas. O aviso fixo de próxima edição e os textos institucionais da página não são alterados por este cadastro.

Verificação local: `npm test`, `npm run test:e2e`, `npm run typecheck` e `npm run build`. Os testes usam PostgreSQL local isolado e Storage simulado; não gravam no projeto real.

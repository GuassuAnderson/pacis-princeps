# Fotos e vídeos da Pacis Princeps

## Arquivos fixos do site

- `public/images/`: identidade e imagens fixas, organizadas por seção.
- `public/images/nossa-historia/identidade-pacis.webp`: logo estática da seção Nossa história.
- `public/images/nossa-historia/video-pacis-capa.webp`: capa do vídeo.
- `public/videos/nossa-historia/video-pacis.mp4`: versão para web, sem faixa de áudio, H.264 e `faststart`.

O original permanece fora do repositório, na pasta de produção com backup. Use nomes em minúsculas, sem espaços ou acentos. O componente `src/components/history-brand-photo.tsx` exibe somente a logo com moldura decorativa, usando `next/image`. O vídeo e sua capa estão guardados para uso futuro em outro local e não são carregados pela página inicial. O vídeo de origem mistura trechos horizontais e verticais; as barras presentes no original são preservadas.

## Biblioteca futura de produtos, Sobre e Conexão

O cadastro de produtos agora usa Supabase Storage para as fotos e PostgreSQL para os dados e referências. A configuração e a migração estão descritas em [catalogo-banco.md](catalogo-banco.md). As fotos de Sobre e Conexão ainda podem adotar esse padrão em uma integração própria.

Estrutura sugerida no bucket de mídia pública:

```text
produtos/<produto-id>/<imagem-id>-v1.webp
sobre/<imagem-id>-v1.webp
conexao/<conexao-id>/<imagem-id>-v1.webp
videos/nossa-historia/<video-id>-v1.mp4
```

No banco, guardar uma referência ao arquivo (`bucket`, `path`) e metadados: seção/produto/conexão, texto alternativo, largura, altura, tipo, tamanho e ordem de exibição. Não guardar os arquivos binários nem strings base64 nas tabelas do catálogo.

Fluxo de leitura: servidor Next.js ou API consulta os registros; a página recebe URLs e descrições; o navegador carrega os arquivos pela CDN (ou pelo otimizador de imagens do Next.js). A API do catálogo não precisa retransmitir os bytes das fotos. Listar produtos com paginação.

No upload administrativo, validar autenticação, tamanho e tipo de arquivo; restringir gravações a administradores. Nunca enviar `SUPABASE_SERVICE_ROLE_KEY` ao navegador. Os originais privados devem ficar separados das versões públicas.

Antes de publicar fotos, redimensionar e comprimir, gerar miniaturas e usar WebP/AVIF conforme suporte. Exibir com `next/image`, dimensões e `sizes` corretos; carregar imagens fora da primeira tela sob demanda. Configurar apenas o domínio e o caminho necessários em `images.remotePatterns`. Usar nomes versionados para permitir cache longo sem imagens desatualizadas.

Referências: https://supabase.com/docs/guides/storage/quickstart e https://supabase.com/docs/guides/storage/cdn/fundamentals.

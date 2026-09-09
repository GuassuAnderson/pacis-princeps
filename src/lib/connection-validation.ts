import { z } from 'zod';
import { instagramUrl } from './instagram-url';
const instagramLink = z.string().trim().max(2048).refine(value => !value || Boolean(instagramUrl(value)), 'Use um link completo do Instagram começando com https://www.instagram.com/.').default('');
export const connectionInput = z.object({
  id: z.uuid(),
  title: z.string().trim().min(2, 'Informe o título da edição.').max(180),
  theme: z.string().trim().min(2, 'Informe o tema.').max(160),
  preacher: z.string().trim().min(2, 'Informe o pregador.').max(160),
  role: z.string().trim().max(160),
  preacherInstagram: instagramLink,
  editionInstagram: instagramLink,
  preacherInstagramLabel: z.string().trim().max(80).default(''),
  editionInstagramLabel: z.string().trim().max(80).default(''),
  date: z.iso.date('Informe uma data válida.'),
  summary: z.string().trim().min(10, 'Escreva um resumo com pelo menos 10 caracteres.').max(600),
  content: z.string().trim().max(20000),
  published: z.boolean(),
  imageIds: z.array(z.uuid()).max(8, 'Use até 8 fotos por edição.').refine(ids => new Set(ids).size === ids.length, 'Não repita a mesma foto.'),
  updatedAt: z.iso.datetime({ offset: true }).nullable(),
}).strict();
export const connectionQuery = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  year: z.string().regex(/^\d{4}$/).optional(),
});
export type ConnectionInput = z.infer<typeof connectionInput>;

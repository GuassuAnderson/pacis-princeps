import { z } from "zod";
import { categories } from "./products";

export const MAX_PRODUCT_IMAGES = 8;
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;
export const productInput = z.object({
  id: z.uuid("Identificador de produto inválido."),
  name: z.string().trim().min(2, "Informe o nome do produto.").max(160),
  category: z.string().refine(value => categories.some(category => category.id === value), "Selecione uma categoria válida."),
  description: z.string().trim().min(10, "A descrição deve ter pelo menos 10 caracteres.").max(20000),
  price: z.number().finite().positive("O preço deve ser maior que zero.").max(99999999.99).refine(value => Math.abs(value * 100 - Math.round(value * 100)) < .00001, "Informe o preço com até duas casas decimais."),
  oldPrice: z.number().finite().positive().max(99999999.99).refine(value => Math.abs(value * 100 - Math.round(value * 100)) < .00001, "Informe o preço antigo com até duas casas decimais.").nullable(),
  stock: z.number().int("Informe um estoque inteiro.").min(0).max(2147483647),
  featured: z.boolean(),
  inHero: z.boolean().default(false),
  active: z.boolean(),
  imageIds: z.array(z.uuid()).max(MAX_PRODUCT_IMAGES, "Use até 8 imagens por produto."),
  updatedAt: z.iso.datetime({ offset: true }).nullable(),
}).strict().superRefine((value, context) => {
  if (value.oldPrice !== null && value.oldPrice <= value.price) context.addIssue({ code: "custom", path: ["oldPrice"], message: "O preço antigo deve ser maior que o preço atual." });
  if (new Set(value.imageIds).size !== value.imageIds.length) context.addIssue({ code: "custom", path: ["imageIds"], message: "Não repita a mesma imagem." });
  if (value.active && !value.imageIds.length) context.addIssue({ code: "custom", path: ["imageIds"], message: "Adicione pelo menos uma foto para publicar o produto." });
});

export const productQuery = z.object({
  page: z.coerce.number().int().min(1).max(100000).default(1),
  limit: z.coerce.number().int().min(1).max(48).default(12),
  category: z.string().max(100).optional(),
  search: z.string().trim().max(160).default(""),
  sort: z.enum(["relevancia", "menor-preco", "maior-preco", "nome"]).default("relevancia"),
  featured: z.enum(["true", "false"]).optional(),
  inHero: z.enum(["true", "false"]).optional(),
  status: z.enum(["all", "active", "inactive"]).default("all"),
});

export type ProductInput = z.infer<typeof productInput>;

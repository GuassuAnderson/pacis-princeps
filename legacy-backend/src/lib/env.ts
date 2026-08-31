import { z } from "zod";

const envSchema = z.object({
  SUPABASE_URL: z.string().url("SUPABASE_URL deve ser uma URL válida"),
  SUPABASE_SECRET_KEY: z.string().min(1, "SUPABASE_SECRET_KEY é obrigatória"),
  JWT_SECRET: z.string().min(32, "JWT_SECRET deve ter pelo menos 32 caracteres"),
  PORT: z.coerce.number().int().positive().default(3333),
});

export const env = envSchema.parse(process.env);

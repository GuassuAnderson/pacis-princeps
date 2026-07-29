import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { env } from "../lib/env";
import { supabase } from "../lib/supabase";
import { AuthenticatedRequest } from "../middleware/auth";
import { UserRecord, UserRole } from "../types/auth";

const registerSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(255),
  password: z.string().min(8).max(72),
});

const loginSchema = z.object({
  email: z.string().trim().toLowerCase().email(),
  password: z.string().min(1),
});

function createToken(user: { id: string; role: UserRole }): string {
  return jwt.sign({ role: user.role }, env.JWT_SECRET, {
    subject: user.id,
    expiresIn: "1d",
  });
}

export async function register(req: Request, res: Response): Promise<void> {
  const data = registerSchema.parse(req.body);
  const { data: existingUser, error: findError } = await supabase
    .from("users")
    .select("id")
    .eq("email", data.email)
    .maybeSingle();

  if (findError) throw findError;

  if (existingUser) {
    res.status(409).json({ message: "Este e-mail já está cadastrado." });
    return;
  }

  const passwordHash = await bcrypt.hash(data.password, 12);
  const { data: user, error } = await supabase
    .from("users")
    .insert({
      name: data.name,
      email: data.email,
      password_hash: passwordHash,
    })
    .select("id, name, email, role, created_at")
    .single();

  if (error) throw error;

  res.status(201).json({
    user,
    token: createToken({ id: user.id, role: user.role as UserRole }),
  });
}

export async function login(req: Request, res: Response): Promise<void> {
  const data = loginSchema.parse(req.body);
  const { data: user, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", data.email)
    .maybeSingle<UserRecord>();

  if (error) throw error;

  if (!user || !user.active || !(await bcrypt.compare(data.password, user.password_hash))) {
    res.status(401).json({ message: "E-mail ou senha inválidos." });
    return;
  }

  res.json({
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token: createToken(user),
  });
}

export async function profile(req: AuthenticatedRequest, res: Response): Promise<void> {
  const { data: user, error } = await supabase
    .from("users")
    .select("id, name, email, role, active, created_at")
    .eq("id", req.user!.id)
    .maybeSingle();

  if (error) throw error;

  if (!user) {
    res.status(404).json({ message: "Usuário não encontrado." });
    return;
  }

  res.json(user);
}

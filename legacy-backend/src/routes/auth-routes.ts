import { Router } from "express";
import { login, profile, register } from "../controllers/auth-controller";
import { asyncHandler } from "../lib/async-handler";
import { authenticate } from "../middleware/auth";

export const authRoutes = Router();

authRoutes.post("/register", asyncHandler(register));
authRoutes.post("/login", asyncHandler(login));
authRoutes.get("/me", authenticate, asyncHandler(profile));

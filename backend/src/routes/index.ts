import { Router } from "express";
import { authRoutes } from "./auth-routes";
import { productRoutes } from "./product-routes";
import { connectionRoutes } from "./connection-routes";

export const routes = Router();

routes.use("/auth", authRoutes);
routes.use("/products", productRoutes);
routes.use("/connections", connectionRoutes);

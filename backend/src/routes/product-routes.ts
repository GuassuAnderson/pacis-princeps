import { Router } from "express";
import {
  createProduct,
  deleteProduct,
  getProduct,
  listProducts,
  updateProduct,
} from "../controllers/product-controller";
import { asyncHandler } from "../lib/async-handler";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../types/auth";

export const productRoutes = Router();

productRoutes.get("/", asyncHandler(listProducts));
productRoutes.get("/:id", asyncHandler(getProduct));
productRoutes.post("/", authenticate, authorize(UserRole.ADMIN), asyncHandler(createProduct));
productRoutes.put("/:id", authenticate, authorize(UserRole.ADMIN), asyncHandler(updateProduct));
productRoutes.delete("/:id", authenticate, authorize(UserRole.ADMIN), asyncHandler(deleteProduct));

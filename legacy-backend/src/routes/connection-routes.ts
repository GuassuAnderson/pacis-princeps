import { Router } from "express";
import {
  createConnection, deleteConnection, listAdminConnections,
  listPublishedConnections, updateConnection,
} from "../controllers/connection-controller";
import { asyncHandler } from "../lib/async-handler";
import { authenticate, authorize } from "../middleware/auth";
import { UserRole } from "../types/auth";

export const connectionRoutes = Router();
connectionRoutes.get("/", asyncHandler(listPublishedConnections));
connectionRoutes.get("/admin", authenticate, authorize(UserRole.ADMIN), asyncHandler(listAdminConnections));
connectionRoutes.post("/", authenticate, authorize(UserRole.ADMIN), asyncHandler(createConnection));
connectionRoutes.put("/:id", authenticate, authorize(UserRole.ADMIN), asyncHandler(updateConnection));
connectionRoutes.delete("/:id", authenticate, authorize(UserRole.ADMIN), asyncHandler(deleteConnection));

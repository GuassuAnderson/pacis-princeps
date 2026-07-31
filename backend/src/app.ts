import cors from "cors";
import express from "express";
import { errorHandler, notFound } from "./middleware/error-handler";
import { routes } from "./routes";

export const app = express();

app.disable("x-powered-by");
app.use(cors());
// A imagem é reduzida no navegador antes do envio. O limite comporta o WebP em base64.
app.use(express.json({ limit: "8mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "pacis-princeps-api" });
});
app.get("/api/health", (_req, res) => {
  res.json({ status: "ok", service: "pacis-princeps-api" });
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

import "dotenv/config";
import cors from "cors";
import express from "express";
import { env } from "./lib/env";
import { errorHandler, notFound } from "./middleware/error-handler";
import { routes } from "./routes";

const app = express();

app.disable("x-powered-by");
app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "princeps-pacis-api" });
});

app.use("/api", routes);
app.use(notFound);
app.use(errorHandler);

app.listen(env.PORT, () => {
  console.log(`Pacis Princeps API disponível em http://localhost:${env.PORT}`);
});

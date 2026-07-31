import "dotenv/config";
import serverless from "serverless-http";
import { app } from "../../backend/src/app";

const expressHandler = serverless(app);

export const handler = async (event: any, context: any) => {
  // A reescrita da Netlify pode entregar o caminho interno da função.
  // O Express sempre recebe /api/... para manter as rotas iguais local e online.
  const internalPrefix = "/.netlify/functions/api";
  if (event.path?.startsWith(internalPrefix)) {
    const suffix = event.path.slice(internalPrefix.length);
    event.path = `/api${suffix || "/health"}`;
    event.rawUrl = undefined;
  }
  return expressHandler(event, context);
};

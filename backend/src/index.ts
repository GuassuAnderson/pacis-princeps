import "dotenv/config";
import { app } from "./app";
import { env } from "./lib/env";

app.listen(env.PORT, () => {
  console.log(`Pacis Princeps API disponível em http://localhost:${env.PORT}`);
});

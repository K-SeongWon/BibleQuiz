import { Hono } from "hono";
import { logger } from "hono/logger";
import healthRoute from "./routes/health";

const app = new Hono();

app.use("*", logger());
app.route("/api/health", healthRoute);

const port = Number(Bun.env.PORT ?? 3001);

Bun.serve({
  fetch: app.fetch,
  port,
});

console.log(`[server] http://localhost:${port}`);

export default app;

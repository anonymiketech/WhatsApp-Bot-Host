import express, { type Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import pinoHttp from "pino-http";
import path from "path";
import { fileURLToPath } from "url";
import { authMiddleware } from "./middlewares/authMiddleware";
import router from "./routes";
import { logger } from "./lib/logger";
import { scheduleCleanup } from "./lib/cleanup";

scheduleCleanup(6);

const app: Express = express();

// Trust Nginx reverse proxy — required for secure cookies and correct
// X-Forwarded-Proto detection when running behind Nginx on VPS
app.set("trust proxy", 1);

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);

app.use(cors({ credentials: true, origin: true }));
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(authMiddleware);

app.use("/api", router);

// In production (Pterodactyl), serve the React frontend as static files.
// Set SERVE_STATIC=true in your environment to enable this.
if (process.env.SERVE_STATIC === "true") {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const publicDir = path.resolve(__dirname, "../public");
  app.use(express.static(publicDir));
  // SPA fallback — return index.html for all non-API routes (Express 5 wildcard)
  app.get(/(.*)/, (_req, res) => {
    res.sendFile(path.join(publicDir, "index.html"));
  });
  logger.info({ publicDir }, "Serving static frontend from disk");
}

export default app;

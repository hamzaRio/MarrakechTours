import express, {
  type Request,
  type Response,
  type NextFunction,
  type Express,
} from "express";
import { registerRoutes } from "./routes";
import { log } from "./logger";
import path from "path";
import connectToDatabase from "./config/database";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

export async function createApp(): Promise<Express> {
  const app = express();
  app.use(express.json({ limit: "100kb" }));
  app.use(express.urlencoded({ extended: false, limit: "100kb" }));

  // Allow all origins in development for Replit compatibility
  app.use(
    cors({
      origin: true,
      credentials: true,
    }),
  );

  app.get("/api/health", (_req, res) => {
    res.status(200).json({ status: "ok", timestamp: new Date().toISOString() });
  });



  app.use((req, res, next) => {
    const start = Date.now();
    const reqPath = req.path;
    let captured: Record<string, any> | undefined;

    const original = res.json.bind(res) as (
      body?: any,
      ...args: any[]
    ) => typeof res;
    res.json = function (body?: any, ...args: any[]): typeof res {
      captured = body;
      return original(body, ...args);
    } as any;

    res.on("finish", () => {
      const duration = Date.now() - start;
      if (reqPath.startsWith("/api")) {
        let line = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
        if (captured) line += ` :: ${JSON.stringify(captured)}`;
        if (line.length > 80) line = line.slice(0, 79) + "…";
        log(line);
      }
    });

    next();
  });

  connectToDatabase()
    .then((connected) => {
      if (connected) {
        log("MongoDB integration is active", "mongodb");
      } else {
        log(
          "Running without MongoDB support - using memory storage only",
          "mongodb",
        );
      }
    })
    .catch((error) => {
      log(`Failed to initialize MongoDB: ${error}`, "mongodb");
      log("Continuing with memory storage only", "mongodb");
    });

  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    res.status(status).json({ message });
    throw err;
  });

  return app;
}

import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { type Server } from "http";
import viteConfig from "../vite.config";
import { nanoid } from "nanoid";
import type { ServerOptions } from "vite";
import { log } from "./logger";

// Dynamically import Vite so production builds don’t bundle it
async function loadVite() {
  const mod = await import("vite");
  return {
    createViteServer: mod.createServer,
    createLogger: mod.createLogger,
  };
}

export async function setupVite(app: Express, server: Server) {
  const { createViteServer, createLogger } = await loadVite();
  const viteLogger = createLogger();

  const serverOptions: ServerOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true,
    fs: {
      allow: ['..'],
    },
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  });

  app.use(vite.middlewares);
  
  // Serve attached assets with explicit handling
  app.use("/attached_assets", (req, res, next) => {
    const filePath = path.resolve(import.meta.dirname, "..", "attached_assets", req.path.substring(1));
    res.sendFile(filePath, (err) => {
      if (err) {
        next();
      }
    });
  });

  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;

    // Skip asset requests
    if (url.startsWith('/attached_assets/')) {
      return next();
    }

    try {
      const clientTemplate = path.resolve(import.meta.dirname, "..", "client", "index.html");

      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );

      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

export function serveStatic(app: Express) {
  const distPath = path.resolve(import.meta.dirname, "public");

  if (!fs.existsSync(distPath)) {
    throw new Error(`Could not find the build directory: ${distPath}, make sure to build the client first`);
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}

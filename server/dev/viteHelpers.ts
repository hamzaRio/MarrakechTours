import express, { type Express } from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { type Server } from "http";
import { nanoid } from "nanoid";
import viteConfig from "../../vite.config";
import type { ServerOptions } from "vite";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

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
    fs: { allow: [".."] },
  };

  const vite = await createViteServer({
    ...viteConfig,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg: string, options?: any) => {
        viteLogger.error(msg, options);
        process.exit(1);
      },
    },
    server: serverOptions,
    appType: "custom",
  } as any);

  app.use(vite.middlewares);

  app.use("/attached_assets", (req, res, next) => {
    const filePath = path.resolve(__dirname, "..", "attached_assets", req.path.substring(1));
    res.sendFile(filePath, (err) => err && next());
  });

  app.use("*", async (req, res, next) => {
    try {
      const clientTemplate = path.resolve(__dirname, "..", "..", "client", "index.html");
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(`src="/src/main.tsx"`, `src="/src/main.tsx?v=${nanoid()}"`);
      const page = await vite.transformIndexHtml(req.originalUrl, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e as Error);
      next(e);
    }
  });
}

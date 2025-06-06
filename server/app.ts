import express, { type Request, type Response, type NextFunction, type Express } from 'express';
import { registerRoutes } from './routes';
import { log } from './vite';
import path from 'path';
import connectToDatabase from './config/database';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

export async function createApp(): Promise<Express> {
  const app = express();
  app.use(express.json());
  app.use(express.urlencoded({ extended: false }));

  const allowedOrigins = [
    'http://localhost:3000',
    'http://127.0.0.1:3000',
    process.env.CLIENT_URL || 'https://marrakech-deserts.vercel.app'
  ];

  app.use(cors({
    origin: function(origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) {
      if (!origin) return callback(null, true);
      if (allowedOrigins.indexOf(origin) === -1) {
        const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
        return callback(new Error(msg), false);
      }
      return callback(null, true);
    },
    credentials: true
  }));

  app.get('/api/health', (_req, res) => {
    res.status(200).json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  app.use('/attached_assets', express.static(path.join(process.cwd(), 'attached_assets')));

  app.use((req, res, next) => {
    const start = Date.now();
    const reqPath = req.path;
    let captured: Record<string, any> | undefined;

    const original = res.json.bind(res);
    res.json = function(body, ...args) {
      captured = body;
      return original(body, ...args);
    } as any;

    res.on('finish', () => {
      const duration = Date.now() - start;
      if (reqPath.startsWith('/api')) {
        let line = `${req.method} ${reqPath} ${res.statusCode} in ${duration}ms`;
        if (captured) line += ` :: ${JSON.stringify(captured)}`;
        if (line.length > 80) line = line.slice(0, 79) + '…';
        log(line);
      }
    });

    next();
  });

  connectToDatabase().then(connected => {
    if (connected) {
      log('MongoDB integration is active', 'mongodb');
    } else {
      log('Running without MongoDB support - using memory storage only', 'mongodb');
    }
  }).catch(error => {
    log(`Failed to initialize MongoDB: ${error}`, 'mongodb');
    log('Continuing with memory storage only', 'mongodb');
  });

  await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || 'Internal Server Error';
    res.status(status).json({ message });
    throw err;
  });

  return app;
}

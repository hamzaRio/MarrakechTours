// ✅ All imports must be at the top
import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { createApp } from './app';
import { log } from './logger';
import express from 'express';

// ✅ Load environment variables from server directory
dotenv.config({ path: path.join(import.meta.dirname, '.env') });

// ✅ Handle runtime errors
process.on('unhandledRejection', (err) => {
  log(`Unhandled Rejection: ${(err as Error).message}`, 'server');
});

process.on('uncaughtException', (err) => {
  log(`Uncaught Exception: ${(err as Error).message}`, 'server');
});

// ✅ Server boot logic
(async () => {
  const app = await createApp();
  const server = createServer(app);

  if (process.env.NODE_ENV !== 'production') {
    console.log('Running in development mode');
  } else {
    app.use(express.static('client/dist'));
  }

  const port = 5000;
  server.listen({ port, host: '0.0.0.0', reusePort: true }, () => {
    log(`Serving on port ${port}`);
  });
})();

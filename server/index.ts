import dotenv from 'dotenv';
import path from 'path';
import { createServer } from 'http';
import { createApp } from './app';
import { log } from './logger';

// Load environment variables from server directory
dotenv.config({ path: path.join(import.meta.dirname, '.env') });

process.on('unhandledRejection', (err) => {
  log(`Unhandled Rejection: ${(err as Error).message}`, 'server');
});

process.on('uncaughtException', (err) => {
  log(`Uncaught Exception: ${(err as Error).message}`, 'server');
});
import express from 'express';
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
    log(`serving on port ${port}`);
  });
})();

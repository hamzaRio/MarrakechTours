import { createServer } from 'http';
import { setupVite, serveStatic, log } from './vite';
import { createApp } from './app';

(async () => {
  const app = await createApp();
  const server = createServer(app);

  if (app.get('env') === 'development') {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const port = 5000;
  server.listen({ port, host: '0.0.0.0', reusePort: true }, () => {
    log(`serving on port ${port}`);
  });
})();

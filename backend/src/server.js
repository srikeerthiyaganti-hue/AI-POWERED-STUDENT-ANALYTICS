import 'dotenv/config';
import app from './app.js';
import { connectDB, disconnectDB } from './config/db.js';
import { logger } from './utils/logger.js';

const PORT = process.env.PORT || 5001;

async function startServer() {
  logger.info('Initializing CampusIQ Backend Server...');

  // Initialize DB (falls back to synthetic data automatically if MongoDB is offline)
  const dbStatus = await connectDB();
  logger.info(`Database mode: [${dbStatus.mode.toUpperCase()}] - ${dbStatus.message}`);

  const server = app.listen(PORT, () => {
    logger.info(`CampusIQ API server listening on http://localhost:${PORT}`);
    logger.info(`Health check available at http://localhost:${PORT}/api/health`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      logger.error(`Port ${PORT} is already in use by another process.`);
      logger.info(`To specify a different port, set PORT in backend/.env (e.g. PORT=5002) and update frontend/.env.`);
      process.exit(1);
    } else {
      logger.error('Server error:', err);
      process.exit(1);
    }
  });

  const shutdown = async (signal) => {
    logger.info(`Received ${signal}. Shutting down gracefully...`);
    server.close(async () => {
      await disconnectDB();
      logger.info('Closed out remaining connections.');
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));
}

startServer().catch((err) => {
  logger.error('Failed to start server:', err);
  process.exit(1);
});

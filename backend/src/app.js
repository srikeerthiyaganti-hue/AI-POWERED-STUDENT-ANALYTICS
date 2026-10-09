import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import healthRoutes from './routes/healthRoutes.js';
import studentRoutes from './routes/studentRoutes.js';
import analyticsRoutes from './routes/analyticsRoutes.js';
import interventionRoutes from './routes/interventionRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import { getAllRecommendations } from './controllers/recommendationController.js';
import { notFoundHandler, globalErrorHandler } from './middleware/errorHandler.js';
import { logger } from './utils/logger.js';

// Load environment variables
dotenv.config();

export function createApp() {
  const app = express();

  // CORS configuration: Allow local development frontend origins
  const devOrigins = ['http://localhost:5173', 'http://localhost:5174'];
  const envOrigins = process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(',').map((origin) => origin.trim()).filter(Boolean)
    : [];
  const allowedOrigins = Array.from(new Set([...devOrigins, ...envOrigins]));

  app.use(
    cors({
      origin: allowedOrigins,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
      credentials: true
    })
  );

  // Body parser
  app.use(express.json());

  // Minimal request logging
  app.use((req, res, next) => {
    logger.debug(`${req.method} ${req.url}`);
    next();
  });

  // Health check routes (Preserved from Phase 1)
  app.use('/api/health', healthRoutes);
  app.use('/health', healthRoutes);

  // Student and Analytics routes (Phase 2)
  app.use('/api/students', studentRoutes);
  app.use('/api/analytics', analyticsRoutes);

  // Phase 4: Interventions & Recommendations routes
  app.use('/api/interventions', interventionRoutes);
  app.get('/api/recommendations', getAllRecommendations);

  // Phase 5: Gemini AI Student Success Copilot routes
  app.use('/api/ai', aiRoutes);

  // Root endpoint info
  app.get('/', (req, res) => {
    res.json({
      name: 'CampusIQ API',
      status: 'online',
      documentation: '/docs',
      health: '/api/health',
      students: '/api/students',
      analytics: '/api/analytics/overview',
      interventions: '/api/interventions',
      recommendations: '/api/recommendations',
      aiInsights: '/api/ai/student-insights'
    });
  });

  // Catch 404
  app.use(notFoundHandler);

  // Global Error Handler
  app.use(globalErrorHandler);

  return app;
}

const app = createApp();
export default app;

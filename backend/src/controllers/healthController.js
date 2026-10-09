import { getDbStatus } from '../config/db.js';
import { syntheticDataService } from '../services/syntheticDataService.js';

export function getHealthStatus(req, res) {
  const dbStatus = getDbStatus();
  const summary = syntheticDataService.getAnalyticsSummary();

  const healthPayload = {
    status: 'ok',
    service: 'CampusIQ Backend API',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Number(process.uptime().toFixed(2)),
    environment: process.env.NODE_ENV || 'development',
    database: {
      status: dbStatus.connected ? 'connected' : 'fallback_active',
      mode: dbStatus.mode, // 'mongodb' | 'synthetic_fallback'
      message: dbStatus.message
    },
    syntheticFallback: {
      available: true,
      datasetSize: summary.totalStudents,
      supportedBranches: [
        { code: '04', name: 'Computer Science and Engineering', slug: 'CSE' },
        { code: '18', name: 'Artificial Intelligence and Machine Learning', slug: 'AIML' },
        { code: '19', name: 'Cybersecurity', slug: 'Cybersecurity' }
      ],
      sampleRegistrations: ['241FA04001', '241FA18001', '241FA19001']
    }
  };

  return res.status(200).json(healthPayload);
}

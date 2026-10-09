// CampusIQ AI Copilot Routes
import express from 'express';
import { getStudentInsights } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/student-insights
router.post('/student-insights', getStudentInsights);

export default router;

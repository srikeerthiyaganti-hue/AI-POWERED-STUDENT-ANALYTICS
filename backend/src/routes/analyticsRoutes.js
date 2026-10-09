import express from 'express';
import { getAnalyticsOverview, getScoringWeights } from '../controllers/analyticsController.js';

const router = express.Router();

// GET /api/analytics/overview - Cohort analytics overview
router.get('/overview', getAnalyticsOverview);

// GET /api/analytics/weights - Scoring model configuration & weights
router.get('/weights', getScoringWeights);

export default router;

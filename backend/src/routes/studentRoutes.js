import express from 'express';
import { getStudents, getStudentByIdOrReg } from '../controllers/studentController.js';
import { getStudentRecommendations } from '../controllers/recommendationController.js';

const router = express.Router();

// GET /api/students - List students with optional query filters
router.get('/', getStudents);

// GET /api/students/:idOrRegNo/recommendations - Retrieve personalized recommendations
router.get('/:idOrRegNo/recommendations', getStudentRecommendations);

// GET /api/students/:idOrRegNo - Retrieve full student profile with analytics
router.get('/:idOrRegNo', getStudentByIdOrReg);

export default router;

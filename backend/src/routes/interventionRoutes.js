import express from 'express';
import {
  createIntervention,
  getInterventions,
  getInterventionStats,
  getInterventionById,
  updateIntervention,
  deleteIntervention
} from '../controllers/interventionController.js';

const router = express.Router();

// List & Create routes
router.post('/', createIntervention);
router.get('/', getInterventions);

// CRITICAL SAFEGUARD:
// /stats route MUST be registered before /:id so Express does not capture "stats" as an :id parameter!
router.get('/stats', getInterventionStats);

// Single intervention resource routes
router.get('/:id', getInterventionById);
router.patch('/:id', updateIntervention);
router.put('/:id', updateIntervention);
router.delete('/:id', deleteIntervention);

export default router;

import { syntheticDataService } from '../services/syntheticDataService.js';
import { validateWeights, SCORE_WEIGHTS, MIN_DATA_COVERAGE_THRESHOLD } from '../services/analyticsEngine.js';

/**
 * Controller to get cohort-wide analytics overview
 */
export function getAnalyticsOverview(req, res) {
  try {
    const summary = syntheticDataService.getAnalyticsSummary();
    const weightsValidation = validateWeights();

    return res.status(200).json({
      status: 'success',
      data: {
        ...summary,
        scoringConfiguration: {
          weights: SCORE_WEIGHTS,
          weightsValidated: weightsValidation.isValid,
          minCoverageThreshold: MIN_DATA_COVERAGE_THRESHOLD
        }
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve analytics overview',
      details: err.message
    });
  }
}

/**
 * Controller to get scoring model configuration & weights
 */
export function getScoringWeights(req, res) {
  try {
    const weightsValidation = validateWeights();
    return res.status(200).json({
      status: 'success',
      data: weightsValidation
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve scoring model configuration',
      details: err.message
    });
  }
}

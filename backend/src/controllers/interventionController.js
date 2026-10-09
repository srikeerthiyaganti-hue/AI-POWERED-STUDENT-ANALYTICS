import { interventionService } from '../services/interventionService.js';

/**
 * Controller to create a new faculty intervention
 */
export async function createIntervention(req, res) {
  try {
    const intervention = await interventionService.createIntervention(req.body);
    return res.status(201).json({
      status: 'success',
      message: 'Intervention created successfully',
      data: intervention
    });
  } catch (err) {
    return res.status(400).json({
      status: 'error',
      message: err.message
    });
  }
}

/**
 * Controller to list interventions with filtering and pagination
 */
export async function getInterventions(req, res) {
  try {
    const { status, priority, branch, student, search, page, limit } = req.query;
    const result = await interventionService.getInterventions({
      status,
      priority,
      branch,
      student,
      search,
      page,
      limit
    });

    return res.status(200).json({
      status: 'success',
      data: result.interventions,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      },
      storage: result.storage
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve interventions',
      details: err.message
    });
  }
}

/**
 * Controller to retrieve high-level intervention metrics & alerts
 * IMPORTANT: MUST be registered before /:id route in Express router!
 */
export async function getInterventionStats(req, res) {
  try {
    const stats = await interventionService.getStats();
    return res.status(200).json({
      status: 'success',
      data: stats
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve intervention statistics',
      details: err.message
    });
  }
}

/**
 * Controller to retrieve a single intervention by ID
 */
export async function getInterventionById(req, res) {
  try {
    const { id } = req.params;
    const intervention = await interventionService.getById(id);

    if (!intervention) {
      return res.status(404).json({
        status: 'error',
        message: `Intervention with ID '${id}' not found`
      });
    }

    return res.status(200).json({
      status: 'success',
      data: intervention
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve intervention',
      details: err.message
    });
  }
}

/**
 * Controller to update an existing intervention
 */
export async function updateIntervention(req, res) {
  try {
    const { id } = req.params;
    const updated = await interventionService.updateIntervention(id, req.body);

    return res.status(200).json({
      status: 'success',
      message: 'Intervention updated successfully',
      data: updated
    });
  } catch (err) {
    const status = err.message.includes('not found') ? 404 : 400;
    return res.status(status).json({
      status: 'error',
      message: err.message
    });
  }
}

/**
 * Controller to delete an intervention
 */
export async function deleteIntervention(req, res) {
  try {
    const { id } = req.params;
    const success = await interventionService.deleteIntervention(id);

    if (!success) {
      return res.status(404).json({
        status: 'error',
        message: `Intervention with ID '${id}' not found`
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Intervention deleted successfully'
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete intervention',
      details: err.message
    });
  }
}

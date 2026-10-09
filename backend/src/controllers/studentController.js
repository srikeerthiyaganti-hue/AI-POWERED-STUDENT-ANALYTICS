import { syntheticDataService } from '../services/syntheticDataService.js';

/**
 * Controller to list students with filtering and pagination
 */
export function getStudents(req, res) {
  try {
    const {
      branch,
      riskLevel,
      placementStatus,
      search,
      minScore,
      maxScore,
      page = 1,
      limit = 50
    } = req.query;

    const result = syntheticDataService.getPaginatedStudents({
      branch,
      riskLevel,
      placementStatus,
      search,
      minScore,
      maxScore,
      page,
      limit
    });

    return res.status(200).json({
      status: 'success',
      data: result.students,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve students',
      details: err.message
    });
  }
}

/**
 * Controller to get single student profile by ID or Registration Number
 */
export function getStudentByIdOrReg(req, res) {
  try {
    const { idOrRegNo } = req.params;
    const student = syntheticDataService.getByIdOrRegistration(idOrRegNo);

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: `Student with identifier '${idOrRegNo}' not found`
      });
    }

    return res.status(200).json({
      status: 'success',
      data: student
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve student profile',
      details: err.message
    });
  }
}

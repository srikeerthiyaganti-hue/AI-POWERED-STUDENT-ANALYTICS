import { syntheticDataService } from '../services/syntheticDataService.js';
import { generateStudentRecommendations } from '../services/recommendationEngine.js';

/**
 * Controller to get personalized recommendations for a specific student
 */
export function getStudentRecommendations(req, res) {
  try {
    const { idOrRegNo } = req.params;
    const student = syntheticDataService.getByIdOrRegistration(idOrRegNo);

    if (!student) {
      return res.status(404).json({
        status: 'error',
        message: `Student with identifier '${idOrRegNo}' not found`
      });
    }

    const recommendations = generateStudentRecommendations(student);

    return res.status(200).json({
      status: 'success',
      data: {
        student: {
          id: student.id,
          registrationNumber: student.registrationNumber,
          name: student.name,
          branch: student.branchSlug || student.branchCode,
          cgpa: student.cgpa,
          attendanceRate: student.attendanceRate,
          riskLevel: student.academicRisk?.level || 'Low',
          placementStatus: student.placementReadiness?.status || 'Needs Upskilling',
          dataCoverage: student.analytics?.dataCoverage ?? 100
        },
        recommendations,
        total: recommendations.length
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to generate recommendations for student',
      details: err.message
    });
  }
}

/**
 * Controller to retrieve cohort-wide personalized recommendations
 */
export function getAllRecommendations(req, res) {
  try {
    const { priority, factor, branch, search, limit = 50, page = 1 } = req.query;

    const allStudents = syntheticDataService.getAllRawStudents();
    let aggregated = [];

    allStudents.forEach((student) => {
      const recs = generateStudentRecommendations(student);
      recs.forEach((r) => {
        aggregated.push({
          ...r,
          studentName: student.name,
          branchCode: student.branchCode,
          branchSlug: student.branchSlug || student.branchCode,
          cgpa: student.cgpa,
          attendanceRate: student.attendanceRate,
          riskLevel: student.academicRisk?.level || 'Low'
        });
      });
    });

    // Filtering
    if (priority) {
      aggregated = aggregated.filter((r) => r.priority.toLowerCase() === priority.toLowerCase());
    }
    if (factor) {
      aggregated = aggregated.filter((r) => r.factor.toLowerCase() === factor.toLowerCase());
    }
    if (branch) {
      const b = branch.toLowerCase();
      aggregated = aggregated.filter((r) => r.branchCode === branch || r.branchSlug.toLowerCase() === b);
    }
    if (search) {
      const q = search.toLowerCase().trim();
      aggregated = aggregated.filter(
        (r) =>
          r.studentRegistrationNumber.toLowerCase().includes(q) ||
          r.studentName.toLowerCase().includes(q) ||
          r.title.toLowerCase().includes(q) ||
          r.reason.toLowerCase().includes(q)
      );
    }

    const pageNum = Math.max(1, parseInt(page, 10));
    const limitNum = Math.max(1, parseInt(limit, 10));
    const total = aggregated.length;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = aggregated.slice(startIndex, startIndex + limitNum);

    // Distribution breakdown
    const distribution = {
      high: aggregated.filter((r) => r.priority === 'High').length,
      medium: aggregated.filter((r) => r.priority === 'Medium').length,
      low: aggregated.filter((r) => r.priority === 'Low').length
    };

    return res.status(200).json({
      status: 'success',
      data: paginated,
      meta: {
        total,
        distribution,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(total / limitNum)
      }
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: 'Failed to retrieve cohort recommendations',
      details: err.message
    });
  }
}

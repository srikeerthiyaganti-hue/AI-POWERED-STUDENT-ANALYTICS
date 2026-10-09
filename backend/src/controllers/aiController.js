// CampusIQ AI Copilot Controller
// Validates student identity, enforces rate limits, and orchestrates Gemini insights.

import { syntheticDataService } from '../services/syntheticDataService.js';
import { generateStudentInsights } from '../services/geminiService.js';
import { logger } from '../utils/logger.js';

// In-memory rate limiting map: ipOrKey -> { count, resetTime }
const rateLimitMap = new Map();
const RATE_LIMIT_WINDOW_MS = 60 * 1000; // 1 minute
const MAX_REQUESTS_PER_WINDOW = 20;

function checkRateLimit(clientKey) {
  const now = Date.now();
  const record = rateLimitMap.get(clientKey);

  if (!record || now > record.resetTime) {
    rateLimitMap.set(clientKey, { count: 1, resetTime: now + RATE_LIMIT_WINDOW_MS });
    return { allowed: true };
  }

  if (record.count >= MAX_REQUESTS_PER_WINDOW) {
    const retryAfterSeconds = Math.ceil((record.resetTime - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  record.count += 1;
  return { allowed: true };
}

/**
 * Controller: POST /api/ai/student-insights
 */
export async function getStudentInsights(req, res) {
  try {
    const { registrationNumber, studentName, question } = req.body || {};

    // 1. Validate registrationNumber
    if (!registrationNumber || typeof registrationNumber !== 'string' || !registrationNumber.trim()) {
      return res.status(400).json({
        status: 'error',
        code: 'INVALID_REGISTRATION_NUMBER',
        message: 'A valid student registration number is required.'
      });
    }

    const cleanRegNo = registrationNumber.trim().toUpperCase();

    // 2. Rate limiting check
    const clientKey = req.ip || cleanRegNo;
    const rateCheck = checkRateLimit(clientKey);
    if (!rateCheck.allowed) {
      return res.status(429).json({
        status: 'error',
        code: 'RATE_LIMIT_EXCEEDED',
        message: `Too many insight requests. Please wait ${rateCheck.retryAfterSeconds} seconds before retrying.`
      });
    }

    // 3. Validate optional question
    let cleanQuestion = null;
    if (question !== undefined && question !== null) {
      if (typeof question !== 'string') {
        return res.status(400).json({
          status: 'error',
          code: 'INVALID_QUESTION_FORMAT',
          message: 'Question must be a valid text string.'
        });
      }
      if (question.length > 500) {
        return res.status(400).json({
          status: 'error',
          code: 'QUESTION_TOO_LONG',
          message: 'Question is too long (maximum 500 characters allowed).'
        });
      }
      cleanQuestion = question.trim() || null;
    }

    // 4. Look up student in verified directory using existing service
    const student = syntheticDataService.getByIdOrRegistration(cleanRegNo);
    if (!student) {
      return res.status(404).json({
        status: 'error',
        code: 'STUDENT_NOT_FOUND',
        message: `Student with registration number '${cleanRegNo}' was not found in the student directory.`
      });
    }

    // 5. Identity verification safeguard: check for conflicting name if supplied
    if (studentName && typeof studentName === 'string') {
      const inputName = studentName.trim().toLowerCase();
      const actualName = (student.name || '').trim().toLowerCase();
      if (inputName && actualName && inputName !== 'unknown' && inputName !== actualName) {
        return res.status(400).json({
          status: 'error',
          code: 'IDENTITY_MISMATCH',
          message: `Identity conflict: Registration number '${cleanRegNo}' belongs to '${student.name}', not '${studentName}'.`
        });
      }
    }

    // 6. Generate AI insights via Gemini service
    const result = await generateStudentInsights({
      student,
      question: cleanQuestion,
      clientOverride: req.app?.locals?.geminiClientOverride || null
    });

    if (!result.success) {
      const errCode = result.error?.code || 'AI_SERVICE_ERROR';
      const statusCode =
        errCode === 'GEMINI_KEY_MISSING' ? 503 :
        errCode === 'GEMINI_TIMEOUT' ? 504 :
        errCode === 'GEMINI_RATE_LIMIT' ? 429 :
        errCode === 'GEMINI_MODEL_UNAVAILABLE' ? 503 :
        errCode === 'MALFORMED_AI_RESPONSE' ? 502 :
        errCode === 'GEMINI_AUTH_ERROR' ? 401 :
        502;

      return res.status(statusCode).json({
        status: 'error',
        code: errCode,
        message: result.error?.message || 'Failed to generate AI student insights.'
      });
    }

    return res.status(200).json({
      status: 'success',
      data: result.data
    });
  } catch (err) {
    logger.error('Unexpected error in getStudentInsights controller:', err.message);
    return res.status(500).json({
      status: 'error',
      code: 'SERVER_ERROR',
      message: 'Internal server error while processing student insights.',
      details: err.message
    });
  }
}

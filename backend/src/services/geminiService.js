// CampusIQ Gemini AI Student Success Copilot Service
// Integrates Google's official @google/genai SDK to generate explainable,
// evidence-backed student success insights without key exposure or score recalculation.

import { GoogleGenAI } from '@google/genai';
import { logger } from '../utils/logger.js';

const DEFAULT_MODEL = 'gemini-flash-latest';
const FALLBACK_MODELS = ['gemini-flash-latest', 'gemini-3.5-flash', 'gemini-3.8-flash'];
const REQUEST_TIMEOUT_MS = 30000;

/**
 * Sanitizes and extracts verified student facts to pass to Gemini
 * Prevents prompt bloat and strictly excludes internal implementation details.
 */
function extractVerifiedStudentContext(student) {
  const missingMetrics = [];

  // Check arrears strictly distinguishing 0 from null/undefined
  let arrearsStatus;
  if (student.arrears === null || student.arrears === undefined) {
    arrearsStatus = 'UNRECORDED / MISSING (Do NOT assume 0)';
    missingMetrics.push('Arrears / Backlog count');
  } else if (student.arrears === 0) {
    arrearsStatus = '0 (Clean academic record with no active backlogs)';
  } else {
    arrearsStatus = `${student.arrears} active backlogs pending`;
  }

  // Attendance
  let attendanceInfo;
  if (student.attendanceRate === null || student.attendanceRate === undefined) {
    attendanceInfo = 'UNRECORDED';
    missingMetrics.push('Attendance rate');
  } else {
    attendanceInfo = `${student.attendanceRate}%`;
  }

  // LMS
  let lmsInfo;
  const lmsScore = student.lmsScore ?? student.assignmentCompletionRate;
  if (lmsScore === null || lmsScore === undefined) {
    lmsInfo = 'UNRECORDED';
    missingMetrics.push('LMS / Assignment completion rate');
  } else {
    lmsInfo = `${lmsScore}%`;
  }

  // Engagement
  let engagementInfo;
  if (student.engagementScore === null || student.engagementScore === undefined) {
    engagementInfo = 'UNRECORDED';
    missingMetrics.push('Student engagement score');
  } else {
    engagementInfo = `${student.engagementScore}/100`;
  }

  // Placement assessments
  let codingInfo;
  if (student.codingScore === null || student.codingScore === undefined) {
    codingInfo = 'UNRECORDED';
    missingMetrics.push('Coding assessment score');
  } else {
    codingInfo = `${student.codingScore}%`;
  }

  let aptitudeInfo;
  if (student.aptitudeScore === null || student.aptitudeScore === undefined) {
    aptitudeInfo = 'UNRECORDED';
    missingMetrics.push('Aptitude assessment score');
  } else {
    aptitudeInfo = `${student.aptitudeScore}%`;
  }

  let mockInterviewInfo;
  if (student.mockInterviewScore === null || student.mockInterviewScore === undefined) {
    mockInterviewInfo = 'UNRECORDED';
    missingMetrics.push('Mock interview score');
  } else {
    mockInterviewInfo = `${student.mockInterviewScore}%`;
  }

  // Technical & professional skills
  let technicalSkillsInfo;
  if (student.technicalSkillsScore === null || student.technicalSkillsScore === undefined) {
    technicalSkillsInfo = 'UNRECORDED';
    missingMetrics.push('Technical skills score');
  } else {
    technicalSkillsInfo = `${student.technicalSkillsScore}/100`;
  }

  let professionalSkillsInfo;
  if (student.professionalSkillsScore === null || student.professionalSkillsScore === undefined) {
    professionalSkillsInfo = 'UNRECORDED';
    missingMetrics.push('Professional skills score');
  } else {
    professionalSkillsInfo = `${student.professionalSkillsScore}/100`;
  }

  // Mentor notes & feedback
  let mentorNotesInfo;
  if (!student.mentorNotes) {
    mentorNotesInfo = 'UNRECORDED';
    missingMetrics.push('Mentor qualitative notes');
  } else {
    mentorNotesInfo = student.mentorNotes;
  }

  let mentorFeedbackInfo;
  if (student.mentorFeedbackScore === null || student.mentorFeedbackScore === undefined) {
    mentorFeedbackInfo = 'UNRECORDED';
    missingMetrics.push('Mentor rating');
  } else {
    mentorFeedbackInfo = `${student.mentorFeedbackScore}/100`;
  }

  const analytics = student.analytics || {};
  const academicRisk = student.academicRisk || {};
  const placementReadiness = student.placementReadiness || {};

  return {
    verifiedIdentity: {
      registrationNumber: student.registrationNumber,
      name: student.name,
      branch: student.branch,
      branchCode: student.branchCode,
      semester: student.semester
    },
    academicProfile: {
      cgpa: student.cgpa ?? student.gpa ?? 'UNRECORDED',
      semesterGpa: Array.isArray(student.semesterGpa) ? student.semesterGpa.join(', ') : 'UNRECORDED',
      arrears: arrearsStatus,
      attendanceRate: attendanceInfo
    },
    assessmentsAndEngagement: {
      lmsAssignmentCompletion: lmsInfo,
      engagementScore: engagementInfo,
      codingScore: codingInfo,
      aptitudeScore: aptitudeInfo,
      mockInterviewScore: mockInterviewInfo,
      technicalSkillsScore: technicalSkillsInfo,
      professionalSkillsScore: professionalSkillsInfo
    },
    qualitativeFeedback: {
      mentorAssigned: student.mentorAssigned ? 'Yes' : 'No',
      mentorRating: mentorFeedbackInfo,
      mentorNotes: mentorNotesInfo
    },
    existingInstitutionalAnalytics: {
      successScore: analytics.successScore !== null && analytics.successScore !== undefined ? `${analytics.successScore}/100` : 'Not eligible (Insufficient data coverage)',
      dataCoverage: `${analytics.dataCoverage ?? 100}%`,
      scoringStatus: analytics.status || (analytics.isEligibleForScoring ? 'COMPUTED' : 'INSUFFICIENT_DATA'),
      academicRiskLevel: academicRisk.level || student.riskLevel || 'Unknown',
      academicRiskScore: academicRisk.riskScore ?? student.riskScore ?? 'N/A',
      academicRiskReasons: academicRisk.reasons || [],
      placementStatus: placementReadiness.status || 'Unknown',
      placementReasons: placementReadiness.reasons || []
    },
    missingMetrics
  };
}

/**
 * Builds system prompt and user content for Gemini
 */
function buildGeminiPrompt(studentContext, userQuestion = null) {
  const jsonSchemaInstructions = `
You are the CampusIQ AI Student Success Copilot, an institutional advisor supporting engineering faculty and mentors.
Your goal is to EXPLAIN the student's existing institutional analytics, provide actionable recommendations, and build a 4-week recovery/growth roadmap.

IMPORTANT CONSTRAINTS:
1. NEVER invent, fabricate, or assume scores, grades, attendance, arrears, or student facts.
2. If arrears are UNRECORDED, do NOT assume zero backlogs. Explicitly call out that verification is required.
3. Clearly distinguish verified facts from recommendations.
4. Do NOT replace or recalculate the Success Score or risk classification. Explain the existing ones.
5. Do NOT claim the system predicts future success with certainty; frame all predictions as advisory guidelines.
6. Return your entire response in strictly valid JSON format conforming to the exact schema below, with no markdown code fences or conversational preamble.

REQUIRED JSON SCHEMA:
{
  "performanceExplanation": "A 2-3 paragraph objective explanation of why the student has their current Success Score and risk level, citing specific metrics (CGPA, attendance, assessments).",
  "mainContributingFactors": [
    {
      "factor": "Name of factor (e.g. Attendance, Coding Assessment, Academic Backlogs)",
      "impact": "Positive" | "Negative" | "Neutral",
      "observation": "Specific factual observation from the student's profile."
    }
  ],
  "personalizedActions": [
    {
      "priority": "High" | "Medium" | "Low",
      "factor": "attendance" | "academics" | "coding" | "aptitude" | "engagement" | "data_verification" | "skills",
      "action": "Concrete, actionable task (must provide 3 to 5 total actions).",
      "rationale": "Clear rationale based on verified student data."
    }
  ],
  "fourWeekRoadmap": {
    "week1": "Specific measurable milestone for Week 1.",
    "week2": "Specific measurable milestone for Week 2.",
    "week3": "Specific measurable milestone for Week 3.",
    "week4": "Specific measurable milestone for Week 4."
  },
  "missingDataAndUncertainty": {
    "unrecordedMetrics": ["List of metrics missing from student record"],
    "limitations": "Explanation of how unrecorded data limits confidence in this assessment.",
    "certaintyDisclaimer": "This analysis is an advisory aid based on recorded campus metrics and does not guarantee academic or placement outcomes."
  },
  "questionAnswer": ${userQuestion ? '"Direct, constructive answer to the faculty/user question."' : 'null'}
}
`;

  const studentDataText = JSON.stringify(studentContext, null, 2);

  const promptText = `
STUDENT VERIFIED RECORD:
${studentDataText}

${userQuestion ? `FACULTY/USER QUESTION TO ANSWER:\n"${userQuestion}"\n` : 'NO CUSTOM QUESTION PROVIDED. Provide comprehensive performance explanation and roadmap.'}

Follow the schema and instructions strictly. Output JSON only.
`;

  return { systemInstruction: jsonSchemaInstructions, promptText };
}

/**
 * Validates and sanitizes the parsed AI response to ensure schema integrity
 */
function validateAndSanitizeAiResponse(rawJson, studentContext) {
  if (!rawJson || typeof rawJson !== 'object') {
    throw new Error('AI output is not a valid JSON object');
  }

  // 1. Performance Explanation
  const performanceExplanation = typeof rawJson.performanceExplanation === 'string' && rawJson.performanceExplanation.trim()
    ? rawJson.performanceExplanation.trim()
    : `Analysis for ${studentContext.verifiedIdentity.name} (${studentContext.verifiedIdentity.registrationNumber}): Current Success Score is ${studentContext.existingInstitutionalAnalytics.successScore} with ${studentContext.existingInstitutionalAnalytics.academicRiskLevel} academic risk.`;

  // 2. Contributing Factors
  let mainContributingFactors = Array.isArray(rawJson.mainContributingFactors)
    ? rawJson.mainContributingFactors.map((item) => {
        if (typeof item === 'string') {
          return { factor: 'Institutional Metric', impact: 'Neutral', observation: item };
        }
        return {
          factor: item.factor || 'Institutional Factor',
          impact: ['Positive', 'Negative', 'Neutral'].includes(item.impact) ? item.impact : 'Neutral',
          observation: item.observation || 'Recorded in institutional profile.'
        };
      })
    : [];

  if (mainContributingFactors.length === 0) {
    mainContributingFactors = [
      {
        factor: 'Academic Performance',
        impact: studentContext.academicProfile.cgpa >= 7.0 ? 'Positive' : 'Negative',
        observation: `CGPA is ${studentContext.academicProfile.cgpa}. Arrears: ${studentContext.academicProfile.arrears}.`
      },
      {
        factor: 'Attendance',
        impact: studentContext.academicProfile.attendanceRate !== 'UNRECORDED' && parseFloat(studentContext.academicProfile.attendanceRate) >= 75 ? 'Positive' : 'Negative',
        observation: `Attendance recorded at ${studentContext.academicProfile.attendanceRate}.`
      }
    ];
  }

  // 3. Personalized Actions (Must be 3 to 5 actions)
  let personalizedActions = Array.isArray(rawJson.personalizedActions)
    ? rawJson.personalizedActions.filter((a) => a && (a.action || a.title)).map((a) => ({
        priority: ['High', 'Medium', 'Low'].includes(a.priority) ? a.priority : 'Medium',
        factor: a.factor || 'academics',
        action: (a.action || a.title || '').trim(),
        rationale: (a.rationale || a.reason || 'Derived from current performance indicators.').trim()
      }))
    : [];

  // Enforce 3 to 5 actions
  if (personalizedActions.length < 3) {
    if (studentContext.missingMetrics.length > 0) {
      personalizedActions.push({
        priority: 'High',
        factor: 'data_verification',
        action: 'Synchronize missing academic records with departmental advisor.',
        rationale: `Unrecorded fields (${studentContext.missingMetrics.join(', ')}) limit profile completeness.`
      });
    }
    personalizedActions.push({
      priority: 'Medium',
      factor: 'academics',
      action: 'Maintain consistent attendance in all lab and theory courses above institutional benchmarks.',
      rationale: 'Consistent classroom engagement reinforces academic success.'
    });
    personalizedActions.push({
      priority: 'Low',
      factor: 'skills',
      action: 'Participate in weekly coding practice and mock aptitude sessions.',
      rationale: 'Regular skill assessments improve campus placement readiness.'
    });
  }

  personalizedActions = personalizedActions.slice(0, 5);

  // 4. Four-week roadmap
  const rawRoadmap = rawJson.fourWeekRoadmap || {};
  const fourWeekRoadmap = {
    week1: typeof rawRoadmap.week1 === 'string' && rawRoadmap.week1.trim()
      ? rawRoadmap.week1.trim()
      : 'Review attendance records and establish weekly study milestones with course faculty.',
    week2: typeof rawRoadmap.week2 === 'string' && rawRoadmap.week2.trim()
      ? rawRoadmap.week2.trim()
      : 'Complete all pending LMS assignments and attend technical practice sessions.',
    week3: typeof rawRoadmap.week3 === 'string' && rawRoadmap.week3.trim()
      ? rawRoadmap.week3.trim()
      : 'Participate in benchmark mock assessments and review mentor feedback.',
    week4: typeof rawRoadmap.week4 === 'string' && rawRoadmap.week4.trim()
      ? rawRoadmap.week4.trim()
      : 'Conduct end-of-month progress review with assigned faculty mentor.'
  };

  // 5. Missing Data & Uncertainty
  const rawUncertainty = rawJson.missingDataAndUncertainty || {};
  const missingDataAndUncertainty = {
    unrecordedMetrics: Array.isArray(rawUncertainty.unrecordedMetrics) && rawUncertainty.unrecordedMetrics.length > 0
      ? rawUncertainty.unrecordedMetrics
      : studentContext.missingMetrics,
    limitations: typeof rawUncertainty.limitations === 'string' && rawUncertainty.limitations.trim()
      ? rawUncertainty.limitations.trim()
      : studentContext.missingMetrics.length > 0
        ? `Assessment is constrained by ${studentContext.missingMetrics.length} unrecorded metric(s). Missing data must be verified before high-stakes decisions.`
        : 'All core metrics are recorded; continuous tracking is recommended.',
    certaintyDisclaimer: typeof rawUncertainty.certaintyDisclaimer === 'string' && rawUncertainty.certaintyDisclaimer.trim()
      ? rawUncertainty.certaintyDisclaimer.trim()
      : 'This AI Copilot provides advisory guidance based on available institutional metrics. It does not predict future academic or placement outcomes with certainty.'
  };

  // 6. Question answer
  const questionAnswer = typeof rawJson.questionAnswer === 'string' && rawJson.questionAnswer.trim()
    ? rawJson.questionAnswer.trim()
    : null;

  return {
    performanceExplanation,
    mainContributingFactors,
    personalizedActions,
    fourWeekRoadmap,
    missingDataAndUncertainty,
    questionAnswer,
    metadata: {
      studentRegistrationNumber: studentContext.verifiedIdentity.registrationNumber,
      studentName: studentContext.verifiedIdentity.name,
      generatedAt: new Date().toISOString(),
      model: process.env.GEMINI_MODEL || DEFAULT_MODEL
    }
  };
}

/**
 * Strips markdown code block formatting (e.g. ```json ... ```) from model text
 */
function extractJsonFromText(rawText) {
  if (!rawText) return null;
  let cleaned = rawText.trim();
  // Remove markdown fences
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
  }
  return cleaned.trim();
}

/**
 * Main Service: Generates student success insights using Google Gemini
 * Accepts optional clientOverride for hermetic automated tests.
 */
export async function generateStudentInsights({ student, question = null, clientOverride = null }) {
  if (!student) {
    return {
      success: false,
      error: {
        code: 'STUDENT_REQUIRED',
        message: 'A verified student record is required to generate AI insights.'
      }
    };
  }

  // 1. Check for API key (unless clientOverride is passed for testing)
  const apiKey = (process.env.GEMINI_API_KEY || '').trim();
  const isKeyPlaceholder = !apiKey || apiKey.toLowerCase().includes('your_') || apiKey.toLowerCase().includes('placeholder');
  if (isKeyPlaceholder && !clientOverride) {
    logger.warn('Gemini API key is not configured or is a placeholder. Returning safe GEMINI_KEY_MISSING error.');
    return {
      success: false,
      error: {
        code: 'GEMINI_KEY_MISSING',
        message: 'Gemini API key is not configured on the server. Please add a valid GEMINI_API_KEY to backend/.env and restart the server.'
      }
    };
  }

  const preferredModel = (process.env.GEMINI_MODEL || '').trim() || DEFAULT_MODEL;
  const candidateModels = Array.from(new Set([preferredModel, ...FALLBACK_MODELS]));
  const studentContext = extractVerifiedStudentContext(student);
  const { systemInstruction, promptText } = buildGeminiPrompt(studentContext, question);

  try {
    let rawResponseText;
    let activeModelUsed = preferredModel;

    if (clientOverride) {
      // Test mock path
      const mockResult = await clientOverride.generateContent({
        model: preferredModel,
        contents: promptText,
        systemInstruction
      });
      rawResponseText = mockResult.text;
    } else {
      // Real GoogleGenAI path with automatic model fallback for 404/deprecated models
      const ai = new GoogleGenAI({ apiKey });
      let lastModelError = null;

      for (const m of candidateModels) {
        try {
          logger.info(`Attempting Gemini analysis with model [${m}]...`);
          const apiCallPromise = ai.models.generateContent({
            model: m,
            contents: promptText,
            config: {
              systemInstruction,
              responseMimeType: 'application/json',
              temperature: 0.2
            }
          });

          const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('GEMINI_TIMEOUT: Request timed out')), REQUEST_TIMEOUT_MS)
          );

          const response = await Promise.race([apiCallPromise, timeoutPromise]);
          rawResponseText = response?.text;
          activeModelUsed = m;
          logger.info(`Gemini analysis succeeded with model [${m}].`);
          break;
        } catch (callErr) {
          lastModelError = callErr;
          const msg = callErr.message || '';
          const isModelUnavailable =
            callErr.status === 404 ||
            callErr.status === 503 ||
            msg.includes('404') ||
            msg.includes('503') ||
            msg.toLowerCase().includes('not_found') ||
            msg.toLowerCase().includes('no longer available') ||
            msg.toLowerCase().includes('high demand') ||
            msg.toLowerCase().includes('unavailable');

          if (isModelUnavailable) {
            logger.warn(`Model [${m}] is unavailable (${callErr.status || 'unavailable'}). Trying fallback model...`);
            continue;
          }
          // For quota/auth/timeout/etc., fail fast
          throw callErr;
        }
      }

      if (!rawResponseText && lastModelError) {
        throw lastModelError;
      }
    }

    if (!rawResponseText) {
      throw new Error('Empty response received from Gemini provider');
    }

    const cleanedJsonText = extractJsonFromText(rawResponseText);
    let parsedData;
    try {
      parsedData = JSON.parse(cleanedJsonText);
    } catch (parseErr) {
      logger.error('Failed to parse Gemini response as JSON:', parseErr.message);
      return {
        success: false,
        error: {
          code: 'MALFORMED_AI_RESPONSE',
          message: 'The AI model returned an unparseable response. Please retry.'
        }
      };
    }

    const sanitizedData = validateAndSanitizeAiResponse(parsedData, studentContext);
    if (sanitizedData.metadata) {
      sanitizedData.metadata.model = activeModelUsed;
    }

    return {
      success: true,
      data: sanitizedData
    };
  } catch (err) {
    const errMsg = (err.message || '').replace(/AIza[0-9A-Za-z-_]{35}/g, '[REDACTED_KEY]');
    logger.error('Gemini AI generation failed:', errMsg);

    if (errMsg.includes('GEMINI_TIMEOUT') || err.name === 'AbortError') {
      return {
        success: false,
        error: {
          code: 'GEMINI_TIMEOUT',
          message: 'The AI provider request timed out. Please try again in a few moments.'
        }
      };
    }

    if (errMsg.includes('429') || errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('rate limit')) {
      return {
        success: false,
        error: {
          code: 'GEMINI_RATE_LIMIT',
          message: 'Gemini AI rate limit or quota exceeded. Please wait a moment before retrying.'
        }
      };
    }

    if (
      errMsg.toLowerCase().includes('api key') ||
      errMsg.toLowerCase().includes('api_key') ||
      errMsg.toLowerCase().includes('unauthorized') ||
      errMsg.toLowerCase().includes('forbidden') ||
      errMsg.toLowerCase().includes('invalid argument') ||
      errMsg.includes('401') ||
      errMsg.includes('403')
    ) {
      return {
        success: false,
        error: {
          code: 'GEMINI_AUTH_ERROR',
          message: 'Authentication with Google Gemini failed. Please verify that a valid GEMINI_API_KEY is configured in backend/.env.'
        }
      };
    }

    if (
      err.status === 404 ||
      errMsg.includes('404') ||
      errMsg.toLowerCase().includes('not_found') ||
      errMsg.toLowerCase().includes('no longer available')
    ) {
      return {
        success: false,
        error: {
          code: 'GEMINI_MODEL_UNAVAILABLE',
          message: 'The configured Gemini AI model is unavailable or deprecated. Please verify GEMINI_MODEL in backend/.env.'
        }
      };
    }

    return {
      success: false,
      error: {
        code: 'GEMINI_PROVIDER_ERROR',
        message: 'Gemini AI service encountered an error while analyzing student data. Please try again.'
      }
    };
  }
}

import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Compass,
  ArrowRight,
  RefreshCw,
  Lightbulb,
  ShieldAlert,
  Clock,
  Layers,
  ChevronRight,
  Info
} from 'lucide-react';
import { generateStudentInsights } from '../services/api.js';

export function AiSuccessCopilot({ student, isStudentUnavailable }) {
  const [question, setQuestion] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [insightData, setInsightData] = useState(null);
  const [errorInfo, setErrorInfo] = useState(null);
  const [lastAskedQuestion, setLastAskedQuestion] = useState(null);

  const regNo = student?.registrationNumber || student?.id;
  const studentName = student?.name;

  const handleGenerate = async (customQ = null) => {
    if (isStudentUnavailable || !regNo) return;

    setIsLoading(true);
    setErrorInfo(null);
    const qToAsk = customQ !== null ? customQ : question;

    const res = await generateStudentInsights({
      registrationNumber: regNo,
      studentName,
      question: qToAsk || undefined
    });

    setIsLoading(false);

    if (res.success && res.data) {
      setInsightData(res.data);
      setLastAskedQuestion(qToAsk || null);
      setErrorInfo(null);
    } else {
      setErrorInfo({
        code: res.code || 'UNKNOWN_ERROR',
        message: res.error || 'Failed to generate AI insights.'
      });
    }
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (!question.trim() || isLoading || isStudentUnavailable) return;
    handleGenerate(question.trim());
  };

  const handleQuickExplain = () => {
    setQuestion('');
    handleGenerate('');
  };

  const renderPriorityBadge = (priority) => {
    const p = (priority || 'Medium').toLowerCase();
    return <span className={`pill-badge pill-badge--risk-${p}`}>{priority} Priority</span>;
  };

  return (
    <div className="section-card copilot-container">
      {/* Copilot Header */}
      <div className="copilot-header">
        <div className="copilot-title-group">
          <div className="copilot-icon-badge">
            <Sparkles size={18} className="text-gemini" />
          </div>
          <div>
            <h4 className="copilot-title">
              Gemini AI Student Success Copilot
              <span className="copilot-tag">Verified Advisory</span>
            </h4>
            <p className="copilot-subtitle">
              Explainable AI analysis and 4-week action plans powered by Google Gemini
            </p>
          </div>
        </div>

        <button
          type="button"
          className="btn-sm btn-gemini-quick"
          onClick={handleQuickExplain}
          disabled={isLoading || isStudentUnavailable}
          title={
            isStudentUnavailable
              ? 'AI Copilot unavailable for unverified profiles'
              : 'Generate comprehensive performance explanation'
          }
        >
          <Sparkles size={14} /> Explain Performance
        </button>
      </div>

      {/* Unverified Record Advisory */}
      {isStudentUnavailable && (
        <div className="copilot-alert copilot-alert--muted">
          <ShieldAlert size={16} />
          <span>
            AI Copilot is disabled for unverified records to prevent hallucinated insights. Please verify student registration in the directory.
          </span>
        </div>
      )}

      {/* Interactive Question Input Form */}
      {!isStudentUnavailable && (
        <form onSubmit={handleFormSubmit} className="copilot-input-form">
          <div className="copilot-input-wrapper">
            <input
              type="text"
              className="copilot-input"
              placeholder="Ask Copilot a question (e.g., 'What coding topics should this student prioritize?')"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              maxLength={500}
              disabled={isLoading}
            />
            {question && (
              <span className="copilot-char-count">{question.length}/500</span>
            )}
          </div>
          <button
            type="submit"
            className="btn-gemini-submit"
            disabled={isLoading || !question.trim()}
          >
            {isLoading ? (
              <RefreshCw size={14} className="spin-icon" />
            ) : (
              <Send size={14} />
            )}
            <span>Ask Copilot</span>
          </button>
        </form>
      )}

      {/* Loading State */}
      {isLoading && (
        <div className="copilot-loading-card">
          <RefreshCw size={22} className="spin-icon text-gemini" />
          <div className="copilot-loading-text">
            <p className="copilot-loading-title">Analyzing Verified Student Record...</p>
            <p className="copilot-loading-sub">
              Synthesizing academics, attendance, skills, and institutional risk factors with Gemini AI.
            </p>
          </div>
        </div>
      )}

      {/* Error Alert with Safe Guidance & Retry */}
      {!isLoading && errorInfo && (
        <div className="copilot-alert copilot-alert--error">
          <AlertCircle size={18} className="copilot-alert-icon" />
          <div className="copilot-alert-content">
            <h5 className="copilot-alert-title">
              {errorInfo.code === 'GEMINI_KEY_MISSING'
                ? 'Gemini API Key Required'
                : errorInfo.code === 'GEMINI_AUTH_ERROR'
                ? 'Gemini Authentication Issue'
                : errorInfo.code === 'GEMINI_MODEL_UNAVAILABLE'
                ? 'Configured Gemini Model Unavailable'
                : errorInfo.code === 'GEMINI_RATE_LIMIT'
                ? 'Gemini Rate Limit / Quota Exceeded'
                : errorInfo.code === 'GEMINI_TIMEOUT'
                ? 'AI Request Timed Out'
                : 'Unable to Generate AI Insights'}
            </h5>
            <p className="copilot-alert-msg">{errorInfo.message}</p>
            {errorInfo.code === 'GEMINI_KEY_MISSING' && (
              <p className="copilot-alert-tip">
                Tip: Add <code>GEMINI_API_KEY=your_key_here</code> into <code>backend/.env</code> and restart the backend server.
              </p>
            )}
            {errorInfo.code === 'GEMINI_MODEL_UNAVAILABLE' && (
              <p className="copilot-alert-tip">
                Tip: The configured model is unavailable. Set <code>GEMINI_MODEL=gemini-3.8-flash</code> in <code>backend/.env</code>.
              </p>
            )}
            {errorInfo.code === 'GEMINI_RATE_LIMIT' && (
              <p className="copilot-alert-tip">
                Tip: Quota exceeded for this Gemini model. Please wait a moment or check your Google AI Studio plan.
              </p>
            )}
          </div>
          <button
            type="button"
            className="btn-retry-sm"
            onClick={() => handleGenerate(lastAskedQuestion ?? '')}
            title="Retry request"
          >
            <RefreshCw size={13} /> Retry
          </button>
        </div>
      )}

      {/* Insight Display Panel */}
      {!isLoading && insightData && (
        <div className="copilot-results">
          {/* Answer to Custom Question (if asked) */}
          {insightData.questionAnswer && (
            <div className="copilot-qa-card">
              <div className="copilot-qa-header">
                <Lightbulb size={16} className="text-amber" />
                <span className="copilot-qa-label">
                  Answer to Question: <em>"{lastAskedQuestion}"</em>
                </span>
              </div>
              <p className="copilot-qa-body">{insightData.questionAnswer}</p>
            </div>
          )}

          {/* 1. Performance Explanation Card */}
          <div className="copilot-card">
            <h5 className="copilot-card-title">
              <Compass size={16} className="text-blue" /> Institutional Performance Explanation
            </h5>
            <div className="copilot-card-body">
              <p className="copilot-explanation-text">
                {insightData.performanceExplanation}
              </p>
            </div>
          </div>

          {/* 2. Main Contributing Factors */}
          {insightData.mainContributingFactors && insightData.mainContributingFactors.length > 0 && (
            <div className="copilot-card">
              <h5 className="copilot-card-title">
                <Layers size={16} className="text-teal" /> Key Contributing Assessment Factors
              </h5>
              <div className="copilot-factors-grid">
                {insightData.mainContributingFactors.map((f, i) => (
                  <div
                    key={i}
                    className={`copilot-factor-item copilot-factor-item--${(f.impact || 'neutral').toLowerCase()}`}
                  >
                    <div className="copilot-factor-top">
                      <span className="copilot-factor-name">{f.factor}</span>
                      <span className={`factor-impact-badge impact-${(f.impact || 'neutral').toLowerCase()}`}>
                        {f.impact}
                      </span>
                    </div>
                    <p className="copilot-factor-obs">{f.observation}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. Personalized Actions (3-5 items) */}
          {insightData.personalizedActions && insightData.personalizedActions.length > 0 && (
            <div className="copilot-card">
              <h5 className="copilot-card-title">
                <CheckCircle2 size={16} className="text-emerald" /> Prioritized Improvement Actions ({insightData.personalizedActions.length})
              </h5>
              <div className="copilot-actions-list">
                {insightData.personalizedActions.map((act, i) => (
                  <div key={i} className="copilot-action-row">
                    <div className="copilot-action-meta">
                      {renderPriorityBadge(act.priority)}
                      <span className="factor-tag">{act.factor.replace('_', ' ')}</span>
                    </div>
                    <div className="copilot-action-body">
                      <p className="copilot-action-task">
                        <strong>Action:</strong> {act.action}
                      </p>
                      {act.rationale && (
                        <p className="copilot-action-why">
                          <strong>Rationale:</strong> {act.rationale}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 4. Four-Week Milestone Roadmap */}
          {insightData.fourWeekRoadmap && (
            <div className="copilot-card">
              <h5 className="copilot-card-title">
                <Calendar size={16} className="text-purple" /> 4-Week Structured Success Roadmap
              </h5>
              <div className="copilot-roadmap-grid">
                {[
                  { week: 'Week 1', milestone: insightData.fourWeekRoadmap.week1 },
                  { week: 'Week 2', milestone: insightData.fourWeekRoadmap.week2 },
                  { week: 'Week 3', milestone: insightData.fourWeekRoadmap.week3 },
                  { week: 'Week 4', milestone: insightData.fourWeekRoadmap.week4 }
                ].map((step, idx) => (
                  <div key={idx} className="copilot-roadmap-step">
                    <div className="copilot-roadmap-step-header">
                      <span className="copilot-step-badge">{step.week}</span>
                      <ChevronRight size={14} className="text-muted" />
                    </div>
                    <p className="copilot-step-text">{step.milestone}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 5. Missing Data & Uncertainty Advisory */}
          {insightData.missingDataAndUncertainty && (
            <div className="copilot-uncertainty-card">
              <div className="copilot-uncertainty-header">
                <Info size={16} className="text-slate-600" />
                <h6 className="copilot-uncertainty-title">Data Coverage & Predictive Confidence Advisory</h6>
              </div>
              <div className="copilot-uncertainty-body">
                {insightData.missingDataAndUncertainty.unrecordedMetrics &&
                insightData.missingDataAndUncertainty.unrecordedMetrics.length > 0 ? (
                  <div className="unrecorded-pills-wrap">
                    <span className="unrecorded-label">Unrecorded / Pending Verification:</span>
                    {insightData.missingDataAndUncertainty.unrecordedMetrics.map((metric, i) => (
                      <span key={i} className="unrecorded-pill">
                        {metric}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="uncertainty-note-clean">
                    <CheckCircle2 size={13} className="text-emerald" /> Core institutional indicators are confirmed recorded.
                  </p>
                )}
                <p className="uncertainty-limitations">
                  {insightData.missingDataAndUncertainty.limitations}
                </p>
                <p className="uncertainty-disclaimer">
                  <em>{insightData.missingDataAndUncertainty.certaintyDisclaimer}</em>
                </p>
              </div>
            </div>
          )}

          {/* Footer Metadata */}
          {insightData.metadata && (
            <div className="copilot-footer-meta">
              <span>Model: {insightData.metadata.model}</span>
              <span>•</span>
              <span>Generated: {new Date(insightData.metadata.generatedAt).toLocaleTimeString()}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AiSuccessCopilot;

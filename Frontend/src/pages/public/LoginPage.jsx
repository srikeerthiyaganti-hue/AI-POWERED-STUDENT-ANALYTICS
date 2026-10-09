import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Info,
  Building2,
  GraduationCap,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Sparkles,
  Server,
  AlertCircle,
  KeyRound,
} from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, authLoading, backendStatus } = useAuth();

  const [portal, setPortal] = useState('institution'); // 'institution' | 'student'
  const [identifier, setIdentifier] = useState('admin@codebuffet.edu');
  const [password, setPassword] = useState('CodeBuffet@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Switch portal and populate sensible defaults
  const handlePortalSwitch = (newPortal) => {
    setPortal(newPortal);
    setError('');
    if (newPortal === 'student') {
      setIdentifier('STU-2024-042');
      setPassword('Student@2026!');
    } else {
      setIdentifier('admin@codebuffet.edu');
      setPassword('CodeBuffet@2026!');
    }
  };

  // Helper to prefill verified demo credentials into the form
  const handleQuickFill = (roleKey) => {
    setError('');
    if (roleKey === 'admin') {
      setPortal('institution');
      setIdentifier('admin@codebuffet.edu');
      setPassword('CodeBuffet@2026!');
    } else if (roleKey === 'student') {
      setPortal('student');
      setIdentifier('STU-2024-042');
      setPassword('Student@2026!');
    } else if (roleKey === 'mentor') {
      setPortal('institution');
      setIdentifier('rajesh.kumar@codebuffet.edu');
      setPassword('Mentor@2026!');
    } else if (roleKey === 'tpo') {
      setPortal('institution');
      setIdentifier('vikram.tpo@codebuffet.edu');
      setPassword('TPO@2026!');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const cleanId = identifier.trim();
    const cleanPass = password.trim();

    if (!cleanId) {
      setError(
        portal === 'student'
          ? 'Please enter your Registration Number or Student Email.'
          : 'Please enter your Institutional Email or Employee ID.'
      );
      return;
    }

    if (!cleanPass) {
      setError('Please enter your password.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await login(cleanId, cleanPass, portal === 'student' ? 'student' : 'admin');
      if (res?.user) {
        if (res.user.role === 'student') {
          navigate('/student/dashboard');
        } else if (res.user.role === 'mentor') {
          navigate('/mentor/dashboard');
        } else if (res.user.role === 'tpo') {
          navigate('/placement/dashboard');
        } else {
          navigate('/institution/dashboard');
        }
      }
    } catch (err) {
      setError(err.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
      }}
      className="login-container"
    >
      {/* =========================================================================
          LEFT SIDE: AUTHENTICATION FORM & DEMO CONTROLS
          ========================================================================= */}
      <div
        style={{
          flex: '1 1 50%',
          maxWidth: '640px',
          padding: '2.5rem 3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          zIndex: 5,
        }}
        className="login-form-wrapper"
      >
        {/* Top Header: Logo + Nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <BrandLogo variant="light" size="default" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', fontSize: '0.88rem' }}>
            <Link
              to="/"
              style={{
                color: 'var(--color-navy)',
                textDecoration: 'none',
                fontWeight: 600,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
              }}
            >
              Home
            </Link>
            <button
              onClick={() => setShowResetModal(true)}
              style={{
                background: 'none',
                border: 'none',
                color: 'var(--color-text-secondary)',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                cursor: 'pointer',
                fontSize: '0.88rem',
              }}
            >
              <HelpCircle size={15} />
              <span>Security Help</span>
            </button>
          </div>
        </div>

        {/* Center Main Form */}
        <div style={{ maxWidth: '440px', width: '100%', margin: '0 auto' }}>
          {/* Eyebrow & Live Backend Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-blue-primary)',
              }}
            >
              SECURE ACCESS
            </div>
            <div
              style={{
                fontSize: '0.72rem',
                fontWeight: 600,
                padding: '2px 8px',
                borderRadius: '9999px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                backgroundColor: backendStatus === 'connected' ? '#ECFDF5' : '#FFFBEB',
                color: backendStatus === 'connected' ? '#059669' : '#D97706',
                border: `1px solid ${backendStatus === 'connected' ? '#A7F3D0' : '#FDE68A'}`,
              }}
            >
              <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: backendStatus === 'connected' ? '#10B981' : '#F59E0B' }} />
              <span>{backendStatus === 'connected' ? 'FastAPI Backend Online' : 'Checking API...'}</span>
            </div>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: '2.1rem',
              fontWeight: 700,
              color: 'var(--color-navy)',
              lineHeight: 1.15,
              marginBottom: '0.4rem',
            }}
          >
            Welcome to CODEBUFFET<span style={{ color: 'var(--color-blue-bright)' }}>.</span>
          </h1>

          {/* Subtitle */}
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', marginBottom: '1.5rem' }}>
            Analytics & AI-Powered Student Success Platform
          </p>

          {/* Portal Switcher Tabs */}
          <div
            style={{
              display: 'flex',
              backgroundColor: 'var(--color-bg-page)',
              border: '1px solid var(--color-border)',
              padding: '4px',
              borderRadius: 'var(--radius-sm)',
              gap: '6px',
              marginBottom: '1.25rem',
            }}
          >
            <button
              type="button"
              onClick={() => handlePortalSwitch('institution')}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: portal === 'institution' ? 'var(--color-blue-primary)' : 'transparent',
                color: portal === 'institution' ? '#FFFFFF' : 'var(--color-navy)',
                boxShadow: portal === 'institution' ? '0 1px 3px rgba(22, 119, 210, 0.3)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <Building2 size={16} />
              <span>Institution Portal</span>
            </button>

            <button
              type="button"
              onClick={() => handlePortalSwitch('student')}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: 'var(--radius-xs)',
                border: 'none',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: portal === 'student' ? 'var(--color-blue-primary)' : 'transparent',
                color: portal === 'student' ? '#FFFFFF' : 'var(--color-navy)',
                boxShadow: portal === 'student' ? '0 1px 3px rgba(22, 119, 210, 0.3)' : 'none',
                transition: 'all var(--transition-fast)',
              }}
            >
              <GraduationCap size={16} />
              <span>Student Portal</span>
            </button>
          </div>

          {/* Error Message Banner */}
          {error && (
            <div
              style={{
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#DC2626',
                padding: '0.75rem 0.95rem',
                borderRadius: '8px',
                fontSize: '0.84rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.15rem' }}>
            {/* Identifier Field */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--color-navy)',
                  marginBottom: '5px',
                }}
              >
                {portal === 'student' ? 'Registration Number or Student Email' : 'Institutional Email or Staff ID'}
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-secondary)',
                    pointerEvents: 'none',
                  }}
                >
                  {portal === 'student' ? <GraduationCap size={17} /> : <Mail size={17} />}
                </div>
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder={portal === 'student' ? 'e.g. STU-2024-042' : 'e.g. admin@codebuffet.edu'}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 0.75rem 0.75rem 2.45rem',
                    fontSize: '0.9rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--color-text-main)',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-blue-primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  color: 'var(--color-navy)',
                  marginBottom: '5px',
                }}
              >
                Password
              </label>
              <div style={{ position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--color-text-secondary)',
                    pointerEvents: 'none',
                  }}
                >
                  <Lock size={17} />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem 2.5rem 0.75rem 2.45rem',
                    fontSize: '0.9rem',
                    border: '1px solid var(--color-border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#FFFFFF',
                    color: 'var(--color-text-main)',
                    outline: 'none',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  onFocus={(e) => (e.currentTarget.style.borderColor = 'var(--color-blue-primary)')}
                  onBlur={(e) => (e.currentTarget.style.borderColor = 'var(--color-border)')}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--color-text-secondary)',
                    cursor: 'pointer',
                    padding: '2px',
                  }}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Remember Me & Security Policy */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.84rem',
              }}
            >
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer', color: 'var(--color-text-main)' }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  style={{ accentColor: 'var(--color-blue-primary)', width: '15px', height: '15px' }}
                />
                <span>Remember session</span>
              </label>

              <button
                type="button"
                onClick={() => setShowResetModal(true)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--color-blue-primary)',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontSize: '0.84rem',
                }}
              >
                Forgot password?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || authLoading}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: 'var(--color-blue-primary)',
                color: '#FFFFFF',
                padding: '0.85rem 1.25rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.95rem',
                fontWeight: 600,
                border: 'none',
                cursor: submitting || authLoading ? 'not-allowed' : 'pointer',
                boxShadow: '0 2px 6px rgba(22, 119, 210, 0.35)',
                transition: 'all var(--transition-fast)',
              }}
              onMouseEnter={(e) => {
                if (!submitting && !authLoading) e.currentTarget.style.backgroundColor = 'var(--color-blue-bright)';
              }}
              onMouseLeave={(e) => {
                if (!submitting && !authLoading) e.currentTarget.style.backgroundColor = 'var(--color-blue-primary)';
              }}
            >
              <span>{submitting || authLoading ? 'Authenticating with Backend...' : 'Sign In to CODEBUFFET'}</span>
              <ArrowRight size={17} />
            </button>
          </form>

          {/* Quick Credential Prefill for Evaluation (Fills form, executes real auth) */}
          <div
            style={{
              marginTop: '1.5rem',
              padding: '1rem',
              borderRadius: '12px',
              backgroundColor: '#F8FAFC',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontSize: '0.74rem', fontWeight: 700, color: '#475569', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Prefill Verified Seed Accounts:
              </span>
              <ShieldCheck size={14} style={{ color: '#10B981' }} />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                onClick={() => handleQuickFill('admin')}
                style={{
                  padding: '7px 9px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  cursor: 'pointer',
                }}
              >
                🏛️ Admin (Dr. Kumar)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('student')}
                style={{
                  padding: '7px 9px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  cursor: 'pointer',
                }}
              >
                🎓 Student (Aarav)
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('mentor')}
                style={{
                  padding: '7px 9px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  cursor: 'pointer',
                }}
              >
                👨‍🏫 Faculty Mentor
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('tpo')}
                style={{
                  padding: '7px 9px',
                  fontSize: '0.76rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  borderRadius: '6px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#0F172A',
                  cursor: 'pointer',
                }}
              >
                💼 Placement Officer
              </button>
            </div>
            <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: '8px' }}>
              * Fills secure development seed credentials into input fields for live API verification.
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div style={{ textAlign: 'center', fontSize: '0.76rem', color: '#94A3B8', marginTop: '1.5rem' }}>
          CODEBUFFET Intelligence Platform • Insights Today | Brighter Tomorrow
        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE: CAMPUS PHOTOGRAPHY (User Image 1) WITH ORGANIC WAVE
          ========================================================================= */}
      <div
        style={{
          flex: '1 1 50%',
          position: 'relative',
          backgroundImage: `url('/assets/images/codebuffet_campus_entrance.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 45%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '3rem',
          minHeight: '100vh',
        }}
        className="login-visual-panel"
      >
        {/* Organic Curved Wave Divider on the left edge */}
        <svg
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            height: '100%',
            width: '80px',
            pointerEvents: 'none',
            zIndex: 2,
          }}
          viewBox="0 0 100 1000"
          preserveAspectRatio="none"
        >
          <path
            d="M 0,0 
               C 40,250 80,350 40,500 
               C 0,650 60,850 0,1000 
               L 0,1000 L 0,0 Z"
            fill="#FFFFFF"
          />
        </svg>

        {/* Dark Vignette Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'linear-gradient(to top, rgba(15, 23, 42, 0.85) 0%, rgba(15, 23, 42, 0.20) 60%, rgba(15, 23, 42, 0.40) 100%)',
            pointerEvents: 'none',
          }}
        />

        {/* Floating Glass Metric Card (Matching STITH / Image 1 HUD) */}
        <div
          style={{
            position: 'relative',
            zIndex: 4,
            maxWidth: '380px',
            marginLeft: 'auto',
            backgroundColor: 'rgba(255, 255, 255, 0.92)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 20px 40px rgba(0, 0, 0, 0.25)',
            border: '1px solid rgba(255, 255, 255, 0.6)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#1E6BFF',
              }}
            >
              <Sparkles size={18} />
            </div>
            <div>
              <div style={{ fontSize: '0.90rem', fontWeight: 700, color: '#0F172A' }}>
                Student Success Intelligence
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Real-time ML risk & telemetry</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                <span style={{ color: '#475569', fontWeight: 500 }}>Academic Performance</span>
                <strong style={{ color: '#0F172A' }}>85.4%</strong>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '85.4%', height: '100%', backgroundColor: '#1E6BFF', borderRadius: '3px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                <span style={{ color: '#475569', fontWeight: 500 }}>Placement Readiness</span>
                <strong style={{ color: '#0F172A' }}>78.6%</strong>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '78.6%', height: '100%', backgroundColor: '#8B5CF6', borderRadius: '3px' }} />
              </div>
            </div>

            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                <span style={{ color: '#475569', fontWeight: 500 }}>Engagement & Skills</span>
                <strong style={{ color: '#0F172A' }}>82.0%</strong>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '82.0%', height: '100%', backgroundColor: '#10B981', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          PASSWORD RESET & SECURITY POLICY MODAL
          ========================================================================= */}
      {showResetModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '480px',
              width: '100%',
              padding: '2rem',
              boxShadow: '0 25px 50px rgba(0, 0, 0, 0.25)',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1E6BFF',
                }}
              >
                <KeyRound size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                  Institutional Security & Credential Policy
                </h3>
                <span style={{ fontSize: '0.78rem', color: '#64748B' }}>CODEBUFFET Identity Governance</span>
              </div>
            </div>

            <p style={{ fontSize: '0.86rem', color: '#334155', lineHeight: 1.55, marginBottom: '1rem' }}>
              To uphold campus data privacy compliance, automated unauthenticated password resets are strictly prohibited. Passwords are protected using <strong>PBKDF2-HMAC-SHA256</strong> with individual per-account salts.
            </p>

            <div
              style={{
                backgroundColor: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                padding: '0.85rem 1rem',
                fontSize: '0.82rem',
                color: '#475569',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>How to reset credentials:</div>
              <div>1. Contact University IT Services at <code>support@codebuffet.edu</code> with your Student/Employee Roll No.</div>
              <div style={{ marginTop: '4px' }}>2. For local developer setup, run: <code>python -m backend.seed</code> in your terminal.</div>
            </div>

            <button
              onClick={() => setShowResetModal(false)}
              style={{
                width: '100%',
                padding: '0.75rem',
                borderRadius: '8px',
                backgroundColor: '#1E6BFF',
                color: '#FFFFFF',
                fontWeight: 600,
                border: 'none',
                cursor: 'pointer',
              }}
            >
              Understood
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

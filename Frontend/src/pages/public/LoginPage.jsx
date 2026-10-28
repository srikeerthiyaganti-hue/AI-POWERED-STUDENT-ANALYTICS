import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Building2,
  GraduationCap,
  Briefcase,
  Award,
  ShieldCheck,
  CheckCircle,
  HelpCircle,
  Sparkles,
  AlertCircle,
  KeyRound,
  UserCheck,
  Loader2,
} from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';

const DEMO_ROLES = [
  {
    key: 'admin',
    portalRole: 'admin',
    label: 'Institution Officer',
    badge: 'DEMO',
    name: 'Dr. R. Kumar',
    email: 'admin@codebuffet.edu',
    password: 'CodeBuffet@2026!',
    icon: Building2,
    color: '#2563EB',
    desc: 'Campus executive analytics, 50k cohort distribution & institutional policy',
  },
  {
    key: 'student',
    portalRole: 'student',
    label: 'Student',
    badge: 'DEMO',
    name: 'Aarav Sharma',
    email: 'STU-2024-042',
    password: 'Student@2026!',
    icon: GraduationCap,
    color: '#10B981',
    desc: 'Personal success cockpit, academic risk factors, What-If simulation & AI assistant',
  },
  {
    key: 'mentor',
    portalRole: 'admin',
    label: 'Faculty',
    badge: 'DEMO',
    name: 'Prof. Rajesh Kumar',
    email: 'rajesh.kumar@codebuffet.edu',
    password: 'Mentor@2026!',
    icon: Award,
    color: '#8B5CF6',
    desc: 'Mentee caseload monitoring, intervention tasks & AI academic copilot',
  },
  {
    key: 'tpo',
    portalRole: 'admin',
    label: 'Placement Officer',
    badge: 'DEMO',
    name: 'Vikram Malhotra',
    email: 'vikram.tpo@codebuffet.edu',
    password: 'TPO@2026!',
    icon: Briefcase,
    color: '#F59E0B',
    desc: 'Placement pipeline, eligibility matching & company recruitment funnel',
  },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, authLoading, backendStatus } = useAuth();

  // Mode: 'demo' | 'real'
  const [loginMode, setLoginMode] = useState('demo');

  // Real Account Form States (strictly empty defaults)
  const [realPortal, setRealPortal] = useState('institution'); // 'institution' | 'student'
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');

  // Demo Account States
  const [selectedDemoKey, setSelectedDemoKey] = useState('admin');
  const [demoIdentifier, setDemoIdentifier] = useState(DEMO_ROLES[0].email);
  const [demoPassword, setDemoPassword] = useState(DEMO_ROLES[0].password);

  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showResetModal, setShowResetModal] = useState(false);

  // Switch between Demo and Real account modes
  const handleModeChange = (mode) => {
    setLoginMode(mode);
    setError('');
    if (mode === 'real') {
      setIdentifier('');
      setPassword('');
    } else {
      const activeDemo = DEMO_ROLES.find((d) => d.key === selectedDemoKey) || DEMO_ROLES[0];
      setDemoIdentifier(activeDemo.email);
      setDemoPassword(activeDemo.password);
    }
  };

  // Demo Role Card selection
  const handleSelectDemoRole = (roleItem) => {
    setSelectedDemoKey(roleItem.key);
    setDemoIdentifier(roleItem.email);
    setDemoPassword(roleItem.password);
    setError('');
  };

  // Execute Login
  const handleLoginSubmit = async (e, isDemo = false) => {
    if (e) e.preventDefault();
    setError('');

    const targetId = isDemo ? demoIdentifier.trim() : identifier.trim();
    const targetPass = isDemo ? demoPassword.trim() : password.trim();

    if (!targetId) {
      setError(
        realPortal === 'student'
          ? 'Please enter your Registration Number or Student Email.'
          : 'Please enter your Institutional Email or Employee ID.'
      );
      return;
    }

    if (!targetPass) {
      setError('Please enter your password.');
      return;
    }

    const activeDemo = DEMO_ROLES.find((d) => d.key === selectedDemoKey);
    const targetRole = isDemo ? activeDemo?.portalRole || 'admin' : (realPortal === 'student' ? 'student' : 'admin');

    setSubmitting(true);
    try {
      const res = await login(targetId, targetPass, targetRole);
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

  const selectedDemoMeta = DEMO_ROLES.find((d) => d.key === selectedDemoKey) || DEMO_ROLES[0];

  return (
    <div
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: '#FFFFFF',
        position: 'relative',
        overflow: 'hidden',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif',",
      }}
      className="login-container"
    >
      {/* =========================================================================
          LEFT SIDE: AUTHENTICATION FORM & DEMO / REAL CONTROLS
          ========================================================================= */}
      <div
        style={{
          flex: '1 1 50%',
          maxWidth: '680px',
          padding: '2.5rem 3.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          backgroundColor: '#FFFFFF',
          zIndex: 5,
        }}
        className="login-form-wrapper"
      >
        {/* Top Header: Nav controls */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <Link
            to="/platform"
            style={{
              color: 'var(--color-navy, #0F172A)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.88rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ← Platform Overview
          </Link>
          <button
            onClick={() => setShowResetModal(true)}
            style={{
              background: 'none',
              border: 'none',
              color: 'var(--color-text-secondary, #64748B)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontSize: '0.88rem',
            }}
          >
            <HelpCircle size={15} />
            <span>Security Policy</span>
          </button>
        </div>

        {/* Center Main Form */}
        <div style={{ maxWidth: '500px', width: '100%', margin: '0 auto' }}>
          {/* Centered Brand Logo */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', marginBottom: '1.25rem', textAlign: 'center' }}>
            <BrandLogo variant="light" size="large" />
            <div style={{ marginTop: '0.35rem', fontSize: '0.78rem', color: '#64748B', fontWeight: 600 }}>
              Student Success Intelligence Platform
            </div>
          </div>

          {/* Eyebrow & Live Backend Badge */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.6rem' }}>
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 700,
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: '#2563EB',
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
              <span>{backendStatus === 'connected' ? 'FastAPI Backend Online' : 'Checking Backend...'}</span>
            </div>
          </div>

          {/* Heading */}
          <h1
            style={{
              fontFamily: 'var(--font-serif, serif)',
              fontSize: '2rem',
              fontWeight: 700,
              color: '#0F172A',
              lineHeight: 1.15,
              marginBottom: '0.3rem',
            }}
          >
            Welcome to CODEBUFFET<span style={{ color: '#2563EB' }}>.</span>
          </h1>

          <p style={{ color: '#64748B', fontSize: '0.90rem', marginBottom: '1.25rem' }}>
            Sign in to access personalized student telemetry and predictive risk analytics.
          </p>

          {/* =========================================================================
              TWO MODES TOGGLE: DEMO ACCOUNT | REAL ACCOUNT
              ========================================================================= */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#F1F5F9',
              border: '1px solid #E2E8F0',
              padding: '4px',
              borderRadius: '8px',
              gap: '4px',
              marginBottom: '1.25rem',
            }}
          >
            <button
              type="button"
              onClick={() => handleModeChange('demo')}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: loginMode === 'demo' ? '#2563EB' : 'transparent',
                color: loginMode === 'demo' ? '#FFFFFF' : '#475569',
                boxShadow: loginMode === 'demo' ? '0 1px 3px rgba(37,99,235,0.3)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <Sparkles size={16} />
              <span>Demo Account Mode</span>
            </button>

            <button
              type="button"
              onClick={() => handleModeChange('real')}
              style={{
                flex: 1,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '9px 12px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.86rem',
                fontWeight: 600,
                cursor: 'pointer',
                backgroundColor: loginMode === 'real' ? '#2563EB' : 'transparent',
                color: loginMode === 'real' ? '#FFFFFF' : '#475569',
                boxShadow: loginMode === 'real' ? '0 1px 3px rgba(37,99,235,0.3)' : 'none',
                transition: 'all 0.15s ease',
              }}
            >
              <UserCheck size={16} />
              <span>Real Account Mode</span>
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

          {/* =========================================================================
              MODE 1: DEMO ACCOUNT (4 Role Cards & Verified Review)
              ========================================================================= */}
          {loginMode === 'demo' ? (
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 600, color: '#334155' }}>
                  Select an Evaluator Demo Persona:
                </div>
                <div style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Uses demonstration synthetic cohort
                </div>
              </div>

              {/* 4 Demo Role Cards */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(2, 1fr)',
                  gap: '10px',
                  marginBottom: '16px',
                }}
              >
                {DEMO_ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = selectedDemoKey === r.key;
                  return (
                    <div
                      key={r.key}
                      onClick={() => handleSelectDemoRole(r)}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        border: `1.5px solid ${isSelected ? r.color : '#E2E8F0'}`,
                        backgroundColor: isSelected ? `${r.color}0D` : '#F8FAFC',
                        cursor: 'pointer',
                        transition: 'all 0.15s ease',
                        position: 'relative',
                      }}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <div
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            backgroundColor: `${r.color}15`,
                            color: r.color,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                          }}
                        >
                          <Icon size={16} />
                        </div>
                        <span
                          style={{
                            fontSize: '0.66rem',
                            fontWeight: 700,
                            padding: '1px 5px',
                            borderRadius: '4px',
                            backgroundColor: isSelected ? r.color : '#E2E8F0',
                            color: isSelected ? '#FFFFFF' : '#475569',
                          }}
                        >
                          {r.badge}
                        </span>
                      </div>
                      <div style={{ fontSize: '0.84rem', fontWeight: 700, color: '#0F172A', marginBottom: '2px' }}>
                        {r.label}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: '#64748B', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.name}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Verified Credentials Review & Sign-in Box */}
              <div
                style={{
                  padding: '16px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  backgroundColor: '#F8FAFC',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '0.76rem', fontWeight: 600, color: '#475569', marginBottom: '8px' }}>
                  Active Demo Credentials (Authenticates with Live Backend):
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', marginBottom: '2px' }}>
                      Login Identifier
                    </label>
                    <input
                      type="text"
                      value={demoIdentifier}
                      readOnly
                      style={{
                        width: '100%',
                        padding: '6px 8px',
                        fontSize: '0.80rem',
                        borderRadius: '6px',
                        border: '1px solid #CBD5E1',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        fontWeight: 600,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.72rem', color: '#64748B', marginBottom: '2px' }}>
                      Password
                    </label>
                    <div style={{ position: 'relative' }}>
                      <input
                        type={showPassword ? 'text' : 'password'}
                        value={demoPassword}
                        readOnly
                        style={{
                          width: '100%',
                          padding: '6px 28px 6px 8px',
                          fontSize: '0.80rem',
                          borderRadius: '6px',
                          border: '1px solid #CBD5E1',
                          backgroundColor: '#FFFFFF',
                          color: '#0F172A',
                          fontWeight: 600,
                          outline: 'none',
                          boxSizing: 'border-box',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{
                          position: 'absolute',
                          right: '6px',
                          top: '6px',
                          background: 'none',
                          border: 'none',
                          color: '#64748B',
                          cursor: 'pointer',
                          padding: 0,
                        }}
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleLoginSubmit(null, true)}
                  disabled={submitting || authLoading}
                  style={{
                    width: '100%',
                    padding: '11px',
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: selectedDemoMeta.color,
                    color: '#FFFFFF',
                    fontWeight: 600,
                    fontSize: '0.90rem',
                    cursor: submitting || authLoading ? 'not-allowed' : 'pointer',
                    opacity: submitting || authLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                  }}
                >
                  {submitting || authLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Authenticating {selectedDemoMeta.label}...
                    </>
                  ) : (
                    <>
                      Sign In as Demo {selectedDemoMeta.label} <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </div>

              {/* Mode Switch Helper */}
              <div style={{ textAlign: 'center', fontSize: '0.84rem', color: '#64748B' }}>
                Have a registered real account?{' '}
                <button
                  type="button"
                  onClick={() => handleModeChange('real')}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#2563EB',
                    fontWeight: 600,
                    cursor: 'pointer',
                    padding: 0,
                  }}
                >
                  Switch to Real Account
                </button>
              </div>
            </div>
          ) : (
            /* =========================================================================
                MODE 2: REAL ACCOUNT LOGIN (Standard form with empty inputs)
                ========================================================================= */
            <div>
              {/* Portal Selector */}
              <div
                style={{
                  display: 'flex',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  padding: '3px',
                  borderRadius: '6px',
                  gap: '4px',
                  marginBottom: '1rem',
                }}
              >
                <button
                  type="button"
                  onClick={() => setRealPortal('institution')}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: realPortal === 'institution' ? '#2563EB' : 'transparent',
                    color: realPortal === 'institution' ? '#FFFFFF' : '#475569',
                  }}
                >
                  Institution Portal
                </button>
                <button
                  type="button"
                  onClick={() => setRealPortal('student')}
                  style={{
                    flex: 1,
                    padding: '7px 10px',
                    borderRadius: '4px',
                    border: 'none',
                    fontSize: '0.82rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    backgroundColor: realPortal === 'student' ? '#2563EB' : 'transparent',
                    color: realPortal === 'student' ? '#FFFFFF' : '#475569',
                  }}
                >
                  Student Portal
                </button>
              </div>

              <form onSubmit={(e) => handleLoginSubmit(e, false)} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {/* Identifier Field */}
                <div>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      color: '#0F172A',
                      marginBottom: '4px',
                    }}
                  >
                    {realPortal === 'student' ? 'Registration / Roll Number or Email' : 'Institutional Email or Staff ID'}
                  </label>
                  <div style={{ position: 'relative' }}>
                    <div
                      style={{
                        position: 'absolute',
                        left: '12px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        color: '#64748B',
                        pointerEvents: 'none',
                      }}
                    >
                      {realPortal === 'student' ? <GraduationCap size={17} /> : <Mail size={17} />}
                    </div>
                    <input
                      type="text"
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      placeholder={realPortal === 'student' ? 'e.g. STU-2024-042 or name@univ.edu' : 'e.g. name@university.edu'}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 0.75rem 0.75rem 2.45rem',
                        fontSize: '0.9rem',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
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
                      color: '#0F172A',
                      marginBottom: '4px',
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
                        color: '#64748B',
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
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        backgroundColor: '#FFFFFF',
                        color: '#0F172A',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
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
                        color: '#64748B',
                        cursor: 'pointer',
                        padding: 0,
                      }}
                    >
                      {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                    </button>
                  </div>
                </div>

                {/* Remember Me & Forgot Password */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.82rem' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '6px', color: '#475569', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      style={{ borderRadius: '4px', accentColor: '#2563EB' }}
                    />
                    <span>Remember me</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowResetModal(true)}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563EB',
                      fontWeight: 600,
                      cursor: 'pointer',
                      fontSize: '0.82rem',
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
                    width: '100%',
                    padding: '0.85rem',
                    fontSize: '0.92rem',
                    fontWeight: 600,
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#2563EB',
                    color: '#FFFFFF',
                    cursor: submitting || authLoading ? 'not-allowed' : 'pointer',
                    opacity: submitting || authLoading ? 0.7 : 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    marginTop: '4px',
                  }}
                >
                  {submitting || authLoading ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In to Platform <ArrowRight size={16} />
                    </>
                  )}
                </button>
              </form>

              {/* Links: Register and Switch to Demo */}
              <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px', textAlign: 'center', fontSize: '0.84rem', color: '#64748B' }}>
                <div>
                  Don't have an account?{' '}
                  <Link to="/register" style={{ color: '#2563EB', fontWeight: 600, textDecoration: 'none' }}>
                    Create account here
                  </Link>
                </div>
                <div>
                  Evaluating CODEBUFFET?{' '}
                  <button
                    type="button"
                    onClick={() => handleModeChange('demo')}
                    style={{
                      background: 'none',
                      border: 'none',
                      color: '#2563EB',
                      fontWeight: 600,
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    Explore Demo Accounts
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Bottom Footer Info */}
        <div
          style={{
            marginTop: '2rem',
            paddingTop: '1rem',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '0.76rem',
            color: '#94A3B8',
          }}
        >
          <div>© 2026 CODEBUFFET. All rights reserved.</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={14} style={{ color: '#10B981' }} />
            <span>256-bit PBKDF2 Encrypted</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          RIGHT SIDE: CAMPUS VISUAL WITH WAVE & METRICS OVERLAY
          ========================================================================= */}
      <div
        style={{
          flex: '1 1 50%',
          position: 'relative',
          backgroundImage: `url('/images/signin-bg.png')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '3rem',
          minHeight: '100vh',
        }}
        className="login-visual-panel"
      >
        {/* Organic Curved Wave Divider */}
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

        {/* Floating Glass Metric Card */}
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
              <div style={{ fontSize: '0.72rem', color: '#64748B' }}>50,008 student records analyzed</div>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '3px' }}>
                <span style={{ color: '#475569', fontWeight: 500 }}>Academic Risk Detection</span>
                <strong style={{ color: '#0F172A' }}>99.2%</strong>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '99.2%', height: '100%', backgroundColor: '#2563EB', borderRadius: '3px' }} />
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
                <span style={{ color: '#475569', fontWeight: 500 }}>AI Intervention Accuracy</span>
                <strong style={{ color: '#0F172A' }}>94.1%</strong>
              </div>
              <div style={{ width: '100%', height: '6px', backgroundColor: '#E2E8F0', borderRadius: '3px', overflow: 'hidden' }}>
                <div style={{ width: '94.1%', height: '100%', backgroundColor: '#10B981', borderRadius: '3px' }} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECURITY POLICY & RESET MODAL
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
                  color: '#2563EB',
                }}
              >
                <KeyRound size={22} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 700, color: '#0F172A' }}>
                  Credential & Reset Policy
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
                backgroundColor: '#2563EB',
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

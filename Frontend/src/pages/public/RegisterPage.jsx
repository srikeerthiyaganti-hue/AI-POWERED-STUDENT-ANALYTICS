import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  Building2,
  GraduationCap,
  Briefcase,
  Award,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Info,
  Loader2,
} from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';

const ROLES = [
  {
    id: 'Student',
    label: 'Student',
    icon: GraduationCap,
    desc: 'B.Tech / Degree student accessing personal success cockpit & learning AI',
    isPrivileged: false,
  },
  {
    id: 'Faculty',
    label: 'Faculty / Mentor',
    icon: Award,
    desc: 'Faculty counselor managing student cohorts, interventions & AI copilot',
    isPrivileged: true,
  },
  {
    id: 'Institution Officer',
    label: 'Institution Officer',
    icon: Building2,
    desc: 'Campus dean & administrator overseeing institutional telemetry & risk',
    isPrivileged: true,
  },
  {
    id: 'Placement Officer',
    label: 'Placement Officer',
    icon: Briefcase,
    desc: 'Training & placement director managing hiring pipelines & readiness',
    isPrivileged: true,
  },
];

const BRANCHES = [
  { id: 'CSE', label: 'Computer Science & Engineering (CSE)' },
  { id: 'IT', label: 'Information Technology (IT)' },
  { id: 'Data Science', label: 'Data Science (DS)' },
  { id: 'EEE', label: 'Electrical & Electronics Engineering (EEE)' },
  { id: 'ECE', label: 'Electronics & Communication Engineering (ECE)' },
  { id: 'Mechanical', label: 'Mechanical Engineering' },
];

const SEMESTERS = [
  { id: 1, label: 'Semester 1 (1st Year)' },
  { id: 2, label: 'Semester 2 (1st Year)' },
  { id: 3, label: 'Semester 3 (2nd Year)' },
  { id: 4, label: 'Semester 4 (2nd Year)' },
  { id: 5, label: 'Semester 5 (3rd Year)' },
  { id: 6, label: 'Semester 6 (3rd Year)' },
  { id: 7, label: 'Semester 7 (4th Year)' },
  { id: 8, label: 'Semester 8 (4th Year)' },
];

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register, authLoading } = useAuth();

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: 'Student',
    branch: 'CSE',
    semester: 6,
    invitationCode: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [successInfo, setSuccessInfo] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const calculatePasswordStrength = (pwd) => {
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[a-z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;
    return score; // 0 to 5
  };

  const pwdScore = calculatePasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleRoleSelect = (roleId) => {
    setFormData((prev) => ({ ...prev, role: roleId }));
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessInfo(null);

    // Basic validation
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setError('Please provide both First Name and Last Name.');
      return;
    }
    if (!formData.phone.trim()) {
      setError('Please enter a valid phone number.');
      return;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      setError('Please enter a valid institutional or personal email address.');
      return;
    }
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters long and contain uppercase, lowercase, numbers, and symbols.');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match. Please verify your password confirmation.');
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        first_name: formData.firstName.trim(),
        last_name: formData.lastName.trim(),
        phone_number: formData.phone.trim(),
        email: formData.email.trim().toLowerCase(),
        password: formData.password,
        confirm_password: formData.confirmPassword,
        role: formData.role,
        invitation_code: formData.invitationCode.trim() || null,
        branch: formData.role === 'Student' ? formData.branch : null,
        department: formData.role === 'Student' ? formData.branch : null,
        semester: formData.role === 'Student' ? Number(formData.semester) : null,
      };

      const res = await register(payload);
      setSuccessInfo(res);
    } catch (err) {
      setError(err?.message || 'Registration failed. Please check your details and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedRoleMeta = ROLES.find((r) => r.id === formData.role) || ROLES[0];

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0A0F1D',
        backgroundImage: 'radial-gradient(ellipse at 50% 10%, rgba(37,99,235,0.15), transparent 70%)',
        color: '#F8FAFC',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
        padding: '32px 16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      {/* Header with Logo */}
      <div style={{ marginBottom: '28px', textAlign: 'center' }}>
        <Link to="/" style={{ textDecoration: 'none', display: 'inline-block' }}>
          <BrandLogo variant="light" size="lg" />
        </Link>
        <p style={{ marginTop: '8px', color: '#94A3B8', fontSize: '0.9rem' }}>
          AI-Powered Student Success Intelligence Platform
        </p>
      </div>

      {/* Main Container */}
      <div
        style={{
          width: '100%',
          maxWidth: '680px',
          backgroundColor: '#0F172A',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: '16px',
          padding: '32px',
          boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, margin: '0 0 6px 0', color: '#FFFFFF' }}>
            Create an Account
          </h1>
          <p style={{ fontSize: '0.88rem', color: '#94A3B8', margin: 0 }}>
            Join CODEBUFFET to access personalized telemetry, predictive risk modeling, and academic intelligence.
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              padding: '12px 16px',
              backgroundColor: 'rgba(239,68,68,0.12)',
              border: '1px solid rgba(239,68,68,0.3)',
              borderRadius: '8px',
              color: '#FCA5A5',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              marginBottom: '20px',
            }}
          >
            <AlertCircle size={18} style={{ flexShrink: 0, color: '#EF4444' }} />
            <span>{error}</span>
          </div>
        )}

        {/* Success Modal / Banner */}
        {successInfo ? (
          <div
            style={{
              padding: '24px',
              backgroundColor: successInfo.status === 'ACTIVE' ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)',
              border: `1px solid ${successInfo.status === 'ACTIVE' ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'}`,
              borderRadius: '12px',
              textAlign: 'center',
            }}
          >
            <CheckCircle2
              size={44}
              style={{
                color: successInfo.status === 'ACTIVE' ? '#10B981' : '#F59E0B',
                margin: '0 auto 12px auto',
              }}
            />
            <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#FFFFFF', margin: '0 0 8px 0' }}>
              {successInfo.status === 'ACTIVE' ? 'Registration Successful!' : 'Application Under Review'}
            </h3>
            <p style={{ fontSize: '0.9rem', color: '#CBD5E1', lineHeight: 1.5, margin: '0 0 16px 0' }}>
              {successInfo.message}
            </p>
            <div
              style={{
                backgroundColor: 'rgba(0,0,0,0.25)',
                padding: '12px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                color: '#94A3B8',
                marginBottom: '20px',
                textAlign: 'left',
              }}
            >
              <div><strong>Registration ID:</strong> {successInfo.roll_no}</div>
              <div><strong>Email:</strong> {successInfo.email}</div>
              <div><strong>Role:</strong> {successInfo.role_label}</div>
              <div><strong>Status:</strong> <span style={{ color: successInfo.status === 'ACTIVE' ? '#10B981' : '#F59E0B', fontWeight: 600 }}>{successInfo.status}</span></div>
            </div>
            <button
              onClick={() => navigate('/login')}
              style={{
                padding: '10px 24px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              Proceed to Sign In <ArrowRight size={16} />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {/* Step 1: Role Selection Cards */}
            <div style={{ marginBottom: '22px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#CBD5E1', marginBottom: '10px' }}>
                Select Your Role <span style={{ color: '#EF4444' }}>*</span>
              </label>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: '10px',
                }}
              >
                {ROLES.map((r) => {
                  const Icon = r.icon;
                  const isSelected = formData.role === r.id;
                  return (
                    <div
                      key={r.id}
                      onClick={() => handleRoleSelect(r.id)}
                      style={{
                        padding: '14px 10px',
                        borderRadius: '10px',
                        border: `1.5px solid ${isSelected ? '#3B82F6' : 'rgba(255,255,255,0.08)'}`,
                        backgroundColor: isSelected ? 'rgba(59,130,246,0.1)' : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        textAlign: 'center',
                        transition: 'all 0.15s ease',
                      }}
                    >
                      <Icon
                        size={22}
                        style={{
                          color: isSelected ? '#60A5FA' : '#94A3B8',
                          margin: '0 auto 6px auto',
                        }}
                      />
                      <div
                        style={{
                          fontSize: '0.82rem',
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? '#FFFFFF' : '#CBD5E1',
                        }}
                      >
                        {r.label}
                      </div>
                    </div>
                  );
                })}
              </div>
              <p style={{ fontSize: '0.76rem', color: '#94A3B8', marginTop: '6px' }}>
                {selectedRoleMeta.desc}
              </p>
            </div>

            {/* Step 2: Name Fields */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#CBD5E1', marginBottom: '6px' }}>
                  First Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  placeholder="e.g. Aarav"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#CBD5E1', marginBottom: '6px' }}>
                  Last Name <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  placeholder="e.g. Sharma"
                  required
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    border: '1px solid rgba(255,255,255,0.12)',
                    backgroundColor: 'rgba(255,255,255,0.04)',
                    color: '#FFFFFF',
                    fontSize: '0.88rem',
                    outline: 'none',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            {/* Step 3: Contact Details */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#CBD5E1', marginBottom: '6px' }}>
                  Phone Number <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Phone size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748B' }} />
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="9876543210"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      color: '#FFFFFF',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#CBD5E1', marginBottom: '6px' }}>
                  Email Address <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748B' }} />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="name@university.edu"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      color: '#FFFFFF',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Step 4: Student-specific Branch & Semester */}
            {formData.role === 'Student' && (
              <div
                style={{
                  padding: '14px',
                  backgroundColor: 'rgba(37,99,235,0.06)',
                  border: '1px solid rgba(37,99,235,0.2)',
                  borderRadius: '10px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ fontSize: '0.82rem', fontWeight: 600, color: '#93C5FD', marginBottom: '10px' }}>
                  Academic Program Details
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', color: '#CBD5E1', marginBottom: '4px' }}>
                      Branch / Department
                    </label>
                    <select
                      name="branch"
                      value={formData.branch}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.15)',
                        backgroundColor: '#1E293B',
                        color: '#FFFFFF',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      {BRANCHES.map((b) => (
                        <option key={b.id} value={b.id}>
                          {b.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label style={{ display: 'block', fontSize: '0.76rem', color: '#CBD5E1', marginBottom: '4px' }}>
                      Current Semester (1 to 8)
                    </label>
                    <select
                      name="semester"
                      value={formData.semester}
                      onChange={handleChange}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.15)',
                        backgroundColor: '#1E293B',
                        color: '#FFFFFF',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    >
                      {SEMESTERS.map((s) => (
                        <option key={s.id} value={s.id}>
                          {s.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Privileged Role Approval Note & Passkey */}
            {selectedRoleMeta.isPrivileged && (
              <div
                style={{
                  padding: '14px',
                  backgroundColor: 'rgba(245,158,11,0.06)',
                  border: '1px solid rgba(245,158,11,0.2)',
                  borderRadius: '10px',
                  marginBottom: '16px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#FCD34D', fontSize: '0.82rem', fontWeight: 600, marginBottom: '6px' }}>
                  <ShieldCheck size={16} />
                  <span>Institutional Role Authorization</span>
                </div>
                <p style={{ fontSize: '0.76rem', color: '#CBD5E1', lineHeight: 1.4, margin: '0 0 10px 0' }}>
                  To maintain strict student privacy, registrations for Faculty, Placement, or Administration require institutional verification. If you have an institutional invitation passkey, enter it below to unlock immediate active status. Otherwise, your account will be placed into pending administrative review.
                </p>
                <div>
                  <label style={{ display: 'block', fontSize: '0.76rem', color: '#CBD5E1', marginBottom: '4px' }}>
                    Institutional Invitation Passkey (Optional)
                  </label>
                  <div style={{ position: 'relative' }}>
                    <KeyRound size={14} style={{ position: 'absolute', left: '10px', top: '10px', color: '#94A3B8' }} />
                    <input
                      type="text"
                      name="invitationCode"
                      value={formData.invitationCode}
                      onChange={handleChange}
                      placeholder="Enter official institutional passkey (if issued by Dean / Admin)"
                      style={{
                        width: '100%',
                        padding: '8px 10px 8px 32px',
                        borderRadius: '6px',
                        border: '1px solid rgba(255,255,255,0.15)',
                        backgroundColor: '#1E293B',
                        color: '#FFFFFF',
                        fontSize: '0.82rem',
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 6: Password & Confirm Password */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '10px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#CBD5E1', marginBottom: '6px' }}>
                  Password <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748B' }} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Min 8 characters"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 36px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      color: '#FFFFFF',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 500, color: '#CBD5E1', marginBottom: '6px' }}>
                  Confirm Password <span style={{ color: '#EF4444' }}>*</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: '12px', top: '12px', color: '#64748B' }} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter password"
                    required
                    style={{
                      width: '100%',
                      padding: '10px 36px 10px 36px',
                      borderRadius: '8px',
                      border: '1px solid rgba(255,255,255,0.12)',
                      backgroundColor: 'rgba(255,255,255,0.04)',
                      color: '#FFFFFF',
                      fontSize: '0.88rem',
                      outline: 'none',
                      boxSizing: 'border-box',
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    style={{
                      position: 'absolute',
                      right: '10px',
                      top: '10px',
                      background: 'none',
                      border: 'none',
                      color: '#64748B',
                      cursor: 'pointer',
                      padding: 0,
                    }}
                  >
                    {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
            </div>

            {/* Password Strength Meter */}
            {formData.password && (
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                  {[1, 2, 3, 4, 5].map((lvl) => (
                    <div
                      key={lvl}
                      style={{
                        height: '4px',
                        flex: 1,
                        borderRadius: '2px',
                        backgroundColor:
                          lvl <= pwdScore
                            ? pwdScore <= 2
                              ? '#EF4444'
                              : pwdScore <= 3
                              ? '#F59E0B'
                              : '#10B981'
                            : 'rgba(255,255,255,0.1)',
                      }}
                    />
                  ))}
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94A3B8' }}>
                  Password Strength:{' '}
                  <span
                    style={{
                      fontWeight: 600,
                      color:
                        pwdScore <= 2 ? '#EF4444' : pwdScore <= 3 ? '#F59E0B' : '#10B981',
                    }}
                  >
                    {pwdScore <= 2 ? 'Weak' : pwdScore <= 3 ? 'Moderate' : 'Strong'}
                  </span>
                  {' — Requirements: min 8 chars, uppercase, lowercase, number, symbol.'}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || authLoading}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: '#2563EB',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '0.92rem',
                cursor: submitting || authLoading ? 'not-allowed' : 'pointer',
                opacity: submitting || authLoading ? 0.7 : 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                marginTop: '10px',
              }}
            >
              {submitting || authLoading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Creating Account...
                </>
              ) : (
                <>
                  Complete Registration <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>
        )}

        {/* Footer Link to Login */}
        <div
          style={{
            marginTop: '24px',
            paddingTop: '20px',
            borderTop: '1px solid rgba(255,255,255,0.08)',
            textAlign: 'center',
            fontSize: '0.85rem',
            color: '#94A3B8',
          }}
        >
          Already have an account?{' '}
          <Link
            to="/login"
            style={{
              color: '#60A5FA',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            Sign In here
          </Link>
        </div>
      </div>
    </div>
  );
}

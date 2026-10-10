import React, { useState, useMemo, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Users,
  Award,
  AlertTriangle,
  Briefcase,
  GraduationCap,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  ChevronRight,
  LogOut,
  ArrowLeft,
  ArrowRight,
  Home,
  BarChart2,
  ShieldAlert,
  Star,
  FileText,
  Target,
  Settings,
  X,
  Download,
  Filter,
  CheckCircle,
  Eye,
  Sliders,
  Send,
  Compass,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import {
  MOCK_STUDENTS,
  SUCCESS_TREND_DATA,
  DISTRIBUTION_DATA,
  DEPARTMENT_SCORES,
} from '../../data/mockStudents';
import Campus3DExperience from '../../components/landing/Campus3DExperience';
import api from '../../services/api';

export default function CampusDashboard() {
  const { currentUser, logout, loginWithDemo } = useAuth();
  const navigate = useNavigate();

  // Navigation and Modal States
  const [activeNav, setActiveNav] = useState('Dashboard');
  const [searchQuery, setSearchQuery] = useState('');
  const [trendRange, setTrendRange] = useState('Last 6 Months');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Live Backend Data States with Resilient Fallbacks
  const [summaryData, setSummaryData] = useState({
    total_students: 12480,
    avg_success_score: 85.4,
    at_risk_pct: 5.2,
    placement_readiness_pct: 78.6,
  });
  const [departmentData, setDepartmentData] = useState(DEPARTMENT_SCORES);
  const [cohortStudents, setCohortStudents] = useState(MOCK_STUDENTS);
  const [isLiveApi, setIsLiveApi] = useState(false);

  useEffect(() => {
    let isMounted = true;
    async function fetchBackendAnalytics() {
      try {
        const [sumRes, deptRes, studRes] = await Promise.allSettled([
          api.getInstitutionSummary(),
          api.getInstitutionDepartments(),
          api.getInstitutionStudents(),
        ]);

        if (isMounted) {
          if (sumRes.status === 'fulfilled' && sumRes.value) {
            setSummaryData(sumRes.value);
            setIsLiveApi(true);
          }
          if (deptRes.status === 'fulfilled' && Array.isArray(deptRes.value) && deptRes.value.length > 0) {
            setDepartmentData(deptRes.value);
          }
          if (studRes.status === 'fulfilled' && Array.isArray(studRes.value) && studRes.value.length > 0) {
            setCohortStudents(studRes.value);
          }
        }
      } catch (err) {
        console.warn('Backend unavailable, running in standalone mode:', err);
      }
    }
    fetchBackendAnalytics();
    return () => { isMounted = false; };
  }, []);

  // Feature Modals
  const [studentDirectoryOpen, setStudentDirectoryOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [interventionModalOpen, setInterventionModalOpen] = useState(false);
  const [aiCopilotOpen, setAiCopilotOpen] = useState(false);
  const [campus3DOpen, setCampus3DOpen] = useState(false);
  const [reportGenerated, setReportGenerated] = useState(false);

  // Intervention Sandbox Simulation State
  const [allocatedMentors, setAllocatedMentors] = useState(30);
  const [strategy, setStrategy] = useState('skill-gap'); // 'skill-gap' | 'cohort-wide'

  // Filtered Students for Global Search & Directory
  const filteredStudents = useMemo(() => {
    const list = cohortStudents && cohortStudents.length > 0 ? cohortStudents : MOCK_STUDENTS;
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
    );
  }, [searchQuery, cohortStudents]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // CSV Report Generator
  const handleGenerateReport = () => {
    const list = cohortStudents && cohortStudents.length > 0 ? cohortStudents : MOCK_STUDENTS;
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'ID,Name,Department,Year,CGPA,Attendance,SuccessScore,AcademicRisk,PlacementRisk\n' +
      list.map(
        (s) =>
          `${s.id},"${s.name}",${s.department},${s.year},${s.cgpa},${s.attendance}%,${s.successScore},${s.academicRisk},${s.placementRisk}`
      ).join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `CODEBUFFET_Student_Intelligence_Report_2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    setReportGenerated(true);
    setTimeout(() => setReportGenerated(false), 4000);
  };

  // Navigation Links matching STITH Plan Sidebar
  const sidebarLinks = [
    { name: 'Dashboard', icon: Home },
    { name: 'Students', icon: Users, action: () => setStudentDirectoryOpen(true) },
    { name: 'Analytics', icon: BarChart2 },
    { name: 'Risk Insights', icon: ShieldAlert, action: () => setStudentDirectoryOpen(true) },
    { name: 'Academics', icon: GraduationCap },
    { name: 'Placement', icon: Briefcase },
    { name: 'Engagement', icon: Star },
    { name: 'Reports', icon: FileText, action: handleGenerateReport },
    { name: 'Interventions', icon: Target, action: () => setInterventionModalOpen(true) },
    { name: 'AI Insights', icon: Sparkles, action: () => setAiCopilotOpen(true) },
    { name: 'Settings', icon: Settings },
  ];

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        minHeight: '100vh',
        backgroundColor: isDarkMode ? '#0B1120' : '#F4F7FC',
        color: isDarkMode ? '#F8FAFC' : '#0F172A',
      }}
    >
      {/* =========================================================================
          TOP DEMO PERSISTENT BAR
          ========================================================================= */}
      <div
        style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '8px 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          zIndex: 60,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: isLiveApi ? '#10B981' : '#1E6BFF',
              fontWeight: 700,
              fontSize: '0.74rem',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
            <span>{isLiveApi ? 'FASTAPI ML BACKEND ACTIVE' : 'INSTITUTION PORTAL'}</span>
          </span>
          <span>
            Logged in as: <strong>{currentUser?.name || 'Dr. R. Kumar'}</strong> ({currentUser?.roleLabel || 'Institution Admin'})
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginRight: '4px' }}>Switch View:</span>
          <button
            onClick={async () => {
              await loginWithDemo('mentor');
              navigate('/mentor/dashboard');
            }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              borderRadius: '6px',
              padding: '3px 8px',
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: 600,
            }}
          >
            👨‍🏫 Mentor
          </button>
          <button
            onClick={async () => {
              await loginWithDemo('tpo');
              navigate('/placement/dashboard');
            }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              borderRadius: '6px',
              padding: '3px 8px',
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: 600,
            }}
          >
            💼 Placement
          </button>
          <button
            onClick={async () => {
              await loginWithDemo('student');
              navigate('/student/dashboard');
            }}
            style={{
              background: 'rgba(255,255,255,0.1)',
              border: '1px solid rgba(255,255,255,0.2)',
              color: '#FFFFFF',
              borderRadius: '6px',
              padding: '3px 8px',
              cursor: 'pointer',
              fontSize: '0.74rem',
              fontWeight: 600,
            }}
          >
            🎓 Student
          </button>
          <button
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.75)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              cursor: 'pointer',
              fontSize: '0.76rem',
              marginLeft: '8px',
            }}
          >
            <LogOut size={13} />
            <span>Sign out</span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          MAIN APPLICATION LAYOUT (SIDEBAR + MAIN CANVAS)
          ========================================================================= */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* =======================================================================
            LEFT SIDEBAR — Exact STITH Plan Hierarchy
            ======================================================================= */}
        <aside
          style={{
            width: '240px',
            backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
            borderRight: `1px solid ${isDarkMode ? '#1E293B' : '#E2E8F0'}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '1.25rem 0.85rem',
            position: 'sticky',
            top: 0,
            height: 'calc(100vh - 38px)',
            flexShrink: 0,
            zIndex: 40,
          }}
        >
          <div>
            {/* Sidebar Brand Logo */}
            <div style={{ padding: '0 0.5rem 1.5rem', borderBottom: `1px solid ${isDarkMode ? '#1E293B' : '#F1F5F9'}` }}>
              <BrandLogo variant={isDarkMode ? 'dark' : 'light'} size="small" showTagline={false} />
            </div>

            {/* Navigation Menu */}
            <nav style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {sidebarLinks.map((item) => {
                const Icon = item.icon;
                const isActive = activeNav === item.name;
                return (
                  <button
                    key={item.name}
                    onClick={() => {
                      setActiveNav(item.name);
                      if (item.action) item.action();
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      backgroundColor: isActive ? '#1E6BFF' : 'transparent',
                      color: isActive ? '#FFFFFF' : isDarkMode ? '#94A3B8' : '#64748B',
                      fontSize: '0.88rem',
                      fontWeight: isActive ? 600 : 500,
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                      transition: 'all 150ms ease',
                      boxShadow: isActive ? '0 4px 12px rgba(30, 107, 255, 0.28)' : 'none',
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = isDarkMode ? '#1E293B' : '#F1F5F9';
                        e.currentTarget.style.color = isDarkMode ? '#FFFFFF' : '#0F172A';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) {
                        e.currentTarget.style.backgroundColor = 'transparent';
                        e.currentTarget.style.color = isDarkMode ? '#94A3B8' : '#64748B';
                      }
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Sidebar Bottom Banner (Exact STITH Plan Feature) */}
          <div
            style={{
              padding: '1.25rem 1rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #EFF6FF 0%, #EEF2FF 100%)',
              border: '1px solid #DBEAFE',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#1E6BFF', lineHeight: 1.2 }}>
              Insights Today
            </div>
            <div style={{ fontSize: '0.85rem', fontWeight: 800, color: '#4F46E5', lineHeight: 1.2 }}>
              Brighter Tomorrow
            </div>
            <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '6px' }}>
              CODEBUFFET Platform v2.0
            </div>
          </div>
        </aside>

        {/* =======================================================================
            MAIN CONTENT CANVAS
            ======================================================================= */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Top Bar with Search & Admin Controls */}
          <header
            style={{
              height: '70px',
              backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
              borderBottom: `1px solid ${isDarkMode ? '#1E293B' : '#E2E8F0'}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0 2rem',
              position: 'sticky',
              top: 0,
              zIndex: 35,
            }}
          >
            {/* Search Input Bar */}
            <div style={{ position: 'relative', width: '380px', maxWidth: '100%' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#94A3B8',
                }}
              />
              <input
                type="text"
                placeholder="Search students, insights, reports..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px 9px 40px',
                  borderRadius: '9999px',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
                  color: isDarkMode ? '#FFFFFF' : '#0F172A',
                  fontSize: '0.86rem',
                  outline: 'none',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#94A3B8',
                    cursor: 'pointer',
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* Right Top Controls */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              {/* Notification Bell */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                    backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isDarkMode ? '#94A3B8' : '#475569',
                    cursor: 'pointer',
                    position: 'relative',
                  }}
                >
                  <Bell size={18} />
                  <span
                    style={{
                      position: 'absolute',
                      top: '6px',
                      right: '6px',
                      width: '15px',
                      height: '15px',
                      borderRadius: '50%',
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '0.62rem',
                      fontWeight: 700,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    3
                  </span>
                </button>

                {/* Notifications Popover */}
                {notificationsOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '48px',
                      width: '320px',
                      backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                      borderRadius: '14px',
                      border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)',
                      padding: '1rem',
                      zIndex: 50,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                      <span style={{ fontWeight: 700, fontSize: '0.90rem' }}>Recent Alerts</span>
                      <button
                        onClick={() => setNotificationsOpen(false)}
                        style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                      >
                        ✕
                      </button>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#FEF2F2', fontSize: '0.78rem' }}>
                        <strong style={{ color: '#DC2626' }}>Academic Risk:</strong> Rajesh Kumar has 2 active backlogs.
                      </div>
                      <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#FFFBEB', fontSize: '0.78rem' }}>
                        <strong style={{ color: '#D97706' }}>Attendance Warning:</strong> Sneha Reddy dropped below 72%.
                      </div>
                      <div style={{ padding: '8px', borderRadius: '8px', backgroundColor: '#ECFDF5', fontSize: '0.78rem' }}>
                        <strong style={{ color: '#059669' }}>Placement Boost:</strong> Vamsi Krishna cleared Tier-1 DSA test.
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Light/Dark Toggle */}
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  backgroundColor: isDarkMode ? '#1E293B' : '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: isDarkMode ? '#F59E0B' : '#475569',
                  cursor: 'pointer',
                }}
                title="Toggle Theme"
              >
                {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>

              {/* User Profile Component (Dr. R. Kumar) */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: '4px',
                  }}
                >
                  <div
                    style={{
                      width: '38px',
                      height: '38px',
                      borderRadius: '50%',
                      backgroundColor: '#1E6BFF',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: 700,
                      fontSize: '0.84rem',
                      border: '2px solid #93C5FD',
                      boxShadow: '0 2px 8px rgba(30, 107, 255, 0.25)',
                      flexShrink: 0,
                    }}
                  >
                    RK
                  </div>
                  <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                    <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isDarkMode ? '#FFFFFF' : '#0F172A' }}>
                      Dr. R. Kumar
                    </div>
                    <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Institution Admin</div>
                  </div>
                  <ChevronDown size={14} style={{ color: '#94A3B8' }} />
                </button>

                {/* Profile Dropdown */}
                {userDropdownOpen && (
                  <div
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: '52px',
                      width: '200px',
                      backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                      borderRadius: '12px',
                      border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.12)',
                      padding: '8px',
                      zIndex: 50,
                    }}
                  >
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        navigate('/student/dashboard');
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'none',
                        border: 'none',
                        color: isDarkMode ? '#F8FAFC' : '#0F172A',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                      }}
                    >
                      🎓 Student Experience
                    </button>
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        setAiCopilotOpen(true);
                      }}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'none',
                        border: 'none',
                        color: isDarkMode ? '#F8FAFC' : '#0F172A',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                      }}
                    >
                      ✨ AI Copilot
                    </button>
                    <div style={{ height: '1px', backgroundColor: isDarkMode ? '#334155' : '#E2E8F0', margin: '4px 0' }} />
                    <button
                      onClick={handleLogout}
                      style={{
                        width: '100%',
                        textAlign: 'left',
                        padding: '8px 12px',
                        borderRadius: '6px',
                        background: 'none',
                        border: 'none',
                        color: '#EF4444',
                        fontSize: '0.84rem',
                        cursor: 'pointer',
                        fontWeight: 600,
                      }}
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* =====================================================================
              DASHBOARD MAIN CANVAS BODY
              ===================================================================== */}
          <main style={{ padding: '1.75rem 2rem 3rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
            {/* ===================================================================
                HERO BANNER: Campus Panoramic Backdrop Card (STITH Plan Reference)
                =================================================================== */}
            <div
              style={{
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                marginBottom: '1.75rem',
                minHeight: '190px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '2.25rem 2.5rem',
                backgroundImage: `linear-gradient(to right, rgba(15, 23, 42, 0.90) 0%, rgba(15, 23, 42, 0.65) 55%, rgba(15, 23, 42, 0.85) 100%), url('/assets/images/codebuffet_campus_entrance.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                boxShadow: '0 8px 24px rgba(15, 23, 42, 0.12)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              {/* Left Welcome Copy */}
              <div>
                <div
                  style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: 'rgba(255, 255, 255, 0.75)',
                    marginBottom: '6px',
                  }}
                >
                  WELCOME BACK,
                </div>
                <h1
                  style={{
                    fontSize: '2.1rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    lineHeight: 1.15,
                    marginBottom: '8px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  {currentUser?.name ? `${currentUser.name}!` : 'Dr. R. Kumar!'}
                </h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.96rem', margin: 0, maxWidth: '480px' }}>
                  Let's create a brighter future for every student.
                </p>

                {/* 3D Campus Quick Toggle Button */}
                <button
                  onClick={() => setCampus3DOpen(true)}
                  style={{
                    marginTop: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '7px 16px',
                    borderRadius: '9999px',
                    backgroundColor: 'rgba(30, 107, 255, 0.85)',
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backdropFilter: 'blur(8px)',
                    boxShadow: '0 4px 14px rgba(30, 107, 255, 0.4)',
                  }}
                >
                  <Compass size={14} />
                  <span>Launch 3D Campus Experience</span>
                </button>
              </div>

              {/* Right Floating Quote Box (From Image 2) */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(16px)',
                  WebkitBackdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  maxWidth: '340px',
                  color: '#FFFFFF',
                  boxShadow: '0 10px 30px rgba(0, 0, 0, 0.25)',
                }}
              >
                <div style={{ fontStyle: 'italic', fontSize: '0.94rem', lineHeight: 1.5, fontWeight: 500, marginBottom: '8px' }}>
                  "Empowering Students with Data-Driven Decisions"
                </div>
                <div style={{ fontSize: '0.74rem', color: '#38BDF8', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  — CODEBUFFET
                </div>
              </div>
            </div>

            {/* ===================================================================
                ROW 1: 4 KPI STAT CARDS (Exact match to Image 2)
                =================================================================== */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.75rem',
              }}
            >
              {/* Card 1: Total Students */}
              <div
                style={{
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.35rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#EFF6FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#1E6BFF',
                    }}
                  >
                    <Users size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>
                      {summaryData.total_students ? summaryData.total_students.toLocaleString() : '12,480'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>Total Students</div>
                    <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      ▲ +8.2%
                    </div>
                  </div>
                </div>
                {/* Mini Sparkline Bar Chart */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '36px' }}>
                  {[30, 45, 60, 50, 75, 95].map((h, i) => (
                    <div key={i} style={{ width: '5px', height: `${h}%`, backgroundColor: '#3B82F6', borderRadius: '2px' }} />
                  ))}
                </div>
              </div>

              {/* Card 2: Avg. Success Score */}
              <div
                style={{
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.35rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#ECFDF5',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#10B981',
                    }}
                  >
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>
                      {summaryData.avg_success_score !== undefined ? `${summaryData.avg_success_score}%` : '85.4%'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>Avg. Success Score</div>
                    <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      ▲ {summaryData.success_score_change || '+5.6%'}
                    </div>
                  </div>
                </div>
                {/* Mini Wave Sparkline */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '36px' }}>
                  {[25, 40, 55, 65, 80, 95].map((h, i) => (
                    <div key={i} style={{ width: '5px', height: `${h}%`, backgroundColor: '#10B981', borderRadius: '2px' }} />
                  ))}
                </div>
              </div>

              {/* Card 3: At-Risk Students */}
              <div
                style={{
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.35rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#FEF2F2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#EF4444',
                    }}
                  >
                    <AlertTriangle size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>
                      {summaryData.at_risk_pct !== undefined ? `${summaryData.at_risk_pct}%` : '5.2%'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>At-Risk Students</div>
                    <div style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      ▼ {summaryData.at_risk_change || '-2.1%'}
                    </div>
                  </div>
                </div>
                {/* Mini Red Sparkline */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '36px' }}>
                  {[90, 75, 60, 45, 30, 20].map((h, i) => (
                    <div key={i} style={{ width: '5px', height: `${h}%`, backgroundColor: '#EF4444', borderRadius: '2px' }} />
                  ))}
                </div>
              </div>

              {/* Card 4: Placement Readiness */}
              <div
                style={{
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.35rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div
                    style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#FAF5FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8B5CF6',
                    }}
                  >
                    <Briefcase size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>
                      {summaryData.placement_readiness_pct !== undefined ? `${summaryData.placement_readiness_pct}%` : '78.6%'}
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>Placement Readiness</div>
                    <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '2px' }}>
                      ▲ {summaryData.placement_change || '+6.8%'}
                    </div>
                  </div>
                </div>
                {/* Mini Purple Sparkline */}
                <div style={{ display: 'flex', alignItems: 'flex-end', gap: '3px', height: '36px' }}>
                  {[35, 45, 55, 65, 75, 90].map((h, i) => (
                    <div key={i} style={{ width: '5px', height: `${h}%`, backgroundColor: '#8B5CF6', borderRadius: '2px' }} />
                  ))}
                </div>
              </div>
            </div>

            {/* ===================================================================
                ROW 2: ANALYTICAL CHARTS (Exact Layout from Image 2)
                =================================================================== */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '1.25rem',
                marginBottom: '1.75rem',
              }}
            >
              {/* Chart 1: Student Success Score Trend (5 Columns) */}
              <div
                style={{
                  gridColumn: 'span 5',
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Student Success Score Trend</h3>
                  <select
                    value={trendRange}
                    onChange={(e) => setTrendRange(e.target.value)}
                    style={{
                      padding: '4px 8px',
                      borderRadius: '8px',
                      border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                      backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                      color: isDarkMode ? '#FFFFFF' : '#0F172A',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="Last 6 Months">Last 6 Months</option>
                    <option value="Last 3 Months">Last 3 Months</option>
                    <option value="Academic Year">Full Academic Year</option>
                  </select>
                </div>

                <div style={{ height: '220px', width: '100%', position: 'relative', minWidth: 0 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={SUCCESS_TREND_DATA} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                      <defs>
                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#1E6BFF" stopOpacity={0.35} />
                          <stop offset="95%" stopColor="#1E6BFF" stopOpacity={0.0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                      <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#0F172A',
                          border: 'none',
                          borderRadius: '8px',
                          color: '#FFFFFF',
                          fontSize: '0.8rem',
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="score"
                        stroke="#1E6BFF"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#scoreGradient)"
                        isAnimationActive={false}
                        activeDot={{ r: 6, fill: '#1E6BFF', stroke: '#FFFFFF', strokeWidth: 2 }}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Chart 2: Student Distribution Donut Chart (4 Columns) */}
              <div
                style={{
                  gridColumn: 'span 4',
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, marginBottom: '1rem' }}>
                  Student Distribution
                </h3>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  {/* Donut Chart with Center Text */}
                  <div style={{ width: '150px', height: '150px', position: 'relative', minWidth: '150px' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={DISTRIBUTION_DATA}
                          innerRadius={48}
                          outerRadius={68}
                          paddingAngle={3}
                          dataKey="value"
                          isAnimationActive={false}
                        >
                          {DISTRIBUTION_DATA.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                    <div
                      style={{
                        position: 'absolute',
                        top: '50%',
                        left: '50%',
                        transform: 'translate(-50%, -50%)',
                        textAlign: 'center',
                        lineHeight: 1.1,
                      }}
                    >
                      <div style={{ fontSize: '0.98rem', fontWeight: 800 }}>
                        {summaryData.total_students ? summaryData.total_students.toLocaleString() : '12,480'}
                      </div>
                      <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Students</div>
                    </div>
                  </div>

                  {/* Legend List (Matching Image 2) */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.80rem' }}>
                    {DISTRIBUTION_DATA.map((item) => (
                      <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            backgroundColor: item.color,
                          }}
                        />
                        <span style={{ color: '#64748B' }}>{item.name}</span>
                        <strong style={{ marginLeft: 'auto', paddingLeft: '8px' }}>{item.value}%</strong>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Chart 3: Department-wise Success Score (3 Columns) */}
              <div
                style={{
                  gridColumn: 'span 3',
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, marginBottom: '1.25rem' }}>
                  Department-wise Success Score
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(departmentData && departmentData.length > 0 ? departmentData : DEPARTMENT_SCORES).map((dept) => (
                    <div key={dept.dept}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: '3px' }}>
                        <span style={{ fontWeight: 600 }}>{dept.dept}</span>
                        <span style={{ fontWeight: 700, color: dept.color }}>{dept.score}%</span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '7px',
                          backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${Math.min(100, Math.max(0, dept.score))}%`,
                            height: '100%',
                            backgroundColor: dept.color,
                            borderRadius: '4px',
                          }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* ===================================================================
                ROW 3: RECENT ALERTS, TOP PRIORITIES & QUICK ACTIONS (Image 2 Match)
                =================================================================== */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(12, 1fr)',
                gap: '1.25rem',
              }}
            >
              {/* Box 1: Recent Alerts (4 Columns) */}
              <div
                style={{
                  gridColumn: 'span 4',
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Recent Alerts</h3>
                  <button
                    onClick={() => setStudentDirectoryOpen(true)}
                    style={{ background: 'none', border: 'none', color: '#1E6BFF', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    View All
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {/* Alert 1 */}
                  <div
                    onClick={() => {
                      setSelectedStudent(MOCK_STUDENTS[0]);
                      setStudentDirectoryOpen(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={MOCK_STUDENTS[0].avatar}
                        alt="Rajesh Kumar"
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#EF4444' }}>
                          Student at Academic Risk
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>RAJESH KUMAR - CSE</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#94A3B8' }}>2 mins ago</div>
                  </div>

                  {/* Alert 2 */}
                  <div
                    onClick={() => {
                      setSelectedStudent(MOCK_STUDENTS[1]);
                      setStudentDirectoryOpen(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={MOCK_STUDENTS[1].avatar}
                        alt="Sneha Reddy"
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#F59E0B' }}>
                          Low Attendance Alert
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>SNEHA REDDY - ECE</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#94A3B8' }}>15 mins ago</div>
                  </div>

                  {/* Alert 3 */}
                  <div
                    onClick={() => {
                      setSelectedStudent(MOCK_STUDENTS[2]);
                      setStudentDirectoryOpen(true);
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 10px',
                      borderRadius: '10px',
                      backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                      cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <img
                        src={MOCK_STUDENTS[2].avatar}
                        alt="Vamsi Krishna"
                        style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }}
                      />
                      <div>
                        <div style={{ fontSize: '0.80rem', fontWeight: 700, color: '#10B981' }}>
                          Placement Readiness Improved
                        </div>
                        <div style={{ fontSize: '0.72rem', color: '#64748B' }}>VAMSI KRISHNA - IT</div>
                      </div>
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#94A3B8' }}>1 hour ago</div>
                  </div>
                </div>
              </div>

              {/* Box 2: Top Priorities (4 Columns) */}
              <div
                style={{
                  gridColumn: 'span 4',
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Top Priorities</h3>
                  <button
                    onClick={() => setInterventionModalOpen(true)}
                    style={{ background: 'none', border: 'none', color: '#1E6BFF', fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer' }}
                  >
                    View All
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {[
                    { label: 'Follow up with at-risk students', count: 24, icon: Bell, color: '#EF4444', bg: '#FEF2F2' },
                    { label: 'Improve placement readiness', count: 18, icon: Briefcase, color: '#1E6BFF', bg: '#EFF6FF' },
                    { label: 'Boost student engagement', count: 12, icon: Target, color: '#8B5CF6', bg: '#FAF5FF' },
                    { label: 'Review academic performance', count: 9, icon: GraduationCap, color: '#10B981', bg: '#ECFDF5' },
                  ].map((priority) => {
                    const PIcon = priority.icon;
                    return (
                      <div
                        key={priority.label}
                        onClick={() => setInterventionModalOpen(true)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 12px',
                          borderRadius: '10px',
                          backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                          cursor: 'pointer',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div
                            style={{
                              width: '28px',
                              height: '28px',
                              borderRadius: '6px',
                              backgroundColor: priority.bg,
                              color: priority.color,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                            }}
                          >
                            <PIcon size={15} />
                          </div>
                          <span style={{ fontSize: '0.80rem', fontWeight: 600 }}>{priority.label}</span>
                        </div>
                        <span
                          style={{
                            fontSize: '0.74rem',
                            fontWeight: 700,
                            color: priority.color,
                            backgroundColor: priority.bg,
                            padding: '2px 8px',
                            borderRadius: '9999px',
                          }}
                        >
                          {priority.count}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Box 3: Quick Actions (4 Columns - Exact 2x2 Grid from Image 2) */}
              <div
                style={{
                  gridColumn: 'span 4',
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, marginBottom: '1rem' }}>
                  Quick Actions
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', flex: 1 }}>
                  {/* Action 1: View All Students */}
                  <button
                    onClick={() => setStudentDirectoryOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: '#EFF6FF',
                      color: '#1E6BFF',
                      border: '1px solid #DBEAFE',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <Users size={16} />
                    <span>View All Students</span>
                  </button>

                  {/* Action 2: Generate Report */}
                  <button
                    onClick={handleGenerateReport}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: '#ECFDF5',
                      color: '#10B981',
                      border: '1px solid #A7F3D0',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <FileText size={16} />
                    <span>{reportGenerated ? 'Report Downloaded!' : 'Generate Report'}</span>
                  </button>

                  {/* Action 3: AI Insights */}
                  <button
                    onClick={() => setAiCopilotOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: '#FAF5FF',
                      color: '#8B5CF6',
                      border: '1px solid #E9D5FF',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <Sparkles size={16} />
                    <span>AI Insights</span>
                  </button>

                  {/* Action 4: Create Intervention */}
                  <button
                    onClick={() => setInterventionModalOpen(true)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      padding: '12px',
                      borderRadius: '12px',
                      backgroundColor: '#FFF7ED',
                      color: '#EA580C',
                      border: '1px solid #FFEDD5',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                      transition: 'all 150ms ease',
                    }}
                  >
                    <Target size={16} />
                    <span>Create Intervention</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>

      {/* =========================================================================
          MODAL 1: STUDENT DIRECTORY & DETAIL DRAWER (Active & Functional)
          ========================================================================= */}
      {studentDirectoryOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              borderRadius: '20px',
              width: '1000px',
              maxWidth: '95vw',
              maxHeight: '88vh',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
              overflow: 'hidden',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                padding: '1.25rem 1.75rem',
                borderBottom: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <div>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                  Unified Student Intelligence Directory
                </h3>
                <span style={{ fontSize: '0.80rem', color: '#64748B' }}>
                  Showing {filteredStudents.length} Students across Engineering Departments
                </span>
              </div>
              <button
                onClick={() => {
                  setStudentDirectoryOpen(false);
                  setSelectedStudent(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94A3B8',
                  cursor: 'pointer',
                  fontSize: '1.2rem',
                  padding: '4px',
                }}
              >
                ✕
              </button>
            </div>

            {/* Modal Table Body */}
            <div style={{ padding: '1.25rem 1.75rem', overflowY: 'auto', flex: 1 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                <thead>
                  <tr style={{ borderBottom: `2px solid ${isDarkMode ? '#334155' : '#F1F5F9'}`, textAlign: 'left', color: '#64748B' }}>
                    <th style={{ padding: '10px 8px' }}>Student</th>
                    <th style={{ padding: '10px 8px' }}>Dept</th>
                    <th style={{ padding: '10px 8px' }}>CGPA</th>
                    <th style={{ padding: '10px 8px' }}>Attendance</th>
                    <th style={{ padding: '10px 8px' }}>Success Score</th>
                    <th style={{ padding: '10px 8px' }}>Academic Risk</th>
                    <th style={{ padding: '10px 8px' }}>Placement Risk</th>
                    <th style={{ padding: '10px 8px', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredStudents.map((s) => (
                    <tr
                      key={s.id}
                      style={{
                        borderBottom: `1px solid ${isDarkMode ? '#334155' : '#F8FAFC'}`,
                        backgroundColor: selectedStudent?.id === s.id ? (isDarkMode ? '#0F172A' : '#EFF6FF') : 'transparent',
                      }}
                    >
                      <td style={{ padding: '12px 8px', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <img src={s.avatar} alt={s.name} style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        <div>
                          <div style={{ fontWeight: 700 }}>{s.name}</div>
                          <div style={{ fontSize: '0.72rem', color: '#94A3B8' }}>{s.id}</div>
                        </div>
                      </td>
                      <td style={{ padding: '12px 8px', fontWeight: 600 }}>{s.department}</td>
                      <td style={{ padding: '12px 8px', fontWeight: 700 }}>{s.cgpa}</td>
                      <td style={{ padding: '12px 8px', color: s.attendance < 75 ? '#EF4444' : '#10B981', fontWeight: 600 }}>
                        {s.attendance}%
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontWeight: 700,
                            fontSize: '0.76rem',
                            backgroundColor: s.successScore >= 80 ? '#ECFDF5' : s.successScore >= 65 ? '#EFF6FF' : '#FEF2F2',
                            color: s.successScore >= 80 ? '#059669' : s.successScore >= 65 ? '#1E6BFF' : '#DC2626',
                          }}
                        >
                          {s.successScore}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: s.academicRisk === 'HIGH' ? '#FEF2F2' : s.academicRisk === 'MEDIUM' ? '#FFFBEB' : '#ECFDF5',
                            color: s.academicRisk === 'HIGH' ? '#DC2626' : s.academicRisk === 'MEDIUM' ? '#D97706' : '#059669',
                          }}
                        >
                          {s.academicRisk}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '9999px',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                            backgroundColor: s.placementRisk === 'HIGH' ? '#FEF2F2' : s.placementRisk === 'MEDIUM' ? '#FAF5FF' : '#ECFDF5',
                            color: s.placementRisk === 'HIGH' ? '#DC2626' : s.placementRisk === 'MEDIUM' ? '#7C3AED' : '#059669',
                          }}
                        >
                          {s.placementRisk}
                        </span>
                      </td>
                      <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedStudent(s)}
                          style={{
                            padding: '4px 10px',
                            borderRadius: '6px',
                            backgroundColor: '#1E6BFF',
                            color: '#FFFFFF',
                            border: 'none',
                            fontSize: '0.76rem',
                            fontWeight: 600,
                            cursor: 'pointer',
                          }}
                        >
                          Inspect
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Selected Student Explanatory Factor Card */}
              {selectedStudent && (
                <div
                  style={{
                    marginTop: '1.5rem',
                    padding: '1.25rem',
                    borderRadius: '14px',
                    backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                    border: '1px solid #1E6BFF',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Eye size={18} style={{ color: '#1E6BFF' }} />
                      <strong style={{ fontSize: '0.94rem' }}>
                        Predictive Diagnostics & Contributing Factors: {selectedStudent.name}
                      </strong>
                    </div>
                    <button
                      onClick={() => setSelectedStudent(null)}
                      style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                  <p style={{ fontSize: '0.84rem', color: '#475569', margin: '4px 0 10px' }}>
                    <strong>Key Driver:</strong> {selectedStudent.topRiskFactor}
                  </p>
                  <div style={{ display: 'flex', gap: '1.5rem', fontSize: '0.78rem' }}>
                    <span>LMS Completion: <strong>{selectedStudent.lmsCompletion}%</strong></span>
                    <span>Coding Assessment: <strong>{selectedStudent.codingSkills}/10</strong></span>
                    <span>Aptitude Benchmark: <strong>{selectedStudent.aptitudeScore}/100</strong></span>
                    <span>Active Backlogs: <strong>{selectedStudent.backlogs}</strong></span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 2: INTERVENTION SANDBOX SIMULATOR (Resource-Constrained)
          ========================================================================= */}
      {interventionModalOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.65)',
            backdropFilter: 'blur(6px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 100,
            padding: '1.5rem',
          }}
        >
          <div
            style={{
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              borderRadius: '20px',
              width: '680px',
              maxWidth: '95vw',
              padding: '2rem',
              boxShadow: '0 25px 60px rgba(0,0,0,0.3)',
              border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Target size={24} style={{ color: '#1E6BFF' }} />
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                    Student Success Decision Simulator
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Intervention Sandbox under Resource Constraints</span>
                </div>
              </div>
              <button
                onClick={() => setInterventionModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Available Faculty Mentoring Capacity: <strong>{allocatedMentors} Slots</strong>
                </label>
                <input
                  type="range"
                  min="10"
                  max="100"
                  value={allocatedMentors}
                  onChange={(e) => setAllocatedMentors(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#1E6BFF' }}
                />
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.72rem', color: '#94A3B8' }}>
                  <span>10 Slots (Severe constraint)</span>
                  <span>50 Slots (Standard cohort)</span>
                  <span>100 Slots (Full coverage)</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.84rem', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Allocation Strategy
                </label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    onClick={() => setStrategy('skill-gap')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: strategy === 'skill-gap' ? '2px solid #1E6BFF' : '1px solid #E2E8F0',
                      backgroundColor: strategy === 'skill-gap' ? '#EFF6FF' : 'transparent',
                      color: strategy === 'skill-gap' ? '#1E6BFF' : '#475569',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    🎯 Skill-Gap Prioritized
                  </button>
                  <button
                    onClick={() => setStrategy('cohort-wide')}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '10px',
                      border: strategy === 'cohort-wide' ? '2px solid #1E6BFF' : '1px solid #E2E8F0',
                      backgroundColor: strategy === 'cohort-wide' ? '#EFF6FF' : 'transparent',
                      color: strategy === 'cohort-wide' ? '#1E6BFF' : '#475569',
                      fontWeight: 600,
                      fontSize: '0.82rem',
                      cursor: 'pointer',
                    }}
                  >
                    👥 Uniform Attendance Cohort
                  </button>
                </div>
              </div>

              {/* Simulation Projected Impact */}
              <div
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div style={{ fontSize: '0.84rem', fontWeight: 700, marginBottom: '6px' }}>Simulation Estimate:</div>
                <div style={{ fontSize: '0.78rem', color: '#64748B', lineHeight: 1.5 }}>
                  Under <strong>{allocatedMentors} mentoring slots</strong> with <strong>{strategy === 'skill-gap' ? 'Skill-Gap Strategy' : 'Uniform Attendance Strategy'}</strong>, {Math.min(86, allocatedMentors)} of the 86 at-risk students will receive high-touch faculty mentoring, targeting a projected <strong>14.2% reduction</strong> in semester probation rates.
                </div>
              </div>

              <button
                onClick={() => {
                  alert(`Intervention Plan Approved: ${allocatedMentors} slots assigned. Notification dispatched to department heads.`);
                  setInterventionModalOpen(false);
                }}
                style={{
                  padding: '12px',
                  borderRadius: '10px',
                  backgroundColor: '#1E6BFF',
                  color: '#FFFFFF',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: '0.90rem',
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(30, 107, 255, 0.35)',
                }}
              >
                Approve & Dispatch Intervention Plan →
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 3: AI INSIGHTS COPILOT DRAWER
          ========================================================================= */}
      {aiCopilotOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.5)',
            zIndex: 100,
            display: 'flex',
            justifyContent: 'flex-end',
          }}
        >
          <div
            style={{
              width: '420px',
              maxWidth: '90vw',
              height: '100%',
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              boxShadow: '-10px 0 30px rgba(0,0,0,0.2)',
              display: 'flex',
              flexDirection: 'column',
              padding: '1.5rem',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={20} style={{ color: '#8B5CF6' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0 }}>CODEBUFFET AI Copilot</h3>
              </div>
              <button onClick={() => setAiCopilotOpen(false)} style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}>
                ✕
              </button>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#EFF6FF', fontSize: '0.82rem', color: '#1E6BFF' }}>
                🤖 <strong>Campus Diagnostic Summary:</strong><br />
                Average Student Success Score is {summaryData.avg_success_score || 85.4}% across {summaryData.total_students ? summaryData.total_students.toLocaleString() : '12,480'} students. CSE and IT lead placement benchmarks (84.4% and 84.1%), while Civil and Mechanical require targeted coding intervention.
              </div>
              <div style={{ padding: '12px', borderRadius: '12px', backgroundColor: '#FAF5FF', fontSize: '0.82rem', color: '#7C3AED' }}>
                💡 <strong>Recommended Action:</strong><br />
                Schedule a 4-week weekend DSA bootcamp for 112 students identified in the Placement Risk Cohort before campus recruitment drives commence in September.
              </div>
            </div>

            <div style={{ marginTop: '1rem', display: 'flex', gap: '8px' }}>
              <input
                type="text"
                placeholder="Ask institutional copilot..."
                style={{
                  flex: 1,
                  padding: '10px 12px',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.84rem',
                  outline: 'none',
                }}
              />
              <button
                style={{
                  backgroundColor: '#8B5CF6',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '10px 14px',
                  cursor: 'pointer',
                }}
              >
                <Send size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL 4: 3D CAMPUS TWIN MODAL (Full 3D Experience from Image 1)
          ========================================================================= */}
      {campus3DOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(6, 13, 26, 0.90)',
            backdropFilter: 'blur(12px)',
            zIndex: 110,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '2rem',
          }}
        >
          <div
            style={{
              width: '1200px',
              maxWidth: '96vw',
              height: '740px',
              maxHeight: '94vh',
              backgroundColor: '#060D1A',
              borderRadius: '24px',
              overflow: 'hidden',
              display: 'flex',
              flexDirection: 'column',
              boxShadow: '0 30px 80px rgba(0, 0, 0, 0.8), 0 0 50px rgba(30, 107, 255, 0.3)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
            }}
          >
            {/* Header */}
            <div
              style={{
                padding: '1rem 1.5rem',
                borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                color: '#FFFFFF',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Compass size={20} style={{ color: '#38BDF8' }} />
                <strong style={{ fontSize: '1.05rem' }}>CODEBUFFET Interactive 3D Digital Campus Twin</strong>
              </div>
              <button
                onClick={() => setCampus3DOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            {/* 3D Canvas Body */}
            <div style={{ flex: 1, padding: '1rem' }}>
              <Campus3DExperience onExploreClick={() => setCampus3DOpen(false)} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

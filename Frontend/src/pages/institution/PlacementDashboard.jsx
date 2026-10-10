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
  Search,
  Bell,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  ArrowRight,
  Home,
  BarChart2,
  ShieldAlert,
  Star,
  FileText,
  Target,
  Settings,
  X,
  Plus,
  CheckCircle2,
  Building,
  CheckSquare,
  Eye,
  Sliders,
  Calendar,
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
  BarChart,
  Bar,
} from 'recharts';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import { MOCK_STUDENTS, DEPARTMENT_SCORES } from '../../data/mockStudents';
import api from '../../services/api';

const PLACEMENT_TIERS = [
  { name: 'Tier-1 Dream Company (>=12 LPA)', value: 38, color: '#8B5CF6' },
  { name: 'Tier-2 Core & IT (6-12 LPA)', value: 42, color: '#1E6BFF' },
  { name: 'Needs Skill Acceleration', value: 20, color: '#F59E0B' },
];

export default function PlacementDashboard() {
  const { currentUser, logout, loginWithDemo } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [riskFilter, setRiskFilter] = useState('ALL'); // 'ALL' | 'HIGH' | 'MEDIUM' | 'LOW'
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [mockInterviewModalOpen, setMockInterviewModalOpen] = useState(false);

  // Live Backend Data States
  const [candidates, setCandidates] = useState([]);
  const [summaryData, setSummaryData] = useState({
    total_students: 12480,
    placement_readiness_pct: 78.6,
  });
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [interviewCandidate, setInterviewCandidate] = useState(null);
  const [interviewDate, setInterviewDate] = useState('Nov 12, 2026');
  const [scheduling, setScheduling] = useState(false);
  const [actionNotice, setActionNotice] = useState('');

  // Load placement candidates from backend
  useEffect(() => {
    let isMounted = true;
    async function fetchPlacementData() {
      try {
        const [sumRes, studRes] = await Promise.allSettled([
          api.getInstitutionSummary(),
          api.getInstitutionStudents(),
        ]);

        if (isMounted) {
          if (sumRes.status === 'fulfilled' && sumRes.value) {
            setSummaryData(sumRes.value);
            setIsLiveApi(true);
          }
          if (studRes.status === 'fulfilled') {
            const list = Array.isArray(studRes.value) ? studRes.value : (studRes.value?.items || []);
            setCandidates(list.length > 0 ? list : MOCK_STUDENTS);
          } else {
            setCandidates(MOCK_STUDENTS);
          }
        }
      } catch (err) {
        console.warn('Backend unavailable, using standalone mock data:', err);
      }
    }
    fetchPlacementData();
    return () => { isMounted = false; };
  }, []);

  const handleScheduleMockInterview = async (e) => {
    e.preventDefault();
    if (!interviewCandidate) return;
    setScheduling(true);
    try {
      await api.createIntervention({
        student_roll_no: interviewCandidate.id,
        student_name: interviewCandidate.name,
        department: interviewCandidate.department,
        title: `Corporate Mock Technical Interview (DSA & System Design)`,
        category: 'PLACEMENT',
        assigned_mentor: 'Vikram Malhotra (TPO)',
        due_date: interviewDate,
      });
      setActionNotice(`Mock interview scheduled for ${interviewCandidate.name} on ${interviewDate}!`);
      setTimeout(() => setActionNotice(''), 4000);
      setMockInterviewModalOpen(false);
    } catch (err) {
      console.error('Failed to schedule interview:', err);
    } finally {
      setScheduling(false);
    }
  };

  const filteredCandidates = useMemo(() => {
    let list = candidates && candidates.length > 0 ? candidates : MOCK_STUDENTS;
    if (riskFilter !== 'ALL') {
      list = list.filter((s) => s.placementRisk === riskFilter);
    }
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
    );
  }, [searchQuery, riskFilter, candidates]);

  const tier1Count = useMemo(() => {
    return candidates.filter((s) => (s.dsaScore >= 8.0 || s.codingSkills >= 8.0) && s.cgpa >= 8.0).length;
  }, [candidates]);

  const atRiskPlacementCount = useMemo(() => {
    return candidates.filter((s) => s.placementRisk === 'HIGH').length;
  }, [candidates]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

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
          TOP DEMO PERSISTENT ROLE BAR
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
              backgroundColor: '#8B5CF6',
              fontWeight: 700,
              fontSize: '0.74rem',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
            <span>{isLiveApi ? 'FASTAPI TPO TELEMETRY ACTIVE' : 'PLACEMENT OFFICER PORTAL'}</span>
          </span>
          <span>
            Logged in as: <strong>{currentUser?.name || 'Vikram Malhotra'}</strong> (Placement Director)
          </span>
        </div>

        {/* Quick Role Switchers */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginRight: '4px' }}>Switch View:</span>
          <button
            onClick={async () => {
              await loginWithDemo('admin');
              navigate('/institution/dashboard');
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
            🏛️ Admin
          </button>
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
              color: 'rgba(255,255,255,0.7)',
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

      {/* Action Notification Banner */}
      {actionNotice && (
        <div
          style={{
            backgroundColor: '#ECFDF5',
            color: '#065F46',
            borderBottom: '1px solid #A7F3D0',
            padding: '8px 1.5rem',
            fontSize: '0.84rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            justifyContent: 'center',
          }}
        >
          <CheckCircle2 size={16} />
          <span>{actionNotice}</span>
        </div>
      )}

      {/* =========================================================================
          MAIN APPLICATION LAYOUT (SIDEBAR + MAIN CANVAS)
          ========================================================================= */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* LEFT SIDEBAR */}
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
            <div style={{ padding: '0 0.5rem 1.5rem', borderBottom: `1px solid ${isDarkMode ? '#1E293B' : '#F1F5F9'}` }}>
              <BrandLogo variant={isDarkMode ? 'dark' : 'light'} size="small" showTagline={false} />
            </div>

            <nav style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {[
                { name: 'Placement Hub', icon: Briefcase, active: true },
                { name: 'Candidate Pipeline', icon: Users, active: false },
                { name: 'Recruitment Drives', icon: Building, active: false },
                { name: 'Skill Benchmarks', icon: BarChart2, active: false },
                { name: 'Mock Interviews', icon: Target, active: false },
                { name: 'Placement Reports', icon: FileText, active: false },
                { name: 'Settings', icon: Settings, active: false },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '9px 12px',
                      borderRadius: '10px',
                      backgroundColor: item.active ? '#8B5CF6' : 'transparent',
                      color: item.active ? '#FFFFFF' : isDarkMode ? '#94A3B8' : '#64748B',
                      fontSize: '0.88rem',
                      fontWeight: item.active ? 600 : 500,
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      width: '100%',
                    }}
                  >
                    <Icon size={18} />
                    <span>{item.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          <div
            style={{
              padding: '1.25rem 1rem',
              borderRadius: '14px',
              background: 'linear-gradient(135deg, #FAF5FF 0%, #EFF6FF 100%)',
              border: '1px solid #E9D5FF',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#7C3AED', lineHeight: 1.2 }}>
              Placement Season 2026
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
              Corporate Relations & Drives
            </div>
          </div>
        </aside>

        {/* MAIN CANVAS */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
          {/* Header */}
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
                placeholder="Search candidates by name, roll no, skills..."
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
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
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

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '50%',
                    backgroundColor: '#8B5CF6',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    border: '2px solid #DDD6FE',
                  }}
                >
                  VM
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isDarkMode ? '#FFFFFF' : '#0F172A' }}>
                    Vikram Malhotra
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Placement Director</div>
                </div>
              </div>
            </div>
          </header>

          {/* Canvas Content */}
          <main style={{ padding: '1.75rem 2rem 3rem', maxWidth: '1440px', width: '100%', margin: '0 auto' }}>
            {/* HERO BANNER */}
            <div
              style={{
                position: 'relative',
                borderRadius: '20px',
                overflow: 'hidden',
                marginBottom: '1.75rem',
                minHeight: '170px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '2rem 2.5rem',
                backgroundImage: `linear-gradient(to right, rgba(76, 29, 149, 0.92) 0%, rgba(15, 23, 42, 0.75) 60%, rgba(15, 23, 42, 0.90) 100%), url('/assets/images/codebuffet_campus_entrance.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                boxShadow: '0 8px 24px rgba(76, 29, 149, 0.18)',
                border: '1px solid rgba(255, 255, 255, 0.1)',
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: '0.74rem',
                    fontWeight: 700,
                    letterSpacing: '0.14em',
                    textTransform: 'uppercase',
                    color: '#DDD6FE',
                    marginBottom: '4px',
                  }}
                >
                  CAREER & CORPORATE RELATIONS • TPO INTELLIGENCE
                </div>
                <h1
                  style={{
                    fontSize: '2rem',
                    fontWeight: 800,
                    color: '#FFFFFF',
                    lineHeight: 1.15,
                    marginBottom: '6px',
                    letterSpacing: '-0.02em',
                  }}
                >
                  Welcome back, Vikram Malhotra!
                </h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.92rem', margin: 0, maxWidth: '520px' }}>
                  Monitoring placement conversion pipeline, coding benchmarks, and technical mock interview readiness.
                </p>
              </div>

              {/* Stat HUD */}
              <div
                style={{
                  backgroundColor: 'rgba(255, 255, 255, 0.12)',
                  backdropFilter: 'blur(16px)',
                  border: '1px solid rgba(255, 255, 255, 0.25)',
                  borderRadius: '16px',
                  padding: '1.25rem 1.5rem',
                  maxWidth: '300px',
                  color: '#FFFFFF',
                }}
              >
                <div style={{ fontSize: '0.76rem', color: '#DDD6FE', fontWeight: 700, textTransform: 'uppercase' }}>
                  Campus Readiness
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, margin: '4px 0' }}>
                  {summaryData.placement_readiness_pct || 78.6}%
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>
                  Tier-1 eligible: {tier1Count} candidates
                </div>
              </div>
            </div>

            {/* 4 KPI CARDS */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
                gap: '1.25rem',
                marginBottom: '1.75rem',
              }}
            >
              {/* Card 1 */}
              <div
                style={{
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.35rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
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
                      {summaryData.placement_readiness_pct || 78.6}%
                    </div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>Overall Readiness</div>
                    <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>
                      ▲ +6.8% from last drive
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2 */}
              <div
                style={{
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.35rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
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
                    <Star size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>{tier1Count}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>Tier-1 Dream Candidates</div>
                    <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>
                      DSA &gt;= 8.0 &amp; CGPA &gt;= 8.0
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 3 */}
              <div
                style={{
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.35rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
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
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>{atRiskPlacementCount}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>High Placement Risk</div>
                    <div style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 700, marginTop: '2px' }}>
                      Need technical counseling
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 4 */}
              <div
                style={{
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.35rem 1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
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
                    <Building size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>14 Drives</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>Scheduled Campus Drives</div>
                    <div style={{ fontSize: '0.72rem', color: '#1E6BFF', fontWeight: 700, marginTop: '2px' }}>
                      Next: Microsoft &amp; Amazon
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: PLACEMENT ANALYTICS CHARTS */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
              {/* Chart 1: Placement Tier Breakdown (5 cols) */}
              <div
                style={{
                  gridColumn: 'span 5',
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Placement Tier Segmentation</h3>
                  <span style={{ fontSize: '0.76rem', color: '#64748B' }}>Eligibility by LPA package tier</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1rem 0' }}>
                  <div style={{ width: '140px', height: '140px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={PLACEMENT_TIERS}
                          innerRadius={44}
                          outerRadius={64}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {PLACEMENT_TIERS.map((entry, index) => (
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
                      }}
                    >
                      <div style={{ fontSize: '1rem', fontWeight: 800 }}>78.6%</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Ready</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.78rem' }}>
                    {PLACEMENT_TIERS.map((item) => (
                      <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                        <span style={{ color: '#64748B' }}>{item.name}</span>
                        <strong style={{ marginLeft: 'auto', paddingLeft: '8px' }}>{item.value}%</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#FAF5FF', padding: '10px', borderRadius: '8px', fontSize: '0.76rem', color: '#6B21A8' }}>
                  🎯 <strong>TPO Strategy:</strong> 20% in skill acceleration require intensive DSA mock rounds prior to Day 1 recruitment.
                </div>
              </div>

              {/* Chart 2: Department-wise Placement Conversion (7 cols) */}
              <div
                style={{
                  gridColumn: 'span 7',
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Department Placement Readiness Benchmark</h3>
                    <span style={{ fontSize: '0.76rem', color: '#64748B' }}>Conversion probability across engineering disciplines</span>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {DEPARTMENT_SCORES.map((dept) => (
                    <div key={dept.dept}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.80rem', marginBottom: '4px' }}>
                        <span style={{ fontWeight: 600 }}>{dept.dept}</span>
                        <span style={{ fontWeight: 700, color: dept.color }}>{dept.score}% Ready</span>
                      </div>
                      <div
                        style={{
                          width: '100%',
                          height: '8px',
                          backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
                          borderRadius: '4px',
                          overflow: 'hidden',
                        }}
                      >
                        <div
                          style={{
                            width: `${dept.score}%`,
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

            {/* ROW 3: CANDIDATE PIPELINE & RECRUITMENT TABLE */}
            <div
              style={{
                backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                borderRadius: '16px',
                padding: '1.5rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Campus Placement Candidate Pipeline</h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Inspect candidate coding assessment, DSA mastery, and trigger mock interviews</span>
                </div>

                {/* Risk Filter Tabs */}
                <div style={{ display: 'flex', gap: '6px' }}>
                  {['ALL', 'LOW', 'MEDIUM', 'HIGH'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setRiskFilter(tab)}
                      style={{
                        padding: '4px 10px',
                        borderRadius: '6px',
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        border: 'none',
                        cursor: 'pointer',
                        backgroundColor: riskFilter === tab ? '#8B5CF6' : (isDarkMode ? '#334155' : '#F1F5F9'),
                        color: riskFilter === tab ? '#FFFFFF' : (isDarkMode ? '#94A3B8' : '#475569'),
                      }}
                    >
                      {tab === 'ALL' ? 'All Candidates' : `${tab} Risk`}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${isDarkMode ? '#334155' : '#F1F5F9'}`, textAlign: 'left', color: '#64748B' }}>
                      <th style={{ padding: '10px 8px' }}>Candidate</th>
                      <th style={{ padding: '10px 8px' }}>Dept</th>
                      <th style={{ padding: '10px 8px' }}>CGPA</th>
                      <th style={{ padding: '10px 8px' }}>Coding (10)</th>
                      <th style={{ padding: '10px 8px' }}>DSA Score</th>
                      <th style={{ padding: '10px 8px' }}>Aptitude</th>
                      <th style={{ padding: '10px 8px' }}>Placement Risk</th>
                      <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredCandidates.map((s) => (
                      <tr
                        key={s.id}
                        style={{
                          borderBottom: `1px solid ${isDarkMode ? '#334155' : '#F8FAFC'}`,
                          backgroundColor: selectedStudent?.id === s.id ? (isDarkMode ? '#0F172A' : '#FAF5FF') : 'transparent',
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
                        <td style={{ padding: '12px 8px' }}>
                          <strong style={{ color: s.codingSkills >= 8 ? '#059669' : '#D97706' }}>
                            {s.codingSkills || 8.0}/10
                          </strong>
                        </td>
                        <td style={{ padding: '12px 8px' }}>
                          <strong style={{ color: s.dsaScore >= 8 ? '#059669' : '#DC2626' }}>
                            {s.dsaScore || 7.5}/10
                          </strong>
                        </td>
                        <td style={{ padding: '12px 8px' }}>{s.aptitudeScore || 78}/100</td>
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
                            {s.placementRisk || 'LOW'}
                          </span>
                        </td>
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', gap: '6px' }}>
                            <button
                              onClick={() => setSelectedStudent(s)}
                              style={{
                                padding: '5px 9px',
                                borderRadius: '6px',
                                backgroundColor: isDarkMode ? '#334155' : '#F1F5F9',
                                color: isDarkMode ? '#FFFFFF' : '#0F172A',
                                border: 'none',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Inspect
                            </button>
                            <button
                              onClick={() => {
                                setInterviewCandidate(s);
                                setMockInterviewModalOpen(true);
                              }}
                              style={{
                                padding: '5px 9px',
                                borderRadius: '6px',
                                backgroundColor: '#8B5CF6',
                                color: '#FFFFFF',
                                border: 'none',
                                fontSize: '0.74rem',
                                fontWeight: 600,
                                cursor: 'pointer',
                              }}
                            >
                              Mock Interview
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Selected Candidate Diagnostic Drawer */}
              {selectedStudent && (
                <div
                  style={{
                    marginTop: '1.25rem',
                    padding: '1.25rem',
                    borderRadius: '14px',
                    backgroundColor: isDarkMode ? '#0F172A' : '#FAF5FF',
                    border: '1px solid #8B5CF6',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <Eye size={18} style={{ color: '#8B5CF6' }} />
                      <strong style={{ fontSize: '0.94rem' }}>
                        Candidate Placement Telemetry: {selectedStudent.name} ({selectedStudent.id})
                      </strong>
                    </div>
                    <button
                      onClick={() => setSelectedStudent(null)}
                      style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer' }}
                    >
                      ✕
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginTop: '10px', fontSize: '0.82rem' }}>
                    <div>Placement Risk Factor: <strong>{selectedStudent.topRiskFactor || 'Tier-1 Candidate'}</strong></div>
                    <div>Overall Success Score: <strong>{selectedStudent.successScore}%</strong></div>
                    <div>Attendance Record: <strong>{selectedStudent.attendance}%</strong></div>
                    <div>Active Backlogs: <strong>{selectedStudent.backlogs || 0}</strong></div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* SCHEDULE MOCK INTERVIEW MODAL */}
      {mockInterviewModalOpen && interviewCandidate && (
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
              maxWidth: '480px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#FAF5FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#8B5CF6' }}>
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Schedule Corporate Mock Interview</h3>
                  <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Pre-placement technical evaluation</span>
                </div>
              </div>
              <button
                onClick={() => setMockInterviewModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleScheduleMockInterview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  Candidate
                </label>
                <div style={{ padding: '8px 12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0', fontSize: '0.86rem' }}>
                  <strong>{interviewCandidate.name}</strong> ({interviewCandidate.id}) — {interviewCandidate.department}
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  Evaluation Track
                </label>
                <select
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.86rem',
                  }}
                >
                  <option>Tier-1 FAANG/Product: Advanced DSA &amp; System Design</option>
                  <option>Core IT Services: Full Stack &amp; SQL Benchmark</option>
                  <option>Quantitative Aptitude &amp; Communication Round</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  Scheduled Date &amp; Slot
                </label>
                <input
                  type="text"
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  placeholder="e.g. Nov 14, 2026 • 2:00 PM"
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.86rem',
                  }}
                />
              </div>

              <button
                type="submit"
                disabled={scheduling}
                style={{
                  marginTop: '0.5rem',
                  backgroundColor: '#8B5CF6',
                  color: '#FFFFFF',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.90rem',
                  border: 'none',
                  cursor: scheduling ? 'not-allowed' : 'pointer',
                }}
              >
                {scheduling ? 'Scheduling Session...' : 'Confirm & Notify Student'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

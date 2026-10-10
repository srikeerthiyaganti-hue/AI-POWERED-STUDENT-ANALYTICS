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
  Clock,
  BookOpen,
  Eye,
  Sliders,
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
import { MOCK_STUDENTS } from '../../data/mockStudents';
import api from '../../services/api';

const MENTOR_DISTRIBUTION = [
  { name: 'On Track (Low Risk)', value: 75, color: '#10B981' },
  { name: 'Moderate Risk', value: 15, color: '#F59E0B' },
  { name: 'High Risk (Action Needed)', value: 10, color: '#EF4444' },
];

export default function MentorDashboard() {
  const { currentUser, logout, loginWithDemo } = useAuth();
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [createTaskModalOpen, setCreateTaskModalOpen] = useState(false);

  // Live Backend Data States
  const [mentees, setMentees] = useState([]);
  const [interventions, setInterventions] = useState([]);
  const [isLiveApi, setIsLiveApi] = useState(false);
  const [submittingTask, setSubmittingTask] = useState(false);

  // New Task Form State
  const [newTaskRoll, setNewTaskRoll] = useState('STU-2024-001');
  const [newTaskName, setNewTaskName] = useState('Rajesh Kumar');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskCategory, setNewTaskCategory] = useState('ATTENDANCE');
  const [newTaskDueDate, setNewTaskDueDate] = useState('Nov 10, 2026');

  // Load CSE Mentees & Interventions
  useEffect(() => {
    let isMounted = true;
    async function fetchMentorData() {
      try {
        const [studRes, intervRes] = await Promise.allSettled([
          api.getInstitutionStudents('', '', 'Computer Science & Engineering'),
          api.getInterventions('Prof. Rajesh Kumar'),
        ]);

        if (isMounted) {
          if (studRes.status === 'fulfilled' && Array.isArray(studRes.value) && studRes.value.length > 0) {
            setMentees(studRes.value);
            setIsLiveApi(true);
          } else {
            // Filter mock CSE students
            setMentees(MOCK_STUDENTS.filter((s) => s.department === 'CSE'));
          }

          if (intervRes.status === 'fulfilled' && Array.isArray(intervRes.value) && intervRes.value.length > 0) {
            setInterventions(intervRes.value);
          } else {
            setInterventions([
              {
                id: 1,
                student_roll_no: 'STU-2024-042',
                student_name: 'Aarav Sharma',
                department: 'Computer Science & Engineering',
                title: 'Complete LeetCode Top 50 DSA practice set',
                category: 'SKILL_GAP',
                assigned_mentor: 'Prof. Rajesh Kumar',
                status: 'OPEN',
                due_date: 'Oct 15, 2026',
              },
              {
                id: 4,
                student_roll_no: 'STU-2024-001',
                student_name: 'Rajesh Kumar',
                department: 'Computer Science & Engineering',
                title: 'Urgent Attendance Counseling & Arrears Remedial',
                category: 'ATTENDANCE',
                assigned_mentor: 'Prof. Rajesh Kumar',
                status: 'OPEN',
                due_date: 'Oct 12, 2026',
              },
            ]);
          }
        }
      } catch (err) {
        console.warn('Backend unavailable, using fallback data:', err);
      }
    }
    fetchMentorData();
    return () => { isMounted = false; };
  }, []);

  const handleToggleIntervention = async (id) => {
    // Optimistic UI update
    setInterventions((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: item.status === 'OPEN' ? 'COMPLETED' : 'OPEN' } : item
      )
    );

    try {
      await api.toggleInstitutionIntervention(id);
    } catch {
      // Fallback
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;
    setSubmittingTask(true);
    try {
      const payload = {
        student_roll_no: newTaskRoll,
        student_name: newTaskName,
        department: 'Computer Science & Engineering',
        title: newTaskTitle.trim(),
        category: newTaskCategory,
        assigned_mentor: currentUser?.name || 'Prof. Rajesh Kumar',
        due_date: newTaskDueDate,
      };
      const res = await api.createIntervention(payload);
      if (res?.id) {
        setInterventions((prev) => [
          { ...payload, id: res.id, status: 'OPEN' },
          ...prev,
        ]);
      }
      setCreateTaskModalOpen(false);
      setNewTaskTitle('');
    } catch (err) {
      console.error('Failed to create intervention:', err);
    } finally {
      setSubmittingTask(false);
    }
  };

  const filteredMentees = useMemo(() => {
    if (!searchQuery.trim()) return mentees;
    const q = searchQuery.toLowerCase();
    return mentees.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q) ||
        s.department.toLowerCase().includes(q)
    );
  }, [searchQuery, mentees]);

  const atRiskCount = useMemo(() => {
    return mentees.filter((s) => s.academicRisk === 'HIGH' || s.academicRisk === 'MEDIUM' || (s.backlogs && s.backlogs > 0)).length;
  }, [mentees]);

  const openInterventionsCount = useMemo(() => {
    return interventions.filter((i) => i.status === 'OPEN').length;
  }, [interventions]);

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
              backgroundColor: isLiveApi ? '#10B981' : '#F59E0B',
              fontWeight: 700,
              fontSize: '0.74rem',
              letterSpacing: '0.04em',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
            <span>{isLiveApi ? 'FASTAPI MENTOR ENDPOINTS ACTIVE' : 'FACULTY MENTOR PORTAL'}</span>
          </span>
          <span>
            Logged in as: <strong>{currentUser?.name || 'Prof. Rajesh Kumar'}</strong> (Faculty Mentor • CSE)
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
                { name: 'Mentoring Cockpit', icon: Home, active: true },
                { name: 'Assigned Mentees', icon: Users, active: false },
                { name: 'Remedial Actions', icon: Target, active: false },
                { name: 'Academic Alerts', icon: ShieldAlert, active: false },
                { name: 'Course Progress', icon: BookOpen, active: false },
                { name: 'Reports & Logs', icon: FileText, active: false },
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
                      backgroundColor: item.active ? '#1E6BFF' : 'transparent',
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
              background: 'linear-gradient(135deg, #ECFDF5 0%, #EFF6FF 100%)',
              border: '1px solid #A7F3D0',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '0.82rem', fontWeight: 800, color: '#059669', lineHeight: 1.2 }}>
              Active Faculty Mentorship
            </div>
            <div style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '4px' }}>
              Dept: Computer Science & Engineering
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
                placeholder="Search assigned CSE mentees, roll no, subjects..."
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
                    backgroundColor: '#10B981',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.84rem',
                    border: '2px solid #A7F3D0',
                  }}
                >
                  PR
                </div>
                <div style={{ textAlign: 'left', lineHeight: 1.2 }}>
                  <div style={{ fontSize: '0.88rem', fontWeight: 700, color: isDarkMode ? '#FFFFFF' : '#0F172A' }}>
                    Prof. Rajesh Kumar
                  </div>
                  <div style={{ fontSize: '0.74rem', color: '#64748B' }}>Faculty Mentor • CSE</div>
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
                backgroundImage: `linear-gradient(to right, rgba(6, 78, 59, 0.92) 0%, rgba(15, 23, 42, 0.75) 60%, rgba(15, 23, 42, 0.90) 100%), url('/assets/images/codebuffet_campus_entrance.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center 40%',
                boxShadow: '0 8px 24px rgba(6, 78, 59, 0.15)',
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
                    color: '#A7F3D0',
                    marginBottom: '4px',
                  }}
                >
                  FACULTY MENTOR COCKPIT • CSE DEPARTMENT
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
                  Welcome back, Prof. Rajesh Kumar!
                </h1>
                <p style={{ color: 'rgba(255, 255, 255, 0.85)', fontSize: '0.92rem', margin: 0, maxWidth: '520px' }}>
                  Proactive student mentorship: Review attendance trends, arrears status, and trigger targeted remedial interventions.
                </p>

                <button
                  onClick={() => setCreateTaskModalOpen(true)}
                  style={{
                    marginTop: '1rem',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '8px 18px',
                    borderRadius: '9999px',
                    backgroundColor: '#10B981',
                    border: 'none',
                    color: '#FFFFFF',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(16, 185, 129, 0.4)',
                  }}
                >
                  <Plus size={16} />
                  <span>Assign Remedial Intervention</span>
                </button>
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
                <div style={{ fontSize: '0.76rem', color: '#A7F3D0', fontWeight: 700, textTransform: 'uppercase' }}>
                  Mentorship Status
                </div>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, margin: '4px 0' }}>
                  {openInterventionsCount} Active Tasks
                </div>
                <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>
                  Assigned across {mentees.length} CSE students
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
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>{mentees.length}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>Assigned CSE Mentees</div>
                    <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>
                      3rd & 4th Year Cohort
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
                    <GraduationCap size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>86.2%</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>CSE Success Score</div>
                    <div style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 700, marginTop: '2px' }}>
                      ▲ +3.4% above campus avg
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
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>{atRiskCount}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>At-Risk Mentees</div>
                    <div style={{ fontSize: '0.72rem', color: '#EF4444', fontWeight: 700, marginTop: '2px' }}>
                      Action required: backlogs/attendance
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
                      backgroundColor: '#FAF5FF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#8B5CF6',
                    }}
                  >
                    <Target size={22} />
                  </div>
                  <div>
                    <div style={{ fontSize: '1.75rem', fontWeight: 800, lineHeight: 1.1 }}>{interventions.length}</div>
                    <div style={{ fontSize: '0.78rem', color: '#64748B', fontWeight: 500 }}>Total Interventions</div>
                    <div style={{ fontSize: '0.72rem', color: '#8B5CF6', fontWeight: 700, marginTop: '2px' }}>
                      {openInterventionsCount} Pending Completion
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ROW 2: ACTIVE MENTORING TASKS & RISK DISTRIBUTION */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '1.25rem', marginBottom: '1.75rem' }}>
              {/* Box 1: Mentoring Action Center (7 cols) */}
              <div
                style={{
                  gridColumn: 'span 7',
                  backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                  border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                  borderRadius: '16px',
                  padding: '1.5rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Active Mentoring Interventions</h3>
                    <span style={{ fontSize: '0.76rem', color: '#64748B' }}>Click checkbox to toggle completion status with live backend API</span>
                  </div>
                  <button
                    onClick={() => setCreateTaskModalOpen(true)}
                    style={{
                      backgroundColor: '#1E6BFF',
                      color: '#FFFFFF',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '6px 12px',
                      fontSize: '0.78rem',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <Plus size={14} />
                    <span>New Task</span>
                  </button>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {interventions.map((task) => {
                    const isDone = task.status === 'COMPLETED';
                    return (
                      <div
                        key={task.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '10px 14px',
                          borderRadius: '10px',
                          backgroundColor: isDone ? (isDarkMode ? '#0F172A' : '#F8FAFC') : (isDarkMode ? '#0F172A' : '#EFF6FF'),
                          border: `1px solid ${isDone ? (isDarkMode ? '#334155' : '#E2E8F0') : '#BFDBFE'}`,
                          transition: 'all 150ms ease',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() => handleToggleIntervention(task.id)}
                            style={{ width: '18px', height: '18px', cursor: 'pointer', accentColor: '#10B981' }}
                          />
                          <div>
                            <div
                              style={{
                                fontSize: '0.86rem',
                                fontWeight: 600,
                                textDecoration: isDone ? 'line-through' : 'none',
                                color: isDone ? '#94A3B8' : (isDarkMode ? '#FFFFFF' : '#0F172A'),
                              }}
                            >
                              {task.title}
                            </div>
                            <div style={{ fontSize: '0.74rem', color: '#64748B', display: 'flex', gap: '8px', marginTop: '2px' }}>
                              <span>👤 {task.student_name} ({task.student_roll_no})</span>
                              <span>•</span>
                              <span>📅 Due: {task.due_date}</span>
                            </div>
                          </div>
                        </div>

                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.70rem',
                            fontWeight: 700,
                            backgroundColor:
                              task.category === 'ATTENDANCE' ? '#FEF2F2' :
                              task.category === 'ACADEMIC' ? '#FFFBEB' : '#EFF6FF',
                            color:
                              task.category === 'ATTENDANCE' ? '#DC2626' :
                              task.category === 'ACADEMIC' ? '#D97706' : '#1E6BFF',
                          }}
                        >
                          {task.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Box 2: Mentee Risk Segmentation Donut (5 cols) */}
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
                  <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0 }}>Mentee Risk Segmentation</h3>
                  <span style={{ fontSize: '0.76rem', color: '#64748B' }}>CSE Student Cohort breakdown</span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', margin: '1rem 0' }}>
                  <div style={{ width: '140px', height: '140px', position: 'relative' }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={MENTOR_DISTRIBUTION}
                          innerRadius={44}
                          outerRadius={64}
                          paddingAngle={3}
                          dataKey="value"
                        >
                          {MENTOR_DISTRIBUTION.map((entry, index) => (
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
                      <div style={{ fontSize: '1rem', fontWeight: 800 }}>{mentees.length}</div>
                      <div style={{ fontSize: '0.65rem', color: '#64748B' }}>Mentees</div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.80rem' }}>
                    {MENTOR_DISTRIBUTION.map((item) => (
                      <div key={item.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: item.color }} />
                        <span style={{ color: '#64748B' }}>{item.name}</span>
                        <strong style={{ marginLeft: 'auto', paddingLeft: '8px' }}>{item.value}%</strong>
                      </div>
                    ))}
                  </div>
                </div>

                <div style={{ backgroundColor: '#F8FAFC', padding: '10px', borderRadius: '8px', fontSize: '0.76rem', color: '#475569' }}>
                  💡 <strong>Mentor Recommendation:</strong> 1 student has &gt;1 active backlogs. Schedule 1-on-1 academic counseling.
                </div>
              </div>
            </div>

            {/* ROW 3: ASSIGNED MENTEES ROSTER TABLE */}
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
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>Assigned CSE Mentees Roster</h3>
                  <span style={{ fontSize: '0.78rem', color: '#64748B' }}>Individual telemetry, academic risk score, and LMS assignment velocity</span>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748B' }}>
                  Showing {filteredMentees.length} mentees
                </div>
              </div>

              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
                  <thead>
                    <tr style={{ borderBottom: `2px solid ${isDarkMode ? '#334155' : '#F1F5F9'}`, textAlign: 'left', color: '#64748B' }}>
                      <th style={{ padding: '10px 8px' }}>Mentee</th>
                      <th style={{ padding: '10px 8px' }}>Year / Sem</th>
                      <th style={{ padding: '10px 8px' }}>CGPA</th>
                      <th style={{ padding: '10px 8px' }}>Attendance</th>
                      <th style={{ padding: '10px 8px' }}>Backlogs</th>
                      <th style={{ padding: '10px 8px' }}>Success Score</th>
                      <th style={{ padding: '10px 8px' }}>Academic Risk</th>
                      <th style={{ padding: '10px 8px', textAlign: 'right' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredMentees.map((s) => (
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
                        <td style={{ padding: '12px 8px' }}>{s.year || '3rd Year'}</td>
                        <td style={{ padding: '12px 8px', fontWeight: 700 }}>{s.cgpa}</td>
                        <td style={{ padding: '12px 8px', color: s.attendance < 75 ? '#EF4444' : '#10B981', fontWeight: 600 }}>
                          {s.attendance}%
                        </td>
                        <td style={{ padding: '12px 8px', color: s.backlogs > 0 ? '#EF4444' : '#10B981', fontWeight: 700 }}>
                          {s.backlogs ?? 0}
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
                        <td style={{ padding: '12px 8px', textAlign: 'right' }}>
                          <button
                            onClick={() => setSelectedStudent(s)}
                            style={{
                              padding: '5px 10px',
                              borderRadius: '6px',
                              backgroundColor: '#1E6BFF',
                              color: '#FFFFFF',
                              border: 'none',
                              fontSize: '0.76rem',
                              fontWeight: 600,
                              cursor: 'pointer',
                            }}
                          >
                            Inspect Mentee
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Selected Mentee Diagnostic Card */}
              {selectedStudent && (
                <div
                  style={{
                    marginTop: '1.25rem',
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
                        Mentee Diagnostic & Action Profile: {selectedStudent.name} ({selectedStudent.id})
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
                    <div>LMS Assignment Completion: <strong>{selectedStudent.lmsCompletion || 88}%</strong></div>
                    <div>Coding Assessment: <strong>{selectedStudent.codingSkills || 8.2}/10</strong></div>
                    <div>DSA Benchmark: <strong>{selectedStudent.dsaScore || 8.5}/10</strong></div>
                    <div>Active Backlogs: <strong style={{ color: selectedStudent.backlogs > 0 ? '#DC2626' : '#059669' }}>{selectedStudent.backlogs || 0}</strong></div>
                  </div>
                </div>
              )}
            </div>
          </main>
        </div>
      </div>

      {/* CREATE REMEDIAL TASK MODAL */}
      {createTaskModalOpen && (
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
              maxWidth: '520px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 25px 50px rgba(0,0,0,0.25)',
              border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: '#ECFDF5', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#10B981' }}>
                  <Target size={20} />
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700 }}>Assign Remedial Intervention</h3>
                  <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Directly synced to student cockpit</span>
                </div>
              </div>
              <button
                onClick={() => setCreateTaskModalOpen(false)}
                style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '1.1rem' }}
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateTask} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  Select Mentee
                </label>
                <select
                  value={newTaskRoll}
                  onChange={(e) => {
                    setNewTaskRoll(e.target.value);
                    const match = mentees.find((m) => m.id === e.target.value);
                    if (match) setNewTaskName(match.name);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.86rem',
                  }}
                >
                  {mentees.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} ({m.id}) — {m.academicRisk} Risk
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                  Action / Remedial Title
                </label>
                <input
                  type="text"
                  placeholder="e.g. Mandatory remedial counseling for Arrears in CS301"
                  value={newTaskTitle}
                  onChange={(e) => setNewTaskTitle(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.86rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    Category
                  </label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.86rem',
                    }}
                  >
                    <option value="ATTENDANCE">Attendance Warning</option>
                    <option value="ACADEMIC">Academic Remedial</option>
                    <option value="SKILL_GAP">Skill Gap / DSA</option>
                    <option value="PLACEMENT">Placement Prep</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, marginBottom: '4px' }}>
                    Target Due Date
                  </label>
                  <input
                    type="text"
                    value={newTaskDueDate}
                    onChange={(e) => setNewTaskDueDate(e.target.value)}
                    placeholder="e.g. Nov 15, 2026"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #CBD5E1',
                      fontSize: '0.86rem',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={submittingTask}
                style={{
                  marginTop: '0.5rem',
                  backgroundColor: '#10B981',
                  color: '#FFFFFF',
                  padding: '10px',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '0.90rem',
                  border: 'none',
                  cursor: submittingTask ? 'not-allowed' : 'pointer',
                }}
              >
                {submittingTask ? 'Assigning Task...' : 'Confirm & Dispatch to Student Cockpit'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

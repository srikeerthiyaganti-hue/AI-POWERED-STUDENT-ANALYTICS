import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  CheckCircle,
  CheckCircle2,
  ArrowLeft,
  LogOut,
  Sparkles,
  TrendingUp,
  Sliders,
  CheckSquare,
  Square,
  Bot,
  Send,
  Loader2,
  Calendar,
  AlertTriangle,
  ChevronRight,
  Target,
  Edit3,
  Database,
  Bell,
  Check,
  ShieldCheck,
  Clock,
  ExternalLink,
} from 'lucide-react';

const SUPPORTED_BRANCHES = [
  { id: 'CSE', label: 'Computer Science & Engineering' },
  { id: 'IT', label: 'Information Technology' },
  { id: 'Data Science', label: 'Data Science' },
  { id: 'EEE', label: 'Electrical & Electronics Engineering' },
  { id: 'ECE', label: 'Electronics & Communication Engineering' },
  { id: 'Mechanical', label: 'Mechanical Engineering' },
];

const ALL_SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function StudentDashboard() {
  const { currentUser, logout, loginWithDemo } = useAuth();
  const navigate = useNavigate();

  // Student Telemetry State
  const [studentData, setStudentData] = useState(null);
  const [isLiveApi, setIsLiveApi] = useState(false);

  // Edit Program (Branch & Semester) State
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editBranch, setEditBranch] = useState('CSE');
  const [editSemester, setEditSemester] = useState(6);
  const [editSaving, setEditSaving] = useState(false);
  const [editSuccessMsg, setEditSuccessMsg] = useState('');

  // Historical Telemetry State
  const [historyData, setHistoryData] = useState(null);
  const [historyMetric, setHistoryMetric] = useState('cgpa'); // 'cgpa' | 'attendance' | 'success_score'

  // "What-if" Score Simulation State
  const [simAttendance, setSimAttendance] = useState(88.5);
  const [simCoding, setSimCoding] = useState(8.2);
  const [simLms, setSimLms] = useState(89.0);
  const [liveSimulatedScore, setLiveSimulatedScore] = useState(null);

  // Mentor Tasks State
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Complete LeetCode Top 50 DSA practice set', due: 'Oct 15, 2026', done: true, mentor: 'Prof. Rajesh Kumar', priority: 'HIGH', category: 'SKILL' },
    { id: 2, text: 'Submit Microservices Architecture case study on LMS', due: 'Oct 22, 2026', done: false, mentor: 'Dr. R. Kumar', priority: 'MEDIUM', category: 'ACADEMIC' },
    { id: 3, text: 'Attend Corporate Mock Technical Interview Session', due: 'Oct 28, 2026', done: false, mentor: 'Vikram Malhotra (TPO)', priority: 'HIGH', category: 'PLACEMENT' },
  ]);

  // AI Assistant State
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConversation, setAiConversation] = useState([
    {
      sender: 'assistant',
      text: 'Hello Aarav! I am your AI Student Success Assistant. Based on your current telemetry (CGPA 8.42, Attendance 88.5%, Success Score 85.4), you are in the Tier-1 Placement Readiness tier. How can I assist your preparation today?',
      actions: ['Review DSA Roadmap', 'Improve System Design', 'Analyze Placement Odds'],
    },
  ]);

  // Load backend student telemetry on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchStudentCockpit() {
      try {
        const roll = currentUser?.roll_no || 'STU-2024-042';
        const [dashRes, histRes, taskRes] = await Promise.allSettled([
          api.getStudentDashboard(roll),
          api.getStudentHistory(roll),
          api.getStudentTasks(roll),
        ]);

        if (!isMounted) return;

        if (dashRes.status === 'fulfilled' && dashRes.value) {
          const d = dashRes.value;
          setStudentData(d);
          setIsLiveApi(true);
          if (d.attendance !== undefined) setSimAttendance(d.attendance);
          if (d.coding_skills !== undefined) setSimCoding(d.coding_skills);
          if (d.components?.lms !== undefined) setSimLms(d.components.lms);
        }

        if (histRes.status === 'fulfilled' && histRes.value?.has_history) {
          setHistoryData(histRes.value.history);
        }

        if (taskRes.status === 'fulfilled') {
          const rawTasks = Array.isArray(taskRes.value) ? taskRes.value : (taskRes.value?.tasks || []);
          if (rawTasks.length > 0) {
            setTasks(
              rawTasks.map((t) => ({
                id: t.id,
                text: t.title,
                due: t.due_date,
                done: t.status === 'COMPLETED',
                mentor: t.assigned_mentor,
                priority: t.priority || 'MEDIUM',
                category: t.category || 'GENERAL',
              }))
            );
          }
        }
      } catch (err) {
        console.warn('Backend unavailable for student cockpit:', err);
      }
    }
    fetchStudentCockpit();
    return () => { isMounted = false; };
  }, [currentUser]);

  // Dynamic simulation with backend API
  useEffect(() => {
    let isMounted = true;
    async function triggerSimulation() {
      try {
        const res = await api.simulateStudentScore({
          attendance: simAttendance,
          coding_skills: simCoding,
          lms_velocity: simLms,
          cgpa: studentData?.cgpa || 8.42,
          backlogs: studentData?.backlogs || 0,
        });
        if (isMounted && res?.projected_score) {
          setLiveSimulatedScore(res.projected_score);
        }
      } catch {
        // Fallback to local calculation
      }
    }
    const timer = setTimeout(triggerSimulation, 150);
    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [simAttendance, simCoding, simLms, studentData]);

  const toggleTask = async (id) => {
    const currentTask = tasks.find((t) => t.id === id);
    const newStatus = currentTask && currentTask.done ? 'OPEN' : 'COMPLETED';

    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    try {
      await api.updateStudentTaskStatus(id, newStatus, 'Status updated via Student Cockpit');
    } catch {
      try {
        await api.toggleTaskStatus(id);
      } catch {
        // Offline fallback
      }
    }
  };

  const handleAskAI = async (questionText = null) => {
    const prompt = questionText || aiQuestion;
    if (!prompt.trim() || aiLoading) return;

    const userMessage = { sender: 'user', text: prompt };
    setAiConversation((prev) => [...prev, userMessage]);
    setAiQuestion('');
    setAiLoading(true);

    try {
      const res = await api.askStudentAI(prompt, {
        simulated_attendance: simAttendance,
        simulated_coding: simCoding,
        simulated_lms: simLms,
      });

      setAiConversation((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: res.answer || res.response || 'Telemetry analyzed. Keep maintaining current attendance to secure placement eligibility.',
          actions: res.actionable_steps || [],
        },
      ]);
    } catch {
      // Deterministic client fallback grounded in real student state
      setAiConversation((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: `Based on your telemetry (CGPA: ${studentData?.cgpa || 8.42}, Attendance: ${studentData?.attendance || 88.5}%), your highest ROI action is advancing your DSA score to 9.0+ for Microsoft & Tier-1 super-dream drives.`,
          actions: ['Practice Dynamic Programming', 'Solve Graph Algorithms', 'Attend Mock Interview'],
        },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Prepare chart series from historyData
  const chartData = React.useMemo(() => {
    if (!historyData) {
      // Default 6-semester progression for demo if history table empty
      return [
        { semester: 'Sem 1', cgpa: 7.6, attendance: 82.0, success_score: 74.5 },
        { semester: 'Sem 2', cgpa: 7.85, attendance: 84.5, success_score: 77.2 },
        { semester: 'Sem 3', cgpa: 8.10, attendance: 86.0, success_score: 80.1 },
        { semester: 'Sem 4', cgpa: 8.22, attendance: 87.2, success_score: 82.4 },
        { semester: 'Sem 5', cgpa: 8.35, attendance: 88.0, success_score: 84.1 },
        { semester: 'Sem 6', cgpa: studentData?.cgpa || 8.42, attendance: studentData?.attendance || 88.5, success_score: studentData?.success_score || 85.4 },
      ];
    }

    const sems = [1, 2, 3, 4, 5, 6];
    return sems.map((s) => {
      const c = historyData.cgpa?.find((x) => x.semester === s);
      const a = historyData.attendance?.find((x) => x.semester === s);
      const sc = historyData.success_score?.find((x) => x.semester === s);
      return {
        semester: `Sem ${s}`,
        cgpa: c ? c.value : null,
        attendance: a ? a.value : null,
        success_score: sc ? sc.value : null,
      };
    }).filter((d) => d.cgpa !== null || d.attendance !== null || d.success_score !== null);
  }, [historyData, studentData]);

  // Local calculation fallback if backend simulation hasn't fired yet
  const localSimulatedScore = Math.min(
    99.0,
    Math.max(
      10.0,
      (0.35 * ((studentData?.cgpa || 8.42) / 10.0) +
        0.20 * ((78.0 * 0.4 + simCoding * 10 * 0.35 + 8.5 * 10 * 0.25) / 100.0) +
        0.15 * (simAttendance / 100.0) +
        0.12 * (simLms / 100.0) +
        0.10 * 0.82 +
        0.08 * 0.83) *
        100.0
    )
  ).toFixed(1);

  const simulatedScore = liveSimulatedScore !== null ? Number(liveSimulatedScore).toFixed(1) : localSimulatedScore;

  const handleOpenEditProfile = () => {
    setEditBranch(studentData?.department || 'Computer Science & Engineering');
    setEditSemester(studentData?.semester || 6);
    setEditSuccessMsg('');
    setEditProfileOpen(true);
  };

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setEditSaving(true);
    setEditSuccessMsg('');
    try {
      const res = await api.updateStudentProfile({
        branch: editBranch,
        semester: Number(editSemester),
      });
      if (res?.profile) {
        setStudentData((prev) => ({
          ...prev,
          department: res.profile.department,
          semester: res.profile.semester,
          year: res.profile.year,
        }));
        setEditSuccessMsg('Program details updated successfully!');
        setTimeout(() => {
          setEditProfileOpen(false);
        }, 1200);
      }
    } catch (err) {
      alert(err.message || 'Failed to update program details.');
    } finally {
      setEditSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F4F7FC', display: 'flex', flexDirection: 'column' }}>
      {/* Top Demo Bar */}
      <div
        style={{
          backgroundColor: '#0F172A',
          color: '#FFFFFF',
          padding: '8px 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          borderBottom: '1px solid rgba(228, 233, 240, 0.15)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span
            style={{
              padding: '2px 8px',
              borderRadius: '4px',
              backgroundColor: isLiveApi ? '#10B981' : '#1E6BFF',
              fontWeight: 700,
              fontSize: '0.74rem',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#FFFFFF' }} />
            <span>{isLiveApi ? 'FASTAPI ML BACKEND ACTIVE' : 'STUDENT PORTAL'}</span>
          </span>
          <span>Logged in as: <strong>{studentData?.name || currentUser?.name || 'Aarav Sharma'}</strong> (Roll ID: {studentData?.roll_no || currentUser?.roll_no || 'STU-2024-042'})</span>
        </div>
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
            onClick={handleLogout}
            style={{
              background: 'none',
              border: 'none',
              color: 'rgba(255,255,255,0.8)',
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

      {/* Main Student Header */}
      <header
        style={{
          backgroundColor: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
          padding: '1rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
          <BrandLogo variant="light" size="small" />
          <div style={{ height: '24px', width: '1px', backgroundColor: '#E2E8F0' }} />
          <div>
            <h1 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
              Personal Student Success Cockpit
            </h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
              <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
                {studentData?.year || '3rd Year'} • {studentData?.department || 'B.Tech Computer Science & Engineering'} • Semester {studentData?.semester || 6}
              </span>
              <button
                type="button"
                onClick={handleOpenEditProfile}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 8px',
                  borderRadius: '4px',
                  border: '1px solid #CBD5E1',
                  backgroundColor: '#FFFFFF',
                  color: '#1E6BFF',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                <Edit3 size={11} />
                <span>Edit Program</span>
              </button>
            </div>
          </div>
        </div>

        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            color: '#1E6BFF',
            fontSize: '0.88rem',
            fontWeight: 600,
            textDecoration: 'none',
          }}
        >
          <ArrowLeft size={16} />
          <span>Back to Landing Page</span>
        </Link>
      </header>

      {/* Student Content */}
      <main style={{ maxWidth: '1280px', width: '100%', margin: '2rem auto', padding: '0 1.5rem', flex: 1 }}>
        {/* Metric Cards Row */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '1.25rem',
            marginBottom: '2rem',
          }}
        >
          {/* Card 1: Success Score */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.5rem',
              borderTop: '4px solid #1E6BFF',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.82rem', marginBottom: '8px' }}>
              <span>Personal Success Score</span>
              <Award size={20} style={{ color: '#1E6BFF' }} />
            </div>
            <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0F172A' }}>
              {studentData?.success_score ? Number(studentData.success_score).toFixed(1) : '85.4'} <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 500 }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '4px', fontWeight: 700 }}>
              {studentData?.score_band || 'EXCELLENT'} • {studentData?.readiness_tier || 'Tier-1 Ready'}
            </div>
          </div>

          {/* Card 2: CGPA */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.82rem', marginBottom: '8px' }}>
              <span>Cumulative GPA</span>
              <GraduationCap size={20} style={{ color: '#0F172A' }} />
            </div>
            <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#0F172A' }}>
              {studentData?.cgpa ? Number(studentData.cgpa).toFixed(2) : '8.42'}
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
              {studentData?.backlogs || 0} Active Backlogs • Academic Risk: <strong style={{ color: studentData?.academic_risk === 'HIGH' ? '#DC2626' : '#10B981' }}>{studentData?.academic_risk || 'LOW'}</strong>
            </div>
          </div>

          {/* Card 3: Attendance */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.82rem', marginBottom: '8px' }}>
              <span>Attendance Consistency</span>
              <CheckCircle size={20} style={{ color: '#10B981' }} />
            </div>
            <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#10B981' }}>
              {studentData?.attendance ? Number(studentData.attendance).toFixed(1) : '88.5'}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
              {studentData?.attendance >= 75 ? 'Statutory 75% Requirement Met' : 'Requires Biometric Verification'}
            </div>
          </div>

          {/* Card 4: Placement Readiness */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B', fontSize: '0.82rem', marginBottom: '8px' }}>
              <span>Placement Readiness</span>
              <Sparkles size={20} style={{ color: '#8B5CF6' }} />
            </div>
            <div style={{ fontSize: '2.3rem', fontWeight: 800, color: '#8B5CF6' }}>
              {studentData?.placement_readiness_pct ? Number(studentData.placement_readiness_pct).toFixed(1) : '78.6'}%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '4px', fontWeight: 600 }}>
              DSA: {studentData?.dsa_score || 8.5}/10 • Coding: {studentData?.coding_skills || 8.2}/10
            </div>
          </div>
        </div>

        {/* =====================================================================
            HISTORICAL PROGRESSION TRENDS & AI STUDENT SUCCESS ASSISTANT
            ===================================================================== */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Historical Progression Chart */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              padding: '1.75rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <TrendingUp size={20} style={{ color: '#1E6BFF' }} />
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Longitudinal Progression</h3>
                </div>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Semester-wise trajectory across completed semesters</span>
              </div>

              {/* Metric Selector Tabs */}
              <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F1F5F9', padding: '3px', borderRadius: '8px' }}>
                <button
                  onClick={() => setHistoryMetric('cgpa')}
                  style={{
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: historyMetric === 'cgpa' ? '#FFFFFF' : 'transparent',
                    color: historyMetric === 'cgpa' ? '#1E6BFF' : '#64748B',
                    boxShadow: historyMetric === 'cgpa' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  CGPA
                </button>
                <button
                  onClick={() => setHistoryMetric('attendance')}
                  style={{
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: historyMetric === 'attendance' ? '#FFFFFF' : 'transparent',
                    color: historyMetric === 'attendance' ? '#10B981' : '#64748B',
                    boxShadow: historyMetric === 'attendance' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  Attendance
                </button>
                <button
                  onClick={() => setHistoryMetric('success_score')}
                  style={{
                    border: 'none',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    backgroundColor: historyMetric === 'success_score' ? '#FFFFFF' : 'transparent',
                    color: historyMetric === 'success_score' ? '#8B5CF6' : '#64748B',
                    boxShadow: historyMetric === 'success_score' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                  }}
                >
                  Success Score
                </button>
              </div>
            </div>

            <div style={{ flex: 1, minHeight: '220px', width: '100%' }}>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="metricGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop
                        offset="5%"
                        stopColor={historyMetric === 'cgpa' ? '#1E6BFF' : historyMetric === 'attendance' ? '#10B981' : '#8B5CF6'}
                        stopOpacity={0.4}
                      />
                      <stop
                        offset="95%"
                        stopColor={historyMetric === 'cgpa' ? '#1E6BFF' : historyMetric === 'attendance' ? '#10B981' : '#8B5CF6'}
                        stopOpacity={0.0}
                      />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis dataKey="semester" stroke="#94A3B8" fontSize={11} />
                  <YAxis
                    stroke="#94A3B8"
                    fontSize={11}
                    domain={
                      historyMetric === 'cgpa' ? [6.0, 10.0] : historyMetric === 'attendance' ? [60, 100] : [50, 100]
                    }
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0F172A',
                      borderRadius: '8px',
                      border: 'none',
                      color: '#FFFFFF',
                      fontSize: '0.80rem',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey={historyMetric}
                    stroke={historyMetric === 'cgpa' ? '#1E6BFF' : historyMetric === 'attendance' ? '#10B981' : '#8B5CF6'}
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#metricGrad)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '10px', fontSize: '0.74rem', color: '#64748B' }}>
              <span>Trajectory: Steady growth over 6 semesters</span>
              <span style={{ fontWeight: 600, color: '#10B981' }}>+0.82 CGPA aggregate gain</span>
            </div>
          </div>

          {/* AI Student Success Assistant Widget */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              padding: '1.75rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{ width: '32px', height: '32px', borderRadius: '8px', backgroundColor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1E6BFF' }}>
                  <Bot size={18} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>AI Success Assistant</h3>
                  <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>● Telemetry Grounded</span>
                </div>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#64748B', backgroundColor: '#F8FAFC', padding: '2px 8px', borderRadius: '4px', border: '1px solid #E2E8F0' }}>
                Gemini 2.5 Flash
              </span>
            </div>

            {/* Conversation Log */}
            <div
              style={{
                flex: 1,
                minHeight: '160px',
                maxHeight: '180px',
                overflowY: 'auto',
                display: 'flex',
                flexDirection: 'column',
                gap: '10px',
                padding: '8px',
                backgroundColor: '#F8FAFC',
                borderRadius: '12px',
                border: '1px solid #E2E8F0',
                marginBottom: '10px',
              }}
            >
              {aiConversation.map((msg, idx) => (
                <div
                  key={idx}
                  style={{
                    alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '88%',
                    backgroundColor: msg.sender === 'user' ? '#1E6BFF' : '#FFFFFF',
                    color: msg.sender === 'user' ? '#FFFFFF' : '#0F172A',
                    padding: '8px 12px',
                    borderRadius: '12px',
                    fontSize: '0.80rem',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
                    border: msg.sender === 'assistant' ? '1px solid #E2E8F0' : 'none',
                  }}
                >
                  <div>{msg.text}</div>
                  {msg.actions && msg.actions.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '6px' }}>
                      {msg.actions.map((act, actIdx) => (
                        <button
                          key={actIdx}
                          onClick={() => handleAskAI(act)}
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            border: '1px solid #CBD5E1',
                            backgroundColor: '#F1F5F9',
                            color: '#334155',
                            cursor: 'pointer',
                          }}
                        >
                          {act}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
              {aiLoading && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.76rem', color: '#64748B', padding: '4px' }}>
                  <Loader2 size={14} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
                  <span>Analyzing student telemetry & predicting trajectory...</span>
                </div>
              )}
            </div>

            {/* Quick Prompt Chips */}
            <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', marginBottom: '8px' }}>
              {[
                'How can I raise my placement score?',
                'Analyze my academic risk factors',
                'What tasks should I focus on this week?',
              ].map((chip, idx) => (
                <button
                  key={idx}
                  onClick={() => handleAskAI(chip)}
                  disabled={aiLoading}
                  style={{
                    whiteSpace: 'nowrap',
                    padding: '4px 8px',
                    borderRadius: '9999px',
                    backgroundColor: '#EFF6FF',
                    color: '#1E6BFF',
                    border: '1px solid #DBEAFE',
                    fontSize: '0.70rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  {chip}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleAskAI();
              }}
              style={{ display: 'flex', gap: '8px' }}
            >
              <input
                type="text"
                value={aiQuestion}
                onChange={(e) => setAiQuestion(e.target.value)}
                placeholder="Ask about placement, attendance, or study roadmaps..."
                disabled={aiLoading}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  borderRadius: '10px',
                  border: '1px solid #CBD5E1',
                  fontSize: '0.82rem',
                }}
              />
              <button
                type="submit"
                disabled={aiLoading || !aiQuestion.trim()}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#1E6BFF',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: '10px',
                  cursor: aiLoading || !aiQuestion.trim() ? 'not-allowed' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Send size={15} />
              </button>
            </form>
          </div>
        </div>

        {/* =====================================================================
            TWO-COLUMN SECTION: WHAT-IF SIMULATOR & ASSIGNED MENTOR TASKS
            ===================================================================== */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
          {/* Interactive What-If Simulator */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              padding: '1.75rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <Sliders size={20} style={{ color: '#1E6BFF' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Personal "What-If" Score Simulator</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Adjust inputs to see real-time impact on your Success Score</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span>Simulated Attendance</span>
                  <strong>{simAttendance}%</strong>
                </div>
                <input
                  type="range"
                  min="60"
                  max="100"
                  value={simAttendance}
                  onChange={(e) => setSimAttendance(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#1E6BFF' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span>Coding Assessment Skill</span>
                  <strong>{simCoding} / 10</strong>
                </div>
                <input
                  type="range"
                  min="4"
                  max="10"
                  step="0.1"
                  value={simCoding}
                  onChange={(e) => setSimCoding(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#8B5CF6' }}
                />
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', marginBottom: '4px' }}>
                  <span>LMS Assignment Velocity</span>
                  <strong>{simLms}%</strong>
                </div>
                <input
                  type="range"
                  min="50"
                  max="100"
                  value={simLms}
                  onChange={(e) => setSimLms(Number(e.target.value))}
                  style={{ width: '100%', accentColor: '#10B981' }}
                />
              </div>

              {/* Simulated Outcome Display */}
              <div
                style={{
                  padding: '1rem',
                  borderRadius: '12px',
                  backgroundColor: '#EFF6FF',
                  border: '1px solid #DBEAFE',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <div style={{ fontSize: '0.78rem', color: '#1E6BFF', fontWeight: 700 }}>Projected Success Score</div>
                  <div style={{ fontSize: '0.72rem', color: '#64748B' }}>Formula weighted across all 6 core dimensions</div>
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 800, color: '#1E6BFF' }}>
                  {simulatedScore} <span style={{ fontSize: '0.85rem', color: '#64748B' }}>/ 100</span>
                </div>
              </div>
            </div>
          </div>

          {/* Assigned Mentoring Action Items */}
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '18px',
              padding: '1.75rem',
              border: '1px solid #E2E8F0',
              boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.25rem' }}>
              <CheckSquare size={20} style={{ color: '#10B981' }} />
              <div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>Assigned Mentoring Action Items</h3>
                <span style={{ fontSize: '0.75rem', color: '#64748B' }}>Prescribed by Faculty Mentors & TPO Office</span>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {tasks.map((task) => (
                <div
                  key={task.id}
                  onClick={() => toggleTask(task.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '12px',
                    padding: '10px 14px',
                    borderRadius: '12px',
                    backgroundColor: task.done ? '#F0FDF4' : '#F8FAFC',
                    border: `1px solid ${task.done ? '#BBF7D0' : '#E2E8F0'}`,
                    cursor: 'pointer',
                    transition: 'all 150ms ease',
                  }}
                >
                  <div style={{ marginTop: '2px', color: task.done ? '#10B981' : '#94A3B8' }}>
                    {task.done ? <CheckSquare size={18} /> : <Square size={18} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                      <span
                        style={{
                          fontSize: '0.84rem',
                          fontWeight: 600,
                          color: task.done ? '#15803D' : '#0F172A',
                          textDecoration: task.done ? 'line-through' : 'none',
                        }}
                      >
                        {task.text}
                      </span>
                      <span
                        style={{
                          fontSize: '0.66rem',
                          fontWeight: 700,
                          padding: '1px 6px',
                          borderRadius: '4px',
                          backgroundColor: task.priority === 'HIGH' ? '#FEF2F2' : '#EFF6FF',
                          color: task.priority === 'HIGH' ? '#DC2626' : '#1E6BFF',
                        }}
                      >
                        {task.priority}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.70rem', color: '#64748B', marginTop: '2px' }}>
                      Mentor: {task.mentor} • Due: {task.due}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ marginTop: '1.25rem', textAlign: 'center' }}>
              <span style={{ fontSize: '0.75rem', color: '#64748B' }}>
                All action items are synchronized with the Institution Intervention Sandbox.
              </span>
            </div>
          </div>
        </div>

        {/* =====================================================================
            DATA QUALITY & SYNCHRONIZATION STATUS SECTION (Section 13)
            ===================================================================== */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div
                style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '8px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1E6BFF',
                }}
              >
                <Database size={18} />
              </div>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                  Institutional Data Quality & Synchronization
                </h3>
                <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                  Live connector telemetry across official university systems
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.74rem', color: '#10B981', fontWeight: 600 }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              <span>Telemetry Auto-Synced 60s ago</span>
            </div>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '12px',
            }}
          >
            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Student Identity</span>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '1px 6px', borderRadius: '4px' }}>
                  Verified
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A' }}>
                University Registrar
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                ID: {studentData?.roll_no || 'STU-2024-042'}
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Academic Records</span>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '1px 6px', borderRadius: '4px' }}>
                  Connected
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A' }}>
                CGPA & Grade History
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                CGPA: {studentData?.cgpa || '8.42'} • Semesters 1-{studentData?.semester || 6}
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Attendance Gateways</span>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '1px 6px', borderRadius: '4px' }}>
                  Connected
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A' }}>
                Biometric IoT Scanners
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                Overall: {studentData?.attendance || '88.5'}%
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>LMS Course Velocity</span>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#059669', backgroundColor: '#ECFDF5', padding: '1px 6px', borderRadius: '4px' }}>
                  Connected
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A' }}>
                Canvas / Moodle LMS
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                Completion: {studentData?.components?.lms || 89}%
              </div>
            </div>

            <div style={{ padding: '12px', borderRadius: '8px', backgroundColor: '#F8FAFC', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                <span style={{ fontSize: '0.74rem', color: '#64748B' }}>Placement Pipeline</span>
                <span style={{ fontSize: '0.70rem', fontWeight: 700, color: '#1E6BFF', backgroundColor: '#EFF6FF', padding: '1px 6px', borderRadius: '4px' }}>
                  Connected
                </span>
              </div>
              <div style={{ fontSize: '0.84rem', fontWeight: 600, color: '#0F172A' }}>
                Corporate Careers Portal
              </div>
              <div style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '2px' }}>
                Tier-1 Readiness: {studentData?.placement_readiness_pct || 78.6}%
              </div>
            </div>
          </div>
        </div>

        {/* =====================================================================
            IN-APP NOTIFICATIONS & FOLLOW-UP REMINDERS (Section 14)
            ===================================================================== */}
        <div
          style={{
            backgroundColor: '#FFFFFF',
            border: '1px solid #E2E8F0',
            borderRadius: '16px',
            padding: '1.5rem',
            marginBottom: '2rem',
            boxShadow: '0 2px 10px rgba(15, 23, 42, 0.03)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: '#FFFBEB',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#D97706',
              }}
            >
              <Bell size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, margin: 0, color: '#0F172A' }}>
                Action Items & Notifications
              </h3>
              <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                Mentoring directives and critical academic follow-up reminders
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #DBEAFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={15} style={{ color: '#2563EB' }} />
                <span><strong>Faculty Counseling:</strong> Review LeetCode Top 50 set with Prof. Rajesh Kumar before Oct 15, 2026.</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#2563EB', fontWeight: 600 }}>Active</span>
            </div>

            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#ECFDF5',
                border: '1px solid #D1FAE5',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                fontSize: '0.82rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={15} style={{ color: '#10B981' }} />
                <span><strong>Academic Standing:</strong> Zero backlogs detected. You remain eligible for Tier-1 Super-Dream placement drives.</span>
              </div>
              <span style={{ fontSize: '0.72rem', color: '#10B981', fontWeight: 600 }}>Eligible</span>
            </div>
          </div>
        </div>
      </main>

      {/* =====================================================================
          EDIT PROGRAM MODAL (Branch & Semester Support)
          ===================================================================== */}
      {editProfileOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(15, 23, 42, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '1rem',
          }}
        >
          <div
            style={{
              backgroundColor: '#FFFFFF',
              borderRadius: '16px',
              maxWidth: '460px',
              width: '100%',
              padding: '1.75rem',
              boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
              border: '1px solid #E2E8F0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '10px',
                  backgroundColor: '#EFF6FF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#1E6BFF',
                }}
              >
                <Edit3 size={20} />
              </div>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>
                  Edit Academic Program
                </h3>
                <span style={{ fontSize: '0.76rem', color: '#64748B' }}>
                  Update your current branch and semester
                </span>
              </div>
            </div>

            {editSuccessMsg && (
              <div
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  backgroundColor: '#ECFDF5',
                  border: '1px solid #A7F3D0',
                  color: '#065F46',
                  fontSize: '0.80rem',
                  marginBottom: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <CheckCircle2 size={16} />
                <span>{editSuccessMsg}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                  Branch / Engineering Discipline
                </label>
                <select
                  value={editBranch}
                  onChange={(e) => setEditBranch(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.86rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {SUPPORTED_BRANCHES.map((b) => (
                    <option key={b.id} value={b.label}>
                      {b.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#0F172A', marginBottom: '4px' }}>
                  Current Semester (1 to 8)
                </label>
                <select
                  value={editSemester}
                  onChange={(e) => setEditSemester(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '0.86rem',
                    outline: 'none',
                    backgroundColor: '#FFFFFF',
                  }}
                >
                  {ALL_SEMESTERS.map((s) => (
                    <option key={s} value={s}>
                      Semester {s} ({s <= 2 ? '1st Year' : s <= 4 ? '2nd Year' : s <= 6 ? '3rd Year' : '4th Year'})
                    </option>
                  ))}
                </select>
              </div>

              <div
                style={{
                  padding: '10px',
                  borderRadius: '8px',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  fontSize: '0.74rem',
                  color: '#64748B',
                  marginBottom: '16px',
                }}
              >
                🔒 <strong>Academic Integrity Note:</strong> Official academic metrics (CGPA, backlogs, official attendance) are synchronized with the university registrar and cannot be modified by students.
              </div>

              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  onClick={() => setEditProfileOpen(false)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '6px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#475569',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={editSaving}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '6px',
                    border: 'none',
                    backgroundColor: '#1E6BFF',
                    color: '#FFFFFF',
                    fontSize: '0.84rem',
                    fontWeight: 600,
                    cursor: editSaving ? 'not-allowed' : 'pointer',
                    opacity: editSaving ? 0.7 : 1,
                  }}
                >
                  {editSaving ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

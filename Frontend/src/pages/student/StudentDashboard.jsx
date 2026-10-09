import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Award,
  CheckCircle,
  ArrowLeft,
  ArrowRight,
  LogOut,
  Sparkles,
  TrendingUp,
  Briefcase,
  BookOpen,
  Sliders,
  Calendar,
  CheckSquare,
  Square,
  Compass,
} from 'lucide-react';
import BrandLogo from '../../components/common/BrandLogo';
import { useAuth } from '../../context/AuthContext';
import api from '../../services/api';

export default function StudentDashboard() {
  const { currentUser, logout, loginWithDemo } = useAuth();
  const navigate = useNavigate();

  // Student Telemetry State
  const [studentData, setStudentData] = useState(null);
  const [isLiveApi, setIsLiveApi] = useState(false);

  // "What-if" Score Simulation State
  const [simAttendance, setSimAttendance] = useState(88.5);
  const [simCoding, setSimCoding] = useState(8.2);
  const [simLms, setSimLms] = useState(89.0);
  const [liveSimulatedScore, setLiveSimulatedScore] = useState(null);

  // Mentor Tasks State
  const [tasks, setTasks] = useState([
    { id: 1, text: 'Complete LeetCode Top 50 DSA practice set', due: 'Oct 15, 2026', done: true, mentor: 'Prof. Rajesh Kumar' },
    { id: 2, text: 'Submit Microservices Architecture case study on LMS', due: 'Oct 22, 2026', done: false, mentor: 'Dr. R. Kumar' },
    { id: 3, text: 'Attend Corporate Mock Technical Interview Session', due: 'Oct 28, 2026', done: false, mentor: 'Vikram Malhotra (TPO)' },
  ]);

  // Load backend student telemetry on mount
  useEffect(() => {
    let isMounted = true;
    async function fetchStudentCockpit() {
      try {
        const roll = currentUser?.roll_no || 'STU-2024-042';
        const data = await api.getStudentDashboard(roll);
        if (isMounted && data) {
          setStudentData(data);
          setIsLiveApi(true);
          if (data.mentoring_tasks && data.mentoring_tasks.length > 0) {
            setTasks(
              data.mentoring_tasks.map((t) => ({
                id: t.id,
                text: t.title,
                due: t.due_date,
                done: t.status === 'COMPLETED',
                mentor: t.assigned_mentor,
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
    setTasks(tasks.map((t) => (t.id === id ? { ...t, done: !t.done } : t)));
    try {
      await api.toggleTaskStatus(id);
    } catch {
      // Offline fallback
    }
  };

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

  const handleLogout = () => {
    logout();
    navigate('/');
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
          <span>Logged in as: <strong>{currentUser?.name || 'Aarav Sharma'}</strong> (Roll ID: STU-2024-042)</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8', marginRight: '4px' }}>Switch View:</span>
          <button
            onClick={() => {
              loginWithDemo('admin');
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
            onClick={() => {
              loginWithDemo('mentor');
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
            onClick={() => {
              loginWithDemo('tpo');
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
            <span style={{ fontSize: '0.78rem', color: '#64748B' }}>
              Semester 6 • B.Tech Computer Science & Engineering
            </span>
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
              85.4 <span style={{ fontSize: '1rem', color: '#64748B', fontWeight: 500 }}>/ 100</span>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '4px', fontWeight: 700 }}>
              EXCELLENT • Tier-1 Placement Readiness
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
              8.42
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
              0 Active Backlogs • Top 15% Cohort
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
              88.5%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '4px' }}>
              Statutory 75% Requirement Met
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
              78.6%
            </div>
            <div style={{ fontSize: '0.75rem', color: '#10B981', marginTop: '4px', fontWeight: 600 }}>
              Tier-1 Ready • Coding: 8.2/10
            </div>
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
                    <div
                      style={{
                        fontSize: '0.84rem',
                        fontWeight: 600,
                        color: task.done ? '#15803D' : '#0F172A',
                        textDecoration: task.done ? 'line-through' : 'none',
                      }}
                    >
                      {task.text}
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
      </main>
    </div>
  );
}

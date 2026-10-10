import React, { useState, useRef, useMemo } from 'react';
import {
  Compass,
  Layers,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  Info,
  Maximize2,
  Table as TableIcon,
  Activity,
  UserCheck,
} from 'lucide-react';

/**
 * CODEBUFFET — 3D Student Spatial Analytics Visualization
 * Visualizes verified student cohorts in interactive 3D coordinate space:
 * X: Attendance (0-100%) | Y: Success Score (0-100) | Z: CGPA (0-10)
 * Includes an accessible 2D Analytical Matrix fallback.
 */
export default function StudentSpatial3DAnalytics({
  students = [],
  isDarkMode = false,
  onStudentSelect = null,
}) {
  const [viewMode, setViewMode] = useState('3d'); // '3d' | '2d-matrix'
  const [rotation, setRotation] = useState({ x: -14, y: 22 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [autoRotate, setAutoRotate] = useState(true);
  const [hoveredStudent, setHoveredStudent] = useState(null);
  const [filterRisk, setFilterRisk] = useState('ALL');

  // Filtered dataset
  const activeStudents = useMemo(() => {
    if (!students || students.length === 0) return [];
    if (filterRisk === 'ALL') return students;
    return students.filter(
      (s) => s.academicRisk === filterRisk || s.placementRisk === filterRisk
    );
  }, [students, filterRisk]);

  // Drag-to-rotate handlers for 3D navigation
  const handleMouseDown = (e) => {
    if (viewMode !== '3d') return;
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
    setAutoRotate(false);
  };

  const handleMouseMove = (e) => {
    if (!isDragging || viewMode !== '3d') return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    setRotation((prev) => ({
      x: Math.max(-60, Math.min(60, prev.x - dy * 0.4)),
      y: prev.y + dx * 0.4,
    }));
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResetRotation = () => {
    setRotation({ x: -14, y: 22 });
    setAutoRotate(false);
  };

  // 2D Matrix Cohort Quadrants
  const quadrants = useMemo(() => {
    const q1 = []; // High Success (>=75), High Attendance (>=75)
    const q2 = []; // High Success (>=75), Low Attendance (<75)
    const q3 = []; // Needs Support (<75), High Attendance (>=75)
    const q4 = []; // Needs Support (<75), Low Attendance (<75) - Critical

    activeStudents.forEach((s) => {
      const highSuccess = Number(s.successScore) >= 75;
      const highAtt = Number(s.attendance) >= 75;
      if (highSuccess && highAtt) q1.push(s);
      else if (highSuccess && !highAtt) q2.push(s);
      else if (!highSuccess && highAtt) q3.push(s);
      else q4.push(s);
    });

    return { q1, q2, q3, q4 };
  }, [activeStudents]);

  return (
    <div
      style={{
        backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
        border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 20px rgba(15, 23, 42, 0.04)',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Header & Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          borderBottom: `1px solid ${isDarkMode ? '#334155' : '#F1F5F9'}`,
          paddingBottom: '0.85rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: 'rgba(30, 107, 255, 0.12)',
              color: '#1E6BFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Compass size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0 }}>
                3D Student Cohort Intelligence — Spatial Risk Matrix
              </h3>
              <span
                style={{
                  fontSize: '0.68rem',
                  fontWeight: 700,
                  backgroundColor: '#ECFDF5',
                  color: '#059669',
                  padding: '2px 8px',
                  borderRadius: '9999px',
                  border: '1px solid #A7F3D0',
                }}
              >
                LIVE TELEMETRY
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748B' }}>
              Multivariate spatial projection: X = Attendance % | Y = Success Score | Z (Depth) = CGPA
            </p>
          </div>
        </div>

        {/* View Switcher & Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Risk Filter */}
          <select
            value={filterRisk}
            onChange={(e) => setFilterRisk(e.target.value)}
            style={{
              padding: '5px 10px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 600,
              backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC',
              color: isDarkMode ? '#F8FAFC' : '#0F172A',
              border: `1px solid ${isDarkMode ? '#334155' : '#CBD5E1'}`,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            <option value="ALL">All Risk Bands</option>
            <option value="HIGH">High Risk Focus</option>
            <option value="MEDIUM">Medium Risk</option>
            <option value="LOW">Low Risk (Tier-1)</option>
          </select>

          {/* 3D vs 2D Fallback Toggle */}
          <div
            style={{
              display: 'flex',
              backgroundColor: isDarkMode ? '#0F172A' : '#F1F5F9',
              padding: '3px',
              borderRadius: '8px',
            }}
          >
            <button
              onClick={() => setViewMode('3d')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: viewMode === '3d' ? '#1E6BFF' : 'transparent',
                color: viewMode === '3d' ? '#FFFFFF' : '#64748B',
                boxShadow: viewMode === '3d' ? '0 2px 6px rgba(30,107,255,0.3)' : 'none',
              }}
            >
              <Compass size={13} />
              <span>3D Spatial View</span>
            </button>
            <button
              onClick={() => setViewMode('2d-matrix')}
              style={{
                padding: '4px 10px',
                borderRadius: '6px',
                border: 'none',
                fontSize: '0.76rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '5px',
                backgroundColor: viewMode === '2d-matrix' ? '#1E6BFF' : 'transparent',
                color: viewMode === '2d-matrix' ? '#FFFFFF' : '#64748B',
                boxShadow: viewMode === '2d-matrix' ? '0 2px 6px rgba(30,107,255,0.3)' : 'none',
              }}
            >
              <TableIcon size={13} />
              <span>2D Matrix Fallback</span>
            </button>
          </div>

          {viewMode === '3d' && (
            <button
              onClick={handleResetRotation}
              title="Reset View Orientation"
              style={{
                padding: '6px',
                borderRadius: '8px',
                border: `1px solid ${isDarkMode ? '#334155' : '#CBD5E1'}`,
                backgroundColor: isDarkMode ? '#0F172A' : '#FFFFFF',
                color: '#64748B',
                cursor: 'pointer',
              }}
            >
              <RotateCcw size={14} />
            </button>
          )}
        </div>
      </div>

      {/* =======================================================================
          VIEW MODE 1: INTERACTIVE 3D SPATIAL SCATTER VOLUME
          ======================================================================= */}
      {viewMode === '3d' ? (
        <div
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            position: 'relative',
            height: '360px',
            width: '100%',
            backgroundColor: isDarkMode ? '#0B1120' : '#F8FAFC',
            borderRadius: '12px',
            overflow: 'hidden',
            cursor: isDragging ? 'grabbing' : 'grab',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            perspective: '1000px',
            userSelect: 'none',
            border: `1px solid ${isDarkMode ? '#1E293B' : '#E2E8F0'}`,
          }}
        >
          {/* Spatial Rotation Guide Overlay */}
          <div
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              fontSize: '0.70rem',
              color: '#94A3B8',
              backgroundColor: isDarkMode ? 'rgba(15,23,42,0.8)' : 'rgba(255,255,255,0.85)',
              padding: '4px 8px',
              borderRadius: '6px',
              backdropFilter: 'blur(4px)',
              pointerEvents: 'none',
              zIndex: 10,
            }}
          >
            Drag with mouse to rotate in 3D • Yaw: {Math.round(rotation.y)}° • Pitch: {Math.round(rotation.x)}° {activeStudents.length > 250 ? `• Showing 250 sample points of ${activeStudents.length.toLocaleString()} students` : `• ${activeStudents.length} students`}
          </div>

          {/* Spatial 3D Coordinate Stage */}
          <div
            style={{
              width: '280px',
              height: '240px',
              position: 'relative',
              transformStyle: 'preserve-3d',
              transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg)`,
              transition: isDragging ? 'none' : 'transform 0.15s ease-out',
            }}
          >
            {/* 3D Wireframe Bounding Box Planes */}
            {/* Floor Plane (Attendance X vs CGPA Z) */}
            <div
              style={{
                position: 'absolute',
                width: '280px',
                height: '240px',
                bottom: 0,
                left: 0,
                transform: 'rotateX(90deg) translateZ(-120px)',
                border: '1px dashed rgba(100, 116, 139, 0.35)',
                backgroundColor: isDarkMode ? 'rgba(30, 41, 59, 0.4)' : 'rgba(241, 245, 249, 0.65)',
                backgroundImage: 'radial-gradient(rgba(30, 107, 255, 0.15) 1px, transparent 0)',
                backgroundSize: '24px 24px',
              }}
            >
              <span style={{ position: 'absolute', bottom: '6px', left: '10px', fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>
                Attendance % (X) ➔
              </span>
              <span style={{ position: 'absolute', top: '10px', left: '6px', fontSize: '0.65rem', color: '#64748B', fontWeight: 700 }}>
                CGPA Depth (Z) ➔
              </span>
            </div>

            {/* Back Wall (Success Score Y vs Attendance X) */}
            <div
              style={{
                position: 'absolute',
                width: '280px',
                height: '240px',
                top: 0,
                left: 0,
                transform: 'translateZ(-120px)',
                borderLeft: '1px solid rgba(100, 116, 139, 0.3)',
                borderBottom: '1px solid rgba(100, 116, 139, 0.3)',
                backgroundColor: isDarkMode ? 'rgba(15, 23, 42, 0.3)' : 'rgba(255, 255, 255, 0.4)',
              }}
            >
              <span style={{ position: 'absolute', top: '10px', left: '-25px', fontSize: '0.65rem', color: '#64748B', fontWeight: 700, transform: 'rotate(-90deg)' }}>
                Success Score (Y) ➔
              </span>
            </div>

            {/* 3D Student Nodes Plotted in Real Space (Capped at 250 for 60fps rendering) */}
            {(activeStudents.length > 250 ? activeStudents.slice(0, 250) : activeStudents).map((s) => {
              // Map attendance (50-100%) to X: -120px .. +120px
              const att = Math.max(50, Math.min(100, Number(s.attendance || 75)));
              const posX = ((att - 50) / 50) * 240 - 120;

              // Map success score (40-100) to Y: -100px (top) .. +100px (bottom, inverted for 3D)
              const score = Math.max(40, Math.min(100, Number(s.successScore || 70)));
              const posY = 100 - ((score - 40) / 60) * 200;

              // Map CGPA (5.0-10.0) to Z depth: -100px .. +100px
              const cgpa = Math.max(5.0, Math.min(10.0, Number(s.cgpa || 7.5)));
              const posZ = ((cgpa - 5.0) / 5.0) * 200 - 100;

              // Color based on Risk Band
              const isHigh = s.academicRisk === 'HIGH' || s.placementRisk === 'HIGH';
              const isMed = s.academicRisk === 'MEDIUM' || s.placementRisk === 'MEDIUM';
              const nodeColor = isHigh ? '#EF4444' : isMed ? '#F59E0B' : '#10B981';

              return (
                <div
                  key={s.id}
                  onMouseEnter={() => setHoveredStudent(s)}
                  onMouseLeave={() => setHoveredStudent(null)}
                  onClick={() => onStudentSelect && onStudentSelect(s)}
                  style={{
                    position: 'absolute',
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    backgroundColor: nodeColor,
                    boxShadow: `0 0 12px ${nodeColor}`,
                    transform: `translate3d(${posX}px, ${posY}px, ${posZ}px)`,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#FFFFFF',
                    fontSize: '0.55rem',
                    fontWeight: 800,
                    border: '2px solid #FFFFFF',
                    transition: 'transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1)',
                  }}
                  title={`${s.name} (${s.id})`}
                >
                  <span style={{ pointerEvents: 'none' }}>
                    {s.name ? s.name.charAt(0) : 'S'}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Interactive Node Hover Card */}
          {hoveredStudent && (
            <div
              style={{
                position: 'absolute',
                bottom: '16px',
                right: '16px',
                backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
                borderRadius: '12px',
                padding: '12px 16px',
                boxShadow: '0 10px 25px rgba(0,0,0,0.25)',
                border: `1px solid ${isDarkMode ? '#334155' : '#E2E8F0'}`,
                maxWidth: '280px',
                zIndex: 20,
                fontSize: '0.80rem',
                pointerEvents: 'none',
              }}
            >
              <div style={{ fontWeight: 800, fontSize: '0.90rem', color: isDarkMode ? '#FFFFFF' : '#0F172A' }}>
                {hoveredStudent.name}
              </div>
              <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '6px' }}>
                {hoveredStudent.id} • {hoveredStudent.department}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginTop: '6px' }}>
                <div>Success: <strong>{hoveredStudent.successScore}</strong></div>
                <div>Attendance: <strong>{hoveredStudent.attendance}%</strong></div>
                <div>CGPA: <strong>{hoveredStudent.cgpa}</strong></div>
                <div>Risk: <strong style={{ color: hoveredStudent.academicRisk === 'HIGH' ? '#EF4444' : '#10B981' }}>{hoveredStudent.academicRisk}</strong></div>
              </div>
              <div style={{ marginTop: '6px', fontSize: '0.72rem', color: '#1E6BFF' }}>
                Mentor: {hoveredStudent.assignedMentor || 'Prof. Rajesh Kumar'}
              </div>
            </div>
          )}

          {/* 3D Legend Bar */}
          <div
            style={{
              position: 'absolute',
              bottom: '12px',
              left: '12px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              fontSize: '0.72rem',
              color: '#64748B',
              backgroundColor: isDarkMode ? 'rgba(15,23,42,0.85)' : 'rgba(255,255,255,0.85)',
              padding: '6px 12px',
              borderRadius: '8px',
              backdropFilter: 'blur(4px)',
            }}
          >
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              Low Risk (Tier-1)
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#F59E0B' }} />
              Medium Risk
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#EF4444' }} />
              High Academic/Placement Risk
            </span>
          </div>
        </div>
      ) : (
        /* =======================================================================
            VIEW MODE 2: ACCESSIBLE 2D QUADRANT ANALYTICAL MATRIX (FALLBACK)
            ======================================================================= */
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: '12px',
            backgroundColor: isDarkMode ? '#0B1120' : '#F8FAFC',
            padding: '14px',
            borderRadius: '12px',
            border: `1px solid ${isDarkMode ? '#1E293B' : '#E2E8F0'}`,
          }}
        >
          {/* Q1: Tier-1 Readiness */}
          <div
            style={{
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              border: '1px solid #10B981',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '0.84rem', color: '#10B981' }}>
                Quadrant 1: Tier-1 Placement Ready
              </strong>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#ECFDF5', color: '#059669', padding: '2px 6px', borderRadius: '4px' }}>
                {quadrants.q1.length} Students
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', marginBottom: '8px' }}>
              Success Score ≥ 75 & Attendance ≥ 75%
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
              {quadrants.q1.map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', padding: '4px 6px', backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderRadius: '6px' }}>
                  <span><strong>{s.name}</strong> ({s.id})</span>
                  <span>{s.successScore} pts • {s.department}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Q2: Attendance Alert / High Potential */}
          <div
            style={{
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              border: '1px solid #F59E0B',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '0.84rem', color: '#F59E0B' }}>
                Quadrant 2: Attendance Counseling Needed
              </strong>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#FFFBEB', color: '#D97706', padding: '2px 6px', borderRadius: '4px' }}>
                {quadrants.q2.length} Students
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', marginBottom: '8px' }}>
              High Success (≥75) but Attendance &lt; 75%
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
              {quadrants.q2.map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', padding: '4px 6px', backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderRadius: '6px' }}>
                  <span><strong>{s.name}</strong> ({s.id})</span>
                  <span style={{ color: '#EF4444' }}>{s.attendance}% Att</span>
                </div>
              ))}
            </div>
          </div>

          {/* Q3: Skill / Academic Acceleration */}
          <div
            style={{
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              border: '1px solid #3B82F6',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '0.84rem', color: '#3B82F6' }}>
                Quadrant 3: Skill & Mentorship Acceleration
              </strong>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#EFF6FF', color: '#1E6BFF', padding: '2px 6px', borderRadius: '4px' }}>
                {quadrants.q3.length} Students
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', marginBottom: '8px' }}>
              Good Attendance (≥75%) but Success Score &lt; 75
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
              {quadrants.q3.map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', padding: '4px 6px', backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderRadius: '6px' }}>
                  <span><strong>{s.name}</strong> ({s.id})</span>
                  <span>{s.successScore} pts</span>
                </div>
              ))}
            </div>
          </div>

          {/* Q4: Critical Dual-Risk Priority */}
          <div
            style={{
              backgroundColor: isDarkMode ? '#1E293B' : '#FFFFFF',
              border: '1px solid #EF4444',
              borderRadius: '10px',
              padding: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <strong style={{ fontSize: '0.84rem', color: '#EF4444' }}>
                Quadrant 4: Critical Dual-Risk Intervention
              </strong>
              <span style={{ fontSize: '0.72rem', fontWeight: 700, backgroundColor: '#FEF2F2', color: '#DC2626', padding: '2px 6px', borderRadius: '4px' }}>
                {quadrants.q4.length} Students
              </span>
            </div>
            <div style={{ fontSize: '0.74rem', color: '#64748B', marginBottom: '8px' }}>
              Attendance &lt; 75% AND Success Score &lt; 75
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '120px', overflowY: 'auto' }}>
              {quadrants.q4.map((s) => (
                <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', padding: '4px 6px', backgroundColor: isDarkMode ? '#0F172A' : '#F8FAFC', borderRadius: '6px' }}>
                  <span style={{ color: '#EF4444' }}><strong>{s.name}</strong> ({s.id})</span>
                  <span>Mentor: {s.assignedMentor || 'Unassigned'}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useRef, useEffect } from 'react';
import {
  TrendingUp,
  AlertTriangle,
  Award,
  Sparkles,
  Building2,
  GraduationCap,
  Briefcase,
  Users,
  Compass,
  Maximize2,
  Minimize2,
  Info,
} from 'lucide-react';

export default function Campus3DExperience({ onExploreClick }) {
  const containerRef = useRef(null);
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [isHovered, setIsHovered] = useState(false);
  const [spatialMode, setSpatialMode] = useState(true);
  const [activeHotspot, setActiveHotspot] = useState(null);
  const [orbitAngle, setOrbitAngle] = useState(0);

  // Auto-orbit animation when idle and in spatial mode
  useEffect(() => {
    let animId;
    if (spatialMode && !isHovered) {
      const animate = () => {
        setOrbitAngle((prev) => (prev + 0.008) % (Math.PI * 2));
        animId = requestAnimationFrame(animate);
      };
      animId = requestAnimationFrame(animate);
    }
    return () => cancelAnimationFrame(animId);
  }, [spatialMode, isHovered]);

  const handleMouseMove = (e) => {
    if (!containerRef.current || !spatialMode) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    // Map to subtle 3D tilt angles (-8deg to +8deg)
    setRotation({
      x: -(y / (rect.height / 2)) * 7,
      y: (x / (rect.width / 2)) * 9,
    });
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    setRotation({ x: 0, y: 0 });
  };

  const handleMouseEnter = () => {
    setIsHovered(true);
  };

  // Effective tilt (blend idle orbit + mouse tracking)
  const currentRotX = isHovered ? rotation.x : Math.sin(orbitAngle) * 3;
  const currentRotY = isHovered ? rotation.y : Math.cos(orbitAngle) * 4;

  const campusHotspots = [
    {
      id: 'academics',
      title: 'Academics Building',
      badge: 'Academic Core',
      metric: '85.4% Avg CGPA Benchmark',
      description: 'Tracks semester grades, active backlogs, internal assessments, and continuous attendance.',
      icon: GraduationCap,
      color: '#38BDF8',
      pos: { top: '38%', left: '13%' },
    },
    {
      id: 'research',
      title: 'Research & Innovation',
      badge: 'Advanced Skills',
      metric: '1,420 Active Projects',
      description: 'System design rating, machine learning knowledge, hackathons, and published repositories.',
      icon: Sparkles,
      color: '#818CF8',
      pos: { top: '42%', left: '32%' },
    },
    {
      id: 'placement',
      title: 'Placement & Career Hub',
      badge: 'Corporate Readiness',
      metric: '78.6% Placement Readiness',
      description: 'Aptitude benchmarks, DSA assessments, coding interview ratings, and verified internships.',
      icon: Briefcase,
      color: '#C084FC',
      pos: { top: '38%', left: '76%' },
    },
    {
      id: 'engagement',
      title: 'Student Engagement Center',
      badge: 'Campus Life',
      metric: '92.4% LMS Completion',
      description: 'Club leadership, weekly LMS telemetry, event participation, and faculty mentoring check-ins.',
      icon: Users,
      color: '#34D399',
      pos: { top: '44%', left: '90%' },
    },
  ];

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        position: 'relative',
        width: '100%',
        height: '620px',
        borderRadius: '24px',
        overflow: 'hidden',
        perspective: '1400px',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.6), 0 0 40px rgba(30, 107, 255, 0.25)',
        border: '1px solid rgba(255, 255, 255, 0.15)',
        cursor: isHovered ? 'crosshair' : 'default',
        backgroundColor: '#060D1A',
      }}
    >
      {/* 3D Transform Stage Container */}
      <div
        style={{
          width: '100%',
          height: '100%',
          position: 'relative',
          transformStyle: 'preserve-3d',
          transform: `rotateX(${currentRotX}deg) rotateY(${currentRotY}deg)`,
          transition: isHovered ? 'transform 100ms ease-out' : 'transform 800ms ease-out',
        }}
      >
        {/* Deep Layer: Grand Illuminated Campus Photograph */}
        <div
          style={{
            position: 'absolute',
            inset: '-5%',
            backgroundImage: `url('/assets/images/codebuffet_campus_entrance.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center 45%',
            transform: 'translateZ(-50px) scale(1.12)',
            filter: 'brightness(0.96) contrast(1.05)',
          }}
        />

        {/* Ambient Volumetric Lighting Overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: `radial-gradient(circle at ${50 + currentRotY * 2}% ${50 - currentRotX * 2}%, rgba(30, 107, 255, 0.15) 0%, rgba(6, 13, 26, 0.45) 80%, rgba(6, 13, 26, 0.75) 100%)`,
            pointerEvents: 'none',
            transform: 'translateZ(-20px)',
          }}
        />

        {/* =========================================================================
            HOLOGRAPHIC 3D HUD PANELS (Derived from Supplied Master Image)
            ========================================================================= */}

        {/* HUD Card 1: Student Success 85% (Top Left) */}
        <div
          style={{
            position: 'absolute',
            top: '8%',
            left: '4%',
            transform: 'translateZ(55px)',
            width: '240px',
            background: 'rgba(9, 21, 41, 0.72)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '16px',
            border: '1px solid rgba(56, 189, 248, 0.45)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(56, 189, 248, 0.25)',
            padding: '1rem',
            color: '#FFFFFF',
            zIndex: 10,
            transition: 'transform 300ms ease',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600, letterSpacing: '0.04em' }}>
              Student Success
            </span>
            <span
              style={{
                fontSize: '0.70rem',
                backgroundColor: 'rgba(16, 185, 129, 0.2)',
                color: '#34D399',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 700,
                display: 'inline-flex',
                alignItems: 'center',
                gap: '2px',
              }}
            >
              <TrendingUp size={11} /> +5.6%
            </span>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#38BDF8', lineHeight: 1.1, textShadow: '0 0 12px rgba(56, 189, 248, 0.5)' }}>
            85.4%
          </div>
          {/* Animated SVG Sparkline Bar/Wave */}
          <div style={{ marginTop: '8px', height: '32px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
            {[40, 52, 48, 65, 74, 82, 95].map((val, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${val}%`,
                  background: 'linear-gradient(to top, rgba(30, 107, 255, 0.3), #38BDF8)',
                  borderRadius: '3px 3px 0 0',
                }}
              />
            ))}
          </div>
        </div>

        {/* HUD Card 2: At-Risk Students 5.2% (Top Right Center) */}
        <div
          style={{
            position: 'absolute',
            top: '8%',
            right: '23%',
            transform: 'translateZ(45px)',
            width: '210px',
            background: 'rgba(9, 21, 41, 0.72)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '16px',
            border: '1px solid rgba(248, 113, 113, 0.45)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(239, 68, 68, 0.22)',
            padding: '1rem',
            color: '#FFFFFF',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>At-Risk Students</span>
            <span
              style={{
                fontSize: '0.70rem',
                backgroundColor: 'rgba(239, 68, 68, 0.2)',
                color: '#F87171',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 700,
              }}
            >
              -2.1%
            </span>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#F87171', lineHeight: 1.1, textShadow: '0 0 12px rgba(248, 113, 113, 0.5)' }}>
            5.2%
          </div>
          {/* Animated red descending sparkline */}
          <div style={{ marginTop: '8px', height: '32px', display: 'flex', alignItems: 'flex-end', gap: '4px' }}>
            {[85, 75, 70, 58, 45, 32, 24].map((val, i) => (
              <div
                key={i}
                style={{
                  flex: 1,
                  height: `${val}%`,
                  background: 'linear-gradient(to top, rgba(239, 68, 68, 0.3), #F87171)',
                  borderRadius: '3px 3px 0 0',
                }}
              />
            ))}
          </div>
        </div>

        {/* HUD Card 3: Placement Readiness 78.6% (Top Far Right) */}
        <div
          style={{
            position: 'absolute',
            top: '8%',
            right: '4%',
            transform: 'translateZ(60px)',
            width: '210px',
            background: 'rgba(9, 21, 41, 0.72)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            borderRadius: '16px',
            border: '1px solid rgba(192, 132, 252, 0.45)',
            boxShadow: '0 12px 30px rgba(0, 0, 0, 0.45), 0 0 20px rgba(168, 85, 247, 0.25)',
            padding: '1rem',
            color: '#FFFFFF',
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '0.78rem', color: '#94A3B8', fontWeight: 600 }}>Placement Readiness</span>
            <span
              style={{
                fontSize: '0.70rem',
                backgroundColor: 'rgba(168, 85, 247, 0.2)',
                color: '#C084FC',
                padding: '2px 8px',
                borderRadius: '9999px',
                fontWeight: 700,
              }}
            >
              +6.8%
            </span>
          </div>
          <div style={{ fontSize: '2.1rem', fontWeight: 800, color: '#C084FC', lineHeight: 1.1, textShadow: '0 0 12px rgba(192, 132, 252, 0.5)' }}>
            78.6%
          </div>
          <div style={{ marginTop: '8px', fontSize: '0.72rem', color: '#CBD5E1', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <span>Verified across 12,480 cohorts</span>
          </div>
        </div>

        {/* =========================================================================
            CAMPUS DEPARTMENT INTERACTIVE HOTSPOTS
            ========================================================================= */}
        {campusHotspots.map((spot) => {
          const Icon = spot.icon;
          const isActive = activeHotspot?.id === spot.id;
          return (
            <div
              key={spot.id}
              style={{
                position: 'absolute',
                top: spot.pos.top,
                left: spot.pos.left,
                transform: `translateZ(${isActive ? 85 : 40}px)`,
                zIndex: isActive ? 40 : 20,
              }}
            >
              {/* Pulsing Target Dot */}
              <button
                onClick={() => setActiveHotspot(isActive ? null : spot)}
                style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(9, 21, 41, 0.85)',
                  border: `2px solid ${spot.color}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: spot.color,
                  cursor: 'pointer',
                  boxShadow: `0 0 16px ${spot.color}`,
                  transition: 'all 200ms ease',
                  padding: 0,
                }}
                title={spot.title}
              >
                <Icon size={20} />
              </button>

              {/* Department Name Tag */}
              <div
                style={{
                  position: 'absolute',
                  top: '46px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  fontSize: '0.74rem',
                  fontWeight: 700,
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(9, 21, 41, 0.85)',
                  padding: '3px 10px',
                  borderRadius: '6px',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                }}
              >
                {spot.title}
              </div>

              {/* Active Popover Detail */}
              {isActive && (
                <div
                  style={{
                    position: 'absolute',
                    top: '74px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '260px',
                    background: 'rgba(15, 23, 42, 0.95)',
                    backdropFilter: 'blur(20px)',
                    border: `1px solid ${spot.color}`,
                    borderRadius: '14px',
                    padding: '1rem',
                    color: '#FFFFFF',
                    boxShadow: '0 20px 40px rgba(0, 0, 0, 0.6)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '0.70rem', color: spot.color, fontWeight: 700, textTransform: 'uppercase' }}>
                      {spot.badge}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setActiveHotspot(null);
                      }}
                      style={{ background: 'none', border: 'none', color: '#94A3B8', cursor: 'pointer', fontSize: '0.8rem' }}
                    >
                      ✕
                    </button>
                  </div>
                  <h4 style={{ fontSize: '0.96rem', fontWeight: 700, marginBottom: '4px' }}>{spot.title}</h4>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: spot.color, marginBottom: '6px' }}>
                    {spot.metric}
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#94A3B8', lineHeight: 1.45, margin: 0 }}>
                    {spot.description}
                  </p>
                </div>
              )}
            </div>
          );
        })}

        {/* Center Entrance Gate Banner (From Image 1) */}
        <div
          style={{
            position: 'absolute',
            bottom: '5%',
            left: '50%',
            transform: 'translateX(-50%) translateZ(65px)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            background: 'rgba(9, 21, 41, 0.85)',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '9999px',
            padding: '8px 20px',
            color: '#FFFFFF',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.5), 0 0 20px rgba(30, 107, 255, 0.3)',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#38BDF8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            ✦ CODEBUFFET 3D CAMPUS
          </span>
          <span style={{ color: 'rgba(255,255,255,0.3)' }}>|</span>
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.8)' }}>
            Empowering Every Student with Data-Driven Intelligence
          </span>
        </div>
      </div>

      {/* Control Bar in Top Right */}
      <div
        style={{
          position: 'absolute',
          top: '1rem',
          right: '1rem',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          zIndex: 30,
        }}
      >
        <button
          onClick={() => setSpatialMode(!spatialMode)}
          style={{
            backgroundColor: spatialMode ? 'rgba(30, 107, 255, 0.85)' : 'rgba(15, 23, 42, 0.8)',
            color: '#FFFFFF',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '8px',
            padding: '6px 12px',
            fontSize: '0.74rem',
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            backdropFilter: 'blur(8px)',
            transition: 'all 180ms ease',
          }}
        >
          <Compass size={13} />
          <span>{spatialMode ? '3D Spatial Active' : 'Enable 3D Orbit'}</span>
        </button>

        {onExploreClick && (
          <button
            onClick={onExploreClick}
            style={{
              backgroundColor: '#1E6BFF',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              fontSize: '0.74rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 10px rgba(30, 107, 255, 0.4)',
            }}
          >
            <span>Launch Dashboard →</span>
          </button>
        )}
      </div>

      {/* Subtle Bottom Instruction */}
      <div
        style={{
          position: 'absolute',
          bottom: '12px',
          right: '16px',
          fontSize: '0.68rem',
          color: 'rgba(255, 255, 255, 0.5)',
          zIndex: 30,
          pointerEvents: 'none',
        }}
      >
        Move cursor to navigate 3D perspective • Click nodes to inspect departments
      </div>
    </div>
  );
}

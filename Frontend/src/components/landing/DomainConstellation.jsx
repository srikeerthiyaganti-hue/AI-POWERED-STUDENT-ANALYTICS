import React, { useState } from 'react';
import {
  Sparkles,
  TrendingUp,
  LineChart,
  Target,
  ShieldAlert,
  Activity,
} from 'lucide-react';

export default function DomainConstellation() {
  const [activeNode, setActiveNode] = useState(null);

  const networkNodes = [
    {
      id: 'core',
      name: 'AI Intelligence Core',
      icon: Sparkles,
      x: 50,
      y: 46,
      badge: 'Success Engine',
      description: 'Central AI pipeline orchestrating multi-dimensional telemetry, success scoring & prescriptive intervention models.',
      highlight: 'Unified Student Success Engine',
      isCore: true,
    },
    {
      id: 'growth',
      name: 'AI Student Growth',
      icon: TrendingUp,
      x: 22,
      y: 24,
      badge: 'Adaptive Trajectory',
      description: 'Continuous predictive progression modeling tracking individual learning velocity and academic capability milestones.',
      highlight: 'Continuous Capability Acceleration',
    },
    {
      id: 'predictive',
      name: 'Predictive Success Insights',
      icon: LineChart,
      x: 78,
      y: 24,
      badge: 'ML Risk Modeling',
      description: 'Explainable machine-learning risk forecasting identifying performance trends weeks before traditional examination periods.',
      highlight: 'Explainable Readiness Forecasting',
    },
    {
      id: 'personalized',
      name: 'Personalized Learning',
      icon: Target,
      x: 82,
      y: 68,
      badge: 'Curated Pathways',
      description: 'Dynamic tailored skill roadmaps, customized academic remediation & adaptive practice sets aligned with student readiness.',
      highlight: 'Customized Developmental Roadmaps',
    },
    {
      id: 'support',
      name: 'Early Support Identification',
      icon: ShieldAlert,
      x: 18,
      y: 68,
      badge: 'Proactive Triggers',
      description: 'Automated early warning triggers alerting mentors to attendance shortages and course arrear risks for immediate counseling.',
      highlight: 'Timely Mentoring & Remedial Triggers',
    },
    {
      id: 'datadriven',
      name: 'Data-Driven Development',
      icon: Activity,
      x: 50,
      y: 84,
      badge: 'Holistic Telemetry',
      description: 'Unified telemetry synthesizing performance, lab proficiencies, learning activity and career readiness into actionable intelligence.',
      highlight: 'Holistic Campus Telemetry Synthesis',
    },
  ];

  // Connecting neural paths
  const connections = [
    { from: 'core', to: 'growth' },
    { from: 'core', to: 'predictive' },
    { from: 'core', to: 'personalized' },
    { from: 'core', to: 'support' },
    { from: 'core', to: 'datadriven' },
    { from: 'growth', to: 'predictive' },
    { from: 'growth', to: 'support' },
    { from: 'predictive', to: 'personalized' },
    { from: 'support', to: 'datadriven' },
    { from: 'personalized', to: 'datadriven' },
  ];

  const getCoords = (id) => {
    const node = networkNodes.find((n) => n.id === id);
    return node ? { x: node.x, y: node.y } : { x: 50, y: 50 };
  };

  return (
    <div
      style={{
        position: 'relative',
        width: '100%',
        height: '100%',
        minHeight: '360px',
        maxHeight: '440px',
      }}
    >
      {/* SVG Connecting Neural Network Arcs */}
      <svg
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          pointerEvents: 'none',
        }}
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="neuralGlow" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#258BFA" stopOpacity="0.45" />
            <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.85" />
            <stop offset="100%" stopColor="#00F0FF" stopOpacity="0.55" />
          </linearGradient>
          <filter id="coreGlowFilter" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>
        </defs>

        {/* Ambient Orbit Circles around Core */}
        <circle
          cx="50"
          cy="46"
          r="16"
          fill="none"
          stroke="#258BFA"
          strokeWidth="0.25"
          strokeDasharray="2, 2"
          opacity="0.4"
        />
        <circle
          cx="50"
          cy="46"
          r="26"
          fill="none"
          stroke="#38BDF8"
          strokeWidth="0.2"
          strokeDasharray="3, 3"
          opacity="0.3"
        />

        {connections.map((c, i) => {
          const start = getCoords(c.from);
          const end = getCoords(c.to);
          const isHighlighted =
            activeNode === c.from || activeNode === c.to;

          // Quadratic bezier curve midpoint
          const midX = (start.x + end.x) / 2 + (start.y > end.y ? 3 : -3);
          const midY = (start.y + end.y) / 2 - 4;

          return (
            <path
              key={`conn-${i}`}
              d={`M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`}
              fill="none"
              stroke={isHighlighted ? '#00F0FF' : 'url(#neuralGlow)'}
              strokeWidth={isHighlighted ? '0.9' : '0.45'}
              strokeDasharray={isHighlighted ? 'none' : '2.5, 1.5'}
              style={{
                transition: 'all 0.3s ease',
                filter: isHighlighted ? 'drop-shadow(0 0 6px #00F0FF)' : 'none',
              }}
            />
          );
        })}
      </svg>

      {/* Floating Student Success Intelligence Nodes */}
      {networkNodes.map((node) => {
        const IconComponent = node.icon;
        const isSelected = activeNode === node.id;
        const isCore = node.isCore;

        return (
          <div
            key={node.id}
            onMouseEnter={() => setActiveNode(node.id)}
            onMouseLeave={() => setActiveNode(null)}
            style={{
              position: 'absolute',
              left: `${node.x}%`,
              top: `${node.y}%`,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: isCore ? 12 : 10,
              transition: 'transform 0.25s ease',
            }}
          >
            {/* Circular Glass / Glowing AI Node */}
            <div
              style={{
                width: isCore ? (isSelected ? '64px' : '56px') : (isSelected ? '48px' : '42px'),
                height: isCore ? (isSelected ? '64px' : '56px') : (isSelected ? '48px' : '42px'),
                borderRadius: '50%',
                background: isCore
                  ? isSelected
                    ? 'radial-gradient(circle, #00F0FF 0%, #1677D2 50%, #061A33 100%)'
                    : 'radial-gradient(circle, #258BFA 0%, #082B56 70%, #061A33 100%)'
                  : isSelected
                    ? 'radial-gradient(circle, #258BFA 0%, #082B56 100%)'
                    : 'radial-gradient(circle, rgba(37, 139, 250, 0.45) 0%, rgba(6, 26, 51, 0.85) 100%)',
                border: isCore
                  ? isSelected
                    ? '2.5px solid #FFFFFF'
                    : '2px solid #38BDF8'
                  : isSelected
                    ? '2px solid #FFFFFF'
                    : '1.5px solid rgba(56, 189, 248, 0.65)',
                boxShadow: isCore
                  ? isSelected
                    ? '0 0 32px rgba(0, 240, 255, 0.9), inset 0 0 14px rgba(255, 255, 255, 0.7)'
                    : '0 0 20px rgba(37, 139, 250, 0.6), inset 0 0 8px rgba(56, 189, 248, 0.4)'
                  : isSelected
                    ? '0 0 24px rgba(37, 139, 250, 0.85), inset 0 0 10px rgba(255, 255, 255, 0.5)'
                    : '0 0 12px rgba(37, 139, 250, 0.35)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                transition: 'all 0.25s ease',
              }}
            >
              <IconComponent size={isCore ? (isSelected ? 28 : 24) : (isSelected ? 22 : 18)} />
            </div>

            {/* Clean Subtle Node Title */}
            <span
              style={{
                marginTop: '5px',
                fontSize: isCore ? '0.76rem' : '0.72rem',
                fontWeight: isCore ? 700 : 600,
                letterSpacing: '0.02em',
                color: isSelected ? '#00F0FF' : isCore ? '#E0F2FE' : 'rgba(255, 255, 255, 0.9)',
                textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s ease',
              }}
            >
              {node.name}
            </span>

            {/* Tooltip on Hover */}
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  marginTop: '10px',
                  backgroundColor: 'rgba(6, 26, 51, 0.96)',
                  border: '1px solid rgba(0, 240, 255, 0.55)',
                  borderRadius: '10px',
                  padding: '9px 13px',
                  boxShadow: '0 12px 30px rgba(0, 0, 0, 0.75), 0 0 16px rgba(0, 240, 255, 0.25)',
                  width: '230px',
                  textAlign: 'center',
                  backdropFilter: 'blur(10px)',
                  pointerEvents: 'none',
                  zIndex: 25,
                }}
              >
                <div style={{ color: '#FFFFFF', fontWeight: 700, fontSize: '0.82rem', marginBottom: '2px' }}>
                  {node.name}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '0.72rem', lineHeight: 1.35 }}>
                  {node.description}
                </div>
                <div
                  style={{
                    color: '#38BDF8',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    marginTop: '5px',
                    letterSpacing: '0.04em',
                    textTransform: 'uppercase',
                  }}
                >
                  ● {node.badge}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

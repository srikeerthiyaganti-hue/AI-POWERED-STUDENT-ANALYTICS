import React, { useState } from 'react';
import {
  GraduationCap,
  BarChart3,
  Laptop,
  Users,
  Lightbulb,
  MessageSquare,
  Briefcase,
  CheckCircle,
} from 'lucide-react';

export default function DomainConstellation() {
  const [activeDomain, setActiveDomain] = useState(null);

  const domains = [
    {
      id: 'academics',
      name: 'Academics',
      icon: GraduationCap,
      x: 12,
      y: 52,
      detail: 'Marks, SGPA/CGPA, historical grade trends & backlog tracking',
      metric: '30% Score Weight',
    },
    {
      id: 'attendance',
      name: 'Attendance',
      icon: BarChart3,
      x: 28,
      y: 28,
      detail: 'Overall & subject-wise presence with 75% statutory warning',
      metric: '15% Score Weight',
    },
    {
      id: 'lms',
      name: 'LMS Activity',
      icon: Laptop,
      x: 34,
      y: 72,
      detail: 'Login frequency, assignment submissions & video lecture completion',
      metric: '10% Score Weight',
    },
    {
      id: 'engagement',
      name: 'Engagement',
      icon: Users,
      x: 52,
      y: 18,
      detail: 'Club leadership, hackathon participation & verified certifications',
      metric: '8% Score Weight',
    },
    {
      id: 'feedback',
      name: 'Feedback',
      icon: MessageSquare,
      x: 51,
      y: 55,
      detail: 'Student satisfaction indices, course reviews & mentor comments',
      metric: '7% Score Weight',
    },
    {
      id: 'skills',
      name: 'Skills',
      icon: Lightbulb,
      x: 72,
      y: 25,
      detail: 'Verified technical competencies, coding proficiencies & soft skills',
      metric: '10% Score Weight',
    },
    {
      id: 'placement',
      name: 'Placement',
      icon: Briefcase,
      x: 90,
      y: 42,
      detail: 'Aptitude benchmarks, DSA coding tests & mock interview ratings',
      metric: '20% Score Weight',
    },
  ];

  // SVG curved connecting paths between nodes
  const connections = [
    { from: 'academics', to: 'attendance' },
    { from: 'attendance', to: 'engagement' },
    { from: 'attendance', to: 'lms' },
    { from: 'engagement', to: 'feedback' },
    { from: 'engagement', to: 'skills' },
    { from: 'feedback', to: 'lms' },
    { from: 'skills', to: 'placement' },
    { from: 'feedback', to: 'placement' },
  ];

  const getCoords = (id) => {
    const node = domains.find((d) => d.id === id);
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
      {/* SVG Connecting Arc Network */}
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
          <linearGradient id="arcGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#258BFA" stopOpacity="0.3" />
            <stop offset="50%" stopColor="#38BDF8" stopOpacity="0.75" />
            <stop offset="100%" stopColor="#1677D2" stopOpacity="0.4" />
          </linearGradient>
        </defs>

        {connections.map((c, i) => {
          const start = getCoords(c.from);
          const end = getCoords(c.to);
          const isHighlighted =
            activeDomain === c.from || activeDomain === c.to;

          // Quadratic bezier curve midpoint
          const midX = (start.x + end.x) / 2;
          const midY = (start.y + end.y) / 2 - 8;

          return (
            <path
              key={`conn-${i}`}
              d={`M ${start.x} ${start.y} Q ${midX} ${midY} ${end.x} ${end.y}`}
              fill="none"
              stroke={isHighlighted ? '#38BDF8' : 'url(#arcGlow)'}
              strokeWidth={isHighlighted ? '0.8' : '0.4'}
              strokeDasharray={isHighlighted ? 'none' : '2, 1.5'}
              style={{
                transition: 'all 0.3s ease',
                filter: isHighlighted ? 'drop-shadow(0 0 4px #258BFA)' : 'none',
              }}
            />
          );
        })}
      </svg>

      {/* Floating Circular Nodes */}
      {domains.map((domain) => {
        const IconComponent = domain.icon;
        const isSelected = activeDomain === domain.id;

        return (
          <div
            key={domain.id}
            onMouseEnter={() => setActiveDomain(domain.id)}
            onMouseLeave={() => setActiveDomain(null)}
            style={{
              position: 'absolute',
              left: `${domain.x}%`,
              top: `${domain.y}%`,
              transform: 'translate(-50%, -50%)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              cursor: 'pointer',
              zIndex: 10,
              transition: 'transform 0.25s ease',
            }}
          >
            {/* Circular Glass Icon Node */}
            <div
              style={{
                width: isSelected ? '50px' : '44px',
                height: isSelected ? '50px' : '44px',
                borderRadius: '50%',
                background: isSelected
                  ? 'radial-gradient(circle, #258BFA 0%, #082B56 100%)'
                  : 'radial-gradient(circle, rgba(37, 139, 250, 0.45) 0%, rgba(6, 26, 51, 0.85) 100%)',
                border: isSelected
                  ? '2px solid #FFFFFF'
                  : '1.5px solid rgba(37, 139, 250, 0.65)',
                boxShadow: isSelected
                  ? '0 0 24px rgba(37, 139, 250, 0.85), inset 0 0 10px rgba(255, 255, 255, 0.5)'
                  : '0 0 14px rgba(37, 139, 250, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#FFFFFF',
                transition: 'all 0.25s ease',
              }}
            >
              <IconComponent size={isSelected ? 24 : 20} />
            </div>

            {/* Label Underneath */}
            <span
              style={{
                marginTop: '6px',
                fontSize: '0.74rem',
                fontWeight: 600,
                letterSpacing: '0.03em',
                color: isSelected ? '#38BDF8' : 'rgba(255, 255, 255, 0.95)',
                textShadow: '0 2px 6px rgba(0, 0, 0, 0.8)',
                whiteSpace: 'nowrap',
                transition: 'color 0.2s ease',
              }}
            >
              {domain.name}
            </span>

            {/* Tooltip on Hover */}
            {isSelected && (
              <div
                style={{
                  position: 'absolute',
                  top: '100%',
                  marginTop: '12px',
                  backgroundColor: 'rgba(6, 26, 51, 0.95)',
                  border: '1px solid rgba(37, 139, 250, 0.5)',
                  borderRadius: 'var(--radius-sm)',
                  padding: '8px 12px',
                  boxShadow: '0 8px 24px rgba(0, 0, 0, 0.6)',
                  width: '210px',
                  textAlign: 'center',
                  backdropFilter: 'blur(8px)',
                  pointerEvents: 'none',
                  zIndex: 20,
                }}
              >
                <div style={{ color: '#FFFFFF', fontWeight: 600, fontSize: '0.8rem', marginBottom: '2px' }}>
                  {domain.name}
                </div>
                <div style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '0.72rem', lineHeight: 1.35 }}>
                  {domain.detail}
                </div>
                <div style={{ color: 'var(--color-blue-bright)', fontSize: '0.68rem', fontWeight: 600, marginTop: '4px' }}>
                  {domain.metric}
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

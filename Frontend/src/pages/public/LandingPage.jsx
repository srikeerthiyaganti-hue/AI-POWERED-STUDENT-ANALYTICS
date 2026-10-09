import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  BarChart2,
  Users2,
  Compass,
  FileCheck2,
  TrendingUp,
  Award,
  Layers,
  GraduationCap,
  Briefcase,
  AlertTriangle,
  CheckCircle2,
  Search,
  Database,
  Cpu,
  Target,
  UserCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import PublicNavbar from '../../components/layout/PublicNavbar';
import PublicFooter from '../../components/layout/PublicFooter';
import DomainConstellation from '../../components/landing/DomainConstellation';
import Campus3DExperience from '../../components/landing/Campus3DExperience';
import { useAuth } from '../../context/AuthContext';

export default function LandingPage() {
  const navigate = useNavigate();
  const { loginWithDemo } = useAuth();

  const handleLaunchRole = (roleKey) => {
    loginWithDemo(roleKey);
    navigate(roleKey === 'student' ? '/student/dashboard' : '/institution/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-navy-deep)' }}>
      {/* Top Navigation */}
      <PublicNavbar />

      {/* =========================================================================
          HERO SECTION — CODEBUFFET 3D CAMPUS INTELLIGENCE
          ========================================================================= */}
      <section
        style={{
          position: 'relative',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
          backgroundImage: `linear-gradient(to right, rgba(6, 26, 51, 0.94) 30%, rgba(6, 26, 51, 0.65) 60%, rgba(6, 26, 51, 0.85) 100%), url('/assets/images/codebuffet_campus_entrance.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center 40%',
          backgroundRepeat: 'no-repeat',
          padding: '4rem 1.5rem',
          overflow: 'hidden',
          borderBottom: '1px solid rgba(228, 233, 240, 0.1)',
        }}
      >
        <div
          style={{
            maxWidth: '1320px',
            margin: '0 auto',
            width: '100%',
            display: 'grid',
            gridTemplateColumns: '1.05fr 1.15fr',
            gap: '3rem',
            alignItems: 'center',
            position: 'relative',
            zIndex: 2,
          }}
          className="hero-grid"
        >
          {/* Left Column: Hero Copy & Actions */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
            {/* Eyebrow */}
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '0.78rem',
                fontWeight: 600,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                color: 'rgba(255, 255, 255, 0.75)',
                marginBottom: '1.25rem',
              }}
            >
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>—</span>
              <span>STUDENT SUCCESS INTELLIGENCE</span>
              <span style={{ color: 'var(--color-blue-bright)' }}>·</span>
              <span>BUILT FOR CAMPUS IMPACT</span>
              <span style={{ color: 'rgba(255,255,255,0.4)' }}>—</span>
            </div>

            {/* Headline */}
            <h1
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'clamp(2.75rem, 5.5vw, 4.25rem)',
                fontWeight: 700,
                lineHeight: 1.08,
                letterSpacing: '-0.02em',
                color: '#FFFFFF',
                marginBottom: '1.5rem',
              }}
            >
              Every Student <br />
              Has <span style={{ color: 'var(--color-blue-bright)' }}>Potential.</span>
            </h1>

            {/* Supporting Text */}
            <p
              style={{
                fontSize: 'clamp(1rem, 1.25vw, 1.125rem)',
                lineHeight: 1.65,
                color: 'rgba(255, 255, 255, 0.82)',
                maxWidth: '520px',
                marginBottom: '2.5rem',
                fontWeight: 400,
              }}
            >
              Unify academic performance, attendance, learning activity, engagement, skills, feedback and placement readiness into clear insights that help every student move forward.
            </p>

            {/* Action Buttons */}
            <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
              <Link
                to="/login"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '10px',
                  backgroundColor: 'var(--color-blue-primary)',
                  color: '#FFFFFF',
                  padding: '0.9rem 1.85rem',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.95rem',
                  fontWeight: 700,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  boxShadow: '0 4px 14px rgba(22, 119, 210, 0.45)',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-blue-bright)';
                  e.currentTarget.style.boxShadow = '0 6px 20px rgba(37, 139, 250, 0.6)';
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'var(--color-blue-primary)';
                  e.currentTarget.style.boxShadow = '0 4px 14px rgba(22, 119, 210, 0.45)';
                  e.currentTarget.style.transform = 'translateY(0)';
                }}
              >
                <span>Explore the Platform</span>
                <ArrowRight size={18} />
              </Link>

              <a
                href="#how-it-works"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: 'rgba(255, 255, 255, 0.9)',
                  fontSize: '0.95rem',
                  fontWeight: 500,
                  textDecoration: 'none',
                  borderBottom: '1px solid var(--color-blue-bright)',
                  paddingBottom: '2px',
                  transition: 'color var(--transition-fast)',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--color-blue-bright)')}
                onMouseLeave={(e) => (e.currentTarget.style.color = 'rgba(255, 255, 255, 0.9)')}
              >
                <span>See How It Works</span>
                <ArrowRight size={15} style={{ color: 'var(--color-blue-bright)' }} />
              </a>
            </div>
          </div>

          {/* Right Column: 7-Domain Constellation & Architectural Badge */}
          <div
            style={{
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              minHeight: '440px',
            }}
          >
            {/* Architectural Building Inscription Badge */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                right: '1rem',
                backgroundColor: 'rgba(6, 26, 51, 0.75)',
                border: '1px solid rgba(228, 233, 240, 0.2)',
                borderRadius: 'var(--radius-sm)',
                padding: '6px 12px',
                fontSize: '0.68rem',
                letterSpacing: '0.12em',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.75)',
                textTransform: 'uppercase',
                backdropFilter: 'blur(6px)',
                zIndex: 5,
              }}
            >
              LEARN • GROW • INNOVATE • BELONG
            </div>

            {/* Interactive 7-Domain Constellation */}
            <DomainConstellation />

            {/* Interactive hint */}
            <div
              style={{
                marginTop: '1rem',
                textAlign: 'center',
                fontSize: '0.78rem',
                color: 'rgba(255, 255, 255, 0.6)',
              }}
            >
              Hover over any domain node to explore its indicators and weight contribution
            </div>
          </div>
        </div>

        {/* Responsive CSS */}
        <style>{`
          @media (max-width: 980px) {
            .hero-grid {
              grid-template-columns: 1fr !important;
              gap: 2.5rem !important;
            }
          }
        `}</style>
      </section>

      {/* =========================================================================
          3D CAMPUS EXPERIENCE SHOWCASE — Interactive Digital Twin
          ========================================================================= */}
      <section
        style={{
          padding: '4rem 1.5rem 5rem',
          backgroundColor: '#071224',
          position: 'relative',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '780px', margin: '0 auto 2.5rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '4px 14px',
                borderRadius: '9999px',
                backgroundColor: 'rgba(30, 107, 255, 0.18)',
                border: '1px solid rgba(56, 189, 248, 0.35)',
                color: '#38BDF8',
                fontSize: '0.78rem',
                fontWeight: 700,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                marginBottom: '1rem',
              }}
            >
              <Compass size={14} />
              <span>3D Interactive Campus Experience</span>
            </div>
            <h2
              style={{
                fontSize: 'clamp(1.85rem, 3.2vw, 2.65rem)',
                fontWeight: 800,
                color: '#FFFFFF',
                letterSpacing: '-0.02em',
                lineHeight: 1.15,
                marginBottom: '0.85rem',
              }}
            >
              Explore the CODEBUFFET Connected Campus
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '1.02rem', lineHeight: 1.6 }}>
              Move your mouse to experience the 3D perspective shift. Click campus buildings to reveal live departmental telemetry, Student Success benchmarks, and predictive intervention corridors.
            </p>
          </div>

          <Campus3DExperience onExploreClick={() => navigate('/institution/dashboard')} />
        </div>
      </section>

      {/* =========================================================================
          SECTION 1: PLATFORM OVERVIEW
          ========================================================================= */}
      <section
        id="platform"
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--color-navy)',
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(228, 233, 240, 0.08)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 3.5rem' }}>
            <span
              style={{
                fontSize: '0.78rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-blue-bright)',
                fontWeight: 700,
              }}
            >
              PLATFORM OVERVIEW
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.35rem)',
                fontWeight: 700,
                marginTop: '0.5rem',
                marginBottom: '1rem',
                color: '#FFFFFF',
              }}
            >
              Higher Education Intelligence, Reimagined
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '1rem', lineHeight: 1.6 }}>
              CODEBUFFET bridges the gap between institutional administrative databases and student career outcomes. By unifying seven student-data domains into explainable metrics, universities can intervene early while students gain agency over their personal trajectory.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
            }}
          >
            <div
              style={{
                backgroundColor: 'rgba(6, 26, 51, 0.6)',
                border: '1px solid rgba(228, 233, 240, 0.12)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(37, 139, 250, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--color-blue-bright)',
                  marginBottom: '1rem',
                }}
              >
                <Database size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                7-Domain Unification
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Eliminates information silos between ERP marks, biometric attendance, Moodle LMS activities, coding test platforms, and placement trackers.
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(6, 26, 51, 0.6)',
                border: '1px solid rgba(228, 233, 240, 0.12)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#10B981',
                  marginBottom: '1rem',
                }}
              >
                <Cpu size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                Explainable Readiness Scoring
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Calculates a transparent composite Success Score (0–100) where every factor contribution is explicit. Missing data is never defaulted to zero.
              </p>
            </div>

            <div
              style={{
                backgroundColor: 'rgba(6, 26, 51, 0.6)',
                border: '1px solid rgba(228, 233, 240, 0.12)',
                borderRadius: 'var(--radius-md)',
                padding: '2rem',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#F59E0B',
                  marginBottom: '1rem',
                }}
              >
                <Target size={22} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 600, color: '#FFFFFF', marginBottom: '0.5rem' }}>
                Decoupled Risk Intelligence
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: '0.88rem', lineHeight: 1.6 }}>
                Evaluates Academic Risk and Placement Risk independently, ensuring students who excel academically but struggle with coding tests receive tailored preparation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 2: SEVEN DATA DOMAINS IN-DEPTH
          ========================================================================= */}
      <section
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--color-navy-deep)',
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(228, 233, 240, 0.08)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
            <span
              style={{
                fontSize: '0.78rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-blue-bright)',
                fontWeight: 700,
              }}
            >
              SEVEN STUDENT-DATA DOMAINS
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.35rem)',
                fontWeight: 700,
                marginTop: '0.5rem',
                marginBottom: '1rem',
                color: '#FFFFFF',
              }}
            >
              Comprehensive 360° Student Diagnostics
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '1rem', lineHeight: 1.6 }}>
              CODEBUFFET maps indicators across seven vital dimensions to construct an actionable, holistic profile of every learner.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                title: '1. Academics',
                weight: '30% Weight',
                desc: 'Internal marks, semester SGPA/CGPA progression, historical backlogs, and subject-level trends.',
                icon: GraduationCap,
                color: 'var(--color-blue-bright)',
              },
              {
                title: '2. Attendance',
                weight: '15% Weight',
                desc: 'Overall and subject-wise attendance tracking with early statutory 75% alerts and absence streak detection.',
                icon: BarChart2,
                color: '#10B981',
              },
              {
                title: '3. LMS Activity',
                weight: '10% Weight',
                desc: 'Weekly platform logins, digital assignment submission timeliness, and online learning video completion.',
                icon: Layers,
                color: '#8B5CF6',
              },
              {
                title: '4. Engagement',
                weight: '8% Weight',
                desc: 'Student club participation, leadership roles, campus event attendance, and hackathon projects.',
                icon: Users2,
                color: '#EC4899',
              },
              {
                title: '5. Placement Readiness',
                weight: '20% Weight',
                desc: 'Quantitative aptitude benchmarks, DSA coding assessments, and mock technical/HR interview evaluations.',
                icon: Briefcase,
                color: '#F59E0B',
              },
              {
                title: '6. Skills',
                weight: '10% Weight',
                desc: 'Verified technical skill proficiencies, programming languages, and validated soft-skill endorsements.',
                icon: Award,
                color: '#06B6D4',
              },
              {
                title: '7. Feedback',
                weight: '7% Weight',
                desc: 'Student satisfaction indices, course experience ratings, and faculty mentoring guidance reviews.',
                icon: Compass,
                color: '#3B82F6',
              },
            ].map((card) => {
              const IconComp = card.icon;
              return (
                <div
                  key={card.title}
                  style={{
                    backgroundColor: 'rgba(8, 43, 86, 0.65)',
                    border: '1px solid rgba(228, 233, 240, 0.12)',
                    borderRadius: 'var(--radius-md)',
                    padding: '1.75rem',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.85rem',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(37, 139, 250, 0.5)';
                    e.currentTarget.style.transform = 'translateY(-3px)';
                    e.currentTarget.style.boxShadow = '0 8px 24px rgba(6, 26, 51, 0.4)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'rgba(228, 233, 240, 0.12)';
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: 'var(--radius-sm)',
                        backgroundColor: 'rgba(37, 139, 250, 0.15)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: card.color,
                      }}
                    >
                      <IconComp size={22} />
                    </div>
                    <span
                      style={{
                        fontSize: '0.74rem',
                        fontWeight: 600,
                        padding: '3px 8px',
                        borderRadius: 'var(--radius-full)',
                        backgroundColor: 'rgba(255, 255, 255, 0.08)',
                        color: 'rgba(255, 255, 255, 0.85)',
                      }}
                    >
                      {card.weight}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: '#FFFFFF' }}>{card.title}</h3>
                  <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.7)', lineHeight: 1.55 }}>
                    {card.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 3: HOW CODEBUFFET WORKS — INTEGRATE → ANALYZE → ACT
          ========================================================================= */}
      <section
        id="how-it-works"
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--color-navy)',
          color: '#FFFFFF',
          borderBottom: '1px solid rgba(228, 233, 240, 0.08)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
            <span
              style={{
                fontSize: '0.78rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-blue-bright)',
                fontWeight: 700,
              }}
            >
              OPERATIONAL WORKFLOW
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.35rem)',
                fontWeight: 700,
                marginTop: '0.5rem',
                marginBottom: '1rem',
                color: '#FFFFFF',
              }}
            >
              How CODEBUFFET Works: Integrate → Analyze → Act
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '1rem', lineHeight: 1.6 }}>
              A straightforward, transparent 3-stage intelligence cycle from raw campus data ingestion to measurable student remediation.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              position: 'relative',
            }}
          >
            {/* Step 1: Integrate */}
            <div
              style={{
                backgroundColor: 'rgba(6, 26, 51, 0.65)',
                border: '1px solid rgba(228, 233, 240, 0.12)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(37, 139, 250, 0.15)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  color: 'var(--color-blue-bright)',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  width: 'fit-content',
                  marginBottom: '1.25rem',
                }}
              >
                <span>STEP 01</span>
                <span>•</span>
                <span>INGESTION</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem' }}>
                1. Integrate & Normalize
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                Feeds data from campus ERPs, LMS portals, biometric devices, and coding test platforms. Validates record completeness and identifies missing fields dynamically.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 'auto 0 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--color-blue-bright)' }} />
                  <span>Real-time CSV validation & schema checking</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: 'var(--color-blue-bright)' }} />
                  <span>Dynamic weight redistribution for missing data</span>
                </li>
              </ul>
            </div>

            {/* Step 2: Analyze */}
            <div
              style={{
                backgroundColor: 'rgba(6, 26, 51, 0.65)',
                border: '1px solid rgba(228, 233, 240, 0.12)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(16, 185, 129, 0.15)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  color: '#10B981',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  width: 'fit-content',
                  marginBottom: '1.25rem',
                }}
              >
                <span>STEP 02</span>
                <span>•</span>
                <span>INTELLIGENCE</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem' }}>
                2. Analyze & Decouple
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                Computes explainable composite Success Scores and independently assesses Academic Risk vs. Placement Risk. Maps students onto the 2x2 Segmentation Matrix.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 'auto 0 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: '#10B981' }} />
                  <span>Decoupled risk engines with diagnostic root causes</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: '#10B981' }} />
                  <span>4-quadrant student segmentation matrix</span>
                </li>
              </ul>
            </div>

            {/* Step 3: Act */}
            <div
              style={{
                backgroundColor: 'rgba(6, 26, 51, 0.65)',
                border: '1px solid rgba(228, 233, 240, 0.12)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.25rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(245, 158, 11, 0.15)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  color: '#F59E0B',
                  fontSize: '0.78rem',
                  fontWeight: 700,
                  width: 'fit-content',
                  marginBottom: '1.25rem',
                }}
              >
                <span>STEP 03</span>
                <span>•</span>
                <span>ACTION</span>
              </div>
              <h3 style={{ fontSize: '1.4rem', fontWeight: 700, color: '#FFFFFF', marginBottom: '0.75rem' }}>
                3. Act & Empower
              </h3>
              <p style={{ color: 'rgba(255, 255, 255, 0.72)', fontSize: '0.9rem', lineHeight: 1.65, marginBottom: '1.5rem' }}>
                Enables faculty to assign targeted mentorship interventions while students track their own readiness, complete remedial tasks, and access AI-curated roadmaps.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 'auto 0 0', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.84rem', color: 'rgba(255,255,255,0.85)' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: '#F59E0B' }} />
                  <span>Mentorship logging & intervention tracking</span>
                </li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <CheckCircle2 size={15} style={{ color: '#F59E0B' }} />
                  <span>Personal student cockpit & recommendations</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 4: INSTITUTION & STUDENT PORTAL BENEFITS
          ========================================================================= */}
      <section
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: '#FFFFFF',
          color: 'var(--color-navy)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 3.5rem' }}>
            <span
              style={{
                fontSize: '0.78rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-blue-primary)',
                fontWeight: 700,
              }}
            >
              PORTAL CAPABILITIES
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.35rem)',
                fontWeight: 700,
                marginTop: '0.5rem',
                marginBottom: '1rem',
                color: 'var(--color-navy)',
              }}
            >
              Tailored Portals for Campus Leaders and Students
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
              CODEBUFFET serves both administrative and learner needs with specialized interfaces designed for distinct campus workflows.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
              gap: '2.5rem',
            }}
          >
            {/* Column 1: Institution Portal Benefits */}
            <div
              style={{
                backgroundColor: 'var(--color-bg-page)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'var(--color-blue-surface)',
                  color: 'var(--color-blue-primary)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                }}
              >
                <span>INSTITUTION PORTAL</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.75rem' }}>
                For Administrators, Faculty & Placement Officers
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Actionable cohort intelligence to detect early attrition risks, track intervention outcomes, and boost institutional placement metrics.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
                {[
                  'Campus-wide KPI cockpit with department breakdowns',
                  'Student Directory with faceted search, risk filters, and sorting',
                  'Individual Student 360° deep-dive profile across all 7 domains',
                  'Decoupled Academic Risk vs. Placement Risk views',
                  '2x2 Academic Performance × Placement Readiness matrix',
                  'Intervention workflow manager with mentorship logging',
                  'Client-side CSV report export and data integration health',
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ color: 'var(--color-blue-primary)', marginTop: '2px' }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <span style={{ color: 'var(--color-text-main)', lineHeight: 1.45 }}>{item}</span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '2rem' }}>
                <button
                  onClick={() => handleLaunchRole('admin')}
                  style={{
                    backgroundColor: 'var(--color-blue-primary)',
                    color: '#FFFFFF',
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Explore Institution Portal</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>

            {/* Column 2: Student Portal Benefits */}
            <div
              style={{
                backgroundColor: 'var(--color-bg-page)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '2.5rem',
              }}
            >
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  backgroundColor: 'rgba(13, 148, 136, 0.12)',
                  color: 'var(--color-status-success)',
                  padding: '4px 10px',
                  borderRadius: 'var(--radius-full)',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginBottom: '1rem',
                }}
              >
                <span>STUDENT PORTAL</span>
              </div>
              <h3 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-navy)', marginBottom: '0.75rem' }}>
                For Individual Students & Learners
              </h3>
              <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Personalized transparency to understand personal readiness, track statutory attendance, and target skill deficits before placement drives.
              </p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1rem', fontSize: '0.88rem' }}>
                {[
                  'Personal Success Score with transparent factor attribution',
                  'Independent Academic Standing and Placement Readiness indicators',
                  'Verified Academic Record and technical skill ledger',
                  'Longitudinal attendance tracker with statutory 75% markers',
                  'AI-curated learning roadmaps, coding practice, and certifications',
                  'Assigned faculty mentorship tasks with progress completion',
                  'Course experience and faculty mentorship feedback submission',
                ].map((item, idx) => (
                  <li key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                    <div style={{ color: 'var(--color-status-success)', marginTop: '2px' }}>
                      <CheckCircle2 size={16} />
                    </div>
                    <span style={{ color: 'var(--color-text-main)', lineHeight: 1.45 }}>{item}</span>
                  </li>
                ))}
              </ul>
              <div style={{ marginTop: '2rem' }}>
                <button
                  onClick={() => handleLaunchRole('student')}
                  style={{
                    backgroundColor: 'var(--color-navy)',
                    color: '#FFFFFF',
                    padding: '0.75rem 1.25rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    border: 'none',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <span>Explore Student Experience</span>
                  <ArrowRight size={15} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 5: EXPLAINABLE SUCCESS SCORE & SEPARATE RISK INDICATORS
          ========================================================================= */}
      <section
        id="insights"
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: '#FFFFFF',
          color: 'var(--color-navy)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '760px', margin: '0 auto 3.5rem' }}>
            <span
              style={{
                fontSize: '0.78rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-blue-primary)',
                fontWeight: 700,
              }}
            >
              RESPONSIBLE ANALYTICS METHODOLOGY
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.35rem)',
                fontWeight: 700,
                marginTop: '0.5rem',
                marginBottom: '1rem',
                color: 'var(--color-navy)',
              }}
            >
              Decoupled Risk Engines & Explainable Intelligence
            </h2>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '1rem', lineHeight: 1.6 }}>
              Academic Risk and Placement Risk require distinct institutional responses. CODEBUFFET evaluates them independently, ensuring support is precisely targeted.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
              gap: '2rem',
              alignItems: 'stretch',
            }}
          >
            {/* Box 1: Academic Risk Engine */}
            <div
              style={{
                backgroundColor: 'var(--color-bg-page)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(217, 119, 6, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-status-warning)',
                  }}
                >
                  <AlertTriangle size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                    Academic Risk Engine
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    Curriculum & Attendance Health
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Monitors course comprehension, CGPA trends, active backlogs, and statutory 75% attendance criteria. Triggers faculty mentoring and subject-specific tutoring.
              </p>
              <div
                style={{
                  marginTop: 'auto',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--color-navy)', marginBottom: '6px' }}>
                  Illustrative Diagnostic Alert:
                </div>
                <div style={{ color: 'var(--color-status-danger)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>⚠️</span>
                  <span>Attendance dropped below statutory 75% in Data Structures</span>
                </div>
              </div>
            </div>

            {/* Box 2: Placement Risk Engine */}
            <div
              style={{
                backgroundColor: 'var(--color-bg-page)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(22, 119, 210, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-blue-primary)',
                  }}
                >
                  <Briefcase size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                    Placement Readiness Engine
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    Hiring Benchmark Diagnostics
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Evaluates quantitative aptitude, algorithmic coding speed, and mock HR/technical interviews. Triggers coding bootcamps and communication workshops.
              </p>
              <div
                style={{
                  marginTop: 'auto',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ fontWeight: 600, color: 'var(--color-navy)', marginBottom: '6px' }}>
                  Illustrative Diagnostic Alert:
                </div>
                <div style={{ color: 'var(--color-status-warning)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span>🎯</span>
                  <span>DSA Coding benchmark (44%) below Tier-1 eligibility (65%)</span>
                </div>
              </div>
            </div>

            {/* Box 3: Explainable Success Score & Non-Zero Rule */}
            <div
              style={{
                backgroundColor: 'var(--color-bg-page)',
                border: '1px solid var(--color-border)',
                borderRadius: 'var(--radius-lg)',
                padding: '2rem',
                display: 'flex',
                flexDirection: 'column',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1rem' }}>
                <div
                  style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: 'rgba(13, 148, 136, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'var(--color-status-success)',
                  }}
                >
                  <CheckCircle2 size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--color-navy)' }}>
                    Non-Zero Missing Data Rule
                  </h3>
                  <span style={{ fontSize: '0.78rem', color: 'var(--color-text-secondary)' }}>
                    Ethical Mathematical Invariant
                  </span>
                </div>
              </div>
              <p style={{ fontSize: '0.9rem', color: 'var(--color-text-secondary)', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                Missing ERP feeds are never penalized as zero. Weights are dynamically reallocated among valid domains, accompanied by a transparent Data Completeness metric.
              </p>
              <div
                style={{
                  marginTop: 'auto',
                  backgroundColor: '#FFFFFF',
                  borderRadius: 'var(--radius-sm)',
                  padding: '1rem',
                  border: '1px solid var(--color-border)',
                  fontSize: '0.82rem',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--color-navy)' }}>Data Completeness:</span>
                  <span style={{ color: 'var(--color-blue-primary)', fontWeight: 700 }}>92% Active</span>
                </div>
                <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--color-border)', borderRadius: '3px' }}>
                  <div style={{ width: '92%', height: '100%', backgroundColor: 'var(--color-blue-primary)', borderRadius: '3px' }} />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 6: 1-CLICK DEMO PERSONAS GATEWAY
          ========================================================================= */}
      <section
        id="portals"
        style={{
          padding: '5rem 1.5rem',
          backgroundColor: 'var(--color-navy-deep)',
          color: '#FFFFFF',
          borderTop: '1px solid rgba(228, 233, 240, 0.1)',
        }}
      >
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
          <div style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto 3.5rem' }}>
            <span
              style={{
                fontSize: '0.78rem',
                letterSpacing: '0.12em',
                textTransform: 'uppercase',
                color: 'var(--color-blue-bright)',
                fontWeight: 700,
              }}
            >
              EXPERIENCE THE PLATFORM
            </span>
            <h2
              style={{
                fontSize: 'clamp(1.75rem, 3vw, 2.35rem)',
                fontWeight: 700,
                marginTop: '0.5rem',
                marginBottom: '1rem',
                color: '#FFFFFF',
              }}
            >
              Test Real Institutional Workflows
            </h2>
            <p style={{ color: 'rgba(255, 255, 255, 0.75)', fontSize: '1rem', lineHeight: 1.6 }}>
              Select a demo role below to immediately experience the platform from that stakeholder's vantage point.
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
              gap: '1.5rem',
            }}
          >
            {[
              {
                key: 'admin',
                roleTitle: 'Institution Administrator',
                name: 'Dr. Sunita Rao',
                tag: 'Provost / Dean',
                features: 'Campus KPI dashboard, 7-domain data integration, department risk heatmaps & accreditation reports.',
                btnText: 'Launch Admin View →',
              },
              {
                key: 'faculty',
                roleTitle: 'Faculty Mentor',
                name: 'Prof. Rajesh Kumar',
                tag: 'Computer Science & Engg.',
                features: 'Student Directory, early academic warning alerts, 1-on-1 intervention logging & attendance tracking.',
                btnText: 'Launch Mentor View →',
              },
              {
                key: 'placement',
                roleTitle: 'Placement Officer (TPO)',
                name: 'Vikram Malhotra',
                tag: 'Corporate Relations',
                features: '2x2 Segmentation matrix, coding benchmarks, company eligibility filters & CSV roster exports.',
                btnText: 'Launch TPO View →',
              },
              {
                key: 'student',
                roleTitle: 'Student Experience',
                name: 'Aarav Sharma',
                tag: '3rd Year B.Tech CSE',
                features: 'Personal Success Score, progress tracking, AI-curated skill recommendations & feedback submission.',
                btnText: 'Launch Student Portal →',
              },
            ].map((persona) => (
              <div
                key={persona.key}
                style={{
                  backgroundColor: 'rgba(8, 43, 86, 0.55)',
                  border: '1px solid rgba(228, 233, 240, 0.15)',
                  borderRadius: 'var(--radius-md)',
                  padding: '2rem 1.5rem',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '1rem',
                  transition: 'all var(--transition-fast)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = 'var(--color-blue-bright)';
                  e.currentTarget.style.boxShadow = '0 8px 24px rgba(37, 139, 250, 0.25)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(228, 233, 240, 0.15)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div>
                  <span
                    style={{
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: 'var(--color-blue-bright)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.06em',
                    }}
                  >
                    {persona.tag}
                  </span>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#FFFFFF', marginTop: '4px' }}>
                    {persona.roleTitle}
                  </h3>
                  <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginTop: '2px' }}>
                    Demo Persona: {persona.name}
                  </div>
                </div>

                <p style={{ fontSize: '0.86rem', color: 'rgba(255, 255, 255, 0.65)', lineHeight: 1.55 }}>
                  {persona.features}
                </p>

                <button
                  onClick={() => handleLaunchRole(persona.key)}
                  style={{
                    marginTop: 'auto',
                    backgroundColor: 'rgba(37, 139, 250, 0.15)',
                    border: '1px solid var(--color-blue-bright)',
                    color: '#FFFFFF',
                    padding: '0.65rem 1rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all var(--transition-fast)',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = 'var(--color-blue-primary)')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'rgba(37, 139, 250, 0.15)')}
                >
                  {persona.btnText}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SECTION 7: FINAL CALL TO ACTION
          ========================================================================= */}
      <section
        style={{
          padding: '4.5rem 1.5rem',
          backgroundColor: 'var(--color-navy)',
          textAlign: 'center',
          borderTop: '1px solid rgba(228, 233, 240, 0.1)',
        }}
      >
        <div style={{ maxWidth: '780px', margin: '0 auto' }}>
          <h2
            style={{
              fontFamily: 'var(--font-serif)',
              fontSize: 'clamp(2rem, 3.5vw, 2.75rem)',
              color: '#FFFFFF',
              fontWeight: 700,
              marginBottom: '1rem',
            }}
          >
            Ready to empower your campus with explainable intelligence?
          </h2>
          <p style={{ color: 'rgba(255, 255, 255, 0.8)', fontSize: '1.05rem', lineHeight: 1.6, marginBottom: '2rem' }}>
            Experience CODEBUFFET today with interactive simulated cohorts, or test individual student workflows.
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
            <Link
              to="/login"
              style={{
                backgroundColor: 'var(--color-blue-primary)',
                color: '#FFFFFF',
                padding: '0.85rem 1.85rem',
                borderRadius: 'var(--radius-sm)',
                fontSize: '0.95rem',
                fontWeight: 600,
                textDecoration: 'none',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                boxShadow: '0 4px 12px rgba(22, 119, 210, 0.35)',
              }}
            >
              <span>Access Login Gateway</span>
              <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}

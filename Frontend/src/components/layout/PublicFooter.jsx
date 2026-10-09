import React from 'react';
import { Link } from 'react-router-dom';
import BrandLogo from '../common/BrandLogo';
import { Shield, Sparkles, BookOpen, ExternalLink, Award, CheckCircle } from 'lucide-react';

export default function PublicFooter() {
  return (
    <footer
      style={{
        backgroundColor: 'var(--color-navy-deep)',
        color: 'rgba(255, 255, 255, 0.75)',
        borderTop: '1px solid rgba(228, 233, 240, 0.1)',
        padding: '3.5rem 1.5rem 2rem',
        marginTop: 'auto',
      }}
    >
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '2.5rem',
          marginBottom: '2.5rem',
        }}
      >
        {/* Column 1: Brand & Identity */}
        <div>
          <BrandLogo variant="dark" showTagline={true} />
          <p
            style={{
              marginTop: '1rem',
              fontSize: '0.88rem',
              lineHeight: 1.6,
              color: 'rgba(255, 255, 255, 0.65)',
              maxWidth: '340px',
            }}
          >
            <strong>Insights Today | Brighter Tomorrow</strong>. Unifying multidimensional student records into transparent, explainable intelligence that empowers universities and students.
          </p>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '1.25rem',
              padding: '5px 12px',
              borderRadius: 'var(--radius-full)',
              backgroundColor: 'rgba(30, 107, 255, 0.18)',
              border: '1px solid rgba(56, 189, 248, 0.35)',
              fontSize: '0.74rem',
              color: 'var(--color-blue-bright)',
              fontWeight: 600,
            }}
          >
            <Sparkles size={13} />
            <span>AI-Powered Decision Intelligence Platform</span>
          </div>
        </div>

        {/* Column 2: Platform Capabilities */}
        <div>
          <h4
            style={{
              color: '#FFFFFF',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '1rem',
              letterSpacing: '0.02em',
            }}
          >
            7 Student Data Domains
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.86rem' }}>
            <li>1. Academic Performance & CGPA</li>
            <li>2. Attendance & Subject Consistency</li>
            <li>3. LMS Telemetry & Assignment Velocity</li>
            <li>4. Co-curricular & Event Engagement</li>
            <li>5. Placement Readiness & Coding Benchmarks</li>
            <li>6. Technical & Soft Skills Mastery</li>
            <li>7. Faculty Feedback & Disciplinary Insights</li>
          </ul>
        </div>

        {/* Column 3: Portals & Access */}
        <div>
          <h4
            style={{
              color: '#FFFFFF',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '1rem',
              letterSpacing: '0.02em',
            }}
          >
            Connected Portals
          </h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.65rem', fontSize: '0.86rem' }}>
            <li>
              <Link to="/institution/dashboard" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none' }}>
                Institution Dashboard (Admin View) →
              </Link>
            </li>
            <li>
              <Link to="/student/dashboard" style={{ color: 'rgba(255, 255, 255, 0.8)', textDecoration: 'none' }}>
                Student Experience Cockpit →
              </Link>
            </li>
            <li>
              <Link to="/login" style={{ color: 'var(--color-blue-bright)', textDecoration: 'none', fontWeight: 600 }}>
                1-Click Demo Persona Gateway →
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 4: Integrity & Compliance */}
        <div>
          <h4
            style={{
              color: '#FFFFFF',
              fontSize: '0.95rem',
              fontWeight: 600,
              marginBottom: '1rem',
              letterSpacing: '0.02em',
            }}
          >
            Responsible AI & Transparency
          </h4>
          <p style={{ fontSize: '0.82rem', lineHeight: 1.55, color: 'rgba(255,255,255,0.6)' }}>
            CODEBUFFET computes transparent, deterministic readiness scores with dynamic weight redistribution for missing attributes. Never black-box or opaque predictions.
          </p>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              marginTop: '1rem',
              fontSize: '0.78rem',
              color: 'rgba(255,255,255,0.5)',
            }}
          >
            <Shield size={14} />
            <span>Synthetic empirical cohorts • Zero PII exposure</span>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div
        style={{
          maxWidth: '1280px',
          margin: '0 auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '1rem',
          fontSize: '0.78rem',
          color: 'rgba(255, 255, 255, 0.5)',
        }}
      >
        <div>
          © {new Date().getFullYear()} CODEBUFFET Platform. Insights Today | Brighter Tomorrow. All rights reserved.
        </div>
        <div style={{ display: 'flex', gap: '1.5rem' }}>
          <span>Transparent Scoring Contract</span>
          <span>Intervention Sandbox</span>
          <span>Privacy & Security</span>
        </div>
      </div>
    </footer>
  );
}

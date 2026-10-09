import React from 'react';
import { Link } from 'react-router-dom';

export default function BrandLogo({ variant = 'dark', size = 'default', showTagline = true, to = '/' }) {
  // variant: 'dark' (for dark navy hero/headers) | 'light' (for light analytics backgrounds)
  const isDark = variant === 'dark';

  const iconSizes = {
    small: 30,
    default: 40,
    large: 54,
  };

  const iconDim = iconSizes[size] || iconSizes.default;

  return (
    <Link
      to={to}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: size === 'small' ? '8px' : '12px',
        textDecoration: 'none',
      }}
    >
      {/* CODEBUFFET 3D Cap & Book Emblem */}
      <svg
        width={iconDim}
        height={iconDim}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{
          flexShrink: 0,
          filter: isDark
            ? 'drop-shadow(0 0 10px rgba(56, 189, 248, 0.45))'
            : 'drop-shadow(0 2px 8px rgba(37, 99, 235, 0.25))',
        }}
      >
        <defs>
          <linearGradient id="cbBookLeft" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4F46E5" />
            <stop offset="100%" stopColor="#2563EB" />
          </linearGradient>
          <linearGradient id="cbBookRight" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="100%" stopColor="#0284C7" />
          </linearGradient>
          <linearGradient id="cbCapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>
          <linearGradient id="cbNeonGlow" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38BDF8" />
            <stop offset="50%" stopColor="#818CF8" />
            <stop offset="100%" stopColor="#C084FC" />
          </linearGradient>
        </defs>

        {/* Shadow Under Book */}
        <ellipse cx="32" cy="48" rx="24" ry="4" fill="#000000" fillOpacity={isDark ? "0.35" : "0.12"} />

        {/* Left Book Page */}
        <path d="M8 43C16 39.5 24 38.5 32 42V24C24 20.5 16 21.5 8 25Z" fill="url(#cbBookLeft)" />
        <path d="M12 28.5C18 26.5 24 26 30 27.5" stroke="#E0E7FF" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.8" />
        <path d="M12 33.5C18 31.5 24 31 30 32.5" stroke="#E0E7FF" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.8" />

        {/* Right Book Page */}
        <path d="M56 43C48 39.5 40 38.5 32 42V24C40 20.5 48 21.5 56 25Z" fill="url(#cbBookRight)" />
        <path d="M52 28.5C46 26.5 40 26 34 27.5" stroke="#E0F2FE" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.8" />
        <path d="M52 33.5C46 31.5 40 31 34 32.5" stroke="#E0F2FE" strokeWidth="1.2" strokeLinecap="round" strokeOpacity="0.8" />

        {/* Center Spine Glow */}
        <path d="M31.5 24V42.5" stroke="#67E8F9" strokeWidth="1.5" strokeLinecap="round" />

        {/* Mortarboard Skullcap & Rim */}
        <polygon points="21,19 32,24.5 43,19 43,22.5 32,28 21,22.5" fill="#0F172A" />
        <polygon points="32,6 54,15.5 32,24 10,15.5" fill="url(#cbCapGrad)" stroke="#38BDF8" strokeWidth="1.2" />

        {/* Tassel Button and Cord */}
        <circle cx="32" cy="15" r="1.6" fill="#FBBF24" />
        <path d="M32 15L48 21L49 27" stroke="#FBBF24" strokeWidth="1.4" strokeLinecap="round" />
        <circle cx="49" cy="27.5" r="1.3" fill="#F59E0B" />
      </svg>

      {/* Typography: CODEBUFFET */}
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', lineHeight: 1 }}>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 900,
              fontSize: size === 'small' ? '1.18rem' : size === 'large' ? '1.85rem' : '1.45rem',
              letterSpacing: '-0.02em',
              color: isDark ? '#FFFFFF' : '#0F172A',
            }}
          >
            CODE
          </span>
          <span
            style={{
              fontFamily: 'var(--font-sans)',
              fontWeight: 900,
              fontSize: size === 'small' ? '1.18rem' : size === 'large' ? '1.85rem' : '1.45rem',
              letterSpacing: '-0.02em',
              background: isDark
                ? 'linear-gradient(135deg, #38BDF8 0%, #818CF8 50%, #C084FC 100%)'
                : 'linear-gradient(135deg, #2563EB 0%, #4F46E5 50%, #7C3AED 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              marginLeft: '1px',
            }}
          >
            BUFFET
          </span>
        </div>

        {showTagline && (
          <span
            style={{
              fontSize: size === 'small' ? '0.52rem' : '0.62rem',
              letterSpacing: '0.12em',
              textTransform: 'uppercase',
              color: isDark ? 'rgba(255,255,255,0.72)' : '#64748B',
              fontWeight: 700,
              marginTop: '3px',
              whiteSpace: 'nowrap',
            }}
          >
            Student Success Intelligence Platform
          </span>
        )}
      </div>
    </Link>
  );
}

import React from 'react';
import { Link } from 'react-router-dom';
import { Home, ArrowLeft } from 'lucide-react';
import BrandLogo from '../components/common/BrandLogo';

export default function NotFoundPage() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'var(--color-bg-page)',
        padding: '2rem',
        textAlign: 'center',
      }}
    >
      <BrandLogo variant="light" size="large" />
      <div style={{ marginTop: '2rem', maxWidth: '480px' }}>
        <div style={{ fontSize: '5rem', fontWeight: 800, color: 'var(--color-navy)', lineHeight: 1 }}>
          404
        </div>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-navy)', margin: '1rem 0 0.5rem' }}>
          Page Not Found
        </h1>
        <p style={{ color: 'var(--color-text-secondary)', fontSize: '0.95rem', lineHeight: 1.5, marginBottom: '2rem' }}>
          The page or analytical view you are looking for does not exist or has been relocated.
        </p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: 'var(--color-blue-primary)',
              color: '#FFFFFF',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            <Home size={16} />
            <span>Return to Landing Page</span>
          </Link>
          <Link
            to="/login"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              backgroundColor: '#FFFFFF',
              border: '1px solid var(--color-border)',
              color: 'var(--color-navy)',
              padding: '0.75rem 1.25rem',
              borderRadius: 'var(--radius-sm)',
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: '0.9rem',
            }}
          >
            <ArrowLeft size={16} />
            <span>Go to Login</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

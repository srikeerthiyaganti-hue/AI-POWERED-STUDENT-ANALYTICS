import React, { useState, useEffect } from 'react';

// Coordinated academic color pairs for deterministic avatar fallback backgrounds
const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #1E3A8A 0%, #3B82F6 100%)', // Deep Blue
  'linear-gradient(135deg, #0F766E 0%, #14B8A6 100%)', // Teal Emerald
  'linear-gradient(135deg, #4338CA 0%, #6366F1 100%)', // Indigo
  'linear-gradient(135deg, #6B21A8 0%, #A855F7 100%)', // Purple
  'linear-gradient(135deg, #0369A1 0%, #0EA5E9 100%)', // Sky Blue
  'linear-gradient(135deg, #B45309 0%, #F59E0B 100%)', // Amber
  'linear-gradient(135deg, #BE123C 0%, #F43F5E 100%)', // Rose
  'linear-gradient(135deg, #15803D 0%, #22C55E 100%)', // Forest
  'linear-gradient(135deg, #374151 0%, #6B7280 100%)', // Slate
  'linear-gradient(135deg, #4C1D95 0%, #8B5CF6 100%)', // Violet
  'linear-gradient(135deg, #047857 0%, #10B981 100%)', // Mint Green
  'linear-gradient(135deg, #C2410C 0%, #FB923C 100%)', // Sunset Orange
  'linear-gradient(135deg, #9D174D 0%, #EC4899 100%)', // Pink Berry
  'linear-gradient(135deg, #1E40AF 0%, #60A5FA 100%)', // Royal Blue
  'linear-gradient(135deg, #164E63 0%, #06B6D4 100%)', // Ocean Cyan
  'linear-gradient(135deg, #312E81 0%, #818CF8 100%)', // Electric Indigo
];

function getInitials(name, id) {
  if (!name && !id) return 'ST';
  const cleanName = (name || '').trim();

  // Match "Student 00027" -> "S27"
  const studentMatch = cleanName.match(/^Student\s+(\d+)$/i);
  if (studentMatch) {
    const num = studentMatch[1];
    return `S${num.slice(-2)}`;
  }

  // Handle regular full names: "Ananya Verma" -> "AV"
  const parts = cleanName.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    const f = parts[0][0];
    const l = parts[parts.length - 1][0];
    if (f && l) return (f + l).toUpperCase();
  }

  if (parts.length === 1 && parts[0].length >= 2) {
    return parts[0].slice(0, 2).toUpperCase();
  }

  // Fallback to id: "STU-00027" -> "27"
  if (id) {
    const idMatch = String(id).match(/(\d{2,})$/);
    if (idMatch) return `S${idMatch[1].slice(-2)}`;
    return String(id).slice(0, 2).toUpperCase();
  }

  return 'ST';
}

function getGradient(key) {
  const str = String(key || 'student');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  const idx = Math.abs(hash) % AVATAR_GRADIENTS.length;
  return AVATAR_GRADIENTS[idx];
}

export default function StudentAvatar({
  src,
  name = 'Student',
  id = '',
  size = 32,
  className = '',
  style = {},
}) {
  const [hasError, setHasError] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
  }, [src]);

  const initials = getInitials(name, id);
  const background = getGradient(id || name);
  const fontSize = Math.max(10, Math.floor(size * 0.38));

  if (!src || hasError) {
    return (
      <div
        className={className}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          minWidth: `${size}px`,
          minHeight: `${size}px`,
          borderRadius: '50%',
          background,
          color: '#FFFFFF',
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: `${fontSize}px`,
          fontWeight: 700,
          letterSpacing: '0.02em',
          userSelect: 'none',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.12)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          flexShrink: 0,
          ...style,
        }}
        title={`${name} (${id})`}
        aria-label={`${name} avatar`}
      >
        {initials}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      loading="lazy"
      onError={() => setHasError(true)}
      className={className}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        minWidth: `${size}px`,
        minHeight: `${size}px`,
        borderRadius: '50%',
        objectFit: 'cover',
        boxShadow: '0 1px 2px rgba(0, 0, 0, 0.08)',
        border: '1px solid rgba(0, 0, 0, 0.05)',
        flexShrink: 0,
        ...style,
      }}
    />
  );
}

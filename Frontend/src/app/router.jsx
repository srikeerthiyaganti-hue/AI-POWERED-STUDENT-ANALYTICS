import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import CampusDashboard from '../pages/institution/CampusDashboard';
import MentorDashboard from '../pages/institution/MentorDashboard';
import PlacementDashboard from '../pages/institution/PlacementDashboard';
import StudentDashboard from '../pages/student/StudentDashboard';
import NotFoundPage from '../pages/NotFoundPage';
import { useAuth } from '../context/AuthContext';

/**
 * Route protection wrapper enforcing authentication and role-based permissions.
 */
function ProtectedRoute({ children, allowedRoles }) {
  const { currentUser, isAuthenticated } = useAuth();

  const user = currentUser || (() => {
    try {
      const stored = sessionStorage.getItem('codebuffet_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })();

  if (!isAuthenticated && !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    // Gracefully redirect user to their authorized dashboard
    if (user.role === 'student') {
      return <Navigate to="/student/dashboard" replace />;
    } else if (user.role === 'mentor') {
      return <Navigate to="/mentor/dashboard" replace />;
    } else if (user.role === 'tpo') {
      return <Navigate to="/placement/dashboard" replace />;
    }
    return <Navigate to="/institution/dashboard" replace />;
  }

  return children;
}

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Admin Institution Analytics Portal */}
      <Route
        path="/institution/dashboard"
        element={
          <ProtectedRoute allowedRoles={['admin']}>
            <CampusDashboard />
          </ProtectedRoute>
        }
      />

      {/* Faculty Mentor Portal */}
      <Route
        path="/mentor/dashboard"
        element={
          <ProtectedRoute allowedRoles={['mentor', 'admin']}>
            <MentorDashboard />
          </ProtectedRoute>
        }
      />
      <Route path="/mentor/*" element={<Navigate to="/mentor/dashboard" replace />} />

      {/* Placement Officer Portal */}
      <Route
        path="/placement/dashboard"
        element={
          <ProtectedRoute allowedRoles={['tpo', 'admin']}>
            <PlacementDashboard />
          </ProtectedRoute>
        }
      />

      {/* Student Personal Cockpit */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student', 'admin', 'mentor', 'tpo']}>
            <StudentDashboard />
          </ProtectedRoute>
        }
      />

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

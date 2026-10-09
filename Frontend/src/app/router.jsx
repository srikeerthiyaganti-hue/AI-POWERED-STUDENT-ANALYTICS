import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from '../pages/public/LandingPage';
import LoginPage from '../pages/public/LoginPage';
import CampusDashboard from '../pages/institution/CampusDashboard';
import StudentDashboard from '../pages/student/StudentDashboard';
import NotFoundPage from '../pages/NotFoundPage';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<LoginPage />} />

      {/* Institution Portal Preview Route */}
      <Route path="/institution/dashboard" element={<CampusDashboard />} />

      {/* Student Portal Preview Route */}
      <Route path="/student/dashboard" element={<StudentDashboard />} />

      {/* Catch-all 404 Route */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

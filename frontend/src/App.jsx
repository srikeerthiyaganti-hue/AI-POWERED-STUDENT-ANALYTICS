import React, { useState, useEffect, useCallback } from 'react';
import MainLayout from './layouts/MainLayout.jsx';
import DashboardHome from './pages/DashboardHome.jsx';
import RecommendationsView from './pages/RecommendationsView.jsx';
import InterventionsView from './pages/InterventionsView.jsx';
import StudentDetailModal from './components/StudentDetailModal.jsx';
import { checkBackendHealth } from './services/api.js';
import './App.css';

const VALID_VIEWS = ['dashboard', 'explorer', 'analytics', 'recommendations', 'interventions'];

export function App() {
  const [healthInfo, setHealthInfo] = useState(null);
  const [isOnline, setIsOnline] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);

  // Navigation view state: 'dashboard' | 'explorer' | 'analytics' | 'recommendations' | 'interventions'
  const [activeView, setActiveView] = useState(() => {
    if (typeof window !== 'undefined' && window.location.hash) {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (VALID_VIEWS.includes(hash)) {
        return hash;
      }
    }
    return 'dashboard';
  });

  const fetchHealth = useCallback(async () => {
    setIsLoading(true);
    const result = await checkBackendHealth();
    setIsOnline(result.isOnline);
    setHealthInfo(result.data);
    setError(result.error);
    setIsLoading(false);
  }, []);

  useEffect(() => {
    fetchHealth();
    // Periodically poll backend health every 15 seconds
    const interval = setInterval(fetchHealth, 15000);
    return () => clearInterval(interval);
  }, [fetchHealth]);

  // Synchronize hash with active view
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '').toLowerCase();
      if (VALID_VIEWS.includes(hash)) {
        setActiveView(hash);
      }
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (viewId) => {
    if (VALID_VIEWS.includes(viewId)) {
      setActiveView(viewId);
      if (typeof window !== 'undefined') {
        window.location.hash = `#${viewId}`;
      }
    }
  };

  return (
    <MainLayout
      healthInfo={healthInfo}
      isOnline={isOnline}
      isLoading={isLoading}
      onRefresh={fetchHealth}
      activeView={activeView}
      onNavigate={handleNavigate}
    >
      {activeView === 'recommendations' && (
        <RecommendationsView onSelectStudent={setSelectedStudent} />
      )}

      {activeView === 'interventions' && (
        <InterventionsView onSelectStudent={setSelectedStudent} />
      )}

      {['dashboard', 'explorer', 'analytics'].includes(activeView) && (
        <DashboardHome
          healthInfo={healthInfo}
          isOnline={isOnline}
          isLoading={isLoading}
          error={error}
          onRetry={fetchHealth}
          activeView={activeView}
          onNavigate={handleNavigate}
          onSelectStudent={setSelectedStudent}
        />
      )}

      {/* Cross-view Student Profile Modal */}
      {selectedStudent && (
        <StudentDetailModal
          studentSummary={selectedStudent}
          onClose={() => setSelectedStudent(null)}
        />
      )}
    </MainLayout>
  );
}

export default App;

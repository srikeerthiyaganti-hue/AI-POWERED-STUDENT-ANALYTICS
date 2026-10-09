import React, { useState } from 'react';
import {
  GraduationCap,
  LayoutDashboard,
  Users,
  BarChart3,
  Activity,
  Database,
  ShieldAlert,
  RefreshCw,
  Menu,
  X,
  ExternalLink,
  Lightbulb,
  ClipboardList
} from 'lucide-react';
import { API_BASE_URL } from '../services/api.js';

export function MainLayout({
  children,
  healthInfo,
  isOnline,
  isLoading,
  onRefresh,
  activeView = 'dashboard',
  onNavigate
}) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard Overview',
      icon: LayoutDashboard,
      badge: 'Live'
    },
    {
      id: 'explorer',
      label: 'Student Explorer',
      icon: Users,
      badge: healthInfo?.syntheticFallback?.datasetSize ? `${healthInfo.syntheticFallback.datasetSize}` : '120'
    },
    {
      id: 'analytics',
      label: 'Cohort Charts',
      icon: BarChart3
    },
    {
      id: 'recommendations',
      label: 'Recommendations',
      icon: Lightbulb,
      badge: 'AI-Guided'
    },
    {
      id: 'interventions',
      label: 'Interventions',
      icon: ClipboardList,
      badge: 'Actions'
    }
  ];

  const handleNavClick = (viewId) => {
    if (onNavigate) {
      onNavigate(viewId);
    }
    setMobileMenuOpen(false);
  };

  const getStatusBadge = () => {
    if (isLoading) {
      return (
        <span className="status-badge status-badge--loading">
          <Activity size={14} className="spin-icon" /> Checking API...
        </span>
      );
    }
    if (!isOnline) {
      return (
        <span className="status-badge status-badge--offline" title="Backend is unreachable">
          <ShieldAlert size={14} /> Backend Disconnected
        </span>
      );
    }
    const mode = healthInfo?.database?.mode;
    if (mode === 'mongodb') {
      return (
        <span className="status-badge status-badge--online" title="MongoDB active">
          <Database size={14} /> MongoDB Connected
        </span>
      );
    }
    return (
      <span className="status-badge status-badge--fallback" title="Synthetic Fallback Active">
        <Database size={14} /> Synthetic Fallback
      </span>
    );
  };

  return (
    <div className="app-layout">
      {/* Sidebar Navigation (Desktop & Mobile Drawer) */}
      <aside className={`app-sidebar ${mobileMenuOpen ? 'app-sidebar--open' : ''}`}>
        <div className="app-sidebar__header">
          <div className="brand-group">
            <div className="brand-icon">
              <GraduationCap size={24} />
            </div>
            <div>
              <h1 className="brand-title">CampusIQ</h1>
              <p className="brand-tagline">AI Student Analytics</p>
            </div>
          </div>
          <button
            className="mobile-close-btn"
            onClick={() => setMobileMenuOpen(false)}
            aria-label="Close navigation menu"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-group-title">MAIN NAVIGATION</div>
          <ul className="nav-list">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <li key={item.id}>
                  <button
                    className={`nav-item-btn ${isActive ? 'nav-item-btn--active' : ''}`}
                    onClick={() => handleNavClick(item.id)}
                  >
                    <Icon size={18} className="nav-item-icon" />
                    <span className="nav-item-label">{item.label}</span>
                    {item.badge && (
                      <span className={`nav-item-badge ${isActive ? 'nav-item-badge--active' : ''}`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="app-sidebar__footer">
          <div className="sidebar-status-card">
            <div className="sidebar-status-header">
              <span className="sidebar-status-title">System Status</span>
              <button
                className="sidebar-refresh-btn"
                onClick={onRefresh}
                disabled={isLoading}
                title="Refresh API health check"
              >
                <RefreshCw size={13} className={isLoading ? 'spin-icon' : ''} />
              </button>
            </div>
            <div className="sidebar-badge-wrap">
              {getStatusBadge()}
            </div>
            <div className="sidebar-endpoint-text">
              <code>{API_BASE_URL}</code>
            </div>
          </div>
          <div className="sidebar-app-meta">
            CampusIQ Hackathon • v1.0.0
          </div>
        </div>
      </aside>

      {/* Backdrop for mobile drawer */}
      {mobileMenuOpen && (
        <div
          className="mobile-backdrop"
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Main Content Column */}
      <div className="app-layout__content">
        {/* Top Header Bar */}
        <header className="app-header">
          <div className="app-header__left">
            <button
              className="mobile-menu-btn"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={22} />
            </button>
            <div className="page-breadcrumb">
              <span className="breadcrumb-root">CampusIQ</span>
              <span className="breadcrumb-separator">/</span>
              <span className="breadcrumb-current">
                {activeView === 'dashboard'
                  ? 'Dashboard Overview'
                  : activeView === 'explorer'
                  ? 'Student Explorer'
                  : activeView === 'analytics'
                  ? 'Analytics & Risk Charts'
                  : activeView === 'recommendations'
                  ? 'Personalized Recommendations'
                  : activeView === 'interventions'
                  ? 'Faculty Interventions'
                  : 'Dashboard Overview'}
              </span>
            </div>
          </div>

          <div className="app-header__actions">
            <div className="header-status-wrap">
              <button
                onClick={onRefresh}
                className="refresh-btn"
                title="Refresh connection status"
                disabled={isLoading}
              >
                {getStatusBadge()}
              </button>
            </div>
          </div>
        </header>

        {/* Main View Area */}
        <main className="app-main">
          <div className="main-container">{children}</div>
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <div className="footer-inner">
            <p>© 2026 CampusIQ Hackathon Project • Built with React, Vite, Node.js & Express</p>
            <p className="footer-note">Synthetic-Data Fallback Enabled for Reliable Offline Demos</p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default MainLayout;

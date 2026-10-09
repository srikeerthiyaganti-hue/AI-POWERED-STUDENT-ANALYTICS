import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(() => {
    try {
      const stored = sessionStorage.getItem('codebuffet_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [backendStatus, setBackendStatus] = useState('checking'); // 'connected' | 'offline' | 'checking'
  const [authLoading, setAuthLoading] = useState(false);

  // Check backend health on initial load
  const checkBackend = useCallback(async () => {
    try {
      const health = await api.checkHealth();
      if (health?.status === 'healthy') {
        setBackendStatus('connected');
      } else {
        setBackendStatus('offline');
      }
    } catch {
      setBackendStatus('offline');
    }
  }, []);

  useEffect(() => {
    checkBackend();
  }, [checkBackend]);

  // Synchronize state with sessionStorage
  useEffect(() => {
    if (currentUser) {
      try {
        sessionStorage.setItem('codebuffet_user', JSON.stringify(currentUser));
      } catch {
        // Ignore quota errors
      }
    } else {
      sessionStorage.removeItem('codebuffet_user');
    }
  }, [currentUser]);

  /**
   * Secure Sign In with Backend API
   * Authenticates against FastAPI backend via PBKDF2 hash verification.
   */
  const login = async (identifier, password, role) => {
    setAuthLoading(true);
    try {
      const response = await api.login(identifier, password, role);
      if (response?.user) {
        setCurrentUser(response.user);
        return { success: true, user: response.user };
      }
      throw new Error('Authentication response did not contain user record.');
    } catch (err) {
      // If backend is offline during local demonstration, provide clear guidance
      throw err;
    } finally {
      setAuthLoading(false);
    }
  };

  /**
   * Quick Demo Login Helper
   * Allows evaluation switching across verified seed accounts:
   * 'admin' | 'mentor' | 'tpo' | 'student'
   */
  const loginWithDemo = async (roleKey) => {
    const credentials = {
      admin: { identifier: 'admin@codebuffet.edu', password: 'CodeBuffet@2026!', portalRole: 'admin' },
      mentor: { identifier: 'rajesh.kumar@codebuffet.edu', password: 'Mentor@2026!', portalRole: 'admin' },
      tpo: { identifier: 'vikram.tpo@codebuffet.edu', password: 'TPO@2026!', portalRole: 'admin' },
      student: { identifier: 'STU-2024-042', password: 'Student@2026!', portalRole: 'student' },
    };
    const cred = credentials[roleKey] || credentials.admin;
    return await login(cred.identifier, cred.password, cred.portalRole);
  };

  /**
   * Secure Sign Out
   */
  const logout = async () => {
    try {
      await api.logout();
    } catch {
      // Ignore network errors
    } finally {
      setCurrentUser(null);
      sessionStorage.removeItem('codebuffet_access_token');
      sessionStorage.removeItem('codebuffet_user');
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated: !!currentUser,
        login,
        logout,
        loginWithDemo,
        authLoading,
        backendStatus,
        checkBackend,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

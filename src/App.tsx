import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAppStore } from '@/store';
import { ThemeProvider } from '@/components/ThemeProvider';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ToastProvider } from '@/contexts/ToastContext';
import { PWAUpdatePrompt } from '@/components/PWAUpdatePrompt';
import { NetworkStatus } from '@/components/NetworkStatus';

// Layout Components
import { MobileLayout } from '@/components/layout/MobileLayout';
import { DesktopLayout } from '@/components/layout/DesktopLayout';

// Authentication Pages
import { LoginPage } from '@/pages/auth/LoginPage';
import { RegisterPage } from '@/pages/auth/RegisterPage';

// Main Application Pages
import { DashboardPage } from '@/pages/DashboardPage';
import { DailyReportPage } from '@/pages/reports/DailyReportPage';
import { WeeklyReportPage } from '@/pages/reports/WeeklyReportPage';
import { WeeklyReportDetailPage } from '@/pages/reports/WeeklyReportDetailPage';
import { GeneralReportPage } from '@/pages/reports/GeneralReportPage';
import { ProfilePage } from '@/pages/ProfilePage';
import { SettingsPage } from '@/pages/SettingsPage';

import { PTAssessmentPage } from '@/pages/PTAssessmentPage';
import BillingPage from '@/pages/BillingPage';
import HelpCenterPage from '@/pages/HelpCenterPage';
import WorkplacePage from '@/pages/WorkplacePage';

// Admin Pages
import AdminDashboardPage from '@/pages/admin/AdminDashboardPage';
import UserManagementPage from '@/pages/admin/UserManagementPage';
import AnalyticsPage from '@/pages/admin/AnalyticsPage';

import RecentActivityPage from '@/pages/admin/RecentActivityPage';
import BillingDashboardPage from '@/pages/admin/BillingDashboardPage';

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppStore();
  
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  
  return <>{children}</>;
};

// Public Route Component (redirects to dashboard if authenticated)
const PublicRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAppStore();
  
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }
  
  return <>{children}</>;
};

const App: React.FC = () => {
  const { theme, loading, initializeAuth, setupAuthListener } = useAppStore();

  // Initialize authentication state on app startup
  React.useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Setup global authentication listener
  React.useEffect(() => {
    const cleanup = setupAuthListener();
    return cleanup;
  }, [setupAuthListener]);

  return (
    <ErrorBoundary>
      <ThemeProvider theme={theme}>
        <ToastProvider>
          <div className={`theme-${theme} min-h-screen bg-gray-50`}>
            {/* Loading Overlay */}
            {loading.isLoading && (
              <LoadingSpinner 
                message={loading.message} 
                fullScreen={true}
                color="primary"
              />
            )}

            {/* Toast Notifications */}
            <ToastContainer />

            {/* PWA Components */}
            <PWAUpdatePrompt />

            {/* Network Status and Offline Support */}
            <NetworkStatus />

          {/* Main Application */}
          <Routes>
            {/* Public Routes */}
            <Route
              path="/login"
              element={
                <PublicRoute>
                  <LoginPage />
                </PublicRoute>
              }
            />
            <Route
              path="/register"
              element={
                <PublicRoute>
                  <RegisterPage />
                </PublicRoute>
              }
            />

            {/* Protected Routes */}
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Navigate to="/dashboard" replace />
                </ProtectedRoute>
              }
            />

            {/* Mobile Routes */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <DashboardPage />
                  </MobileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/daily-report"
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <DailyReportPage />
                  </MobileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/weekly-report"
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <WeeklyReportPage />
                  </MobileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/weekly-report/:weekNumber"
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <WeeklyReportDetailPage />
                  </MobileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/general-report"
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <GeneralReportPage />
                  </MobileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/profile"
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <ProfilePage />
                  </MobileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/pt-assessment"
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <PTAssessmentPage />
                  </MobileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/settings"
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <SettingsPage />
                  </MobileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/billing"
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <BillingPage />
                  </MobileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/help"
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <HelpCenterPage />
                  </MobileLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/workplace"
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <WorkplacePage />
                  </MobileLayout>
                </ProtectedRoute>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <AdminDashboardPage />
                  </MobileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/users"
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <UserManagementPage />
                  </MobileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/analytics"
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <AnalyticsPage />
                  </MobileLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin/activity"
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <RecentActivityPage />
                  </MobileLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin/billing"
              element={
                <ProtectedRoute>
                  <MobileLayout>
                    <BillingDashboardPage />
                  </MobileLayout>
                </ProtectedRoute>
              }
            />

            {/* Desktop Routes (same components, different layout) */}
            <Route
              path="/desktop"
              element={
                <ProtectedRoute>
                  <DesktopLayout>
                    <DashboardPage />
                  </DesktopLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/desktop/pt-assessment"
              element={
                <ProtectedRoute>
                  <DesktopLayout>
                    <PTAssessmentPage />
                  </DesktopLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/desktop/settings"
              element={
                <ProtectedRoute>
                  <DesktopLayout>
                    <SettingsPage />
                  </DesktopLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/desktop/workplace"
              element={
                <ProtectedRoute>
                  <DesktopLayout>
                    <WorkplacePage />
                  </DesktopLayout>
                </ProtectedRoute>
              }
            />

            {/* Desktop Admin Routes */}
            <Route
              path="/desktop/admin"
              element={
                <ProtectedRoute>
                  <DesktopLayout>
                    <AdminDashboardPage />
                  </DesktopLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/desktop/admin/users"
              element={
                <ProtectedRoute>
                  <DesktopLayout>
                    <UserManagementPage />
                  </DesktopLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/desktop/admin/analytics"
              element={
                <ProtectedRoute>
                  <DesktopLayout>
                    <AnalyticsPage />
                  </DesktopLayout>
                </ProtectedRoute>
              }
            />

            <Route
              path="/desktop/admin/activity"
              element={
                <ProtectedRoute>
                  <DesktopLayout>
                    <RecentActivityPage />
                  </DesktopLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/desktop/admin/billing"
              element={
                <ProtectedRoute>
                  <DesktopLayout>
                    <BillingDashboardPage />
                  </DesktopLayout>
                </ProtectedRoute>
              }
            />

            {/* 404 Route */}
            <Route
              path="*"
              element={
                <div className="min-h-screen flex items-center justify-center">
                  <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-900 mb-4">404</h1>
                    <p className="text-gray-600 mb-8">Page not found</p>
                    <button
                      onClick={() => window.history.back()}
                      className="btn-primary"
                    >
                      Go Back
                    </button>
                  </div>
                </div>
              }
            />
          </Routes>
        </div>
        </ToastProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App; 
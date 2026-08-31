import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ToastProvider } from './context/ToastContext';
import { AuthProvider } from './context/AuthContext';
import { PreferencesProvider } from './context/PreferencesContext';
import { ProjectProvider } from './context/ProjectContext';
import { AppLayout } from './components/common/AppLayout';
import { ProtectedRoute } from './components/common/ProtectedRoute';

// Pages
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { DashboardPage } from './pages/DashboardPage';
import { CameraWorkspacePage } from './pages/CameraWorkspacePage';
import { DesignStudioPage } from './pages/DesignStudioPage';
import { RecommendationsPage } from './pages/RecommendationsPage';
import { ProjectHistoryPage } from './pages/ProjectHistoryPage';
import { PreferencesPage } from './pages/PreferencesPage';
import { SettingsPage } from './pages/SettingsPage';
import { AdminDashboardPage } from './pages/AdminDashboardPage';
import { ResearchDashboardPage } from './pages/ResearchDashboardPage';

import { RenovationPlannerPage } from './pages/RenovationPlannerPage';
import { HomePlanningPage } from './pages/HomePlanningPage';

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <PreferencesProvider>
          <ProjectProvider>
            <BrowserRouter>
              <Routes>
                {/* Public Authentication Pages (outside standard workspace layout) */}
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />

                {/* Main App Layout */}
                <Route path="/" element={<AppLayout />}>
                  {/* Public Landing Overview */}
                  <Route index element={<LandingPage />} />

                  {/* Authenticated User Workspace Routes */}
                  <Route
                    path="dashboard"
                    element={
                      <ProtectedRoute requireAuth allowedRoles={['USER', 'ADMIN', 'RESEARCH']}>
                        <DashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="camera"
                    element={
                      <ProtectedRoute requireAuth allowedRoles={['USER', 'ADMIN', 'RESEARCH']}>
                        <CameraWorkspacePage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="studio"
                    element={
                      <ProtectedRoute requireAuth allowedRoles={['USER', 'ADMIN', 'RESEARCH']}>
                        <DesignStudioPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="recommendations"
                    element={
                      <ProtectedRoute requireAuth allowedRoles={['USER', 'ADMIN', 'RESEARCH']}>
                        <RecommendationsPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="renovation"
                    element={
                      <ProtectedRoute requireAuth allowedRoles={['USER', 'ADMIN', 'RESEARCH']}>
                        <RenovationPlannerPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="home-planning"
                    element={
                      <ProtectedRoute requireAuth allowedRoles={['USER', 'ADMIN', 'RESEARCH']}>
                        <HomePlanningPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="history"
                    element={
                      <ProtectedRoute requireAuth allowedRoles={['USER', 'ADMIN', 'RESEARCH']}>
                        <ProjectHistoryPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="preferences"
                    element={
                      <ProtectedRoute requireAuth allowedRoles={['USER', 'ADMIN', 'RESEARCH']}>
                        <PreferencesPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="settings"
                    element={
                      <ProtectedRoute requireAuth allowedRoles={['USER', 'ADMIN', 'RESEARCH']}>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Strictly Protected Admin Console (ADMIN Role Only) */}
                  <Route
                    path="admin"
                    element={
                      <ProtectedRoute requireAuth allowedRoles={['ADMIN']}>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="admin-console"
                    element={
                      <ProtectedRoute requireAuth allowedRoles={['ADMIN']}>
                        <AdminDashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Strictly Protected Research Portal (RESEARCH or ADMIN Role) */}
                  <Route
                    path="research"
                    element={
                      <ProtectedRoute requireAuth allowedRoles={['RESEARCH', 'ADMIN']}>
                        <ResearchDashboardPage />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="research-portal"
                    element={
                      <ProtectedRoute requireAuth allowedRoles={['RESEARCH', 'ADMIN']}>
                        <ResearchDashboardPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Fallback 404 Route */}
                  <Route path="*" element={<LandingPage />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </ProjectProvider>
        </PreferencesProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;

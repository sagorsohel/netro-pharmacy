import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';
import { LoginView } from './components/LoginView';
import { PharmacyDashboardView } from './components/PharmacyDashboardView';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAppSelector((state) => state.auth.isAuthenticated);
  if (!isAuthenticated) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* / route: Login Page */}
        <Route path="/" element={<LoginView />} />

        {/* /dashboard route: Protected Pharmacy Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <PharmacyDashboardView />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAppSelector } from './store/hooks';

// Layout
import { PharmacyLayout } from './components/layout/PharmacyLayout';

// Full Routed Pages (NO MODALS)
import { LoginPage } from './pages/auth/LoginPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { POSPage } from './pages/pos/POSPage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { StockInPage } from './pages/inventory/StockInPage';
import { EditMedicinePage } from './pages/inventory/EditMedicinePage';
import { InvoicesPage } from './pages/invoices/InvoicesPage';
import { InvoiceDetailsPage } from './pages/invoices/InvoiceDetailsPage';
import { StaffPage } from './pages/staff/StaffPage';
import { AddStaffPage } from './pages/staff/AddStaffPage';
import { EditStaffPage } from './pages/staff/EditStaffPage';
import { SettingsPage } from './pages/settings/SettingsPage';

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
        {/* Public Login Route */}
        <Route path="/" element={<LoginPage />} />

        {/* Protected App Routes with Fixed Navigation Layout */}
        <Route
          element={
            <ProtectedRoute>
              <PharmacyLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/pos" element={<POSPage />} />
          <Route path="/inventory" element={<InventoryPage />} />
          <Route path="/inventory/stock-in" element={<StockInPage />} />
          <Route path="/inventory/edit/:id" element={<EditMedicinePage />} />
          <Route path="/invoices" element={<InvoicesPage />} />
          <Route path="/invoices/:id" element={<InvoiceDetailsPage />} />
          <Route path="/staff" element={<StaffPage />} />
          <Route path="/staff/new" element={<AddStaffPage />} />
          <Route path="/staff/edit/:id" element={<EditStaffPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Route>

        {/* Catch-all fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;

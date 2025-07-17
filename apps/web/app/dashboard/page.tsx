'use client';

import { ThemeProvider } from '../../contexts/ThemeContext';
import { RequireAuth } from '../../components/ProtectedRoute';
import Sidebar from '../../components/layout/Sidebar';
import Dashboard from '../../pages/Dashboard';

export default function DashboardPage() {
  return (
    <RequireAuth>
      <ThemeProvider>
        <div className="flex h-screen">
          <Sidebar />
          <div className="flex-1 overflow-auto">
            <Dashboard />
          </div>
        </div>
      </ThemeProvider>
    </RequireAuth>
  );
}
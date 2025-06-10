'use client';

import { ThemeProvider } from '../../contexts/ThemeContext';
import Sidebar from '../../components/layout/Sidebar';
import Dashboard from '../../pages/Dashboard';

export default function DashboardPage() {
  return (
    <ThemeProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Dashboard />
        </div>
      </div>
    </ThemeProvider>
  );
}
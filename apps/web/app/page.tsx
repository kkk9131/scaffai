'use client';

import { ThemeProvider } from '../contexts/ThemeContext';
import Sidebar from '../components/layout/Sidebar';
import Home from '../pages/Home';

export default function RootPage() {
  return (
    <ThemeProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Home />
        </div>
      </div>
    </ThemeProvider>
  );
}
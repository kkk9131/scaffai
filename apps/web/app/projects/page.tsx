'use client';

import { ThemeProvider } from '../../contexts/ThemeContext';
import Sidebar from '../../components/layout/Sidebar';
import Projects from '../../components/pages/Projects';

export default function ProjectsPage() {
  return (
    <ThemeProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Projects />
        </div>
      </div>
    </ThemeProvider>
  );
}
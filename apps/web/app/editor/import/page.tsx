'use client';

import { ThemeProvider } from '../../../contexts/ThemeContext';
import Sidebar from '../../../components/layout/Sidebar';
import DrawingImport from '../../../components/pages/DrawingImport';

export default function ImportPage() {
  return (
    <ThemeProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <DrawingImport />
        </div>
      </div>
    </ThemeProvider>
  );
}
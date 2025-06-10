'use client';

import { ThemeProvider } from '../../contexts/ThemeContext';
import Sidebar from '../../components/layout/Sidebar';
import DrawingEditor from '../../pages/DrawingEditor';

export default function DrawPage() {
  return (
    <ThemeProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <DrawingEditor />
        </div>
      </div>
    </ThemeProvider>
  );
}
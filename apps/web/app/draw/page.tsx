'use client';

import { ThemeProvider } from '../../contexts/ThemeContext';
import Sidebar from '../../components/layout/Sidebar';
import DrawingEditor from '../../components/DrawingCanvas/DrawingEditor';

export default function DrawPage() {
  return (
    <ThemeProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1">
          <DrawingEditor />
        </div>
      </div>
    </ThemeProvider>
  );
}
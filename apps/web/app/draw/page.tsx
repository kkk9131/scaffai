'use client';

import { ThemeProvider } from '../../contexts/ThemeContext';
import Sidebar from '../../components/layout/Sidebar';
import DrawingEditor from '../../components/DrawingCanvas/DrawingEditor';
import SimpleDrawingEditor from '../../components/DrawingCanvas/SimpleDrawingEditor';
import MinimalDrawingEditor from '../../components/DrawingCanvas/MinimalDrawingEditor';
import KonvaDrawingEditor from '../../components/DrawingCanvas/KonvaDrawingEditor';
import TestComponent from '../../components/TestComponent';

export default function DrawPage() {
  return (
    <ThemeProvider>
      <div className="flex h-screen" style={{ display: 'flex', height: '100vh' }}>
        <Sidebar />
        <div className="flex-1" style={{ flex: 1 }}>
          <DrawingEditor />
        </div>
      </div>
    </ThemeProvider>
  );
}
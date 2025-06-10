'use client';

import { ThemeProvider } from '../../contexts/ThemeContext';
import Sidebar from '../../components/layout/Sidebar';
import Calculator from '../../pages/Calculator';

export default function CalculatorPage() {
  return (
    <ThemeProvider>
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 overflow-auto">
          <Calculator />
        </div>
      </div>
    </ThemeProvider>
  );
}
'use client';

import { ThemeProvider } from '../../contexts/ThemeContext';
import Login from '../../pages/Login';

export default function LoginPage() {
  return (
    <ThemeProvider>
      <Login />
    </ThemeProvider>
  );
}
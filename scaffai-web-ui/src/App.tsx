import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from './contexts/ThemeContext';
import Dashboard from './pages/Dashboard';
import DrawingEditor from './pages/DrawingEditor';
import Calculator from './pages/Calculator';
import DrawingImport from './pages/DrawingImport';
import Output from './pages/Output';
import Projects from './pages/Projects';
import Login from './pages/Login';
import Home from './pages/Home';

function App() {
  return (
    <ThemeProvider>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/draw" element={<DrawingEditor />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/editor/import" element={<DrawingImport />} />
        <Route path="/output" element={<Output />} />
        <Route path="/estimate" element={<Output />} />
        <Route path="/sales" element={<div className="p-8"><h1 className="text-2xl font-bold">Sales Management</h1></div>} />
        <Route path="/account" element={<div className="p-8"><h1 className="text-2xl font-bold">アカウント設定</h1></div>} />
        <Route path="/settings" element={<div className="p-8"><h1 className="text-2xl font-bold">管理設定</h1></div>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </ThemeProvider>
  );
}

export default App;
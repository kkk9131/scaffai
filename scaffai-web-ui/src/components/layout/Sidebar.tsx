import { useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { Link, useLocation } from 'react-router-dom';
import { 
  Plus, Calculator, FolderOpen, Settings,
  Moon, Sun, ChevronLeft, ChevronRight, 
  Home, FileText
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  return (
    <div 
      className={cn(
        "relative h-screen transition-all duration-300 ease-in-out",
        collapsed ? "w-16" : "w-64",
        "bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800",
        className
      )}
    >
      <div className="flex flex-col h-full px-3 py-4">
        <div className="flex items-center justify-between mb-6">
          {!collapsed && (
            <Link to="/dashboard" className="text-lg font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
              ScaffAI
            </Link>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-2 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400"
          >
            {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          </button>
        </div>

        <nav className="flex-1 space-y-2">
          <SidebarItem 
            icon={<Home size={20} />} 
            label="ダッシュボード"
            to="/dashboard"
            active={location.pathname === '/dashboard'}
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={<Plus size={20} />} 
            label="作図エディタ"
            to="/draw"
            active={location.pathname === '/draw'}
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={<FolderOpen size={20} />} 
            label="プロジェクト"
            to="/projects"
            active={location.pathname === '/projects'}
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={<Calculator size={20} />} 
            label="簡易計算" 
            to="/calculator"
            active={location.pathname === '/calculator'}
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={<FileText size={20} />} 
            label="出力" 
            to="/output"
            active={location.pathname === '/output'}
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="管理" 
            to="/settings"
            active={location.pathname === '/settings'}
            collapsed={collapsed} 
          />
        </nav>

        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          <button
            onClick={toggleTheme}
            className={cn(
              "flex items-center w-full p-3 rounded-md text-sm font-medium transition-colors",
              "text-slate-500 dark:text-slate-400",
              "hover:bg-slate-100 dark:hover:bg-slate-800"
            )}
          >
            {theme === 'dark' ? (
              <>
                <Sun size={20} />
                {!collapsed && <span className="ml-3">ライトモード</span>}
              </>
            ) : (
              <>
                <Moon size={20} />
                {!collapsed && <span className="ml-3">ダークモード</span>}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  collapsed?: boolean;
  to: string;
}

function SidebarItem({ 
  icon, 
  label, 
  active = false, 
  collapsed = false,
  to
}: SidebarItemProps) {
  return (
    <Link
      to={to}
      className={cn(
        "flex items-center w-full p-3 rounded-md text-sm font-medium transition-colors",
        active 
          ? "bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400" 
          : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800",
        collapsed && "justify-center"
      )}
    >
      {icon}
      {!collapsed && <span className="ml-3">{label}</span>}
    </Link>
  );
}
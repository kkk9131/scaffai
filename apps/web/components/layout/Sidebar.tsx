'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../contexts/AuthContext';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { 
  Plus, Calculator, FolderOpen, Settings,
  Moon, Sun, ChevronLeft, ChevronRight, 
  Home, FileText, LogOut, User
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const pathname = usePathname();

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
            <Link href="/dashboard" className="text-lg font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
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
            href="/dashboard"
            active={pathname === '/dashboard'}
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={<Plus size={20} />} 
            label="作図エディタ"
            href="/draw"
            active={pathname === '/draw'}
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={<FolderOpen size={20} />} 
            label="プロジェクト"
            href="/projects"
            active={pathname === '/projects'}
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={<Calculator size={20} />} 
            label="簡易計算" 
            href="/calculator"
            active={pathname === '/calculator'}
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={<Calculator size={20} />} 
            label="簡易割付計算" 
            href="/quick-allocation"
            active={pathname === '/quick-allocation'}
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={<FileText size={20} />} 
            label="出力" 
            href="/output"
            active={pathname === '/output'}
            collapsed={collapsed} 
          />
          <SidebarItem 
            icon={<Settings size={20} />} 
            label="管理" 
            href="/settings"
            active={pathname === '/settings'}
            collapsed={collapsed} 
          />
        </nav>

        <div className="pt-4 mt-4 border-t border-slate-200 dark:border-slate-800 space-y-2">
          {/* User Info */}
          {user && !collapsed && (
            <div className="px-3 py-2 mb-2">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                  <User size={16} className="text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
                    {user.email}
                  </p>
                </div>
              </div>
            </div>
          )}
          
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
          
          <button
            onClick={async () => {
              await signOut();
              router.push('/login');
            }}
            className={cn(
              "flex items-center w-full p-3 rounded-md text-sm font-medium transition-colors",
              "text-red-500 dark:text-red-400",
              "hover:bg-red-50 dark:hover:bg-red-900/20"
            )}
          >
            <LogOut size={20} />
            {!collapsed && <span className="ml-3">ログアウト</span>}
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
  href: string;
}

function SidebarItem({ 
  icon, 
  label, 
  active = false, 
  collapsed = false,
  href
}: SidebarItemProps) {
  return (
    <Link
      href={href}
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
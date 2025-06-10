import { useState } from 'react';
import { format } from 'date-fns';
import { Search, Plus, Calculator, ScanLine, FileText, ArrowRight, Pencil, Building2, FileSpreadsheet, Settings, User } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { ProjectCard } from '../components/ProjectCard';
import { FeatureCard } from '../components/FeatureCard';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/Select';
import { ScrollArea } from '../components/ui/ScrollArea';
import { useProjectStore } from '../store/projectStore';
import { Link, useNavigate } from 'react-router-dom';

export default function Dashboard() {
  const { 
    deleteProject,
    getSortedFilteredProjects 
  } = useProjectStore();
  const navigate = useNavigate();
  
  const [sortBy, setSortBy] = useState('updatedAt');
  
  const projects = getSortedFilteredProjects();

  const currentDate = format(new Date(), 'yyyy年MM月dd日');

  return (
    <div className="flex h-screen text-slate-900 dark:text-slate-100">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 md:p-8">
            <header className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
                <div>
                  <h1 className="text-2xl font-bold">おかえりなさい、田中さん</h1>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1.5">
                    今日も効率的な足場設計を始めましょう
                  </p>
                </div>
                <Link 
                  to="/account" 
                  className="flex flex-col items-center"
                >
                  <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mb-1">
                    <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  </div>
                  <span className="text-xs text-slate-600 dark:text-slate-400">田中 太郎</span>
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
                  <h3 className="text-sm text-slate-500 dark:text-slate-400">総プロジェクト数</h3>
                  <p className="text-2xl font-bold mt-1.5">24</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">+2 今月</p>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
                  <h3 className="text-sm text-slate-500 dark:text-slate-400">完了プロジェクト</h3>
                  <p className="text-2xl font-bold mt-1.5">18</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">+3 今週</p>
                </div>
                <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 p-6">
                  <h3 className="text-sm text-slate-500 dark:text-slate-400">今月の売上</h3>
                  <p className="text-2xl font-bold mt-1.5">¥2,450,000</p>
                  <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">+12% 先月比</p>
                </div>
              </div>

              {/* Removed the dropdown for sorting here */}
            </header>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Recent Projects */}
              <div className="lg:col-span-2 space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">最近のプロジェクト</h2>
                  <button className="flex items-center gap-2 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors">
                    すべて表示
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {projects.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-64 text-center">
                    <div className="mb-4 p-4 rounded-full bg-slate-100 dark:bg-slate-800">
                      <Search className="h-8 w-8 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-medium">プロジェクトが見つかりません</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-md">
                      検索条件に一致するプロジェクトがありません。別のキーワードを試すか、新しいプロジェクトを作成してください。
                    </p>
                    <button className="mt-4 flex items-center justify-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl font-medium shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200">
                      <Plus className="h-4 w-4" />
                      <span>新規プロジェクト</span>
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {projects.slice(0, 3).map((project) => (
                      <div
                        key={project.id}
                        className="flex items-center gap-4 p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50"
                      >
                        <div className="flex-1">
                          <h3 className="font-medium text-slate-900 dark:text-slate-100">{project.name}</h3>
                          <p className="text-sm text-slate-500 dark:text-slate-400">{project.memo}</p>
                        </div>
                        <div className="text-sm text-slate-500 dark:text-slate-400">
                          {format(project.updatedAt, 'yyyy/MM/dd')}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">クイックアクション</h2>
                <div className="space-y-2">
                  <button
                    onClick={() => navigate('/draw')}
                    className="flex items-center gap-3 w-full p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400">
                      <Pencil className="w-4 h-4" />
                    </div>
                    <span className="font-medium">図面作成</span>
                  </button>
                  <button
                    onClick={() => navigate('/editor/import')}
                    className="flex items-center gap-3 w-full p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400">
                      <ScanLine className="w-4 h-4" />
                    </div>
                    <span className="font-medium">図面スキャン</span>
                  </button>
                  <button
                    onClick={() => navigate('/estimate')}
                    className="flex items-center gap-3 w-full p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-orange-50 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="font-medium">見積書作成</span>
                  </button>
                  <button
                    onClick={() => navigate('/sales')}
                    className="flex items-center gap-3 w-full p-3 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200/50 dark:border-slate-700/50 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                  >
                    <div className="p-2 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
                      <FileSpreadsheet className="w-4 h-4" />
                    </div>
                    <span className="font-medium">売上管理</span>
                  </button>
                </div>
              </div>
            </div>
            
            <footer className="mt-12 text-center text-sm text-slate-500 dark:text-slate-400">
              <p>ScaffAI © 2025 | バージョン 1.0.0</p>
            </footer>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
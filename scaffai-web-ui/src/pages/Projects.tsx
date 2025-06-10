import { useState } from 'react';
import { format } from 'date-fns';
import { Search, ChevronLeft, ChevronRight, Download, ExternalLink, MoreHorizontal } from 'lucide-react';
import { Sidebar } from '../components/layout/Sidebar';
import { ScrollArea } from '../components/ui/ScrollArea';
import { useProjectStore } from '../store/projectStore';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../components/ui/DropdownMenu';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

// Project status types
type ProjectStatus = '完了' | '進行中' | '設計中' | '下書き';

export default function Projects() {
  const { projects, deleteProject } = useProjectStore();
  const [filter, setFilter] = useState<ProjectStatus | 'すべて'>('すべて');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  
  const projectsPerPage = 8;
  
  // Filter projects based on status and search query
  const filteredProjects = projects.filter((project) => {
    // Filter by status
    if (filter !== 'すべて' && project.status !== filter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !project.name.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Paginate projects
  const indexOfLastProject = currentPage * projectsPerPage;
  const indexOfFirstProject = indexOfLastProject - projectsPerPage;
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject);
  const totalPages = Math.ceil(filteredProjects.length / projectsPerPage);
  
  // Handle page change
  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages) return;
    setCurrentPage(page);
  };
  
  return (
    <div className="flex h-screen text-slate-900 dark:text-slate-100">
      <Sidebar />
      
      <main className="flex-1 overflow-hidden">
        <ScrollArea className="h-full">
          <div className="p-6 md:p-8">
            <header className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold">プロジェクト管理</h1>
                <button className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                  <span>新規プロジェクト</span>
                </button>
              </div>
              <p className="text-slate-500 dark:text-slate-400">
                {filteredProjects.length}個のプロジェクトを管理中
              </p>
            </header>
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input
                  type="text"
                  placeholder="プロジェクトを検索..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 pr-4 py-2 w-full md:w-80 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              {/* Filters */}
              <div className="flex items-center gap-2">
                <div className="mr-2 text-sm text-slate-500">フィルター:</div>
                {(['すべて', '完了', '進行中', '設計中', '下書き'] as const).map((status) => (
                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={cn(
                      "px-3 py-1.5 text-sm rounded-md transition-colors",
                      filter === status 
                        ? "bg-blue-600 text-white" 
                        : "bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                  >
                    {status}
                  </button>
                ))}
                
                {/* View Mode Toggle */}
                <div className="ml-auto flex items-center gap-1 rounded-lg overflow-hidden border border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => setViewMode('grid')}
                    className={cn(
                      "p-1.5 transition-colors",
                      viewMode === 'grid' 
                        ? "bg-blue-100 dark:bg-blue-900/30" 
                        : "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="6" height="6" rx="1" className={viewMode === 'grid' ? "fill-blue-600" : "fill-slate-500"} />
                      <rect x="9" y="1" width="6" height="6" rx="1" className={viewMode === 'grid' ? "fill-blue-600" : "fill-slate-500"} />
                      <rect x="1" y="9" width="6" height="6" rx="1" className={viewMode === 'grid' ? "fill-blue-600" : "fill-slate-500"} />
                      <rect x="9" y="9" width="6" height="6" rx="1" className={viewMode === 'grid' ? "fill-blue-600" : "fill-slate-500"} />
                    </svg>
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={cn(
                      "p-1.5 transition-colors",
                      viewMode === 'list' 
                        ? "bg-blue-100 dark:bg-blue-900/30" 
                        : "bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700"
                    )}
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <rect x="1" y="1" width="14" height="3" rx="1" className={viewMode === 'list' ? "fill-blue-600" : "fill-slate-500"} />
                      <rect x="1" y="6" width="14" height="3" rx="1" className={viewMode === 'list' ? "fill-blue-600" : "fill-slate-500"} />
                      <rect x="1" y="11" width="14" height="3" rx="1" className={viewMode === 'list' ? "fill-blue-600" : "fill-slate-500"} />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
            
            {/* Project Grid */}
            {currentProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16">
                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4">
                  <Search className="w-8 h-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-medium">プロジェクトが見つかりません</h3>
                <p className="mt-2 text-sm text-slate-500 dark:text-slate-400 max-w-md text-center">
                  検索条件またはフィルターに一致するプロジェクトがありません。条件を変更するか、新しいプロジェクトを作成してください。
                </p>
              </div>
            ) : (
              <div className={cn(
                viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4" : "space-y-4"
              )}>
                {currentProjects.map((project) => (
                  <ProjectCard 
                    key={project.id} 
                    project={project} 
                    onDelete={deleteProject} 
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
            
            {/* Pagination */}
            {filteredProjects.length > 0 && (
              <div className="flex items-center justify-center mt-8 space-x-1">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="p-2 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter(page => {
                    // Show first page, last page, current page, and pages immediately before and after current page
                    return page === 1 || page === totalPages || 
                           Math.abs(page - currentPage) <= 1;
                  })
                  .map((page, i, arr) => {
                    // Add ellipsis
                    if (i > 0 && page - arr[i - 1] > 1) {
                      return [
                        <div key={`ellipsis-${page}`} className="px-2 py-1">...</div>,
                        <button
                          key={page}
                          onClick={() => handlePageChange(page)}
                          className={cn(
                            "w-8 h-8 rounded-md flex items-center justify-center",
                            currentPage === page
                              ? "bg-blue-600 text-white"
                              : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                          )}
                        >
                          {page}
                        </button>
                      ];
                    }
                    
                    return (
                      <button
                        key={page}
                        onClick={() => handlePageChange(page)}
                        className={cn(
                          "w-8 h-8 rounded-md flex items-center justify-center",
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700"
                        )}
                      >
                        {page}
                      </button>
                    );
                  })}
                
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="p-2 rounded-md border border-slate-200 dark:border-slate-700 disabled:opacity-50"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
            
            <footer className="mt-8 text-center text-sm text-slate-500 dark:text-slate-400 py-4">
              <div className="flex items-center justify-center gap-2">
                <span>24個のプロジェクト</span>
                <span>•</span>
                <span>完了: 16個</span>
                <span>•</span>
                <span>進行中: 4個</span>
                <span>•</span>
                <span>下書き: 2個</span>
              </div>
            </footer>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}

interface ProjectCardProps {
  project: any;
  onDelete: (id: string) => void;
  viewMode: 'grid' | 'list';
}

function ProjectCard({ project, onDelete, viewMode }: ProjectCardProps) {
  // Status colors
  const statusColors = {
    '完了': 'bg-green-500',
    '進行中': 'bg-orange-500',
    '設計中': 'bg-blue-500',
    '下書き': 'bg-slate-500',
  };

  const statusBgColors = {
    '完了': 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
    '進行中': 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
    '設計中': 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    '下書き': 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-400',
  };

  if (viewMode === 'list') {
    return (
      <div className="flex items-center gap-4 bg-white dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 p-3">
        <div className={cn("px-2 py-1 text-xs font-medium rounded", statusBgColors[project.status as keyof typeof statusBgColors])}>
          {project.status}
        </div>
        <div className="flex-1">
          <h3 className="font-medium">{project.name}</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400">{project.memo}</p>
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {project.size}m²
        </div>
        <div className="text-sm text-slate-500 dark:text-slate-400">
          {format(project.updatedAt, 'yyyy/MM/dd')}
        </div>
        <div className="text-sm">{project.assignedTo}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md">
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem className="cursor-pointer">
              <ExternalLink className="mr-2 h-4 w-4" />
              <span>編集</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Download className="mr-2 h-4 w-4" />
              <span>ダウンロード</span>
            </DropdownMenuItem>
            <DropdownMenuItem 
              className="cursor-pointer text-red-600 dark:text-red-400"
              onClick={() => onDelete(project.id)}
            >
              <span>削除</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <div className="group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl border border-slate-200/50 dark:border-slate-700/50 overflow-hidden">
      {/* Status Badge */}
      <div className="absolute top-2 left-2 z-10">
        <div className={cn("px-2 py-1 text-xs font-medium rounded", statusBgColors[project.status as keyof typeof statusBgColors])}>
          {project.status}
        </div>
      </div>
      
      {/* Project Visual/Diagram Area */}
      <div className="h-48 flex items-center justify-center bg-slate-700/90">
        <div className={cn(
          "w-20 h-20",
          project.schematic === 'residential' && "border-2 border-blue-400 rounded-sm",
          project.schematic === 'commercial' && "flex space-x-1",
          project.schematic === 'industrial' && "border-2 border-orange-400 rounded-full",
          project.schematic === 'apartment' && "flex flex-col space-y-1"
        )}>
          {project.schematic === 'commercial' && (
            <>
              <div className="w-6 h-20 border-2 border-orange-400"></div>
              <div className="w-6 h-20 border-2 border-orange-400"></div>
              <div className="w-6 h-20 border-2 border-orange-400"></div>
            </>
          )}
          
          {project.schematic === 'apartment' && (
            <>
              <div className="w-20 h-6 border-2 border-blue-400"></div>
              <div className="w-20 h-6 border-2 border-blue-400"></div>
              <div className="w-20 h-6 border-2 border-blue-400"></div>
            </>
          )}
        </div>
      </div>
      
      {/* Project Info */}
      <div className="p-4">
        <h3 className="font-medium text-lg mb-1">{project.name}</h3>
        <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
          {project.details}
        </p>
        
        <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400">
          <span>{format(project.updatedAt, 'yyyy/MM/dd')} 更新</span>
          <span>{project.size}m²</span>
        </div>
        
        <div className="flex justify-between items-center mt-3">
          <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-400">
            <span>担当:</span>
            <span className="font-medium">{project.assignedTo}</span>
          </div>
          
          <div className="flex gap-1">
            <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
              <Download className="w-4 h-4" />
            </button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-700 rounded">
                  <MoreHorizontal className="w-4 h-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem className="cursor-pointer">
                  <span>編集</span>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer">
                  <span>共有</span>
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="cursor-pointer text-red-600 dark:text-red-400"
                  onClick={() => onDelete(project.id)}
                >
                  <span>削除</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
}
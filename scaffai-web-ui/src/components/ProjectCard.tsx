import { useState } from 'react';
import { format } from 'date-fns';
import { MoreHorizontal, Edit, FileDown, Trash2 } from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/DropdownMenu';
import { cn, getRandomColor } from '../lib/utils';
import type { Project } from '../store/projectStore';

interface ProjectCardProps {
  project: Project;
  onDelete: (id: string) => void;
  className?: string;
}

export function ProjectCard({ project, onDelete, className }: ProjectCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  const randomBgColor = getRandomColor();

  return (
    <div 
      className={cn(
        "group relative bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl",
        "border border-slate-200/50 dark:border-slate-700/50",
        "overflow-hidden transition-all duration-300 ease-out hover:-translate-y-1",
        "hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5",
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-video w-full overflow-hidden">
        {project.imageSrc ? (
          <img 
            src={project.imageSrc} 
            alt={project.name} 
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className={cn(
            "w-full h-full flex items-center justify-center transition-transform duration-500 group-hover:scale-105",
            randomBgColor,
            "bg-gradient-to-br from-current to-current/80"
          )}>
            <span className="text-white text-xl font-bold">
              {project.name.substring(0, 2)}
            </span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-slate-900 dark:text-slate-100 truncate">
            {project.name}
          </h3>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="p-1 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800">
                <MoreHorizontal className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem className="cursor-pointer">
                <Edit className="mr-2 h-4 w-4" />
                <span>編集</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="cursor-pointer">
                <FileDown className="mr-2 h-4 w-4" />
                <span>出力</span>
              </DropdownMenuItem>
              <DropdownMenuItem 
                className="cursor-pointer text-red-600 dark:text-red-400"
                onClick={() => onDelete(project.id)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                <span>削除</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 truncate">
          {project.memo}
        </p>
        
        <div className="mt-2 flex items-center text-xs text-slate-500 dark:text-slate-400">
          <span>更新: {format(project.updatedAt, 'yyyy/MM/dd')}</span>
        </div>
      </div>

      <div className={cn(
        "absolute inset-0 bg-slate-900/50 flex items-center justify-center gap-2 opacity-0 transition-opacity",
        isHovered && "opacity-100"
      )}>
        <button className="p-2 bg-white dark:bg-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <Edit className="h-5 w-5 text-slate-700 dark:text-slate-200" />
        </button>
        <button className="p-2 bg-white dark:bg-slate-800 rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors">
          <FileDown className="h-5 w-5 text-slate-700 dark:text-slate-200" />
        </button>
        <button 
          className="p-2 bg-white dark:bg-slate-800 rounded-full hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
          onClick={() => onDelete(project.id)}
        >
          <Trash2 className="h-5 w-5 text-red-600 dark:text-red-400" />
        </button>
      </div>
    </div>
  );
}
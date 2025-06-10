import { DivideIcon as LucideIcon } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  to?: string;
  className?: string;
}

export function FeatureCard({
  icon: Icon,
  title,
  description,
  to,
  className,
}: FeatureCardProps) {
  const Component = to ? Link : 'button';

  return (
    <Component
      to={to}
      className={cn(
        "w-full p-6 text-left bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-xl",
        "border border-slate-200/50 dark:border-slate-700/50",
        "transition-all duration-300 ease-out",
        "hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-500/10 dark:hover:shadow-blue-500/5",
        "group",
        className
      )}
    >
      <div className="flex items-center gap-4 mb-4">
        <div className="p-3 rounded-lg bg-gradient-to-br from-blue-500/10 to-blue-600/10 dark:from-blue-400/10 dark:to-blue-500/10 text-blue-600 dark:text-blue-400 transition-all duration-300 group-hover:scale-110 group-hover:from-blue-500/20 group-hover:to-blue-600/20">
          <Icon className="w-6 h-6" />
        </div>
        <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
          {title}
        </h3>
      </div>
      <p className="text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </Component>
  );
}
interface ToolButtonProps {
   icon: React.ReactNode;
   label: string;
   active?: boolean;
   onClick?: () => void;
   collapsed?: boolean;
}
 
export function ToolButton({ icon, label, active, onClick, collapsed }: ToolButtonProps) {
   return (
     <button
       onClick={onClick}
       className={cn(
         "flex flex-col items-center justify-center p-2 rounded-lg",
         "hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors",
         collapsed && "justify-center",
         active && "bg-blue-50 dark:bg-blue-900/20"
       )}
     >
       {icon}
       {!collapsed && <span className="text-xs mt-1">{label}</span>}
     </button>
   );
}
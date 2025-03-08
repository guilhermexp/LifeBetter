
import { cn } from "@/lib/utils";

interface ProgressBarProps {
  progress: number;
  className?: string;
}

export const ProgressBar = ({ progress, className }: ProgressBarProps) => {
  // Limitar o progresso entre 0 e 100
  const safeProgress = Math.min(Math.max(progress, 0), 100);
  
  return (
    <div className="w-full bg-gray-200 rounded-full overflow-hidden">
      <div 
        className={cn("h-2 rounded-full transition-all duration-500", className)} 
        style={{ width: `${safeProgress}%` }}
      />
    </div>
  );
};

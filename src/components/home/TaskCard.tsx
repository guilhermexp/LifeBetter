
import { Check, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export interface TaskItem {
  id: string;
  title: string;
  completed: boolean;
  scheduled_date: string;
  priority?: string;
  color?: string;
  start_time?: string | null;
  duration?: number | null;
}

interface TaskCardProps {
  task: TaskItem;
  onToggleCompletion: (taskId: string, currentStatus: boolean) => void;
}

export function TaskCard({ task, onToggleCompletion }: TaskCardProps) {
  const formatTimeDisplay = (timeString?: string | null) => {
    if (!timeString) return null;
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch (error) {
      return null;
    }
  };

  return (
    <div 
      className={cn(
        "p-3 sm:p-4 rounded-xl border border-gray-200 bg-white mb-3 transition-all duration-300 group w-full max-w-full",
        task.completed ? "opacity-60" : "hover:shadow-md"
      )}
    >
      <div className="flex items-center gap-2 sm:gap-3 w-full">
        <button 
          onClick={() => onToggleCompletion(task.id, task.completed)}
          className={cn(
            "w-5 h-5 sm:w-6 sm:h-6 rounded-full flex-shrink-0 border flex items-center justify-center transition-all",
            task.completed 
              ? "bg-green-500 border-green-500 text-white" 
              : "border-gray-300 group-hover:border-purple-400"
          )}
        >
          {task.completed && <Check className="h-3 w-3 sm:h-3.5 sm:w-3.5" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <h3 
            className={cn(
              "text-sm sm:text-base text-gray-900 mb-1 font-medium truncate",
              task.completed && "line-through text-gray-500"
            )}
          >
            {task.title}
          </h3>
          
          {task.start_time && (
            <div className="flex items-center gap-2 text-xs sm:text-sm truncate">
              <span 
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ backgroundColor: task.color || "#9b87f5" }} 
              ></span>
              <span className="text-gray-500 truncate">
                {formatTimeDisplay(task.start_time)}
                {task.duration && ` · ${task.duration} min`}
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

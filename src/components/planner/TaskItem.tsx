import React from "react";
import { Check, Repeat } from "lucide-react";
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
  type: string;
  details?: string | null;
  location?: string | null;
  meeting_link?: string | null;
  user_id?: string;
  area_type?: string;
  isGoogleEvent?: boolean;
  frequency?: string; // Added for recurring tasks
  repeat_days?: number[]; // Added for weekly frequency with specific days
}

interface TaskItemProps {
  task: TaskItem;
  onToggleCompletion: (taskId: string, currentStatus: boolean) => void;
  onQuickAction: (taskId: string, title: string) => void;
  compactView?: boolean;
}

export function TaskItemComponent({ task, onToggleCompletion, onQuickAction, compactView = false }: TaskItemProps) {
  const formatTimeDisplay = (timeString?: string | null) => {
    if (!timeString) return null;
    try {
      const [hours, minutes] = timeString.split(':');
      return `${hours}:${minutes}`;
    } catch (error) {
      return null;
    }
  };

  const getTypeBackground = (type: string, completed: boolean) => {
    if (completed) {
      return "bg-gray-100 border-gray-300 text-gray-500";
    }
    switch (type) {
      case "meeting":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "event":
        return "bg-purple-50 border-purple-200 text-purple-700";
      case "holiday":
        return "bg-red-50 border-red-200 text-red-700";
      case "task":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "habit":
        return "bg-green-50 border-green-200 text-green-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };

  // Determine if this is a recurring item (habit)
  const isRecurring = task.type === 'habit';

  // Get the frequency label if it's a recurring habit
  const getFrequencyLabel = () => {
    if (!isRecurring || !task.priority) return null;
    
    switch (task.priority) {
      case 'daily':
        return 'Diário';
      case 'weekly':
        return 'Semanal';
      case 'monthly':
        return 'Mensal';
      default:
        return null;
    }
  };

  const frequencyLabel = getFrequencyLabel();

  return (
    <div 
      className={cn(
        "p-2 rounded-xl border relative", 
        getTypeBackground(task.type, task.completed),
        compactView ? "text-xs truncate" : "text-sm"
      )}
      onClick={() => onQuickAction(task.id, task.title)}
    >
      <div className="flex items-center gap-2">
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleCompletion(task.id, task.completed);
          }}
          className={cn(
            "w-5 h-5 rounded-full flex-shrink-0 border flex items-center justify-center transition-all",
            task.completed 
              ? "bg-green-500 border-green-500 text-white" 
              : "border-gray-300 hover:border-purple-400"
          )}
        >
          {task.completed && <Check className="h-3 w-3" />}
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center">
            <h3 className={cn("font-medium", task.completed && "line-through text-gray-500")}>
              {task.start_time && formatTimeDisplay(task.start_time)} {task.title}
            </h3>
            {isRecurring && (
              <div className="flex items-center ml-1">
                <Repeat className="h-3 w-3 text-green-600" />
                {frequencyLabel && !compactView && (
                  <span className="text-xs text-green-600 ml-1">{frequencyLabel}</span>
                )}
              </div>
            )}
          </div>
          
          {!compactView && task.details && (
            <div className="text-xs text-gray-600 mt-1 truncate">{task.details}</div>
          )}
          
          {!compactView && task.duration && (
            <div className="text-xs text-gray-500 mt-1">
              {task.duration} min
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

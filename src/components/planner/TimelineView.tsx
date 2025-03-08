
import React from "react";
import { TaskItem } from "./TaskItem";
import { cn } from "@/lib/utils";
import { RefreshCw } from "lucide-react";
import { EmptyTimeline } from "./EmptyTimeline";
import { LoadingTimeline } from "./LoadingTimeline";
import { getTaskColor, getTaskIcon } from "./task-icons";
import { isDateInSchedule, parseDate } from "./planner-utils";
import { motion, AnimatePresence } from "framer-motion";

interface TimelineViewProps {
  selectedDate: Date;
  taskEvents: TaskItem[];
  onToggleCompletion: (taskId: string, currentStatus: boolean) => void;
  onQuickAction: (taskId: string, title: string) => void;
  isLoading: boolean;
  showOnlyCompleted?: boolean;
}

export function TimelineView({
  selectedDate,
  taskEvents,
  onToggleCompletion,
  onQuickAction,
  isLoading,
  showOnlyCompleted = false
}: TimelineViewProps) {
  // Only show tasks that are NOT inbox_only and are scheduled
  const filteredTasks = taskEvents.filter(task => {
    if (showOnlyCompleted && !task.completed) {
      return false;
    }

    // Filter out inbox-only tasks
    if (task.inbox_only === true) {
      return false;
    }
    
    if (task.type === 'habit') {
      return true;
    }
    
    if (task.frequency && task.frequency !== 'once') {
      return isDateInSchedule(
        selectedDate,
        task.scheduled_date,
        task.frequency,
        task.repeat_days
      );
    }
    
    return true;
  });

  const sortedEvents = [...filteredTasks].sort((a, b) => {
    if (!a.start_time) return 1;
    if (!b.start_time) return -1;
    return a.start_time.localeCompare(b.start_time);
  });

  // Função para calcular o horário de término
  const calculateEndTime = (startTime: string, duration: number) => {
    if (!startTime) return null;
    
    // Parse hours and minutes from start time
    const [hours, minutes] = startTime.split(':').map(Number);
    
    // Convert everything to minutes
    let totalMinutes = hours * 60 + minutes + duration;
    
    // Calculate new hours and minutes
    const newHours = Math.floor(totalMinutes / 60) % 24; // Handle case when hours go past 24
    const newMinutes = totalMinutes % 60;
    
    // Format with leading zeros
    return `${String(newHours).padStart(2, '0')}:${String(newMinutes).padStart(2, '0')}`;
  };

  return (
    <div className="relative bg-gray-50 rounded-3xl p-4 shadow-sm border border-gray-100">
      <AnimatePresence mode="wait">
        {isLoading ? (
          <LoadingTimeline />
        ) : sortedEvents.length === 0 ? (
          <EmptyTimeline />
        ) : (
          <div className="relative">
            {/* Linha do tempo central */}
            <div className="absolute left-[30px] top-0 bottom-0 w-0.5 bg-gray-200 z-0"></div>
            
            <div className="space-y-8">
              {sortedEvents.map((task, index) => {
                const formattedTime = task.start_time ? task.start_time.substring(0, 5) : "";
                const endTime = task.start_time && task.duration ? 
                  calculateEndTime(task.start_time, parseInt(task.duration)) : null;
                
                const timeDisplay = formattedTime 
                  ? (endTime && task.duration
                    ? `${formattedTime} – ${endTime} (${task.duration} min)`
                    : `${formattedTime}`)
                  : "";
                
                // Ícone de recorrência
                const isRecurring = task.frequency && task.frequency !== 'once';
                
                return (
                  <div key={task.id} className="flex items-start relative">
                    {/* Conectar linha entre ícones */}
                    {index < sortedEvents.length - 1 && (
                      <div className="absolute left-[30px] top-[30px] w-0.5 h-[calc(100%+8px)] bg-gray-200 z-0"></div>
                    )}
                    
                    {/* Ícone da tarefa */}
                    <div className="relative z-10">
                      <div 
                        className="h-[60px] w-[60px] rounded-full flex items-center justify-center"
                        style={{ backgroundColor: getTaskColor(task, index) }}
                      >
                        <div className="text-2xl text-white">
                          {getTaskIcon(task)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Conteúdo da tarefa */}
                    <div className="flex-1 ml-4">
                      {/* Horário e tipo */}
                      <div className="flex items-center mb-1">
                        {formattedTime && (
                          <div className="text-sm text-gray-700 font-medium">
                            {formattedTime} {isRecurring && <RefreshCw className="inline h-3 w-3 ml-1 text-purple-500" />}
                          </div>
                        )}
                        
                        {task.type && (
                          <div className="ml-2 text-xs text-purple-600 font-medium">
                            {task.type === 'meeting' ? 'Reunião' :
                             task.type === 'event' ? 'Evento' :
                             task.type === 'habit' ? 'Hábito' : 'Tarefa'}
                          </div>
                        )}
                      </div>
                      
                      {/* Duração (se houver) */}
                      {endTime && task.duration && (
                        <div className="text-xs text-gray-500 mb-1">
                          {formattedTime} – {endTime} ({task.duration} min)
                        </div>
                      )}
                      
                      {/* Título da tarefa */}
                      <div 
                        className={cn(
                          "text-lg font-medium mb-1",
                          task.completed ? "text-gray-500 line-through" : "text-gray-800"
                        )}
                        onClick={() => onQuickAction(task.id, task.title)}
                      >
                        {task.title}
                      </div>
                      
                      {/* Checkbox de conclusão */}
                      <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                        <div 
                          className={cn(
                            "h-6 w-6 rounded-full border-2 flex items-center justify-center cursor-pointer",
                            task.completed ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-white"
                          )}
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleCompletion(task.id, !!task.completed);
                          }}
                        >
                          {task.completed && (
                            <div className="h-3 w-3 rounded-full bg-blue-500"></div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}

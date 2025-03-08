
import React from "react";
import { 
  format, 
  isToday, 
  isSameMonth, 
  isSameDay, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  eachDayOfInterval
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { TaskItem } from "./TaskItem";

interface MonthViewProps {
  selectedDate: Date;
  currentMonth: Date;
  taskEvents: TaskItem[];
  compactView: boolean;
  onSelectDay: (day: Date) => void;
  onQuickAction: (taskId: string, title: string) => void;
}

export function MonthView({
  selectedDate,
  currentMonth,
  taskEvents,
  compactView,
  onSelectDay,
  onQuickAction
}: MonthViewProps) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const startDate = startOfWeek(monthStart, { weekStartsOn: 0 });
  const endDate = endOfWeek(monthEnd, { weekStartsOn: 0 });
  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Group days into weeks
  const weeks: Date[][] = [];
  let currentWeek: Date[] = [];
  
  days.forEach(day => {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  // Get events for a specific day
  const getEventsForDay = (day: Date) => {
    const dayStr = format(day, 'yyyy-MM-dd');
    return taskEvents.filter(event => event.scheduled_date === dayStr);
  };

  return (
    <div className="bg-white rounded-lg shadow">
      {/* Weekday headers */}
      <div className="grid grid-cols-7 text-center border-b border-gray-200">
        {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
          <div key={day} className="py-2 text-xs font-medium text-gray-500">
            {day}
          </div>
        ))}
      </div>
      
      {/* Calendar grid */}
      <div className="divide-y divide-gray-100">
        {weeks.map((week, weekIndex) => (
          <div key={weekIndex} className="grid grid-cols-7 divide-x divide-gray-100">
            {week.map(day => {
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
              const isCurrentMonth = isSameMonth(day, currentMonth);
              const isDayToday = isToday(day);
              
              // Find events for this day
              const dayEvents = getEventsForDay(day);
              
              return (
                <div 
                  key={format(day, 'yyyy-MM-dd')} 
                  onClick={() => onSelectDay(day)} 
                  className={cn(
                    "min-h-[80px] p-1 cursor-pointer", 
                    !isCurrentMonth && "bg-gray-50 text-gray-400",
                    isSelected && "bg-blue-50",
                    isDayToday && "font-bold"
                  )}
                >
                  <div className={cn(
                    "text-right mb-1 text-xs",
                    isDayToday && "text-blue-600 font-bold"
                  )}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1 overflow-y-auto max-h-[66px]">
                    {dayEvents.slice(0, compactView ? 1 : 3).map(event => (
                      <div 
                        key={event.id} 
                        className={cn(
                          "text-xs p-1 rounded truncate", 
                          event.completed ? "bg-gray-100 text-gray-500" : 
                            event.type === "meeting" ? "bg-blue-50 text-blue-700" : 
                            event.type === "event" ? "bg-purple-50 text-purple-700" :
                            event.type === "holiday" ? "bg-red-50 text-red-700" :
                            event.type === "habit" ? "bg-green-50 text-green-700" :
                            "bg-amber-50 text-amber-700"
                        )} 
                        title={event.title}
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickAction(event.id, event.title);
                        }}
                      >
                        {event.start_time && `${event.start_time.substring(0, 5)} `}{event.title}
                      </div>
                    ))}
                    
                    {dayEvents.length > (compactView ? 1 : 3) && (
                      <div className="text-xs text-gray-500 text-center">
                        +{dayEvents.length - (compactView ? 1 : 3)} mais
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

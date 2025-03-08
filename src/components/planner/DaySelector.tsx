
import React from "react";
import { format, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface DaySelectorProps {
  visibleDays: Date[];
  selectedDate: Date | null;
  selectDay: (day: Date) => void;
  getTaskCountForDay?: (day: Date) => number;
}

// Dias da semana em formato minimalista
const WEEKDAY_LETTERS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function DaySelector({ 
  visibleDays, 
  selectedDate, 
  selectDay, 
  getTaskCountForDay 
}: DaySelectorProps) {
  return (
    <div className="px-6 py-4">
      <div className="flex justify-between">
        {visibleDays.map((day, index) => {
          if (!day || !selectedDate) return null;
          
          const isSelected = selectedDate && day 
            ? selectedDate.getDate() === day.getDate() && 
              selectedDate.getMonth() === day.getMonth() && 
              selectedDate.getFullYear() === day.getFullYear() 
            : false;
            
          const taskCount = getTaskCountForDay ? getTaskCountForDay(day) : 0;
          const dayOfWeek = day.getDay(); // 0 = Sunday, 1 = Monday, etc.
          const formattedDay = format(day, "d");
          const isCurrentDay = isToday(day);
          
          // Indicador de tarefa como um pequeno ponto roxo
          const hasTask = taskCount > 0;
          
          return (
            <motion.div 
              key={index} 
              className="flex flex-col items-center cursor-pointer"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => selectDay(day)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.05 }}
            >
              <span className="text-xs text-gray-500 mb-2 font-medium">
                {WEEKDAY_LETTERS[dayOfWeek]}
              </span>
              
              <div className="relative">
                <motion.div 
                  className={cn(
                    "w-12 h-12 flex items-center justify-center rounded-full transition-all duration-300",
                    isSelected 
                      ? 'bg-white text-black shadow-md' 
                      : 'bg-transparent text-gray-700'
                  )}
                  animate={{ 
                    scale: isSelected ? 1 : 0.9,
                    backgroundColor: isSelected ? 'rgba(255, 255, 255, 1)' : 'rgba(255, 255, 255, 0)'
                  }}
                  transition={{ duration: 0.2 }}
                >
                  <span className={cn(
                    "text-xl font-semibold",
                    isSelected ? "text-black" : "text-gray-800"
                  )}>
                    {formattedDay}
                  </span>
                </motion.div>
                
                {/* Indicador de tarefa como um pequeno ponto */}
                {hasTask && (
                  <motion.div 
                    className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-1 w-1.5 h-1.5 rounded-full bg-purple-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.2 }}
                  />
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

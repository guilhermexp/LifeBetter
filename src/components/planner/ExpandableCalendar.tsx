import React, { useState, useEffect } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ExpandableCalendarProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  getTaskCountForDay?: (day: Date) => number;
}

export function ExpandableCalendar({ selectedDate, onSelectDate, getTaskCountForDay }: ExpandableCalendarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(selectedDate);
  const [calendarDays, setCalendarDays] = useState<Date[]>([]);

  // Dias da semana em português
  const WEEKDAYS = ['D', 'S', 'T', 'Q', 'Q', 'S', 'S'];

  // Atualizar dias do calendário quando o mês atual mudar
  useEffect(() => {
    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(currentMonth);
    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    
    // Adicionar dias do mês anterior para preencher a primeira semana
    const firstDayOfWeek = monthStart.getDay();
    const prevMonthDays = [];
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(monthStart);
      date.setDate(monthStart.getDate() - (i + 1));
      prevMonthDays.push(date);
    }
    
    // Adicionar dias do próximo mês para preencher a última semana
    const lastDayOfWeek = monthEnd.getDay();
    const nextMonthDays = [];
    for (let i = 1; i < 7 - lastDayOfWeek; i++) {
      const date = new Date(monthEnd);
      date.setDate(monthEnd.getDate() + i);
      nextMonthDays.push(date);
    }
    
    setCalendarDays([...prevMonthDays, ...days, ...nextMonthDays]);
  }, [currentMonth]);

  // Navegar para o mês anterior
  const goToPreviousMonth = () => {
    const prevMonth = new Date(currentMonth);
    prevMonth.setMonth(prevMonth.getMonth() - 1);
    setCurrentMonth(prevMonth);
  };

  // Navegar para o próximo mês
  const goToNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    setCurrentMonth(nextMonth);
  };

  // Alternar entre visualização expandida e compacta
  const toggleExpanded = () => {
    setIsExpanded(!isExpanded);
  };

  // Selecionar uma data e fechar o calendário expandido
  const handleSelectDate = (date: Date) => {
    onSelectDate(date);
    setIsExpanded(false);
  };

  return (
    <div className="relative">
      {/* Visualização compacta (seletor de dias) */}
      <div 
        className={cn(
          "px-5 py-3 cursor-pointer transition-all duration-300",
          isExpanded ? "opacity-0 pointer-events-none" : "opacity-100"
        )}
        onClick={toggleExpanded}
      >
        <div className="flex justify-between">
          {calendarDays.slice(0, 7).map((day, index) => {
            const isSelected = isSameDay(selectedDate, day);
            const taskCount = getTaskCountForDay ? getTaskCountForDay(day) : 0;
            const dayOfWeek = day.getDay();
            const formattedDay = format(day, "d");
            const isCurrentDay = isToday(day);
            const isCurrentMonth = isSameMonth(day, currentMonth);
            
            // Indicador de tarefa como um pequeno ponto colorido
            const hasTask = taskCount > 0;
            
            return (
              <motion.div 
                key={index} 
                className="flex flex-col items-center"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.03 }}
              >
                <span className="text-xs text-gray-500 mb-1 font-medium">
                  {WEEKDAYS[dayOfWeek]}
                </span>
                
                <div className="relative">
                  <motion.div 
                    className={cn(
                      "w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200",
                      isSelected 
                        ? 'bg-primary shadow-sm' 
                        : isCurrentDay
                          ? 'bg-white shadow-sm'
                          : 'bg-transparent',
                      !isCurrentMonth && "opacity-40"
                    )}
                  >
                    <span className={cn(
                      "text-base font-medium",
                      isSelected 
                        ? "text-white" 
                        : isCurrentDay 
                          ? "text-primary" 
                          : dayOfWeek === 0 || dayOfWeek === 6  // Destaque para sábado e domingo
                            ? "text-purple-500" 
                            : "text-gray-800"
                    )}>
                      {formattedDay}
                    </span>
                  </motion.div>
                  
                  {/* Indicador de tarefa como um pequeno ponto */}
                  {hasTask && (
                    <motion.div 
                      className={cn(
                        "absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-0.5 w-1.5 h-1.5 rounded-full",
                        isSelected ? "bg-white" : "bg-primary"
                      )}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.2 }}
                    />
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Visualização expandida (calendário completo) */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div 
            className="absolute top-0 left-0 right-0 bg-white rounded-xl shadow-lg z-40"
            initial={{ opacity: 0, y: -20, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -20, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Cabeçalho do calendário */}
            <div className="flex items-center justify-between p-4 border-b">
              <button 
                onClick={goToPreviousMonth}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <ChevronLeft className="h-5 w-5 text-gray-600" />
              </button>
              
              <h3 className="text-lg font-medium">
                {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
              </h3>
              
              <button 
                onClick={goToNextMonth}
                className="p-1 rounded-full hover:bg-gray-100"
              >
                <ChevronRight className="h-5 w-5 text-gray-600" />
              </button>
            </div>
            
            {/* Dias da semana */}
            <div className="grid grid-cols-7 gap-1 p-2">
              {WEEKDAYS.map((day, index) => (
                <div key={index} className="text-center text-xs font-medium text-gray-500 py-1">
                  {day}
                </div>
              ))}
            </div>
            
            {/* Dias do mês */}
            <div className="grid grid-cols-7 gap-1 p-2">
              {calendarDays.map((day, index) => {
                const isSelected = isSameDay(selectedDate, day);
                const taskCount = getTaskCountForDay ? getTaskCountForDay(day) : 0;
                const isCurrentDay = isToday(day);
                const isCurrentMonth = isSameMonth(day, currentMonth);
                const hasTask = taskCount > 0;
                
                return (
                  <motion.div 
                    key={index}
                    className={cn(
                      "aspect-square flex flex-col items-center justify-center rounded-lg cursor-pointer relative",
                      isSelected ? "bg-primary" : isCurrentDay ? "bg-purple-100" : "hover:bg-gray-100",
                      !isCurrentMonth && "opacity-40"
                    )}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleSelectDate(day)}
                  >
                    <span className={cn(
                      "text-sm font-medium",
                      isSelected ? "text-white" : "text-gray-800"
                    )}>
                      {format(day, "d")}
                    </span>
                    
                    {/* Indicador de tarefa */}
                    {hasTask && (
                      <div className={cn(
                        "absolute bottom-1 w-1.5 h-1.5 rounded-full",
                        isSelected ? "bg-white" : "bg-primary"
                      )} />
                    )}
                  </motion.div>
                );
              })}
            </div>
            
            {/* Botão para fechar o calendário */}
            <div className="p-2 border-t text-center">
              <button 
                onClick={toggleExpanded}
                className="text-sm text-gray-600 hover:text-gray-900 py-2"
              >
                Fechar
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Overlay para fechar o calendário quando clicar fora */}
      {isExpanded && (
        <div 
          className="fixed inset-0 bg-black/20 z-30"
          onClick={toggleExpanded}
        />
      )}
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { format, startOfMonth } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface PlannerHeaderProps {
  currentMonth: Date | null;
  previousWeek: () => void;
  nextWeek: () => void;
}

export function PlannerHeader({
  currentMonth,
  previousWeek,
  nextWeek
}: PlannerHeaderProps) {
  const [displayMonth, setDisplayMonth] = useState<Date | null>(null);
  
  // Atualizar o mês exibido quando o currentMonth mudar
  useEffect(() => {
    if (currentMonth) {
      // Usar o primeiro dia do mês para garantir consistência na exibição
      const firstDayOfMonth = startOfMonth(currentMonth);
      setDisplayMonth(firstDayOfMonth);
    }
  }, [currentMonth]);
  
  // Format current month and year in Portuguese
  const formattedMonth = displayMonth ? format(displayMonth, "MMMM", {
    locale: ptBR
  }) : '';
  
  const formattedYear = displayMonth ? format(displayMonth, "yyyy") : '';
  
  return (
    <div className="px-5 pt-5 pb-3">
      <div className="flex items-center justify-between">
        <div>
          <AnimatePresence mode="wait">
            <motion.h1 
              key={`${formattedMonth}-${formattedYear}`}
              className="text-2xl font-semibold text-gray-800 capitalize"
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              transition={{ duration: 0.3 }}
            >
              {formattedMonth} {formattedYear}
            </motion.h1>
          </AnimatePresence>
        </div>
        
        <div className="flex items-center space-x-1">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={previousWeek}
          >
            <ChevronLeft className="h-4 w-4 text-gray-500" />
          </Button>
          
          <div className="bg-white rounded-full shadow-sm flex items-center p-1">
            <Button 
              variant="default"
              size="icon" 
              className="rounded-full h-8 w-8 bg-primary calendar-toggle-trigger"
            >
              <Calendar className="h-4 w-4 text-white" />
            </Button>
          </div>
          
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 rounded-full" 
            onClick={nextWeek}
          >
            <ChevronRight className="h-4 w-4 text-gray-500" />
          </Button>
        </div>
      </div>
    </div>
  );
}

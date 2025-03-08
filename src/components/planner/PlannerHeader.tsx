import React from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Calendar, List } from "lucide-react";
import { motion } from "framer-motion";

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
  // Format current month and year in Portuguese
  const formattedMonth = currentMonth ? format(currentMonth, "MMMM", {
    locale: ptBR
  }) : '';
  
  const formattedYear = currentMonth ? format(currentMonth, "yyyy") : '';
  
  return (
    <div className="px-6 pt-6 pb-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <motion.h1 
            className="text-4xl font-bold text-gray-800 capitalize mr-2"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {formattedMonth}
          </motion.h1>
          <motion.span 
            className="text-4xl font-bold text-gray-500"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            {formattedYear}
          </motion.span>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" className="rounded-full" onClick={previousWeek}>
            <ChevronLeft className="h-5 w-5 text-gray-600" />
          </Button>
          
          <div className="bg-white rounded-full shadow-md flex items-center p-1">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <Calendar className="h-5 w-5 text-gray-600" />
            </Button>
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9">
              <List className="h-5 w-5 text-gray-600" />
            </Button>
          </div>
          
          <Button variant="ghost" size="icon" className="rounded-full" onClick={nextWeek}>
            <ChevronRight className="h-5 w-5 text-gray-600" />
          </Button>
        </div>
      </div>
    </div>
  );
}

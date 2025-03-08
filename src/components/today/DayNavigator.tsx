
import React from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

interface DayNavigatorProps {
  selectedDate: Date;
  onPreviousDay: () => void;
  onNextDay: () => void;
}

export function DayNavigator({ selectedDate, onPreviousDay, onNextDay }: DayNavigatorProps) {
  const formattedDate = format(selectedDate, "EEEE, d 'de' MMMM", {
    locale: ptBR
  });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  
  const isToday = format(selectedDate, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');

  return (
    <div className="flex items-center justify-between mb-4 bg-white rounded-xl shadow-sm p-3">
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onPreviousDay}
          className="h-10 w-10 rounded-xl bg-gray-50 hover:bg-gray-100"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </Button>
      </motion.div>
      
      <motion.div 
        className="flex flex-col items-center"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        key={selectedDate.toISOString()}
      >
        <div className="flex items-center gap-2">
          <Calendar className="h-4 w-4 text-purple-500" />
          <p className="text-gray-700 font-bold">
            {capitalizedDate}
          </p>
        </div>
        
        {!isToday && (
          <motion.span 
            className="text-xs text-gray-500 mt-1 bg-gray-50 px-2 py-0.5 rounded-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Deslize para navegar entre os dias
          </motion.span>
        )}
        
        {isToday && (
          <motion.span 
            className="text-xs bg-purple-100 text-purple-700 font-medium px-2 py-0.5 rounded-full mt-1"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 500, damping: 15 }}
          >
            Hoje
          </motion.span>
        )}
      </motion.div>
      
      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
        <Button
          variant="ghost"
          size="icon"
          onClick={onNextDay}
          className="h-10 w-10 rounded-xl bg-gray-50 hover:bg-gray-100"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </Button>
      </motion.div>
    </div>
  );
}

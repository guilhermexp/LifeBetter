
import React from "react";
import { DetectedContext, TaskContextType } from "@/hooks/task-context/types";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Calendar, 
  Clock, 
  MapPin, 
  CheckSquare, 
  CalendarClock, 
  PartyPopper, 
  RefreshCw,
  Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface DetectedInfoCardProps {
  detectedContext: DetectedContext;
  taskType: TaskContextType;
  date?: Date | null;
  time?: string | null;
  location?: string | null;
}

export const DetectedInfoCard = ({ 
  detectedContext, 
  taskType, 
  date, 
  time, 
  location 
}: DetectedInfoCardProps) => {
  if (!detectedContext.title && !date && !time && !location) {
    return null;
  }

  const getTypeIcon = (type: TaskContextType) => {
    switch (type) {
      case "meeting":
        return <CalendarClock className="h-4 w-4 text-indigo-600" />;
      case "event":
        return <PartyPopper className="h-4 w-4 text-green-600" />;
      case "habit":
        return <RefreshCw className="h-4 w-4 text-amber-600" />;
      default:
        return <CheckSquare className="h-4 w-4 text-purple-600" />;
    }
  };

  const getTypeLabel = (type: TaskContextType) => {
    switch (type) {
      case "meeting":
        return "Reunião";
      case "event":
        return "Evento";
      case "habit":
        return "Hábito";
      default:
        return "Tarefa";
    }
  };

  const getTypeColor = (type: TaskContextType) => {
    switch (type) {
      case "meeting":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "event":
        return "bg-green-100 text-green-800 border-green-200";
      case "habit":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-purple-100 text-purple-800 border-purple-200";
    }
  };

  const getTypeGradient = (type: TaskContextType) => {
    switch (type) {
      case "meeting":
        return "from-indigo-50 to-blue-50";
      case "event":
        return "from-green-50 to-emerald-50";
      case "habit":
        return "from-amber-50 to-yellow-50";
      default:
        return "from-purple-50 to-indigo-50";
    }
  };

  const formatDateForDisplay = (date: Date) => {
    // Format like "Hoje", "Amanhã" or the day name for the next 7 days, otherwise use the date
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    
    if (dateToCheck.getTime() === today.getTime()) {
      return "Hoje";
    } else if (dateToCheck.getTime() === tomorrow.getTime()) {
      return "Amanhã";
    } else {
      // Check if date is within the next 7 days
      const daysDiff = Math.floor((dateToCheck.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysDiff > 0 && daysDiff < 7) {
        return format(dateToCheck, "EEEE", { locale: ptBR });
      } else {
        return format(dateToCheck, "dd 'de' MMMM", { locale: ptBR });
      }
    }
  };

  return (
    <motion.div 
      className={`bg-gradient-to-r ${getTypeGradient(taskType)} border border-gray-200 rounded-xl p-4 space-y-3 shadow-sm`}
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-gray-700 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-yellow-500" />
          Detectamos:
        </h3>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Badge className={`${getTypeColor(taskType)} border px-3 py-1 shadow-sm`}>
            {getTypeIcon(taskType)}
            <span className="ml-1 font-medium">{getTypeLabel(taskType)}</span>
          </Badge>
        </motion.div>
      </div>
      
      <div className="space-y-2">
        {date && (
          <motion.div 
            className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 px-3 py-2 rounded-lg"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.1 }}
          >
            <Calendar className="h-4 w-4 text-purple-500" />
            <span className="font-medium">{formatDateForDisplay(date)}</span>
          </motion.div>
        )}
        
        {time && (
          <motion.div 
            className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 px-3 py-2 rounded-lg"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.2 }}
          >
            <Clock className="h-4 w-4 text-purple-500" />
            <span className="font-medium">{time}</span>
          </motion.div>
        )}
        
        {location && (
          <motion.div 
            className="flex items-center gap-2 text-sm text-gray-700 bg-white/60 px-3 py-2 rounded-lg"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <MapPin className="h-4 w-4 text-purple-500" />
            <span className="font-medium">{location}</span>
          </motion.div>
        )}
      </div>
      
      <motion.p 
        className="text-xs text-gray-600 bg-white/80 px-3 py-2 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.4 }}
      >
        Você pode ajustar esses detalhes abaixo se necessário.
      </motion.p>
    </motion.div>
  );
};

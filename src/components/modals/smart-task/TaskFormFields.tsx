
import React from "react";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  CheckSquare, 
  CalendarClock, 
  PartyPopper,
  RefreshCw,
  MoreHorizontal,
  PencilLine
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { TaskContextType } from "@/hooks/task-context/types";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";

interface TaskFormFieldsProps {
  title: string;
  setTitle: (value: string) => void;
  date: Date | undefined;
  setDate: (value: Date | undefined) => void;
  time: string | null;
  setTime: (value: string | null) => void;
  location: string | null;
  setLocation: (value: string | null) => void;
  details: string;
  setDetails: (value: string) => void;
  taskType: TaskContextType;
  isCalendarOpen: boolean;
  setIsCalendarOpen: (value: boolean) => void;
}

export const TaskFormFields = ({
  title,
  setTitle,
  date,
  setDate,
  time,
  setTime,
  location,
  setLocation,
  details,
  setDetails,
  taskType,
  isCalendarOpen,
  setIsCalendarOpen
}: TaskFormFieldsProps) => {
  const getTypeIcon = (type: TaskContextType) => {
    switch (type) {
      case "meeting":
        return <CalendarClock className="h-5 w-5 text-indigo-600" />;
      case "event":
        return <PartyPopper className="h-5 w-5 text-green-600" />;
      case "habit":
        return <RefreshCw className="h-5 w-5 text-amber-600" />;
      default:
        return <CheckSquare className="h-5 w-5 text-purple-600" />;
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
        return "bg-indigo-50 text-indigo-600 border-indigo-200";
      case "event":
        return "bg-green-50 text-green-600 border-green-200";
      case "habit":
        return "bg-amber-50 text-amber-600 border-amber-200";
      default:
        return "bg-purple-50 text-purple-600 border-purple-200";
    }
  };

  return (
    <motion.div 
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Label htmlFor="task-title" className="text-gray-800 font-semibold">
          Título
        </Label>
        <div className="flex items-center gap-3">
          <motion.div 
            className={`p-2 rounded-lg ${getTypeColor(taskType)}`}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {getTypeIcon(taskType)}
          </motion.div>
          <Input
            id="task-title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Título da tarefa"
            className="flex-1 border-2 border-gray-200 focus:border-purple-400 rounded-xl py-5 px-4 shadow-sm"
          />
        </div>
      </motion.div>

      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <Label className="text-gray-800 font-semibold">Quando?</Label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Popover open={isCalendarOpen} onOpenChange={setIsCalendarOpen}>
              <PopoverTrigger asChild>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal border-2 border-gray-200 hover:border-purple-400 rounded-xl py-5 px-4 shadow-sm"
                  >
                    <CalendarIcon className="mr-2 h-5 w-5 text-purple-500" />
                    {date ? (
                      <span className="font-medium">{format(date, "PPP", { locale: ptBR })}</span>
                    ) : (
                      <span>Selecionar data</span>
                    )}
                  </Button>
                </motion.div>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 rounded-xl shadow-lg border-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => {
                    setDate(newDate);
                    setIsCalendarOpen(false);
                  }}
                  initialFocus
                  className="rounded-xl"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="sm:w-1/3">
            <motion.div 
              className="relative"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <Input
                type="time"
                value={time || ""}
                onChange={(e) => setTime(e.target.value || null)}
                className="pl-10 border-2 border-gray-200 focus:border-purple-400 rounded-xl py-5 shadow-sm"
              />
              <Clock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
            </motion.div>
          </div>
        </div>
      </motion.div>

      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Label htmlFor="task-location" className="text-gray-800 font-semibold">
          Local (opcional)
        </Label>
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Input
            id="task-location"
            value={location || ""}
            onChange={(e) => setLocation(e.target.value || null)}
            placeholder="Onde acontecerá?"
            className="pl-10 border-2 border-gray-200 focus:border-purple-400 rounded-xl py-5 shadow-sm"
          />
          <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-5 w-5" />
        </motion.div>
      </motion.div>

      <motion.div 
        className="space-y-3"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <Label htmlFor="task-details" className="text-gray-800 font-semibold">
          Detalhes (opcional)
        </Label>
        <motion.div 
          className="relative"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.2 }}
        >
          <Textarea
            id="task-details"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            placeholder="Alguma observação ou detalhe adicional?"
            className="min-h-[100px] pl-10 pt-3 border-2 border-gray-200 focus:border-purple-400 rounded-xl shadow-sm"
          />
          <PencilLine className="absolute left-3 top-3 text-purple-500 h-5 w-5" />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

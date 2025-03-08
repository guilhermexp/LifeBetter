
import React from "react";
import { cn } from "@/lib/utils";
import { TodoItem } from "@/types/today";
import { Check, CalendarClock, Calendar, Trash2, Clock, MoreVertical, Edit, CircleCheck, MapPin } from "lucide-react";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { confirmTaskForPlanner } from "@/components/modals/smart-task/taskUtils";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

interface TodoItemComponentProps {
  item: TodoItem;
  onToggleCompletion: (id: string, isCompleted: boolean, itemType: 'task' | 'habit') => void;
  onEdit: (item: TodoItem) => void;
  onDelete: (id: string, itemType: 'task' | 'habit') => void;
}

export const TodoItemComponent: React.FC<TodoItemComponentProps> = ({
  item,
  onToggleCompletion,
  onEdit,
  onDelete
}) => {
  const { toast } = useToast();
  
  // Handle confirming a task for the planner
  const handleConfirmForPlanner = async (event: React.MouseEvent) => {
    event.stopPropagation();
    
    try {
      await confirmTaskForPlanner(item.id);
      
      toast({
        title: item.itemType === 'task' ? "Tarefa confirmada" : "Hábito confirmado",
        description: item.frequency && item.frequency !== 'once'
          ? "Item enviado para o Planner e repetições criadas para os próximos períodos."
          : "Item enviado para o Planner."
      });
      
      // Local state update will happen on the next data refresh
    } catch (error) {
      console.error("Error confirming task for planner:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível confirmar a tarefa para o Planner."
      });
    }
  };
  
  const getItemIcon = () => {
    if (item.itemType === 'habit') {
      return <CalendarClock className="h-5 w-5 text-green-500" />;
    }
    
    switch (item.type) {
      case 'meeting':
        return <Calendar className="h-5 w-5 text-blue-500" />;
      case 'event':
        return <Calendar className="h-5 w-5 text-purple-500" />;
      default:
        return <Calendar className="h-5 w-5 text-indigo-500" />;
    }
  };
  
  const getFormattedTime = (time?: string) => {
    if (!time) return null;
    
    try {
      // Parse time string in format HH:MM
      const [hours, minutes] = time.split(':').map(Number);
      
      // Create a date object with the time
      const date = new Date();
      date.setHours(hours);
      date.setMinutes(minutes);
      
      // Format to 24-hour time
      return format(date, 'HH:mm');
    } catch (error) {
      console.error('Error formatting time:', error);
      return time;
    }
  };
  
  return (
    <motion.div 
      className={cn(
        "p-5 rounded-xl transition-all duration-300 bg-white shadow-md border-0",
        item.isCompleted ? "bg-gray-50" : "bg-white"
      )}
      whileHover={{ y: -2, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
      layout
    >
      <div className="flex items-start">
        <motion.button
          onClick={() => onToggleCompletion(item.id, item.isCompleted, item.itemType)}
          className={cn(
            "h-7 w-7 rounded-full flex items-center justify-center flex-shrink-0 mt-1",
            item.isCompleted 
              ? "bg-green-100 border-2 border-green-500" 
              : "border-2 border-gray-300 hover:border-purple-500"
          )}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
        >
          {item.isCompleted && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 500, damping: 15 }}
            >
              <Check className="h-3.5 w-3.5 text-green-600" />
            </motion.div>
          )}
        </motion.button>
        
        <div className="ml-4 flex-1">
          <div className="flex items-start justify-between">
            <div>
              <h3 className={cn(
                "font-semibold text-base",
                item.isCompleted ? "text-gray-500 line-through" : "text-gray-800"
              )}>
                {item.title}
              </h3>
              
              <div className="flex items-center mt-2 space-x-3">
                <span className="flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                  {getItemIcon()}
                  <span className="ml-1 capitalize">
                    {item.itemType === 'habit' ? 'Hábito' : item.type}
                  </span>
                </span>
                
                {item.start_time && (
                  <span className="flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                    <Clock className="h-3 w-3 mr-1" />
                    {getFormattedTime(item.start_time)}
                    {item.duration && ` (${item.duration} min)`}
                  </span>
                )}
                
                {item.location && (
                  <span className="flex items-center text-xs font-medium text-gray-600 bg-gray-100 px-2.5 py-1 rounded-full">
                    <MapPin className="h-3 w-3 mr-1" />
                    {item.location}
                  </span>
                )}
                
                {item.frequency && item.frequency !== 'once' && (
                  <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2.5 py-1 rounded-full">
                    {item.frequency === 'daily' ? 'Diário' : 
                     item.frequency === 'weekly' ? 'Semanal' : 
                     item.frequency === 'monthly' ? 'Mensal' : 'Customizado'}
                  </span>
                )}
              </div>
              
              {item.details && (
                <p className={cn(
                  "mt-2 text-sm",
                  item.isCompleted ? "text-gray-400" : "text-gray-600"
                )}>
                  {item.details}
                </p>
              )}
            </div>

            <div className="flex items-center">
              {/* Show confirm for planner button if item is inbox_only */}
              {item.inbox_only && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mr-1 h-9 border-gray-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200 rounded-xl"
                    onClick={handleConfirmForPlanner}
                  >
                    <CircleCheck className="h-4 w-4 mr-1" />
                    <span className="text-xs">Confirmar</span>
                  </Button>
                </motion.div>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    <Button variant="ghost" size="sm" className="h-9 w-9 rounded-xl">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </motion.div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40 rounded-xl">
                  <DropdownMenuItem onClick={() => onEdit(item)}>
                    <Edit className="h-4 w-4 mr-2" />
                    <span>Editar</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onDelete(item.id, item.itemType)}
                    className="text-red-600 focus:text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    <span>Excluir</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};


import React from "react";
import { cn } from "@/lib/utils";
import { CheckCircle, Circle } from "lucide-react";
import { TaskItem } from "./TaskItem";
import { motion } from "framer-motion";

interface TaskTimelineItemProps {
  task: TaskItem;
  onClick: () => void;
  onToggleCompletion: (id: string, currentStatus: boolean) => void;
}

export function TaskTimelineItem({ task, onClick, onToggleCompletion }: TaskTimelineItemProps) {
  const { id, title, details, completed, isGoogleEvent } = task;
  
  const handleToggleCompletion = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isGoogleEvent) {
      onToggleCompletion(id, !!completed);
    }
  };
  
  return (
    <motion.div 
      className={cn(
        "rounded-lg px-4 py-2.5 transition-all duration-200 cursor-pointer bg-white shadow-sm",
        completed ? "opacity-80" : ""
      )}
      onClick={onClick}
      whileHover={{ y: -1, boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)" }}
      whileTap={{ scale: 0.99 }}
    >
      <div className="flex items-center justify-between">
        {/* Título da tarefa */}
        <h3 className={cn(
          "text-base font-medium",
          completed ? "text-gray-500 line-through" : "text-gray-800"
        )}>
          {title}
        </h3>
        
        {/* Checkbox de conclusão */}
        <div 
          className={cn(
            "flex-shrink-0 transition-colors rounded-full border h-5 w-5 flex items-center justify-center",
            completed ? "border-green-500 bg-green-50" : "border-gray-300 bg-white",
            isGoogleEvent ? "cursor-not-allowed" : "cursor-pointer"
          )}
          onClick={handleToggleCompletion}
          title={isGoogleEvent ? "Eventos do Google Calendar não podem ser marcados como concluídos" : ""}
        >
          {completed ? 
            <CheckCircle className="h-3.5 w-3.5 text-green-500" /> : 
            <Circle className="h-3.5 w-3.5 text-gray-300" />
          }
        </div>
      </div>
    </motion.div>
  );
}

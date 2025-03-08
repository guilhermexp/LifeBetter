
import { useState } from "react";
import { format } from "date-fns";
import { TaskType } from "@/components/TaskTypeSelector";
import { useToast } from "@/hooks/use-toast";

export function useTaskCreator() {
  const [isTaskTypeSelectorOpen, setIsTaskTypeSelectorOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  
  const handleTaskTypeSelect = (type: TaskType) => {
    switch(type) {
      case "meeting":
        setIsMeetingModalOpen(true);
        break;
      case "task":
        setIsTaskModalOpen(true);
        break;
      case "event":
        setIsEventModalOpen(true);
        break;
      case "habit":
        setIsHabitModalOpen(true);
        break;
      default:
        break;
    }
  };
  
  const handleOpenTaskSelector = () => {
    setIsTaskTypeSelectorOpen(true);
  };

  return {
    isTaskTypeSelectorOpen,
    setIsTaskTypeSelectorOpen,
    isMeetingModalOpen,
    setIsMeetingModalOpen,
    isTaskModalOpen,
    setIsTaskModalOpen,
    isEventModalOpen,
    setIsEventModalOpen,
    isHabitModalOpen,
    setIsHabitModalOpen,
    handleTaskTypeSelect,
    handleOpenTaskSelector
  };
}

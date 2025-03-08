
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export function useTodayAdd(setTasks: React.Dispatch<React.SetStateAction<any[]>>) {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTaskData, setNewTaskData] = useState({
    title: "",
    details: "",
    type: "task",
    date: "",
    time: ""
  });
  
  const [isTaskTypeSelectorOpen, setIsTaskTypeSelectorOpen] = useState(false);
  const [isMeetingModalOpen, setIsMeetingModalOpen] = useState(false);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [isHabitModalOpen, setIsHabitModalOpen] = useState(false);
  
  const { toast } = useToast();
  
  const handleAddTask = () => {
    setNewTaskData({
      title: "",
      details: "",
      type: "task",
      date: "",
      time: ""
    });
    setShowAddDialog(true);
  };
  
  const saveNewTask = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para criar uma tarefa.",
          variant: "destructive"
        });
        return;
      }
      
      if (!newTaskData.title.trim()) {
        toast({
          title: "Erro",
          description: "O título da tarefa é obrigatório.",
          variant: "destructive"
        });
        return;
      }
      
      // Format the date if it exists
      let scheduledDate = null;
      if (newTaskData.date) {
        scheduledDate = newTaskData.date;
      } else {
        scheduledDate = new Date().toISOString().split('T')[0]; // Today's date by default
      }
      
      // Insert based on task type
      if (newTaskData.type === "habit") {
        const { error } = await supabase
          .from("daily_routines")
          .insert({
            user_id: user.id,
            title: newTaskData.title,
            description: newTaskData.details,
            scheduled_date: scheduledDate, // Changed from start_date to scheduled_date
            start_time: newTaskData.time || null,
            frequency: "daily",
            completed: false,
            category: "habit" // Added category field
          });
          
        if (error) throw error;
        
        toast({
          title: "Hábito adicionado",
          description: "O hábito foi adicionado com sucesso!",
        });
      } else {
        // For task, meeting, event
        const { error } = await supabase
          .from("tasks")
          .insert({
            user_id: user.id,
            title: newTaskData.title,
            details: newTaskData.details,
            type: newTaskData.type,
            status: "pending",
            scheduled_date: scheduledDate,
            start_time: newTaskData.time || null
          });
          
        if (error) throw error;
        
        toast({
          title: "Atividade adicionada",
          description: "A atividade foi adicionada com sucesso!",
        });
      }
      
      // Close the dialog and refresh tasks
      setShowAddDialog(false);
      
      // Refresh tasks
      const { data: updatedTasks } = await supabase
        .from("tasks")
        .select("*")
        .eq("user_id", user.id)
        .order("scheduled_date", { ascending: true });
        
      if (updatedTasks) {
        setTasks(updatedTasks);
      }
    } catch (error) {
      console.error("Error creating task:", error);
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao criar a atividade. Tente novamente.",
        variant: "destructive"
      });
    }
  };
  
  return {
    showAddDialog,
    setShowAddDialog,
    newTaskData,
    setNewTaskData,
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
    handleAddTask,
    saveNewTask
  };
}

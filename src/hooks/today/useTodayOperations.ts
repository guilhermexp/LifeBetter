
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Task } from "@/types/today";

export function useTodayOperations(
  setCompletedTasks: React.Dispatch<React.SetStateAction<string[]>>,
  setCompletedHabits: React.Dispatch<React.SetStateAction<string[]>>,
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setHabits: React.Dispatch<React.SetStateAction<any[]>>,
  fetchTasks: () => Promise<void>,
  fetchHabits: () => Promise<void>
) {
  const { toast } = useToast();
  
  const toggleTaskCompletion = async (taskId: string, currentStatus: boolean) => {
    try {
      setCompletedTasks(prev => 
        currentStatus ? prev.filter(id => id !== taskId) : [...prev, taskId]
      );
      
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !currentStatus })
        .eq('id', taskId);
        
      if (error) throw error;
      fetchTasks();
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar a tarefa."
      });
      fetchTasks();
    }
  };
  
  const toggleHabitCompletion = async (habitId: string, currentStatus: boolean) => {
    try {
      setCompletedHabits(prev => 
        currentStatus ? prev.filter(id => id !== habitId) : [...prev, habitId]
      );
      
      const { error } = await supabase
        .from('daily_routines')
        .update({ completed: !currentStatus })
        .eq('id', habitId);
        
      if (error) throw error;
      fetchHabits();
    } catch (error) {
      console.error("Erro ao atualizar hábito:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar o hábito."
      });
      fetchHabits();
    }
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) throw error;
      
      setTasks(prev => prev.filter(task => task.id !== taskId));
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida com sucesso."
      });
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir a tarefa."
      });
    }
  };
  
  const handleDeleteHabit = async (habitId: string) => {
    try {
      const { error } = await supabase
        .from('daily_routines')
        .delete()
        .eq('id', habitId);
        
      if (error) throw error;
      
      setHabits(prev => prev.filter(habit => habit.id !== habitId));
      toast({
        title: "Hábito excluído",
        description: "O hábito foi removido com sucesso."
      });
    } catch (error) {
      console.error("Erro ao excluir hábito:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir o hábito."
      });
    }
  };
  
  return {
    toggleTaskCompletion,
    toggleHabitCompletion,
    handleDeleteTask,
    handleDeleteHabit
  };
}

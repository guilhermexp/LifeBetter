
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
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
  
  // Função para confirmar uma tarefa da inbox e movê-la para o planner
  const confirmTaskToPlanner = async (taskId: string, scheduledDate?: Date) => {
    try {
      // Buscar a tarefa atual
      const { data: taskData, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('id', taskId)
        .single();
        
      if (fetchError) throw fetchError;
      
      if (!taskData) {
        throw new Error("Tarefa não encontrada");
      }
      
      // Se a tarefa já está agendada para o planner, não faz nada
      if (taskData.scheduled === true) {
        toast({
          title: "Tarefa já confirmada",
          description: "Esta tarefa já está confirmada no planner."
        });
        return;
      }
      
      // Formatar a data agendada (usar a data fornecida ou a data atual)
      const formattedDate = scheduledDate 
        ? format(scheduledDate, "yyyy-MM-dd") 
        : format(new Date(), "yyyy-MM-dd");
      
      // Atualizar a tarefa para aparecer no planner
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ 
          scheduled: true,  
          scheduled_date: formattedDate
        })
        .eq('id', taskId);
        
      if (updateError) throw updateError;
      
      // Atualizar a UI
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, scheduled: true, scheduled_date: formattedDate } 
          : task
      ));
      
      toast({
        title: "Tarefa confirmada",
        description: "A tarefa foi movida para o planner com sucesso."
      });
      
      // Recarregar tarefas para garantir sincronização
      fetchTasks();
      
    } catch (error) {
      console.error("Erro ao confirmar tarefa para o planner:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível confirmar a tarefa para o planner."
      });
    }
  };
  
  return {
    toggleTaskCompletion,
    toggleHabitCompletion,
    handleDeleteTask,
    handleDeleteHabit,
    confirmTaskToPlanner
  };
}

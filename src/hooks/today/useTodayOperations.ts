
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { confirmTaskForPlanner, removeTaskFromPlanner, deleteTaskAndAllInstances } from "@/components/modals/smart-task/utils/taskManagement";
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
      // Buscar a tarefa para verificar se é recorrente
      const { data: taskData, error: fetchError } = await supabase
        .from('tasks')
        .select('frequency')
        .eq('id', taskId)
        .single();
        
      if (fetchError) throw fetchError;
      
      // Se a tarefa for recorrente, usar o método para excluir todas as instâncias
      if (taskData && taskData.frequency && taskData.frequency !== 'once') {
        const result = await deleteTaskAndAllInstances(taskId);
        
        if (result.success) {
          setTasks(prev => prev.filter(task => task.id !== taskId));
          toast({
            title: "Tarefa recorrente excluída",
            description: "A tarefa e todas as suas instâncias foram removidas com sucesso."
          });
        }
      } else {
        // Para tarefas não recorrentes, usar a exclusão simples
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
      }
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
      // Chamar a função confirmTaskForPlanner que também cria instâncias futuras
      const result = await confirmTaskForPlanner(taskId, scheduledDate);
      
      // Buscar a tarefa para obter sua frequência
      const { data: taskData } = await supabase
        .from('tasks')
        .select('frequency')
        .eq('id', taskId)
        .single();
      
      if (result && result.success) {
        // Atualizar a UI localmente
        setTasks(prev => prev.map(task => {
          if (task.id === taskId) {
            const formattedDate = scheduledDate 
              ? format(scheduledDate, "yyyy-MM-dd") 
              : format(new Date(), "yyyy-MM-dd");
              
            return { 
              ...task, 
              scheduled: true, 
              scheduled_date: formattedDate 
            };
          }
          return task;
        }));
        
        const isRecurring = taskData && taskData.frequency && taskData.frequency !== 'once';
        
        toast({
          title: "Tarefa confirmada",
          description: isRecurring
            ? "A tarefa recorrente foi adicionada ao planner com todas as suas instâncias."
            : "A tarefa foi movida para o planner com sucesso."
        });
        
        // Recarregar tarefas para garantir sincronização com instâncias
        fetchTasks();
      }
    } catch (error) {
      console.error("Erro ao confirmar tarefa para o planner:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível confirmar a tarefa para o planner."
      });
    }
  };
  
  // Função para remover uma tarefa do planner (torná-la apenas inbox)
  const removeFromPlanner = async (taskId: string) => {
    try {
      // Chamar a função que remove do planner e apaga instâncias recorrentes
      const result = await removeTaskFromPlanner(taskId);
      
      if (result && result.success) {
        // Atualizar a UI localmente
        setTasks(prev => prev.map(task => {
          if (task.id === taskId) {
            return { 
              ...task, 
              scheduled: false 
            };
          }
          return task;
        }));
        
        toast({
          title: "Tarefa removida do planner",
          description: "A tarefa agora está apenas na inbox. Todas as instâncias futuras foram removidas."
        });
        
        // Recarregar tarefas para garantir sincronização
        fetchTasks();
      }
    } catch (error) {
      console.error("Erro ao remover tarefa do planner:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível remover a tarefa do planner."
      });
    }
  };
  
  return {
    toggleTaskCompletion,
    toggleHabitCompletion,
    handleDeleteTask,
    handleDeleteHabit,
    confirmTaskToPlanner,
    removeFromPlanner
  };
}

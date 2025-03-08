
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

// Define the type for task counts
export interface TaskCount {
  total: number;
  completed: number;
  pending: number;
  today: number;
  overdue: number;
}

const defaultTaskCounts: TaskCount = {
  total: 0,
  completed: 0,
  pending: 0,
  today: 0,
  overdue: 0
};

export function useTasks() {
  const [allTasks, setAllTasks] = useState<any[]>([]);
  const [taskCounts, setTaskCounts] = useState<TaskCount>(defaultTaskCounts);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Versão simplificada para maior confiabilidade
  const fetchTasks = useCallback(async () => {
    try {
      console.log("Iniciando busca de tarefas");
      setIsLoading(true);
      setError(null);
      
      // Limpar o cache local para garantir dados frescos
      setAllTasks([]);
      setTaskCounts(defaultTaskCounts);
      
      // Obter usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("Usuário não autenticado");
        throw new Error("Usuário não autenticado");
      }

      // Buscar tarefas de forma simplificada
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (fetchError) {
        console.error("Erro ao buscar tarefas:", fetchError);
        throw fetchError;
      }

      // Atualize os dados com o que recebemos ou lista vazia em caso de nulo
      const tasks = data || [];
      setAllTasks(tasks);
      
      // Calcular contagens básicas
      if (tasks.length > 0) {
        const today = format(new Date(), 'yyyy-MM-dd');
        
        const total = tasks.length;
        const pending = tasks.filter(task => !task.completed).length;
        const completed = total - pending;
        const todayTasks = tasks.filter(task => 
          !task.completed && task.scheduled_date === today
        ).length;
        const overdueTasks = tasks.filter(task => 
          !task.completed && 
          task.scheduled_date && 
          task.scheduled_date < today
        ).length;
        
        setTaskCounts({
          total,
          completed,
          pending,
          today: todayTasks,
          overdue: overdueTasks
        });
      }
      
      console.log("Busca de tarefas concluída com sucesso");
      return tasks;
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      setError("Não foi possível carregar suas tarefas.");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar suas tarefas."
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  // Versão simplificada de toggleTaskCompletion
  const toggleTaskCompletion = useCallback(async (taskId: string, currentStatus: boolean) => {
    try {
      // Atualização no banco de dados
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ completed: !currentStatus })
        .eq('id', taskId);

      if (updateError) throw updateError;
      
      // Se deu certo, recarregue todos os dados
      // Em vez de tentar manter o estado sincronizado manualmente
      fetchTasks();
      
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar a tarefa."
      });
    }
  }, [fetchTasks, toast]);

  return { 
    allTasks: allTasks || [], 
    taskCounts: taskCounts || defaultTaskCounts, 
    fetchTasks, 
    toggleTaskCompletion,
    isLoading,
    setIsLoading,
    error
  };
}

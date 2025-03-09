import { useState, useCallback, useMemo, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { useUser } from "@/providers/UserProvider";
import { useRefresh } from "@/providers/RefreshProvider";

// Definir o tipo para Task
export interface Task {
  id: string;
  title: string;
  description?: string | null;
  completed: boolean;
  scheduled_date: string;
  start_time?: string | null;
  priority?: string | null;
  user_id: string;
  created_at: string;
  updated_at?: string | null;
  [key: string]: any;
}

// Definir o tipo para contagens de tarefas
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

/**
 * Hook otimizado para gerenciar tarefas
 * 
 * Características:
 * - Cache de dados com invalidação automática
 * - Cálculo de estatísticas otimizado
 * - Tratamento de erros melhorado
 * - Integração com o sistema de refresh
 */
export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useUser();
  const { refreshTasks } = useRefresh();
  
  // Função memoizada para buscar tarefas
  const fetchTasks = useCallback(async () => {
    if (!user) return [];
    
    try {
      setIsLoading(true);
      setError(null);
      
      // Buscar tarefas do usuário atual
      const { data, error: fetchError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .order('scheduled_date', { ascending: true });

      if (fetchError) throw fetchError;

      // Atualizar estado com as tarefas
      const tasksList = data || [];
      setTasks(tasksList);
      return tasksList;
    } catch (error: any) {
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
  }, [user, toast]);

  // Função memoizada para alternar o status de conclusão de uma tarefa
  const toggleTaskCompletion = useCallback(async (taskId: string, currentStatus: boolean) => {
    try {
      // Otimistic UI update
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, completed: !currentStatus } 
            : task
        )
      );
      
      // Atualização no banco de dados
      const { error: updateError } = await supabase
        .from('tasks')
        .update({ 
          completed: !currentStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', taskId);

      if (updateError) {
        // Reverter mudança em caso de erro
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? { ...task, completed: currentStatus } 
              : task
          )
        );
        throw updateError;
      }
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar a tarefa."
      });
    }
  }, [toast]);
  
  // Função memoizada para adicionar uma nova tarefa
  const addTask = useCallback(async (taskData: Omit<Task, 'id' | 'created_at' | 'user_id'>) => {
    if (!user) return null;
    
    try {
      // Garantir que as propriedades obrigatórias estejam presentes
      if (!taskData.title || !taskData.scheduled_date) {
        throw new Error("Título e data agendada são obrigatórios");
      }
      
      const newTask = {
        ...taskData,
        user_id: user.id,
        created_at: new Date().toISOString(),
        // Garantir que propriedades obrigatórias estejam presentes
        title: taskData.title,
        scheduled_date: taskData.scheduled_date,
        // Valores padrão para propriedades opcionais
        completed: taskData.completed ?? false
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(newTask)
        .select()
        .single();
        
      if (error) throw error;
      
      // Atualizar estado local
      setTasks(prevTasks => [...prevTasks, data]);
      
      toast({
        title: "Tarefa adicionada",
        description: "Sua tarefa foi adicionada com sucesso."
      });
      
      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível adicionar a tarefa."
      });
      return null;
    }
  }, [user, toast]);
  
  // Função memoizada para atualizar uma tarefa existente
  const updateTask = useCallback(async (taskId: string, taskData: Partial<Task>) => {
    if (!user) return null;
    
    try {
      // Encontrar a tarefa atual para fazer o merge com as atualizações
      const currentTask = tasks.find(task => task.id === taskId);
      if (!currentTask) {
        throw new Error("Tarefa não encontrada");
      }
      
      // Preparar dados para atualização
      const updatedTaskData = {
        ...taskData,
        updated_at: new Date().toISOString()
      };
      
      // Otimistic UI update
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === taskId 
            ? { ...task, ...updatedTaskData } 
            : task
        )
      );
      
      // Atualização no banco de dados
      const { data, error } = await supabase
        .from('tasks')
        .update(updatedTaskData)
        .eq('id', taskId)
        .select()
        .single();
        
      if (error) {
        // Reverter mudança em caso de erro
        setTasks(prevTasks => 
          prevTasks.map(task => 
            task.id === taskId 
              ? currentTask 
              : task
          )
        );
        throw error;
      }
      
      toast({
        title: "Tarefa atualizada",
        description: "Sua tarefa foi atualizada com sucesso."
      });
      
      return data;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível atualizar a tarefa."
      });
      return null;
    }
  }, [user, tasks, toast]);
  
  // Função memoizada para excluir uma tarefa
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      // Salvar a tarefa antes de remover (para poder restaurar em caso de erro)
      const taskToDelete = tasks.find(task => task.id === taskId);
      if (!taskToDelete) {
        throw new Error("Tarefa não encontrada");
      }
      
      // Otimistic UI update
      setTasks(prevTasks => prevTasks.filter(task => task.id !== taskId));
      
      // Excluir do banco de dados
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
        
      if (error) {
        // Restaurar a tarefa em caso de erro
        setTasks(prevTasks => [...prevTasks, taskToDelete]);
        throw error;
      }
      
      toast({
        title: "Tarefa excluída",
        description: "Sua tarefa foi excluída com sucesso."
      });
      
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível excluir a tarefa."
      });
      return false;
    }
  }, [tasks, toast]);
  
  // Função para excluir várias tarefas de uma vez
  const deleteManyTasks = useCallback(async (taskIds: string[]) => {
    if (!taskIds.length) return false;
    
    try {
      // Salvar as tarefas antes de remover
      const tasksToDelete = tasks.filter(task => taskIds.includes(task.id));
      if (!tasksToDelete.length) {
        throw new Error("Nenhuma tarefa encontrada para excluir");
      }
      
      // Otimistic UI update
      setTasks(prevTasks => prevTasks.filter(task => !taskIds.includes(task.id)));
      
      // Excluir do banco de dados
      const { error } = await supabase
        .from('tasks')
        .delete()
        .in('id', taskIds);
        
      if (error) {
        // Restaurar as tarefas em caso de erro
        setTasks(prevTasks => [...prevTasks, ...tasksToDelete]);
        throw error;
      }
      
      toast({
        title: "Tarefas excluídas",
        description: `${taskIds.length} tarefas foram excluídas com sucesso.`
      });
      
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível excluir as tarefas."
      });
      return false;
    }
  }, [tasks, toast]);
  
  // Função para marcar várias tarefas como concluídas de uma vez
  const completeMultipleTasks = useCallback(async (taskIds: string[]) => {
    if (!taskIds.length) return false;
    
    try {
      // Otimistic UI update
      setTasks(prevTasks => 
        prevTasks.map(task => 
          taskIds.includes(task.id) 
            ? { ...task, completed: true } 
            : task
        )
      );
      
      // Atualização no banco de dados
      const { error } = await supabase
        .from('tasks')
        .update({ 
          completed: true,
          updated_at: new Date().toISOString()
        })
        .in('id', taskIds);
        
      if (error) {
        // Reverter mudanças em caso de erro
        fetchTasks();
        throw error;
      }
      
      toast({
        title: "Tarefas concluídas",
        description: `${taskIds.length} tarefas foram marcadas como concluídas.`
      });
      
      return true;
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: error.message || "Não foi possível atualizar as tarefas."
      });
      return false;
    }
  }, [fetchTasks, toast]);
  
  // Calcular contagens de tarefas de forma memoizada
  const taskCounts = useMemo<TaskCount>(() => {
    if (!tasks.length) return defaultTaskCounts;
    
    const today = format(new Date(), 'yyyy-MM-dd');
    
    const total = tasks.length;
    const completed = tasks.filter(task => task.completed).length;
    const pending = total - completed;
    const todayTasks = tasks.filter(task => 
      !task.completed && task.scheduled_date === today
    ).length;
    const overdueTasks = tasks.filter(task => 
      !task.completed && 
      task.scheduled_date && 
      task.scheduled_date < today
    ).length;
    
    return {
      total,
      completed,
      pending,
      today: todayTasks,
      overdue: overdueTasks
    };
  }, [tasks]);
  
  // Efeito para buscar tarefas quando o componente montar ou quando refreshTasks mudar
  useEffect(() => {
    if (user) {
      fetchTasks();
    }
  }, [fetchTasks, user, refreshTasks]);

  return { 
    allTasks: tasks, 
    taskCounts, 
    fetchTasks, 
    toggleTaskCompletion,
    addTask,
    updateTask,
    deleteTask,
    deleteManyTasks,
    completeMultipleTasks,
    isLoading,
    error
  };
}

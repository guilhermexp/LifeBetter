import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

/**
 * Confirma uma tarefa para o planner, atualizando seu status e data agendada
 * @param taskId ID da tarefa a ser confirmada
 * @param scheduledDate Data opcional para agendar a tarefa (usa a data atual se não fornecida)
 */
export const confirmTaskForPlanner = async (taskId: string, scheduledDate?: Date) => {
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
      console.log("Tarefa já está confirmada no planner");
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

    // Se a tarefa for recorrente, criar instâncias futuras
    if (taskData.frequency && taskData.frequency !== 'once') {
      // Importar dinamicamente para evitar problemas de dependência circular
      const { createFutureTaskInstances } = await import('./taskInstances');
      
      // Criar instâncias futuras baseadas na frequência
      await createFutureTaskInstances(
        taskId,
        taskData.user_id,
        taskData.frequency,
        scheduledDate || new Date(taskData.scheduled_date),
        taskData.title,
        taskData.details || '',
        taskData.type,
        taskData.start_time,
        taskData.location,
        typeof taskData.duration === 'string' ? 
          parseInt(taskData.duration) : 
          taskData.duration
      );
      
      console.log("Instâncias futuras criadas para tarefa recorrente");
    }
    
    return { success: true, message: "Tarefa confirmada com sucesso" };
  } catch (error) {
    console.error("Erro ao confirmar tarefa para o planner:", error);
    throw error;
  }
};

/**
 * Atualiza todos os exemplares de uma tarefa recorrente
 * @param taskId ID da tarefa mestre
 * @param updateData Dados a serem atualizados
 */
export const updateAllTaskInstances = async (taskId: string, updateData: any) => {
  try {
    // Primeiro, obtenha a tarefa original para ver seu título e user_id
    const { data: originalTask, error: fetchError } = await supabase
      .from('tasks')
      .select('title, user_id')
      .eq('id', taskId)
      .single();
      
    if (fetchError) throw fetchError;
    
    if (!originalTask) {
      throw new Error("Tarefa original não encontrada");
    }
    
    // Atualiza todas as instâncias com o mesmo título e user_id
    const { error: updateError } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('title', originalTask.title)
      .eq('user_id', originalTask.user_id);
      
    if (updateError) throw updateError;
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar todas as instâncias:", error);
    throw error;
  }
};

/**
 * Exclui todos os exemplares de uma tarefa recorrente
 * @param taskId ID da tarefa original
 */
export const deleteAllTaskInstances = async (taskId: string) => {
  try {
    // Primeiro, obtenha a tarefa original para ver seu título e user_id
    const { data: originalTask, error: fetchError } = await supabase
      .from('tasks')
      .select('title, user_id')
      .eq('id', taskId)
      .single();
      
    if (fetchError) throw fetchError;
    
    if (!originalTask) {
      throw new Error("Tarefa original não encontrada");
    }
    
    // Exclui todas as instâncias com o mesmo título e user_id
    const { error: deleteError } = await supabase
      .from('tasks')
      .delete()
      .eq('title', originalTask.title)
      .eq('user_id', originalTask.user_id);
      
    if (deleteError) throw deleteError;
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao excluir todas as instâncias:", error);
    throw error;
  }
};

/**
 * Atualiza uma tarefa para aparecer no planner
 * @param taskId ID da tarefa
 * @param scheduledDate Data agendada
 */
export const updateTaskToPlanner = async (taskId: string, scheduledDate: Date) => {
  try {
    const formattedDate = format(scheduledDate, "yyyy-MM-dd");
    
    const { error } = await supabase
      .from('tasks')
      .update({
        scheduled: true,
        scheduled_date: formattedDate
      })
      .eq('id', taskId);
      
    if (error) throw error;
    
    return { success: true };
  } catch (error) {
    console.error("Erro ao atualizar tarefa para o planner:", error);
    throw error;
  }
};

/**
 * Remove uma tarefa do planner (torna-a apenas inbox)
 * @param taskId ID da tarefa
 */
export const removeTaskFromPlanner = async (taskId: string) => {
  try {
    // Buscar a tarefa atual para obter detalhes
    const { data: taskData, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();
      
    if (fetchError) throw fetchError;
    
    if (!taskData) {
      throw new Error("Tarefa não encontrada");
    }
    
    // Atualizar a tarefa mestre para não aparecer no planner
    const { error: updateError } = await supabase
      .from('tasks')
      .update({ 
        scheduled: false,  
        // Mantemos scheduled_date como estava
      })
      .eq('id', taskId);
      
    if (updateError) throw updateError;
    
    // Se a tarefa for recorrente e for a tarefa mestre, remover todas as instâncias
    if (taskData.frequency && taskData.frequency !== 'once' && !taskData.parent_task_id) {
      // Remover todas as instâncias criadas a partir desta tarefa mestre
      const { error: deleteInstancesError } = await supabase
        .from('tasks')
        .delete()
        .eq('parent_task_id', taskId);
        
      if (deleteInstancesError) {
        console.error("Erro ao remover instâncias da tarefa:", deleteInstancesError);
        // Não lançamos erro aqui para não impedir a atualização da tarefa mestre
      } else {
        console.log("Instâncias futuras removidas para tarefa recorrente");
      }
    }
    
    return { success: true, message: "Tarefa removida do planner com sucesso" };
  } catch (error) {
    console.error("Erro ao remover tarefa do planner:", error);
    throw error;
  }
};

/**
 * Exclui completamente uma tarefa e todas as suas instâncias
 * @param taskId ID da tarefa
 */
export const deleteTaskAndAllInstances = async (taskId: string) => {
  try {
    // Buscar detalhes da tarefa
    const { data: taskData, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();
      
    if (fetchError) throw fetchError;
    
    if (!taskData) {
      throw new Error("Tarefa não encontrada");
    }
    
    // Se for uma tarefa filha, encontrar a tarefa mestre
    const masterTaskId = taskData.parent_task_id || taskId;
    
    // Primeiro excluir todas as instâncias (filhas)
    if (!taskData.parent_task_id) { // Se for a tarefa mestre
      const { error: deleteChildrenError } = await supabase
        .from('tasks')
        .delete()
        .eq('parent_task_id', masterTaskId);
        
      if (deleteChildrenError) {
        console.error("Erro ao excluir instâncias:", deleteChildrenError);
      }
    }
    
    // Agora excluir a tarefa principal/mestre
    const { error: deleteTaskError } = await supabase
      .from('tasks')
      .delete()
      .eq('id', masterTaskId);
      
    if (deleteTaskError) throw deleteTaskError;
    
    return { success: true, message: "Tarefa e todas as instâncias excluídas com sucesso" };
  } catch (error) {
    console.error("Erro ao excluir tarefa e instâncias:", error);
    throw error;
  }
};

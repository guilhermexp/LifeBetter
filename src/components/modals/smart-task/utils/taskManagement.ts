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
      // Implementar lógica para criar instâncias futuras
      // Isso poderia chamar createFutureTaskInstances de taskInstances.ts
      console.log("Tarefa é recorrente, criaria instâncias futuras aqui");
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

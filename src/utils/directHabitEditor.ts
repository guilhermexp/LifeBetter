import { supabase } from "@/integrations/supabase/client";

// Função para editar um hábito diretamente, sem dependências complexas
export async function editHabitDirect(habitId: string, title: string): Promise<boolean> {
  try {
    console.log(`Tentando salvar hábito ${habitId} diretamente com título: ${title}`);
    
    // Primeiro, vamos verificar se o hábito existe
    const { data: existingHabit, error: fetchError } = await supabase
      .from('daily_routines')
      .select('*')
      .eq('id', habitId)
      .single();
      
    if (fetchError) {
      console.error("Erro ao buscar hábito para edição direta:", fetchError);
      return false;
    }
    
    console.log("Hábito existente encontrado:", existingHabit);
    
    // Abordagem super minimalista - atualizar apenas o título e manter todo o resto igual
    const { error: updateError } = await supabase
      .from('daily_routines')
      .update({
        title: title,
        // Adicionamos apenas timestamp para garantir que a atualização será aceita
        updated_at: new Date().toISOString()
      })
      .eq('id', habitId);
      
    if (updateError) {
      console.error("Erro na atualização direta do hábito:", updateError);
      return false;
    }
    
    console.log("Hábito atualizado com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro inesperado durante edição direta de hábito:", error);
    return false;
  }
}

// Função para editar uma tarefa diretamente
export async function editTaskDirect(
  taskId: string, 
  title: string, 
  visibleInPlanner?: boolean
): Promise<boolean> {
  try {
    console.log(`Tentando salvar tarefa ${taskId} diretamente com título: ${title}`);
    
    // Primeiro, vamos verificar se a tarefa existe
    const { data: existingTask, error: fetchError } = await supabase
      .from('tasks')
      .select('*')
      .eq('id', taskId)
      .single();
      
    if (fetchError) {
      console.error("Erro ao buscar tarefa para edição direta:", fetchError);
      return false;
    }
    
    console.log("Tarefa existente encontrada:", existingTask);
    
    // Preparar os dados a serem atualizados
    const updateData: any = {
      title: title,
      updated_at: new Date().toISOString()
    };
    
    // Se visibleInPlanner foi fornecido, atualizar o campo scheduled
    if (visibleInPlanner !== undefined) {
      updateData.scheduled = visibleInPlanner;
      console.log(`Atualizando visibilidade no planner para: ${visibleInPlanner}`);
    }
    
    // Atualizar a tarefa com os dados
    const { error: updateError } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', taskId);
      
    if (updateError) {
      console.error("Erro na atualização direta da tarefa:", updateError);
      return false;
    }
    
    console.log("Tarefa atualizada com sucesso!");
    return true;
  } catch (error) {
    console.error("Erro inesperado durante edição direta de tarefa:", error);
    return false;
  }
}

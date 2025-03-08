
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRefresh } from "@/providers/RefreshProvider";

export function useTaskManager() {
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();
  
  const { toggleRefreshTasks } = useRefresh();
  
  // Função para excluir todas as tarefas
  const deleteAllTasks = async () => {
    // Confirmação usando a API nativa do navegador
    if (!window.confirm("Tem certeza que deseja excluir todas as suas tarefas? Esta ação não pode ser desfeita.")) {
      return; // Usuário cancelou
    }
    
    try {
      setIsDeleting(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Chama a função RPC para excluir todas as tarefas
      const { error } = await supabase.rpc('delete_all_user_tasks', {
        user_uuid: user.id
      });
      
      if (error) throw error;
      
      toast({
        title: "Sucesso!",
        description: "Todas as suas tarefas foram excluídas com sucesso."
      });
      
      // Atualiza a interface para refletir as mudanças
      toggleRefreshTasks();
      
    } catch (error) {
      console.error("Erro ao excluir tarefas:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir suas tarefas. Tente novamente mais tarde."
      });
    } finally {
      setIsDeleting(false);
    }
  };
  
  return {
    isDeleting,
    deleteAllTasks
  };
}

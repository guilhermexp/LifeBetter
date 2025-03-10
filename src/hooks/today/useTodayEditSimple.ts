import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { Task, TodoItem } from "@/types/today";
import { editHabitDirect, editTaskDirect } from "@/utils/directHabitEditor";

export function useTodayEditSimple(
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  setHabits: React.Dispatch<React.SetStateAction<any[]>>,
  refreshData: () => void
) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<TodoItem | null>(null);
  const { toast } = useToast();
  
  const handleEditItem = (item: TodoItem) => {
    console.log("Editando item:", item);
    setCurrentItem(item);
    setShowEditDialog(true);
  };
  
  const saveItemChanges = async (updatedItem: TodoItem) => {
    if (!currentItem) return;
    
    try {
      console.log("Salvando alterações para:", updatedItem);
      
      let success = false;
      
      // Usar as funções de edição direta dependendo do tipo de item
      if (updatedItem.itemType === 'task') {
        // Para tarefas, usar a função direta
        // Verifica se tem o campo scheduled (visível no planner)
        if (updatedItem.scheduled !== undefined) {
          success = await editTaskDirect(
            updatedItem.id, 
            updatedItem.title, 
            updatedItem.scheduled
          );
        } else {
          success = await editTaskDirect(updatedItem.id, updatedItem.title);
        }
      } 
      else if (updatedItem.itemType === 'habit') {
        // Para hábitos, usar a função direta
        success = await editHabitDirect(updatedItem.id, updatedItem.title);
      }
      
      // Verificar se a edição foi bem-sucedida
      if (!success) {
        throw new Error("Falha ao salvar alterações");
      }
      
      // Mensagem de sucesso
      toast({
        title: "Alterações salvas",
        description: "As alterações foram salvas com sucesso."
      });
      
      // Fechar o diálogo
      setShowEditDialog(false);
      
      // Atualizar dados (fazer um novo fetch do backend)
      refreshData();
      
    } catch (error) {
      console.error("Erro ao salvar alterações:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as alterações."
      });
    }
  };
  
  return {
    showEditDialog,
    setShowEditDialog,
    currentItem,
    handleEditItem,
    saveItemChanges
  };
}

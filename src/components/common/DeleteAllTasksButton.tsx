import { useState } from "react";
import { Button } from "@/components/ui/button";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Trash2 } from "lucide-react";
import { useTaskManager } from "@/hooks/useTaskManager";
export function DeleteAllTasksButton() {
  const [open, setOpen] = useState(false);
  const {
    isDeleting,
    deleteAllTasks
  } = useTaskManager();
  const handleConfirm = async () => {
    await deleteAllTasks();
    setOpen(false);
  };
  return <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger asChild>
        
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta ação não pode ser desfeita. Isso excluirá permanentemente todas as suas tarefas
            e hábitos do banco de dados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={e => {
          e.preventDefault();
          handleConfirm();
        }} disabled={isDeleting} className="bg-red-500 hover:bg-red-600">
            {isDeleting ? "Excluindo..." : "Sim, excluir tudo"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>;
}
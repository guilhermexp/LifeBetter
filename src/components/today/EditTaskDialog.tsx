
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { TodoItem } from "@/types/today";
import { TaskEditForm } from "./TaskEditForm";
import { HabitEditForm } from "./HabitEditForm";

interface EditTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  item: TodoItem | null;
  onSave: (updatedItem: TodoItem) => void;
}

export function EditTaskDialog({ open, onOpenChange, item, onSave }: EditTaskDialogProps) {
  if (!item) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden max-h-[90vh] overflow-y-auto animate-fadeIn rounded-xl">
        <DialogHeader className="px-6 pt-6 pb-3 bg-gradient-to-r from-purple-50 to-indigo-50">
          <DialogTitle className="text-xl font-semibold text-purple-900">
            Editar {item.itemType === 'task' ? 'Tarefa' : 'Hábito'}
          </DialogTitle>
          <DialogDescription className="text-purple-700 opacity-90">
            Personalize os detalhes e clique em salvar quando terminar.
          </DialogDescription>
        </DialogHeader>
        
        {item.itemType === 'task' ? (
          <TaskEditForm item={item} onSave={onSave} onCancel={() => onOpenChange(false)} />
        ) : (
          <HabitEditForm item={item} onSave={onSave} onCancel={() => onOpenChange(false)} />
        )}
      </DialogContent>
    </Dialog>
  );
}

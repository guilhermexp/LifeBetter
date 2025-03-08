
import { CalendarClock, CheckSquare, PartyPopper, RefreshCw, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { memo, useCallback } from "react";
export type TaskType = "meeting" | "task" | "event" | "habit";
interface TaskTypeSelectorProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (type: TaskType) => void;
}
const TaskTypeSelectorComponent = ({
  isOpen,
  onOpenChange,
  onSelect
}: TaskTypeSelectorProps) => {
  // Memoize the selection handlers to prevent unnecessary re-renders
  const handleClose = useCallback(() => {
    onOpenChange(false);
  }, [onOpenChange]);
  
  const handleSelectMeeting = useCallback(() => {
    onSelect("meeting");
    onOpenChange(false);
  }, [onSelect, onOpenChange]);
  
  const handleSelectTask = useCallback(() => {
    onSelect("task");
    onOpenChange(false);
  }, [onSelect, onOpenChange]);
  
  const handleSelectEvent = useCallback(() => {
    onSelect("event");
    onOpenChange(false);
  }, [onSelect, onOpenChange]);
  
  const handleSelectHabit = useCallback(() => {
    onSelect("habit");
    onOpenChange(false);
  }, [onSelect, onOpenChange]);
  return <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md w-[95%] mx-auto rounded-xl p-0 border-0 shadow-xl overflow-hidden">
        <DialogHeader className="space-y-2 bg-gradient-to-r from-purple-600 to-indigo-600 p-5 relative">
          <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full absolute right-3 top-3 text-white hover:bg-white/20">
            <X className="h-4 w-4" />
          </Button>
          
          <DialogTitle className="text-xl font-bold text-white">
            O que você quer criar?
          </DialogTitle>
        </DialogHeader>

        <div className="p-5 grid grid-cols-1 gap-4">
          <Button variant="outline" className="flex items-center justify-start gap-4 p-4 h-auto text-left rounded-lg border-gray-200 hover:border-indigo-300 hover:bg-indigo-50" onClick={handleSelectMeeting}>
            <div className="min-w-12 min-h-12 w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
              <CalendarClock className="h-6 w-6 text-indigo-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 text-base">Reunião</span>
              <span className="text-sm text-gray-600">Agende uma nova reunião</span>
            </div>
          </Button>

          <Button variant="outline" className="flex items-center justify-start gap-4 p-4 h-auto text-left rounded-lg border-gray-200 hover:border-purple-300 hover:bg-purple-50" onClick={handleSelectTask}>
            <div className="min-w-12 min-h-12 w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
              <CheckSquare className="h-6 w-6 text-purple-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 text-base">Tarefa</span>
              <span className="text-sm text-gray-600">Crie uma tarefa para seu dia</span>
            </div>
          </Button>

          <Button variant="outline" className="flex items-center justify-start gap-4 p-4 h-auto text-left rounded-lg border-gray-200 hover:border-green-300 hover:bg-green-50" onClick={handleSelectEvent}>
            <div className="min-w-12 min-h-12 w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <PartyPopper className="h-6 w-6 text-green-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 text-base">Evento</span>
              <span className="text-sm text-gray-600">Registre um evento</span>
            </div>
          </Button>

          <Button variant="outline" className="flex items-center justify-start gap-4 p-4 h-auto text-left rounded-lg border-gray-200 hover:border-amber-300 hover:bg-amber-50" onClick={handleSelectHabit}>
            <div className="min-w-12 min-h-12 w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
              <RefreshCw className="h-6 w-6 text-amber-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900 text-base">Hábito</span>
              <span className="text-sm text-gray-600">Adicione um hábito para sua rotina</span>
            </div>
          </Button>
        </div>
      </DialogContent>
    </Dialog>;
};

// Memoize the component to prevent unnecessary re-renders
export const TaskTypeSelector = memo(TaskTypeSelectorComponent);

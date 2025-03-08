
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogBody } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { NoteForm } from "@/components/notes/NoteForm";
import { useQuickNote } from "@/components/notes/useQuickNote";

interface QuickNoteModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const QuickNoteModal = ({
  isOpen,
  onOpenChange,
  onSuccess
}: QuickNoteModalProps) => {
  const {
    title,
    setTitle,
    description,
    setDescription,
    isToday,
    setIsToday,
    hasDueDate,
    setHasDueDate,
    isPriority,
    setIsPriority,
    hasReminder,
    setHasReminder,
    category,
    setCategory,
    isCreating,
    handleClose,
    handleSave
  } = useQuickNote(onSuccess, () => onOpenChange(false));
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95%] max-w-md mx-auto rounded-lg p-0 border-0 shadow-xl overflow-hidden">
        <DialogHeader className="py-3 px-4 relative border-b border-gray-100">
          <Button variant="ghost" size="icon" onClick={handleClose} className="rounded-full absolute right-3 top-3 text-gray-400 hover:bg-gray-100">
            <X className="h-4 w-4" />
          </Button>
          
          <DialogTitle className="text-base font-medium text-gray-800">
            Nova nota rápida
          </DialogTitle>
        </DialogHeader>

        <DialogBody className="p-4 space-y-4">
          <NoteForm 
            title={title} 
            setTitle={setTitle} 
            description={description} 
            setDescription={setDescription} 
            isToday={isToday} 
            setIsToday={setIsToday} 
            hasDueDate={hasDueDate} 
            setHasDueDate={setHasDueDate} 
            isPriority={isPriority} 
            setIsPriority={setIsPriority} 
            hasReminder={hasReminder} 
            setHasReminder={setHasReminder} 
            category={category} 
            setCategory={setCategory} 
          />
        </DialogBody>
        
        <DialogFooter className="flex justify-end gap-2 px-4 py-3 border-t border-gray-100 bg-gray-50">
          <Button type="button" variant="outline" onClick={handleClose} className="bg-white text-sm h-9">
            Cancelar
          </Button>
          
          <Button 
            type="button" 
            onClick={handleSave} 
            disabled={!title.trim() || isCreating} 
            className="bg-gradient-to-r from-purple-600 to-indigo-600 text-sm h-9"
          >
            {isCreating ? "Salvando..." : "Salvar Nota"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

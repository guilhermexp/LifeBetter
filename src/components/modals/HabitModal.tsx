
import React from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { HabitForm } from './habit/HabitForm';

interface HabitModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  userId?: string;
}

export function HabitModal({ isOpen, onOpenChange, onSuccess, userId }: HabitModalProps) {
  // Função para garantir que o modal seja fechado e os dados sejam atualizados
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-0">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Novo Hábito</DialogTitle>
          <DialogDescription>
            Adicione um novo hábito para acompanhar seu progresso
          </DialogDescription>
        </DialogHeader>
        <HabitForm 
          onOpenChange={onOpenChange}
          onSuccess={handleSuccess}
          userId={userId}
        />
      </DialogContent>
    </Dialog>
  );
}

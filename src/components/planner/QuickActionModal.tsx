
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Check, Edit, Trash, Copy } from "lucide-react";

interface QuickActionModalProps {
  eventId: string;
  title: string;
  onClose: () => void;
  onDelete: (eventId: string) => Promise<void> | void;
  onEdit: (eventId: string) => void;
  onComplete?: (eventId: string, currentStatus?: boolean) => void;
  onDuplicate?: (eventId: string) => void;
  isOpen?: boolean;
}

export function QuickActionModal({
  eventId,
  title,
  onClose,
  onDelete,
  onEdit,
  onComplete = (id) => onEdit(id),
  onDuplicate,
  isOpen = true
}: QuickActionModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="w-[95%] max-w-sm mx-auto p-0 overflow-hidden rounded-xl">
        <DialogHeader className="p-5 bg-gradient-to-r from-purple-50 to-indigo-50">
          <DialogTitle className="text-base text-gray-800 truncate">{title}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 p-4">
          <Button
            onClick={() => {
              onComplete(eventId);
              onClose();
            }}
            className="flex flex-col items-center justify-center h-24 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200 rounded-lg"
            variant="outline"
          >
            <Check className="h-6 w-6 mb-2" />
            <span className="text-sm">Concluir</span>
          </Button>
          
          <Button
            onClick={() => {
              onEdit(eventId);
              onClose();
            }}
            className="flex flex-col items-center justify-center h-24 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg"
            variant="outline"
          >
            <Edit className="h-6 w-6 mb-2" />
            <span className="text-sm">Editar</span>
          </Button>
          
          {onDuplicate && (
            <Button
              onClick={() => {
                onDuplicate(eventId);
                onClose();
              }}
              className="flex flex-col items-center justify-center h-24 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded-lg"
              variant="outline"
            >
              <Copy className="h-6 w-6 mb-2" />
              <span className="text-sm">Duplicar</span>
            </Button>
          )}
          
          <Button
            onClick={() => {
              onDelete(eventId);
              onClose();
            }}
            className="flex flex-col items-center justify-center h-24 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-lg"
            variant="outline"
          >
            <Trash className="h-6 w-6 mb-2" />
            <span className="text-sm">Excluir</span>
          </Button>
        </div>

        <DialogFooter className="bg-gray-50 p-4">
          <Button variant="outline" onClick={onClose} className="w-full text-sm h-10 rounded-lg">
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

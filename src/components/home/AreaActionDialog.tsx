
import { useState } from "react";
import { X, Target, CirclePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { AreaProgress } from "@/types/areas";

interface AreaActionDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedArea: AreaProgress | null;
  onCreateItem: () => void;
  isCreatingItem: boolean;
  newItemTitle: string;
  setNewItemTitle: (value: string) => void;
  newItemDescription: string;
  setNewItemDescription: (value: string) => void;
  newItemType: "goal" | "habit";
  setNewItemType: (value: "goal" | "habit") => void;
}

export function AreaActionDialog({
  isOpen,
  onOpenChange,
  selectedArea,
  onCreateItem,
  isCreatingItem,
  newItemTitle,
  setNewItemTitle,
  newItemDescription,
  setNewItemDescription,
  newItemType,
  setNewItemType
}: AreaActionDialogProps) {
  const handleDialogClose = () => {
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-3xl mx-auto animate-fadeIn shadow-xl">
        <div className="px-6 pt-6 pb-3 flex justify-between items-center border-b border-gray-100 relative">
          <div className="flex items-baseline">
            <h2 className="text-2xl font-bold text-gray-800">Área:</h2>
            <h2 className="text-2xl font-bold text-purple-600 ml-2">{selectedArea?.area}</h2>
          </div>
          <Button variant="ghost" size="icon" onClick={handleDialogClose} className="rounded-full absolute right-4 top-4">
            <X className="h-6 w-6 text-gray-500" />
          </Button>
        </div>

        <div className="p-6 space-y-6">
          <div className="flex space-x-2">
            <button 
              className={cn(
                "flex-1 p-4 rounded-xl border border-gray-200 flex flex-col items-center gap-2 transition-all duration-200", 
                newItemType === "goal" 
                  ? "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 shadow-md" 
                  : "hover:bg-purple-50"
              )} 
              onClick={() => setNewItemType("goal")}
            >
              <Target 
                className={cn(
                  "h-6 w-6", 
                  newItemType === "goal" ? "text-purple-600" : "text-gray-700"
                )} 
              />
              <span 
                className={cn(
                  "text-sm font-medium", 
                  newItemType === "goal" ? "text-purple-600" : "text-gray-700"
                )}
              >
                Nova Meta
              </span>
            </button>
            
            <button 
              className={cn(
                "flex-1 p-4 rounded-xl border border-gray-200 flex flex-col items-center gap-2 transition-all duration-200", 
                newItemType === "habit" 
                  ? "bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-300 shadow-md" 
                  : "hover:bg-purple-50"
              )} 
              onClick={() => setNewItemType("habit")}
            >
              <CirclePlus 
                className={cn(
                  "h-6 w-6", 
                  newItemType === "habit" ? "text-purple-600" : "text-gray-700"
                )} 
              />
              <span 
                className={cn(
                  "text-sm font-medium", 
                  newItemType === "habit" ? "text-purple-600" : "text-gray-700"
                )}
              >
                Novo Hábito
              </span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Título</label>
              <Input 
                value={newItemTitle}
                onChange={(e) => setNewItemTitle(e.target.value)}
                placeholder={newItemType === "goal" ? "Digite o nome da meta" : "Digite o nome do hábito"}
                className="w-full border-gray-200 focus:border-purple-500"
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Descrição (opcional)</label>
              <textarea 
                value={newItemDescription}
                onChange={(e) => setNewItemDescription(e.target.value)}
                placeholder="Adicione detalhes, objetivos ou notas..."
                className="w-full border border-gray-200 rounded-lg p-3 text-gray-600 focus:outline-none focus:border-purple-500 min-h-[80px]"
              />
            </div>
            
            <div className="pt-4 flex justify-end space-x-3">
              <Button 
                variant="outline" 
                onClick={handleDialogClose}
                className="border-gray-200"
              >
                Cancelar
              </Button>
              <Button 
                onClick={onCreateItem}
                disabled={isCreatingItem || !newItemTitle.trim()}
                className={cn(
                  "bg-gradient-to-r from-purple-500 to-indigo-600",
                  (isCreatingItem || !newItemTitle.trim()) && "opacity-70"
                )}
              >
                {isCreatingItem 
                  ? "Salvando..." 
                  : newItemType === "goal" 
                    ? "Criar Meta" 
                    : "Criar Hábito"
                }
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

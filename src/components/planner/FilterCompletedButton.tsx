
import React from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { ListChecks } from "lucide-react";

interface FilterCompletedButtonProps {
  showCompleted: boolean;
  onShowCompletedChange: (value: boolean) => void;
}

export function FilterCompletedButton({ 
  showCompleted, 
  onShowCompletedChange 
}: FilterCompletedButtonProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          size="sm" 
          className={`flex items-center gap-1 rounded-full ${showCompleted ? 'bg-purple-100 text-purple-700 border-purple-300' : 'text-gray-600'}`}
        >
          <ListChecks className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-2">
          <h4 className="font-medium">Filtrar tarefas</h4>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="completed-tasks" 
              checked={showCompleted} 
              onCheckedChange={() => onShowCompletedChange(!showCompleted)} 
            />
            <label 
              htmlFor="completed-tasks" 
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              Mostrar apenas concluídas
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}


import React from "react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Filter } from "lucide-react";

interface FilterPopoverProps {
  showCompleted: boolean;
  onShowCompletedChange: (value: boolean) => void;
}

export function FilterPopover({ showCompleted, onShowCompletedChange }: FilterPopoverProps) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="flex items-center gap-1 text-gray-600">
          <Filter className="h-4 w-4" />
          Filtrar
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-56">
        <div className="space-y-2">
          <h4 className="font-medium">Mostrar tarefas</h4>
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
              Incluir concluídas
            </label>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}

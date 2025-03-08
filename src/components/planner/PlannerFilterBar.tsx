
import React from "react";
import { FilterCompletedButton } from "@/components/planner/FilterCompletedButton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Briefcase, Home, Sun, Wallet } from "lucide-react";
import { AreaType } from "@/types/habits";

interface PlannerFilterBarProps {
  showOnlyCompleted: boolean;
  setShowOnlyCompleted: (value: boolean) => void;
  selectedArea: AreaType | 'all';
  setSelectedArea: (area: AreaType | 'all') => void;
}

const areaOptions = [
  { value: 'all', label: 'Todas as áreas', icon: null },
  { value: 'health', label: 'Saúde', icon: Heart },
  { value: 'business', label: 'Negócios', icon: Briefcase },
  { value: 'family', label: 'Família', icon: Home },
  { value: 'spirituality', label: 'Espiritualidade', icon: Sun },
  { value: 'finances', label: 'Finanças', icon: Wallet }
];

export function PlannerFilterBar({ 
  showOnlyCompleted, 
  setShowOnlyCompleted,
  selectedArea = 'all', // Provide default value
  setSelectedArea = () => {} // Provide default empty function
}: PlannerFilterBarProps) {
  return (
    <div className="flex justify-between items-center px-4 pt-3">
      <FilterCompletedButton 
        showCompleted={showOnlyCompleted} 
        onShowCompletedChange={setShowOnlyCompleted} 
      />
      
      <div className="flex items-center gap-3">
        <Select value={selectedArea} onValueChange={(value) => setSelectedArea(value as AreaType | 'all')}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filtrar por área" />
          </SelectTrigger>
          <SelectContent>
            {areaOptions.map((option) => {
              const Icon = option.icon;
              return (
                <SelectItem key={option.value} value={option.value}>
                  <div className="flex items-center gap-2">
                    {Icon && <Icon className="h-4 w-4" />}
                    <span>{option.label}</span>
                  </div>
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        
        <div className="text-sm text-gray-500">
          {showOnlyCompleted ? "Mostrando concluídas" : "Todas as tarefas"}
        </div>
      </div>
    </div>
  );
}

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { AITip } from "./types";
import { HabitPlan } from "./types";
import { HabitFrequency } from "@/types/habits";
import { HabitForm } from "./HabitForm";
import { HabitResearchInfo } from "./HabitResearchInfo";
import { Sparkles } from "lucide-react";

export function HabitPlanDialog({ 
  isOpen, 
  onOpenChange, 
  habit,
  onApply
}: { 
  isOpen: boolean; 
  onOpenChange: (open: boolean) => void;
  habit: AITip;
  onApply: () => void;
}) {
  const plan: HabitPlan = habit.implementation ? {
    frequency: habit.implementation.recommendedFrequency || 'daily',
    bestTime: habit.implementation.bestTimeOfDay || 'Flexível',
    suggestedDuration: habit.implementation.durationPeriod === 'test' 
      ? `${habit.implementation.testDuration} dias de teste`
      : 'Permanente',
    implementation: habit.implementation
  } : {
    frequency: 'daily',
    bestTime: 'Flexível',
    suggestedDuration: '21 dias de teste',
    implementation: {
      recommendedFrequency: 'daily',
      recommendedTimes: '1x por dia',
      durationPeriod: 'test',
      testDuration: 21,
      bestTimeOfDay: 'Flexível',
      progressionSteps: [
        "Defina um horário consistente",
        "Comece aos poucos",
        "Aumente gradualmente"
      ],
      adaptationTips: [
        "Seja consistente",
        "Monitore seu progresso"
      ],
      scientificBasis: "Pesquisas indicam que a consistência é chave para formar novos hábitos"
    }
  };

  // Form state
  const [formData, setFormData] = useState({
    title: habit.title,
    description: habit.description,
    frequency: plan.implementation.recommendedFrequency as HabitFrequency || 'daily',
    date: new Date(),
    time: "08:00",
    duration: 30
  });

  // Create an object with the habit data and call onApply with no arguments
  const handleApply = () => {
    // Store all the form data in habit for access in the parent component
    habit.title = formData.title;
    habit.description = formData.description;
    
    // Update implementation details to include form data
    if (habit.implementation) {
      habit.implementation.recommendedFrequency = formData.frequency;
      // Use optional chaining to avoid TypeScript errors
      habit.implementation.time = formData.time;
      habit.implementation.recommended_duration = formData.duration;
    } else {
      habit.implementation = {
        ...plan.implementation,
        recommendedFrequency: formData.frequency,
        // Add these properties to the object literal
        time: formData.time,
        recommended_duration: formData.duration
      };
    }
    
    // Log the habit data before calling onApply
    console.log('Adicionando hábito com dados:', {
      title: habit.title,
      description: habit.description,
      area: habit.area,
      frequency: habit.implementation?.recommendedFrequency,
      time: habit.implementation?.time,
      duration: habit.implementation?.recommended_duration
    });
    
    // Call the onApply function passed from the parent (with no arguments)
    onApply();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] h-[85vh] flex flex-col p-0 rounded-xl border-0 shadow-lg">
        <DialogHeader className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-t-xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="bg-white p-2 rounded-full shadow-sm">
              <Sparkles className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-gray-800">
                Adicionar Hábito
              </DialogTitle>
              <p className="text-xs text-gray-600 mt-1">
                {habit.title}
              </p>
            </div>
          </div>
        </DialogHeader>
        
        <div className="overflow-y-auto flex-grow p-4">
          <div className="mb-4 bg-white rounded-xl p-4 shadow-sm border border-gray-100">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Detalhes do Hábito</h3>
            <HabitForm 
              habit={habit} 
              onFormChange={setFormData}
            />
          </div>
          
          <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 mb-3">
            <details>
              <summary className="cursor-pointer text-sm font-medium text-purple-700 hover:text-purple-800 flex items-center">
                <span className="mr-2">Ver recomendações baseadas em pesquisas</span>
              </summary>
              <div className="mt-3">
                <HabitResearchInfo plan={plan} habit={habit} />
              </div>
            </details>
          </div>
        </div>
        
        <DialogFooter className="p-3 border-t border-gray-100 bg-gray-50 rounded-b-xl flex justify-end gap-3 flex-shrink-0">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onOpenChange(false)}
            className="rounded-xl border-gray-200 hover:bg-gray-100 hover:text-gray-800"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleApply}
            size="sm"
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white rounded-xl shadow-sm"
          >
            Adicionar à Agenda
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

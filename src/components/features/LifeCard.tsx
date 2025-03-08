
import { useState } from "react";
import { Heart, Briefcase, Home, Sun, Wallet, ChevronDown, ChevronUp } from "lucide-react";
import { ProgressBar } from "./ProgressBar";
import { HabitsModule } from "./HabitsModule";
import type { AreaType } from "@/types/habits";
import type { Goal } from "@/types/goals";

interface SubCategory {
  name: string;
  progress: number;
}

interface LifeCardProps {
  area: AreaType;
  title: string;
  description: string;
  progress: number;
  onStatsUpdate: (area: AreaType, stats: {
    totalHabits: number;
    completedHabits: number;
  }) => void;
  goals?: Goal[];
}

const icons = {
  health: Heart,
  business: Briefcase,
  family: Home,
  spirituality: Sun,
  finances: Wallet
};

const iconColors = {
  health: "text-purple-500",
  business: "text-blue-500",
  family: "text-pink-500",
  spirituality: "text-indigo-500",
  finances: "text-emerald-500"
};

const iconBgColors = {
  health: "bg-purple-100",
  business: "bg-blue-100",
  family: "bg-pink-100",
  spirituality: "bg-indigo-100",
  finances: "bg-emerald-100"
};

const mockSubCategories: Record<string, SubCategory[]> = {
  health: [{
    name: "Atividade Física",
    progress: 65
  }, {
    name: "Alimentação",
    progress: 80
  }, {
    name: "Sono",
    progress: 70
  }],
  business: [{
    name: "Metas Profissionais",
    progress: 45
  }, {
    name: "Networking",
    progress: 60
  }, {
    name: "Desenvolvimento",
    progress: 75
  }],
  family: [{
    name: "Tempo em Família",
    progress: 85
  }, {
    name: "Comunicação",
    progress: 70
  }, {
    name: "Eventos Familiares",
    progress: 90
  }],
  spirituality: [{
    name: "Meditação",
    progress: 55
  }, {
    name: "Leitura Espiritual",
    progress: 65
  }, {
    name: "Práticas Diárias",
    progress: 80
  }],
  finances: [{
    name: "Economia",
    progress: 70
  }, {
    name: "Investimentos",
    progress: 55
  }, {
    name: "Orçamento",
    progress: 85
  }]
};

export const LifeCard = ({
  area,
  title,
  description,
  progress,
  onStatsUpdate,
  goals = []
}: LifeCardProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const Icon = icons[area];
  const subCategories = mockSubCategories[area] || [];
  const formattedProgress = Math.round(progress);
  
  const handleHabitComplete = (habitId: string) => {
    console.log(`Hábito ${habitId} completado na área ${area}`);
  };
  
  return (
    <div className="w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm">
      <div className="p-4">
        <div className="flex items-start">
          <div className={`rounded-lg p-2 mr-3 ${iconBgColors[area]} flex-shrink-0`}>
            <Icon className={`w-5 h-5 ${iconColors[area]}`} />
          </div>
          
          <div className="flex-1 min-w-0 pr-1">
            <h3 className="text-lg font-bold text-gray-900">{title}</h3>
            <p className="text-sm text-gray-600 mb-2">{description}</p>
            
            <div className="mt-2">
              <div className="flex justify-between items-center mb-1">
                <span className="text-sm font-medium text-gray-600">Progresso</span>
                <span className="text-sm font-medium text-gray-700">{formattedProgress}%</span>
              </div>
              <ProgressBar 
                progress={formattedProgress} 
                className={`h-2.5 ${formattedProgress >= 50 ? 'bg-purple-500' : 'bg-purple-300'}`} 
              />
            </div>
          </div>
          
          <div 
            className="ml-1 cursor-pointer flex-shrink-0" 
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? (
              <ChevronUp className="w-5 h-5 text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-400" />
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="mt-4 pl-4 md:pl-10 space-y-4 animate-fadeIn">
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-700">Subcategorias</h4>
              {subCategories.map(subCategory => (
                <div key={subCategory.name} className="space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600 truncate max-w-[70%]">{subCategory.name}</span>
                    <span className="text-sm font-medium text-gray-700 whitespace-nowrap">
                      {Math.round(subCategory.progress)}%
                    </span>
                  </div>
                  <ProgressBar progress={Math.round(subCategory.progress)} className="h-1.5" />
                </div>
              ))}
            </div>

            {goals && goals.length > 0 && (
              <div className="mt-3">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Metas Ativas</h4>
                <div className="space-y-2">
                  {goals.map(goal => (
                    <div key={goal.id} className="p-2 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex items-start justify-between">
                        <div className="max-w-[75%]">
                          <h5 className="text-sm font-medium text-gray-900 truncate">{goal.title}</h5>
                        </div>
                        <span className="text-xs font-medium text-gray-700 whitespace-nowrap">{goal.progress}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <HabitsModule area={area} onHabitComplete={handleHabitComplete} onStatsUpdate={onStatsUpdate} />
          </div>
        )}
      </div>
    </div>
  );
};

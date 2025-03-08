
import { useState } from "react";
import { AreaProgress } from "@/types/areas";
import { Habit } from "@/types/habits";
import { Goal } from "@/types/goals";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, ChevronDown, ChevronUp, Clock, Plus, Calendar, TrendingUp, AlertTriangle, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";

interface AreaCardProps {
  area: AreaProgress;
  onClick: (area: AreaProgress) => void;
  habits?: Habit[];
  goals?: Goal[];
  tasks?: any[];
}

export function AreaCard({ area, onClick, habits = [], goals = [], tasks = [] }: AreaCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  
  // Filter relevant items for this area
  const areaHabits = habits.filter(habit => habit.area === area.areaType).slice(0, 3);
  const areaTasks = tasks.filter(task => task.category === area.areaType).slice(0, 3);
  const areaGoals = goals?.filter(goal => goal.area === area.areaType).slice(0, 2) || [];
  
  // Get the number of completed tasks in this area
  const completedTasksInArea = tasks.filter(task => 
    task.category === area.areaType && task.completed
  ).length;
  
  // Get the total number of tasks in this area
  const totalTasksInArea = tasks.filter(task => 
    task.category === area.areaType
  ).length;
  
  // Calculate the percentage of completed tasks, or use the existing progress if no tasks
  const taskProgressPercentage = totalTasksInArea > 0 
    ? Math.round((completedTasksInArea / totalTasksInArea) * 100) 
    : area.progress;
  
  const toggleExpand = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsExpanded(!isExpanded);
  };
  
  const handleCardClick = () => {
    if (!isExpanded) {
      onClick(area);
    }
  };
  
  // Get relevant suggestions based on area and real data
  const getSuggestion = () => {
    // Verificar se temos pontuação do questionário para dar sugestões personalizadas
    if (area.questionnaireScore !== undefined) {
      const score = area.questionnaireScore;
      
      if (score < 40) {
        return `Esta área precisa de atenção especial com base no seu questionário inicial. Considere adicionar mais atividades em ${area.area}.`;
      } else if (score < 70) {
        return `Pelo questionário inicial, você possui oportunidades de melhoria na área de ${area.area}. Continue focando aqui!`;
      } else {
        return `Pelo questionário inicial, ${area.area} é um ponto forte para você. Mantenha o bom trabalho!`;
      }
    }
    
    // Sugestões baseadas nos dados reais quando não há questionário
    if (areaTasks.length === 0 && areaHabits.length === 0) {
      return `Adicione tarefas ou hábitos na área de ${area.area} para começar seu progresso!`;
    }
    
    if (areaTasks.length > 0 && completedTasksInArea === 0) {
      return `Você tem ${areaTasks.length} ${areaTasks.length === 1 ? 'tarefa pendente' : 'tarefas pendentes'} nesta área!`;
    }
    
    if (areaHabits.length === 0) {
      return `Adicione hábitos na área de ${area.area} para melhorar sua consistência!`;
    }
    
    return `Continue mantendo seus bons hábitos!`;
  };

  return (
    <Card 
      className="w-full overflow-hidden transition-all duration-300"
      onClick={handleCardClick}
    >
      <div className="bg-purple-600 p-4 text-white">
        <div className="flex items-center">
          <div className="bg-red-500 p-2 rounded-lg mr-3 flex-shrink-0">
            <area.icon className="w-5 h-5 text-white" />
          </div>
          
          <div className="flex-1">
            <h3 className="text-lg font-bold text-white">{area.area}</h3>
            <p className="text-sm text-white/80">{area.description}</p>
          </div>
          
          <button 
            className="ml-1 p-1 rounded-full hover:bg-white/10 transition-colors" 
            onClick={toggleExpand}
            aria-label={isExpanded ? "Recolher card" : "Expandir card"}
          >
            <ChevronDown className="h-5 w-5 text-white" />
          </button>
        </div>
      </div>
        
      <CardContent className="p-4">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700">Progresso atual</span>
            <span className="text-sm font-medium text-gray-700">{taskProgressPercentage}% completo</span>
          </div>
          <div className="bg-gray-200 rounded-full h-2 w-full">
            <div 
              className="bg-purple-600 h-2 rounded-full" 
              style={{ width: `${taskProgressPercentage}%` }}
            ></div>
          </div>
        </div>
        
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Check className="h-4 w-4 text-green-600" />
              <h4 className="text-sm font-medium text-gray-800">Tarefas e hábitos concluídos recentemente</h4>
            </div>
            <p className="text-sm text-gray-600 ml-6">
              {completedTasksInArea > 0 
                ? `${completedTasksInArea} ${completedTasksInArea === 1 ? 'tarefa concluída' : 'tarefas concluídas'} recentemente.`
                : "Nenhuma tarefa concluída recentemente."}
            </p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <X className="h-4 w-4 text-red-600" />
              <h4 className="text-sm font-medium text-gray-800">O que está sendo deixado de lado</h4>
            </div>
            <p className="text-sm text-gray-600 ml-6">
              {areaTasks.length > 0 && completedTasksInArea < totalTasksInArea
                ? `${totalTasksInArea - completedTasksInArea} ${totalTasksInArea - completedTasksInArea === 1 ? 'tarefa pendente' : 'tarefas pendentes'} nesta área.`
                : "Sem tarefas pendentes nesta área."}
            </p>
          </div>
          
          <div>
            <div className="flex items-center gap-2 mb-1">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h4 className="text-sm font-medium text-gray-800">Sugestões para melhorar</h4>
            </div>
            <p className="text-sm text-gray-600 ml-6">
              {getSuggestion()}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

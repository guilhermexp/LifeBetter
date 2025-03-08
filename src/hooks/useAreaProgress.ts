
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AreaProgress } from "@/types/areas";
import { useToast } from "@/hooks/use-toast";
import { Heart, Briefcase, Wallet, Home, Sun } from "lucide-react";
import { AreaType } from "@/types/habits";

// Extend AreaType to include "growth" and "relationships" types
type ExtendedAreaType = AreaType | "growth" | "relationships";

export function useAreaProgress() {
  const [areaProgress, setAreaProgress] = useState<AreaProgress[]>([
    {
      area: "Saúde & Bem-estar",
      areaType: "health" as ExtendedAreaType,
      icon: Heart,
      color: "bg-red-500",
      gradient: "bg-gradient-to-r from-red-500 to-pink-500",
      progress: 0,
      description: "Atividades físicas, alimentação, sono e bem-estar geral",
      questionnaireScore: 0
    },
    {
      area: "Carreira & Finanças",
      areaType: "business" as ExtendedAreaType,
      icon: Briefcase,
      color: "bg-blue-500",
      gradient: "bg-gradient-to-r from-blue-500 to-indigo-500",
      progress: 0,
      description: "Desenvolvimento profissional, projetos e finanças pessoais",
      questionnaireScore: 0
    },
    {
      area: "Crescimento Pessoal",
      areaType: "growth" as ExtendedAreaType,
      icon: Sun,
      color: "bg-amber-500",
      gradient: "bg-gradient-to-r from-amber-500 to-yellow-500",
      progress: 0,
      description: "Aprendizado, hobbies, crescimento e desenvolvimento pessoal",
      questionnaireScore: 0
    },
    {
      area: "Relacionamentos",
      areaType: "relationships" as ExtendedAreaType,
      icon: Home,
      color: "bg-purple-500",
      gradient: "bg-gradient-to-r from-purple-500 to-pink-500",
      progress: 0,
      description: "Amizades, família, relacionamentos e vida social",
      questionnaireScore: 0
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchAreaProgress = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      // Get completed tasks by area
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (tasksError) throw tasksError;

      // Get user questionnaire data
      const { data: questionnaire, error: questionnaireError } = await supabase
        .from('user_questionnaire')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (questionnaireError && questionnaireError.code !== 'PGRST116') {
        console.error("Erro ao buscar questionário:", questionnaireError);
      }

      // Calculate progress for each area
      const updatedAreaProgress = areaProgress.map(area => {
        // Count tasks for this area - update to work with the task structure we have
        const areaTasksTotal = tasksData ? tasksData.filter(task => {
          const taskType = task.type || '';
          // Map task types to area types as best as possible
          const taskAreaType = 
            taskType.includes('health') ? 'health' :
            taskType.includes('work') || taskType.includes('business') ? 'business' :
            taskType.includes('growth') || taskType.includes('personal') ? 'growth' :
            taskType.includes('relationship') || taskType.includes('social') ? 'relationships' :
            null;
          
          return taskAreaType === area.areaType;
        }).length : 0;
        
        const areaTasksCompleted = tasksData ? tasksData.filter(task => {
          const taskType = task.type || '';
          // Same mapping as above
          const taskAreaType = 
            taskType.includes('health') ? 'health' :
            taskType.includes('work') || taskType.includes('business') ? 'business' :
            taskType.includes('growth') || taskType.includes('personal') ? 'growth' :
            taskType.includes('relationship') || taskType.includes('social') ? 'relationships' :
            null;
          
          return taskAreaType === area.areaType && task.completed;
        }).length : 0;

        // Calculate progress percentage
        const progressPercentage = areaTasksTotal > 0 
          ? Math.round((areaTasksCompleted / areaTasksTotal) * 100) 
          : 0;

        // Get questionnaire score if available
        const questionnaireScore = questionnaire?.results?.[area.areaType]?.overall || 0;

        return {
          ...area,
          progress: progressPercentage,
          questionnaireScore
        };
      });

      setAreaProgress(updatedAreaProgress);
      return updatedAreaProgress;
    } catch (error) {
      console.error("Erro ao buscar progresso das áreas:", error);
      setError("Não foi possível carregar o progresso das áreas.");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar o progresso das áreas."
      });
      return areaProgress;
    } finally {
      setIsLoading(false);
    }
  }, [areaProgress, toast]);

  return { 
    areaProgress, 
    setAreaProgress, 
    fetchAreaProgress,
    isLoading,
    error
  };
}

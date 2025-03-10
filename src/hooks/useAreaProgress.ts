import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AreaProgress } from "@/types/areas";
import { useToast } from "@/hooks/use-toast";
import { Heart, Briefcase, Wallet, Home, Sun } from "lucide-react";
import { AreaType } from "@/types/habits";

// Extend AreaType to include "growth" and "relationships" types
type ExtendedAreaType = AreaType | "growth" | "relationships" | "impact";

// Mapeamento entre tipos de área e os campos do questionário
const areaToQuestionnaireMap: { [key in ExtendedAreaType]?: string } = {
  "health": "health",
  "business": "career_finance",
  "growth": "personal_growth",
  "relationships": "relationships",
  "impact": "impact"
};

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
    },
    {
      area: "Impacto & Qualidade de Vida",
      areaType: "impact" as ExtendedAreaType,
      icon: Wallet,
      color: "bg-green-500",
      gradient: "bg-gradient-to-r from-green-500 to-teal-500",
      progress: 0,
      description: "Propósito de vida, impacto social e felicidade geral",
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

      // Obter tarefas concluídas por área
      const { data: tasksData, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id);

      if (tasksError) {
        console.error("Erro ao buscar tarefas:", tasksError);
      }

      // Obter dados das rotinas diárias
      const { data: routinesData, error: routinesError } = await supabase
        .from('daily_routines')
        .select('*')
        .eq('user_id', user.id);

      if (routinesError) {
        console.error("Erro ao buscar rotinas diárias:", routinesError);
      }

      // Obter dados do questionário com JSONB detalhado
      const { data: questionnaire, error: questionnaireError } = await supabase
        .from('user_questionnaire')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (questionnaireError && questionnaireError.code !== 'PGRST116') {
        console.error("Erro ao buscar questionário:", questionnaireError);
      }
      
      console.log("Dados do questionário encontrados:", questionnaire);

      // Combinar tarefas de ambas tabelas
      const allTasks = [
        ...(tasksData || []),
        ...(routinesData || [])
      ];

      // Calcular progresso para cada área
      const updatedAreaProgress = areaProgress.map(area => {
        // Contar tarefas para esta área
        const areaTasksTotal = allTasks ? allTasks.filter(task => {
          const taskType = task.type || task.category || '';
          // Map task types to area types as best as possible
          const taskAreaType = 
            taskType.includes('health') ? 'health' :
            taskType.includes('work') || taskType.includes('business') || taskType.includes('career') ? 'business' :
            taskType.includes('growth') || taskType.includes('personal') ? 'growth' :
            taskType.includes('relationship') || taskType.includes('social') ? 'relationships' :
            taskType.includes('impact') || taskType.includes('quality') ? 'impact' :
            null;
          
          return taskAreaType === area.areaType;
        }).length : 0;
        
        const areaTasksCompleted = allTasks ? allTasks.filter(task => {
          const taskType = task.type || task.category || '';
          // Same mapping as above
          const taskAreaType = 
            taskType.includes('health') ? 'health' :
            taskType.includes('work') || taskType.includes('business') || taskType.includes('career') ? 'business' :
            taskType.includes('growth') || taskType.includes('personal') ? 'growth' :
            taskType.includes('relationship') || taskType.includes('social') ? 'relationships' :
            taskType.includes('impact') || taskType.includes('quality') ? 'impact' :
            null;
          
          return taskAreaType === area.areaType && task.completed;
        }).length : 0;

        // Calcular porcentagem de progresso
        const taskProgress = areaTasksTotal > 0 
          ? Math.round((areaTasksCompleted / areaTasksTotal) * 100) 
          : 0;

        let questionnaireScore = 0;
        
        // Verificar se temos dados do questionário
        if (questionnaire?.results) {
          console.log(`Buscando score para área ${area.areaType}`);
          
          // Tentar obter direto pelo tipo da área
          if (questionnaire.results[area.areaType]) {
            questionnaireScore = questionnaire.results[area.areaType].overall || 0;
            console.log(`Score encontrado diretamente: ${questionnaireScore}`);
          } 
          // Tentar usando o mapeamento
          else if (areaToQuestionnaireMap[area.areaType] && questionnaire.results[areaToQuestionnaireMap[area.areaType]]) {
            const mappedKey = areaToQuestionnaireMap[area.areaType];
            questionnaireScore = questionnaire.results[mappedKey].overall || 0;
            console.log(`Score encontrado via mapeamento (${mappedKey}): ${questionnaireScore}`);
          }
          // Último caso - tentar buscar um score similar
          else {
            console.log("Tentando encontrar score alternativo");
            const keys = Object.keys(questionnaire.results);
            for (const key of keys) {
              if (
                (area.areaType === 'health' && key.includes('health')) ||
                (area.areaType === 'business' && (key.includes('career') || key.includes('finance'))) ||
                (area.areaType === 'growth' && (key.includes('growth') || key.includes('personal'))) ||
                (area.areaType === 'relationships' && key.includes('relation')) ||
                (area.areaType === 'impact' && (key.includes('impact') || key.includes('quality')))
              ) {
                questionnaireScore = questionnaire.results[key].overall || 0;
                console.log(`Score encontrado em chave similar (${key}): ${questionnaireScore}`);
                break;
              }
            }
          }
        }
        
        // Cálculo de progresso combinado - média ponderada
        // Se temos ambos dados de questionário e tarefas, ponderamos 70/30
        // Se temos apenas um, usamos 100% daquele
        let combinedProgress = taskProgress;
        
        if (areaTasksTotal > 0 && questionnaireScore > 0) {
          // Temos ambas as fontes de dados, ponderá-las
          combinedProgress = Math.round((questionnaireScore * 0.7) + (taskProgress * 0.3));
        } else if (questionnaireScore > 0) {
          // Somente dados do questionário
          combinedProgress = questionnaireScore;
        }

        return {
          ...area,
          progress: combinedProgress,
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

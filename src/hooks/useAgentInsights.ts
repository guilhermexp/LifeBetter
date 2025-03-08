import { useState, useCallback, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAreaProgress } from "@/hooks/useAreaProgress";
import { useTasks } from "@/hooks/useTasks";
import { Heart, Briefcase, Wallet, Home, Sun } from "lucide-react";

// Types for the agent insights
export interface AgentInsight {
  type: "progress" | "decline" | "consistency" | "achievement" | "warning" | "general";
  title: string;
  description: string;
  area: string;
  action?: string;
}

export interface AreaProgress {
  name: string;
  areaType: string;
  progress: number;
  tasks_completed: number;
  tasks_pending: number;
  color: string;
  gradient: string;
}

export interface AreaAttention {
  name: string;
  reason: string;
  color: string;
  icon: any;
}

export interface ProgressSummaryData {
  topAreaProgress: number;
  topAreaName: string;
  lowestAreaProgress: number;
  lowestAreaName: string;
  allAreasProgress: AreaProgress[];
  areasNeedingAttention: AreaAttention[];
  strengths: string[];
  improvementAreas: string[];
}

export interface AreaSuggestion {
  areaType: string;
  title: string;
  description: string;
  items: string[];
  color: string;
  bgColor: string;
  borderColor: string;
}

export interface HabitRecommendation {
  title: string;
  description: string;
  frequency: string;
  areaType: string;
  areaName: string;
  areaColor: string;
  areaIcon: any;
}

export function useAgentInsights(refreshKey = 0) {
  const [insights, setInsights] = useState<AgentInsight[]>([]);
  const [areaSuggestions, setAreaSuggestions] = useState<AreaSuggestion[]>([]);
  const [habitRecommendations, setHabitRecommendations] = useState<HabitRecommendation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { areaProgress } = useAreaProgress();
  const { allTasks } = useTasks();
  
  const [progressSummary, setProgressSummary] = useState<ProgressSummaryData>({
    topAreaProgress: 0,
    topAreaName: '',
    lowestAreaProgress: 0,
    lowestAreaName: '',
    allAreasProgress: [],
    areasNeedingAttention: [],
    strengths: [],
    improvementAreas: []
  });

  const getIconComponent = (areaType: string) => {
    switch (areaType) {
      case 'health':
        return Heart;
      case 'business':
        return Briefcase;
      case 'finances':
        return Wallet;
      case 'family':
        return Home;
      case 'spirituality':
        return Sun;
      default:
        return Heart;
    }
  };

  const getColorForArea = (areaType: string) => {
    switch (areaType) {
      case 'health':
        return 'bg-green-500';
      case 'business':
        return 'bg-blue-500';
      case 'finances':
        return 'bg-yellow-500';
      case 'family':
        return 'bg-pink-500';
      case 'spirituality':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getBgColorForArea = (areaType: string) => {
    switch (areaType) {
      case 'health':
        return 'bg-green-50';
      case 'business':
        return 'bg-blue-50';
      case 'finances':
        return 'bg-yellow-50';
      case 'family':
        return 'bg-pink-50';
      case 'spirituality':
        return 'bg-purple-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getBorderColorForArea = (areaType: string) => {
    switch (areaType) {
      case 'health':
        return 'border-green-200';
      case 'business':
        return 'border-blue-200';
      case 'finances':
        return 'border-yellow-200';
      case 'family':
        return 'border-pink-200';
      case 'spirituality':
        return 'border-purple-200';
      default:
        return 'border-gray-200';
    }
  };

  const getGradientForArea = (areaType: string) => {
    switch (areaType) {
      case 'health':
        return 'bg-gradient-to-r from-green-400 to-emerald-500';
      case 'business':
        return 'bg-gradient-to-r from-blue-400 to-indigo-500';
      case 'finances':
        return 'bg-gradient-to-r from-amber-400 to-yellow-500';
      case 'family':
        return 'bg-gradient-to-r from-pink-400 to-rose-500';
      case 'spirituality':
        return 'bg-gradient-to-r from-purple-400 to-violet-500';
      default:
        return 'bg-gradient-to-r from-gray-400 to-gray-500';
    }
  };

  const refreshData = useCallback(async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Generate insights based on user data
      await generateInsights(user.id);
      
      // Process area progress data for the summary
      processAreaProgress();
      
      // Generate habit recommendations
      generateHabitRecommendations();
      
      // Generate area suggestions
      generateAreaSuggestions();
      
      setIsLoading(false);
    } catch (error) {
      console.error("Error refreshing agent data:", error);
      setIsLoading(false);
    }
  }, [areaProgress, allTasks]);

  useEffect(() => {
    refreshData();
  }, [refreshKey, refreshData]);

  const generateInsights = async (userId: string) => {
    try {
      // Get user's recent tasks to analyze patterns
      const { data: recentTasks, error: tasksError } = await supabase
        .from('daily_routines')
        .select('*')
        .eq('user_id', userId)
        .order('scheduled_date', { ascending: false })
        .limit(20);
        
      if (tasksError) throw tasksError;
      
      // Get user's mood data if available
      const { data: moodData, error: moodError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(7);
        
      if (moodError) throw moodError;
      
      // Analyze task completion patterns
      let taskCompletionRate = 0;
      let healthTasks = 0;
      let healthTasksCompleted = 0;
      let workTasks = 0;
      let workTasksCompleted = 0;
      
      if (recentTasks && recentTasks.length > 0) {
        const completedTasks = recentTasks.filter(task => task.completed);
        taskCompletionRate = (completedTasks.length / recentTasks.length) * 100;
        
        // Count tasks per area
        healthTasks = recentTasks.filter(task => task.category === 'health').length;
        healthTasksCompleted = recentTasks.filter(task => task.category === 'health' && task.completed).length;
        
        workTasks = recentTasks.filter(task => task.category === 'business').length;
        workTasksCompleted = recentTasks.filter(task => task.category === 'business' && task.completed).length;
      }
      
      // Generate insights based on the data
      const newInsights: AgentInsight[] = [];
      
      // Overall completion rate insight
      if (recentTasks && recentTasks.length > 0) {
        if (taskCompletionRate >= 70) {
          newInsights.push({
            type: "progress",
            title: "Alta taxa de conclusão de tarefas",
            description: `Você concluiu ${Math.round(taskCompletionRate)}% das suas tarefas recentes. Continue com o bom trabalho!`,
            area: "Geral",
            action: "Mantenha esse ritmo e considere aumentar gradualmente seus desafios."
          });
        } else if (taskCompletionRate < 40) {
          newInsights.push({
            type: "warning",
            title: "Queda na conclusão de tarefas",
            description: `Sua taxa de conclusão está em ${Math.round(taskCompletionRate)}%, o que é abaixo do ideal.`,
            area: "Geral",
            action: "Tente reduzir o número de tarefas diárias para torná-las mais gerenciáveis."
          });
        }
      }
      
      // Health area insight
      if (healthTasks > 0) {
        const healthCompletionRate = (healthTasksCompleted / healthTasks) * 100;
        if (healthCompletionRate >= 80) {
          newInsights.push({
            type: "achievement",
            title: "Excelente em hábitos de saúde",
            description: `Você concluiu ${Math.round(healthCompletionRate)}% dos seus hábitos de saúde recentemente.`,
            area: "Saúde",
            action: "Continue com esses hábitos saudáveis e considere adicionar novos desafios."
          });
        } else if (healthCompletionRate <= 30 && healthTasks >= 3) {
          newInsights.push({
            type: "decline",
            title: "Hábitos de saúde em queda",
            description: "Você tem completado poucos hábitos relacionados à saúde ultimamente.",
            area: "Saúde",
            action: "Tente retomar um hábito de saúde de cada vez, começando com o mais simples."
          });
        }
      }
      
      // Work/Business area insight
      if (workTasks > 0) {
        const workCompletionRate = (workTasksCompleted / workTasks) * 100;
        if (workCompletionRate >= 75) {
          newInsights.push({
            type: "progress",
            title: "Produtividade no trabalho",
            description: `Você está sendo muito produtivo na área profissional, completando ${Math.round(workCompletionRate)}% das tarefas.`,
            area: "Carreira",
          });
        }
      }
      
      // Consistency patterns
      const streakTasks = recentTasks?.filter(task => task.streak_count && task.streak_count >= 7) || [];
      if (streakTasks.length > 0) {
        const topStreakTask = streakTasks.sort((a, b) => (b.streak_count || 0) - (a.streak_count || 0))[0];
        newInsights.push({
          type: "consistency",
          title: "Consistência identificada",
          description: `Você manteve "${topStreakTask.title}" por ${topStreakTask.streak_count} dias consecutivos!`,
          area: topStreakTask.category === 'health' 
            ? 'Saúde' 
            : topStreakTask.category === 'business'
              ? 'Carreira'
              : topStreakTask.category === 'finances'
                ? 'Finanças'
                : topStreakTask.category === 'family'
                  ? 'Família'
                  : 'Espiritualidade',
          action: "A consistência é fundamental para a formação de hábitos. Continue assim!"
        });
      }
      
      // Mood patterns if data is available
      if (moodData && moodData.length >= 3) {
        const positiveEntries = moodData.filter(entry => 
          entry.mood_type === 'happy' || 
          entry.mood_type === 'excited' || 
          entry.mood_type === 'content'
        );
        
        if (positiveEntries.length >= 2) {
          newInsights.push({
            type: "progress",
            title: "Padrão de humor positivo",
            description: "Você tem registrado mais emoções positivas nos últimos dias.",
            area: "Bem-estar",
            action: "Continue praticando atividades que melhoram seu humor."
          });
        }
      }
      
      // Set the insights (limit to 3 for now)
      setInsights(newInsights.slice(0, 3));
      
    } catch (error) {
      console.error("Error generating insights:", error);
      // Set some default insights if there's an error
      setInsights([
        {
          type: "general",
          title: "Bem-vindo ao seu assistente IA",
          description: "Estou analisando seus dados para gerar insights personalizados.",
          area: "Geral",
          action: "Continue adicionando tarefas e hábitos para melhorar a precisão das recomendações."
        }
      ]);
    }
  };
  
  const processAreaProgress = () => {
    // Convert areaProgress to the format needed for the summary
    const progressData: AreaProgress[] = areaProgress.map(area => {
      // Count completed and pending tasks for this area from allTasks
      const tasksForArea = allTasks.filter(task => task.category === area.areaType);
      const completedTasks = tasksForArea.filter(task => task.completed).length;
      const pendingTasks = tasksForArea.filter(task => !task.completed).length;
      
      return {
        name: area.area,
        areaType: area.areaType,
        progress: area.progress,
        tasks_completed: completedTasks,
        tasks_pending: pendingTasks,
        color: getColorForArea(area.areaType),
        gradient: getGradientForArea(area.areaType)
      };
    });
    
    // Sort to find highest and lowest progress
    const sortedAreas = [...progressData].sort((a, b) => b.progress - a.progress);
    const topArea = sortedAreas[0] || { name: 'N/A', progress: 0 };
    const lowestArea = sortedAreas[sortedAreas.length - 1] || { name: 'N/A', progress: 0 };
    
    // Identify areas needing attention (less than 30% progress or decline)
    const areasNeedingAttention: AreaAttention[] = progressData
      .filter(area => area.progress < 30 || area.tasks_pending > area.tasks_completed * 2)
      .map(area => ({
        name: area.name,
        reason: area.progress < 30 
          ? `Progresso baixo (${area.progress}%)` 
          : `${area.tasks_pending} tarefas pendentes`,
        color: getColorForArea(area.areaType),
        icon: getIconComponent(area.areaType)
      }));
    
    // Generate strengths and improvement areas based on progress
    const strengths = sortedAreas
      .filter(area => area.progress >= 50)
      .map(area => `${area.name}: ${area.progress}% de progresso`);
      
    const improvementAreas = sortedAreas
      .filter(area => area.progress < 50)
      .map(area => `${area.name}: precisa de mais foco (${area.progress}%)`);
    
    // Update progress summary state
    setProgressSummary({
      topAreaProgress: topArea.progress,
      topAreaName: topArea.name,
      lowestAreaProgress: lowestArea.progress,
      lowestAreaName: lowestArea.name,
      allAreasProgress: progressData,
      areasNeedingAttention,
      strengths,
      improvementAreas
    });
  };
  
  const generateAreaSuggestions = () => {
    // Find the two areas with lowest progress to make suggestions
    const sortedAreas = [...areaProgress].sort((a, b) => a.progress - b.progress);
    const lowestAreas = sortedAreas.slice(0, 2);
    
    const suggestions: AreaSuggestion[] = lowestAreas.map(area => {
      let items: string[] = [];
      
      switch (area.areaType) {
        case 'health':
          items = [
            "Meditação por 10 minutos diários",
            "Beber 2L de água por dia",
            "Dormir 8 horas por noite"
          ];
          break;
        case 'business':
          items = [
            "Leitura profissional por 15min diários",
            "Fazer networking semanal",
            "Definir 3 prioridades por dia"
          ];
          break;
        case 'finances':
          items = [
            "Revisar gastos semanalmente",
            "Planejar investimentos mensais",
            "Eliminar uma despesa desnecessária"
          ];
          break;
        case 'family':
          items = [
            "Tempo de qualidade em família",
            "Ligar para um amigo por semana",
            "Organizar um encontro mensal"
          ];
          break;
        case 'spirituality':
          items = [
            "Praticar gratidão diariamente",
            "Tempo na natureza semanalmente",
            "Definir propósito pessoal"
          ];
          break;
      }
      
      return {
        areaType: area.areaType,
        title: `Melhore sua área de ${area.area}`,
        description: `Sugestões para aumentar seu progresso em ${area.area}:`,
        items,
        color: getColorForArea(area.areaType),
        bgColor: getBgColorForArea(area.areaType),
        borderColor: getBorderColorForArea(area.areaType)
      };
    });
    
    setAreaSuggestions(suggestions);
  };
  
  const generateHabitRecommendations = () => {
    // Generate habit recommendations based on the lowest progress areas
    const sortedAreas = [...areaProgress].sort((a, b) => a.progress - b.progress);
    const lowestAreas = sortedAreas.slice(0, 3);
    
    const recommendations: HabitRecommendation[] = [];
    
    lowestAreas.forEach(area => {
      let habits: Partial<HabitRecommendation>[] = [];
      
      switch (area.areaType) {
        case 'health':
          habits = [
            {
              title: "Exercício Físico Matinal",
              description: "Comece o dia com 20 minutos de exercícios para aumentar energia e foco.",
              frequency: "3-5x por semana"
            },
            {
              title: "Hidratação Constante",
              description: "Beba 2L de água diariamente para melhorar digestão e foco mental.",
              frequency: "Diariamente"
            }
          ];
          break;
        case 'business':
          habits = [
            {
              title: "Planejamento Semanal",
              description: "Dedique 30 minutos no domingo para planejar sua semana profissional.",
              frequency: "1x por semana"
            },
            {
              title: "Desenvolvimento de Habilidades",
              description: "Invista 20 minutos diários em aprender novas habilidades profissionais.",
              frequency: "Dias úteis"
            }
          ];
          break;
        case 'finances':
          habits = [
            {
              title: "Revisão de Orçamento",
              description: "Analise seus gastos e planeje seu orçamento para a próxima semana.",
              frequency: "1x por semana"
            },
            {
              title: "Educação Financeira",
              description: "Dedique tempo para aprender sobre investimentos e finanças pessoais.",
              frequency: "2x por semana"
            }
          ];
          break;
        case 'family':
          habits = [
            {
              title: "Tempo de Qualidade em Família",
              description: "Reserve tempo exclusivo para atividades com pessoas queridas, sem distrações.",
              frequency: "2-3x por semana"
            },
            {
              title: "Ligação para Amigos",
              description: "Mantenha contato com amigos importantes para fortalecer relacionamentos.",
              frequency: "1x por semana"
            }
          ];
          break;
        case 'spirituality':
          habits = [
            {
              title: "Meditação Matinal",
              description: "Pratique 10 minutos de meditação pela manhã para clareza mental.",
              frequency: "Diariamente"
            },
            {
              title: "Diário de Gratidão",
              description: "Anote 3 coisas pelas quais você é grato todos os dias antes de dormir.",
              frequency: "Diariamente"
            }
          ];
          break;
      }
      
      // Add to recommendations with area info
      habits.forEach(habit => {
        recommendations.push({
          ...habit as HabitRecommendation,
          areaType: area.areaType,
          areaName: area.area,
          areaColor: getColorForArea(area.areaType),
          areaIcon: getIconComponent(area.areaType)
        });
      });
    });
    
    // Randomize and limit to 4 recommendations
    const shuffled = recommendations.sort(() => 0.5 - Math.random());
    setHabitRecommendations(shuffled.slice(0, 4));
  };

  return {
    insights,
    areaSuggestions,
    progressSummary,
    habitRecommendations,
    isLoading,
    refreshData
  };
}

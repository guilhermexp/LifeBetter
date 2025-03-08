
import { useState, useEffect, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";
import { HabitImplementation } from "@/data/knowledgeBase";
import { supabase } from "@/integrations/supabase/client";
import { parseSuggestionsToAITips, generateHabitPlan, fetchHabitImplementation, fetchAllAreaSuggestions } from "./utils";
import { HabitPlan, AITip } from "./types";
import { AreaType } from "@/types/habits";

interface UseSuggestionBoxProps {
  onAddGoal: (area: AreaType, title: string) => void;
  onAddHabit: (area: AreaType, title: string, description: string, implementation?: HabitImplementation) => void;
  areaNames: Record<AreaType, string>;
}

export const useSuggestionBox = ({ 
  onAddGoal, 
  onAddHabit,
  areaNames
}: UseSuggestionBoxProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState<AITip | null>(null);
  const [savedTips, setSavedTips] = useState<Set<string>>(new Set());
  const [currentTips, setCurrentTips] = useState<AITip[]>([]);
  const [aiTips, setAiTips] = useState<AITip[]>([]);
  const [usedTips, setUsedTips] = useState<Set<string>>(new Set());
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);
  const [habitPlan, setHabitPlan] = useState<HabitPlan | null>(null);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [showFavorites, setShowFavorites] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [progressTimer, setProgressTimer] = useState<NodeJS.Timeout | null>(null);
  const [existingHabits, setExistingHabits] = useState<any[]>([]);
  
  const { toast } = useToast();

  // Mock knowledgeBase for testing purposes - would need to be replaced with actual data later
  const knowledgeBase: AITip[] = [
    {
      id: "1",
      area: "health",
      title: "Morning Meditation",
      description: "Start your day with 10 minutes of meditation to improve mental clarity and focus.",
      type: "habit",
      source_type: "study",
      tags: ["mindfulness", "morning", "focus"],
      study: {
        finding: "Regular meditation improves mental focus by 30%",
        source: "Journal of Mindfulness",
        application: "Daily practice recommended"
      }
    },
    {
      id: "2",
      area: "business",
      title: "Weekly Planning Session",
      description: "Schedule 30 minutes every Sunday to plan your week ahead and set priorities.",
      type: "habit",
      source_type: "book",
      tags: ["productivity", "planning", "organization"],
      reference: {
        title: "Getting Things Done",
        author: "David Allen"
      }
    },
    {
      id: "3",
      area: "health",
      title: "Drink Water Before Meals",
      description: "Drink a glass of water 15 minutes before each meal to improve digestion and prevent overeating.",
      type: "habit",
      source_type: "study",
      tags: ["hydration", "nutrition", "health"],
      study: {
        finding: "Drinking water before meals can reduce calorie intake by 13%",
        source: "Journal of Clinical Nutrition",
        application: "Practice before each meal"
      }
    }
  ];

  // Fetch user's existing habits to avoid suggesting duplicates
  const fetchExistingHabits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('daily_routines')
        .select('title, category')
        .eq('user_id', user.id);

      if (error) {
        console.error('Error fetching existing habits:', error);
        return;
      }

      // Map database fields to the format expected by the suggestion system
      const habits = data.map(item => ({
        title: item.title,
        area: item.category as AreaType,
        type: 'habit'
      }));

      setExistingHabits(habits);
      return habits;
    } catch (error) {
      console.error('Error in fetchExistingHabits:', error);
      return [];
    }
  };

  // Initial load of existing habits
  useEffect(() => {
    fetchExistingHabits();
  }, []);

  const getNewTips = () => {
    const availableTips = knowledgeBase.filter(tip => !usedTips.has(tip.id));
    if (availableTips.length < 6) {
      setUsedTips(new Set());
      return [...knowledgeBase].sort(() => Math.random() - 0.5).slice(0, 6);
    }
    return availableTips.sort(() => Math.random() - 0.5).slice(0, 6);
  };

  const shuffleTips = useCallback(async () => {
    setIsLoadingAI(true);
    simulateProgress();
    
    try {
      // Limpar sugestões atuais para garantir que novas sugestões sejam exibidas
      setCurrentTips([]);
      
      // Fetch fresh list of existing habits
      const habits = await fetchExistingHabits() || [];
      
      // Resetar usedTips para garantir que todas as sugestões possam ser usadas novamente
      setUsedTips(new Set());
      
      // Get suggestions from all areas (com fallback local implementado)
      const suggestions = await fetchAllAreaSuggestions(habits);
      
      // Garantir que sempre temos sugestões
      if (suggestions && suggestions.length > 0) {
        console.log(`Carregadas ${suggestions.length} sugestões com sucesso`);
        
        // Garantir que as sugestões são diferentes a cada vez
        const shuffledSuggestions = [...suggestions].sort(() => Math.random() - 0.5);
        setCurrentTips(shuffledSuggestions);
        
        // Atualizar usedTips
        const newUsedTips = new Set<string>();
        shuffledSuggestions.forEach(tip => newUsedTips.add(tip.id));
        setUsedTips(newUsedTips);
      } else {
        console.warn('Nenhuma sugestão retornada, usando fallback local');
        // Fallback to local suggestions if API fails
        const newTips = getNewTips();
        setCurrentTips(newTips);
        
        // Atualizar usedTips
        const newUsedTips = new Set<string>();
        newTips.forEach(tip => newUsedTips.add(tip.id));
        setUsedTips(newUsedTips);
      }
    } catch (error) {
      console.error('Error shuffling tips:', error);
      // Fallback to local suggestions
      const newTips = getNewTips();
      setCurrentTips(newTips);
    } finally {
      stopProgress();
      setIsLoadingAI(false);
      
      // Only show toast notification if the suggestion dialog is open
      if (isOpen) {
        toast({
          title: "Novas sugestões carregadas!",
          description: "Confira as novas recomendações baseadas em pesquisas."
        });
      }
    }
  }, [toast, isOpen]); // Removido usedTips das dependências para evitar re-renders desnecessários

  useEffect(() => {
    if (currentTips.length === 0) {
      shuffleTips();
    }
  }, [currentTips.length, shuffleTips]);

  const getFavoriteTips = () => {
    // Combine os tips do knowledgeBase e currentTips para garantir que todos os favoritos sejam incluídos
    const allTips = [...knowledgeBase, ...currentTips, ...aiTips];
    // Remover duplicatas baseado no ID
    const uniqueTips = Array.from(new Map(allTips.map(tip => [tip.id, tip])).values());
    // Filtrar apenas os que estão nos favoritos
    return uniqueTips.filter(tip => savedTips.has(tip.id));
  };

  const handleAdd = async (tip: AITip) => {
    if (tip.type === "goal") {
      onAddGoal(tip.area, tip.title);
      toast({
        title: "Meta adicionada!",
        description: `${tip.title} foi adicionada como meta em ${areaNames[tip.area]}.`
      });
      setSelectedTip(null);
    } else {
      try {
        setSelectedTip(tip);
        setIsLoadingAI(true);
        
        // Se o tip já tem implementation, use-o diretamente
        if (tip.implementation) {
          setHabitPlan({
            frequency: tip.implementation.recommendedFrequency,
            bestTime: tip.implementation.bestTimeOfDay,
            suggestedDuration: tip.implementation.durationPeriod === 'test' 
              ? `${tip.implementation.testDuration} dias de teste` 
              : 'Permanente',
            implementation: tip.implementation
          });
        } else {
          // Caso contrário, busque a implementação
          const habitData = await fetchHabitImplementation(tip.title, tip.area);
          if (habitData.implementation) {
            setHabitPlan({
              frequency: habitData.implementation.recommendedFrequency,
              bestTime: habitData.implementation.bestTimeOfDay,
              suggestedDuration: habitData.implementation.durationPeriod === 'test' 
                ? `${habitData.implementation.testDuration} dias de teste` 
                : 'Permanente',
              implementation: habitData.implementation
            });
          } else {
            const defaultPlan = generateHabitPlan(tip);
            setHabitPlan(defaultPlan);
          }
        }
        
        setIsConfirmDialogOpen(true);
      } catch (error) {
        console.error('Erro ao obter implementação:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar recomendações",
          description: "Não foi possível obter as recomendações específicas para este hábito. Usando recomendações padrão."
        });
        const defaultPlan = generateHabitPlan(tip);
        setHabitPlan(defaultPlan);
        setIsConfirmDialogOpen(true);
      } finally {
        setIsLoadingAI(false);
      }
    }
  };

  const handleConfirmHabit = () => {
    if (!selectedTip || !habitPlan) return;
    
    // Passamos a implementação junto com os dados básicos do hábito
    onAddHabit(
      selectedTip.area, 
      selectedTip.title, 
      selectedTip.description,
      habitPlan.implementation
    );
    
    toast({
      title: "Hábito adicionado!",
      description: `${selectedTip.title} foi adicionado como hábito em ${areaNames[selectedTip.area]}.`
    });
    
    setIsConfirmDialogOpen(false);
    setSelectedTip(null);
    setHabitPlan(null);
    
    // Atualiza a lista de hábitos existentes
    fetchExistingHabits();
  };

  const toggleSaveTip = (tipId: string) => {
    const newSavedTips = new Set(savedTips);
    if (savedTips.has(tipId)) {
      newSavedTips.delete(tipId);
      toast({
        title: "Removido dos favoritos",
        description: "A sugestão foi removida da sua lista de favoritos."
      });
    } else {
      newSavedTips.add(tipId);
      toast({
        title: "Salvo nos favoritos!",
        description: "A sugestão foi salva na sua lista de favoritos."
      });
    }
    setSavedTips(newSavedTips);
  };

  const simulateProgress = () => {
    setProgressValue(0);
    const timer = setInterval(() => {
      setProgressValue(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          return 100;
        }
        return prev + 5;
      });
    }, 200);
    setProgressTimer(timer);
  };

  const stopProgress = () => {
    if (progressTimer) {
      clearInterval(progressTimer);
      setProgressTimer(null);
    }
    setProgressValue(100);
    setTimeout(() => setProgressValue(0), 300);
  };

  const fetchAISuggestions = async () => {
    setIsLoadingAI(true);
    simulateProgress();
    try {
      // Fetch fresh list of existing habits
      const habits = await fetchExistingHabits() || [];
      
      const { data, error } = await supabase.functions.invoke('generate-suggestions', {
        body: {
          area: 'health',
          existingHabits: habits,
          userContext: {
            existingHabits: habits.length
          }
        }
      });
      
      console.log("AI Suggestions response:", data);
      
      if (error) {
        console.error('Error calling edge function:', error);
        throw new Error(error.message);
      }
      
      if (!data || !data.suggestions) {
        console.error('Invalid AI response:', data);
        throw new Error('Resposta inválida da IA');
      }
      
      const suggestionsArray = Array.isArray(data.suggestions) ? data.suggestions : [];
      console.log("Processing suggestions array:", suggestionsArray);
      
      const newAiTips = parseSuggestionsToAITips(suggestionsArray);
      console.log("Parsed AI tips:", newAiTips);
      
      setAiTips(newAiTips);
      
      // Only show toast when the dialog is open
      if (isOpen) {
        toast({
          title: "Novas sugestões geradas!",
          description: "O assistente IA criou recomendações personalizadas para você."
        });
      }
    } catch (error) {
      console.error('Error fetching AI suggestions:', error);
      // Only show error toast when the dialog is open
      if (isOpen) {
        toast({
          variant: "destructive",
          title: "Erro ao gerar sugestões",
          description: "Não foi possível gerar novas sugestões no momento. Por favor, tente novamente."
        });
      }
    } finally {
      stopProgress();
      setIsLoadingAI(false);
    }
  };

  return {
    isOpen,
    setIsOpen,
    selectedTip,
    savedTips,
    currentTips,
    aiTips,
    isConfirmDialogOpen,
    setIsConfirmDialogOpen,
    habitPlan,
    isLoadingAI,
    showFavorites,
    setShowFavorites,
    progressValue,
    shuffleTips,
    getFavoriteTips,
    handleAdd,
    handleConfirmHabit,
    toggleSaveTip,
    fetchAISuggestions,
    stopProgress,
    existingHabits
  };
};


import { useEffect, useState, useCallback, useRef } from "react";
import { WelcomeHeader } from "@/components/home/WelcomeHeader";
import { HomeHeader } from "@/components/layout/HomeHeader";
import { DashboardStats } from "@/components/home/DashboardStats";
import { useRefresh } from "@/providers/RefreshProvider";
import { useTasks } from "@/hooks/useTasks";
import { useAreaProgress } from "@/hooks/useAreaProgress";
import { useMoodTracking } from "@/hooks/useMoodTracking";
import { useUser } from "@/providers/UserProvider";
import { DeleteAllTasksButton } from "@/components/common/DeleteAllTasksButton";
import { SuggestionButton } from "@/components/suggestion/SuggestionButton";
import { SuggestionDialogs } from "@/components/suggestion/SuggestionDialogs";
import { useSuggestionBox } from "@/components/suggestion/useSuggestionBox";
import { FavoritesDialog } from "@/components/favorites/FavoritesDialog";
import { AITip } from "@/components/suggestion/types";
import { AreaType } from "@/types/habits";
import { Heart, Briefcase, Home, Sun, Wallet, BookOpen, GraduationCap, Quote } from "lucide-react";
import { MoodTimelineCard } from "@/components/mindfulness/MoodTimelineCard";
import { LifeAreaCards } from "@/components/home/LifeAreaCards";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

export default function Index() {
  const { taskCounts, fetchTasks, setIsLoading: setTasksLoading, isLoading: tasksLoading, error: tasksError } = useTasks();
  const { areaProgress, fetchAreaProgress, isLoading: areasLoading, error: areasError } = useAreaProgress();
  const { moodHistory, fetchMoodHistory, isLoading: moodLoading, error: moodError } = useMoodTracking();
  const { refreshTasks } = useRefresh();
  const { user } = useUser();

  const [isDataLoading, setIsDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [loadingStep, setLoadingStep] = useState<string | null>(null);
  const [dataLoadingComplete, setDataLoadingComplete] = useState(false);
  const isMounted = useRef(true);

  const userName = user?.profile?.full_name || 
                  user?.profile?.username || 
                  user?.email?.split('@')[0] || 
                  "Usuário";

  useEffect(() => {
    console.log("Current data states:", {
      taskCounts,
      areaProgress: areaProgress?.length || 0,
      moodHistory: moodHistory?.length || 0,
      isDataLoading,
      tasksLoading,
      areasLoading,
      moodLoading,
      dataLoadingComplete
    });
  }, [taskCounts, areaProgress, moodHistory, isDataLoading, tasksLoading, areasLoading, moodLoading, dataLoadingComplete]);

  const logCurrentState = useCallback(() => {
    console.log("Estado atual dos dados:", {
      isDataLoading,
      tasksLoading,
      areasLoading,
      moodLoading,
      taskCounts,
      areaProgressLength: areaProgress?.length || 0,
      moodHistoryLength: moodHistory?.length || 0,
      hasError: tasksError || areasError || moodError || dataError,
      loadingStep,
      dataLoadingComplete
    });
  }, [
    isDataLoading, tasksLoading, areasLoading, moodLoading,
    taskCounts, areaProgress, moodHistory,
    tasksError, areasError, moodError, dataError,
    loadingStep, dataLoadingComplete
  ]);

  const loadData = useCallback(async () => {
    if (!isMounted.current) return;
    
    try {
      console.log("Iniciando carregamento de dados na página Index");
      setIsDataLoading(true);
      setDataError(null);
      setDataLoadingComplete(false);
      
      setLoadingStep("tasks");
      setTasksLoading(true);
      console.log("Carregando tarefas...");
      await fetchTasks();
      console.log("Tarefas carregadas com sucesso");
      
      if (!isMounted.current) return;
      
      setLoadingStep("areas");
      console.log("Carregando progresso das áreas...");
      await fetchAreaProgress();
      console.log("Progresso das áreas carregado com sucesso");
      
      if (!isMounted.current) return;
      
      setLoadingStep("mood");
      console.log("Carregando histórico de humor...");
      await fetchMoodHistory();
      console.log("Histórico de humor carregado com sucesso");
      
      setLoadingStep("complete");
      setDataLoadingComplete(true);
      console.log("Dados carregados com sucesso:", { 
        taskCounts: taskCounts || "não disponível",
        areaProgress: areaProgress?.length || 0,
        moodHistory: moodHistory?.length || 0
      });
      
    } catch (error) {
      if (isMounted.current) {
        console.error("Erro ao carregar dados da página inicial:", error);
        setDataError("Ocorreu um erro ao carregar os dados. Por favor, tente novamente.");
      }
    } finally {
      if (isMounted.current) {
        setTasksLoading(false);
        setIsDataLoading(false);
        setLoadingStep(null);
        logCurrentState();
      }
    }
  }, [fetchTasks, fetchAreaProgress, fetchMoodHistory, setTasksLoading, logCurrentState, taskCounts]);

  useEffect(() => {
    isMounted.current = true;
    console.log("Index component mounted");
    return () => {
      console.log("Index component unmounted");
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    console.log("Iniciando carregamento de dados (effect trigger)");
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [refreshTasks]);

  useEffect(() => {
    logCurrentState();
  }, [
    taskCounts, areaProgress, moodHistory, 
    isDataLoading, tasksLoading, areasLoading, moodLoading,
    dataLoadingComplete, logCurrentState
  ]);

  const hasError = tasksError || areasError || moodError || dataError;
  const isLoading = isDataLoading || tasksLoading || areasLoading || moodLoading;
  
  // Configuração para o componente de sugestões
  const areaIcons = {
    health: Heart,
    business: Briefcase,
    family: Home,
    spirituality: Sun,
    finances: Wallet
  };
  
  const areaNames = {
    health: "Saúde",
    business: "Negócios",
    family: "Família",
    spirituality: "Espiritualidade",
    finances: "Finanças"
  };
  
  const sourceIcons = {
    book: BookOpen,
    study: GraduationCap,
    quote: Quote
  };
  
  // Hook para gerenciar o estado das sugestões
  const suggestionBoxState = useSuggestionBox({
    onAddGoal: (area, title) => {
      console.log("Adicionar meta:", area, title);
      // Implementar lógica para adicionar meta
    },
    onAddHabit: (area, title, description, implementation) => {
      console.log("Adicionar hábito:", area, title, description);
      // Implementar lógica para adicionar hábito
    },
    areaNames
  });
  
  // Função wrapper para adaptar a assinatura de handleAdd para onAddHabit
  const handleAddHabit = (area: AreaType, title: string, description: string, implementation?: any) => {
    console.log("Adicionando hábito via diálogo:", area, title, description);
    // Aqui você pode implementar a lógica para adicionar o hábito
  };

  return (
    <div className="px-4 pt-16 pb-3 space-y-5 pb-safe max-w-2xl mx-auto bg-gradient-to-b from-purple-50 to-white min-h-screen">
      <HomeHeader />
      
      <div className="space-y-4">
        <WelcomeHeader userName={userName} />
        
        <SuggestionButton 
          setIsOpen={suggestionBoxState.setIsOpen} 
          shuffleTips={suggestionBoxState.shuffleTips} 
        />
      </div>
      
      {hasError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {dataError || tasksError || areasError || moodError || "Ocorreu um erro ao carregar os dados."}
          </AlertDescription>
        </Alert>
      )}
      
      <div>
        {isLoading && !dataLoadingComplete ? (
          <div className="space-y-2">
            <Skeleton className="h-24 w-full rounded-xl" />
            <div className="flex justify-end mt-2">
              <Skeleton className="h-8 w-32 rounded-lg" />
            </div>
          </div>
        ) : (
          <div>
            <DashboardStats 
              taskCounts={{
                today: taskCounts?.today || 0,
                completed: taskCounts?.completed || 0,
                overdue: taskCounts?.overdue || 0
              }} 
            />
            <div className="flex justify-end mt-2">
              <DeleteAllTasksButton />
            </div>
          </div>
        )}
      </div>
      
      <div>
        {(isLoading && !dataLoadingComplete) ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-32 w-full rounded-xl" />
            <Skeleton className="h-32 w-full rounded-xl" />
          </div>
        ) : areaProgress && Array.isArray(areaProgress) && areaProgress.length > 0 ? (
          <LifeAreaCards />
        ) : (
          <div className="bg-white rounded-xl shadow-sm p-4 text-center">
            <p className="text-gray-500">Nenhuma área encontrada</p>
          </div>
        )}
      </div>
      
      <div>
        {(isLoading && !dataLoadingComplete) ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-40 mb-2" />
            <Skeleton className="h-40 w-full rounded-xl" />
          </div>
        ) : (moodHistory && Array.isArray(moodHistory) && moodHistory.length > 0) ? (
          <div className="bg-white rounded-xl shadow-md border-0 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
              <h2 className="text-base font-bold text-gray-800">Diário de Humor</h2>
              <p className="text-xs text-gray-500 mt-1">Acompanhe seu estado emocional ao longo do tempo</p>
            </div>
          <div className="p-5">
            <MoodTimelineCard entries={moodHistory} showFullHistory={false} />
          </div>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-6 text-center">
            <p className="text-gray-500">Nenhum registro de humor encontrado</p>
          </div>
        )}
      </div>
      
      {/* Componente de diálogo de sugestões */}
      <SuggestionDialogs
        isOpen={suggestionBoxState.isOpen}
        setIsOpen={suggestionBoxState.setIsOpen}
        currentTips={suggestionBoxState.currentTips}
        aiTips={suggestionBoxState.aiTips}
        savedTips={suggestionBoxState.savedTips}
        isLoadingAI={suggestionBoxState.isLoadingAI}
        progressValue={suggestionBoxState.progressValue}
        showFavorites={suggestionBoxState.showFavorites}
        setShowFavorites={suggestionBoxState.setShowFavorites}
        isConfirmDialogOpen={suggestionBoxState.isConfirmDialogOpen}
        setIsConfirmDialogOpen={suggestionBoxState.setIsConfirmDialogOpen}
        selectedTip={suggestionBoxState.selectedTip}
        habitPlan={suggestionBoxState.habitPlan}
        shuffleTips={suggestionBoxState.shuffleTips}
        getFavoriteTips={suggestionBoxState.getFavoriteTips}
        handleAdd={suggestionBoxState.handleAdd}
        toggleSaveTip={suggestionBoxState.toggleSaveTip}
        fetchAISuggestions={suggestionBoxState.fetchAISuggestions}
        stopProgress={suggestionBoxState.stopProgress}
        areaIcons={areaIcons}
        areaNames={areaNames}
        sourceIcons={sourceIcons}
        onAddHabit={handleAddHabit}
      />
      
      {/* Componente de diálogo de favoritos */}
      <FavoritesDialog
        isOpen={suggestionBoxState.showFavorites}
        onOpenChange={suggestionBoxState.setShowFavorites}
        favoriteTips={suggestionBoxState.getFavoriteTips()}
        onSaveTip={suggestionBoxState.toggleSaveTip}
        onAddTip={suggestionBoxState.handleAdd}
        areaIcons={areaIcons}
        areaNames={areaNames}
        sourceIcons={sourceIcons}
      />
      
      {/* Botão oculto para abrir o diálogo de favoritos */}
      <button 
        className="hidden" 
        data-favorites-trigger="true" 
        onClick={() => suggestionBoxState.setShowFavorites(true)}
      />
    </div>
  );
}

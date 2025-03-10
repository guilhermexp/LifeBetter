import { useEffect, useCallback } from "react";
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
import { AreaType } from "@/types/habits";
import { Heart, Briefcase, Home, Sun, Wallet, BookOpen, GraduationCap, Quote } from "lucide-react";
import { MoodTimelineCard } from "@/components/mindfulness/MoodTimelineCard";
import { LifeAreaCards } from "@/components/home/LifeAreaCards";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { useDataLoading, loadDataInParallel } from "@/utils/dataLoading";

export default function Index() {
  const { taskCounts, fetchTasks, isLoading: tasksLoading, error: tasksError } = useTasks();
  const { areaProgress, fetchAreaProgress, isLoading: areasLoading, error: areasError } = useAreaProgress();
  const { moodHistory, fetchMoodHistory, isLoading: moodLoading, error: moodError } = useMoodTracking();
  const { refreshTasks } = useRefresh();
  const { user } = useUser();

  const userName = user?.profile?.full_name || 
                  user?.profile?.username || 
                  user?.email?.split('@')[0] || 
                  "Usuário";

  // Função para registrar o estado atual dos dados
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
    tasksLoading, areasLoading, moodLoading,
    taskCounts, areaProgress, moodHistory,
    tasksError, areasError, moodError
  ]);

  // Usar o hook de carregamento de dados para gerenciar o estado de carregamento
  const {
    isLoading: isDataLoading,
    error: dataError,
    loadingStep,
    dataLoadingComplete,
    setLoadingStep
  } = useDataLoading(
    async () => {
      // Função para carregar todos os dados necessários
      const loadTasks = async () => {
        setLoadingStep("tasks");
        console.log("Carregando tarefas...");
        await fetchTasks();
        console.log("Tarefas carregadas com sucesso");
        return true;
      };
      
      const loadAreas = async () => {
        setLoadingStep("areas");
        console.log("Carregando progresso das áreas...");
        await fetchAreaProgress();
        console.log("Progresso das áreas carregado com sucesso");
        return true;
      };
      
      const loadMood = async () => {
        setLoadingStep("mood");
        console.log("Carregando histórico de humor...");
        await fetchMoodHistory();
        console.log("Histórico de humor carregado com sucesso");
        return true;
      };
      
      // Carregar dados em paralelo
      const results = await loadDataInParallel([loadTasks, loadAreas, loadMood]);
      
      // Verificar se todos os carregamentos foram bem-sucedidos
      const allSuccess = results.every(result => result === true);
      
      if (!allSuccess) {
        console.warn("Alguns dados não foram carregados corretamente");
        throw new Error("Alguns dados não puderam ser carregados. Tente novamente mais tarde.");
      }
      
      return { taskCounts, areaProgress, moodHistory };
    },
    [refreshTasks],
    {
      onError: (error) => {
        console.error("Erro ao carregar dados da página inicial:", error);
      }
    }
  );

  // Efeito para registrar o estado atual dos dados
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
    <div className="flex flex-col min-h-screen bg-gradient-to-b from-gray-50 to-white pb-20 w-full max-w-full overflow-x-hidden">
      <HomeHeader />
      
      {/* Header with modern design and elevated appearance - similar to Planner */}
      <div className="bg-white rounded-b-3xl shadow-md pb-1 w-full relative z-10 mt-16">
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 pt-3 pb-3 px-4 rounded-b-3xl">
          <div className="container max-w-2xl mx-auto">
            <WelcomeHeader userName={userName} />
            
            <div className="mt-4">
              <SuggestionButton 
                setIsOpen={suggestionBoxState.setIsOpen} 
                shuffleTips={suggestionBoxState.shuffleTips} 
              />
            </div>
          </div>
        </div>
      </div>
      
      <div className="container max-w-2xl mx-auto px-4 py-6 space-y-4">
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
              <Skeleton className="h-16 w-full rounded-xl" />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-3">
              <DashboardStats 
                taskCounts={{
                  today: taskCounts?.today || 0,
                  completed: taskCounts?.completed || 0,
                  overdue: taskCounts?.overdue || 0
                }} 
              />
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
              <LifeAreaCards />
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-gray-500 text-sm">Nenhuma área encontrada</p>
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                <h2 className="text-sm font-semibold text-gray-800">Diário de Humor</h2>
                <p className="text-xs text-gray-500 mt-0.5">Acompanhe seu estado emocional ao longo do tempo</p>
              </div>
              <div className="p-4">
                <MoodTimelineCard entries={moodHistory} showFullHistory={false} />
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 text-center">
              <p className="text-gray-500 text-sm">Nenhum registro de humor encontrado</p>
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
    </div>
  );
}

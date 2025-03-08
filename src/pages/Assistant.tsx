import { useState, useEffect, useCallback, useMemo } from "react";
import { useAgentInsights } from "@/hooks/useAgentInsights";
import { AgentHeader } from "@/components/assistant/AgentHeader";
import { InsightsList } from "@/components/assistant/InsightsList";
import { ProgressSummary } from "@/components/assistant/ProgressSummary";
import { RecommendationCards } from "@/components/assistant/RecommendationCards";
import { HabitRecommendationCard } from "@/components/assistant/HabitRecommendationCard";
import { VoiceAssistant } from "@/components/assistant/VoiceAssistant";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { ProgressiveLoader } from "@/components/home/ProgressiveLoader";
import { VirtualizedList } from "@/components/common/VirtualizedList";
import { Skeleton } from "@/components/ui/skeleton";
import { useRefresh } from "@/providers/RefreshProvider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion } from "framer-motion";

export default function Assistant() {
  const [refreshKey, setRefreshKey] = useState(0);
  const { refreshAssistant } = useRefresh();
  const { 
    insights, 
    progressSummary, 
    areaSuggestions, 
    habitRecommendations, 
    refreshData, 
    isLoading 
  } = useAgentInsights();

  // Otimização: Memoize a função de refresh para evitar recriações desnecessárias
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    refreshAssistant();
  }, [refreshAssistant]);

  // Efeito para carregar dados quando o componente montar ou quando refreshKey mudar
  useEffect(() => {
    // Usar um timeout para melhorar a percepção de desempenho
    const timer = setTimeout(() => {
      refreshData();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [refreshKey, refreshData]);

  // Memoize os componentes para evitar re-renderizações desnecessárias
  const memoizedInsightsList = useMemo(() => {
    if (!insights || insights.length === 0) {
      return <InsightsList insights={[]} />;
    }
    
    return <InsightsList insights={insights} />;
  }, [insights]);

  const memoizedProgressSummary = useMemo(() => (
    <ProgressSummary data={progressSummary} />
  ), [progressSummary]);

  const memoizedHabitRecommendations = useMemo(() => (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
      {habitRecommendations && habitRecommendations.length > 0 ? (
        habitRecommendations.map((recommendation, index) => (
          <motion.div
            key={`habit-${index}`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
          >
            <HabitRecommendationCard
              recommendation={recommendation}
              onRefresh={handleRefresh}
            />
          </motion.div>
        ))
      ) : (
        <motion.div 
          className="col-span-2 text-center p-8 bg-white rounded-xl shadow-md"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <p className="text-gray-700 font-medium text-lg">
              Ainda não temos recomendações de hábitos para você.
            </p>
            <p className="text-gray-500 mt-2 max-w-md">
              Continue usando o app para receber sugestões personalizadas baseadas nos seus objetivos e atividades.
            </p>
          </div>
        </motion.div>
      )}
    </div>
  ), [habitRecommendations, handleRefresh]);

  const memoizedAreaSuggestions = useMemo(() => (
    areaSuggestions && areaSuggestions.length > 0 ? (
      <motion.div 
        className="container max-w-7xl mx-auto px-4 mt-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <RecommendationCards recommendations={areaSuggestions} />
      </motion.div>
    ) : null
  ), [areaSuggestions]);

  return (
    <ErrorBoundary>
      <ProgressiveLoader showLoading={isLoading}>
        <div className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20">
          <div className="container max-w-7xl mx-auto p-4 pb-safe">
            <AgentHeader />
          </div>
          
          <div className="container max-w-7xl mx-auto px-4 mb-8">
            <VoiceAssistant />
          </div>
          
          {isLoading ? (
            <div className="container max-w-7xl mx-auto px-4 space-y-6">
              <Skeleton className="h-72 w-full rounded-2xl" />
              <Skeleton className="h-72 w-full rounded-2xl" />
            </div>
          ) : (
            <div className="container max-w-7xl mx-auto px-4">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
              >
                <Tabs defaultValue="insights">
                  <div>
                    <TabsList className="grid grid-cols-3 mb-6 bg-white shadow-md rounded-xl p-1">
                      <TabsTrigger value="insights" className="rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 py-2.5">
                        Insights
                      </TabsTrigger>
                      <TabsTrigger value="stats" className="rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 py-2.5">
                        Progresso
                      </TabsTrigger>
                      <TabsTrigger value="habits" className="rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 py-2.5">
                        Hábitos
                      </TabsTrigger>
                    </TabsList>
                  </div>

                  <TabsContent value="insights" className="mt-4">
                    {memoizedInsightsList}
                  </TabsContent>

                  <TabsContent value="stats" className="mt-4">
                    {memoizedProgressSummary}
                  </TabsContent>

                  <TabsContent value="habits" className="mt-4">
                    {memoizedHabitRecommendations}
                  </TabsContent>
                </Tabs>
              </motion.div>
            </div>
          )}
          
          {memoizedAreaSuggestions}
        </div>
      </ProgressiveLoader>
    </ErrorBoundary>
  );
}

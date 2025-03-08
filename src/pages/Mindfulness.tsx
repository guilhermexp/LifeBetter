
import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet';
import { useLocation } from 'react-router-dom';
import { MoodTracker } from '@/components/mindfulness/MoodTracker';
import { MoodChart } from '@/components/mindfulness/MoodChart';
import { MoodTimelineCard } from '@/components/mindfulness/MoodTimelineCard';
import { WellnessInsights } from '@/components/mindfulness/WellnessInsights';
import { WellnessSuggestions } from '@/components/mindfulness/WellnessSuggestions';
import { MoodReminderSettings } from '@/components/mindfulness/MoodReminderSettings';
import { WellnessChallenges } from '@/components/mindfulness/WellnessChallenges';
import { MoodCheckInDialog } from '@/components/mindfulness/MoodCheckInDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useMoodTracking } from '@/hooks/useMoodTracking';
import { Button } from '@/components/ui/button';
import { Activity, BarChart3, CalendarClock, UserRound, PlusCircle, Brain, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const Mindfulness = () => {
  const {
    currentMood,
    setCurrentMood,
    moodHistory,
    saveMood,
    isLoading,
    moodInsights,
    error
  } = useMoodTracking();
  
  const [isCheckInDialogOpen, setIsCheckInDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("insights");
  const location = useLocation();
  
  // Parse URL query parameters to set active tab
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tabParam = searchParams.get('tab');
    if (tabParam && ['insights', 'history', 'suggestions', 'challenges'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [location.search]);
  
  const handleSaveMood = async (triggers: string[]) => {
    await saveMood(triggers);
  };
  
  return (
    <motion.div 
      className="min-h-screen bg-gradient-to-b from-purple-50 to-white pb-20"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <Helmet>
        <title>Mente | Bem-estar e Humor</title>
      </Helmet>
      
      <div className="container max-w-4xl mx-auto px-4 py-8">
        <motion.header 
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          <div className="flex items-center justify-center gap-3 mb-3">
            <div className="p-3 bg-purple-100 rounded-xl shadow-sm">
              <Brain className="h-7 w-7 text-purple-600" strokeWidth={2} />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-700 to-indigo-700 bg-clip-text text-transparent">
              Bem-estar Mental
            </h1>
          </div>
          <p className="text-gray-600 text-center max-w-xl mx-auto">
            Monitore seu humor, entenda padrões emocionais e receba sugestões personalizadas
          </p>
        </motion.header>

        <div className="grid grid-cols-1 gap-6">
          {/* Main Check-in Button - More professional and modern */}
          <motion.div 
            className="bg-white rounded-xl shadow-md border-0 p-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.2 }}
            whileHover={{ y: -5, boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)" }}
          >
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-400 to-indigo-500 rounded-full flex items-center justify-center mb-4 shadow-md">
                <Sparkles className="h-8 w-8 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-2 text-gray-800">Como você está se sentindo hoje?</h2>
              <p className="text-gray-600 text-sm mb-5 max-w-md">
                Registre seu humor e identifique padrões emocionais para melhorar seu bem-estar.
              </p>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Button 
                  onClick={() => setIsCheckInDialogOpen(true)} 
                  className="px-5 py-6 rounded-xl flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md" 
                  size="lg"
                >
                  <PlusCircle className="h-5 w-5" />
                  <span className="font-medium">Fazer Check-in</span>
                </Button>
              </motion.div>
            </div>
          </motion.div>

          {/* Check-in Dialog */}
          <MoodCheckInDialog 
            isOpen={isCheckInDialogOpen} 
            onOpenChange={setIsCheckInDialogOpen} 
            currentMood={currentMood} 
            setCurrentMood={setCurrentMood} 
            onSave={handleSaveMood} 
            isLoading={isLoading} 
          />

          {/* Tabs for different sections */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            className="bg-white rounded-xl shadow-md p-6 border-0"
          >
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid grid-cols-4 mb-6 bg-gray-50 shadow-sm rounded-xl p-1">
                <TabsTrigger value="insights" className="rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 py-2.5 flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Insights</span>
                </TabsTrigger>
                <TabsTrigger value="history" className="rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 py-2.5 flex items-center gap-2">
                  <CalendarClock className="h-4 w-4" />
                  <span className="hidden sm:inline">Histórico</span>
                </TabsTrigger>
                <TabsTrigger value="suggestions" className="rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 py-2.5 flex items-center gap-2" id="favorites-trigger">
                  <Activity className="h-4 w-4" />
                  <span className="hidden sm:inline">Sugestões</span>
                </TabsTrigger>
                <TabsTrigger value="challenges" className="rounded-lg data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700 py-2.5 flex items-center gap-2">
                  <UserRound className="h-4 w-4" />
                  <span className="hidden sm:inline">Desafios</span>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="insights" className="space-y-6 mt-4">
                <WellnessInsights moodHistory={moodHistory} insights={moodInsights} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="history" className="space-y-6 mt-4">
                <MoodChart moodHistory={moodHistory} isLoading={isLoading} />
                
                <div className="bg-white rounded-xl shadow-md border-0 overflow-hidden mt-6">
                  <div className="px-6 py-4 border-b border-gray-100 bg-gradient-to-r from-purple-50 to-indigo-50">
                    <h2 className="text-base font-bold text-gray-800">Registros Detalhados</h2>
                    <p className="text-xs text-gray-500 mt-1">Histórico completo de todos os seus registros de humor</p>
                  </div>
                  <div className="p-5">
                    <MoodTimelineCard entries={moodHistory} showFullHistory={true} />
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="suggestions" className="space-y-6 mt-4">
                <WellnessSuggestions currentMood={currentMood} moodHistory={moodHistory} isLoading={isLoading} />
              </TabsContent>
              
              <TabsContent value="challenges" className="space-y-6 mt-4">
                <WellnessChallenges currentMood={currentMood} moodHistory={moodHistory} isLoading={isLoading} />
              </TabsContent>
            </Tabs>
          </motion.div>

          {/* Settings */}
          <motion.div 
            className="bg-white rounded-xl shadow-md border-0 p-6"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.4 }}
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <CalendarClock className="h-5 w-5 text-purple-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">Lembretes de Bem-estar</h2>
            </div>
            <MoodReminderSettings />
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default Mindfulness;

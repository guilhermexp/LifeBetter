import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ConnectionStatus from "@/components/common/ConnectionStatus";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect, useState, Suspense } from "react";
import { useRefresh } from "@/providers/RefreshProvider";
import { supabase } from "@/integrations/supabase/client";
import { useSupabaseCacheClear } from "@/hooks/useSupabaseCacheClear";
import {
  IndexPage,
  TodayPage,
  PlannerPage,
  AchievementsPage,
  SettingsPage,
  AuthPage,
  NotFoundPage,
  MindfulnessPage,
  AssistantPage,
  ProfileEditPage
} from "./pages/LazyPages";
import { Sidebar } from "./components/layout/Sidebar";
import BottomNav from "./components/features/BottomNav";
import { initializeMonitoring } from "./monitoring";
import { QuickNoteModal } from "@/components/modals/QuickNoteModal";
import { SmartTaskModal } from "@/components/modals/smart-task";

const queryClient = new QueryClient();

if (typeof window !== 'undefined') {
  initializeMonitoring();
}

const AppContent = () => {
  const location = useLocation();
  const [isSmartTaskModalOpen, setIsSmartTaskModalOpen] = useState(false);
  const [isQuickNoteModalOpen, setIsQuickNoteModalOpen] = useState(false);
  const { refreshTasksFunction } = useRefresh();
  
  // Limpar cache do Supabase ao iniciar o componente
  useSupabaseCacheClear();

  const handleModalSuccess = () => {
    refreshTasksFunction();
  };

  return (
      <div className="flex min-h-screen bg-background w-full max-w-full overflow-hidden">
        <Sidebar />
        <div className="flex-1 overflow-auto w-full max-w-full mx-0 pb-20">
          <Suspense fallback={
            <div className="flex items-center justify-center h-screen">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
            </div>
          }>
            <Routes>
              <Route path="/" element={<IndexPage />} />
              <Route path="/today" element={<TodayPage />} />
              <Route path="/planner" element={<PlannerPage />} />
              <Route path="/achievements" element={<AchievementsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
              <Route path="/profile/edit" element={<ProfileEditPage />} />
              <Route path="/mindfulness" element={<MindfulnessPage />} />
              <Route path="/assistant" element={<AssistantPage />} />
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
          </Suspense>
          <BottomNav />
          
          {/* Modais que não estão no BottomNav */}
          <QuickNoteModal isOpen={isQuickNoteModalOpen} onOpenChange={setIsQuickNoteModalOpen} onSuccess={handleModalSuccess} />
          <SmartTaskModal isOpen={isSmartTaskModalOpen} onOpenChange={setIsSmartTaskModalOpen} onSuccess={handleModalSuccess} />
        </div>
      </div>
  );
};

const ProtectedRoute = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const [session, setSession] = useState<boolean | null>(null);
  const location = useLocation();
  useEffect(() => {
    supabase.auth.getSession().then(({
      data: {
        session
      }
    }) => {
      setSession(!!session);
    });
    const {
      data: {
        subscription
      }
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(!!session);
    });
    return () => subscription.unsubscribe();
  }, []);
  if (session === null) {
    return null;
  }
  if (!session) {
    return <Navigate to="/auth" state={{
      from: location
    }} replace />;
  }
  return <>{children}</>;
};

const App = () => <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <div className="w-full max-w-full overflow-hidden">
        {/* Indicador de status de conexão */}
        <ConnectionStatus />
        
        <Suspense fallback={
          <div className="flex items-center justify-center h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        }>
          <Routes>
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/*" element={<ProtectedRoute>
                <AppContent />
              </ProtectedRoute>} />
          </Routes>
        </Suspense>
      </div>
    </TooltipProvider>
  </QueryClientProvider>;

export default App;

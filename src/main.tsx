
import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/lovable-override.css"; // Importar os estilos de override para Lovable
import { ThemeProvider } from "@/providers/ThemeProvider";
import { Toaster } from "@/components/ui/toaster";
import { UserProvider } from "@/providers/UserProvider.tsx";
import { RefreshProvider } from "@/providers/RefreshProvider.tsx";
import { StoreProvider } from "@/providers/StoreProvider";
import { ResourcePreloader } from "@/components/common/ResourcePreloader";
import { PerformanceOptimizer } from "@/components/common/PerformanceOptimizer";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import {
  IndexPage,
  TodayPage,
  PlannerPage,
  MindfulnessPage,
  AchievementsPage,
  SettingsPage,
  ProfileEditPage,
  AssistantPage,
  AuthPage,
  NotFoundPage
} from "./pages/LazyPages.tsx";

function AppRoutes() {
  return (
    <RefreshProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<IndexPage />} />
            <Route path="today" element={<TodayPage />} />
            <Route path="planner" element={<PlannerPage />} />
            <Route path="mindfulness" element={<MindfulnessPage />} />
            <Route path="achievements" element={<AchievementsPage />} />
            <Route path="settings" element={<SettingsPage />} />
            <Route path="profile" element={<ProfileEditPage />} />
            <Route path="assistant" element={<AssistantPage />} />
          </Route>
          <Route path="/auth" element={<AuthPage />} />
          <Route path="/login" element={<Navigate to="/auth" replace />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
    </RefreshProvider>
  );
}

// Common resources to preload
const commonResources = [
  '/placeholder.svg',
  '/favicon.ico',
];

// Performance metrics callback
const handlePerformanceMetrics = (metrics: any) => {
  // Send metrics to monitoring service in production
  if (import.meta.env.PROD) {
    console.log('Performance metrics:', metrics);
  }
};

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <StoreProvider>
      <ThemeProvider>
        <UserProvider>
          <PerformanceOptimizer 
            debug={import.meta.env.DEV} 
            onMetrics={handlePerformanceMetrics} 
          />
          <ResourcePreloader resources={commonResources} />
          <AppRoutes />
          <Toaster />
        </UserProvider>
      </ThemeProvider>
    </StoreProvider>
  </React.StrictMode>
);

// Exportamos o hook do contexto para compatibilidade com código existente
export { useRefresh } from "@/providers/RefreshProvider";

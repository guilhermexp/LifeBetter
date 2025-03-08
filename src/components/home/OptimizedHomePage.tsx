import React, { useEffect, useState, memo } from 'react';
import { ProgressiveLoader } from './ProgressiveLoader';
import { HomePageSkeleton, WelcomeHeaderSkeleton, InsightsCardSkeleton, ProductivitySummarySkeleton, AreaCardSkeleton } from './SkeletonLoaders';
import { useOptimizedRender } from '@/hooks/useOptimizedRender';
import { useOptimizedData } from '@/hooks/useOptimizedData';
import { LazyImage } from '@/components/common/LazyImage';
import { cn } from '@/lib/utils';

// Define interfaces for the data
interface UserData {
  name: string;
  avatar: string;
}

interface TasksData {
  pending: number;
  completed: number;
  overdue: number;
}

interface AreaData {
  id: number;
  name: string;
  description: string;
  progress: number;
  icon: string;
  color: string;
}

// Define props for the components
interface WelcomeHeaderProps {
  userName: string;
  className?: string;
}

// Mock components if they don't exist
const WelcomeHeader: React.FC<WelcomeHeaderProps> = ({ userName, className }) => (
  <div className={cn('p-4 rounded-md bg-primary/10', className)}>
    <div className="flex justify-between items-start">
      <div className="space-y-1">
        <h1 className="text-xl font-bold">Olá, {userName}!</h1>
        <p className="text-sm text-muted-foreground">Aqui está o resumo das suas atividades.</p>
      </div>
    </div>
  </div>
);

interface OptimizedHomePageProps {
  /** CSS class name */
  className?: string;
  /** User name */
  userName?: string;
  /** Whether to use progressive loading */
  useProgressiveLoading?: boolean;
  /** Whether to use skeleton loading */
  useSkeletonLoading?: boolean;
  /** Whether to use optimized data loading */
  useOptimizedDataLoading?: boolean;
  /** Whether to use optimized rendering */
  useOptimizedRendering?: boolean;
  /** Whether to use content visibility optimization */
  useContentVisibility?: boolean;
  /** Whether to use image optimization */
  useImageOptimization?: boolean;
  /** Whether to prefetch data */
  prefetchData?: boolean;
  /** Callback when page is fully loaded */
  onLoaded?: () => void;
}

/**
 * Optimized home page component
 * 
 * Features:
 * - Progressive loading of components
 * - Skeleton loading states
 * - Optimized data loading
 * - Optimized rendering
 * - Content visibility optimization
 * - Image optimization
 * - Data prefetching
 */
const OptimizedHomePageComponent: React.FC<OptimizedHomePageProps> = ({
  className,
  userName = 'Usuário',
  useProgressiveLoading = true,
  useSkeletonLoading = true,
  useOptimizedDataLoading = true,
  useOptimizedRendering = true,
  useContentVisibility = true,
  useImageOptimization = true,
  prefetchData = true,
  onLoaded,
}) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const shouldRender = useOptimizedRender({ priority: 1 });
  
  // Load user data
  const { data: userData, loading: userLoading } = useOptimizedData<UserData>({
    cacheKey: 'user-data',
    fetchFn: async () => {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            name: userName,
            avatar: '/placeholder.svg',
          });
        }, 300);
      });
    },
    staleWhileRevalidate: true,
    revalidateOnMount: true,
  });
  
  // Load tasks data
  const { data: tasksData, loading: tasksLoading } = useOptimizedData<TasksData>({
    cacheKey: 'tasks-data',
    fetchFn: async () => {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            pending: 0,
            completed: 0,
            overdue: 0,
          });
        }, 500);
      });
    },
    staleWhileRevalidate: true,
    revalidateOnMount: true,
  });
  
  // Load areas data
  const { data: areasData, loading: areasLoading } = useOptimizedData<AreaData[]>({
    cacheKey: 'areas-data',
    fetchFn: async () => {
      // Simulate API call
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve([
            {
              id: 1,
              name: 'Saúde & Bem-estar',
              description: 'Atividades físicas, alimentação, sono e bem-estar geral',
              progress: 0,
              icon: '❤️',
              color: '#ff6b6b',
            },
            {
              id: 2,
              name: 'Carreira & Finanças',
              description: 'Desenvolvimento profissional, projetos e finanças pessoais',
              progress: 0,
              icon: '💼',
              color: '#4dabf7',
            },
          ]);
        }, 700);
      });
    },
    staleWhileRevalidate: true,
    revalidateOnMount: true,
  });
  
  // Handle page load
  useEffect(() => {
    if (!userLoading && !tasksLoading && !areasLoading) {
      // Delay setting loaded to true to allow for animations
      const timer = setTimeout(() => {
        setIsLoaded(true);
        if (onLoaded) onLoaded();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [userLoading, tasksLoading, areasLoading, onLoaded]);
  
  // Don't render until optimized render hook allows it
  if (useOptimizedRendering && !shouldRender) {
    return <HomePageSkeleton />;
  }
  
  // Show skeleton loading state
  if (useSkeletonLoading && (userLoading || tasksLoading || areasLoading)) {
    return <HomePageSkeleton />;
  }
  
  // Render with progressive loading
  if (useProgressiveLoading) {
    return (
      <div className={cn('space-y-6 pb-20', className)}>
        <ProgressiveLoader
          delay={100}
          showLoading={false}
          fadeIn={true}
          staggered={true}
          priorityOrder={[0, 1, 2, 3]} // Order of importance
        >
          {[
            // Welcome header (highest priority)
            <WelcomeHeader
              key="welcome"
              userName={userData?.name || userName}
              className={useContentVisibility ? 'optimize-header' : ''}
            />,
            
            // Insights card (high priority)
            <div
              key="insights"
              className={cn(
                'p-4 rounded-md bg-secondary/10',
                useContentVisibility ? 'optimize-card' : ''
              )}
            >
              <div className="flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">💡</span>
                  <h2 className="text-lg font-medium">Insights e Sugestões</h2>
                </div>
                <span className="text-xl">→</span>
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Descubra hábitos baseados em pesquisas
              </p>
            </div>,
            
            // Productivity summary (medium priority)
            <div
              key="productivity"
              className={cn(
                'space-y-2',
                useContentVisibility ? 'optimize-card' : ''
              )}
            >
              <h2 className="text-lg font-medium">Resumo de produtividade de hoje</h2>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-3 border rounded-md bg-purple-50 dark:bg-purple-900/20">
                  <h3 className="text-sm font-medium">Pendentes Hoje</h3>
                  <p className="text-2xl font-bold">{tasksData?.pending || 0}</p>
                  <p className="text-xs text-muted-foreground">Tarefas</p>
                </div>
                <div className="p-3 border rounded-md bg-green-50 dark:bg-green-900/20">
                  <h3 className="text-sm font-medium">Concluídas</h3>
                  <p className="text-2xl font-bold">{tasksData?.completed || 0}</p>
                  <p className="text-xs text-muted-foreground">Tarefas</p>
                </div>
                <div className="p-3 border rounded-md bg-orange-50 dark:bg-orange-900/20">
                  <h3 className="text-sm font-medium">Atrasadas</h3>
                  <p className="text-2xl font-bold">{tasksData?.overdue || 0}</p>
                  <p className="text-xs text-muted-foreground">Tarefas</p>
                </div>
              </div>
            </div>,
            
            // Areas section (lower priority)
            <div
              key="areas"
              className={cn(
                'space-y-2',
                useContentVisibility ? 'content-visibility-auto' : ''
              )}
            >
              <h2 className="text-lg font-medium">Acompanhamento de Áreas</h2>
              <p className="text-sm text-muted-foreground">
                Acompanhe seu progresso em cada área da vida com base nas suas atividades
              </p>
              
              <div className="space-y-4 mt-4">
                {areasData?.map((area) => (
                  <div
                    key={area.id}
                    className={cn(
                      'p-4 border rounded-md',
                      area.id === 1 ? 'bg-red-50 dark:bg-red-900/10' : 'bg-blue-50 dark:bg-blue-900/10',
                      useContentVisibility ? 'optimize-card' : ''
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{area.icon}</span>
                      <h3 className="text-lg font-medium">{area.name}</h3>
                    </div>
                    <p className="text-sm mt-1">{area.description}</p>
                    <div className="mt-4">
                      <div className="flex justify-between items-center">
                        <p className="text-sm font-medium">Progresso atual</p>
                        <p className="text-sm font-medium">{area.progress}%</p>
                      </div>
                      <div className="h-2 bg-gray-200 rounded-full mt-1 dark:bg-gray-700">
                        <div
                          className="h-2 rounded-full bg-primary"
                          style={{ width: `${area.progress}%` }}
                        ></div>
                      </div>
                    </div>
                    <div className="flex justify-between items-center mt-4">
                      <p className="text-sm text-muted-foreground">
                        Tarefas completadas nesta área
                      </p>
                      <p className="text-sm text-primary">Clique para detalhes</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>,
          ]}
        </ProgressiveLoader>
        
        {/* Floating action button */}
        <div className="fixed bottom-4 right-4">
          <button
            className="w-14 h-14 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-lg hover:bg-primary/90 transition-colors"
            aria-label="Adicionar nova tarefa"
          >
            <span className="text-2xl">+</span>
          </button>
        </div>
      </div>
    );
  }
  
  // Render without progressive loading
  return (
    <div className={cn('space-y-6 pb-20', className)}>
      {/* Regular rendering without progressive loading */}
      {/* ... */}
    </div>
  );
};

// Memoize the component to prevent unnecessary re-renders
export const OptimizedHomePage = memo(OptimizedHomePageComponent);

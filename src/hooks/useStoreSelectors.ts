import { useCallback, useMemo } from 'react';
import { useStore, State, Task } from '@/providers/StoreProvider';

/**
 * Custom hook for accessing store selectors
 * 
 * Features:
 * - Memoized selectors
 * - Derived state calculations
 * - Performance optimizations
 */
export const useStoreSelectors = () => {
  const { state } = useStore();

  // User selectors
  const getUser = useCallback(() => state.user, [state.user]);
  
  const isAuthenticated = useMemo(() => !!state.user, [state.user]);

  // Theme selectors
  const getTheme = useCallback(() => state.theme, [state.theme]);
  
  const isDarkTheme = useMemo(() => {
    if (state.theme === 'dark') return true;
    if (state.theme === 'light') return false;
    // If system, check system preference
    if (typeof window !== 'undefined') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    return false;
  }, [state.theme]);

  // Task selectors
  const getTasks = useCallback(() => state.tasks, [state.tasks]);
  
  const getTaskById = useCallback(
    (taskId: string) => state.tasks.find((task) => task.id === taskId),
    [state.tasks]
  );
  
  const getCompletedTasks = useCallback(
    () => state.tasks.filter((task) => task.completed),
    [state.tasks]
  );
  
  const getIncompleteTasks = useCallback(
    () => state.tasks.filter((task) => !task.completed),
    [state.tasks]
  );
  
  const getTasksByDate = useCallback(
    (date: string) => state.tasks.filter((task) => task.scheduled_date === date),
    [state.tasks]
  );
  
  const getTasksByPriority = useCallback(
    (priority: 'low' | 'medium' | 'high') =>
      state.tasks.filter((task) => task.priority === priority),
    [state.tasks]
  );
  
  const getTasksStats = useMemo(() => {
    const total = state.tasks.length;
    const completed = state.tasks.filter((task) => task.completed).length;
    const incomplete = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    // Count by priority
    const byPriority = {
      high: state.tasks.filter((task) => task.priority === 'high').length,
      medium: state.tasks.filter((task) => task.priority === 'medium').length,
      low: state.tasks.filter((task) => task.priority === 'low').length,
      none: state.tasks.filter((task) => !task.priority).length,
    };
    
    // Group by date
    const byDate: Record<string, Task[]> = {};
    state.tasks.forEach((task) => {
      const date = task.scheduled_date || 'unscheduled';
      if (!byDate[date]) {
        byDate[date] = [];
      }
      byDate[date].push(task);
    });
    
    return {
      total,
      completed,
      incomplete,
      completionRate,
      byPriority,
      byDate,
    };
  }, [state.tasks]);

  // Loading and error selectors
  const isLoading = useCallback(
    (resource?: string) => resource ? state.loading[resource] : state.loading.global,
    [state.loading]
  );
  
  const getError = useCallback(
    (resource?: string) => resource ? state.error[resource] : state.error.global,
    [state.error]
  );

  return {
    // User
    getUser,
    isAuthenticated,
    
    // Theme
    getTheme,
    isDarkTheme,
    
    // Tasks
    getTasks,
    getTaskById,
    getCompletedTasks,
    getIncompleteTasks,
    getTasksByDate,
    getTasksByPriority,
    getTasksStats,
    
    // Loading and errors
    isLoading,
    getError,
  };
};

import { useCallback } from 'react';
import { useStore, ActionType, User, Task } from '@/providers/StoreProvider';

/**
 * Custom hook for accessing store actions
 * 
 * Features:
 * - Memoized action creators
 * - Type-safe dispatch
 * - Simplified API for common operations
 */
export const useStoreActions = () => {
  const { dispatch } = useStore();

  // User actions
  const setUser = useCallback(
    (user: User | null) => {
      dispatch({
        type: ActionType.SET_USER,
        payload: { user },
      });
    },
    [dispatch]
  );

  // Theme actions
  const setTheme = useCallback(
    (theme: 'light' | 'dark' | 'system') => {
      dispatch({
        type: ActionType.SET_THEME,
        payload: { theme },
      });
    },
    [dispatch]
  );

  // Task actions
  const setTasks = useCallback(
    (tasks: Task[]) => {
      dispatch({
        type: ActionType.SET_TASKS,
        payload: { tasks },
      });
    },
    [dispatch]
  );

  const addTask = useCallback(
    (task: Task) => {
      dispatch({
        type: ActionType.ADD_TASK,
        payload: { task },
      });
    },
    [dispatch]
  );

  const updateTask = useCallback(
    (taskId: string, updates: Partial<Task>) => {
      dispatch({
        type: ActionType.UPDATE_TASK,
        payload: { taskId, updates },
      });
    },
    [dispatch]
  );

  const toggleTaskCompletion = useCallback(
    (taskId: string, currentCompleted: boolean) => {
      dispatch({
        type: ActionType.UPDATE_TASK,
        payload: {
          taskId,
          updates: { completed: !currentCompleted },
        },
      });
    },
    [dispatch]
  );

  const deleteTask = useCallback(
    (taskId: string) => {
      dispatch({
        type: ActionType.DELETE_TASK,
        payload: { taskId },
      });
    },
    [dispatch]
  );

  // Loading and error actions
  const setLoading = useCallback(
    (resource: string, loading: boolean) => {
      dispatch({
        type: ActionType.SET_LOADING,
        payload: { resource, loading },
      });
    },
    [dispatch]
  );

  const setError = useCallback(
    (resource: string, error: Error | null) => {
      dispatch({
        type: ActionType.SET_ERROR,
        payload: { resource, error },
      });
    },
    [dispatch]
  );

  // Reset state
  const resetState = useCallback(() => {
    dispatch({
      type: ActionType.RESET_STATE,
    });
  }, [dispatch]);

  return {
    setUser,
    setTheme,
    setTasks,
    addTask,
    updateTask,
    toggleTaskCompletion,
    deleteTask,
    setLoading,
    setError,
    resetState,
  };
};

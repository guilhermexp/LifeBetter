import { useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useSupabaseCache } from './useSupabaseCache';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  scheduled_date?: string | null;
  due_date?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
  user_id: string;
  created_at: string;
  updated_at?: string;
  [key: string]: any;
}

interface UseCachedTasksOptions {
  /** Whether to include completed tasks */
  includeCompleted?: boolean;
  /** Filter by date */
  date?: string;
  /** Cache expiration time in milliseconds */
  cacheTime?: number;
}

/**
 * Hook for fetching tasks with caching
 * 
 * Features:
 * - Cached task data with automatic invalidation
 * - Filtering options
 * - Optimized performance
 */
export function useCachedTasks(options: UseCachedTasksOptions = {}) {
  const { includeCompleted = false, date, cacheTime = 2 * 60 * 1000 } = options;
  
  // Create a fetch function that will be memoized and used as a cache key
  const fetchTasks = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error('User not authenticated');
    }
    
    // Build query
    let query = supabase
      .from('tasks')
      .select('*')
      .eq('user_id', user.id);
    
    // Apply filters
    if (!includeCompleted) {
      query = query.eq('completed', false);
    }
    
    if (date) {
      query = query.eq('scheduled_date', date);
    }
    
    // Execute query
    const { data, error } = await query;
    
    if (error) {
      throw error;
    }
    
    return data as Task[];
  }, [includeCompleted, date]);
  
  // Use the cache hook with our fetch function
  const {
    data: tasks,
    isLoading,
    error,
    refresh,
    invalidateCache,
  } = useSupabaseCache<Task[]>(fetchTasks, {
    expiresIn: cacheTime,
    cacheKey: `tasks-${includeCompleted}-${date || 'all'}`,
  });
  
  // Function to toggle task completion with cache update
  const toggleTaskCompletion = useCallback(async (taskId: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !completed })
        .eq('id', taskId);
      
      if (error) {
        throw error;
      }
      
      // Refresh cache to get updated data
      refresh();
      
      return true;
    } catch (err) {
      console.error('Error toggling task completion:', err);
      return false;
    }
  }, [refresh]);
  
  // Function to delete a task with cache update
  const deleteTask = useCallback(async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) {
        throw error;
      }
      
      // Refresh cache to get updated data
      refresh();
      
      return true;
    } catch (err) {
      console.error('Error deleting task:', err);
      return false;
    }
  }, [refresh]);
  
  return {
    tasks: tasks || [],
    isLoading,
    error,
    refresh,
    invalidateCache,
    toggleTaskCompletion,
    deleteTask,
  };
}

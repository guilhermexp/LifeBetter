
import { useState, useEffect } from "react";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Habit } from "@/types/habits";
import { Task } from "@/types/today";

export function useTodayData(selectedDate: Date, shouldRefresh: boolean) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);
  const [completedHabits, setCompletedHabits] = useState<string[]>([]);
  const { toast } = useToast();
  
  // Fetch data
  useEffect(() => {
    fetchTasks();
    fetchHabits();
  }, [shouldRefresh, selectedDate]);
  
  const fetchTasks = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('scheduled_date', format(selectedDate, 'yyyy-MM-dd'));
        
      if (error) throw error;
      
      const completedIds = data?.filter(task => task.completed).map(task => task.id) || [];
      setCompletedTasks(completedIds);
      
      // Set the tasks with duration as string
      const tasksWithCorrectTypes = data?.map(task => ({
        ...task,
        duration: task.duration ? String(task.duration) : undefined,
        inbox_only: task.scheduled === false // Map scheduled to inbox_only
      })) || [];
      
      setTasks(tasksWithCorrectTypes as Task[]);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar suas tarefas."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const fetchHabits = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      const { data, error } = await supabase
        .from('daily_routines')
        .select('*')
        .eq('user_id', user.id)
        .eq('scheduled_date', format(selectedDate, 'yyyy-MM-dd'));
        
      if (error) throw error;
      
      const completedIds = data?.filter(habit => habit.completed).map(habit => habit.id) || [];
      setCompletedHabits(completedIds);

      // Convert the data to properly match the Habit interface
      const typedHabits: Habit[] = data?.map(habit => {
        // daily_routines don't have duration and scheduled fields, so add them
        return {
          id: habit.id,
          title: habit.title,
          description: habit.description,
          scheduled_date: habit.scheduled_date,
          created_at: habit.created_at,
          completed: habit.completed || false,
          category: habit.category,
          frequency: habit.frequency as any,
          streak_count: habit.streak_count || 0,
          // Explicitly add missing properties with default values
          duration: '30min', // Default duration as string
          duration_days: habit.duration_days,
          // Map scheduled (which may not exist in daily_routines) to inbox_only
          inbox_only: false // Default to false (show in planner)
        };
      }) || [];
      
      setHabits(typedHabits);
    } catch (error) {
      console.error("Erro ao buscar hábitos:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar seus hábitos."
      });
    }
  };

  return {
    tasks,
    habits,
    isLoading,
    completedTasks,
    completedHabits,
    setCompletedTasks,
    setCompletedHabits,
    setTasks,
    setHabits,
    fetchTasks,
    fetchHabits
  };
}

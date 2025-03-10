import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { TaskContextType } from "@/hooks/task-context/types";
import { DetectedContext } from "@/hooks/task-context/types";
import { convertDurationToMinutes } from "./dateUtils";
import { createFutureTaskInstances } from "./taskInstances";

interface TaskCreationParams {
  title: string;
  date: Date | undefined;
  time: string | null;
  location: string | null;
  details: string;
  taskType: TaskContextType;
  detectedContext: DetectedContext;
  frequency?: 'once' | 'daily' | 'weekly' | 'monthly' | 'custom';
  inboxOnly?: boolean; // Parameter to indicate this is inbox-only
}

export const createTask = async ({
  title,
  date,
  time,
  location,
  details,
  taskType,
  detectedContext,
  frequency = 'once',
  inboxOnly = true // Default all newly created tasks to inbox-only
}: TaskCreationParams) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }

    // Se a data não for definida, use a data atual
    const formattedDate = date ? format(date, "yyyy-MM-dd") : format(new Date(), "yyyy-MM-dd");
    
    // For habits, use daily_routines table
    if (taskType === "habit") {
      const { data, error } = await supabase
        .from("daily_routines")
        .insert({
          user_id: user.id,
          title: title,
          description: details,
          scheduled_date: formattedDate,
          start_time: time || null,
          frequency: frequency || "daily",
          completed: false,
          category: "habit",
          // The scheduled column will be used to track if it's inbox-only
          scheduled: !inboxOnly
        })
        .select();
        
      if (error) throw error;
      return data;
    } 
    // For other task types, use tasks table
    else {
      // Parse duration if present in detectedContext
      let durationMins: number | null = null;
      if (detectedContext.duration) {
        durationMins = convertDurationToMinutes(detectedContext.duration);
      }
      
      // Create the initial task (master reference in inbox)
      const taskData: any = {
        user_id: user.id,
        title: title,
        details: details || "", // Usar 'details' em vez de 'description'
        type: taskType,
        start_time: time || null,
        location: location || null,
        completed: false,
        frequency: frequency || 'once',
        duration: durationMins || "0", // Store as string "0" if null
        // Use the scheduled column to track if it's inbox-only
        scheduled: !inboxOnly,
        is_today: true,
        reference_date: formattedDate // Sempre incluir reference_date
      };
      
      // Apenas definir scheduled_date se não for inbox_only
      if (!inboxOnly) {
        taskData.scheduled_date = formattedDate;
      } else {
        // Para tarefas na inbox, ainda precisamos de uma data de referência
        // mas não queremos que ela apareça no planner
        taskData.scheduled_date = formattedDate; // Garantir que scheduled_date também esteja presente
      }
      
      const { data, error } = await supabase
        .from("tasks")
        .insert(taskData)
        .select();
      
      if (error) throw error;
      
      // If task is recurring AND not inbox-only, create future instances
      if (frequency && frequency !== 'once' && !inboxOnly && data && data.length > 0) {
        await createFutureTaskInstances(
          data[0].id,
          user.id,
          frequency,
          date,
          title,
          details || '',
          taskType,
          time,
          location,
          durationMins
        );
      }
      
      return data;
    }
  } catch (error) {
    console.error("Error creating task:", error);
    throw error;
  }
};

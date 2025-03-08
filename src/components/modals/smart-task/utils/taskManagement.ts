
import { supabase } from "@/integrations/supabase/client";
import { createFutureTaskInstances } from "./taskInstances";
// Import the simplified functions
import { updateTasksForParent, deleteTasksForParent, TaskUpdateFields } from "./taskManagementSimple";

// Function to confirm a task and send it to planner
export const confirmTaskForPlanner = async (taskId: string) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    
    // First, get the task details
    const { data: taskData, error: fetchError } = await supabase
      .from("tasks")
      .select("*")
      .eq("id", taskId)
      .single();
      
    if (fetchError) throw fetchError;
    if (!taskData) throw new Error("Task not found");
    
    // Update the task to no longer be inbox-only using scheduled flag
    // and ensure it has a scheduled_date
    const updateData: any = {
      scheduled: true // Instead of inbox_only: false
    };
    
    // Se a tarefa não tiver scheduled_date, use a data atual
    if (!taskData.scheduled_date) {
      updateData.scheduled_date = new Date().toISOString().split('T')[0];
    }
    
    const { data, error } = await supabase
      .from("tasks")
      .update(updateData)
      .eq("id", taskId)
      .eq("user_id", user.id)
      .select();
      
    if (error) throw error;
    
    // If task is recurring, create future instances
    if (taskData.frequency && taskData.frequency !== 'once') {
      const date = new Date(taskData.scheduled_date);
      
      await createFutureTaskInstances(
        taskData.id,
        user.id,
        taskData.frequency,
        date,
        taskData.title,
        taskData.details || '',
        taskData.type,
        taskData.start_time,
        taskData.location,
        taskData.duration
      );
    }
    
    return data;
  } catch (error) {
    console.error("Error confirming task for planner:", error);
    throw error;
  }
};

// Function to update all instances of a recurring task
export const updateAllTaskInstances = async (
  parentTaskId: string, 
  updatedFields: TaskUpdateFields // Using the imported type
) => {
  try {
    // Delegate to the simplified function
    return await updateTasksForParent(parentTaskId, updatedFields);
  } catch (error) {
    console.error("Error updating all task instances:", error);
    throw error;
  }
};

// Function to delete all instances of a recurring task
export const deleteAllTaskInstances = async (parentTaskId: string) => {
  try {
    // Delegate to the simplified function
    return await deleteTasksForParent(parentTaskId);
  } catch (error) {
    console.error("Error deleting all task instances:", error);
    throw error;
  }
};

// Function to update a task to the planner
export const updateTaskToPlanner = async (taskId: string, scheduledDate: string, startTime: string | null) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      throw new Error("Usuário não autenticado");
    }
    
    const { data, error } = await supabase
      .from("tasks")
      .update({
        scheduled_date: scheduledDate,
        start_time: startTime,
        scheduled: true, // When explicitly scheduled, it's no longer inbox-only
      })
      .eq("id", taskId)
      .eq("user_id", user.id)
      .select();
      
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error updating task to planner:", error);
    throw error;
  }
};

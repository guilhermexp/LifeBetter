
import { supabase } from "@/integrations/supabase/client";

// Define a limited type for task fields to avoid deep instantiation
export type TaskUpdateFields = {
  title?: string;
  details?: string;
  type?: string;
  color?: string;
  frequency?: string;
  notification_time?: string;
  duration?: number;
  location?: string;
  scheduled?: boolean;
  completed?: boolean;
  priority?: string;
  scheduled_date?: string;
  start_time?: string;
};

// Simple function to update all tasks that reference a parent
export async function updateTasksForParent(
  parentTaskId: string, 
  updatedFields: TaskUpdateFields  // Using explicit type instead of 'any'
): Promise<any> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Usuário não autenticado");
  }
  
  const { data, error } = await supabase
    .from("tasks")
    .update(updatedFields)
    .eq("parent_task_id", parentTaskId)
    .eq("user_id", user.id);
    
  if (error) throw error;
  
  return data;
}

// Simple function to delete all tasks that reference a parent
export async function deleteTasksForParent(parentTaskId: string): Promise<any> {
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    throw new Error("Usuário não autenticado");
  }
  
  const { data, error } = await supabase
    .from("tasks")
    .delete()
    .eq("parent_task_id", parentTaskId)
    .eq("user_id", user.id);
    
  if (error) throw error;
  
  return data;
}


import { supabase } from "@/integrations/supabase/client";
import { calculateFutureDates } from "./dateUtils";

// Define a simple interface with primitive types only
interface FutureTaskData {
  user_id: string;
  title: string;
  details: string;
  type: string;
  scheduled_date: string;
  start_time: string | null;
  location: string | null;
  completed: boolean;
  frequency: string;
  duration: number | null;
  scheduled: boolean;
  parent_task_id: string;
}

// Simple implementation with explicit types to avoid complex type inference
export function createFutureTaskInstances(
  parentTaskId: string,
  userId: string,
  frequency: string,
  date: Date | undefined,
  title: string,
  details: string,
  taskType: string,
  time: string | null,
  location: string | null,
  durationMins: number | null
): Promise<void> {
  // Se a data não for definida, use a data atual
  const actualDate = date || new Date();
  // Determine count based on frequency
  let count = 0;
  if (frequency === 'daily') {
    count = 30;
  } else if (frequency === 'weekly') {
    count = 12;
  } else if (frequency === 'monthly') {
    count = 6;
  }
  
  const futureDates = calculateFutureDates(frequency, actualDate, count);
  const tasks: FutureTaskData[] = [];
  
  // Manual loop to avoid complex type inference
  for (let i = 0; i < futureDates.length; i++) {
    const taskData: FutureTaskData = {
      user_id: userId,
      title: title,
      details: details,
      type: taskType,
      scheduled_date: futureDates[i],
      start_time: time,
      location: location,
      completed: false,
      frequency: frequency,
      duration: durationMins,
      scheduled: true,
      parent_task_id: parentTaskId
    };
    
    tasks.push(taskData);
  }
  
  // If no tasks to create, return early
  if (tasks.length === 0) {
    return Promise.resolve();
  }
  
  // Insert future instances
  return new Promise((resolve, reject) => {
    supabase
      .from("tasks")
      .insert(tasks)
      .then(({ error }) => {
        if (error) {
          console.error("Error creating future task instances:", error);
          reject(error);
        } else {
          resolve();
        }
      });
  });
}

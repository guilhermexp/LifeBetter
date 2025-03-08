
import { Habit } from "@/types/habits";

export interface Task {
  id: string;
  title: string;
  details?: string;
  scheduled_date: string;
  completed: boolean;
  color?: string;
  created_at: string;
  type: string;
  start_time?: string;
  frequency?: string;
  notification_time?: string;
  duration?: string; // Keeping as string across the app
  inbox_only?: boolean; // Property to distinguish between inbox-only and planner tasks
  parent_task_id?: string; // Reference to the parent task for recurring instances
  location?: string;
  area_type?: string;
}

export interface TodoItem {
  id: string;
  title: string;
  details?: string;
  scheduled_date: string | null;
  completed: boolean;
  color?: string;
  created_at: string;
  type: string;
  itemType: 'task' | 'habit';
  isCompleted: boolean;
  description?: string;
  category?: string;
  streak_count?: number;
  start_time?: string;
  duration_days?: number;
  frequency?: string;
  notification_time?: string;
  subtasks?: string[];
  duration?: string; // Keeping as string across the app
  inbox_only?: boolean; // Property to distinguish between inbox-only and planner tasks
  scheduled?: boolean; // Property to indicate if the task is scheduled for the planner
  reference_date?: string; // Reference date for inbox-only tasks
  parent_task_id?: string; // Reference to the parent task for recurring instances
  location?: string;
  area_type?: string;
}

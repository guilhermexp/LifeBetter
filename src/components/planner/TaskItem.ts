
export interface TaskItem {
  id: string;
  title: string;
  type: string;
  scheduled_date: string;
  start_time?: string;
  completed: boolean;
  details?: string;
  color?: string;
  repeat_days?: number[];
  frequency?: string;
  duration?: string; // Changed to string for consistency across the app
  inbox_only?: boolean;
  parent_task_id?: string;
  user_id?: string;
  area_type?: string;
  location?: string;
  meeting_link?: string;
  isGoogleEvent?: boolean;
  scheduled?: boolean; // Adding for compatibility with database schema
}

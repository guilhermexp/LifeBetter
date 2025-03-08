
export type HabitFrequency = "daily" | "weekly" | "monthly";
export type HabitPriority = "high" | "medium" | "low";
export type AreaType = "health" | "business" | "family" | "spirituality" | "finances";

export interface Habit {
  id: string;
  title: string;
  description?: string;
  area?: AreaType | string; // Modified to accept string for database compatibility
  frequency?: HabitFrequency | string; // Already modified to accept string
  priority?: HabitPriority;
  tags?: string[];
  completed: boolean;
  
  // Make these fields optional for backwards compatibility with existing code
  createdAt?: Date;
  progress?: number;
  streakCount?: number;
  reminderTime?: string;
  
  // Required properties used in Today.tsx and elsewhere
  scheduled_date: string;
  created_at: string;
  
  // Properties needed for the Today.tsx component
  category?: string;
  color?: string;
  type?: string;
  details?: string;
  itemType?: string;
  isCompleted?: boolean;
  streak_count?: number; // Used for DB mapping
  
  // New properties for scheduling in Planner
  start_time?: string;
  end_time?: string;
  duration?: string; // Changed to string for consistency
  repeat_days?: number[]; // For weekly frequency: [0,1,2,3,4,5,6] where 0 is Sunday
  
  // Nova propriedade para duração em dias
  duration_days?: number; // Duração do hábito em dias
  
  // New property to distinguish between inbox-only and planner habits
  inbox_only?: boolean;
  
  // Reference to the parent habit for recurring instances
  parent_habit_id?: string;
  
  // Added for compatibility with TaskItem
  user_id?: string;
  area_type?: string;
}

export interface HabitStats {
  completionRate: number;
  currentStreak: number;
  bestStreak: number;
  totalCompleted: number;
}

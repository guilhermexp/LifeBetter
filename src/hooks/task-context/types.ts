
export type TaskContextType = 'task' | 'meeting' | 'event' | 'habit';

export interface DetectedContext {
  title: string;
  date: string | null;
  time: string | null;
  type: TaskContextType;
  location: string | null;
  people: string[];
  category: string | null;
  suggestedColor: string | null;
  priority?: string;
  workloadStatus?: string;
  recurrence?: {
    hasRecurrence: boolean;
    frequency: string;
    weekdays?: string[];
  };
  description?: string;
  duration?: string;
  suggestedTimeSlots?: string[];
}

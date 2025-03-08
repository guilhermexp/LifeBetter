
import { AreaType } from "./habits";

export interface Goal {
  id: string;
  title: string;
  description?: string;
  progress: number;
  area: AreaType;
  dueDate?: string;
  startDate?: string;
  completed?: boolean;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
  milestones?: Milestone[];
}

export interface Milestone {
  id: string;
  goal_id: string;
  title: string;
  completed: boolean;
  created_at?: string;
}

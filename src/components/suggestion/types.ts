
import { HabitImplementation, HabitCategory } from "@/data/knowledgeBase";
import { AreaType } from "@/types/habits";

export interface HabitPlan {
  frequency?: string;
  bestTime?: string;
  suggestedDuration?: string;
  implementation: HabitImplementation;
}

export interface FrequencyOption {
  id: "daily" | "weekly" | "monthly" | "custom";
  label: string;
  times?: number;
  periodLabel?: string;
}

// Add AITip interface to resolve missing imports
export interface AITip {
  id: string;
  area: AreaType;
  title: string;
  description: string;
  type: "goal" | "habit";
  source_type: string;
  tags: string[];
  implementation?: HabitImplementation;
  reference?: {
    title: string;
    author: string;
  };
  study?: {
    finding: string;
    source: string;
    application: string;
  };
  quote?: {
    text: string;
    author: string;
  };
}

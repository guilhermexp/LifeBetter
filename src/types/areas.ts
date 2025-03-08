
import { LucideIcon } from "lucide-react";
import { AreaType } from "./habits";

// Extend AreaType to include "growth" and "relationships" types
export type ExtendedAreaType = AreaType | "growth" | "relationships";

export interface AreaProgress {
  area: string;
  progress: number;
  color: string;
  gradient: string;
  icon: LucideIcon;
  description: string;
  areaType: ExtendedAreaType;
  questionnaireScore?: number;
}

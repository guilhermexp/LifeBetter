
import { AreaCard } from "./AreaCard";
import { AreaProgress } from "@/types/areas";
import { AreaType } from "@/types/habits";
import { Habit } from "@/types/habits";
import { Goal } from "@/types/goals";

interface AreaCardsGridProps {
  areas: AreaProgress[];
  onAreaCardClick: (area: AreaProgress | AreaType) => void;
  habits?: Habit[];
  goals?: Goal[];
  tasks?: any[];
}

export function AreaCardsGrid({ 
  areas, 
  onAreaCardClick, 
  habits = [], 
  goals = [], 
  tasks = [] 
}: AreaCardsGridProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
      {areas.map(area => (
        <AreaCard 
          key={area.area} 
          area={area}
          onClick={() => onAreaCardClick(area)}
          habits={habits}
          goals={goals}
          tasks={tasks}
        />
      ))}
    </div>
  );
}

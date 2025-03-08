
import React from "react";
import { Button } from "@/components/ui/button";
import { Calendar, Timer, Flag, Bell } from "lucide-react";

interface NoteOptionsProps {
  isToday: boolean;
  setIsToday: (isToday: boolean) => void;
  hasDueDate: boolean;
  setHasDueDate: (hasDueDate: boolean) => void;
  isPriority: boolean;
  setIsPriority: (isPriority: boolean) => void;
  hasReminder: boolean;
  setHasReminder: (hasReminder: boolean) => void;
}

export const NoteOptions = ({
  isToday,
  setIsToday,
  hasDueDate,
  setHasDueDate,
  isPriority,
  setIsPriority,
  hasReminder,
  setHasReminder
}: NoteOptionsProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant={isToday ? "eventTypeTabActive" : "eventTypeTab"}
        className={`gap-2 px-4 py-2 border text-sm rounded-full ${
          isToday ? "bg-green-500 text-white border-green-500" : "bg-white text-gray-600 border-gray-200"
        }`}
        onClick={() => setIsToday(!isToday)}
      >
        <Calendar className="w-4 h-4" />
        <span>Hoje</span>
      </Button>
      
      <Button
        type="button"
        variant={hasDueDate ? "eventTypeTabActive" : "eventTypeTab"}
        className={`gap-2 px-4 py-2 border text-sm rounded-full ${
          hasDueDate ? "bg-gray-600 text-white border-gray-600" : "bg-white text-gray-600 border-gray-200"
        }`}
        onClick={() => setHasDueDate(!hasDueDate)}
      >
        <Timer className="w-4 h-4" />
        <span>Prazo</span>
      </Button>
      
      <Button
        type="button"
        variant={isPriority ? "eventTypeTabActive" : "eventTypeTab"}
        className={`gap-2 px-4 py-2 border text-sm rounded-full ${
          isPriority ? "bg-red-500 text-white border-red-500" : "bg-white text-gray-600 border-gray-200"
        }`}
        onClick={() => setIsPriority(!isPriority)}
      >
        <Flag className="w-4 h-4" />
        <span>Prioridade</span>
      </Button>
      
      <Button
        type="button"
        variant={hasReminder ? "eventTypeTabActive" : "eventTypeTab"}
        className={`gap-2 px-4 py-2 border text-sm rounded-full ${
          hasReminder ? "bg-blue-500 text-white border-blue-500" : "bg-white text-gray-600 border-gray-200"
        }`}
        onClick={() => setHasReminder(!hasReminder)}
      >
        <Bell className="w-4 h-4" />
        <span>Lembretes</span>
      </Button>
    </div>
  );
};

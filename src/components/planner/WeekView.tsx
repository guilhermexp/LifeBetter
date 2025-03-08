import React from "react";
import { format, isToday } from "date-fns";
import { Button } from "@/components/ui/button";
import { TaskItem } from "./TaskItem";
import { TaskItemComponent } from "./TaskItemComponent";

interface WeekViewProps {
  visibleDays: Date[];
  selectedDate: Date;
  selectDay: (date: Date) => void;
  taskEvents: TaskItem[];
}

export function WeekView({ visibleDays, selectedDate, selectDay, taskEvents }: WeekViewProps) {
  return (
    <div className="grid grid-cols-7 gap-1">
      {visibleDays.map((day) => {
        const dayTasks = taskEvents.filter(
          (task) => format(new Date(task.scheduled_date), "yyyy-MM-dd") === format(day, "yyyy-MM-dd")
        );

        return (
          <div
            key={day.toISOString()}
            className="flex flex-col h-40 border rounded-md p-2 relative"
            style={{
              backgroundColor: isToday(day) ? "#f0f9ff" : "white",
              borderColor: isToday(day) ? "#bae6fd" : "#e5e7eb",
            }}
          >
            <div className="text-sm font-medium text-gray-900">{format(day, "EEE dd")}</div>
            <div className="flex-1 overflow-y-auto mt-1">
              {dayTasks.map((task) => (
                <TaskItemComponent
                  key={task.id}
                  task={task}
                  onClick={() => selectDay(day)}
                />
              ))}
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-1 right-1 rounded-full h-6 w-6 p-0"
              onClick={() => selectDay(day)}
            >
              <span className="sr-only">Select date</span>
            </Button>
          </div>
        );
      })}
    </div>
  );
}

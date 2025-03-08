// First few lines only to fix the import
import React from "react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { TaskItem } from "./TaskItem";
import { TaskItemComponent } from "./TaskItemComponent";

interface DayViewProps {
  selectedDate: Date;
  taskEvents: TaskItem[];
  onToggleCompletion: (taskId: string, currentStatus: boolean) => void;
  onQuickAction: (taskId: string, title: string) => void;
}

export function DayView({
  selectedDate,
  taskEvents,
  onToggleCompletion,
  onQuickAction,
}: DayViewProps) {
  const { toast } = useToast();

  const handleTaskClick = (task: TaskItem) => {
    onQuickAction(task.id, task.title);
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold">
        {format(selectedDate, "EEEE, MMMM dd")}
      </h2>
      {taskEvents.length === 0 ? (
        <div className="text-gray-500">No tasks for this day.</div>
      ) : (
        <div className="space-y-2">
          {taskEvents.map((task) => (
            <TaskItemComponent
              key={task.id}
              task={task}
              onClick={() => handleTaskClick(task)}
            />
          ))}
        </div>
      )}
    </div>
  );
}



import React from "react";
import { TaskItem } from "./TaskItem";
import { cn } from "@/lib/utils";

interface TaskItemComponentProps {
  task: TaskItem;
  onClick: () => void;
}

export function TaskItemComponent({ task, onClick }: TaskItemComponentProps) {
  return (
    <div 
      className={cn(
        "p-2 rounded-md cursor-pointer hover:bg-gray-50 transition-colors",
        task.completed ? "opacity-60" : ""
      )}
      onClick={onClick}
    >
      <div className="text-sm font-medium">{task.title}</div>
      {task.start_time && (
        <div className="text-xs text-gray-500">{task.start_time}</div>
      )}
    </div>
  );
}

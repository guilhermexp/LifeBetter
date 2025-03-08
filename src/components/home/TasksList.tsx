
import { Check, Edit, Trash } from "lucide-react";
import { TaskCard, TaskItem } from "./TaskCard";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TasksListProps {
  title: string;
  tasks: TaskItem[];
  emptyMessage: string;
  onToggleCompletion: (taskId: string, currentStatus: boolean) => void;
}

export function TasksList({
  title,
  tasks,
  emptyMessage,
  onToggleCompletion
}: TasksListProps) {
  return (
    <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm">
      <h2 className="text-lg font-semibold mb-3">{title}</h2>
      
      {tasks.length > 0 ? (
        <div className="space-y-2">
          {tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              onToggleCompletion={onToggleCompletion} 
            />
          ))}
        </div>
      ) : (
        <div className="text-gray-500 text-center py-4">{emptyMessage}</div>
      )}
    </div>
  );
}

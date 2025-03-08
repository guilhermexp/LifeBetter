
import { TaskItem } from "./TaskItem";
import { 
  CalendarClock, CheckCircle2, GraduationCap, 
  Heart, ListChecks, LucideIcon, ShoppingBag,
  ShowerHead
} from "lucide-react";
import { detectTaskIcon } from "@/hooks/task-context/iconDetector";

// Conjunto padrão de ícones para tipos de tarefas
export const taskIcons: { [key: string]: LucideIcon } = {
  task: ListChecks,
  habit: Heart,
  event: CalendarClock,
  meeting: CheckCircle2,
  holiday: GraduationCap,
  shopping: ShoppingBag,
};

export function getTaskIcon(task: TaskItem) {
  // Usa a detecção de ícone pelo título da tarefa se o tipo for "task"
  let TaskIcon;
  
  if (task.type === 'task') {
    TaskIcon = detectTaskIcon(task.title);
  } else {
    // Caso contrário, use o ícone baseado no tipo
    TaskIcon = taskIcons[task.type] || taskIcons.task;
  }
  
  return <TaskIcon className="h-4 w-4 text-white" />;
}

export function getTaskColor(task: TaskItem, index: number) {
  const colors = [
    "#4ade80", // Verde
    "#60a5fa", // Azul
    "#f472b6", // Rosa
    "#facc15", // Amarelo
    "#a78bfa", // Roxo
    "#fb923c", // Laranja
  ];

  const colorIndex = index % colors.length;
  return colors[colorIndex];
}

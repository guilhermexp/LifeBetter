
import { format } from "date-fns";
import { Habit } from "@/types/habits";
import { Task, TodoItem } from "@/types/today";

// Get habit category color based on the category
export function getHabitCategoryColor(category: string): string {
  switch (category) {
    case 'health':
      return '#34A853';
    case 'business':
      return '#4285F4';
    case 'finances':
      return '#FBBC04';
    case 'spirituality':
      return '#9b87f5';
    case 'family':
      return '#FF9500';
    default:
      return '#9b87f5';
  }
}

// Combine tasks and habits into a single array of TodoItems
export function combineItems(
  tasks: Task[], 
  habits: Habit[], 
  completedTasks: string[], 
  completedHabits: string[]
): TodoItem[] {
  const allItems: TodoItem[] = [
    ...tasks.map(task => ({
      ...task,
      itemType: 'task' as const,
      isCompleted: completedTasks.includes(task.id)
    })), 
    ...habits.map(habit => ({
      ...habit,
      itemType: 'habit' as const,
      isCompleted: completedHabits.includes(habit.id),
      details: habit.description || '',
      type: 'routine',
      color: getHabitCategoryColor(habit.category || 'health'),
      duration: typeof habit.duration === 'number' ? String(habit.duration) : habit.duration || undefined
    }))
  ].sort((a, b) => {
    if (a.isCompleted !== b.isCompleted) {
      return a.isCompleted ? 1 : -1;
    }
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
  
  return allItems;
}

// Filter items based on showCompleted flag
export function filterItems(items: TodoItem[], showCompleted: boolean): TodoItem[] {
  return showCompleted ? items : items.filter(item => !item.isCompleted);
}

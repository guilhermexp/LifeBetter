import { useMemo } from 'react';
import { format, isToday, isPast, isFuture, parseISO } from 'date-fns';

interface Task {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  scheduled_date?: string | null;
  due_date?: string | null;
  priority?: 'low' | 'medium' | 'high' | null;
  type?: string;
  [key: string]: any;
}

interface TaskStats {
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  overdueTasks: number;
  todayTasks: number;
  upcomingTasks: number;
  completionRate: number;
  highPriorityTasks: number;
  mediumPriorityTasks: number;
  lowPriorityTasks: number;
  tasksByType: Record<string, number>;
}

/**
 * Custom hook to calculate task statistics with memoization
 * 
 * This hook efficiently calculates various statistics from task data
 * and memoizes the results to prevent unnecessary recalculations
 */
export function useTaskStats(tasks: Task[] | null | undefined): TaskStats {
  // Memoize all calculations to avoid recalculating on every render
  return useMemo(() => {
    // Default stats object
    const defaultStats: TaskStats = {
      totalTasks: 0,
      completedTasks: 0,
      pendingTasks: 0,
      overdueTasks: 0,
      todayTasks: 0,
      upcomingTasks: 0,
      completionRate: 0,
      highPriorityTasks: 0,
      mediumPriorityTasks: 0,
      lowPriorityTasks: 0,
      tasksByType: {}
    };
    
    // Return default stats if tasks is null or undefined
    if (!tasks || tasks.length === 0) {
      return defaultStats;
    }
    
    // Initialize counters
    let completed = 0;
    let overdue = 0;
    let today = 0;
    let upcoming = 0;
    let highPriority = 0;
    let mediumPriority = 0;
    let lowPriority = 0;
    const typeCount: Record<string, number> = {};
    
    // Process each task
    tasks.forEach(task => {
      // Count by completion status
      if (task.completed) {
        completed++;
      }
      
      // Count by due date
      if (task.due_date) {
        const dueDate = parseISO(task.due_date);
        
        if (isToday(dueDate)) {
          today++;
        } else if (isPast(dueDate) && !task.completed) {
          overdue++;
        } else if (isFuture(dueDate)) {
          upcoming++;
        }
      }
      
      // Count by scheduled date if no due date
      else if (task.scheduled_date && !task.due_date) {
        const scheduledDate = parseISO(task.scheduled_date);
        
        if (isToday(scheduledDate)) {
          today++;
        } else if (isFuture(scheduledDate)) {
          upcoming++;
        }
      }
      
      // Count by priority
      if (task.priority === 'high') {
        highPriority++;
      } else if (task.priority === 'medium') {
        mediumPriority++;
      } else if (task.priority === 'low') {
        lowPriority++;
      }
      
      // Count by type
      const type = task.type || 'unknown';
      typeCount[type] = (typeCount[type] || 0) + 1;
    });
    
    // Calculate derived statistics
    const total = tasks.length;
    const pending = total - completed;
    const completionRate = total > 0 ? (completed / total) * 100 : 0;
    
    // Return the stats object
    return {
      totalTasks: total,
      completedTasks: completed,
      pendingTasks: pending,
      overdueTasks: overdue,
      todayTasks: today,
      upcomingTasks: upcoming,
      completionRate: Math.round(completionRate * 10) / 10, // Round to 1 decimal place
      highPriorityTasks: highPriority,
      mediumPriorityTasks: mediumPriority,
      lowPriorityTasks: lowPriority,
      tasksByType: typeCount
    };
  }, [tasks]); // Only recalculate when tasks change
}

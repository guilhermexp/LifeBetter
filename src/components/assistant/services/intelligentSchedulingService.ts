import { Task } from "@/types/today";
import { supabase } from "@/integrations/supabase/client";
import { getPersonalizedSuggestions } from "./memoryService";

/**
 * Interface for rescheduling request
 */
export interface RescheduleRequest {
  taskId: string;
  newDate?: string;
  newTime?: string;
  reason?: string;
}

/**
 * Interface for scheduling conflict
 */
export interface SchedulingConflict {
  taskId: string;
  conflictingTaskId: string;
  conflictType: 'overlap' | 'proximity' | 'location';
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}

/**
 * Detect scheduling conflicts for a task
 */
export const detectSchedulingConflicts = async (
  task: Task,
  allTasks: Task[]
): Promise<SchedulingConflict[]> => {
  const conflicts: SchedulingConflict[] = [];
  
  if (!task.scheduled_date) {
    return conflicts;
  }
  
  // Filter tasks on the same day
  const tasksOnSameDay = allTasks.filter(t => 
    t.id !== task.id && 
    t.scheduled_date === task.scheduled_date
  );
  
  // Check for time overlaps
  if (task.start_time && task.duration) {
    const taskStartMinutes = timeToMinutes(task.start_time);
    const taskEndMinutes = taskStartMinutes + parseInt(task.duration);
    
    tasksOnSameDay.forEach(otherTask => {
      if (otherTask.start_time && otherTask.duration) {
        const otherStartMinutes = timeToMinutes(otherTask.start_time);
        const otherEndMinutes = otherStartMinutes + parseInt(otherTask.duration);
        
        // Check for overlap
        if (
          (taskStartMinutes <= otherEndMinutes && taskEndMinutes >= otherStartMinutes) ||
          (otherStartMinutes <= taskEndMinutes && otherEndMinutes >= taskStartMinutes)
        ) {
          conflicts.push({
            taskId: task.id,
            conflictingTaskId: otherTask.id,
            conflictType: 'overlap',
            severity: 'high',
            suggestion: `Este compromisso se sobrepõe a "${otherTask.title}" das ${otherTask.start_time} às ${minutesToTime(otherEndMinutes)}.`
          });
        }
        
        // Check for proximity (less than 30 minutes between tasks)
        else if (
          (Math.abs(taskEndMinutes - otherStartMinutes) < 30) ||
          (Math.abs(otherEndMinutes - taskStartMinutes) < 30)
        ) {
          conflicts.push({
            taskId: task.id,
            conflictingTaskId: otherTask.id,
            conflictType: 'proximity',
            severity: 'medium',
            suggestion: `Este compromisso está muito próximo de "${otherTask.title}". Considere adicionar mais tempo entre eles.`
          });
        }
      }
    });
  }
  
  // Check for location conflicts (different locations with little time between)
  if (task.location && task.start_time && task.duration) {
    const taskEndMinutes = timeToMinutes(task.start_time) + parseInt(task.duration);
    
    tasksOnSameDay.forEach(otherTask => {
      if (
        otherTask.location && 
        otherTask.location !== task.location && 
        otherTask.start_time
      ) {
        const otherStartMinutes = timeToMinutes(otherTask.start_time);
        
        // If tasks are close in time but in different locations
        if (Math.abs(taskEndMinutes - otherStartMinutes) < 60) {
          conflicts.push({
            taskId: task.id,
            conflictingTaskId: otherTask.id,
            conflictType: 'location',
            severity: 'medium',
            suggestion: `Você tem pouco tempo para se deslocar de "${task.location}" para "${otherTask.location}". Considere reagendar ou adicionar mais tempo entre os compromissos.`
          });
        }
      }
    });
  }
  
  return conflicts;
};

/**
 * Find optimal time slot for a task
 */
export const findOptimalTimeSlot = async (
  task: Task,
  allTasks: Task[],
  preferredTimeRange?: { start: string; end: string }
): Promise<{ date: string; time: string } | null> => {
  try {
    // Get tasks for the next 7 days
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    const startDate = today.toISOString().split('T')[0];
    const endDate = nextWeek.toISOString().split('T')[0];
    
    // Filter tasks in the date range
    const tasksInRange = allTasks.filter(t => 
      t.scheduled_date >= startDate && 
      t.scheduled_date <= endDate
    );
    
    // Group tasks by date
    const tasksByDate: Record<string, Task[]> = {};
    
    tasksInRange.forEach(t => {
      if (!tasksByDate[t.scheduled_date]) {
        tasksByDate[t.scheduled_date] = [];
      }
      
      tasksByDate[t.scheduled_date].push(t);
    });
    
    // Define working hours (9:00 to 18:00 by default)
    const workingHoursStart = preferredTimeRange?.start || '09:00';
    const workingHoursEnd = preferredTimeRange?.end || '18:00';
    
    const workingStartMinutes = timeToMinutes(workingHoursStart);
    const workingEndMinutes = timeToMinutes(workingHoursEnd);
    
    // Calculate task duration in minutes
    const taskDuration = task.duration ? parseInt(task.duration) : 60; // Default to 60 minutes
    
    // Check each day for available slots
    for (let d = 0; d < 7; d++) {
      const date = new Date(today);
      date.setDate(today.getDate() + d);
      
      const dateStr = date.toISOString().split('T')[0];
      const dayTasks = tasksByDate[dateStr] || [];
      
      // Sort tasks by start time
      dayTasks.sort((a, b) => {
        if (!a.start_time) return -1;
        if (!b.start_time) return 1;
        return timeToMinutes(a.start_time) - timeToMinutes(b.start_time);
      });
      
      // Find available time slots
      const busySlots: { start: number; end: number }[] = [];
      
      dayTasks.forEach(t => {
        if (t.start_time) {
          const startMinutes = timeToMinutes(t.start_time);
          const endMinutes = startMinutes + (t.duration ? parseInt(t.duration) : 60);
          
          busySlots.push({ start: startMinutes, end: endMinutes });
        }
      });
      
      // Merge overlapping slots
      const mergedBusySlots: { start: number; end: number }[] = [];
      
      if (busySlots.length > 0) {
        busySlots.sort((a, b) => a.start - b.start);
        
        let currentSlot = { ...busySlots[0] };
        
        for (let i = 1; i < busySlots.length; i++) {
          if (busySlots[i].start <= currentSlot.end) {
            // Merge overlapping slots
            currentSlot.end = Math.max(currentSlot.end, busySlots[i].end);
          } else {
            // Add the current slot and start a new one
            mergedBusySlots.push(currentSlot);
            currentSlot = { ...busySlots[i] };
          }
        }
        
        mergedBusySlots.push(currentSlot);
      }
      
      // Find available slots
      const availableSlots: { start: number; end: number }[] = [];
      
      if (mergedBusySlots.length === 0) {
        // No busy slots, the whole day is available
        availableSlots.push({
          start: workingStartMinutes,
          end: workingEndMinutes
        });
      } else {
        // Check for slot at the beginning of the day
        if (mergedBusySlots[0].start > workingStartMinutes) {
          availableSlots.push({
            start: workingStartMinutes,
            end: mergedBusySlots[0].start
          });
        }
        
        // Check for slots between busy periods
        for (let i = 0; i < mergedBusySlots.length - 1; i++) {
          if (mergedBusySlots[i + 1].start - mergedBusySlots[i].end >= taskDuration) {
            availableSlots.push({
              start: mergedBusySlots[i].end,
              end: mergedBusySlots[i + 1].start
            });
          }
        }
        
        // Check for slot at the end of the day
        if (mergedBusySlots[mergedBusySlots.length - 1].end < workingEndMinutes) {
          availableSlots.push({
            start: mergedBusySlots[mergedBusySlots.length - 1].end,
            end: workingEndMinutes
          });
        }
      }
      
      // Filter slots that are long enough for the task
      const suitableSlots = availableSlots.filter(
        slot => slot.end - slot.start >= taskDuration
      );
      
      if (suitableSlots.length > 0) {
        // Return the first suitable slot
        return {
          date: dateStr,
          time: minutesToTime(suitableSlots[0].start)
        };
      }
    }
    
    // No suitable slot found
    return null;
  } catch (error) {
    console.error("Error in findOptimalTimeSlot:", error);
    return null;
  }
};

/**
 * Reschedule a task
 */
export const rescheduleTask = async (
  request: RescheduleRequest,
  allTasks: Task[]
): Promise<{ success: boolean; message: string; conflicts?: SchedulingConflict[] }> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      return {
        success: false,
        message: "Você precisa estar logado para reagendar tarefas."
      };
    }
    
    // Get the task to reschedule
    const task = allTasks.find(t => t.id === request.taskId);
    
    if (!task) {
      return {
        success: false,
        message: "Tarefa não encontrada."
      };
    }
    
    // Prepare update data
    const updateData: any = {};
    
    if (request.newDate) {
      updateData.scheduled_date = request.newDate;
    }
    
    if (request.newTime) {
      updateData.start_time = request.newTime;
    }
    
    // Check for conflicts
    const updatedTask: Task = {
      ...task,
      ...updateData
    };
    
    const conflicts = await detectSchedulingConflicts(updatedTask, allTasks);
    
    if (conflicts.length > 0) {
      // Return conflicts but don't reschedule yet
      return {
        success: false,
        message: "Existem conflitos com o novo horário. Deseja continuar mesmo assim?",
        conflicts
      };
    }
    
    // Update the task
    const { error } = await supabase
      .from('tasks')
      .update(updateData)
      .eq('id', request.taskId)
      .eq('user_id', user.id);
      
    if (error) {
      console.error("Error rescheduling task:", error);
      return {
        success: false,
        message: "Ocorreu um erro ao reagendar a tarefa. Por favor, tente novamente."
      };
    }
    
    return {
      success: true,
      message: `Tarefa reagendada com sucesso para ${request.newDate || task.scheduled_date}${request.newTime ? ` às ${request.newTime}` : ''}.`
    };
  } catch (error) {
    console.error("Error in rescheduleTask:", error);
    return {
      success: false,
      message: "Ocorreu um erro ao reagendar a tarefa. Por favor, tente novamente."
    };
  }
};

/**
 * Suggest task optimizations based on user behavior and schedule
 */
export const suggestTaskOptimizations = async (
  tasks: Task[]
): Promise<string[]> => {
  try {
    // Get personalized suggestions based on user behavior
    const behaviorSuggestions = await getPersonalizedSuggestions(tasks);
    
    // Additional optimization suggestions
    const optimizationSuggestions: string[] = [];
    
    // Check for tasks that could be grouped by type
    const tasksByType: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      if (task.type) {
        if (!tasksByType[task.type]) {
          tasksByType[task.type] = [];
        }
        
        tasksByType[task.type].push(task);
      }
    });
    
    // Suggest grouping similar tasks
    Object.entries(tasksByType).forEach(([type, typeTasks]) => {
      if (typeTasks.length >= 3) {
        // Check if tasks are spread across different days
        const dates = [...new Set(typeTasks.map(t => t.scheduled_date))];
        
        if (dates.length >= 3) {
          optimizationSuggestions.push(`Você tem ${typeTasks.length} tarefas do tipo "${type}" espalhadas em diferentes dias. Considere agrupá-las para maior produtividade.`);
        }
      }
    });
    
    // Check for overloaded days
    const tasksByDate: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      if (!tasksByDate[task.scheduled_date]) {
        tasksByDate[task.scheduled_date] = [];
      }
      
      tasksByDate[task.scheduled_date].push(task);
    });
    
    // Find days with too many tasks and days with few tasks
    const overloadedDays: string[] = [];
    const lightDays: string[] = [];
    
    Object.entries(tasksByDate).forEach(([date, dateTasks]) => {
      if (dateTasks.length > 8) {
        overloadedDays.push(date);
      } else if (dateTasks.length < 2) {
        lightDays.push(date);
      }
    });
    
    // Suggest redistributing tasks
    if (overloadedDays.length > 0 && lightDays.length > 0) {
      const formattedOverloadedDay = formatDate(overloadedDays[0]);
      const formattedLightDay = formatDate(lightDays[0]);
      
      optimizationSuggestions.push(`Você tem muitas tarefas em ${formattedOverloadedDay} (${tasksByDate[overloadedDays[0]].length}) e poucas em ${formattedLightDay} (${tasksByDate[lightDays[0]].length}). Considere redistribuir algumas tarefas.`);
    }
    
    return [...behaviorSuggestions, ...optimizationSuggestions];
  } catch (error) {
    console.error("Error in suggestTaskOptimizations:", error);
    return [];
  }
};

/**
 * Convert time string (HH:MM) to minutes
 */
const timeToMinutes = (time: string): number => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

/**
 * Convert minutes to time string (HH:MM)
 */
const minutesToTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

/**
 * Format date for display
 */
const formatDate = (dateStr: string): string => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
};

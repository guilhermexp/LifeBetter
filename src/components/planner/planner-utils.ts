import { addDays, subDays, startOfWeek, endOfWeek, isEqual, isSameDay, format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import { AreaType } from "@/types/habits";

// Calculate visible days based on current month
export function calculateVisibleDays(date: Date | null): Date[] {
  if (!date) return [];

  // Generate array of 7 days starting from previous Sunday
  const today = new Date(date);
  
  // Ensure we're using the same date object for calculations
  const firstDayOfWeek = startOfWeek(today, { weekStartsOn: 0 }); // 0 = Sunday
  
  // Create a new array of dates for the week
  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(new Date(firstDayOfWeek), i);
    return day;
  });
  
  console.log("Calculated visible days:", weekDays.map(d => format(d, 'yyyy-MM-dd')));
  return weekDays;
}

// Navigate to previous week
export function getPreviousWeekDate(visibleDays: Date[]): Date | null {
  if (!visibleDays || visibleDays.length === 0) return null;
  const firstDay = visibleDays[0];
  return subDays(firstDay, 7);
}

// Navigate to next week
export function getNextWeekDate(visibleDays: Date[]): Date | null {
  if (!visibleDays || visibleDays.length === 0) return null;
  const lastDay = visibleDays[6];
  return addDays(lastDay, 1);
}

// Format date for display (long version)
export function formatDateLong(date: Date | null): string {
  if (!date) return "";
  return format(date, "d 'de' MMMM", { locale: ptBR });
}

// Format date for display (short version)
export function formatDateShort(date: Date): string {
  return format(date, "EEE, d", { locale: ptBR });
}

// Check if date is today
export function isToday(date: Date): boolean {
  return isSameDay(date, new Date());
}

// Filter tasks based on completion status, area, and now also exclude inbox-only tasks
export function filterTasks(
  tasks: any[], 
  showOnlyCompleted: boolean, 
  selectedArea: AreaType | 'all',
  excludeInboxOnly: boolean = false
): any[] {
  return tasks.filter(task => {
    // Filter by completion status
    if (showOnlyCompleted && !task.completed) {
      return false;
    }
    
    // Filter out inbox-only tasks (tasks that haven't been confirmed for Planner)
    if (excludeInboxOnly && task.inbox_only === true) {
      return false;
    }
    
    // Filter by area
    if (selectedArea !== 'all') {
      const taskArea = task.category || task.area;
      if (taskArea && taskArea !== selectedArea) {
        return false;
      }
    }
    
    return true;
  });
}

// Format date string to Date object
export function parseDate(dateString: string): Date {
  try {
    return parseISO(dateString);
  } catch (error) {
    console.error("Error parsing date:", error);
    return new Date();
  }
}

// Check if a date matches a specific schedule
export function isDateInSchedule(date: Date, scheduleDate: string, frequency: string, repeatDays?: number[]): boolean {
  const scheduleDateTime = parseDate(scheduleDate);
  
  // Para hábitos diários, sempre exibir
  if (frequency === 'daily') {
    // Verificar se a data do agendamento é anterior ou igual à data selecionada
    // para não mostrar hábitos diários antes da data de início
    return !isBefore(date, scheduleDateTime);
  }
  
  // For one-time events
  if (frequency === 'once') {
    return isSameDay(date, scheduleDateTime);
  }
  
  // For weekly events with specific days
  if (frequency === 'weekly' && Array.isArray(repeatDays) && repeatDays.length > 0) {
    const dayOfWeek = date.getDay();
    return repeatDays.includes(dayOfWeek) && !isBefore(date, scheduleDateTime);
  }
  
  // For weekly events (default: same day of week)
  if (frequency === 'weekly') {
    // Verificar se estamos no mesmo dia da semana e após a data de início
    return date.getDay() === scheduleDateTime.getDay() && !isBefore(date, scheduleDateTime);
  }
  
  // For monthly events (same day of month)
  if (frequency === 'monthly') {
    // Verificar se estamos no mesmo dia do mês e após a data de início
    return date.getDate() === scheduleDateTime.getDate() && !isBefore(date, scheduleDateTime);
  }
  
  // For custom frequency, currently handling as a one-time event
  // This could be expanded later for more complex custom schedules
  if (frequency === 'custom') {
    return isSameDay(date, scheduleDateTime);
  }
  
  return false;
}

// Helper function to check if a date is before another, comparing only year, month, and day
function isBefore(date1: Date, date2: Date): boolean {
  const d1 = new Date(date1.getFullYear(), date1.getMonth(), date1.getDate());
  const d2 = new Date(date2.getFullYear(), date2.getMonth(), date2.getDate());
  return d1.getTime() < d2.getTime();
}

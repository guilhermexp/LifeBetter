import { AssistantMessage } from "../hooks/useAssistantMessages";
import { Task } from "@/types/today";

/**
 * Interface for user behavior patterns
 */
export interface UserBehaviorPattern {
  preferredTimes: Record<string, string[]>;
  frequentLocations: string[];
  frequentCancellations: {
    dayOfWeek: number;
    timeRange: string;
  }[];
  productiveHours: string[];
  taskCompletionRate: Record<string, number>;
  preferredMeetingDuration: number;
}

/**
 * Interface for assistant memory
 */
export interface AssistantMemory {
  recentInteractions: AssistantMessage[];
  userPreferences: Record<string, any>;
  userBehaviorPatterns: UserBehaviorPattern;
  lastInteractionDate: string;
}

// Local storage key for assistant memory
const MEMORY_STORAGE_KEY = 'assistant_memory';

/**
 * Get the assistant's memory from local storage
 */
export const getAssistantMemory = async (): Promise<AssistantMemory> => {
  try {
    const storedMemory = localStorage.getItem(MEMORY_STORAGE_KEY);
    
    if (!storedMemory) {
      // Initialize memory if it doesn't exist
      const initialMemory: AssistantMemory = {
        recentInteractions: [],
        userPreferences: {},
        userBehaviorPatterns: {
          preferredTimes: {},
          frequentLocations: [],
          frequentCancellations: [],
          productiveHours: [],
          taskCompletionRate: {},
          preferredMeetingDuration: 60
        },
        lastInteractionDate: new Date().toISOString()
      };
      
      localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(initialMemory));
      return initialMemory;
    }
    
    return JSON.parse(storedMemory) as AssistantMemory;
  } catch (error) {
    console.error("Error in getAssistantMemory:", error);
    
    // Return default memory if there's an error
    return {
      recentInteractions: [],
      userPreferences: {},
      userBehaviorPatterns: {
        preferredTimes: {},
        frequentLocations: [],
        frequentCancellations: [],
        productiveHours: [],
        taskCompletionRate: {},
        preferredMeetingDuration: 60
      },
      lastInteractionDate: new Date().toISOString()
    };
  }
};

/**
 * Update the assistant's memory with new interactions
 */
export const updateAssistantMemory = async (
  newMessages: AssistantMessage[],
  tasks?: Task[]
): Promise<boolean> => {
  try {
    const memory = await getAssistantMemory();
    
    // Update recent interactions (keep last 20)
    const updatedInteractions = [
      ...memory.recentInteractions,
      ...newMessages
    ].slice(-20);
    
    // Update behavior patterns if tasks are provided
    let updatedBehaviorPatterns = { ...memory.userBehaviorPatterns };
    
    if (tasks && tasks.length > 0) {
      updatedBehaviorPatterns = analyzeUserBehavior(tasks, updatedBehaviorPatterns);
    }
    
    // Update memory
    const updatedMemory: AssistantMemory = {
      ...memory,
      recentInteractions: updatedInteractions,
      userBehaviorPatterns: updatedBehaviorPatterns,
      lastInteractionDate: new Date().toISOString()
    };
    
    // Save to local storage
    localStorage.setItem(MEMORY_STORAGE_KEY, JSON.stringify(updatedMemory));
    
    return true;
  } catch (error) {
    console.error("Error in updateAssistantMemory:", error);
    return false;
  }
};

/**
 * Analyze user behavior from tasks
 */
const analyzeUserBehavior = (
  tasks: Task[],
  currentPatterns: UserBehaviorPattern
): UserBehaviorPattern => {
  const updatedPatterns = { ...currentPatterns };
  
  // Extract preferred times by task type
  const timesByType: Record<string, string[]> = {};
  
  tasks.forEach(task => {
    if (task.type && task.start_time) {
      if (!timesByType[task.type]) {
        timesByType[task.type] = [];
      }
      
      if (!timesByType[task.type].includes(task.start_time)) {
        timesByType[task.type].push(task.start_time);
      }
    }
    
    // Extract frequent locations
    if (task.location && !updatedPatterns.frequentLocations.includes(task.location)) {
      updatedPatterns.frequentLocations.push(task.location);
      
      // Keep only top 10 locations
      if (updatedPatterns.frequentLocations.length > 10) {
        updatedPatterns.frequentLocations = updatedPatterns.frequentLocations.slice(-10);
      }
    }
    
    // Analyze task completion rates by type
    if (task.type) {
      if (!updatedPatterns.taskCompletionRate[task.type]) {
        updatedPatterns.taskCompletionRate[task.type] = 0.5; // Start with neutral rate
      }
      
      if (task.completed) {
        updatedPatterns.taskCompletionRate[task.type] += 0.1; // Increment completion rate
        updatedPatterns.taskCompletionRate[task.type] = Math.min(updatedPatterns.taskCompletionRate[task.type], 1);
      } else {
        // For tasks that are past due and not completed
        const taskDate = new Date(task.scheduled_date);
        const today = new Date();
        
        if (taskDate < today && !task.completed) {
          updatedPatterns.taskCompletionRate[task.type] -= 0.1; // Decrement completion rate
          updatedPatterns.taskCompletionRate[task.type] = Math.max(updatedPatterns.taskCompletionRate[task.type], 0);
          
          // Track cancellation patterns
          const dayOfWeek = taskDate.getDay();
          const timeRange = task.start_time ? getTimeRange(task.start_time) : 'all-day';
          
          const existingCancellation = updatedPatterns.frequentCancellations.find(
            c => c.dayOfWeek === dayOfWeek && c.timeRange === timeRange
          );
          
          if (existingCancellation) {
            // Already tracking this pattern, no need to add again
          } else {
            updatedPatterns.frequentCancellations.push({
              dayOfWeek,
              timeRange
            });
            
            // Keep only top 5 cancellation patterns
            if (updatedPatterns.frequentCancellations.length > 5) {
              updatedPatterns.frequentCancellations = updatedPatterns.frequentCancellations.slice(-5);
            }
          }
        }
      }
    }
  });
  
  // Update preferred times
  updatedPatterns.preferredTimes = {
    ...updatedPatterns.preferredTimes,
    ...timesByType
  };
  
  return updatedPatterns;
};

/**
 * Get time range category from a specific time
 */
const getTimeRange = (time: string): string => {
  const hour = parseInt(time.split(':')[0], 10);
  
  if (hour >= 5 && hour < 12) return 'morning';
  if (hour >= 12 && hour < 14) return 'lunch';
  if (hour >= 14 && hour < 18) return 'afternoon';
  if (hour >= 18 && hour < 22) return 'evening';
  return 'night';
};

/**
 * Get personalized suggestions based on user behavior
 */
export const getPersonalizedSuggestions = async (
  tasks: Task[]
): Promise<string[]> => {
  try {
    const memory = await getAssistantMemory();
    const suggestions: string[] = [];
    const patterns = memory.userBehaviorPatterns;
    
    // Check for overloaded schedule
    const todayTasks = tasks.filter(task => {
      const today = new Date().toISOString().split('T')[0];
      return task.scheduled_date === today;
    });
    
    if (todayTasks.length > 8) {
      suggestions.push("Sua agenda para hoje está muito cheia. Considere mover algumas tarefas para outro dia.");
    }
    
    // Check for tasks scheduled during low completion rate times
    tasks.forEach(task => {
      if (task.type && patterns.taskCompletionRate[task.type] < 0.3) {
        suggestions.push(`Você tem um histórico baixo de conclusão para tarefas do tipo "${task.type}". Considere alocar mais tempo ou reagendar para um horário mais produtivo.`);
      }
      
      if (task.scheduled_date) {
        const taskDate = new Date(task.scheduled_date);
        const dayOfWeek = taskDate.getDay();
        const timeRange = task.start_time ? getTimeRange(task.start_time) : 'all-day';
        
        const isCancellationPattern = patterns.frequentCancellations.some(
          c => c.dayOfWeek === dayOfWeek && c.timeRange === timeRange
        );
        
        if (isCancellationPattern) {
          suggestions.push(`Você costuma cancelar compromissos ${getDayName(dayOfWeek)} no período da ${getTimeRangeName(timeRange)}. Deseja reagendar para outro momento?`);
        }
      }
    });
    
    // Suggest task grouping by location
    const locationGroups: Record<string, Task[]> = {};
    
    tasks.forEach(task => {
      if (task.location) {
        if (!locationGroups[task.location]) {
          locationGroups[task.location] = [];
        }
        
        locationGroups[task.location].push(task);
      }
    });
    
    Object.entries(locationGroups).forEach(([location, locationTasks]) => {
      if (locationTasks.length >= 2) {
        const dates = [...new Set(locationTasks.map(t => t.scheduled_date))];
        
        if (dates.length >= 2) {
          suggestions.push(`Você tem ${locationTasks.length} compromissos em "${location}" espalhados em diferentes dias. Considere agrupá-los no mesmo dia para otimizar seu tempo.`);
        }
      }
    });
    
    return suggestions;
  } catch (error) {
    console.error("Error in getPersonalizedSuggestions:", error);
    return [];
  }
};

/**
 * Get day name from day of week number
 */
const getDayName = (dayOfWeek: number): string => {
  const days = ['domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'];
  return days[dayOfWeek];
};

/**
 * Get time range name
 */
const getTimeRangeName = (timeRange: string): string => {
  switch (timeRange) {
    case 'morning': return 'manhã';
    case 'lunch': return 'almoço';
    case 'afternoon': return 'tarde';
    case 'evening': return 'noite';
    case 'night': return 'madrugada';
    default: return 'dia todo';
  }
};

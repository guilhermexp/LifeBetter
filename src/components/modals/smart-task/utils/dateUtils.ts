
import { format, addDays, addMonths } from "date-fns";

// Helper function to convert duration string to number
export const convertDurationToMinutes = (duration: string | undefined): number => {
  if (!duration) return 30; // Default value
  
  const durationMap: { [key: string]: number } = {
    '5min': 5,
    '15min': 15,
    '30min': 30,
    '45min': 45,
    '1h': 60,
    '1h30': 90,
    '2h': 120,
    'custom': 30
  };
  
  // If it's already a number string, parse it
  if (/^\d+$/.test(duration)) {
    return parseInt(duration);
  }
  
  return durationMap[duration] || 30;
};

// Function to calculate future dates based on frequency
export const calculateFutureDates = (
  frequency: string,
  date: Date | undefined,
  count: number
): string[] => {
  // Se a data não for definida, use a data atual
  const actualDate = date || new Date();
  const dates: string[] = [];
  
  if (frequency === 'daily') {
    // Create daily instances
    for (let i = 0; i < count; i++) {
      dates.push(format(addDays(actualDate, i + 1), 'yyyy-MM-dd'));
    }
  } 
  else if (frequency === 'weekly') {
    // Create weekly instances
    for (let i = 0; i < count; i++) {
      dates.push(format(addDays(actualDate, (i + 1) * 7), 'yyyy-MM-dd'));
    }
  }
  else if (frequency === 'monthly') {
    // Create monthly instances
    for (let i = 0; i < count; i++) {
      dates.push(format(addMonths(actualDate, i + 1), 'yyyy-MM-dd'));
    }
  }
  
  return dates;
};

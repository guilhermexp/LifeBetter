
import { format, addDays } from 'date-fns';

export interface BasicEventInfo {
  title: string;
  date?: Date;
  time?: string;
  taskType?: 'task' | 'event' | 'habit' | 'meeting';
  location?: string;
  details?: string;
  category?: string;
}

// Extract basic event information from text for offline processing
export function extractBasicEventInfo(text: string): BasicEventInfo {
  const lowerText = text.toLowerCase();
  let title = "Novo Compromisso";
  let date: Date | undefined = new Date();
  let time: string | undefined;
  let taskType: 'task' | 'event' | 'habit' | 'meeting' = 'task';
  let location: string | undefined;
  let details: string | undefined;
  let category: string | undefined;
  
  // Detect meal events (almoço, jantar, café)
  const mealTypes = {
    'almoço': { time: '12:30', category: 'social' },
    'jantar': { time: '20:00', category: 'social' },
    'café': { time: '09:00', category: 'social' },
  };
  
  // Check for meal events
  for (const [meal, details] of Object.entries(mealTypes)) {
    if (lowerText.includes(meal)) {
      title = meal.charAt(0).toUpperCase() + meal.slice(1);
      taskType = 'event';
      time = details.time;
      category = details.category;
      
      // Check for "com família/pais de [Name]" pattern
      const familyMatch = text.match(/\b(família|pais|parentes)\s+(?:d[aeo]\s+)?([A-Z][a-zA-ZÀ-ÿ]*)/i);
      if (familyMatch) {
        const relation = familyMatch[1];
        const person = familyMatch[2];
        title = `${title} com ${relation} de ${person}`;
        location = `Casa de ${person}`;
      } else if (lowerText.includes('familia')) {
        // Special case for "almoço domingo familia gardenia"
        const familyMatch = lowerText.match(/familia\s+([a-zA-ZÀ-ÿ]+)/i);
        if (familyMatch) {
          const person = familyMatch[1];
          title = `${title} com família de ${person.charAt(0).toUpperCase() + person.slice(1)}`;
          location = `Casa de ${person.charAt(0).toUpperCase() + person.slice(1)}`;
        }
      }
      
      break;
    }
  }
  
  // Detect day of week
  const daysOfWeek = {
    'domingo': 0,
    'segunda': 1,
    'terça': 2,
    'quarta': 3,
    'quinta': 4,
    'sexta': 5,
    'sábado': 6
  };
  
  for (const [day, dayIndex] of Object.entries(daysOfWeek)) {
    if (lowerText.includes(day)) {
      const today = new Date();
      const currentDay = today.getDay();
      let daysToAdd = dayIndex - currentDay;
      
      // If the day has already passed this week, go to next week
      if (daysToAdd <= 0) {
        daysToAdd += 7;
      }
      
      date = addDays(today, daysToAdd);
      break;
    }
  }
  
  // If no specific day is detected, default to today
  if (!date) {
    date = new Date();
  }
  
  return {
    title,
    date,
    time,
    taskType,
    location,
    details,
    category
  };
}

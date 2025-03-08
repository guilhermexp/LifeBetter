
import { TaskContextType } from "./types";

/**
 * Detects the task type based on keywords in the text
 */
export const detectTaskType = (text: string): TaskContextType => {
  // Define keywords for each type
  const meetingKeywords = ['reunião', 'reunir', 'encontro', 'conversa', 'call', 'videoconferência', 'zoom', 'meet', 'teams'];
  const eventKeywords = [
    'evento', 'festa', 'celebração', 'aniversário', 'comemoração', 'workshop', 'seminário', 'palestra',
    'viagem', 'viajar', 'visitar', 'ir para', 'voo', 'embarque', 'hotel', 'excursão', 'passeio', 'férias',
    'almoço com', 'jantar com', 'café com'
  ];
  const habitKeywords = ['hábito', 'rotina', 'diariamente', 'todas as manhãs', 'toda noite', 'todo dia', 'frequente', 'sempre'];
  
  // Special case for meals with people - they're usually events
  if ((text.includes('almoço') || text.includes('jantar') || text.includes('café')) && text.includes('com')) {
    return 'event';
  }
  
  // Check for matches
  if (meetingKeywords.some(keyword => text.includes(keyword))) {
    return 'meeting';
  } else if (eventKeywords.some(keyword => text.includes(keyword))) {
    return 'event';
  } else if (habitKeywords.some(keyword => text.includes(keyword))) {
    return 'habit';
  } else {
    return 'task';
  }
};

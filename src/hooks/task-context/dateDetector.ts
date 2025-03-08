
import { addDays } from "date-fns";
import { isValid } from "date-fns";

/**
 * Extract date from text with improved detection for "tomorrow"
 */
export const extractDate = (text: string): Date | null => {
  const today = new Date();
  
  // Keywords for today, tomorrow, etc.
  if (text.includes('hoje')) {
    return today;
  } else if (text.includes('amanhã') || text.includes('amanha')) {
    return addDays(today, 1);
  } else if (text.includes('depois de amanhã') || text.includes('depois de amanha')) {
    return addDays(today, 2);
  }
  
  // Match date patterns (dd/mm, dd/mm/yyyy)
  const dateRegex = /(\d{1,2})[\/.-](\d{1,2})(?:[\/.-](\d{2,4}))?/g;
  const match = dateRegex.exec(text);
  
  if (match) {
    const day = parseInt(match[1]);
    const month = parseInt(match[2]) - 1; // JavaScript months are 0-indexed
    let year = match[3] ? parseInt(match[3]) : today.getFullYear();
    
    // Handle two-digit years
    if (year < 100) {
      year += 2000;
    }
    
    const date = new Date(year, month, day);
    if (isValid(date)) {
      return date;
    }
  }
  
  // Named days of the week
  const daysInPortuguese = ['domingo', 'segunda', 'segunda-feira', 'terça', 'terça-feira', 'quarta', 'quarta-feira', 'quinta', 'quinta-feira', 'sexta', 'sexta-feira', 'sábado'];
  
  for (let i = 0; i < daysInPortuguese.length; i++) {
    if (text.includes(daysInPortuguese[i])) {
      const currentDayOfWeek = today.getDay();
      let targetDayOfWeek = i % 7; // Map to 0-6 range
      
      // Calculate days to add
      let daysToAdd = targetDayOfWeek - currentDayOfWeek;
      if (daysToAdd <= 0) {
        daysToAdd += 7; // Next week
      }
      
      return addDays(today, daysToAdd);
    }
  }
  
  // Tratar frases como "na próxima semana", "no próximo mês"
  if (text.includes('próxima semana') || text.includes('proxima semana')) {
    return addDays(today, 7);
  }
  
  // Se for evento de viagem e não tiver data específica
  if ((text.includes('viagem') || text.includes('viajar')) && 
      !(text.includes('hoje') || text.includes('amanhã') || text.includes('amanha'))) {
    // Assume que a viagem é em uma semana por padrão
    return addDays(today, 7);
  }
  
  // Para refeições (almoço, jantar) sem data específica mas com dia da semana
  // Ex: "almoço domingo com os pais da Gardenia"
  for (let i = 0; i < daysInPortuguese.length; i++) {
    if (text.includes(daysInPortuguese[i])) {
      const currentDayOfWeek = today.getDay();
      let targetDayOfWeek = i % 7; // Map to 0-6 range
      
      // Calculate days to add
      let daysToAdd = targetDayOfWeek - currentDayOfWeek;
      if (daysToAdd <= 0) {
        daysToAdd += 7; // Next week
      }
      
      return addDays(today, daysToAdd);
    }
  }
  
  return today; // Default to today if no date is detected
};

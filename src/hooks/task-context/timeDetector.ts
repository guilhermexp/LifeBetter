
/**
 * Extract time from text
 */
export const extractTime = (text: string): string | null => {
  // Match time patterns (hh:mm, hh.mm, hh h mm, hh h, etc.)
  const timeRegex = /(\d{1,2})[:\s]?(\d{2})?\s*(?:horas|h|:)?/g;
  const match = timeRegex.exec(text);
  
  if (match) {
    const hours = parseInt(match[1]);
    const minutes = match[2] ? parseInt(match[2]) : 0;
    
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    }
  }
  
  // Time references like "meio-dia", "manhã", "tarde", "noite"
  if (text.includes('meio dia') || text.includes('meio-dia')) {
    return '12:00';
  } else if (text.includes('manhã')) {
    return '09:00';
  } else if (text.includes('tarde')) {
    return '14:00';
  } else if (text.includes('noite')) {
    return '19:00';
  }
  
  // Specific meal times
  if (text.includes('almoço') && !match) {
    return '12:30';
  } else if (text.includes('jantar') && !match) {
    return '20:00';
  } else if (text.includes('café da manhã') && !match) {
    return '08:00';
  } else if (text.includes('café') && text.includes('com') && !match) {
    return '16:00'; // Café da tarde/lanche com alguém
  }
  
  return null;
};

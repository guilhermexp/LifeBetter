
/**
 * Extract location from text
 */
export const extractLocation = (text: string): string | null => {
  // Lookup for location prepositions
  const locationPrepositions = ['em', 'no', 'na', 'nos', 'nas', 'ao', 'à', 'aos', 'às'];
  
  for (const preposition of locationPrepositions) {
    const regex = new RegExp(`${preposition}\\s+([^,.]+)`, 'i');
    const match = regex.exec(text);
    
    if (match && match[1]) {
      // Clean up the location
      return match[1].trim();
    }
  }
  
  // Caso especial para "Gardenia" em "almoço com os pais da Gardenia"
  const familyMatch = text.match(/\bcom (?:os |as )?(pais|família|parentes|avós|tios|primos) d[aeo] ([A-Z][a-záàâãéèêíïóôõöúçñ]+)/i);
  if (familyMatch && familyMatch[2]) {
    return `Casa de ${familyMatch[2]}`;
  }
  
  return null;
};

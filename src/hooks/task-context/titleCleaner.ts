
/**
 * Clean up title by removing detected elements
 */
export const cleanupTitle = (
  text: string, 
  date: Date | null, 
  time: string | null, 
  location: string | null,
  people: string[]
): string => {
  let cleanTitle = text;
  
  // Start with basic cleaners for common task prefixes
  cleanTitle = cleanTitle
    .replace(/^adicionar\s+/i, '')
    .replace(/^criar\s+/i, '')
    .replace(/^agendar\s+/i, '')
    .replace(/^marcar\s+/i, '')
    .replace(/^lembrar\s+/i, '')
    .replace(/^lembrete\s+/i, '');
  
  // Remove date references
  if (date) {
    cleanTitle = cleanTitle
      .replace(/\bhoje\b/gi, '')
      .replace(/\bamanhã\b/gi, '')
      .replace(/\bamanha\b/gi, '')
      .replace(/\bdepois de amanhã\b/gi, '')
      .replace(/\bdepois de amanha\b/gi, '')
      .replace(/\bpróxima semana\b/gi, '')
      .replace(/\bproxima semana\b/gi, '')
      .replace(/\bna próxima semana\b/gi, '')
      .replace(/\bna proxima semana\b/gi, '')
      .replace(/\bno próximo mês\b/gi, '')
      .replace(/\bno proximo mes\b/gi, '');
    
    // Remove date patterns
    const datePattern = /\b\d{1,2}[\/.-]\d{1,2}(?:[\/.-]\d{2,4})?\b/g;
    cleanTitle = cleanTitle.replace(datePattern, '');
    
    // Remove day names
    const dayNames = ['domingo', 'segunda', 'segunda-feira', 'terça', 'terça-feira', 'quarta', 'quarta-feira', 'quinta', 'quinta-feira', 'sexta', 'sexta-feira', 'sábado'];
    for (const day of dayNames) {
      cleanTitle = cleanTitle.replace(new RegExp(`\\b${day}\\b`, 'gi'), '');
    }
  }
  
  // Remove time references
  if (time) {
    // Remove time patterns
    const timePattern = /\b\d{1,2}[:\s]?\d{2}?\s*(?:horas|h|:)?\b/g;
    cleanTitle = cleanTitle.replace(timePattern, '');
    
    // Remove time references
    cleanTitle = cleanTitle
      .replace(/\bmeio dia\b/gi, '')
      .replace(/\bmeio-dia\b/gi, '')
      .replace(/\bde manhã\b/gi, '')
      .replace(/\bda manhã\b/gi, '')
      .replace(/\bpela manhã\b/gi, '')
      .replace(/\bà tarde\b/gi, '')
      .replace(/\bda tarde\b/gi, '')
      .replace(/\bà noite\b/gi, '')
      .replace(/\bde noite\b/gi, '');
  }
  
  // Remove location references
  if (location) {
    const locationPrepositions = ['em', 'no', 'na', 'nos', 'nas', 'ao', 'à', 'aos', 'às'];
    for (const preposition of locationPrepositions) {
      const pattern = new RegExp(`\\b${preposition}\\s+${location}\\b`, 'gi');
      cleanTitle = cleanTitle.replace(pattern, '');
    }
  }
  
  // Remove people references
  for (const person of people) {
    cleanTitle = cleanTitle.replace(new RegExp(`\\bcom\\s+${person}\\b`, 'gi'), '');
    cleanTitle = cleanTitle.replace(new RegExp(`\\b${person}\\b`, 'gi'), '');
  }
  
  // Special case for "almoço com os pais da Gardenia"
  const familyPattern = /\b(almoço|jantar|café)\b.*\bcom\b.*\b(os|as)?\s*(pais|família|parentes)\s*d[aeo]\s*([A-Z][a-záàâãéèêíïóôõöúçñ]+)/i;
  const familyMatch = text.match(familyPattern);
  
  if (familyMatch) {
    const mealType = familyMatch[1];
    const familyType = familyMatch[3];
    const personName = familyMatch[4];
    
    // Just use the meal type as title
    return `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} com ${familyType} de ${personName}`;
  }
  
  // Clean extra spaces
  cleanTitle = cleanTitle
    .replace(/\s+/g, ' ')
    .replace(/\s+[,\.]/g, ',')
    .trim();
  
  return cleanTitle;
};

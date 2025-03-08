
/**
 * Extract people mentioned in the text
 */
export const extractPeople = (text: string): string[] => {
  const people: string[] = [];
  
  // Keywords for people
  const peopleKeywords = ['com', 'e'];
  
  for (const keyword of peopleKeywords) {
    const regex = new RegExp(`${keyword}\\s+([A-Z][a-zÀ-ú]+(\\s[A-Z][a-zÀ-ú]+)?)`, 'g');
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      if (match[1]) {
        people.push(match[1].trim());
      }
    }
  }
  
  // Caso especial para "pais da Gardenia"
  const familyMatch = text.match(/\bcom (?:os |as )?(pais|família|parentes|avós|tios|primos) d[aeo] ([A-Z][a-záàâãéèêíïóôõöúçñ]+)/i);
  if (familyMatch) {
    const relationship = familyMatch[1];
    const personName = familyMatch[2];
    people.push(`${relationship} de ${personName}`);
  }
  
  return people;
};

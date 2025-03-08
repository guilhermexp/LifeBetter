
import { format } from "date-fns";
import { detectTaskType } from "./taskTypeDetector";
import { extractDate } from "./dateDetector";
import { extractTime } from "./timeDetector";
import { extractLocation } from "./locationDetector";
import { extractPeople } from "./peopleDetector";
import { detectCategory, getSuggestedColor } from "./categoryDetector";
import { cleanupTitle } from "./titleCleaner";
import { DetectedContext, TaskContextType } from "./types";

/**
 * Process text to extract context
 */
export const processText = (text: string): DetectedContext => {
  // Convert to lowercase for easier matching
  const lowerText = text.toLowerCase();
  
  // Detect task type
  const type = detectTaskType(lowerText);
  
  // Extract date
  const date = extractDate(lowerText);
  
  // Extract time - changed from const to let to allow reassignment
  let timeValue = extractTime(lowerText);
  
  // Extract location
  let locationValue = extractLocation(lowerText);
  
  // Extract people
  const people = extractPeople(text);
  
  // Detect category
  const category = detectCategory(lowerText);
  
  // Suggested color based on category
  const suggestedColor = getSuggestedColor(category);
  
  // Determine the title (remove date, time, and other detected elements)
  let title = cleanupTitle(text, date, timeValue, locationValue, people);
  
  // Verificação adicional para viagens
  if (lowerText.includes("viagem") || lowerText.includes("viajar") || 
      lowerText.includes("voo") || lowerText.includes("passear") || 
      lowerText.includes("excursão") || lowerText.includes("férias")) {
    
    // Se for sobre viagem e não extraiu um título adequado
    if (!title || title.trim().length < 3) {
      // Tenta encontrar destino
      const destMatch = lowerText.match(/para\s+(?:o|a|os|as)?\s*([a-záàâãéèêíïóôõöúçñ\s]+)(?:[\.,]|$)/i);
      if (destMatch && destMatch[1]) {
        const destination = destMatch[1].trim();
        title = `Viagem para ${destination.charAt(0).toUpperCase() + destination.slice(1)}`;
        
        // Se não definiu location, usa o destino
        if (!locationValue) {
          locationValue = destination.charAt(0).toUpperCase() + destination.slice(1);
        }
      } else {
        title = "Viagem";
      }
    }
    
    // Se o título não menciona viagem ainda
    if (!title.toLowerCase().includes("viagem")) {
      title = "Viagem: " + title;
    }
  }
  
  // Verificação específica para refeições sociais (almoço, jantar, café)
  if ((lowerText.includes("almoço") || lowerText.includes("jantar") || lowerText.includes("café")) &&
      lowerText.includes("com")) {
    
    // Detecção para casos como "almoço com os pais da Gardenia"
    const socialMatch = text.match(/\b(almoço|jantar|café)\b.*\bcom\b.*\b(os|as)?\s*(pais|família|parentes)\s*d[aeo]\s*([A-Z][a-zÀ-ú]+)/i);
    
    if (socialMatch) {
      const mealType = socialMatch[1];
      const familyType = socialMatch[3];
      const personName = socialMatch[4];
      
      title = `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} com ${familyType} de ${personName}`;
      
      // Definir categoria como social
      const updatedCategory = 'social';
      
      // Se não tiver definido time, define baseado no tipo de refeição
      if (!timeValue) {
        if (mealType.includes("almoço")) {
          timeValue = "12:30";
        } else if (mealType.includes("jantar")) {
          timeValue = "20:00";
        } else if (mealType.includes("café")) {
          timeValue = "09:00";
        }
      }
      
      // Se não tiver localização definida, tenta extrair do texto
      if (!locationValue) {
        // Verifica se tem o padrão "na/no + local"
        const locMatch = text.match(/\b(na|no)\s+([A-Za-záàâãéèêíïóôõöúçñ\s]+)(?:[\.,]|$)/i);
        if (locMatch && locMatch[2]) {
          locationValue = locMatch[2].trim();
        } else {
          // Senão, assume "casa de [pessoa]" como local
          locationValue = `Casa de ${personName}`;
        }
      }
      
      // Adicionar pessoas se não tiver ainda
      if (people.length === 0) {
        people.push(`${familyType} de ${personName}`);
      }
      
      // Retornar contexto com categoria social
      return {
        title,
        date: date ? format(date, 'yyyy-MM-dd') : null,
        time: timeValue,
        type: 'event',
        location: locationValue,
        people,
        category: updatedCategory,
        suggestedColor: getSuggestedColor(updatedCategory)
      };
    }
  }
  
  // Capitalize the first letter of the title
  title = title.charAt(0).toUpperCase() + title.slice(1);
  
  return {
    title,
    date: date ? format(date, 'yyyy-MM-dd') : null,
    time: timeValue,
    type: type === 'task' && (lowerText.includes("viagem") || lowerText.includes("viajar")) ? 'event' : type,
    location: locationValue,
    people,
    category,
    suggestedColor
  };
};

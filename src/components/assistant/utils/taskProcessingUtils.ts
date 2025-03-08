
import { AssistantMessage } from "../hooks/useAssistantMessages";
import { supabase } from "@/integrations/supabase/client";

export interface PendingTaskInfo {
  title: string;
  date?: string | null;
  time?: string | null;
  location?: string | null;
}

export const processBasicTaskInfo = (text: string) => {
  // Basic pattern matching for dates
  const dateRegex = /\b(hoje|amanhã|segunda|terça|quarta|quinta|sexta|sábado|domingo|(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?)\b/i;
  const dateMatch = text.match(dateRegex);
  
  // Basic pattern matching for times
  const timeRegex = /\b(\d{1,2})[:\.](\d{2})(?:\s*(?:horas?|h))?\b|\b(\d{1,2})\s*(?:horas?|h)\b|meio[\s-]dia|meia[\s-]noite/i;
  const timeMatch = text.match(timeRegex);
  
  // Matching locations
  const locationRegex = /\bem\s+([^,\.;]+)|\bno\s+([^,\.;]+)|\bna\s+([^,\.;]+)/i;
  const locationMatch = text.match(locationRegex);
  
  // Simple title extraction (taking the first part of the message)
  let title = text.split(/\s+(?:em|no|na|para|às|as|ao|dia)\s+/)[0].trim();
  
  // Specific handling for social events like "almoço com os pais da Gardenia"
  const socialMealMatch = text.match(/\b(almoço|jantar|café)(?:\s+(?:com|para))?\s+(?:(?:os|as)\s+)?(pais|família|parentes|avós|primos|tios)\s+d[aeo]\s+([A-Z][a-zÀ-ú]+)/i);
  
  if (socialMealMatch) {
    const [_, mealType, relationship, person] = socialMealMatch;
    title = `${mealType} com ${relationship} de ${person}`;
  }
  
  // Set default time for social events if not specified
  let time = timeMatch ? timeMatch[0] : null;
  if (!time && text.toLowerCase().includes('almoço')) {
    time = '12:30';
  } else if (!time && text.toLowerCase().includes('jantar')) {
    time = '20:00';
  } else if (!time && text.toLowerCase().includes('café')) {
    time = '09:00';
  }
  
  // Extract location from match
  let location = null;
  if (locationMatch) {
    location = (locationMatch[1] || locationMatch[2] || locationMatch[3]).trim();
  }
  
  return {
    title: title || 'Novo compromisso',
    date: dateMatch ? dateMatch[0] : null,
    time,
    location
  };
};

export const presentTaskConfirmation = (
  taskInfo: PendingTaskInfo,
  setMessages: (updater: (prev: AssistantMessage[]) => AssistantMessage[]) => void,
  setPendingTaskConfirmation: (value: PendingTaskInfo | null) => void,
  setAwaitingConfirmation: (value: boolean) => void,
  lastUserMessageRef: React.MutableRefObject<string>,
  shouldSpeak: boolean = true
) => {
  const confirmationMessage = `Confirmando: ${taskInfo.title || 'Novo compromisso'}${
    taskInfo.date ? ` para ${taskInfo.date}` : ''
  }${taskInfo.time ? ` às ${taskInfo.time}` : ''}${
    taskInfo.location ? ` em ${taskInfo.location}` : ''
  }. Confirma?`;
  
  setMessages(prev => [...prev, { 
    role: 'assistant', 
    content: confirmationMessage,
    shouldSpeak
  }]);
  
  setPendingTaskConfirmation(taskInfo);
  setAwaitingConfirmation(true);
};

export const createTaskFromConfirmation = async (
  pendingTaskInfo: PendingTaskInfo,
  setIsProcessing: (value: boolean) => void,
  setMessages: (updater: (prev: AssistantMessage[]) => AssistantMessage[]) => void,
  setPendingTaskConfirmation: (value: PendingTaskInfo | null) => void,
  setAwaitingConfirmation: (value: boolean) => void,
  refresh: () => void
): Promise<boolean> => {
  try {
    setIsProcessing(true);
    
    const { data: { user } } = await supabase.auth.getUser();
    
    if (!user) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Você precisa estar logado para adicionar tarefas. Por favor, faça login e tente novamente." 
      }]);
      return false;
    }
    
    // Create a new task
    // Fix: Change 'date' to 'scheduled_date' to match the database schema
    const { error } = await supabase
      .from('tasks')
      .insert({
        user_id: user.id,
        title: pendingTaskInfo.title,
        scheduled_date: pendingTaskInfo.date || new Date().toISOString().split('T')[0],
        start_time: pendingTaskInfo.time || null,
        location: pendingTaskInfo.location || null,
        status: 'pending',
        type: 'task'
      });
    
    if (error) {
      console.error("Error creating task:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Ocorreu um erro ao adicionar a tarefa. Por favor, tente novamente." 
      }]);
      return false;
    }
    
    // Reset confirmation state
    setPendingTaskConfirmation(null);
    setAwaitingConfirmation(false);
    
    // Refresh tasks
    refresh();
    
    return true;
  } catch (error) {
    console.error("Error creating task:", error);
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: "Ocorreu um erro ao adicionar a tarefa. Por favor, tente novamente." 
    }]);
    return false;
  } finally {
    setIsProcessing(false);
  }
};

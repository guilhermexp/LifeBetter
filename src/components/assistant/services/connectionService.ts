
import { AssistantMessage } from "../hooks/useAssistantMessages";
import { getFallbackResponse } from "../utils/connectionUtils";
import { setMessages } from "./messageService";

/**
 * Checks if there is an active internet connection
 * @returns Promise resolving to boolean indicating connectivity
 */
export const checkConnection = async (): Promise<boolean> => {
  try {
    console.log("Verificando conexão...");
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000);
    
    try {
      const backupResponse = await fetch('https://www.google.com', { 
        method: 'GET',
        signal: controller.signal,
        mode: 'no-cors' 
      }).catch(() => null);
      
      clearTimeout(timeoutId);
      return !!backupResponse;
    } catch (e) {
      console.log("Falha ao verificar conexão", e);
      return false;
    }
  } catch (e) {
    console.error("Erro ao verificar conexão:", e);
    return false;
  }
};

/**
 * Handles processing user input when device is offline
 */
export const handleOfflineProcessing = (
  text: string,
  setMessages: (updater: (prev: AssistantMessage[]) => AssistantMessage[]) => void,
  connectionAttempts: React.MutableRefObject<number>,
  shouldSpeak: boolean = true
) => {
  connectionAttempts.current += 1;
  
  // Check if it's a social meal event (like "almoço domingo familia gardenia")
  const lowerText = text.toLowerCase();
  const isMealEvent = lowerText.includes('almoço') || lowerText.includes('jantar') || lowerText.includes('café');
  
  if (isMealEvent || isLikelyEventCreation(text)) {
    const taskInfo = processBasicTaskInfo(text);
    if (taskInfo && taskInfo.title) {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Estou offline no momento, mas posso ajudar a adicionar esse compromisso básico. Por favor, confirme os detalhes:",
        shouldSpeak 
      }]);
      return;
    }
  }
  
  const localResponse = getLocalResponse(text);
  if (localResponse) {
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content: localResponse,
      shouldSpeak
    }]);
    return;
  }
  
  const fallbackResponse = getFallbackResponse();
  setMessages(prev => [...prev, { 
    role: 'assistant', 
    content: fallbackResponse,
    shouldSpeak 
  }]);
};

// Import these from their respective files to avoid circular dependencies
import { isLikelyEventCreation, getLocalResponse } from "../utils/localResponseUtils";
import { processBasicTaskInfo } from "../utils/taskProcessingUtils";


import { PendingTaskInfo, processBasicTaskInfo } from "../utils/taskProcessingUtils";
import { AssistantMessage } from "../hooks/useAssistantMessages";
import { supabase } from "@/integrations/supabase/client";

/**
 * Presents task confirmation to the user
 */
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

/**
 * Handles task creation when device is offline
 */
export const handleOfflineTaskCreation = (
  text: string, 
  taskInfo: PendingTaskInfo,
  lastUserMessageRef: React.MutableRefObject<string>,
  setMessages: (updater: (prev: AssistantMessage[]) => AssistantMessage[]) => void,
  setPendingTaskConfirmation: (value: PendingTaskInfo | null) => void,
  setAwaitingConfirmation: (value: boolean) => void,
  shouldSpeak: boolean = true
) => {
  setMessages(prev => [...prev, { 
    role: 'assistant', 
    content: "Estou offline no momento, mas posso ajudar a adicionar esse compromisso básico. Por favor, confirme os detalhes:",
    shouldSpeak 
  }]);
  
  presentTaskConfirmation(taskInfo, setMessages, setPendingTaskConfirmation, setAwaitingConfirmation, lastUserMessageRef, shouldSpeak);
};

/**
 * Processes NLP task information and presents confirmation
 */
export const processTaskInfo = async (
  text: string,
  setMessages: (updater: (prev: AssistantMessage[]) => AssistantMessage[]) => void,
  setPendingTaskConfirmation: (value: PendingTaskInfo | null) => void,
  setAwaitingConfirmation: (value: boolean) => void,
  lastUserMessageRef: React.MutableRefObject<string>,
  shouldSpeak: boolean = true,
  previousMessages: AssistantMessage[] = []
) => {
  try {
    // Try to use Supabase NLP function
    const { data, error } = await supabase.functions.invoke('nlp-assistant', {
      body: {
        message: text,
        previousMessages
      }
    });
    
    if (error) {
      throw error;
    }
    
    if (data && data.taskInfo) {
      presentTaskConfirmation(
        data.taskInfo, 
        setMessages, 
        setPendingTaskConfirmation, 
        setAwaitingConfirmation, 
        lastUserMessageRef,
        shouldSpeak
      );
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error processing task info:", error);
    
    // Fallback to basic processing
    const taskInfo = processBasicTaskInfo(text);
    if (taskInfo && taskInfo.title) {
      presentTaskConfirmation(
        taskInfo, 
        setMessages, 
        setPendingTaskConfirmation, 
        setAwaitingConfirmation, 
        lastUserMessageRef,
        shouldSpeak
      );
      return true;
    }
    
    return false;
  }
};

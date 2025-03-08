
import { AssistantMessage } from "../hooks/useAssistantMessages";
import { isLikelyEventCreation, isQueryAboutAppointments } from "../utils/localResponseUtils";
import { getLocalResponse } from "../utils/localResponseUtils";
import { processBasicTaskInfo } from "../utils/taskProcessingUtils";
import { Task } from "@/types/today";
import { PendingTaskInfo } from "../utils/taskProcessingUtils";
import { checkConnection } from "./connectionService";
import { handleOfflineProcessing } from "./connectionService";
import { handleOfflineTaskCreation } from "./taskService";
import { presentTaskConfirmation } from "./taskService";
import { getRecentMessages } from "./messageService";
import { processTaskInfo } from "./taskService";
import { updateAssistantMemory } from "./memoryService";
import { suggestTaskOptimizations } from "./intelligentSchedulingService";
import { processNaturalLanguage, executeNaturalLanguageCommand } from "./naturalLanguageService";

export interface ProcessUserInputProps {
  text: string;
  setIsProcessing: (value: boolean) => void;
  setIsOffline: (value: boolean) => void;
  connectionAttempts: React.MutableRefObject<number>;
  lastUserMessageRef: React.MutableRefObject<string>;
  setMessages: (updater: (prev: AssistantMessage[]) => AssistantMessage[]) => void;
  setPendingTaskConfirmation: (value: PendingTaskInfo | null) => void;
  setAwaitingConfirmation: (value: boolean) => void;
  awaitingConfirmation: boolean;
  pendingTaskConfirmation: PendingTaskInfo | null;
  handleConfirmationResponse: (text: string) => Promise<void>;
  allTasks?: Task[];
  refresh: () => void;
  shouldSpeak?: boolean;
}

/**
 * Main function to process user input in the assistant
 */
export const processUserInput = async ({
  text,
  setIsProcessing,
  setIsOffline,
  connectionAttempts,
  lastUserMessageRef,
  setMessages,
  setPendingTaskConfirmation,
  setAwaitingConfirmation,
  awaitingConfirmation,
  pendingTaskConfirmation,
  handleConfirmationResponse,
  allTasks,
  refresh,
  shouldSpeak = true
}: ProcessUserInputProps) => {
  try {
    setIsProcessing(true);
    
    // Add user message to memory
    const userMessage: AssistantMessage = { role: 'user', content: text };
    
    // Handle confirmation responses
    if (awaitingConfirmation && pendingTaskConfirmation) {
      await handleConfirmationResponse(text);
      setIsProcessing(false);
      return;
    }
    
    // Check for local responses
    const localResponse = getLocalResponse(text);
    if (localResponse) {
      const assistantMessage: AssistantMessage = { 
        role: 'assistant', 
        content: localResponse,
        shouldSpeak 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update memory with this interaction
      await updateAssistantMemory([userMessage, assistantMessage], allTasks);
      
      setIsProcessing(false);
      return;
    }
    
    // Check internet connection
    const isConnected = await checkConnection();
    if (!isConnected) {
      setIsOffline(true);
      
      if (isLikelyEventCreation(text)) {
        const taskInfo = processBasicTaskInfo(text);
        
        if (taskInfo && taskInfo.title) {
          handleOfflineTaskCreation(text, taskInfo, lastUserMessageRef, setMessages, setPendingTaskConfirmation, setAwaitingConfirmation, shouldSpeak);
          setIsProcessing(false);
          return;
        }
      }
      
      handleOfflineProcessing(text, setMessages, connectionAttempts, shouldSpeak);
      setIsProcessing(false);
      return;
    }
    
    // Get recent messages for context
    const recentMessages = await getRecentMessages(setMessages);
    
    try {
      // Process natural language command
      const command = await processNaturalLanguage(text, recentMessages);
      
      if (command.type !== 'unknown') {
        // Execute the command
        const result = await executeNaturalLanguageCommand(command, allTasks || []);
        
        const assistantMessage: AssistantMessage = { 
          role: 'assistant', 
          content: result.message,
          shouldSpeak 
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Update memory with this interaction
        await updateAssistantMemory([userMessage, assistantMessage], allTasks);
        
        // If the command was successful and requires a refresh
        if (result.success && (command.type === 'create' || command.type === 'delete' || command.type === 'reschedule')) {
          refresh();
        }
        
        // If the command was a query or optimize, check if we should offer suggestions
        if (result.success && (command.type === 'query' || command.type === 'optimize') && allTasks && allTasks.length > 0) {
          // Get optimization suggestions
          const suggestions = await suggestTaskOptimizations(allTasks);
          
          if (suggestions.length > 0) {
            // Pick a random suggestion to offer
            const randomSuggestion = suggestions[Math.floor(Math.random() * suggestions.length)];
            
            setTimeout(() => {
              const suggestionMessage: AssistantMessage = { 
                role: 'assistant', 
                content: `Dica: ${randomSuggestion}`,
                shouldSpeak: false // Don't speak suggestions automatically
              };
              
              setMessages(prev => [...prev, suggestionMessage]);
              
              // Update memory with this suggestion
              updateAssistantMemory([suggestionMessage]);
            }, 3000); // Delay the suggestion to make it feel more natural
          }
        }
        
        setIsProcessing(false);
        return;
      }
      
      // If we couldn't process as a command, fall back to event creation
      const isEventCreationRequest = isLikelyEventCreation(text);
      
      if (isEventCreationRequest) {
        const taskInfo = processBasicTaskInfo(text);
        
        if (taskInfo && taskInfo.title) {
          presentTaskConfirmation(taskInfo, setMessages, setPendingTaskConfirmation, setAwaitingConfirmation, lastUserMessageRef, shouldSpeak);
          
          // Update memory with this interaction
          const assistantMessage: AssistantMessage = { 
            role: 'assistant', 
            content: `Confirmando: ${taskInfo.title || 'Novo compromisso'}${
              taskInfo.date ? ` para ${taskInfo.date}` : ''
            }${taskInfo.time ? ` às ${taskInfo.time}` : ''}${
              taskInfo.location ? ` em ${taskInfo.location}` : ''
            }. Confirma?`,
            shouldSpeak
          };
          
          await updateAssistantMemory([userMessage, assistantMessage], allTasks);
        } else {
          const assistantMessage: AssistantMessage = { 
            role: 'assistant', 
            content: "Parece que você quer criar um evento, mas preciso de mais detalhes. Poderia fornecer informações como data, hora e local?",
            shouldSpeak 
          };
          
          setMessages(prev => [...prev, assistantMessage]);
          
          // Update memory with this interaction
          await updateAssistantMemory([userMessage, assistantMessage], allTasks);
        }
      } else if (isQueryAboutAppointments(text)) {
        // Handle appointment queries using the natural language service
        const queryCommand = {
          type: 'query' as const,
          originalText: text,
          parameters: {}
        };
        
        const result = await executeNaturalLanguageCommand(queryCommand, allTasks || []);
        
        const assistantMessage: AssistantMessage = { 
          role: 'assistant', 
          content: result.message,
          shouldSpeak 
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Update memory with this interaction
        await updateAssistantMemory([userMessage, assistantMessage], allTasks);
      } else {
        // Generic response for unknown commands
        const assistantMessage: AssistantMessage = { 
          role: 'assistant', 
          content: "Não entendi completamente o que você quer fazer. Posso ajudar você a gerenciar sua agenda, criar tarefas, ou responder perguntas sobre seus compromissos. Como posso ajudar?",
          shouldSpeak 
        };
        
        setMessages(prev => [...prev, assistantMessage]);
        
        // Update memory with this interaction
        await updateAssistantMemory([userMessage, assistantMessage], allTasks);
      }
    } catch (error) {
      console.error("Error processing natural language:", error);
      
      const fallbackResponse = "Desculpe, não consegui processar sua solicitação completamente. Posso ajudar você a adicionar um compromisso ou responder perguntas básicas.";
      
      const assistantMessage: AssistantMessage = { 
        role: 'assistant', 
        content: fallbackResponse,
        shouldSpeak 
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Update memory with this interaction
      await updateAssistantMemory([userMessage, assistantMessage], allTasks);
    }
  } catch (error) {
    console.error("Error processing user input:", error);
    handleOfflineProcessing(text, setMessages, connectionAttempts, shouldSpeak);
  } finally {
    setIsProcessing(false);
  }
};

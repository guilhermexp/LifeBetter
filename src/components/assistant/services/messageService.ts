
import { AssistantMessage } from "../hooks/useAssistantMessages";

/**
 * Sets a new assistant message in the messages state
 */
export const setMessages = (
  updater: (prev: AssistantMessage[]) => AssistantMessage[],
  setMessagesFn: (updater: (prev: AssistantMessage[]) => AssistantMessage[]) => void
) => {
  setMessagesFn(updater);
};

/**
 * Gets recent messages from the state
 */
export const getRecentMessages = async (
  setMessagesFn: (updater: (prev: AssistantMessage[]) => AssistantMessage[]) => void
): Promise<AssistantMessage[]> => {
  try {
    return []; // This will be implemented to retrieve messages from state
  } catch (e) {
    console.error("Error getting recent messages:", e);
    setMessagesFn(prev => [...prev, { 
      role: 'assistant', 
      content: "Ocorreu um erro. Poderia tentar novamente?" 
    }]);
    return [];
  }
};

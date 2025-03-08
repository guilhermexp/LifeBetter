
import { useState } from 'react';
import { useAssistantMessages } from './useAssistantMessages';
import { PendingTaskInfo, createTaskFromConfirmation } from '../utils/taskProcessingUtils';

export const useTaskConfirmation = (
  setIsProcessing: (value: boolean) => void,
  refresh: () => void
) => {
  const [pendingTaskConfirmation, setPendingTaskConfirmation] = useState<PendingTaskInfo | null>(null);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);
  const { setMessages } = useAssistantMessages();
  
  const handleConfirmationResponse = async (text: string): Promise<void> => {
    if (!pendingTaskConfirmation) return;
    
    const lowerText = text.toLowerCase();
    const confirmWords = ['sim', 'yes', 'confirmar', 'confirmo', 'ok', 'certo', 'pode', 'correto', 'adicionar'];
    const cancelWords = ['não', 'nao', 'no', 'cancela', 'cancelar', 'errado', 'incorreto'];
    
    const isConfirmation = confirmWords.some(word => lowerText.includes(word));
    const isCancellation = cancelWords.some(word => lowerText.includes(word));
    
    if (isConfirmation) {
      const success = await createTaskFromConfirmation(
        pendingTaskConfirmation,
        setIsProcessing,
        setMessages,
        setPendingTaskConfirmation,
        setAwaitingConfirmation,
        refresh
      );
      
      if (success) {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: "Tarefa adicionada com sucesso! Posso ajudar com mais alguma coisa?" 
        }]);
      }
    } else if (isCancellation) {
      setPendingTaskConfirmation(null);
      setAwaitingConfirmation(false);
      
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Entendi. Quer tentar adicionar a tarefa novamente com informações diferentes?" 
      }]);
    } else {
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "Desculpe, não entendi. Você confirma a criação desta tarefa? Por favor, responda com 'sim' ou 'não'." 
      }]);
    }
  };
  
  return {
    pendingTaskConfirmation,
    setPendingTaskConfirmation,
    awaitingConfirmation,
    setAwaitingConfirmation,
    handleConfirmationResponse
  };
};

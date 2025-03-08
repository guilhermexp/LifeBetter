
import { useState, useRef } from 'react';
import { useTextToSpeech } from './useTextToSpeech';

export interface AssistantMessage {
  role: 'assistant' | 'user';
  content: string;
  shouldSpeak?: boolean;
}

export const useAssistantMessages = () => {
  const [messages, setMessages] = useState<AssistantMessage[]>([
    { 
      role: 'assistant', 
      content: "Olá! Sou seu assistente de agenda. Posso ajudar você a adicionar eventos, tarefas e lembrar de compromissos. Como posso ajudar hoje?",
      shouldSpeak: true
    }
  ]);
  
  const { speak, stopSpeech, isSpeaking } = useTextToSpeech();
  const lastAssistantMessageRef = useRef<string>("");
  
  const addUserMessage = (content: string) => {
    // When user speaks, stop current assistant speech
    if (isSpeaking) {
      stopSpeech();
    }
    
    setMessages(prev => [...prev, { role: 'user', content }]);
  };
  
  const addAssistantMessage = (content: string, shouldSpeak: boolean = true) => {
    lastAssistantMessageRef.current = content;
    
    setMessages(prev => [...prev, { 
      role: 'assistant', 
      content, 
      shouldSpeak 
    }]);
    
    // Speak the message if shouldSpeak is true
    if (shouldSpeak) {
      speak(content);
    }
  };
  
  return {
    messages,
    setMessages,
    addUserMessage,
    addAssistantMessage,
    isSpeaking,
    stopSpeech
  };
};

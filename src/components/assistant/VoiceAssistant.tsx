
import React, { useState, useRef } from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { useTasks } from "@/hooks/useTasks";
import { useRefresh } from "@/providers/RefreshProvider";
import { motion } from "framer-motion";

// Import components
import { AssistantHeader } from "./components/AssistantHeader";
import { AssistantMessages } from "./components/AssistantMessages";
import { AssistantInputBar } from "./components/AssistantInputBar";
import { OfflineAlert } from "./components/OfflineAlert";
import { RetryConnectionButton } from "./components/RetryConnectionButton";

// Import hooks and utilities
import { useAssistantMessages } from "./hooks/useAssistantMessages";
import { useConnectionStatus } from "./hooks/useConnectionStatus";
import { useTaskConfirmation } from "./hooks/useTaskConfirmation";
import { processUserInput } from "./services/assistantService";

export function VoiceAssistant() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const inputRef = useRef<HTMLInputElement>(null);
  const lastUserMessageRef = useRef<string>("");
  const { refresh } = useRefresh();
  const { allTasks } = useTasks();

  // Use custom hooks
  const { 
    messages, 
    setMessages, 
    addUserMessage, 
    isSpeaking,
    stopSpeech
  } = useAssistantMessages();
  
  const { 
    isOffline, 
    setIsOffline, 
    isRetrying, 
    connectionAttempts, 
    handleRetryConnection 
  } = useConnectionStatus();
  
  const { 
    pendingTaskConfirmation, 
    setPendingTaskConfirmation, 
    awaitingConfirmation, 
    setAwaitingConfirmation,
    handleConfirmationResponse 
  } = useTaskConfirmation(setIsProcessing, refresh);

  const handleToggleSpeech = () => {
    if (isSpeaking) {
      stopSpeech();
    }
    setSpeechEnabled(!speechEnabled);
  };

  const handleTranscription = (text: string) => {
    lastUserMessageRef.current = text;
    addUserMessage(text);
    
    handleProcessUserInput(text);
  };

  const handleProcessUserInput = async (text: string) => {
    await processUserInput({
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
      shouldSpeak: speechEnabled
    });
  };

  const handleTextInput = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter' && event.currentTarget.value.trim() && !isProcessing) {
      const text = event.currentTarget.value.trim();
      lastUserMessageRef.current = text;
      event.currentTarget.value = '';
      
      addUserMessage(text);
      handleProcessUserInput(text);
      
      // Prevenir comportamento padrão para evitar rolagem da página
      event.preventDefault();
    }
  };

  const handleSendClick = () => {
    if (inputRef.current && inputRef.current.value.trim() && !isProcessing) {
      const text = inputRef.current.value.trim();
      lastUserMessageRef.current = text;
      inputRef.current.value = '';
      
      addUserMessage(text);
      handleProcessUserInput(text);
    }
  };

  return (
    <motion.div 
      className="space-y-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
    >
      <Card className="overflow-hidden shadow-md border-0 rounded-xl">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-3">
          <AssistantHeader 
            isOffline={isOffline} 
            isSpeaking={isSpeaking}
            onToggleSpeech={handleToggleSpeech}
          />
        </CardHeader>
        
        <CardContent className="p-0 bg-gradient-to-b from-gray-50 to-white">
          {isOffline && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              <OfflineAlert />
            </motion.div>
          )}
          
          <AssistantMessages messages={messages} />
          
          {isOffline && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <RetryConnectionButton 
                isRetrying={isRetrying} 
                onRetry={handleRetryConnection} 
              />
            </motion.div>
          )}
          
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.3 }}
          >
            <AssistantInputBar 
              isProcessing={isProcessing}
              isRecording={isRecording}
              setIsRecording={setIsRecording}
              onTranscription={handleTranscription}
              onSendClick={handleSendClick}
              onTextInput={handleTextInput}
              inputRef={inputRef}
            />
          </motion.div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

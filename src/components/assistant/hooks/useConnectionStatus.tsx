
import { useState, useRef, useEffect } from 'react';
import { useAssistantMessages } from './useAssistantMessages';
import { checkConnection } from '../utils/connectionUtils';

export const useConnectionStatus = () => {
  const [isOffline, setIsOffline] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const connectionAttempts = useRef(0);
  const { addAssistantMessage } = useAssistantMessages();
  
  const handleRetryConnection = async () => {
    setIsRetrying(true);
    const isConnected = await checkConnection();
    setIsOffline(!isConnected);
    if (isConnected) {
      connectionAttempts.current = 0;
      addAssistantMessage("Conexão restaurada! Como posso ajudar você agora?");
    } else {
      addAssistantMessage("Ainda estou com problemas de conexão. Você pode tentar novamente mais tarde ou adicionar eventos manualmente.");
    }
    setIsRetrying(false);
  };
  
  useEffect(() => {
    const checkInitialConnection = async () => {
      const connected = await checkConnection();
      setIsOffline(!connected);
    };
    
    checkInitialConnection();
    
    const intervalId = setInterval(async () => {
      if (isOffline) {
        const connected = await checkConnection();
        if (connected) {
          setIsOffline(false);
          connectionAttempts.current = 0;
          addAssistantMessage("Conexão restaurada! Como posso ajudar você agora?");
        }
      }
    }, 30000);
    
    return () => clearInterval(intervalId);
  }, [isOffline, addAssistantMessage]);
  
  return {
    isOffline,
    setIsOffline,
    isRetrying,
    setIsRetrying,
    connectionAttempts,
    handleRetryConnection
  };
};

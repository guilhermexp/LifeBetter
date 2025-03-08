
/**
 * Utility functions for handling network connectivity
 */

/**
 * Check if the device is connected to the internet
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

export const FALLBACK_RESPONSES = [
  "Desculpe, estou com problemas de conexão no momento. Você pode adicionar eventos manualmente clicando no ícone de calendário.",
  "Parece que estou offline. Posso ajudar com tarefas básicas como adicionar eventos ao calendário.",
  "Não consegui conectar ao serviço de IA. Tente novamente mais tarde ou use o botão de calendário para adicionar eventos.",
  "Estou temporariamente indisponível para processar solicitações complexas. Tente usar comandos mais simples ou adicione eventos manualmente.",
  "A conexão com o servidor está instável. Que tal adicionar sua tarefa diretamente no calendário?"
];

export const getFallbackResponse = (): string => {
  const index = Math.floor(Math.random() * FALLBACK_RESPONSES.length);
  return FALLBACK_RESPONSES[index];
};

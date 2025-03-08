import React, { createContext, useContext, useState, ReactNode } from 'react';

// Interface para o contexto de atualização
interface RefreshContextType {
  // Para atualização geral
  shouldRefresh: boolean;
  toggleRefresh: () => void;
  
  // Para atualização específica de tarefas
  refreshTasks: boolean;
  toggleRefreshTasks: () => void;
  
  // Função simplificada para atualizar tarefas
  refreshTasksFunction: () => void;
  
  // Para o assistente
  refreshAssistant: () => void;
  
  // Compatibilidade com código existente
  refresh: () => void;
}

// Criação do contexto com valores padrão
export const RefreshContext = createContext<RefreshContextType>({
  shouldRefresh: false,
  toggleRefresh: () => {},
  refreshTasks: false,
  toggleRefreshTasks: () => {},
  refreshTasksFunction: () => {},
  refreshAssistant: () => {},
  refresh: () => {},
});

// Hook personalizado para usar o contexto
export const useRefresh = () => useContext(RefreshContext);

// Props para o provedor
interface RefreshProviderProps {
  children: ReactNode;
}

// Componente provedor
export const RefreshProvider: React.FC<RefreshProviderProps> = ({ children }) => {
  // Estados para controlar as atualizações
  const [shouldRefresh, setShouldRefresh] = useState(false);
  const [refreshTasks, setRefreshTasks] = useState(false);
  const [assistantRefreshKey, setAssistantRefreshKey] = useState(0);

  // Funções para alternar os estados
  const toggleRefresh = () => {
    setShouldRefresh((prev) => !prev);
  };

  const toggleRefreshTasks = () => {
    setRefreshTasks((prev) => !prev);
  };

  // Função simplificada para atualizar tarefas
  const refreshTasksFunction = () => {
    setRefreshTasks((prev) => !prev);
  };

  // Função para atualizar o assistente
  const refreshAssistant = () => {
    setAssistantRefreshKey((prev) => prev + 1);
  };

  // Valor do contexto
  const contextValue: RefreshContextType = {
    shouldRefresh,
    toggleRefresh,
    refreshTasks,
    toggleRefreshTasks,
    refreshTasksFunction,
    refreshAssistant,
    refresh: refreshAssistant, // Compatibilidade com código existente
  };

  return (
    <RefreshContext.Provider value={contextValue}>
      {children}
    </RefreshContext.Provider>
  );
};

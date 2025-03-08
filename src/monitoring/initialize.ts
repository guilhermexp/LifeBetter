
import { monitoringAgent } from './monitoringAgent';

/**
 * Inicializa o sistema de monitoramento
 */
export const initializeMonitoring = (): void => {
  try {
    // Iniciar o agente de monitoramento
    monitoringAgent.initialize();
    console.log('Sistema de monitoramento inicializado com sucesso');
  } catch (error) {
    console.error('Erro ao inicializar sistema de monitoramento:', error);
  }
};

/**
 * Definições de tipos para a API de Background Sync do Service Worker
 * 
 * Como essas APIs ainda são experimentais, precisamos declarar os tipos
 * manualmente para que o TypeScript reconheça corretamente.
 */

interface ServiceWorkerRegistration {
  /**
   * A propriedade sync dá acesso ao registro e gerenciamento dos eventos de sincronização.
   */
  sync: SyncManager;
  
  /**
   * A propriedade periodicSync dá acesso ao registro e gerenciamento de eventos de sincronização periódica.
   */
  periodicSync?: PeriodicSyncManager;
}

/**
 * Interface que define os métodos disponíveis no SyncManager
 */
interface SyncManager {
  /**
   * Registra uma operação de sincronização em segundo plano.
   * @param tag Uma string que identifica a sincronização a ser realizada.
   * @returns Uma Promise que é resolvida se o registro for bem-sucedido, ou rejeitada se falhar.
   */
  register(tag: string): Promise<void>;
  
  /**
   * Retorna uma Promise que resolve para um array de registros de sincronização.
   * @returns Uma Promise que resolve para um array de strings representando todos os tags de sincronização registrados.
   */
  getTags(): Promise<string[]>;
}

/**
 * Interface que define os métodos disponíveis no PeriodicSyncManager
 */
interface PeriodicSyncManager {
  /**
   * Registra uma operação de sincronização periódica em segundo plano.
   * @param tag Uma string que identifica a sincronização a ser realizada.
   * @param options Opções para a sincronização periódica, incluindo o intervalo mínimo.
   * @returns Uma Promise que é resolvida se o registro for bem-sucedido, ou rejeitada se falhar.
   */
  register(tag: string, options?: { minInterval: number }): Promise<void>;
  
  /**
   * Remove um registro de sincronização periódica.
   * @param tag A tag da sincronização periódica a ser removida.
   * @returns Uma Promise que é resolvida se a operação for bem-sucedida, ou rejeitada se falhar.
   */
  unregister(tag: string): Promise<void>;
  
  /**
   * Retorna uma Promise que resolve para um array de registros de sincronização periódica.
   * @returns Uma Promise que resolve para um array de strings representando todos os tags de sincronização periódica registrados.
   */
  getTags(): Promise<string[]>;
}

// Interface para a propriedade window.SyncManager
interface Window {
  SyncManager?: SyncManager;
}

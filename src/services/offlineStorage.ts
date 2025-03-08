/**
 * Serviço de armazenamento offline utilizando IndexedDB
 * 
 * Este serviço permite:
 * - Armazenar dados localmente quando o usuário está offline
 * - Sincronizar com o servidor quando a conexão retorna
 * - Manter o app funcional mesmo sem internet
 */

import { openDB, IDBPDatabase } from 'idb';

// Nomes e versões do banco de dados
const DB_NAME = 'suavidamelhor-offline';
const DB_VERSION = 1;

// Nomes das stores
const STORE_TASKS = 'tasks';
const STORE_PENDING_REQUESTS = 'pendingRequests';
const STORE_USER_DATA = 'userData';

// Interface para requisições pendentes
interface PendingRequest {
  id: string;
  url: string;
  method: string;
  body?: any;
  timestamp: number;
  attempts: number;
}

// Interface para metadados do usuário
interface UserData {
  id: string;
  lastSyncTimestamp: number;
  preferences: Record<string, any>;
}

// Classe principal de gerenciamento de armazenamento offline
export class OfflineStorage {
  private db: Promise<IDBPDatabase>;
  private isOnline: boolean = navigator.onLine;
  
  constructor() {
    // Inicializar banco de dados
    this.db = this.initDatabase();
    
    // Monitorar estado de conexão
    window.addEventListener('online', this.handleOnlineStatusChange);
    window.addEventListener('offline', this.handleOnlineStatusChange);
    
    // Registrar para sincronização periódica
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      this.registerSyncEvents();
    }
  }
  
  /**
   * Inicializa o banco de dados IndexedDB
   */
  private async initDatabase() {
    return openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Criar stores se não existirem
        if (!db.objectStoreNames.contains(STORE_TASKS)) {
          const taskStore = db.createObjectStore(STORE_TASKS, { keyPath: 'id' });
          // Índices para buscar tarefas
          taskStore.createIndex('user_id', 'user_id', { unique: false });
          taskStore.createIndex('scheduled_date', 'scheduled_date', { unique: false });
          taskStore.createIndex('completed', 'completed', { unique: false });
          taskStore.createIndex('syncStatus', 'syncStatus', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORE_PENDING_REQUESTS)) {
          const requestStore = db.createObjectStore(STORE_PENDING_REQUESTS, { keyPath: 'id' });
          requestStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains(STORE_USER_DATA)) {
          db.createObjectStore(STORE_USER_DATA, { keyPath: 'id' });
        }
      }
    });
  }
  
  /**
   * Manipula mudanças no estado da conexão
   */
  private handleOnlineStatusChange = () => {
    const wasOffline = !this.isOnline;
    this.isOnline = navigator.onLine;
    
    console.log(`[Offline Storage] Conexão mudou para: ${this.isOnline ? 'online' : 'offline'}`);
    
    // Se voltou a ficar online, tenta sincronizar
    if (this.isOnline && wasOffline) {
      this.triggerSync();
    }
  }
  
  /**
   * Registra eventos de sincronização com o Service Worker
   */
  private async registerSyncEvents() {
    try {
      const registration = await navigator.serviceWorker.ready;
      
      // Registrar sincronização periódica
      if ('periodicSync' in registration) {
        const periodicSync = registration.periodicSync as any;
        await periodicSync.register('sync-tasks', {
          minInterval: 60 * 60 * 1000, // 1 hora em milissegundos
        });
      }
      
      // Registrar sincronização quando volta a ter conexão
      await registration.sync.register('sync-tasks');
      
      console.log('[Offline Storage] Eventos de sincronização registrados');
    } catch (error) {
      console.error('[Offline Storage] Erro ao registrar eventos de sincronização:', error);
    }
  }
  
  /**
   * Aciona sincronização manual
   */
  public async triggerSync() {
    if (!this.isOnline) {
      console.log('[Offline Storage] Não é possível sincronizar. Dispositivo offline.');
      return;
    }
    
    // Verificar se o service worker está disponível
    if ('serviceWorker' in navigator && 'SyncManager' in window) {
      const registration = await navigator.serviceWorker.ready;
      try {
        await registration.sync.register('sync-tasks');
        console.log('[Offline Storage] Sincronização acionada');
      } catch (error) {
        console.error('[Offline Storage] Erro ao acionar sincronização:', error);
        
        // Se falhar, tenta sincronizar diretamente
        this.processAllPendingRequests();
      }
    } else {
      // Fallback se o service worker não estiver disponível
      console.log('[Offline Storage] Service Worker não suportado. Sincronizando diretamente...');
      this.processAllPendingRequests();
    }
  }
  
  /**
   * Processa todas as requisições pendentes
   */
  private async processAllPendingRequests() {
    const db = await this.db;
    const pendingRequests = await db.getAll(STORE_PENDING_REQUESTS);
    
    console.log(`[Offline Storage] Processando ${pendingRequests.length} requisições pendentes`);
    
    // Processa em ordem de timestamp (mais antigas primeiro)
    const sortedRequests = pendingRequests.sort((a, b) => a.timestamp - b.timestamp);
    
    for (const request of sortedRequests) {
      try {
        await this.processPendingRequest(request);
      } catch (error) {
        console.error(`[Offline Storage] Erro ao processar requisição ${request.id}:`, error);
      }
    }
  }
  
  /**
   * Processa uma requisição pendente individual
   */
  private async processPendingRequest(request: PendingRequest) {
    try {
      // Tentar enviar para o servidor
      const response = await fetch(request.url, {
        method: request.method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: request.body ? JSON.stringify(request.body) : undefined,
      });
      
      if (response.ok) {
        // Se sucesso, remove da fila
        const db = await this.db;
        await db.delete(STORE_PENDING_REQUESTS, request.id);
        console.log(`[Offline Storage] Requisição ${request.id} processada com sucesso`);
        return true;
      } else {
        // Se erro do servidor, incrementa tentativas
        const db = await this.db;
        request.attempts += 1;
        
        // Limitar número de tentativas para evitar loop infinito
        if (request.attempts > 5) {
          await db.delete(STORE_PENDING_REQUESTS, request.id);
          console.warn(`[Offline Storage] Requisição ${request.id} descartada após 5 tentativas`);
        } else {
          await db.put(STORE_PENDING_REQUESTS, request);
        }
        return false;
      }
    } catch (error) {
      console.error(`[Offline Storage] Erro ao processar requisição ${request.id}:`, error);
      return false;
    }
  }
  
  /**
   * Adiciona uma tarefa ao armazenamento local
   */
  public async saveTask(task: any) {
    // Adiciona flag de sincronização
    const taskWithStatus = {
      ...task,
      syncStatus: this.isOnline ? 'synced' : 'pending',
      localUpdatedAt: new Date().toISOString()
    };
    
    // Salva localmente
    const db = await this.db;
    await db.put(STORE_TASKS, taskWithStatus);
    
    // Se estiver offline, enfileira para sincronização futura
    if (!this.isOnline) {
      await this.queueRequest(
        `tasks-${task.id}-save`,
        `/rest/v1/tasks`,
        'POST',
        task
      );
    }
    
    return taskWithStatus;
  }
  
  /**
   * Obtém tarefas do armazenamento local
   */
  public async getTasks(userId: string) {
    const db = await this.db;
    return db.getAllFromIndex(STORE_TASKS, 'user_id', userId);
  }
  
  /**
   * Enfileira uma requisição para processamento futuro
   */
  public async queueRequest(id: string, url: string, method: string, body?: any) {
    const request: PendingRequest = {
      id,
      url,
      method,
      body,
      timestamp: Date.now(),
      attempts: 0
    };
    
    const db = await this.db;
    await db.put(STORE_PENDING_REQUESTS, request);
    
    console.log(`[Offline Storage] Requisição ${id} enfileirada para sincronização futura`);
    return request;
  }
  
  /**
   * Atualiza preferências do usuário
   */
  public async updateUserPreferences(userId: string, preferences: Record<string, any>) {
    const db = await this.db;
    const userData = await db.get(STORE_USER_DATA, userId) || {
      id: userId,
      lastSyncTimestamp: Date.now(),
      preferences: {}
    };
    
    userData.preferences = {
      ...userData.preferences,
      ...preferences
    };
    
    await db.put(STORE_USER_DATA, userData);
    return userData;
  }
  
  /**
   * Obtém preferências do usuário
   */
  public async getUserPreferences(userId: string) {
    const db = await this.db;
    const userData = await db.get(STORE_USER_DATA, userId);
    return userData?.preferences || {};
  }
}

// Exporta uma instância do gerenciador de armazenamento offline
export const offlineStorage = new OfflineStorage();

// Exporta por padrão
export default offlineStorage;

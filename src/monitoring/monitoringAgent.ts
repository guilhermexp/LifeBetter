
import { errorTracker } from "./errorTracker";
import { codeOptimizer } from "./codeOptimizer";
import { selfFixer } from "./selfFixer";
import { codeChangeMonitor } from "./codeChangeMonitor";
import { supabase } from "@/integrations/supabase/client";

/**
 * Classe principal do Agente de Monitoramento que coordena outros módulos
 */
class MonitoringAgent {
  private isEnabled: boolean = true;
  private syncInterval: number | null = null;
  private lastSyncTime: Date | null = null;
  private reportEmailFrequency: 'daily' | 'weekly' | 'monthly' = 'weekly';

  constructor() {
    // Construtor vazio, inicialização feita pelo método initialize()
  }

  /**
   * Inicializa o agente com todos os seus componentes
   */
  public async initialize(): Promise<void> {
    // Verificar se o usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    
    if (user) {
      // Iniciar sincronização periódica
      this.startDataSync();
      
      // Iniciar agendamento de relatórios
      this.scheduleReports();
      
      // Registrar evento de inicialização bem-sucedida
      this.logEvent('agent_initialized', {
        timestamp: new Date().toISOString(),
        userId: user.id
      });
    }
  }

  /**
   * Inicia a sincronização periódica com o backend
   */
  private startDataSync(): void {
    if (this.syncInterval !== null) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
    
    this.syncInterval = window.setInterval(() => {
      if (this.isEnabled) {
        this.syncDataWithBackend();
      }
    }, 300000); // Sincronização a cada 5 minutos
  }

  /**
   * Helper function to convert Date objects to ISO strings in data objects
   * Implementação otimizada para ser mais eficiente e evitar recursão excessiva
   */
  private convertDatesToISOStrings(obj: any): any {
    // Casos base: null, undefined, ou tipos primitivos (exceto objeto)
    if (obj === null || obj === undefined || typeof obj !== 'object') {
      return obj;
    }
    
    // Converte Date para string
    if (obj instanceof Date) {
      return obj.toISOString();
    }
    
    // Cria uma cópia do objeto para evitar modificar o original
    const processedObj = Array.isArray(obj) ? [...obj] : {...obj};
    
    // Itera sobre as propriedades para processar datas
    const keys = Object.keys(processedObj);
    
    for (let i = 0; i < keys.length; i++) {
      const key = keys[i];
      const value = processedObj[key];
      
      if (value instanceof Date) {
        processedObj[key] = value.toISOString();
      } else if (typeof value === 'object' && value !== null) {
        processedObj[key] = this.convertDatesToISOStrings(value);
      }
    }
    
    return processedObj;
  }

  /**
   * Sincroniza dados coletados com o backend
   */
  private async syncDataWithBackend(): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      // Obter dados para sincronização
      const errors = errorTracker.getErrors();
      const slowFunctions = codeOptimizer.getSlowFunctions();
      const fixHistory = selfFixer.getFixHistory();
      const codeChanges = codeChangeMonitor.getChanges();
      
      // Verificar se há dados significativos para enviar
      if (!errors.length && !slowFunctions.length && !fixHistory.length && !codeChanges.length) {
        console.debug('Nenhum dado significativo para sincronizar');
        return;
      }
      
      // Preparar dados para sincronização
      const rawData = {
        errors,
        slowFunctions,
        fixHistory,
        codeChanges,
        stats: {
          memoryLeakDetected: codeOptimizer.detectMemoryLeaks(),
          timestamp: new Date().toISOString()
        }
      };
      
      // Converter todas as datas para ISO strings
      const syncData = this.convertDatesToISOStrings(rawData);
      
      // Enviar dados para a tabela monitoring_data
      await supabase
        .from('monitoring_data')
        .insert({
          user_id: user.id,
          data: syncData,
          created_at: new Date().toISOString()
        });
      
      this.lastSyncTime = new Date();
      
      // Limpar dados enviados para economizar memória
      errorTracker.clearErrors();
    } catch (error) {
      // Falha silenciosa - tentará novamente no próximo ciclo
      console.debug('Falha na sincronização do agente de monitoramento');
    }
  }

  /**
   * Agenda o envio de relatórios periódicos
   */
  private scheduleReports(): void {
    codeChangeMonitor.scheduleReports(this.reportEmailFrequency);
  }

  /**
   * Configura a frequência de envio de relatórios
   */
  public setReportFrequency(frequency: 'daily' | 'weekly' | 'monthly'): void {
    this.reportEmailFrequency = frequency;
    this.scheduleReports();
  }

  /**
   * Registra um evento de monitoramento
   */
  private async logEvent(eventType: string, data: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Converter todas as datas para ISO strings
        const processedData = this.convertDatesToISOStrings(data);
        
        // Usar a tabela monitoring_events
        await supabase
          .from('monitoring_events')
          .insert({
            user_id: user.id,
            event_type: eventType,
            event_data: processedData,
            created_at: new Date().toISOString()
          });
      }
    } catch (error) {
      // Falha silenciosa
    }
  }

  /**
   * Faz backup de um arquivo antes de alterações
   */
  public backupFile(fileName: string, content: string): void {
    if (!this.isEnabled) return;
    
    try {
      codeChangeMonitor.recordChange({
        type: 'backup',
        description: `Backup automático de ${fileName}`,
        code_before: content,
        impact: 'low',
        affected_components: [fileName]
      });
    } catch (error) {
      // Falha silenciosa
      console.debug('Falha ao fazer backup de arquivo:', error);
    }
  }

  /**
   * Verifica se uma alteração é segura de ser aplicada
   */
  public validateCodeChange(
    fileName: string,
    contentBefore: string,
    contentAfter: string
  ): {
    safe: boolean;
    removedFunctions: string[];
    message?: string;
  } {
    if (!this.isEnabled) return { safe: true, removedFunctions: [] };
    
    const result = codeChangeMonitor.isSafeChange(contentBefore, contentAfter);
    
    if (!result.safe) {
      const message = `⚠️ Alteração potencialmente perigosa: ${result.removedFunctions.length} funções foram removidas em ${fileName}. Funções removidas: ${result.removedFunctions.join(', ')}`;
      
      codeChangeMonitor.recordChange({
        type: 'unsafe_change',
        description: message,
        code_before: contentBefore,
        code_after: contentAfter,
        impact: 'high',
        affected_components: [fileName]
      });
      
      return {
        ...result,
        message
      };
    }
    
    // Registrar alteração segura
    codeChangeMonitor.recordChange({
      type: 'change',
      description: `Alteração segura em ${fileName}`,
      code_before: contentBefore,
      code_after: contentAfter,
      impact: 'low',
      affected_components: [fileName]
    });
    
    return result;
  }

  /**
   * Inicia o monitoramento completo da aplicação
   */
  public start(): void {
    if (!this.isEnabled) {
      this.isEnabled = true;
      errorTracker.setEnabled(true);
      codeOptimizer.setEnabled(true);
      selfFixer.setEnabled(true);
      codeChangeMonitor.setEnabled(true);
      
      this.startDataSync();
      this.scheduleReports();
      
      this.logEvent('agent_started', {
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Para temporariamente o monitoramento
   */
  public stop(): void {
    if (this.isEnabled) {
      this.isEnabled = false;
      errorTracker.setEnabled(false);
      codeOptimizer.setEnabled(false);
      selfFixer.setEnabled(false);
      codeChangeMonitor.setEnabled(false);
      
      if (this.syncInterval) {
        clearInterval(this.syncInterval);
        this.syncInterval = null;
      }
      
      this.logEvent('agent_stopped', {
        timestamp: new Date().toISOString()
      });
    }
  }

  /**
   * Verifica o status atual do agente
   */
  public getStatus(): {
    enabled: boolean,
    lastSync: Date | null,
    components: {
      errorTracker: boolean,
      codeOptimizer: boolean,
      selfFixer: boolean,
      codeChangeMonitor: boolean
    },
    reportFrequency: 'daily' | 'weekly' | 'monthly'
  } {
    return {
      enabled: this.isEnabled,
      lastSync: this.lastSyncTime,
      reportFrequency: this.reportEmailFrequency,
      components: {
        errorTracker: true,
        codeOptimizer: true,
        selfFixer: true,
        codeChangeMonitor: true
      }
    };
  }
}

// Singleton para garantir uma única instância
export const monitoringAgent = new MonitoringAgent();

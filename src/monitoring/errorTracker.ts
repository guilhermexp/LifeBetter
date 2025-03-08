
import { supabase } from "@/integrations/supabase/client";

/**
 * Classe responsável por rastrear e registrar erros sem exibir logs na UI
 */
class ErrorTracker {
  private errors: Array<{type: string, message: string, timestamp: string, stack?: string}> = [];
  private isEnabled: boolean = true;

  constructor() {
    this.setupErrorListeners();
  }

  /**
   * Configura os listeners de erro globais
   */
  private setupErrorListeners(): void {
    // Captura erros não tratados no window
    window.addEventListener('error', (event) => {
      if (!this.isEnabled) return;
      
      this.trackError({
        type: 'runtime',
        message: event.message,
        stack: event.error?.stack,
      });
      
      // Não exibir o erro padrão do navegador
      event.preventDefault();
    });

    // Captura promessas rejeitadas não tratadas
    window.addEventListener('unhandledrejection', (event) => {
      if (!this.isEnabled) return;
      
      this.trackError({
        type: 'promise',
        message: String(event.reason),
        stack: event.reason?.stack,
      });
      
      // Não exibir o erro padrão do navegador
      event.preventDefault();
    });

    // Sobrescreve o console.error para capturar mensagens de erro
    const originalConsoleError = console.error;
    console.error = (...args) => {
      if (this.isEnabled) {
        this.trackError({
          type: 'console',
          message: args.map(arg => 
            typeof arg === 'object' ? JSON.stringify(arg) : String(arg)
          ).join(' '),
        });
      }
      
      // Ainda registra no console para desenvolvimento
      if (process.env.NODE_ENV === 'development') {
        originalConsoleError.apply(console, args);
      }
    };
  }

  /**
   * Rastreia um erro e o envia para armazenamento se necessário
   */
  public trackError({ type, message, stack }: { type: string, message: string, stack?: string }): void {
    const errorData = {
      type,
      message,
      stack,
      timestamp: new Date().toISOString(), // Use ISO string instead of Date object
    };
    
    this.errors.push(errorData);
    
    // Limite o número de erros armazenados para não sobrecarregar a memória
    if (this.errors.length > 100) {
      this.errors.shift();
    }
    
    // Enviar para o backend para análise silenciosa (sem feedback na UI)
    this.sendErrorToBackend(errorData);
  }

  /**
   * Envia o erro para o backend sem visibilidade na interface do usuário
   */
  private async sendErrorToBackend(errorData: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Envia o erro para a tabela system_logs
        await supabase
          .from('system_logs')
          .insert({
            user_id: user.id,
            log_type: 'error',
            content: errorData,
            created_at: new Date().toISOString(),
          });
      }
    } catch (err) {
      // Tenta novamente mais tarde, sem feedback
      setTimeout(() => {
        this.sendErrorToBackend(errorData);
      }, 60000); // Tenta novamente em 1 minuto
    }
  }

  /**
   * Ativa ou desativa o monitoramento de erros
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Obtém todos os erros registrados (usado apenas para depuração)
   */
  public getErrors(): Array<{type: string, message: string, timestamp: string, stack?: string}> {
    return [...this.errors];
  }

  /**
   * Limpa o histórico de erros
   */
  public clearErrors(): void {
    this.errors = [];
  }
}

// Singleton para garantir uma única instância em toda a aplicação
export const errorTracker = new ErrorTracker();

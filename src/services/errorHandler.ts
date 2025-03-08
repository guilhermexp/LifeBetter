/**
 * Sistema centralizado para tratamento de erros no aplicativo
 * 
 * Funcionalidades:
 * - Captura erros de diferentes fontes (API, UI, JS)
 * - Normaliza erros para um formato padrão
 * - Fornece mecanismos para relatar e registrar erros
 * - Permite exibir erros de forma amigável para o usuário
 */

import { toast } from '@/components/ui/use-toast';

// Tipos de erros que podem ocorrer
export enum ErrorType {
  // Erros de API e rede
  API_ERROR = 'api_error',
  NETWORK_ERROR = 'network_error',
  AUTHENTICATION_ERROR = 'auth_error',
  
  // Erros de dados e validação
  VALIDATION_ERROR = 'validation_error',
  DATA_ERROR = 'data_error',
  
  // Erros do aplicativo
  APP_ERROR = 'app_error',
  RENDER_ERROR = 'render_error',
  
  // Outros
  UNEXPECTED_ERROR = 'unexpected_error'
}

// Interface para objetos de erro normalizados
export interface NormalizedError {
  type: ErrorType;
  message: string;
  code?: string | number;
  context?: Record<string, any>;
  originalError?: any;
  timestamp: number;
  handled: boolean;
}

// Opções de tratamento de erros
export interface ErrorHandlingOptions {
  showToast?: boolean;
  logToConsole?: boolean;
  reportToService?: boolean;
  silent?: boolean;
  context?: Record<string, any>;
}

// Configurações padrão
const defaultOptions: ErrorHandlingOptions = {
  showToast: true,
  logToConsole: true,
  reportToService: process.env.NODE_ENV === 'production',
  silent: false,
  context: {}
};

/**
 * Classe principal de tratamento de erros
 */
class ErrorHandler {
  // Armazenar erros recentes para referência
  private recentErrors: NormalizedError[] = [];
  
  // Limite de erros para manter no histórico
  private maxErrorHistory = 10;
  
  // Flag para depuração
  private isDebugMode = process.env.NODE_ENV === 'development';
  
  // Callbacks para diferentes tipos de erro
  private errorListeners: Map<ErrorType, ((error: NormalizedError) => void)[]> = new Map();
  
  /**
   * Normaliza qualquer tipo de erro para um formato padrão
   */
  normalize(error: any, type = ErrorType.UNEXPECTED_ERROR): NormalizedError {
    // Já normalizado
    if ((error as NormalizedError).type && (error as NormalizedError).timestamp) {
      return error as NormalizedError;
    }
    
    // Erro do Supabase
    if (error && error.code && error.message && error.status) {
      return {
        type: this.detectSupabaseErrorType(error),
        message: error.message || 'Erro ao se comunicar com o servidor',
        code: error.code,
        context: {
          status: error.status,
          statusText: error.statusText
        },
        originalError: error,
        timestamp: Date.now(),
        handled: false
      };
    }
    
    // Erro de rede (fetch)
    if (error instanceof TypeError && error.message && error.message.includes('fetch')) {
      return {
        type: ErrorType.NETWORK_ERROR,
        message: 'Erro de conexão. Verifique sua internet.',
        originalError: error,
        timestamp: Date.now(),
        handled: false
      };
    }
    
    // Erro padrão do JavaScript ou objeto personalizado
    return {
      type,
      message: error?.message || 'Ocorreu um erro inesperado',
      code: error?.code,
      context: error?.context,
      originalError: error,
      timestamp: Date.now(),
      handled: false
    };
  }
  
  /**
   * Detecta o tipo específico de erro do Supabase
   */
  private detectSupabaseErrorType(error: any): ErrorType {
    // Códigos de erro do Supabase/PostgreSQL
    const code = error.code?.toString();
    
    if (error.status === 401 || code === '401' || code?.startsWith('PGRST301')) {
      return ErrorType.AUTHENTICATION_ERROR;
    }
    
    if (error.status === 404 || code === '404' || code?.startsWith('PGRST404')) {
      return ErrorType.DATA_ERROR;
    }
    
    if (error.status === 409 || code === '409' || code?.startsWith('23')) {
      return ErrorType.VALIDATION_ERROR;
    }
    
    return ErrorType.API_ERROR;
  }
  
  /**
   * Trata um erro com opções específicas
   */
  handleError(error: any, customOptions: ErrorHandlingOptions = {}): NormalizedError {
    const options = { ...defaultOptions, ...customOptions };
    const normalizedError = this.normalize(error);
    
    // Marcar como tratado
    normalizedError.handled = true;
    
    // Adicionar ao histórico
    this.addToErrorHistory(normalizedError);
    
    // Logging condicional
    if (options.logToConsole) {
      this.logError(normalizedError);
    }
    
    // Toast condicional
    if (options.showToast) {
      this.showErrorToast(normalizedError);
    }
    
    // Relatório condicional
    if (options.reportToService) {
      this.reportError(normalizedError);
    }
    
    // Notificar listeners
    this.notifyListeners(normalizedError);
    
    return normalizedError;
  }
  
  /**
   * Adiciona o erro ao histórico recente
   */
  private addToErrorHistory(error: NormalizedError) {
    this.recentErrors.unshift(error);
    
    // Limitar o tamanho do histórico
    if (this.recentErrors.length > this.maxErrorHistory) {
      this.recentErrors.pop();
    }
  }
  
  /**
   * Registra o erro no console
   */
  private logError(error: NormalizedError) {
    if (this.isDebugMode) {
      console.group(`[Erro] ${error.type}: ${error.message}`);
      console.error(error);
      if (error.originalError) {
        console.error('Erro original:', error.originalError);
      }
      console.groupEnd();
    } else {
      console.error(`[Erro] ${error.type}: ${error.message}`, error.code || '');
    }
  }
  
  /**
   * Mostra uma notificação toast para o erro
   */
  private showErrorToast(error: NormalizedError) {
    // Personalizar mensagem de erro para o usuário
    const userFriendlyMessage = this.getUserFriendlyMessage(error);
    
    toast({
      variant: 'destructive',
      title: this.getErrorTitle(error),
      description: userFriendlyMessage,
    });
  }
  
  /**
   * Obtém um título amigável para o erro
   */
  private getErrorTitle(error: NormalizedError): string {
    switch (error.type) {
      case ErrorType.AUTHENTICATION_ERROR:
        return 'Erro de autenticação';
      case ErrorType.NETWORK_ERROR:
        return 'Erro de conexão';
      case ErrorType.VALIDATION_ERROR:
        return 'Erro de validação';
      case ErrorType.DATA_ERROR:
        return 'Erro de dados';
      case ErrorType.API_ERROR:
        return 'Erro do servidor';
      default:
        return 'Erro';
    }
  }
  
  /**
   * Converte o erro em uma mensagem amigável para o usuário
   */
  private getUserFriendlyMessage(error: NormalizedError): string {
    // Mensagens personalizadas por tipo
    switch (error.type) {
      case ErrorType.AUTHENTICATION_ERROR:
        return 'Sua sessão expirou ou você não tem permissão para esta ação. Tente fazer login novamente.';
        
      case ErrorType.NETWORK_ERROR:
        return 'Não foi possível conectar ao servidor. Verifique sua conexão com a internet.';
        
      case ErrorType.VALIDATION_ERROR:
        return 'Os dados informados são inválidos. Verifique os campos e tente novamente.';
        
      case ErrorType.DATA_ERROR:
        return 'Não foi possível acessar os dados necessários. Tente novamente mais tarde.';
        
      case ErrorType.API_ERROR:
        return 'Ocorreu um erro no servidor. Nossa equipe foi notificada.';
        
      default:
        // Usar a mensagem original se for apropriada para o usuário
        return error.message || 'Ocorreu um erro inesperado. Tente novamente mais tarde.';
    }
  }
  
  /**
   * Reporta o erro para um serviço de monitoramento
   * (placeholder - implementar integração real)
   */
  private reportError(error: NormalizedError) {
    // Aqui você conectaria com um serviço como Sentry, LogRocket, etc.
    if (this.isDebugMode) {
      console.log('[Erro Reportado]', error);
    }
    
    // Exemplo de como seria com Sentry:
    // if (typeof Sentry !== 'undefined') {
    //   Sentry.captureException(error.originalError || error, {
    //     extra: {
    //       type: error.type,
    //       context: error.context
    //     }
    //   });
    // }
  }
  
  /**
   * Adiciona um listener para um tipo específico de erro
   */
  addListener(type: ErrorType, callback: (error: NormalizedError) => void) {
    const listeners = this.errorListeners.get(type) || [];
    listeners.push(callback);
    this.errorListeners.set(type, listeners);
  }
  
  /**
   * Remove um listener
   */
  removeListener(type: ErrorType, callback: (error: NormalizedError) => void) {
    const listeners = this.errorListeners.get(type);
    if (!listeners) return;
    
    const index = listeners.indexOf(callback);
    if (index !== -1) {
      listeners.splice(index, 1);
      this.errorListeners.set(type, listeners);
    }
  }
  
  /**
   * Notifica todos os listeners registrados para o tipo de erro
   */
  private notifyListeners(error: NormalizedError) {
    // Notificar listeners específicos para este tipo
    const typeListeners = this.errorListeners.get(error.type) || [];
    for (const listener of typeListeners) {
      try {
        listener(error);
      } catch (e) {
        console.error('Erro ao executar listener:', e);
      }
    }
    
    // Notificar listeners genéricos
    const allListeners = this.errorListeners.get(ErrorType.UNEXPECTED_ERROR) || [];
    for (const listener of allListeners) {
      try {
        listener(error);
      } catch (e) {
        console.error('Erro ao executar listener:', e);
      }
    }
  }
  
  /**
   * Obtém o histórico recente de erros
   */
  getRecentErrors(): NormalizedError[] {
    return [...this.recentErrors];
  }
  
  /**
   * Limpa o histórico de erros
   */
  clearErrorHistory() {
    this.recentErrors = [];
  }
}

// Instância singleton
export const errorHandler = new ErrorHandler();

// Exportar por padrão
export default errorHandler;

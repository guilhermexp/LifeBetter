import React, { Component, ErrorInfo, ReactNode } from 'react';
import errorHandler, { ErrorType } from '@/services/errorHandler';

/**
 * Propriedades para o componente ErrorBoundary
 */
interface ErrorBoundaryProps {
  /** Componente a ser renderizado em caso de erro */
  fallback?: React.ReactNode;
  
  /** Componentes filhos a serem protegidos */
  children: ReactNode;
  
  /** Nome do componente ou área para identificação de erros */
  componentName?: string;
  
  /** Se true, tenta recuperar automaticamente quando props mudarem */
  resetOnPropsChange?: boolean;
  
  /** Se true, mostra o erro como toast */
  showToast?: boolean;
  
  /** Se true, adiciona detalhes técnicos para desenvolvimento */
  showDetails?: boolean;
}

/**
 * Estado interno do ErrorBoundary
 */
interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

/**
 * Componente que captura erros em árvores de componentes React
 * e exibe uma interface de fallback amigável ao usuário
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null
    };
  }
  
  /**
   * Método estático do React para derivar o estado a partir de um erro
   */
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return {
      hasError: true,
      error,
      errorInfo: null
    };
  }
  
  /**
   * Captura detalhes do erro quando ocorre
   */
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Atualizar estado local com detalhes do erro
    this.setState({
      error,
      errorInfo
    });
    
    // Enviar para o sistema centralizado de tratamento de erros
    errorHandler.handleError(error, {
      showToast: this.props.showToast ?? true,
      context: {
        componentName: this.props.componentName,
        componentStack: errorInfo.componentStack
      },
      reportToService: true
    });
    
    console.error('Erro capturado pelo ErrorBoundary:', error);
    console.error('Informações do componente:', errorInfo.componentStack);
  }
  
  /**
   * Se configurado, reseta o estado de erro quando as props mudam
   */
  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    if (
      this.state.hasError &&
      this.props.resetOnPropsChange &&
      prevProps !== this.props
    ) {
      this.resetError();
    }
  }
  
  /**
   * Reseta o estado de erro, permitindo nova tentativa de renderização
   */
  resetError = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    });
  };
  
  render() {
    const { hasError, error, errorInfo } = this.state;
    const { children, fallback, showDetails } = this.props;
    
    // Se não houver erro, renderiza normalmente
    if (!hasError) {
      return children;
    }
    
    // Se uma UI de fallback for fornecida, use-a
    if (fallback) {
      return fallback;
    }
    
    // Caso contrário, renderize o componente de erro padrão
    return (
      <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-800 max-w-md mx-auto my-4">
        <div className="flex items-center mb-3">
          <div className="w-8 h-8 rounded-full bg-red-100 flex items-center justify-center mr-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-red-600"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h3 className="text-lg font-medium">Algo deu errado</h3>
        </div>
        
        <p className="mb-4">
          Ocorreu um erro ao renderizar este componente. 
          Tente recarregar a página ou voltar mais tarde.
        </p>
        
        <button
          onClick={this.resetError}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Tentar novamente
        </button>
        
        {/* Detalhes técnicos (desenvolvimento apenas) */}
        {showDetails && error && (
          <details className="mt-4 p-2 border border-red-200 rounded bg-white">
            <summary className="cursor-pointer font-medium text-sm mb-2">
              Detalhes técnicos
            </summary>
            <div className="text-xs font-mono overflow-auto max-h-48 p-2 bg-gray-50">
              <p className="mb-2">{error.toString()}</p>
              {errorInfo && (
                <pre className="whitespace-pre-wrap">
                  {errorInfo.componentStack}
                </pre>
              )}
            </div>
          </details>
        )}
      </div>
    );
  }
}

/**
 * Higher-order component (HOC) para envolver componentes com ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<ErrorBoundaryProps, 'children'>
) {
  const displayName = Component.displayName || Component.name || 'Component';
  
  const ComponentWithErrorBoundary = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps} componentName={displayName}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  ComponentWithErrorBoundary.displayName = `withErrorBoundary(${displayName})`;
  
  return ComponentWithErrorBoundary;
}

export default ErrorBoundary;

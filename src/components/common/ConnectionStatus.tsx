import React, { useState, useEffect } from 'react';

/**
 * Componente que exibe o status de conexão com a internet
 * 
 * Funcionalidades:
 * - Detecta automaticamente mudanças no estado de conexão
 * - Exibe um indicador visual quando o usuário está offline
 * - Fornece feedback quando a conexão é restaurada
 * - Animações suaves para transições
 */

interface ConnectionStatusProps {
  /** Mostrar apenas quando offline (padrão: true) */
  showOnlyWhenOffline?: boolean;
  
  /** Classe CSS personalizada */
  className?: string;
  
  /** Tempo (ms) para esconder a notificação após voltar online (0 = nunca esconder) */
  hideAfterMs?: number;
}

const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  showOnlyWhenOffline = true,
  className = '',
  hideAfterMs = 3000
}) => {
  // Estado para rastrear conexão
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  
  // Estado para controlar visibilidade após restauração da conexão
  const [showRestored, setShowRestored] = useState(false);
  
  // Estado para rastrear a última mudança de estado
  const [lastChangeTime, setLastChangeTime] = useState(0);
  
  // Monitorar mudanças de conexão
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowRestored(true);
      setLastChangeTime(Date.now());
      
      // Esconder notificação após um tempo
      if (hideAfterMs > 0) {
        setTimeout(() => {
          setShowRestored(false);
        }, hideAfterMs);
      }
    };
    
    const handleOffline = () => {
      setIsOnline(false);
      setShowRestored(false);
      setLastChangeTime(Date.now());
    };
    
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [hideAfterMs]);
  
  // Não renderizar nada se estiver online e configurado para mostrar apenas quando offline
  if (isOnline && showOnlyWhenOffline && !showRestored) {
    return null;
  }
  
  // Classes para estilos
  const containerClass = `
    fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50
    transition-all duration-300 ease-in-out
    ${isOnline ? 'opacity-80 hover:opacity-100' : 'opacity-100'}
    ${className}
  `;
  
  const statusClass = `
    px-4 py-2 rounded-full shadow-lg
    flex items-center space-x-2
    ${isOnline
      ? 'bg-green-100 text-green-800 border border-green-200'
      : 'bg-red-100 text-red-800 border border-red-200'
    }
  `;
  
  // Indicador pulsante
  const indicatorClass = `
    w-3 h-3 rounded-full
    ${isOnline
      ? 'bg-green-500 animate-pulse'
      : 'bg-red-500 animate-pulse'
    }
  `;
  
  return (
    <div className={containerClass}>
      <div className={statusClass}>
        <div className={indicatorClass} />
        <span className="text-sm font-medium">
          {isOnline
            ? 'Conexão restaurada'
            : 'Você está offline'
          }
        </span>
      </div>
    </div>
  );
};

export default React.memo(ConnectionStatus);

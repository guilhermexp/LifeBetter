
import { useEffect, useRef } from 'react';
import { codeOptimizer } from './codeOptimizer';
import { errorTracker } from './errorTracker';

/**
 * Hook para monitorar o desempenho e comportamento de componentes React
 * 
 * @param componentName Nome do componente a ser monitorado
 */
export function useMonitoring(componentName: string) {
  const renderCount = useRef(0);
  const mountTime = useRef(performance.now());
  const lastRenderTime = useRef(performance.now());
  
  // Monitorar montagem, atualizações e desmontagem
  useEffect(() => {
    const mountDuration = performance.now() - mountTime.current;
    
    // Registrar montagem do componente
    if (mountDuration > 50) {
      // Montagem lenta - registrar como potencial problema
      errorTracker.trackError({
        type: 'slow-mount',
        message: `Componente ${componentName} demorou ${mountDuration.toFixed(2)}ms para montar`
      });
    }
    
    // Verificar vazamentos de memória na desmontagem
    return () => {
      const lifespanDuration = performance.now() - mountTime.current;
      
      // Se o componente tiver renderizado muitas vezes durante sua vida útil
      if (renderCount.current > 50) {
        errorTracker.trackError({
          type: 'excessive-renders',
          message: `Componente ${componentName} renderizou ${renderCount.current} vezes em ${lifespanDuration.toFixed(2)}ms`
        });
      }
    };
  }, [componentName]);
  
  // Monitorar cada renderização
  useEffect(() => {
    renderCount.current++;
    
    const now = performance.now();
    const timeSinceLastRender = now - lastRenderTime.current;
    
    // Se as renderizações estiverem acontecendo muito frequentemente
    if (timeSinceLastRender < 16 && renderCount.current > 1) { // menos de 60fps
      errorTracker.trackError({
        type: 'render-thrashing',
        message: `Componente ${componentName} está renderizando muito frequentemente (${timeSinceLastRender.toFixed(2)}ms entre renders)`
      });
    }
    
    lastRenderTime.current = now;
  });
  
  // Retornar funções úteis para o componente
  return {
    /**
     * Monitorar uma função específica dentro do componente
     */
    trackFunction: <T extends (...args: any[]) => any>(
      functionName: string, 
      fn: T
    ): T => {
      return codeOptimizer.monitorFunction(
        `${componentName}.${functionName}`,
        fn
      ) as T;
    },
    
    /**
     * Registrar um erro específico do componente
     */
    trackError: (message: string, stack?: string) => {
      errorTracker.trackError({
        type: 'component',
        message: `${componentName}: ${message}`,
        stack
      });
    }
  };
}

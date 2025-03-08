
import { errorTracker } from "./errorTracker";

/**
 * Classe responsável por otimizar e melhorar o código em tempo de execução
 */
class CodeOptimizer {
  private slowFunctions: Map<string, { 
    count: number, 
    totalTime: number, 
    avgTime: number
  }> = new Map();

  private memoryUsage: Array<{
    timestamp: string, // Changed from Date to string
    usage: number
  }> = [];

  private isEnabled: boolean = true;

  constructor() {
    this.startMonitoring();
  }

  /**
   * Inicia o monitoramento de desempenho da aplicação
   */
  private startMonitoring(): void {
    // Monitor de uso de memória
    setInterval(() => {
      if (!this.isEnabled) return;
      
      // Verificar o uso de memória atual
      if (performance && (performance as any).memory) {
        this.memoryUsage.push({
          timestamp: new Date().toISOString(), // Store as ISO string
          usage: (performance as any).memory.usedJSHeapSize
        });
        
        // Manter apenas as últimas 100 medições
        if (this.memoryUsage.length > 100) {
          this.memoryUsage.shift();
        }
      }
    }, 60000); // A cada minuto
  }

  /**
   * Decorator para monitorar o desempenho das funções
   */
  public monitorFunction(functionName: string, originalFunction: Function): Function {
    return (...args: any[]) => {
      if (!this.isEnabled) {
        return originalFunction(...args);
      }
      
      const start = performance.now();
      
      try {
        return originalFunction(...args);
      } finally {
        const end = performance.now();
        const executionTime = end - start;
        
        // Armazenar estatísticas de desempenho
        const stats = this.slowFunctions.get(functionName) || { count: 0, totalTime: 0, avgTime: 0 };
        stats.count++;
        stats.totalTime += executionTime;
        stats.avgTime = stats.totalTime / stats.count;
        
        this.slowFunctions.set(functionName, stats);
        
        // Se a função estiver demorando mais que 1000ms, registre como problema
        if (executionTime > 1000) {
          errorTracker.trackError({
            type: 'performance',
            message: `Função ${functionName} demorou ${executionTime.toFixed(2)}ms para executar`,
          });
        }
      }
    };
  }

  /**
   * Detecta funções lentas que precisam ser otimizadas
   */
  public getSlowFunctions(threshold: number = 500): { functionName: string, avgTime: number }[] {
    const results: { functionName: string, avgTime: number }[] = [];
    
    this.slowFunctions.forEach((stats, functionName) => {
      if (stats.avgTime > threshold) {
        results.push({
          functionName,
          avgTime: stats.avgTime
        });
      }
    });
    
    return results;
  }

  /**
   * Verifica se há um possível vazamento de memória
   */
  public detectMemoryLeaks(): boolean {
    if (this.memoryUsage.length < 10) return false;
    
    // Verifica se o uso de memória está consistentemente aumentando
    let increasingCount = 0;
    
    for (let i = 1; i < this.memoryUsage.length; i++) {
      if (this.memoryUsage[i].usage > this.memoryUsage[i-1].usage) {
        increasingCount++;
      }
    }
    
    // Se mais de 80% das medições mostram aumento, pode ser um vazamento
    return increasingCount > (this.memoryUsage.length * 0.8);
  }

  /**
   * Ativa ou desativa o otimizador de código
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }
}

// Singleton para garantir uma única instância
export const codeOptimizer = new CodeOptimizer();

/**
 * Decorator de função para monitoramento de desempenho
 */
export function monitored(target: any, propertyKey: string, descriptor: PropertyDescriptor) {
  const originalMethod = descriptor.value;
  
  descriptor.value = function(...args: any[]) {
    return codeOptimizer.monitorFunction(
      `${target.constructor.name}.${propertyKey}`,
      originalMethod.bind(this)
    )(...args);
  };
  
  return descriptor;
}

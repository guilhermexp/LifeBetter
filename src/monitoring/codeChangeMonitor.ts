
import { errorTracker } from "./errorTracker";
import { selfFixer } from "./selfFixer";
import { supabase } from "@/integrations/supabase/client";

/**
 * Classe responsável por monitorar alterações no código
 */
class CodeChangeMonitor {
  private changes: Array<{
    type: string,
    description: string,
    timestamp: string,
    code_before?: string,
    code_after?: string,
    impact: 'low' | 'medium' | 'high',
    affected_components: string[]
  }> = [];
  
  private isEnabled: boolean = true;

  /**
   * Registra uma alteração no código
   */
  public recordChange({
    type,
    description,
    code_before,
    code_after,
    impact = 'low',
    affected_components = []
  }: {
    type: string,
    description: string,
    code_before?: string,
    code_after?: string,
    impact?: 'low' | 'medium' | 'high',
    affected_components?: string[]
  }): void {
    if (!this.isEnabled) return;
    
    const changeData = {
      type,
      description,
      timestamp: new Date().toISOString(),
      code_before,
      code_after,
      impact,
      affected_components
    };
    
    this.changes.push(changeData);
    
    // Limitar o tamanho do histórico
    if (this.changes.length > 100) {
      this.changes.shift();
    }
    
    // Persistir a alteração no backend
    this.saveChangeToDatabase(changeData);
    
    // Se a alteração for de alto impacto, enviar alerta
    if (impact === 'high') {
      this.sendAlertEmail(changeData);
    }
  }

  /**
   * Salva a alteração no banco de dados
   */
  private async saveChangeToDatabase(changeData: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (user) {
        // Usar a tabela monitoring_events para registrar as alterações de código
        await supabase
          .from('monitoring_events')
          .insert({
            user_id: user.id,
            event_type: 'code_change',
            event_data: {
              change_type: changeData.type,
              description: changeData.description,
              code_before: changeData.code_before,
              code_after: changeData.code_after,
              impact: changeData.impact,
              affected_components: changeData.affected_components
            },
            created_at: changeData.timestamp
          });
      }
    } catch (err) {
      errorTracker.trackError({
        type: 'database',
        message: `Falha ao salvar alteração de código: ${err}`,
        stack: (err as Error).stack
      });
    }
  }

  /**
   * Compara duas versões de código para detectar funções removidas
   */
  public detectRemovedFunctions(
    codeBefore: string,
    codeAfter: string
  ): string[] {
    if (!codeBefore || !codeAfter) return [];
    
    // Expressão regular simples para detectar declarações de funções
    const functionRegex = /function\s+([a-zA-Z0-9_]+)\s*\(/g;
    const methodRegex = /([a-zA-Z0-9_]+)\s*\(\s*\)\s*{/g;
    
    // Encontrar funções na versão anterior
    const functionsBefore = new Set<string>();
    let match;
    
    while ((match = functionRegex.exec(codeBefore)) !== null) {
      functionsBefore.add(match[1]);
    }
    
    while ((match = methodRegex.exec(codeBefore)) !== null) {
      functionsBefore.add(match[1]);
    }
    
    // Encontrar funções na nova versão
    const functionsAfter = new Set<string>();
    functionRegex.lastIndex = 0; // Reset regex index
    methodRegex.lastIndex = 0;
    
    while ((match = functionRegex.exec(codeAfter)) !== null) {
      functionsAfter.add(match[1]);
    }
    
    while ((match = methodRegex.exec(codeAfter)) !== null) {
      functionsAfter.add(match[1]);
    }
    
    // Encontrar funções que foram removidas
    const removedFunctions: string[] = [];
    
    functionsBefore.forEach(func => {
      if (!functionsAfter.has(func)) {
        removedFunctions.push(func);
      }
    });
    
    return removedFunctions;
  }

  /**
   * Verifica se é seguro aplicar uma alteração 
   */
  public isSafeChange(
    codeBefore: string,
    codeAfter: string
  ): {
    safe: boolean;
    removedFunctions: string[];
  } {
    const removedFunctions = this.detectRemovedFunctions(codeBefore, codeAfter);
    
    return {
      safe: removedFunctions.length === 0,
      removedFunctions
    };
  }

  /**
   * Gera um relatório das alterações recentes
   */
  public generateChangeSummary(
    days: number = 7
  ): {
    totalChanges: number;
    highImpactChanges: number;
    changedComponents: Set<string>;
    recentChanges: Array<{
      type: string;
      description: string;
      timestamp: string;
      impact: string;
    }>;
  } {
    const now = new Date();
    const timeThreshold = new Date(now.getTime() - days * 24 * 60 * 60 * 1000).toISOString();
    
    const recentChanges = this.changes.filter(
      change => change.timestamp >= timeThreshold
    );
    
    const changedComponents = new Set<string>();
    let highImpactChanges = 0;
    
    recentChanges.forEach(change => {
      if (change.impact === 'high') {
        highImpactChanges++;
      }
      
      change.affected_components.forEach(component => {
        changedComponents.add(component);
      });
    });
    
    return {
      totalChanges: recentChanges.length,
      highImpactChanges,
      changedComponents,
      recentChanges: recentChanges.map(change => ({
        type: change.type,
        description: change.description,
        timestamp: change.timestamp,
        impact: change.impact
      }))
    };
  }

  /**
   * Envia um email de alerta para alterações críticas
   */
  private async sendAlertEmail(changeData: any): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const alertData = {
        email: "guilherme-varela@hotmail.com",
        subject: `ALERTA: Alteração de alto impacto detectada - ${changeData.type}`,
        change: changeData,
        user_id: user.id
      };
      
      // Chamar a função Edge para enviar o email
      const { error } = await supabase.functions.invoke('send-code-alert', {
        body: alertData
      });
      
      if (error) {
        throw new Error(`Falha ao chamar função send-code-alert: ${error.message}`);
      }
    } catch (err) {
      errorTracker.trackError({
        type: 'email',
        message: `Falha ao enviar email de alerta: ${err}`,
        stack: (err as Error).stack
      });
    }
  }

  /**
   * Agenda o envio de relatórios periódicos
   */
  public scheduleReports(
    frequency: 'daily' | 'weekly' | 'monthly' = 'weekly'
  ): void {
    // Em uma aplicação real, isso usaria um serviço de agendamento como cron jobs
    // Aqui simulamos com uma verificação periódica
    const checkInterval = {
      daily: 24 * 60 * 60 * 1000, // 24 horas
      weekly: 7 * 24 * 60 * 60 * 1000, // 7 dias
      monthly: 30 * 24 * 60 * 60 * 1000 // 30 dias (aproximado)
    }[frequency];
    
    setInterval(() => {
      this.sendPeriodicReport(frequency);
    }, checkInterval);
    
    console.log(`Relatórios ${frequency} agendados com sucesso`);
  }

  /**
   * Envia um relatório periódico por email
   */
  private async sendPeriodicReport(
    reportType: 'daily' | 'weekly' | 'monthly'
  ): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) return;
      
      const days = {
        daily: 1,
        weekly: 7,
        monthly: 30
      }[reportType];
      
      const reportData = this.generateChangeSummary(days);
      
      if (reportData.totalChanges === 0) {
        console.log(`Nenhuma alteração para incluir no relatório ${reportType}`);
        return;
      }
      
      const emailData = {
        email: "guilherme-varela@hotmail.com",
        subject: `Relatório ${reportType} de alterações no código`,
        reportType,
        reportData,
        user_id: user.id
      };
      
      // Chamar a função Edge para enviar o email
      const { error } = await supabase.functions.invoke('send-code-report', {
        body: emailData
      });
      
      if (error) {
        throw new Error(`Falha ao chamar função send-code-report: ${error.message}`);
      }
      
      console.log(`Relatório ${reportType} enviado com sucesso`);
    } catch (err) {
      errorTracker.trackError({
        type: 'email',
        message: `Falha ao enviar relatório periódico: ${err}`,
        stack: (err as Error).stack
      });
    }
  }

  /**
   * Ativa ou desativa o monitor de alterações
   */
  public setEnabled(enabled: boolean): void {
    this.isEnabled = enabled;
  }

  /**
   * Obtém histórico de alterações
   */
  public getChanges(): Array<{
    type: string,
    description: string,
    timestamp: string,
    impact: 'low' | 'medium' | 'high'
  }> {
    return this.changes.map(change => ({
      type: change.type,
      description: change.description,
      timestamp: change.timestamp,
      impact: change.impact
    }));
  }
}

// Singleton para garantir uma única instância
export const codeChangeMonitor = new CodeChangeMonitor();

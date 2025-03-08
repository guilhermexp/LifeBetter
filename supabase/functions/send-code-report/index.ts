
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    if (!RESEND_API_KEY) {
      console.error('RESEND_API_KEY não configurada');
      throw new Error('API key do Resend não configurada');
    }

    const { email, subject, reportType, reportData, user_id } = await req.json();

    if (!email || !subject || !reportType || !reportData) {
      throw new Error('Dados obrigatórios não fornecidos');
    }
    
    // Formatar a lista de componentes alterados
    let changedComponentsList = '<p>Nenhum componente afetado</p>';
    if (reportData.changedComponents && reportData.changedComponents.size > 0) {
      const components = Array.from(reportData.changedComponents);
      changedComponentsList = `
        <ul>
          ${components.map(comp => `<li>${comp}</li>`).join('')}
        </ul>
      `;
    }
    
    // Formatar a lista de mudanças recentes
    let recentChangesList = '<p>Nenhuma mudança recente</p>';
    if (reportData.recentChanges && reportData.recentChanges.length > 0) {
      recentChangesList = `
        <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
          <thead>
            <tr style="background-color: #f1f1f1;">
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Tipo</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Descrição</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Data/Hora</th>
              <th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Impacto</th>
            </tr>
          </thead>
          <tbody>
            ${reportData.recentChanges.map(change => `
              <tr>
                <td style="padding: 10px; border: 1px solid #ddd;">${change.type}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${change.description}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">${new Date(change.timestamp).toLocaleString()}</td>
                <td style="padding: 10px; border: 1px solid #ddd;">
                  <span style="color: ${
                    change.impact === 'high' ? '#d32f2f' : 
                    change.impact === 'medium' ? '#ff9800' : 
                    '#4caf50'
                  };">
                    ${change.impact}
                  </span>
                </td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      `;
    }

    // Formatando o conteúdo do email com o relatório
    const period = reportType === 'daily' ? 'diário' : 
                  reportType === 'weekly' ? 'semanal' : 'mensal';
    
    const htmlContent = `
      <h1 style="color: #3f51b5;">📊 Relatório ${period} de Alterações no Código</h1>
      
      <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px; margin: 20px 0;">
        <h2>Resumo do Período</h2>
        <p><strong>Total de alterações:</strong> ${reportData.totalChanges}</p>
        <p><strong>Alterações de alto impacto:</strong> ${reportData.highImpactChanges}</p>
        <p><strong>Componentes alterados:</strong> ${reportData.changedComponents ? reportData.changedComponents.size : 0}</p>
      </div>
      
      <h2>Componentes Afetados</h2>
      ${changedComponentsList}
      
      <h2>Detalhes das Alterações</h2>
      ${recentChangesList}
      
      <p style="margin-top: 30px; color: #757575;">Este é um relatório automático enviado pelo sistema de monitoramento de código.</p>
    `;

    // Enviando o email usando Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CodeMonitor <reports@lovable.dev>',
        to: email,
        subject: subject,
        html: htmlContent,
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      console.error('Erro ao enviar email via Resend:', result);
      throw new Error(`Falha ao enviar email: ${result.message || 'Erro desconhecido'}`);
    }

    console.log('Relatório enviado com sucesso:', result);

    return new Response(JSON.stringify({ success: true, message: 'Relatório enviado com sucesso' }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Erro ao processar solicitação:', error);
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

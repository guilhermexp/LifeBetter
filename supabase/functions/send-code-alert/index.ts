
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

    const { email, subject, change, user_id } = await req.json();

    if (!email || !subject || !change) {
      throw new Error('Dados obrigatórios não fornecidos');
    }

    // Formatando o conteúdo do email com detalhes da alteração
    const affectedComponents = Array.isArray(change.affected_components) 
      ? change.affected_components.join(', ') 
      : 'Nenhum componente afetado';

    const htmlContent = `
      <h1 style="color: #d32f2f;">⚠️ Alerta: Alteração de Alto Impacto Detectada</h1>
      <p>Uma alteração de código potencialmente perigosa foi detectada.</p>
      
      <div style="border-left: 4px solid #d32f2f; padding-left: 15px; margin: 20px 0;">
        <p><strong>Tipo:</strong> ${change.type}</p>
        <p><strong>Descrição:</strong> ${change.description}</p>
        <p><strong>Impacto:</strong> ${change.impact}</p>
        <p><strong>Data/Hora:</strong> ${new Date(change.timestamp).toLocaleString()}</p>
        <p><strong>Componentes Afetados:</strong> ${affectedComponents}</p>
      </div>
      
      <h2>Detalhes da Alteração</h2>
      ${change.code_before ? `
        <h3>Código Anterior:</h3>
        <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">${change.code_before}</pre>
      ` : ''}
      
      ${change.code_after ? `
        <h3>Código Atual:</h3>
        <pre style="background-color: #f5f5f5; padding: 10px; border-radius: 5px; overflow-x: auto;">${change.code_after}</pre>
      ` : ''}
      
      <p>Esta é uma notificação automática do sistema de monitoramento. Por favor, verifique estas alterações imediatamente.</p>
    `;

    // Enviando o email usando Resend
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        from: 'CodeMonitor <alerts@lovable.dev>',
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

    console.log('Email de alerta enviado com sucesso:', result);

    return new Response(JSON.stringify({ success: true, message: 'Email de alerta enviado com sucesso' }), {
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

import { createClient } from '@supabase/supabase-js';

// Atenção: Este é um arquivo apenas para testes
// Ele faz uma conexão direta com o Supabase para validar se as credenciais estão funcionando

// Use os valores do arquivo .env
// Importante: substitua estes valores pelas suas credenciais reais do Supabase
const supabaseUrl = 'https://tjauuyydxagnugqvmigm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqYXV1eXlkeGFnbnVncXZtaWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0NzYxNzcsImV4cCI6MjA1NjA1MjE3N30.OUSJXM9icoCNewGE6ZMXTqf6XOt2ySP4OGfRT-bir1A';

console.log('URLs do Supabase para diagnóstico:');
console.log('URL do Supabase:', supabaseUrl);
console.log('Chave Anônima:', supabaseAnonKey ? '[CHAVE PRESENTE]' : '[CHAVE AUSENTE]');

// Cliente sem configurações extras para teste puro
const supabase = createClient(
  supabaseUrl as string,
  supabaseAnonKey as string
);

// Função para testar a conexão
async function testConnection() {
  try {
    console.log('Testando conexão com Supabase...');
    
    // 1. Teste de autenticação
    const { data: authData, error: authError } = await supabase.auth.getSession();
    console.log('Teste de autenticação:');
    console.log('Session:', authData?.session ? 'Presente' : 'Ausente');
    console.log('Erro de autenticação:', authError || 'Nenhum erro');
    
    // 2. Testar se podemos acessar a tabela de tarefas
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('count(*)');
    
    console.log('Teste de acesso à tabela tasks:');
    console.log('Resultado:', tasksData);
    console.log('Erro:', tasksError || 'Nenhum erro');
    
    // 3. Tentar fazer um login anônimo para testes
    const { data: anonData, error: anonError } = await supabase.auth.signInAnonymously();
    console.log('Teste de login anônimo:');
    console.log('Resultado:', anonData.user ? 'Sucesso' : 'Falha');
    console.log('Erro:', anonError || 'Nenhum erro');
    
    console.log('Diagnóstico concluído.');
  } catch (error) {
    console.error('Erro durante o diagnóstico:', error);
  }
}

// Executar teste
testConnection();

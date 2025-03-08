// Script Node.js para testar conexão direta com Supabase
// Para executar: node node_test_supabase.js

const { createClient } = require('@supabase/supabase-js');

// Usar as mesmas credenciais do seu arquivo .env
const supabaseUrl = 'https://tjauuyydxagnugqvmigm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRqYXV1eXlkeGFnbnVncXZtaWdtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA0NzYxNzcsImV4cCI6MjA1NjA1MjE3N30.OUSJXM9icoCNewGE6ZMXTqf6XOt2ySP4OGfRT-bir1A';

// Criar cliente Supabase com timeout longo (30 segundos)
const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function runTests() {
  console.log('=== TESTE DE CONEXÃO SUPABASE ===');
  console.log(`URL: ${supabaseUrl}`);
  console.log('Chave: [PRESENTE]');
  console.log('\n');

  try {
    // Teste 1: Autenticação anônima
    console.log('TESTE 1: Autenticação anônima');
    const { data: authData, error: authError } = await supabase.auth.signInAnonymously();
    
    if (authError) {
      console.log('❌ Falha na autenticação anônima:');
      console.log(authError);
    } else {
      console.log('✅ Autenticação anônima bem-sucedida');
      console.log(`   ID do usuário: ${authData.user.id}`);
    }
    console.log('\n');

    // Teste 2: Verificar tabelas existentes (sem restrição de RLS)
    console.log('TESTE 2: Verificar tabelas existentes (visão pública)');
    const { data: tablesData, error: tablesError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public');
    
    if (tablesError) {
      console.log('❌ Falha ao listar tabelas:');
      console.log(tablesError);
    } else {
      console.log('✅ Tabelas encontradas:');
      tablesData.forEach((table, i) => {
        console.log(`   ${i+1}. ${table.table_name}`);
      });
    }
    console.log('\n');

    // Teste 3: Tentar acessar a tabela de tarefas diretamente
    console.log('TESTE 3: Tentar acessar a tabela tasks');
    const { data: tasksData, error: tasksError } = await supabase
      .from('tasks')
      .select('count(*)')
      .limit(1);
    
    if (tasksError) {
      console.log('❌ Falha ao acessar tabela tasks:');
      console.log(tasksError);

      if (tasksError.code === 'PGRST116') {
        console.log('   Causa provável: Políticas RLS estão bloqueando o acesso');
      }
    } else {
      console.log('✅ Conseguiu acessar a tabela tasks');
      console.log(`   Contagem: ${JSON.stringify(tasksData)}`);
    }
    console.log('\n');
    
    // Teste 4: Verificar políticas RLS
    console.log('TESTE 4: Verificar políticas RLS');
    const { data: policiesData, error: policiesError } = await supabase
      .from('pg_policies')
      .select('*')
      .limit(10);
    
    if (policiesError) {
      console.log('❌ Falha ao obter políticas RLS:');
      console.log(policiesError);
    } else {
      console.log('✅ Políticas RLS encontradas:');
      console.log(policiesData);
    }
    console.log('\n');

    // Conclusão
    console.log('=== CONCLUSÃO ===');
    if (authError || tablesError || tasksError) {
      console.log('❌ Existem problemas na conexão com o Supabase.');
      console.log('   Verifique as credenciais e configurações de segurança.');
    } else {
      console.log('✅ Conexão com Supabase está funcionando corretamente.');
      console.log('   Se o app ainda não funciona, o problema pode estar na implementação.');
    }
    
  } catch (error) {
    console.error('Erro não tratado durante os testes:');
    console.error(error);
  }
}

// Executar os testes
runTests();

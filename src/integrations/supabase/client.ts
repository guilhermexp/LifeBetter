
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

// Use environment variables for security
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Check your .env file.');
}

// Configurações simplificadas para melhor compatibilidade
const supabaseOptions = {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
};

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

console.log('Inicializando cliente Supabase com URL:', supabaseUrl);

export const supabase = createClient<Database>(
  supabaseUrl as string,
  supabaseAnonKey as string,
  supabaseOptions
);

// Adiciona listeners para tratar autenticação
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Mudança de estado de autenticação:', event);
  if (event === 'SIGNED_IN') {
    console.log('Usuário autenticado com sucesso');
  } else if (event === 'SIGNED_OUT') {
    console.log('Usuário saiu');
  } else if (event === 'USER_UPDATED') {
    console.log('Informações do usuário atualizadas');
  } else if (event === 'TOKEN_REFRESHED') {
    console.log('Token de autenticação atualizado');
  }
});

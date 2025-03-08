import { useEffect } from 'react';
import { invalidateCache, clearCache } from './useSupabaseCache';
import { supabase } from '@/integrations/supabase/client';

/**
 * Hook para limpar o cache do Supabase e garantir dados frescos
 * Deve ser usado quando há problemas de dados desatualizados
 * 
 * Características:
 * - Limpa todo o cache
 * - Força a atualização da sessão
 * - Executado apenas uma vez na inicialização
 */
export function useSupabaseCacheClear() {
  useEffect(() => {
    const cleanupCache = async () => {
      try {
        console.log('Limpando cache e sessão para garantir dados frescos...');
        
        // 1. Limpar todo o cache do Supabase
        clearCache();
        console.log('✅ Cache do Supabase limpo');
        
        // 2. Verificar sessão atual e garantir que está atualizada
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          // Se há sessão, atualize-a
          await supabase.auth.refreshSession();
          console.log('✅ Sessão atualizada');
        } else {
          console.log('❌ Nenhuma sessão encontrada para atualizar');
        }
        
        console.log('Limpeza concluída, dados serão carregados frescos agora');
      } catch (error) {
        console.error('Erro ao limpar cache:', error);
      }
    };

    // Execute apenas uma vez na inicialização do componente
    cleanupCache();
  }, []);

  return null;
}

export default useSupabaseCacheClear;

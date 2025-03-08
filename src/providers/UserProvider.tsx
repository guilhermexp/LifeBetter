
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

interface UserProfile {
  id: string;
  username: string;
  [key: string]: any;
}

interface UserWithProfile extends User {
  profile?: UserProfile;
}

interface UserContextType {
  user: UserWithProfile | null;
  isLoading: boolean;
  error: Error | null;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

// Cria o contexto com um valor padrão undefined
const UserContext = createContext<UserContextType | undefined>(undefined);

// Componente Provider
function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserWithProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refreshCount, setRefreshCount] = useState(0);

  // Função que busca os dados do usuário
  const fetchUser = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      console.log("Buscando sessão do usuário...");
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Erro ao buscar sessão:", sessionError);
        throw sessionError;
      }
      
      if (session?.user) {
        console.log("Sessão encontrada, buscando perfil do usuário...");
        
        // Tenta 3 vezes buscar o perfil, com um pequeno delay entre as tentativas
        let profileData = null;
        let profileError = null;
        
        for (let i = 0; i < 3; i++) {
          try {
            const { data, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();
              
            if (data) {
              profileData = data;
              break;
            } else if (error) {
              profileError = error;
              console.warn(`Tentativa ${i+1} falhou ao buscar perfil:`, error);
              // Aguarda antes de tentar novamente
              await new Promise(resolve => setTimeout(resolve, 1000));
            }
          } catch (err) {
            console.error(`Erro na tentativa ${i+1}:`, err);
          }
        }
          
        if (!profileData && profileError) {
          console.warn("Não foi possível buscar o perfil, mas continuando com dados de usuário básicos");
        }
        
        // Mesmo se não encontrar o perfil, continua com os dados básicos do usuário
        setUser({
          ...session.user,
          profile: profileData
        });
        
        console.log("Usuário autenticado com sucesso");
      } else {
        console.log("Nenhuma sessão encontrada, usuário não está autenticado");
        setUser(null);
      }
    } catch (err: any) {
      console.error('Erro ao buscar usuário:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Função para logout
  const logout = async () => {
    try {
      setIsLoading(true);
      await supabase.auth.signOut();
      setUser(null);
    } catch (err: any) {
      console.error('Erro ao fazer logout:', err);
      setError(err);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Efeito para buscar usuário ao montar componente e configurar listener
  useEffect(() => {
    console.log("Configurando UserProvider...");
    fetchUser();
    
    // Configura o listener de mudança de estado de autenticação
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Evento de autenticação detectado:", event);
        
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            console.log("Evento SIGNED_IN/TOKEN_REFRESHED com usuário, atualizando dados");
            fetchUser();
          }
        } else if (event === 'SIGNED_OUT') {
          console.log("Evento SIGNED_OUT, limpando dados do usuário");
          setUser(null);
        } else if (event === 'USER_UPDATED') {
          console.log("Evento USER_UPDATED, atualizando dados do usuário");
          fetchUser();
        }
      }
    );
    
    return () => {
      console.log("Limpando listener de autenticação");
      authListener.subscription.unsubscribe();
    };
  }, [refreshCount]); // Dependência adicionada para permitir refreshUser forçar um novo ciclo

  // Função para forçar atualização dos dados do usuário
  const refreshUser = async () => {
    console.log("Forçando atualização dos dados do usuário");
    setRefreshCount(prev => prev + 1);
  };

  // Valor do contexto
  const contextValue: UserContextType = {
    user,
    isLoading,
    error,
    refreshUser,
    logout
  };

  return (
    <UserContext.Provider value={contextValue}>
      {children}
    </UserContext.Provider>
  );
}

// Hook para usar o contexto de usuário
const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};

// Exportações
export { UserProvider, useUser };

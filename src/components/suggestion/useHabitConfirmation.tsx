import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { AITip } from './types';
import { AreaType } from '@/types/habits';
import { useUser } from '@/providers/UserProvider';

interface UseHabitConfirmationProps {
  onAddHabit: (area: AreaType, title: string, description: string, implementation?: any) => void;
}

export function useHabitConfirmation({ onAddHabit }: UseHabitConfirmationProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const handleConfirmHabit = async (tip: AITip) => {
    if (!user) {
      setError('Usuário não autenticado');
      return false;
    }

    setIsLoading(true);
    setError(null);

    try {
      // Extrair dados do hábito da dica
      const area = tip.area as AreaType;
      const title = tip.title;
      const description = tip.description;
      const implementation = tip.implementation;

      // Adicionar o hábito ao banco de dados
      const { data, error } = await supabase
        .from('habits')
        .insert({
          user_id: user.id,
          title,
          description,
          area,
          frequency: implementation?.recommendedFrequency || 'daily',
          time: implementation?.time || '08:00',
          duration: implementation?.recommended_duration || 30,
          active: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (error) {
        console.error('Erro ao adicionar hábito:', error);
        setError(error.message);
        setIsLoading(false);
        return false;
      }

      // Chamar a função onAddHabit para atualizar a interface
      onAddHabit(area, title, description, implementation);
      
      console.log('Hábito adicionado com sucesso:', data);
      setIsLoading(false);
      return true;
    } catch (err) {
      console.error('Erro ao processar adição de hábito:', err);
      setError(err instanceof Error ? err.message : 'Erro desconhecido');
      setIsLoading(false);
      return false;
    }
  };

  return {
    handleConfirmHabit,
    isLoading,
    error
  };
}


import { AITip } from "./types";
import { AreaType } from "@/types/habits";
import { useToast } from "@/hooks/use-toast";

interface UseHabitConfirmationProps {
  onAddHabit: (area: AreaType, title: string, description: string, implementation?: any) => void;
}

export function useHabitConfirmation({ onAddHabit }: UseHabitConfirmationProps) {
  const { toast } = useToast();

  const handleConfirmHabit = async (habit: AITip) => {
    if (!habit || !habit.title) {
      toast({
        title: "Erro",
        description: "Informações do hábito incompletas. Por favor, tente novamente.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Determinar a frequência com base no texto do hábito
      let frequency = 'daily';
      
      // Detectar frequência com base no texto da descrição
      const lowerDescription = habit.description.toLowerCase();
      if (lowerDescription.includes('semana') || lowerDescription.includes('semanal') || lowerDescription.includes('por semana')) {
        frequency = 'weekly';
      } else if (lowerDescription.includes('mês') || lowerDescription.includes('mensal') || lowerDescription.includes('por mês')) {
        frequency = 'monthly';
      }
      
      // Determinar categoria
      let area = habit.area as AreaType;
      if (!area) {
        // Se a área não estiver definida, tentar detectar com base no texto
        if (lowerDescription.includes('saúde') || lowerDescription.includes('exercício') || lowerDescription.includes('treino')) {
          area = 'health';
        } else if (lowerDescription.includes('negócio') || lowerDescription.includes('trabalho') || lowerDescription.includes('carreira')) {
          area = 'business';
        } else if (lowerDescription.includes('família') || lowerDescription.includes('relacionamento')) {
          area = 'family';
        } else if (lowerDescription.includes('dinheiro') || lowerDescription.includes('finança')) {
          area = 'finances';
        } else if (lowerDescription.includes('espiritual') || lowerDescription.includes('meditação')) {
          area = 'spirituality';
        }
      }
      
      // Encontra um horário adequado para o hábito se não for especificado
      let time = "08:00";
      if (lowerDescription.includes('noite') || lowerDescription.includes('dormir')) {
        time = "21:00";
      } else if (lowerDescription.includes('tarde')) {
        time = "15:00";
      } else if (lowerDescription.includes('almoço')) {
        time = "12:00";
      } else if (lowerDescription.includes('manhã')) {
        time = "08:00";
      }
      
      const implementation = habit.implementation || undefined;
      
      // Chama a função para adicionar o hábito com informações enriquecidas
      onAddHabit(
        area,
        habit.title,
        habit.description,
        {
          ...implementation,
          frequency,
          time,
          recommended_duration: implementation?.recommended_duration || 30
        }
      );
      
      toast({
        title: "Hábito adicionado",
        description: `O hábito "${habit.title}" foi adicionado com sucesso à sua rotina ${frequency === 'daily' ? 'diária' : frequency === 'weekly' ? 'semanal' : 'mensal'}.`,
        duration: 5000
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao confirmar hábito:", error);
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o hábito. Por favor, tente novamente.",
        variant: "destructive"
      });
      return false;
    }
  };

  return { handleConfirmHabit };
}

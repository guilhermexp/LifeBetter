
import { useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Bell, ArrowRight } from "lucide-react";

interface NotificationSystemProps {
  goals: Array<{ title: string; completed: boolean }>;
  habits: Array<{ title: string; completed: boolean; frequency: string }>;
  progress: number;
  lastProgress?: number;
}

export const NotificationSystem = ({ goals, habits, progress, lastProgress = 0 }: NotificationSystemProps) => {
  const { toast } = useToast();

  useEffect(() => {
    // Formata a porcentagem para exibir apenas uma casa decimal
    const formatProgress = (value: number) => Math.round(value * 10) / 10;
    
    // Notificação de progresso
    if (progress > lastProgress) {
      toast({
        title: "Progresso aumentou!",
        description: `Seu progresso aumentou de ${formatProgress(lastProgress)}% para ${formatProgress(progress)}%`
      });
    } else if (progress < lastProgress) {
      toast({
        title: "Atenção ao progresso",
        description: `Seu progresso diminuiu de ${formatProgress(lastProgress)}% para ${formatProgress(progress)}%`
      });
    }
  }, [progress, lastProgress, toast]);

  useEffect(() => {
    // Verifica hábitos diários não completados
    const checkDailyHabits = () => {
      const now = new Date();
      const hour = now.getHours();

      // Notifica sobre hábitos diários não completados às 10h e 18h
      if (hour === 10 || hour === 18) {
        const pendingHabits = habits.filter(
          habit => !habit.completed && habit.frequency === "daily"
        );

        if (pendingHabits.length > 0) {
          toast({
            title: "Lembrete de hábitos",
            description: `Você tem ${pendingHabits.length} hábitos diários pendentes para hoje.`
          });
        }
      }
    };

    // Verifica a cada hora
    const interval = setInterval(checkDailyHabits, 3600000);
    return () => clearInterval(interval);
  }, [habits, toast]);

  useEffect(() => {
    // Notifica sobre metas próximas ao prazo ou atrasadas
    const checkGoals = () => {
      const pendingGoals = goals.filter(goal => !goal.completed);
      
      if (pendingGoals.length > 0) {
        toast({
          title: "Lembrete de metas",
          description: `Você tem ${pendingGoals.length} metas pendentes para alcançar.`
        });
      }
    };

    // Verifica uma vez por dia
    const interval = setInterval(checkGoals, 86400000);
    return () => clearInterval(interval);
  }, [goals, toast]);

  return null; // Componente não renderiza nada visualmente
};

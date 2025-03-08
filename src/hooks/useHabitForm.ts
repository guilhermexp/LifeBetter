import { useState } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { useToast } from "@/hooks/use-toast";
import { format, addDays, addWeeks, addMonths } from 'date-fns';

interface UseHabitFormProps {
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  userId?: string;
}

export function useHabitForm({ onOpenChange, onSuccess, userId }: UseHabitFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState("daily");
  const [time, setTime] = useState("08:00");
  const [area, setArea] = useState("health");
  const [duration, setDuration] = useState(30);
  const [date, setDate] = useState<Date>(new Date());
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { toast } = useToast();
  
  const getColorByArea = (area: string) => {
    const areaColors: Record<string, string> = {
      health: "#10b981",
      business: "#3b82f6",
      family: "#6366f1",
      spirituality: "#eab308",
      finances: "#a855f7"
    };
    
    return areaColors[area] || "#6b7280";
  };

  const checkExistingHabit = async (title: string, scheduledDate: string) => {
    if (!userId) return false;
    
    try {
      const { data, error } = await supabase
        .from('tasks')
        .select('id')
        .eq('user_id', userId)
        .eq('title', title)
        .eq('scheduled_date', scheduledDate)
        .eq('type', 'habit')
        .single();
      
      if (error && error.code !== 'PGRST116') { // PGRST116 = Not found
        console.error("Erro ao verificar hábito existente:", error);
        return false;
      }
      
      return !!data; // Retorna true se encontrou um hábito existente
    } catch (error) {
      console.error("Erro ao verificar hábito existente:", error);
      return false;
    }
  };

  const createRecurringHabitEntries = async (habitData: any) => {
    const entries = [];
    const baseDateStr = format(date, 'yyyy-MM-dd');
    const baseDate = new Date(baseDateStr);

    entries.push({
      ...habitData,
      scheduled_date: baseDateStr
    });

    try {
      if (frequency === "daily") {
        for (let i = 1; i <= 30; i++) {
          const nextDate = addDays(baseDate, i);
          const nextDateStr = format(nextDate, 'yyyy-MM-dd');
          
          const exists = await checkExistingHabit(habitData.title, nextDateStr);
          if (!exists) {
            entries.push({
              ...habitData,
              id: uuidv4(),
              scheduled_date: nextDateStr
            });
          }
        }
      } else if (frequency === "weekly") {
        for (let i = 1; i <= 12; i++) {
          const nextDate = addWeeks(baseDate, i);
          const nextDateStr = format(nextDate, 'yyyy-MM-dd');
          
          const exists = await checkExistingHabit(habitData.title, nextDateStr);
          if (!exists) {
            entries.push({
              ...habitData,
              id: uuidv4(),
              scheduled_date: nextDateStr
            });
          }
        }
      } else if (frequency === "monthly") {
        for (let i = 1; i <= 6; i++) {
          const nextDate = addMonths(baseDate, i);
          const nextDateStr = format(nextDate, 'yyyy-MM-dd');
          
          const exists = await checkExistingHabit(habitData.title, nextDateStr);
          if (!exists) {
            entries.push({
              ...habitData,
              id: uuidv4(),
              scheduled_date: nextDateStr
            });
          }
        }
      }
      
      if (entries.length === 0) {
        console.log("Não há novas entradas para inserir");
        return;
      }

      const { error } = await supabase
        .from('tasks')
        .insert(entries);

      if (error) throw error;
      
      console.log(`Inseridas ${entries.length} entradas para o hábito`);
    } catch (error) {
      console.error("Erro ao criar entradas recorrentes:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!userId) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar um hábito",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    try {
      const baseDateStr = format(date, 'yyyy-MM-dd');
      const habitExists = await checkExistingHabit(title, baseDateStr);
      
      if (habitExists) {
        toast({
          title: "Aviso",
          description: "Já existe um hábito com este título programado para esta data",
          variant: "destructive",
        });
        setIsSubmitting(false);
        return;
      }
      
      let validPriority = "medium";
      
      if (frequency !== 'once') {
        if (frequency === 'daily') validPriority = "high";
        else if (frequency === 'weekly') validPriority = "medium";
        else if (frequency === 'monthly') validPriority = "low";
      }

      const habitData = {
        id: uuidv4(),
        title,
        details: description,
        type: "habit",
        start_time: time,
        duration,
        color: getColorByArea(area),
        completed: false,
        scheduled_date: format(date, 'yyyy-MM-dd'),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: userId,
        priority: validPriority
      };

      const routineData = {
        id: uuidv4(),
        title,
        description,
        category: area,
        frequency,
        start_time: time,
        duration_days: frequency === 'daily' ? 30 : frequency === 'weekly' ? 84 : frequency === 'monthly' ? 180 : 1, 
        scheduled_date: format(date, 'yyyy-MM-dd'),
        completed: false,
        created_at: new Date().toISOString(),
        user_id: userId,
      };

      await createRecurringHabitEntries(habitData);

      const { error: routineError } = await supabase
        .from('daily_routines')
        .insert([routineData]);

      if (routineError) throw routineError;

      toast({
        title: "Hábito criado",
        description: `Seu novo hábito "${title}" foi adicionado com sucesso à sua agenda e será repetido ${frequency === 'daily' ? 'diariamente' : frequency === 'weekly' ? 'semanalmente' : 'mensalmente'}!`,
        duration: 5000,
      });
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao criar hábito:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao criar o hábito",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    formState: {
      title,
      description,
      frequency,
      time,
      area,
      duration,
      date,
      isSubmitting
    },
    setters: {
      setTitle,
      setDescription,
      setFrequency,
      setTime,
      setArea,
      setDuration,
      setDate
    },
    handleSubmit
  };
}

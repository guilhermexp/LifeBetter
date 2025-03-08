
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { useToast } from "@/hooks/use-toast";
import { useUser } from "@/providers/UserProvider";
import { AreaType } from "@/types/habits";
import { HabitImplementation } from "@/data/knowledgeBase";

export function useAreaAction() {
  const [isAreaActionDialogOpen, setIsAreaActionDialogOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AreaType | null>(null);
  const [newItemTitle, setNewItemTitle] = useState("");
  const [newItemDescription, setNewItemDescription] = useState("");
  const [newItemType, setNewItemType] = useState<"goal" | "habit">("goal");
  const [isCreatingItem, setIsCreatingItem] = useState(false);

  const { toast } = useToast();
  const { user } = useUser();

  const handleAreaCardClick = (area: AreaType) => {
    setSelectedArea(area);
    setIsAreaActionDialogOpen(true);
  };

  const handleAreaDialogClose = () => {
    setIsAreaActionDialogOpen(false);
    setNewItemTitle("");
    setNewItemDescription("");
    setNewItemType("goal");
    setSelectedArea(null);
  };

  const handleCreateItem = async () => {
    if (!newItemTitle.trim()) {
      toast({
        variant: "destructive",
        title: "Título necessário",
        description: "Por favor, insira um título para o item."
      });
      return;
    }

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Você precisa estar logado para criar itens."
      });
      return;
    }

    setIsCreatingItem(true);

    try {
      if (newItemType === "goal") {
        await createGoal();
      } else {
        await createHabit();
      }

      handleAreaDialogClose();
      toast({
        title: `${newItemType === "goal" ? "Meta" : "Hábito"} criado`,
        description: `O item foi adicionado com sucesso!`
      });
    } catch (error) {
      console.error(`Error creating ${newItemType}:`, error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: `Ocorreu um erro ao criar o ${newItemType === "goal" ? "meta" : "hábito"}.`
      });
    } finally {
      setIsCreatingItem(false);
    }
  };

  const createGoal = async () => {
    if (!selectedArea || !user?.id) return;

    const goalId = uuidv4();
    
    const targetDate = new Date();
    targetDate.setMonth(targetDate.getMonth() + 3); // Default: 3 months from now
    
    const { error } = await supabase
      .from('goals')
      .insert({
        id: goalId,
        title: newItemTitle,
        description: newItemDescription,
        area: selectedArea,
        user_id: user.id,
        target_date: targetDate.toISOString().split('T')[0],
        progress: 0,
        completed: false
      });

    if (error) throw error;
  };

  const createHabit = async () => {
    if (!selectedArea || !user?.id) return;

    // Create a new habit with default values
    const routineData = {
      id: uuidv4(),
      title: newItemTitle,
      description: newItemDescription,
      category: selectedArea,
      frequency: "daily",
      user_id: user.id,
      scheduled_date: new Date().toISOString().split('T')[0],
      start_time: "08:00:00",
      completed: false,
      created_at: new Date().toISOString(),
      duration_days: 21 // Default to 21 days for habit formation
    };

    const { error } = await supabase
      .from('daily_routines')
      .insert(routineData);

    if (error) throw error;
  };

  const handleAddGoal = async (area: AreaType, title: string) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Você precisa estar logado para criar metas."
      });
      return;
    }

    try {
      setIsCreatingItem(true);
      
      const goalId = uuidv4();
      
      const targetDate = new Date();
      targetDate.setMonth(targetDate.getMonth() + 3); // Default: 3 months from now
      
      const { error } = await supabase
        .from('goals')
        .insert({
          id: goalId,
          title,
          description: "",
          area,
          user_id: user.id,
          target_date: targetDate.toISOString().split('T')[0],
          progress: 0,
          completed: false
        });

      if (error) throw error;

      toast({
        title: "Meta criada",
        description: `A meta "${title}" foi adicionada com sucesso!`
      });
    } catch (error) {
      console.error("Error creating goal:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao criar a meta."
      });
    } finally {
      setIsCreatingItem(false);
    }
  };

  const handleAddHabit = async (
    area: AreaType, 
    title: string, 
    description: string = "",
    implementation?: HabitImplementation
  ) => {
    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Erro de autenticação",
        description: "Você precisa estar logado para criar hábitos."
      });
      return;
    }

    try {
      setIsCreatingItem(true);
      
      // Determinar a frequência e duração com base na implementação
      const frequency = implementation?.recommendedFrequency || "daily";
      const durationDays = implementation?.durationPeriod === "test" 
        ? implementation.testDuration || 21 
        : 90; // Default to 90 days for permanent habits
      
      // Determinar o melhor horário com base na implementação
      let startTime = "08:00:00";
      if (implementation?.bestTimeOfDay) {
        if (implementation.bestTimeOfDay.toLowerCase().includes("manhã")) {
          startTime = "08:00:00";
        } else if (implementation.bestTimeOfDay.toLowerCase().includes("tarde")) {
          startTime = "14:00:00";
        } else if (implementation.bestTimeOfDay.toLowerCase().includes("noite")) {
          startTime = "20:00:00";
        }
      }
      
      // Create a new habit with values from the suggestion
      const routineData = {
        id: uuidv4(),
        title,
        description,
        category: area,
        frequency,
        user_id: user.id,
        scheduled_date: new Date().toISOString().split('T')[0],
        start_time: startTime,
        completed: false,
        created_at: new Date().toISOString(),
        duration_days: durationDays
      };

      // Salvar o hábito na tabela de rotinas
      const { error } = await supabase
        .from('daily_routines')
        .insert(routineData);

      if (error) throw error;

      toast({
        title: "Hábito criado",
        description: `O hábito "${title}" foi adicionado com sucesso!`
      });
    } catch (error) {
      console.error("Error creating habit:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao criar o hábito."
      });
    } finally {
      setIsCreatingItem(false);
    }
  };

  return {
    isAreaActionDialogOpen,
    setIsAreaActionDialogOpen,
    selectedArea,
    newItemTitle,
    setNewItemTitle,
    newItemDescription,
    setNewItemDescription,
    newItemType,
    setNewItemType,
    isCreatingItem,
    handleAreaCardClick,
    handleAreaDialogClose,
    handleCreateItem,
    handleAddGoal,
    handleAddHabit
  };
}

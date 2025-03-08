
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { notesClient } from "@/integrations/supabase/notes-client";
import { useToast } from "@/hooks/use-toast";

export const useQuickNote = (onSuccess?: () => void, onClose?: () => void) => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [isToday, setIsToday] = useState(false);
  const [hasDueDate, setHasDueDate] = useState(false);
  const [isPriority, setIsPriority] = useState(false);
  const [hasReminder, setHasReminder] = useState(false);
  const [category, setCategory] = useState("inbox");
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setIsToday(false);
    setHasDueDate(false);
    setIsPriority(false);
    setHasReminder(false);
    setCategory("inbox");
    setIsCreating(false);
  };

  const handleClose = () => {
    resetForm();
    if (onClose) {
      onClose();
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      return;
    }

    setIsCreating(true);

    try {
      const { data: user } = await supabase.auth.getUser();
      
      if (!user.user) {
        throw new Error("User not authenticated");
      }

      // Use our specialized notes client to avoid type errors
      const { error } = await notesClient.insert({
        title,
        description: description || null,
        is_today: isToday,
        has_due_date: hasDueDate,
        is_priority: isPriority,
        has_reminder: hasReminder,
        category,
        user_id: user.user.id,
        created_at: new Date().toISOString()
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Nota salva com sucesso!",
        description: "Sua nota foi adicionada como rascunho.",
      });

      resetForm();
      if (onClose) {
        onClose();
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error creating note:", error);
      toast({
        title: "Erro ao salvar nota",
        description: "Ocorreu um erro ao tentar salvar sua nota. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsCreating(false);
    }
  };

  return {
    title,
    setTitle,
    description,
    setDescription,
    isToday,
    setIsToday,
    hasDueDate,
    setHasDueDate,
    isPriority,
    setIsPriority,
    hasReminder,
    setHasReminder,
    category,
    setCategory,
    isCreating,
    handleClose,
    handleSave,
  };
};

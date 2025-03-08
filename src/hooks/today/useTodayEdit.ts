import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Task, TodoItem } from "@/types/today";
import { format, addDays, addMonths } from "date-fns";
import { 
  deleteAllTaskInstances, 
  updateAllTaskInstances 
} from "@/components/modals/smart-task";

export function useTodayEdit(
  tasks: Task[], 
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>,
  habits: any[], // Using any for now to match the structure
  setHabits: React.Dispatch<React.SetStateAction<any[]>>
) {
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [currentItem, setCurrentItem] = useState<TodoItem | null>(null);
  const { toast } = useToast();
  
  const handleEditItem = (item: TodoItem) => {
    setCurrentItem(item);
    setShowEditDialog(true);
  };
  
  const saveItemChanges = async (updatedItem: TodoItem) => {
    if (!currentItem) return;
    
    try {
      if (updatedItem.itemType === 'task') {
        // Convert duration to minutes as a string
        const durationInMinutes = convertDurationToMinutes(updatedItem.duration || '30min');
        const wasInboxOnly = currentItem.inbox_only === true;
        const isNowConfirmed = updatedItem.inbox_only === false;
        
        // First, update the current item
        const { error } = await supabase
          .from('tasks')
          .update({
            title: updatedItem.title,
            details: updatedItem.details,
            type: updatedItem.type,
            scheduled_date: updatedItem.scheduled_date,
            start_time: updatedItem.start_time,
            color: updatedItem.color,
            frequency: updatedItem.frequency || 'once',
            notification_time: updatedItem.notification_time,
            duration: parseInt(durationInMinutes), // Convert to number for database
            scheduled: !updatedItem.inbox_only, // Use scheduled field instead of inbox_only
            location: updatedItem.location
          })
          .eq('id', updatedItem.id);
          
        if (error) throw error;
        
        // If this task was previously inbox-only and is now confirmed for planner,
        // OR if it has a recurring frequency, create instances for the planner
        if ((wasInboxOnly && isNowConfirmed) || 
            (updatedItem.frequency && updatedItem.frequency !== 'once')) {
          
          // First, ensure all existing instances are updated or deleted
          if (!wasInboxOnly) {
            // Delete any existing instances to recreate them with updated settings
            await deleteAllTaskInstances(updatedItem.id);
          }
          
          // Only create future instances for confirmed planner tasks with recurrence
          if (!updatedItem.inbox_only && updatedItem.frequency && updatedItem.frequency !== 'once') {
            // Obtenha o usuário atual
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Usuário não autenticado");
            
            const scheduledDate = new Date(updatedItem.scheduled_date);
            let futureDates: string[] = [];
            
            // Determine dates based on frequency
            if (updatedItem.frequency === 'daily') {
              // For daily, create 30 days ahead
              futureDates = Array.from({ length: 30 }, (_, i) => 
                format(addDays(scheduledDate, i + 1), 'yyyy-MM-dd')
              );
            } 
            else if (updatedItem.frequency === 'weekly') {
              // For weekly, create 12 weeks ahead
              futureDates = Array.from({ length: 12 }, (_, i) => 
                format(addDays(scheduledDate, (i + 1) * 7), 'yyyy-MM-dd')
              );
            }
            else if (updatedItem.frequency === 'monthly') {
              // For monthly, create 6 months ahead
              futureDates = Array.from({ length: 6 }, (_, i) => 
                format(addMonths(scheduledDate, i + 1), 'yyyy-MM-dd')
              );
            }
            
            // Create new instances for the calculated dates
            if (futureDates.length > 0) {
              const newTasks = futureDates.map(dateString => ({
                title: updatedItem.title,
                details: updatedItem.details,
                type: updatedItem.type,
                scheduled_date: dateString,
                start_time: updatedItem.start_time,
                color: updatedItem.color,
                frequency: updatedItem.frequency,
                notification_time: updatedItem.notification_time,
                duration: parseInt(durationInMinutes), // Convert to number for database
                completed: false,
                user_id: user.id,
                priority: 'medium',
                scheduled: true, // Use scheduled instead of inbox_only
                parent_task_id: updatedItem.id, // Reference to the parent task
                location: updatedItem.location
              }));
              
              // Insert new recurring instances
              if (newTasks.length > 0) {
                const { error: insertError } = await supabase
                  .from('tasks')
                  .insert(newTasks);
                  
                if (insertError) console.error("Error inserting new recurring tasks:", insertError);
              }
            }
          }
        } else if (updatedItem.id) {
          // If this is an existing recurring task being updated, update all its instances
          const fieldsToUpdate = {
            title: updatedItem.title,
            details: updatedItem.details,
            type: updatedItem.type,
            color: updatedItem.color || currentItem.color,
            frequency: updatedItem.frequency || 'once',
            notification_time: updatedItem.notification_time,
            duration: parseInt(durationInMinutes), // Convert to number for database
            location: updatedItem.location
          };
          
          // Update all child instances of this task
          await updateAllTaskInstances(updatedItem.id, fieldsToUpdate);
        }
        
        // Handle subtasks
        if (updatedItem.subtasks && updatedItem.subtasks.length > 0) {
          const { error: deleteError } = await supabase
            .from('subtasks')
            .delete()
            .eq('task_id', updatedItem.id);
            
          if (deleteError) console.error("Erro ao excluir subtarefas:", deleteError);
          
          const subtasksToInsert = updatedItem.subtasks.map((title, index) => ({
            task_id: updatedItem.id,
            title,
            completed: false,
            order_index: index
          }));
          
          const { error: insertError } = await supabase
            .from('subtasks')
            .insert(subtasksToInsert);
            
          if (insertError) console.error("Erro ao inserir subtarefas:", insertError);
        }
        
        // Update local state
        setTasks(prev => prev.map(task => 
          task.id === updatedItem.id ? {
            ...task,
            title: updatedItem.title,
            details: updatedItem.details,
            type: updatedItem.type,
            scheduled_date: updatedItem.scheduled_date,
            start_time: updatedItem.start_time,
            color: updatedItem.color || task.color,
            frequency: updatedItem.frequency || 'once',
            notification_time: updatedItem.notification_time,
            duration: durationInMinutes, // Keep as string in frontend state
            inbox_only: updatedItem.inbox_only,
            location: updatedItem.location
          } : task
        ));
      } else {
        // Habit updates
        const durationDays = updatedItem.duration_days || 21; // Default to 21 if not specified
        const wasInboxOnly = currentItem.inbox_only === true;
        const isNowConfirmed = updatedItem.inbox_only === false;
        
        // If the database uses the field 'duration', let's prepare that too
        let habitData: any = {
          title: updatedItem.title,
          description: updatedItem.details,
          frequency: updatedItem.frequency || updatedItem.category,
          scheduled_date: updatedItem.scheduled_date,
          start_time: updatedItem.start_time,
          duration_days: durationDays,
          color: updatedItem.color,
          notification_time: updatedItem.notification_time,
          scheduled: !updatedItem.inbox_only // Use scheduled instead of inbox_only
        };
        
        // Only add duration field if it's in the updatedItem
        if (updatedItem.duration) {
          habitData.duration = parseInt(convertDurationToMinutes(updatedItem.duration));
        }
        
        const { error } = await supabase
          .from('daily_routines')
          .update(habitData)
          .eq('id', updatedItem.id);
          
        if (error) throw error;
        
        // Update local state
        setHabits(prev => prev.map(habit => 
          habit.id === updatedItem.id ? {
            ...habit,
            title: updatedItem.title,
            description: updatedItem.details,
            frequency: updatedItem.frequency || habit.frequency,
            scheduled_date: updatedItem.scheduled_date,
            start_time: updatedItem.start_time,
            duration_days: durationDays,
            color: updatedItem.color || habit.color,
            notification_time: updatedItem.notification_time,
            duration: updatedItem.duration, // Keep as string in frontend state
            inbox_only: updatedItem.inbox_only
          } : habit
        ));
      }
      
      setShowEditDialog(false);
      
      // Show different message based on whether the task is now in planner
      if (updatedItem.inbox_only === false && currentItem.inbox_only === true) {
        toast({
          title: updatedItem.itemType === 'task' ? "Tarefa confirmada" : "Hábito confirmado",
          description: updatedItem.frequency && updatedItem.frequency !== 'once'
            ? "Item enviado para o Planner e repetições criadas para os próximos períodos."
            : "Item enviado para o Planner."
        });
      } else {
        toast({
          title: updatedItem.itemType === 'task' ? "Tarefa atualizada" : "Hábito atualizado",
          description: "As alterações foram salvas com sucesso."
        });
      }
    } catch (error) {
      console.error("Erro ao atualizar item:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar as alterações."
      });
    }
  };

  // Update this function to return string values
  const convertDurationToMinutes = (duration: string): string => {
    const durationMap: { [key: string]: string } = {
      '5min': '5',
      '15min': '15',
      '30min': '30',
      '45min': '45',
      '1h': '60',
      '1h30': '90',
      '2h': '120',
      'custom': '30'
    };
    
    return durationMap[duration] || '30';
  };
  
  return {
    showEditDialog,
    setShowEditDialog,
    currentItem,
    handleEditItem,
    saveItemChanges
  };
}

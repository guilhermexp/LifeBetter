import { useState, useEffect, useCallback } from "react";
import { format, addDays, isSameDay, parseISO, isValid, isSameMonth, setHours, setMinutes, isAfter, isBefore, startOfDay, endOfDay } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { TaskItem } from "@/components/planner/TaskItem";
import { fetchGoogleCalendarEvents, checkGoogleCalendarConnection } from "@/lib/googleCalendarClient";

interface Holiday {
  title: string;
  date: string;
  description: string;
}

export function usePlannerEvents() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [currentMonth, setCurrentMonth] = useState<Date>(new Date());
  const [taskEvents, setTaskEvents] = useState<TaskItem[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [quickActionEvent, setQuickActionEvent] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TaskItem | null>(null);
  const [taskCountsByDay, setTaskCountsByDay] = useState<Record<string, number>>({});
  const [showOnlyCompleted, setShowOnlyCompleted] = useState(false);
  const [googleCalendarEvents, setGoogleCalendarEvents] = useState<TaskItem[]>([]);
  const [isGoogleCalendarEnabled, setIsGoogleCalendarEnabled] = useState(false);

  const { toast } = useToast();

  const holidaysList: Holiday[] = [
    { title: "Ano Novo", date: "2024-01-01", description: "Feriado Nacional" },
    { title: "Carnaval", date: "2024-02-13", description: "Ponto Facultativo" },
    { title: "Sexta-feira Santa", date: "2024-03-29", description: "Feriado Nacional" },
    { title: "Tiradentes", date: "2024-04-21", description: "Feriado Nacional" },
    { title: "Dia do Trabalho", date: "2024-05-01", description: "Feriado Nacional" },
    { title: "Corpus Christi", date: "2024-05-30", description: "Ponto Facultativo" },
    { title: "Independência do Brasil", date: "2024-09-07", description: "Feriado Nacional" },
    { title: "Nossa Senhora Aparecida", date: "2024-10-12", description: "Feriado Nacional" },
    { title: "Finados", date: "2024-11-02", description: "Feriado Nacional" },
    { title: "Proclamação da República", date: "2024-11-15", description: "Feriado Nacional" },
    { title: "Natal", date: "2024-12-25", description: "Feriado Nacional" }
  ];

  useEffect(() => {
    if (selectedDate) {
      fetchEvents();
      loadHolidays();
    }
  }, [selectedDate]);

  const loadHolidays = useCallback(() => {
    if (!selectedDate) return;
    const currentYear = selectedDate.getFullYear();
    
    const holidaysWithCurrentYear = holidaysList.map(holiday => {
      const holidayDate = new Date(holiday.date.replace(/\d{4}/, currentYear.toString()));
      return {
        ...holiday,
        date: format(holidayDate, 'yyyy-MM-dd')
      };
    });
    
    setHolidays(holidaysWithCurrentYear);
  }, [selectedDate]);

  const fetchTaskCountsForVisibleDays = useCallback(async (visibleDays: Date[]) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const formattedDates = visibleDays.map(day => format(day, 'yyyy-MM-dd'));
      
      const { data: tasksInRange, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .in('scheduled_date', formattedDates);
        
      if (error) {
        console.error("Erro ao buscar contagem de tarefas:", error);
        return;
      }
      
      if (!tasksInRange) return;
      
      const counts: Record<string, number> = {};
      formattedDates.forEach(date => {
        counts[date] = 0;
      });
      
      const processedTasksByDay: Record<string, Set<string>> = {};
      formattedDates.forEach(date => {
        processedTasksByDay[date] = new Set();
      });
      
      visibleDays.forEach(day => {
        const formattedDate = format(day, 'yyyy-MM-dd');
        
        tasksInRange.forEach(task => {
          if (!task.scheduled_date) return;
          
          const scheduledDate = parseISO(task.scheduled_date);
          if (!isValid(scheduledDate)) return;
          
          const taskKey = `${task.title}-${task.start_time || '00:00'}`;
          
          if (task.type !== 'habit' || !task.priority) {
            if (format(scheduledDate, 'yyyy-MM-dd') === formattedDate) {
              counts[formattedDate]++;
            }
            return;
          }
          
          if (scheduledDate > day) return;
          
          if (processedTasksByDay[formattedDate].has(taskKey)) {
            return;
          }
          
          let shouldCount = false;
          
          if (task.priority === 'high') {
            shouldCount = true;
          } else if (task.priority === 'medium') {
            shouldCount = scheduledDate.getDay() === day.getDay();
          } else if (task.priority === 'low') {
            shouldCount = scheduledDate.getDate() === day.getDate();
          } else {
            shouldCount = format(scheduledDate, 'yyyy-MM-dd') === formattedDate;
          }
          
          if (shouldCount) {
            processedTasksByDay[formattedDate].add(taskKey);
            counts[formattedDate]++;
          }
        });
      });
      
      setTaskCountsByDay(counts);
      console.log("Task counts updated:", counts);
    } catch (error) {
      console.error("Erro ao calcular contagem de tarefas:", error);
    }
  }, []);

  const shouldShowHabitOnDate = useCallback((task: any, targetDate: Date): boolean => {
    if (!task || !task.scheduled_date || !task.type || task.type !== 'habit' || !task.priority) {
      return false;
    }
    
    try {
      const scheduledDate = parseISO(task.scheduled_date);
      if (!isValid(scheduledDate)) return false;
      
      if (isAfter(scheduledDate, targetDate)) return false;
      
      const formattedTargetDate = format(targetDate, 'yyyy-MM-dd');
      const formattedScheduledDate = format(scheduledDate, 'yyyy-MM-dd');
      
      if (formattedScheduledDate === formattedTargetDate) return true;
      
      switch (task.priority) {
        case 'high':
          return true;
        case 'medium':
          return scheduledDate.getDay() === targetDate.getDay();
        case 'low':
          return scheduledDate.getDate() === targetDate.getDate();
        default:
          return false;
      }
    } catch (error) {
      console.error("Erro ao verificar exibição de hábito:", error, task);
      return false;
    }
  }, []);

  const fetchEvents = useCallback(async () => {
    if (!selectedDate) return;
    setIsLoading(true);
    
    try {
      console.log("Fetching events for date:", format(selectedDate, 'yyyy-MM-dd'));
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      console.log("Formatted selected date:", formattedDate);

      const { data: allUserTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('completed', false)
        .eq('scheduled', true); // Somente tarefas confirmadas para o planner
        
      if (tasksError) {
        throw tasksError;
      }
      
      if (allUserTasks) {
        console.log("All user tasks count:", allUserTasks.length);
        
        const taskMap = new Map<string, any>();
        
        allUserTasks.forEach(task => {
          if (!task.scheduled_date) {
            console.log("Task without scheduled date, skipping:", task.title);
            return;
          }
          
          const scheduledDate = parseISO(task.scheduled_date);
          if (!isValid(scheduledDate)) {
            console.log("Invalid scheduled date, skipping:", task.title, task.scheduled_date);
            return;
          }

          const taskFormattedDate = format(scheduledDate, 'yyyy-MM-dd');
          
          if (task.type !== 'habit' || !task.priority) {
            if (taskFormattedDate === formattedDate) {
              taskMap.set(task.id, task);
            }
            return;
          }
          
          if (shouldShowHabitOnDate(task, selectedDate)) {
            const taskKey = `${task.title}-${task.start_time || '00:00'}`;
            
            if (taskMap.has(taskKey)) {
              const existingTask = taskMap.get(taskKey);
              const existingDate = parseISO(existingTask.scheduled_date);
              
              if (isAfter(scheduledDate, existingDate)) {
                taskMap.set(taskKey, task);
              }
            } else {
              taskMap.set(taskKey, task);
            }
          }
        });
        
        const filteredTasks = Array.from(taskMap.values());
        
        console.log("Filtered tasks for selected date:", filteredTasks.length);
        
        filteredTasks.sort((a, b) => {
          if (!a.start_time) return 1;
          if (!b.start_time) return -1;
          return a.start_time < b.start_time ? -1 : 1;
        });
        
        setTaskEvents(filteredTasks);
      }
    } catch (error) {
      console.error("Erro ao buscar eventos:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao carregar os eventos."
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedDate, shouldShowHabitOnDate, toast]);

  const updateTaskCounts = useCallback((visibleDays: Date[]) => {
    fetchTaskCountsForVisibleDays(visibleDays);
  }, [fetchTaskCountsForVisibleDays]);

  const getTaskCountForDay = useCallback((day: Date) => {
    const formattedDate = format(day, 'yyyy-MM-dd');
    return taskCountsByDay[formattedDate] || 0;
  }, [taskCountsByDay]);

  const handleEventComplete = useCallback(async (eventId: string, currentStatus: boolean = false) => {
    try {
      const taskToUpdate = taskEvents.find(task => task.id === eventId);
      if (!taskToUpdate) return;
      
      setTaskEvents(prev => prev.map(event => 
        event.id === eventId ? { ...event, completed: !event.completed } : event
      ));
      
      const { error } = await supabase
        .from('tasks')
        .update({ completed: !currentStatus })
        .eq('id', eventId);
        
      if (error) throw error;
      
      if (taskToUpdate.type === 'habit') {
        const { data: routineData, error: routineQueryError } = await supabase
          .from('daily_routines')
          .select('id')
          .eq('title', taskToUpdate.title)
          .eq('scheduled_date', taskToUpdate.scheduled_date)
          .eq('user_id', taskToUpdate.user_id)
          .single();
          
        if (!routineQueryError && routineData) {
          const { error: routineUpdateError } = await supabase
            .from('daily_routines')
            .update({ completed: !currentStatus })
            .eq('id', routineData.id);
            
          if (routineUpdateError) {
            console.error("Erro ao atualizar rotina:", routineUpdateError);
          }
        }
      }
      
      const visibleDays = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(currentMonth);
        day.setDate(day.getDate() - day.getDay() + i);
        return day;
      });
      
      updateTaskCounts(visibleDays);
      
      toast({
        title: "Evento atualizado",
        description: "Status do evento atualizado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao atualizar status do evento:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao atualizar o status do evento."
      });
    }
  }, [taskEvents, currentMonth, updateTaskCounts, toast]);

  const handleDeleteEvent = useCallback(async (eventId: string) => {
    try {
      const taskToDelete = taskEvents.find(task => task.id === eventId);
      if (!taskToDelete) return;
      
      if (taskToDelete.type !== 'habit') {
        const { error } = await supabase
          .from('tasks')
          .delete()
          .eq('id', eventId);
          
        if (error) throw error;
        
        setTaskEvents(prev => prev.filter(event => event.id !== eventId));
      } else {
        console.log("Deleting habit:", taskToDelete.title);
        
        const { error: deleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('id', eventId);
          
        if (deleteError) throw deleteError;
        
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        
        const { error: batchDeleteError } = await supabase
          .from('tasks')
          .delete()
          .eq('user_id', user.id)
          .eq('type', 'habit')
          .eq('title', taskToDelete.title);
          
        if (batchDeleteError) throw batchDeleteError;
        
        setTaskEvents(prev => prev.filter(event => 
          !(event.type === 'habit' && event.title === taskToDelete.title)
        ));
      }
      
      const visibleDays = Array.from({ length: 7 }, (_, i) => {
        const day = new Date(currentMonth);
        day.setDate(day.getDate() - day.getDay() + i);
        return day;
      });
      
      updateTaskCounts(visibleDays);
      
      toast({
        title: "Evento excluído",
        description: taskToDelete.type === 'habit' 
          ? "O hábito foi excluído de todos os dias."
          : "O evento foi excluído com sucesso."
      });
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao excluir o evento."
      });
    }
  }, [taskEvents, currentMonth, updateTaskCounts, toast]);

  const handleDuplicateEvent = useCallback(async (eventId: string) => {
    try {
      const eventToDuplicate = taskEvents.find(task => task.id === eventId);
      if (!eventToDuplicate) return;
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { id, ...eventCopy } = eventToDuplicate;
      
      // Preservar o formato original da duração ou definir um valor padrão
      const durationValue = eventCopy.duration || "30";
      
      const duplicatedEvent = {
        ...eventCopy,
        title: `${eventCopy.title} (cópia)`,
        completed: false,
        user_id: user.id,
        duration: durationValue
      };
      
      const { data, error } = await supabase
        .from('tasks')
        .insert(duplicatedEvent)
        .select()
        .single();
        
      if (error) throw error;
      
      if (data) {
        const taskWithStringDuration: TaskItem = {
          ...data,
          duration: data.duration ? String(data.duration) : undefined
        };
        
        setTaskEvents(prev => [...prev, taskWithStringDuration]);
      }
      
      toast({
        title: "Evento duplicado",
        description: "O evento foi duplicado com sucesso."
      });
    } catch (error) {
      console.error("Erro ao duplicar evento:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao duplicar o evento."
      });
    }
  }, [taskEvents, toast]);

  const handleEditEvent = useCallback((eventId: string) => {
    const event = taskEvents.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setIsEditEventOpen(true);
    }
  }, [taskEvents]);

  const handleQuickAction = useCallback((eventId: string, title: string) => {
    setQuickActionEvent({ id: eventId, title });
  }, []);

  const closeQuickAction = useCallback(() => {
    setQuickActionEvent(null);
  }, []);

  const handleAddEvent = useCallback(() => {
    toast({
      title: "Adicionar evento",
      description: "Esta funcionalidade será implementada em breve."
    });
  }, [toast]);

  const getFilteredTasks = useCallback(() => {
    let combinedTasks = [...taskEvents, ...googleCalendarEvents];
    
    if (showOnlyCompleted) {
      return combinedTasks.filter(task => task.completed);
    }
    
    return combinedTasks;
  }, [taskEvents, googleCalendarEvents, showOnlyCompleted]);

  useEffect(() => {
    const checkGoogleConnection = async () => {
      try {
        const { connected } = await checkGoogleCalendarConnection();
        setIsGoogleCalendarEnabled(connected);
      } catch (error) {
        console.error("Error checking Google Calendar connection:", error);
      }
    };
    
    checkGoogleConnection();
  }, []);

  const fetchGoogleEvents = async () => {
    if (!selectedDate || !isGoogleCalendarEnabled) return;
    
    try {
      const startDate = format(startOfDay(selectedDate), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
      const endDate = format(endOfDay(selectedDate), 'yyyy-MM-dd\'T\'HH:mm:ss\'Z\'');
      
      const events = await fetchGoogleCalendarEvents(startDate, endDate);
      
      if (events && events.length > 0) {
        const transformedEvents: TaskItem[] = events.map((event: any) => {
          const start = event.start?.dateTime ? parseISO(event.start.dateTime) : setHours(parseISO(event.start.date), 0);
          const end = event.end?.dateTime ? parseISO(event.end.dateTime) : setHours(parseISO(event.end.date), 23);
          
          return {
            id: event.id,
            title: event.summary || 'Sem título',
            start_time: format(start, 'HH:mm'),
            end_time: format(end, 'HH:mm'),
            scheduled_date: format(start, 'yyyy-MM-dd'),
            completed: false,
            location: event.location || '',
            details: event.description || '',
            meeting_link: event.hangoutLink || '',
            type: event.summary?.toLowerCase().includes('reunião') || event.summary?.toLowerCase().includes('meeting') ? 'meeting' : 'event',
            source: 'google_calendar',
            color: event.colorId ? `#${event.colorId}` : undefined,
            user_id: '',
            isGoogleEvent: true
          };
        });
        
        setGoogleCalendarEvents(transformedEvents);
      } else {
        setGoogleCalendarEvents([]);
      }
    } catch (error) {
      console.error("Error fetching Google Calendar events:", error);
    }
  };

  useEffect(() => {
    fetchGoogleEvents();
  }, [selectedDate, isGoogleCalendarEnabled]);

  return {
    selectedDate,
    setSelectedDate,
    currentMonth,
    setCurrentMonth,
    taskEvents,
    getFilteredTasks,
    showOnlyCompleted,
    setShowOnlyCompleted,
    holidays,
    isLoading,
    quickActionEvent,
    isEditEventOpen,
    selectedEvent,
    fetchEvents,
    handleEventComplete,
    handleDeleteEvent,
    handleDuplicateEvent,
    handleEditEvent,
    handleQuickAction,
    closeQuickAction,
    setIsEditEventOpen,
    handleAddEvent,
    getTaskCountForDay,
    updateTaskCounts,
    isGoogleCalendarEnabled,
    googleCalendarEvents
  };
}

const convertDurationToMinutes = (duration: string): number => {
  if (!duration) return 30; // Default
  
  const durationMap: { [key: string]: number } = {
    '5min': 5,
    '15min': 15,
    '30min': 30,
    '45min': 45,
    '1h': 60,
    '1h30': 90,
    '2h': 120,
    'custom': 30
  };
  
  if (/^\d+$/.test(duration)) {
    return parseInt(duration);
  }
  
  return durationMap[duration] || 30;
};

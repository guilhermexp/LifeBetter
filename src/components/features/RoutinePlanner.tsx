
import { useState, useEffect, useRef } from "react";
import { Plus, Check, InfoIcon, Bell, Calendar as CalendarIcon, ChevronLeft, ChevronRight, MoreVertical, Clock, ArrowRight, Briefcase, Heart, Sun, BookOpen, Coffee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { format, addDays, subDays, isToday, isSameDay, startOfWeek, endOfWeek, parseISO, isSameHour, isAfter, isBefore, addHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { Json } from "@/integrations/supabase/types";

interface RepeatConfig {
  days?: number[];
  interval?: number;
  endDate?: string;
}

interface Task {
  id: string;
  startTime: string;
  endTime: string;
  title: string;
  description: string;
  completed: boolean;
  frequency: "daily" | "weekly" | "monthly" | "once";
  category: "work" | "health" | "leisure" | "study" | "personal";
  reminderTime?: number;
  createdAt: string;
  repeat?: RepeatConfig;
  participants?: string[];
}

interface SupabaseRoutine {
  id: string;
  start_time: string;
  end_time: string | null;
  title: string;
  description: string | null;
  completed: boolean | null;
  frequency: string;
  category: string;
  reminder_time: number | null;
  created_at: string;
  repeat_config: Json;
  participants: Json;
}

const categoryColors = {
  work: "border-blue-500 bg-blue-50",
  health: "border-green-500 bg-green-50",
  leisure: "border-yellow-500 bg-yellow-50",
  study: "border-purple-500 bg-purple-50",
  personal: "border-pink-500 bg-pink-50"
};

const categoryIcons = {
  work: <Briefcase className="h-4 w-4" />,
  health: <Heart className="h-4 w-4" />,
  leisure: <Sun className="h-4 w-4" />,
  study: <BookOpen className="h-4 w-4" />,
  personal: <Coffee className="h-4 w-4" />
};

export const RoutinePlanner = () => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [showTaskDetails, setShowTaskDetails] = useState<string | null>(null);
  const [newTask, setNewTask] = useState<Partial<Task>>({
    frequency: "daily",
    category: "work",
    reminderTime: 15,
    participants: []
  });
  const { toast } = useToast();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyProgress, setDailyProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const timelineRef = useRef<HTMLDivElement>(null);
  
  const parseRepeatConfig = (config: Json): RepeatConfig | undefined => {
    if (typeof config === 'object' && config !== null) {
      return config as RepeatConfig;
    }
    return undefined;
  };

  const parseParticipants = (data: Json): string[] => {
    if (Array.isArray(data)) {
      return data as string[];
    }
    return [];
  };

  const weekDays = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(selectedDate, i - 3);
    return {
      date,
      dayOfMonth: format(date, 'd'),
      dayName: format(date, 'EEE', { locale: ptBR }),
      isSelected: isSameDay(date, selectedDate),
      isToday: isToday(date),
    };
  });

  // Horas do dia para a linha do tempo
  const timeSlots = Array.from({ length: 24 }, (_, index) => {
    const hour = index;
    return {
      hour,
      label: `${hour.toString().padStart(2, '0')}:00`,
    };
  });

  useEffect(() => {
    // Rolar até o horário atual quando a página é carregada
    if (timelineRef.current) {
      const now = new Date();
      const currentHour = now.getHours();
      const hourElement = timelineRef.current.querySelector(`[data-hour="${currentHour}"]`);
      
      if (hourElement) {
        hourElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [isLoading]);

  useEffect(() => {
    // Remover detalhes da tarefa ao trocar de data
    setShowTaskDetails(null);
  }, [selectedDate]);

  const loadTasksForDate = async (date: Date) => {
    try {
      setIsLoading(true);
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.error('Usuário não autenticado');
        toast({
          variant: "destructive",
          title: "Erro ao carregar rotinas",
          description: "Você precisa estar autenticado para ver suas rotinas.",
        });
        return;
      }
      
      const { data: routines, error } = await supabase
        .from('daily_routines')
        .select('*')
        .eq('scheduled_date', formattedDate)
        .eq('user_id', user.id)
        .order('start_time', { ascending: true });

      if (error) {
        console.error('Erro ao carregar rotinas:', error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar rotinas",
          description: "Não foi possível carregar suas rotinas. Tente novamente.",
        });
        return;
      }

      const formattedTasks: Task[] = (routines as SupabaseRoutine[]).map(routine => ({
        id: routine.id,
        startTime: routine.start_time,
        endTime: routine.end_time || routine.start_time,
        title: routine.title,
        description: routine.description || "",
        completed: routine.completed || false,
        frequency: routine.frequency as Task['frequency'],
        category: (routine.category as Task['category']) || "work",
        reminderTime: routine.reminder_time || undefined,
        createdAt: routine.created_at,
        repeat: parseRepeatConfig(routine.repeat_config),
        participants: parseParticipants(routine.participants || [])
      }));

      setTasks(formattedTasks);
      updateProgress(formattedTasks);
    } catch (error) {
      console.error('Erro ao carregar rotinas:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar rotinas",
        description: "Ocorreu um erro ao carregar suas rotinas.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadTasksForDate(selectedDate);
  }, [selectedDate]);

  const updateProgress = (currentTasks: Task[]) => {
    if (currentTasks.length === 0) {
      setDailyProgress(0);
      return;
    }
    const completed = currentTasks.filter(task => task.completed).length;
    setDailyProgress((completed / currentTasks.length) * 100);
  };

  const handleAddTask = async () => {
    if (!newTask.title || !newTask.startTime) {
      toast({
        variant: "destructive",
        title: "Erro ao criar tarefa",
        description: "Título e horário são obrigatórios.",
      });
      return;
    }

    try {
      // Obter o usuário atual
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');

      const repeatConfigJson = newTask.repeat ? {
        days: newTask.repeat.days || [],
        interval: newTask.repeat.interval || 0,
        endDate: newTask.repeat.endDate || "",
      } as Json : null;

      // Garantir que participants seja um array válido para o formato JSONB
      const participantsArray = Array.isArray(newTask.participants) ? newTask.participants : [];

      // Garantir que a categoria seja um dos valores permitidos (work, health, leisure, study, personal)
      const validCategory = newTask.category && ["work", "health", "leisure", "study", "personal"].includes(newTask.category)
        ? newTask.category
        : "work";

      const insertData = {
        title: newTask.title,
        description: newTask.description || "",
        start_time: newTask.startTime,
        end_time: newTask.endTime || null,
        frequency: newTask.frequency || "daily",
        category: validCategory, // Garantir valor válido para a categoria
        reminder_time: newTask.reminderTime || null,
        scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
        repeat_config: repeatConfigJson,
        participants: participantsArray,
        user_id: user.id
      };

      console.log("Dados sendo inseridos:", insertData);

      const { data: routine, error } = await supabase
        .from('daily_routines')
        .insert(insertData)
        .select()
        .single();

      if (error) {
        console.error("Erro do Supabase:", error);
        throw error;
      }

      console.log("Rotina salva com sucesso:", routine);

      const task: Task = {
        id: routine.id,
        startTime: routine.start_time,
        endTime: routine.end_time || routine.start_time,
        title: routine.title,
        description: routine.description || "",
        completed: false,
        frequency: routine.frequency as Task['frequency'],
        category: routine.category as Task['category'],
        reminderTime: routine.reminder_time || undefined,
        createdAt: routine.created_at,
        repeat: parseRepeatConfig(routine.repeat_config),
        participants: parseParticipants(routine.participants || [])
      };

      setTasks(prev => [...prev, task]);
      setIsAddingTask(false);
      setNewTask({
        frequency: "daily",
        category: "work",
        reminderTime: 15,
        participants: []
      });

      toast({
        title: "Tarefa adicionada com sucesso!",
        description: `${task.title} foi adicionada à sua rotina.`,
      });

      updateProgress([...tasks, task]);
    } catch (error) {
      console.error('Erro ao adicionar tarefa:', error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar tarefa",
        description: "Não foi possível adicionar a tarefa. Tente novamente.",
      });
    }
  };

  const toggleTaskCompletion = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      // Usando uma abordagem direta com um patch simples
      const { error } = await supabase
        .from('daily_routines')
        .update({ completed: !task.completed })
        .eq('id', taskId);
          
      if (error) throw error;

      setTasks(prev => {
        const updatedTasks = prev.map(t => {
          if (t.id === taskId) {
            const newStatus = !t.completed;
            if (newStatus) {
              toast({
                title: "Tarefa concluída!",
                description: "Continue produtivo!",
              });
            }
            return { ...t, completed: newStatus };
          }
          return t;
        });

        updateProgress(updatedTasks);
        return updatedTasks;
      });
    } catch (error) {
      console.error('Erro ao atualizar tarefa:', error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar tarefa",
        description: "Não foi possível atualizar o status da tarefa.",
      });
    }
  };

  const handleReschedule = async (taskId: string) => {
    try {
      const task = tasks.find(t => t.id === taskId);
      if (!task) return;

      const newDate = format(addDays(selectedDate, 1), 'yyyy-MM-dd');
      
      // Usando uma abordagem direta com um patch simples
      const { error } = await supabase
        .from('daily_routines')
        .update({ scheduled_date: newDate })
        .eq('id', taskId);
          
      if (error) throw error;

      toast({
        title: "Tarefa reagendada",
        description: `${task.title} foi movida para amanhã.`,
      });

      setTasks(prev => prev.filter(t => t.id !== taskId));
      updateProgress(tasks.filter(t => t.id !== taskId));
    } catch (error) {
      console.error('Erro ao reagendar tarefa:', error);
      toast({
        variant: "destructive",
        title: "Erro ao reagendar tarefa",
        description: "Não foi possível reagendar a tarefa.",
      });
    }
  };

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = direction === 'prev' ? subDays(selectedDate, 1) : addDays(selectedDate, 1);
    setSelectedDate(newDate);
    toast({
      title: "Data atualizada",
      description: format(newDate, "dd 'de' MMMM", { locale: ptBR }),
    });
  };

  const formatTimeForDisplay = (time: string) => {
    if (!time) return '';
    return time.slice(0, 5); // Retorna apenas HH:mm
  };

  const getHourFromTimeString = (timeString: string): number => {
    const hour = parseInt(timeString.split(':')[0], 10);
    return hour;
  };

  // Verificar se uma tarefa deve ser exibida em um determinado horário
  const isTaskInHour = (task: Task, hour: number) => {
    const startHour = getHourFromTimeString(task.startTime);
    const endHour = task.endTime ? getHourFromTimeString(task.endTime) : startHour;
    
    return hour >= startHour && hour <= endHour;
  };

  // Verificar se o horário atual está entre as horas de início e fim da tarefa
  const isCurrentTimeInTask = (task: Task) => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const startHour = getHourFromTimeString(task.startTime);
    const startMinute = parseInt(task.startTime.split(':')[1], 10);
    
    const endHour = task.endTime ? getHourFromTimeString(task.endTime) : startHour;
    const endMinute = task.endTime ? parseInt(task.endTime.split(':')[1], 10) : startMinute + 30;
    
    const isAfterStart = (currentHour > startHour) || (currentHour === startHour && currentMinute >= startMinute);
    const isBeforeEnd = (currentHour < endHour) || (currentHour === endHour && currentMinute <= endMinute);
    
    return isToday(selectedDate) && isAfterStart && isBeforeEnd;
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto px-2 py-2">
      <div className="bg-gradient-to-br from-primary to-primary/60 rounded-3xl px-4 py-6 text-white shadow-lg">
        <div className="flex justify-between items-center mb-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold">Agenda Diária</h2>
            <p className="text-sm text-white/90">
              {format(selectedDate, "EEEE',' d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
          <Button
            onClick={() => setIsAddingTask(true)}
            variant="secondary"
            size="sm"
            className="rounded-full animate-pulse"
          >
            <Plus className="w-4 h-4 mr-1" /> 
            <span className="text-sm">Adicionar</span>
          </Button>
        </div>

        {/* Seletor de dia da semana */}
        <div className="flex items-center gap-1 mb-6">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigateDate('prev')}
            className="text-white hover:bg-white/20 h-8 w-8"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div 
            className="flex gap-1 flex-1 justify-between overflow-x-auto hide-scrollbar snap-x snap-mandatory"
            ref={scrollContainerRef}
          >
            {weekDays.map((day) => (
              <button
                key={day.dayOfMonth}
                onClick={() => setSelectedDate(day.date)}
                className={`
                  flex-1 min-w-[2.8rem] py-1.5 px-1 rounded-xl text-center transition-all duration-200
                  snap-center ${day.isSelected 
                    ? "bg-white text-primary shadow-lg transform scale-105" 
                    : day.isToday
                      ? "bg-white/20"
                      : "bg-white/10"
                  }
                `}
              >
                <div className="text-[0.65rem] font-medium mb-0.5 capitalize">{day.dayName}</div>
                <div className={`text-base font-bold ${day.isSelected ? "text-primary" : ""}`}>
                  {day.dayOfMonth}
                </div>
              </button>
            ))}
          </div>

          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigateDate('next')}
            className="text-white hover:bg-white/20 h-8 w-8"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between text-sm">
            <span>Progresso do dia</span>
            <span>{Math.round(dailyProgress)}%</span>
          </div>
          <Progress value={dailyProgress} className="h-1.5" />
        </div>
      </div>

      {/* Timeline e Tarefas */}
      <div className="bg-white rounded-3xl px-4 py-6 shadow-lg space-y-3">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-1">
            Sua Agenda
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoIcon className="w-4 h-4 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Visualize sua rotina diária</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </h3>
          <div className="flex gap-1">
            <Badge category="work" />
            <Badge category="health" />
            <Badge category="leisure" />
            <Badge category="study" />
            <Badge category="personal" />
          </div>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : tasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>Nenhuma tarefa para este dia</p>
            <p className="text-sm mt-2">Clique em adicionar para criar uma nova tarefa</p>
          </div>
        ) : (
          <div className="relative" ref={timelineRef}>
            {/* Linha do horário atual */}
            {isToday(selectedDate) && (
              <div className="absolute left-16 right-0 border-t-2 border-blue-500 z-10" style={{
                top: `${(new Date().getHours() * 60 + new Date().getMinutes()) / 1440 * 100}%`,
                width: 'calc(100% - 4rem)'
              }}>
                <div className="absolute -top-2 -left-1 bg-blue-500 text-white text-xs py-0.5 px-1.5 rounded-full">
                  {format(new Date(), 'HH:mm')}
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="space-y-4">
              {timeSlots.map((slot) => (
                <div 
                  key={slot.hour} 
                  className="flex items-start gap-4 relative" 
                  data-hour={slot.hour}
                >
                  <div className="w-12 text-sm text-gray-500 pt-2 flex-shrink-0">
                    {slot.label}
                  </div>
                  <div className="flex-1 min-h-[60px] border-t border-gray-200 pt-2 relative">
                    <div className="flex flex-col gap-2">
                      {tasks.filter(task => isTaskInHour(task, slot.hour)).map((task) => (
                        <div
                          key={`${task.id}-${slot.hour}`}
                          className={`relative group rounded-xl border-l-4 shadow-sm hover:shadow-md transition-all duration-300 
                            ${categoryColors[task.category]}
                            ${task.completed ? "opacity-70" : ""}
                            ${isCurrentTimeInTask(task) ? "ring-2 ring-blue-300 ring-offset-2" : ""}
                          `}
                        >
                          <div className="p-3">
                            <div className="flex items-start justify-between">
                              <div className="flex items-center gap-2">
                                <div
                                  onClick={() => toggleTaskCompletion(task.id)}
                                  className={`h-5 w-5 rounded-full flex items-center justify-center transition-all duration-300 cursor-pointer ${
                                    task.completed
                                      ? "bg-primary text-white"
                                      : "border-2 border-gray-300"
                                  }`}
                                >
                                  {task.completed && <Check className="h-3 w-3" />}
                                </div>
                                <div className="flex flex-col">
                                  <div className="flex items-center gap-2">
                                    <span className="text-xs font-medium text-gray-600">
                                      {formatTimeForDisplay(task.startTime)}
                                      {task.endTime && task.endTime !== task.startTime && 
                                        ` - ${formatTimeForDisplay(task.endTime)}`}
                                    </span>
                                    <span className="inline-flex items-center text-[0.65rem] px-1.5 py-0.5 rounded-full bg-gray-100 text-gray-700">
                                      {categoryIcons[task.category]}
                                      <span className="ml-1 hidden sm:inline">{task.category}</span>
                                    </span>
                                  </div>
                                  <h4 className={`font-medium text-sm truncate ${task.completed ? "line-through text-gray-500" : "text-gray-900"}`}>
                                    {task.title}
                                  </h4>
                                </div>
                              </div>
                              
                              <div className="flex gap-1">
                                {task.participants && task.participants.length > 0 && (
                                  <div className="flex -space-x-2">
                                    {task.participants.slice(0, 3).map((participant, idx) => (
                                      <Avatar key={idx} className="h-6 w-6 border-2 border-white">
                                        <AvatarFallback className="text-[10px]">
                                          {participant.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                      </Avatar>
                                    ))}
                                    {task.participants.length > 3 && (
                                      <div className="h-6 w-6 rounded-full bg-gray-200 flex items-center justify-center text-[10px] border-2 border-white">
                                        +{task.participants.length - 3}
                                      </div>
                                    )}
                                  </div>
                                )}
                                
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button 
                                      variant="ghost" 
                                      size="icon" 
                                      className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                                    >
                                      <MoreVertical className="h-4 w-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem onClick={() => setShowTaskDetails(task.id)}>
                                      Ver detalhes
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={() => handleReschedule(task.id)}>
                                      Reagendar
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            
                            {task.description && (
                              <div className="mt-1.5 text-xs text-gray-500 line-clamp-1">{task.description}</div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Diálogo para adicionar nova tarefa */}
      <Dialog open={isAddingTask} onOpenChange={setIsAddingTask}>
        <DialogContent className="sm:max-w-[425px] p-4 sm:p-6 overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">Adicionar à Agenda</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Select
                  value={newTask.category}
                  onValueChange={(value: "work" | "health" | "leisure" | "study" | "personal") =>
                    setNewTask({ ...newTask, category: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="work" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Briefcase className="h-4 w-4 text-blue-500" />
                        <span>Trabalho</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="health" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Heart className="h-4 w-4 text-green-500" />
                        <span>Saúde</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="leisure" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Sun className="h-4 w-4 text-yellow-500" />
                        <span>Lazer</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="study" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-purple-500" />
                        <span>Estudo</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="personal" className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <Coffee className="h-4 w-4 text-pink-500" />
                        <span>Pessoal</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Frequência</Label>
                <Select
                  value={newTask.frequency}
                  onValueChange={(value: "daily" | "weekly" | "monthly" | "once") =>
                    setNewTask({ ...newTask, frequency: value })
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">Diário</SelectItem>
                    <SelectItem value="weekly">Semanal</SelectItem>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="once">Uma vez</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="title">Título</Label>
              <Input
                id="title"
                value={newTask.title || ""}
                onChange={(e) =>
                  setNewTask({ ...newTask, title: e.target.value })
                }
                placeholder="Ex: Reunião de equipe"
                className="mt-1.5"
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea
                id="description"
                value={newTask.description || ""}
                onChange={(e) =>
                  setNewTask({ ...newTask, description: e.target.value })
                }
                placeholder="Adicione mais detalhes sobre esta atividade"
                className="mt-1.5 min-h-[80px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startTime">Hora Início</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={newTask.startTime || ""}
                  onChange={(e) =>
                    setNewTask({ ...newTask, startTime: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
              <div>
                <Label htmlFor="endTime">Hora Fim (opcional)</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={newTask.endTime || ""}
                  onChange={(e) =>
                    setNewTask({ ...newTask, endTime: e.target.value })
                  }
                  className="mt-1.5"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Lembrete</Label>
              <Select
                value={String(newTask.reminderTime)}
                onValueChange={(value) =>
                  setNewTask({ ...newTask, reminderTime: Number(value) })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 minutos antes</SelectItem>
                  <SelectItem value="15">15 minutos antes</SelectItem>
                  <SelectItem value="30">30 minutos antes</SelectItem>
                  <SelectItem value="60">1 hora antes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Participantes (opcional)</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {["Ana", "Carlos", "Patricia", "João"].map((name) => (
                  <div 
                    key={name}
                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs cursor-pointer transition-all
                      ${
                        newTask.participants?.includes(name) 
                          ? "bg-primary text-white" 
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }
                    `}
                    onClick={() => {
                      if (newTask.participants?.includes(name)) {
                        setNewTask({
                          ...newTask,
                          participants: newTask.participants.filter(p => p !== name)
                        });
                      } else {
                        setNewTask({
                          ...newTask,
                          participants: [...(newTask.participants || []), name]
                        });
                      }
                    }}
                  >
                    <Avatar className="h-4 w-4">
                      <AvatarFallback className="text-[8px]">
                        {name.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span>{name}</span>
                    {newTask.participants?.includes(name) && (
                      <Check className="h-3 w-3" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <Button 
              onClick={handleAddTask} 
              className="w-full mt-6 hover:scale-[1.02] transition-transform duration-200"
            >
              <Plus className="h-4 w-4 mr-2" />
              Adicionar à Agenda
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de detalhes da tarefa */}
      {showTaskDetails && (
        <Dialog open={!!showTaskDetails} onOpenChange={() => setShowTaskDetails(null)}>
          <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
            {(() => {
              const task = tasks.find(t => t.id === showTaskDetails);
              if (!task) return null;
              
              return (
                <>
                  <div className={`p-6 ${task.category === 'work' ? 'bg-blue-50' : 
                                          task.category === 'health' ? 'bg-green-50' : 
                                          task.category === 'leisure' ? 'bg-yellow-50' : 
                                          task.category === 'study' ? 'bg-purple-50' : 
                                          'bg-pink-50'}`}>
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="inline-flex items-center text-xs px-2 py-1 rounded-full bg-white bg-opacity-60 text-gray-700 mb-2">
                          {categoryIcons[task.category]}
                          <span className="ml-1">{task.category === 'work' ? 'Trabalho' : 
                                                 task.category === 'health' ? 'Saúde' : 
                                                 task.category === 'leisure' ? 'Lazer' : 
                                                 task.category === 'study' ? 'Estudo' : 
                                                 'Pessoal'}</span>
                        </span>
                        <h3 className="text-xl font-bold text-gray-900">{task.title}</h3>
                        <p className="text-sm text-gray-700 mt-1">
                          {formatTimeForDisplay(task.startTime)}
                          {task.endTime && task.endTime !== task.startTime && 
                            ` - ${formatTimeForDisplay(task.endTime)}`}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="icon"
                        className="rounded-full h-8 w-8 bg-white"
                        onClick={() => setShowTaskDetails(null)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  
                  <div className="p-6">
                    {task.description && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Descrição</h4>
                        <p className="text-sm text-gray-600">{task.description}</p>
                      </div>
                    )}
                    
                    {task.participants && task.participants.length > 0 && (
                      <div className="mb-6">
                        <h4 className="text-sm font-medium text-gray-700 mb-2">Participantes</h4>
                        <div className="flex flex-wrap gap-2">
                          {task.participants.map((participant, idx) => (
                            <div key={idx} className="inline-flex items-center gap-1.5 bg-gray-100 rounded-full px-3 py-1 text-sm">
                              <Avatar className="h-5 w-5">
                                <AvatarFallback className="text-[10px]">
                                  {participant.charAt(0).toUpperCase()}
                                </AvatarFallback>
                              </Avatar>
                              <span>{participant}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    <div className="flex justify-between">
                      <Button
                        variant="outline"
                        className="gap-2"
                        onClick={() => handleReschedule(task.id)}
                      >
                        <ArrowRight className="h-4 w-4" />
                        Reagendar
                      </Button>
                      
                      <Button
                        className={`gap-2 ${task.completed ? "bg-gray-200 text-gray-700" : "bg-primary text-white"}`}
                        onClick={() => {
                          toggleTaskCompletion(task.id);
                          setShowTaskDetails(null);
                        }}
                      >
                        <Check className="h-4 w-4" />
                        {task.completed ? "Desmarcar" : "Concluir"}
                      </Button>
                    </div>
                  </div>
                </>
              );
            })()}
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

// Componente de badge para as categorias
interface BadgeProps {
  category: "work" | "health" | "leisure" | "study" | "personal";
}

const Badge = ({ category }: BadgeProps) => {
  const colors = {
    work: "bg-blue-100 text-blue-700",
    health: "bg-green-100 text-green-700",
    leisure: "bg-yellow-100 text-yellow-700",
    study: "bg-purple-100 text-purple-700",
    personal: "bg-pink-100 text-pink-700"
  };
  
  const icons = {
    work: <Briefcase className="h-3 w-3" />,
    health: <Heart className="h-3 w-3" />,
    leisure: <Sun className="h-3 w-3" />,
    study: <BookOpen className="h-3 w-3" />,
    personal: <Coffee className="h-3 w-3" />
  };
  
  return (
    <div className={`inline-flex items-center text-[0.65rem] px-1.5 py-0.5 rounded-full ${colors[category]}`}>
      {icons[category]}
    </div>
  );
};

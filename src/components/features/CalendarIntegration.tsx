import { useState, useEffect } from "react";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Check, ChevronLeft, ChevronRight, MessageSquare, PartyPopper, Flag, Clock, Plus, Edit, Trash, LayoutDashboard, LayoutList, ChevronDown, ChevronUp } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format, addDays, subDays, addMonths, subMonths, isSameDay, isSameMonth, startOfMonth, endOfMonth, isToday, startOfWeek, endOfWeek, eachDayOfInterval, parseISO, getHours, setHours, setMinutes, addMinutes } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetFooter, SheetBody, SheetTrigger } from "@/components/ui/sheet";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  completed: boolean;
  area: "health" | "business" | "family" | "spirituality" | "finances";
  source: "google" | "apple" | "app";
}

// Interface para os eventos do banco de dados
interface TaskEvent {
  id: string;
  title: string;
  start_time: string | null;
  end_time?: string | null;
  scheduled_date: string;
  duration?: number | null;
  completed: boolean;
  type: string;
  location?: string | null;
  meeting_link?: string | null;
  color?: string | null;
  details?: string | null;
}

// Interface para os feriados
interface Holiday {
  title: string;
  date: string;
  description: string;
}

// Interface para o modal de ação rápida
interface QuickActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  eventId: string;
  title: string;
  onComplete: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

// Componente do modal de ação rápida
const QuickActionModal = ({
  isOpen,
  onClose,
  eventId,
  title,
  onComplete,
  onEdit,
  onDelete
}: QuickActionModalProps) => {
  return <Dialog open={isOpen} onOpenChange={open => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            Escolha uma ação para este evento
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-3 gap-4 py-4">
          <Button onClick={() => {
          onComplete(eventId);
          onClose();
        }} className="flex flex-col items-center justify-center h-20 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200" variant="outline">
            <Check className="h-6 w-6 mb-1" />
            <span className="text-xs">Concluir</span>
          </Button>
          <Button onClick={() => {
          onEdit(eventId);
          onClose();
        }} className="flex flex-col items-center justify-center h-20 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200" variant="outline">
            <Edit className="h-6 w-6 mb-1" />
            <span className="text-xs">Editar</span>
          </Button>
          <Button onClick={() => {
          onDelete(eventId);
          onClose();
        }} className="flex flex-col items-center justify-center h-20 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200" variant="outline">
            <Trash className="h-6 w-6 mb-1" />
            <span className="text-xs">Excluir</span>
          </Button>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>;
};
export const CalendarIntegration = () => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [taskEvents, setTaskEvents] = useState<TaskEvent[]>([]);
  const [holidays, setHolidays] = useState<Holiday[]>([]);
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isAppleConnected, setIsAppleConnected] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [visibleDays, setVisibleDays] = useState<Date[]>([]);
  const [activeTab, setActiveTab] = useState<"today">("today");
  const [isLoading, setIsLoading] = useState(false);
  const [compactView, setCompactView] = useState(false);
  const [isEditEventOpen, setIsEditEventOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<TaskEvent | null>(null);
  const [visibleHourRange, setVisibleHourRange] = useState({
    start: 5,
    end: 23
  });
  const [expandedHours, setExpandedHours] = useState(true);
  const [quickActionEvent, setQuickActionEvent] = useState<{
    id: string;
    title: string;
  } | null>(null);
  const [activeViewMode, setActiveViewMode] = useState<"day" | "week" | "month">("day");
  const {
    toast
  } = useToast();

  // Lista de feriados nacionais brasileiros para simulação
  const holidaysList: Holiday[] = [{
    title: "Ano Novo",
    date: "2024-01-01",
    description: "Feriado Nacional"
  }, {
    title: "Carnaval",
    date: "2024-02-13",
    description: "Ponto Facultativo"
  }, {
    title: "Sexta-feira Santa",
    date: "2024-03-29",
    description: "Feriado Nacional"
  }, {
    title: "Tiradentes",
    date: "2024-04-21",
    description: "Feriado Nacional"
  }, {
    title: "Dia do Trabalho",
    date: "2024-05-01",
    description: "Feriado Nacional"
  }, {
    title: "Corpus Christi",
    date: "2024-05-30",
    description: "Ponto Facultativo"
  }, {
    title: "Independência do Brasil",
    date: "2024-09-07",
    description: "Feriado Nacional"
  }, {
    title: "Nossa Senhora Aparecida",
    date: "2024-10-12",
    description: "Feriado Nacional"
  }, {
    title: "Finados",
    date: "2024-11-02",
    description: "Feriado Nacional"
  }, {
    title: "Proclamação da República",
    date: "2024-11-15",
    description: "Feriado Nacional"
  }, {
    title: "Natal",
    date: "2024-12-25",
    description: "Feriado Nacional"
  }];

  // Sincroniza os dias visíveis com o mês atual
  useEffect(() => {
    // Quando o mês muda, atualiza os dias visíveis para mostrar dias do mês atual
    calculateVisibleDays(currentMonth);
  }, [currentMonth]);

  // Busca eventos quando a data selecionada muda
  useEffect(() => {
    if (selectedDate) {
      fetchEvents();
      loadHolidays();
    }
  }, [selectedDate]);

  // Carrega feriados para o mês atual
  const loadHolidays = () => {
    if (!selectedDate) return;
    const currentYear = selectedDate.getFullYear();
    const currentMonth = selectedDate.getMonth() + 1; // Mês em JavaScript começa em 0

    // Converter datas de feriados para o ano atual
    const holidaysWithCurrentYear = holidaysList.map(holiday => {
      const holidayDate = new Date(holiday.date.replace(/\d{4}/, currentYear.toString()));
      return {
        ...holiday,
        date: format(holidayDate, 'yyyy-MM-dd')
      };
    });
    setHolidays(holidaysWithCurrentYear);
  };

  // Buscar eventos do banco de dados
  const fetchEvents = async () => {
    if (!selectedDate) return;
    setIsLoading(true);
    try {
      const {
        data: {
          user
        }
      } = await supabase.auth.getUser();
      if (!user) {
        setIsLoading(false);
        return;
      }
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');

      // Buscar tarefas para o dia selecionado
      const {
        data,
        error
      } = await supabase.from('tasks').select('*').eq('user_id', user.id).eq('scheduled_date', formattedDate).order('start_time', {
        ascending: true
      });
      if (error) {
        throw error;
      }
      if (data) {
        setTaskEvents(data);

        // Converter para o formato CalendarEvent
        const calendarEvents: CalendarEvent[] = data.map(task => {
          const taskDate = new Date(task.scheduled_date);
          let start = new Date(taskDate);
          let end = new Date(taskDate);

          // Se tiver horário de início, ajustar a data
          if (task.start_time) {
            const [hours, minutes] = task.start_time.split(':').map(Number);
            start.setHours(hours, minutes);

            // Calcular horário de término com base na duração
            if (task.duration) {
              const durationMinutes = task.duration;
              const endMinutes = minutes + durationMinutes;
              const endHours = hours + Math.floor(endMinutes / 60);
              end.setHours(endHours, endMinutes % 60);
            } else {
              // Se não tiver duração, assume 1 hora
              end.setHours(hours + 1, minutes);
            }
          }
          return {
            id: task.id,
            title: task.title,
            start,
            end,
            completed: task.completed,
            area: "business" as "health" | "business" | "family" | "spirituality" | "finances",
            source: "app" as "google" | "apple" | "app"
          };
        });
        setEvents(calendarEvents);
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
  };

  // Calcula os dias visíveis baseados no mês atual
  const calculateVisibleDays = (date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);

    // Se o selectedDate está no mês atual, centraliza os dias visíveis nele
    // Caso contrário, começa do início do mês
    const startDay = isSameMonth(selectedDate || new Date(), date) ? selectedDate || monthStart : monthStart;

    // Gera 5 dias a partir do dia selecionado ou início do mês
    const newVisibleDays = Array.from({
      length: 5
    }, (_, i) => addDays(startDay, i));

    // Verifica se todos os dias estão dentro do mês atual
    // Se não estiverem, ajusta para mostrar os primeiros 5 dias do mês
    if (!newVisibleDays.every(day => isSameMonth(day, date))) {
      setVisibleDays(Array.from({
        length: 5
      }, (_, i) => addDays(monthStart, i)));
    } else {
      setVisibleDays(newVisibleDays);
    }
  };
  const handleGoogleAuth = async () => {
    try {
      // Simulação da autenticação do Google Calendar
      setIsGoogleConnected(true);
      toast({
        title: "Google Calendar conectado",
        description: "Seus eventos serão sincronizados automaticamente."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na conexão",
        description: "Não foi possível conectar ao Google Calendar."
      });
    }
  };
  const handleAppleAuth = async () => {
    try {
      // Simulação da autenticação do Apple Calendar
      setIsAppleConnected(true);
      toast({
        title: "Apple Calendar conectado",
        description: "Seus eventos serão sincronizados automaticamente."
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erro na conexão",
        description: "Não foi possível conectar ao Apple Calendar."
      });
    }
  };
  const handleEventComplete = (eventId: string) => {
    setTaskEvents(prev => prev.map(event => event.id === eventId ? {
      ...event,
      completed: !event.completed
    } : event));

    // Atualizar no banco de dados
    updateEventCompletionStatus(eventId);
  };
  const updateEventCompletionStatus = async (eventId: string) => {
    try {
      const taskToUpdate = taskEvents.find(task => task.id === eventId);
      if (!taskToUpdate) return;
      const {
        error
      } = await supabase.from('tasks').update({
        completed: !taskToUpdate.completed
      }).eq('id', eventId);
      if (error) throw error;
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
  };
  const handleDeleteEvent = async (eventId: string) => {
    try {
      const {
        error
      } = await supabase.from('tasks').delete().eq('id', eventId);
      if (error) throw error;

      // Remover o evento da lista local
      setTaskEvents(prev => prev.filter(event => event.id !== eventId));
      toast({
        title: "Evento excluído",
        description: "O evento foi excluído com sucesso."
      });
    } catch (error) {
      console.error("Erro ao excluir evento:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Falha ao excluir o evento."
      });
    }
  };
  const handleEditEvent = (eventId: string) => {
    const event = taskEvents.find(e => e.id === eventId);
    if (event) {
      setSelectedEvent(event);
      setIsEditEventOpen(true);
    }
  };
  const handleQuickAction = (eventId: string, title: string) => {
    setQuickActionEvent({
      id: eventId,
      title
    });
  };
  const closeQuickAction = () => {
    setQuickActionEvent(null);
  };
  const previousMonth = () => {
    setCurrentMonth(prev => subMonths(prev, 1));
  };
  const nextMonth = () => {
    setCurrentMonth(prev => addMonths(prev, 1));
  };
  const previousDaysList = () => {
    if (visibleDays.length > 0) {
      const firstDay = visibleDays[0];
      const newFirstDay = subDays(firstDay, 5);

      // Verifica se o novo primeiro dia está no mesmo mês
      if (!isSameMonth(newFirstDay, currentMonth)) {
        // Se não estiver, atualiza o mês corrente também
        setCurrentMonth(newFirstDay);
      }
      const newDays = Array.from({
        length: 5
      }, (_, i) => addDays(newFirstDay, i));
      setVisibleDays(newDays);
    }
  };
  const nextDaysList = () => {
    if (visibleDays.length > 0) {
      const lastDay = visibleDays[visibleDays.length - 1];
      const newFirstDay = addDays(lastDay, 1);

      // Verifica se o novo primeiro dia está no mesmo mês
      if (!isSameMonth(newFirstDay, currentMonth)) {
        // Se não estiver, atualiza o mês corrente também
        setCurrentMonth(newFirstDay);
      }
      const newDays = Array.from({
        length: 5
      }, (_, i) => addDays(newFirstDay, i));
      setVisibleDays(newDays);
    }
  };
  const formatMonthYear = (date: Date) => {
    return format(date, "MMMM, yyyy", {
      locale: ptBR
    });
  };
  const formatWeekdayAndDay = (date: Date) => {
    const weekday = format(date, "EEEE", {
      locale: ptBR
    });
    const day = format(date, "dd");
    return {
      weekday,
      day
    };
  };
  const selectDay = (day: Date) => {
    setSelectedDate(day);

    // Se o dia selecionado não estiver no mês atual, também atualiza o mês
    if (!isSameMonth(day, currentMonth)) {
      setCurrentMonth(day);
    }
  };
  const getHolidaysForDate = (date: Date): TaskEvent[] => {
    const formattedDate = format(date, 'yyyy-MM-dd');

    // Filtra feriados para a data especificada
    const holidaysForDate = holidays.filter(holiday => holiday.date === formattedDate);

    // Converte feriados para o formato TaskEvent
    return holidaysForDate.map(holiday => ({
      id: `holiday-${holiday.title}`,
      title: holiday.title,
      start_time: null,
      scheduled_date: holiday.date,
      completed: false,
      type: "holiday",
      location: holiday.description,
      color: "#FF4500" // Cor laranja para feriados
    }));
  };
  const getFilteredEvents = () => {
    // Mostrar todos os tipos de eventos para o dia selecionado
    const todayDate = new Date();
    const formattedToday = format(todayDate, 'yyyy-MM-dd');
    if (isLoading) {
      return []; // Retorna uma lista vazia enquanto carrega
    }

    // Obter feriados para a data selecionada
    const holidaysForSelectedDate = getHolidaysForDate(selectedDate || todayDate);

    // Combinar todos os eventos
    return [...taskEvents, ...holidaysForSelectedDate];
  };
  const renderEventTypeIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case "event":
        return <PartyPopper className="h-4 w-4 text-purple-500" />;
      case "holiday":
        return <Flag className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };
  const getWeekDays = () => {
    if (!selectedDate) return [];
    const startDay = startOfWeek(selectedDate, {
      weekStartsOn: 0
    });
    const endDay = endOfWeek(selectedDate, {
      weekStartsOn: 0
    });
    return eachDayOfInterval({
      start: startDay,
      end: endDay
    });
  };
  const getTypeBackground = (type: string, completed: boolean) => {
    if (completed) {
      return "bg-gray-100 border-gray-300 text-gray-500";
    }
    switch (type) {
      case "meeting":
        return "bg-blue-50 border-blue-200 text-blue-700";
      case "event":
        return "bg-purple-50 border-purple-200 text-purple-700";
      case "holiday":
        return "bg-red-50 border-red-200 text-red-700";
      case "task":
        return "bg-amber-50 border-amber-200 text-amber-700";
      case "habit":
        return "bg-green-50 border-green-200 text-green-700";
      default:
        return "bg-gray-50 border-gray-200 text-gray-700";
    }
  };
  const getTypeColor = (type: string, completed: boolean) => {
    if (completed) {
      return "text-gray-400";
    }
    switch (type) {
      case "meeting":
        return "text-blue-600";
      case "event":
        return "text-purple-600";
      case "holiday":
        return "text-red-600";
      case "task":
        return "text-amber-600";
      case "habit":
        return "text-green-600";
      default:
        return "text-gray-600";
    }
  };
  const renderMonthView = () => {
    if (!selectedDate) return null;
    const monthStart = startOfMonth(selectedDate);
    const monthEnd = endOfMonth(selectedDate);
    const startDate = startOfWeek(monthStart, {
      weekStartsOn: 0
    });
    const endDate = endOfWeek(monthEnd, {
      weekStartsOn: 0
    });
    const days = eachDayOfInterval({
      start: startDate,
      end: endDate
    });

    // Agrupar dias em semanas
    const weeks: Date[][] = [];
    let currentWeek: Date[] = [];
    days.forEach(day => {
      currentWeek.push(day);
      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    });
    return <div className="bg-white rounded-lg shadow">
        {/* Cabeçalho dos dias da semana */}
        <div className="grid grid-cols-7 text-center border-b border-gray-200">
          {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => <div key={day} className="py-2 text-xs font-medium text-gray-500">
              {day}
            </div>)}
        </div>
        
        {/* Dias do mês */}
        <div className="divide-y divide-gray-100">
          {weeks.map((week, weekIndex) => <div key={weekIndex} className="grid grid-cols-7 divide-x divide-gray-100">
              {week.map(day => {
            const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
            const isCurrentMonth = isSameMonth(day, selectedDate || new Date());
            const isDayToday = isToday(day);

            // Encontrar eventos para este dia
            const dayStr = format(day, 'yyyy-MM-dd');
            const dayEvents = taskEvents.filter(event => event.scheduled_date === dayStr);
            return <div key={dayStr} onClick={() => selectDay(day)} className={cn("min-h-[80px] p-1 cursor-pointer", !isCurrentMonth && "bg-gray-50 text-gray-400", isSelected && "bg-blue-50", isDayToday && "font-bold")}>
                    <div className={cn("text-right mb-1 text-xs", isDayToday && "text-blue-600 font-bold")}>
                      {format(day, 'd')}
                    </div>
                    
                    <div className="space-y-1 overflow-y-auto max-h-[66px]">
                      {dayEvents.slice(0, compactView ? 1 : 3).map(event => <div key={event.id} className={cn("text-xs p-1 rounded truncate", getTypeBackground(event.type, event.completed))} title={event.title} onClick={e => {
                  e.stopPropagation();
                  handleQuickAction(event.id, event.title);
                }}>
                          {event.start_time && `${event.start_time.substring(0, 5)} `}{event.title}
                        </div>)}
                      {dayEvents.length > (compactView ? 1 : 3) && <div className="text-xs text-gray-500 text-center">
                          +{dayEvents.length - (compactView ? 1 : 3)} mais
                        </div>}
                    </div>
                  </div>;
          })}
            </div>)}
        </div>
      </div>;
  };
  const renderWeekView = () => {
    if (!selectedDate) return null;
    const weekDays = getWeekDays();
    const allDayEvents: Record<string, TaskEvent[]> = {};
    const timeEvents: Record<string, TaskEvent[]> = {};

    // Organizar eventos por dia
    weekDays.forEach(day => {
      const dayStr = format(day, 'yyyy-MM-dd');
      const dayEvents = taskEvents.filter(event => event.scheduled_date === dayStr);

      // Separar eventos de dia inteiro dos eventos com horário
      allDayEvents[dayStr] = dayEvents.filter(event => !event.start_time);
      timeEvents[dayStr] = dayEvents.filter(event => event.start_time);
    });
    return <div className="bg-white rounded-lg shadow">
        {/* Cabeçalho com dias da semana */}
        <div className="grid grid-cols-8 border-b border-gray-200">
          <div className="p-2 text-center text-xs font-medium text-gray-500 border-r border-gray-200">
            Horário
          </div>
          {weekDays.map(day => {
          const isDayToday = isToday(day);
          return <div key={format(day, 'yyyy-MM-dd')} className={cn("p-2 text-center", isDayToday && "bg-blue-50")} onClick={() => selectDay(day)}>
                <div className="text-xs font-medium text-gray-700">
                  {format(day, 'EEE', {
                locale: ptBR
              })}
                </div>
                <div className={cn("text-sm font-bold", isDayToday && "text-blue-600")}>
                  {format(day, 'd')}
                </div>
              </div>;
        })}
        </div>
        
        {/* Grade de horários */}
        <div className="overflow-y-auto max-h-[500px]">
          {/* Eventos de dia inteiro */}
          {Object.values(allDayEvents).some(events => events.length > 0) && <div className="grid grid-cols-8 border-b border-gray-200">
              <div className="p-2 text-xs font-medium text-gray-500 border-r border-gray-200">
                Dia todo
              </div>
              {weekDays.map(day => {
            const dayStr = format(day, 'yyyy-MM-dd');
            const events = allDayEvents[dayStr] || [];
            return <div key={dayStr} className="p-1 min-h-[40px]">
                    {events.map(event => <div key={event.id} className={cn("text-xs p-1 mb-1 rounded truncate", getTypeBackground(event.type, event.completed))} title={event.title} onClick={() => handleQuickAction(event.id, event.title)}>
                        {event.title}
                      </div>)}
                  </div>;
          })}
            </div>}
          
          {/* Horários */}
          {Array.from({
          length: visibleHourRange.end - visibleHourRange.start + 1
        }).map((_, index) => {
          const hour = visibleHourRange.start + index;
          return <div key={hour} className="grid grid-cols-8 border-b border-gray-200 min-h-[60px]">
                <div className="p-2 text-xs font-medium text-gray-500 border-r border-gray-200 text-right">
                  {hour}:00
                </div>
                
                {weekDays.map(day => {
              const dayStr = format(day, 'yyyy-MM-dd');
              const hourEvents = (timeEvents[dayStr] || []).filter(event => {
                if (!event.start_time) return false;
                const eventHour = parseInt(event.start_time.split(':')[0]);
                return eventHour === hour;
              });
              return <div key={`${dayStr}-${hour}`} className="p-1 relative">
                      {hourEvents.map(event => <div key={event.id} className={cn("text-xs p-2 mb-1 rounded relative", compactView ? "truncate" : "", getTypeBackground(event.type, event.completed))} onClick={() => handleQuickAction(event.id, event.title)}>
                          <div className={cn("font-medium", event.completed && "line-through text-gray-500")}>
                            {event.start_time?.substring(0, 5)} {event.title}
                          </div>
                          {!compactView && event.details && <div className="text-xs text-gray-600 mt-1">{event.details}</div>}
                        </div>)}
                    </div>;
            })}
              </div>;
        })}
        </div>
      </div>;
  };
  const renderDayView = () => {
    if (!selectedDate) return null;
    const filteredEvents = getFilteredEvents();

    // Gerar horas visíveis
    const visibleHours = Array.from({
      length: visibleHourRange.end - visibleHourRange.start + 1
    }, (_, i) => visibleHourRange.start + i);
    return <div className="bg-white rounded-lg shadow overflow-hidden">
        
        
        <div className="overflow-y-auto max-h-[500px]">
          {visibleHours.map(hour => {
          // Filtrar eventos para esta hora
          const hourEvents = filteredEvents.filter(event => {
            if (!event.start_time) return false;
            const eventHour = parseInt(event.start_time.split(':')[0]);
            return eventHour === hour;
          });
          return <div key={hour} className="flex border-b border-gray-100">
                
                
                
              </div>;
        })}
        </div>
      </div>;
  };
  const handleAddEvent = () => {
    toast({
      title: "Adicionar evento",
      description: "Esta funcionalidade será implementada em breve."
    });
  };
  return <div className="space-y-4">
      
      
      <Tabs value={activeViewMode} onValueChange={value => setActiveViewMode(value as "day" | "week" | "month")}>
        <TabsContent value="day" className="mt-2">
          {renderDayView()}
        </TabsContent>
        
        <TabsContent value="week" className="mt-2">
          {renderWeekView()}
        </TabsContent>
        
        <TabsContent value="month" className="mt-2">
          {renderMonthView()}
        </TabsContent>
      </Tabs>
      
      {/* Botão de adicionar evento (único) */}
      <div className="fixed bottom-20 right-5">
        <Popover>
          <PopoverTrigger asChild>
            
          </PopoverTrigger>
          <PopoverContent className="w-56 p-2" align="end">
            <div className="grid gap-2">
              <Button variant="outline" className="justify-start font-normal" onClick={handleAddEvent}>
                <Clock className="mr-2 h-4 w-4" />
                <span>Tarefa</span>
              </Button>
              <Button variant="outline" className="justify-start font-normal" onClick={handleAddEvent}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                <span>Evento</span>
              </Button>
              <Button variant="outline" className="justify-start font-normal" onClick={handleAddEvent}>
                <MessageSquare className="mr-2 h-4 w-4" />
                <span>Reunião</span>
              </Button>
              <Button variant="outline" className="justify-start font-normal" onClick={handleAddEvent}>
                <Clock className="mr-2 h-4 w-4" />
                <span>Hábito</span>
              </Button>
              <Button variant="outline" className="justify-start font-normal" onClick={handleAddEvent}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Nota Rápida</span>
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Modal de ações rápidas */}
      {quickActionEvent && <QuickActionModal isOpen={!!quickActionEvent} onClose={closeQuickAction} eventId={quickActionEvent.id} title={quickActionEvent.title} onComplete={handleEventComplete} onEdit={handleEditEvent} onDelete={handleDeleteEvent} />}
    </div>;
};
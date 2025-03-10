import { useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter, DialogBody } from "@/components/ui/dialog";
import { TodoItem } from "@/types/today";
import { CalendarDays, Clock, CalendarRange, MapPin, Bell, Timer, CheckCircle2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { Switch } from "@/components/ui/switch";

interface TaskEditFormProps {
  item: TodoItem;
  onSave: (updatedItem: TodoItem) => void;
  onCancel: () => void;
}

export function TaskEditForm({ item, onSave, onCancel }: TaskEditFormProps) {
  const [title, setTitle] = useState(item.title);
  const [details, setDetails] = useState(item.details || "");
  const [date, setDate] = useState<Date>(item.scheduled_date ? new Date(item.scheduled_date) : new Date());
  const [time, setTime] = useState<string>(item.start_time || "");
  const [frequency, setFrequency] = useState<string>(item.frequency || "once");
  const [location, setLocation] = useState<string | undefined>(item.location);
  const [notificationTime, setNotificationTime] = useState<string>(item.notification_time || "at_time");
  // Use a state for duration as string, default to '30min' if not provided
  const [duration, setDuration] = useState<string>(
    typeof item.duration === 'string' ? item.duration : '30min'
  );
  const [color, setColor] = useState<string>(item.color || "#4285F4");
  const [subtasks, setSubtasks] = useState<string[]>(item.subtasks || []);
  const [newSubtask, setNewSubtask] = useState("");
  // Added state for inbox_only flag
  const [inboxOnly, setInboxOnly] = useState<boolean>(item.inbox_only === true);
  // Adicionar state para o tipo de tarefa
  const [taskType, setTaskType] = useState<string>(item.type || 'task');
  
  const handleSave = useCallback(() => {
    try {
      // Format the date for storing in database
      const formattedDate = format(date, "yyyy-MM-dd");
      
      // Crie uma cópia do item original para evitar problemas de referência
      const updatedItem = {
        ...item,
        title,
        details,
        type: taskType, // Usar o tipo selecionado pelo usuário
        itemType: 'task' as 'task', // Garantir que itemType sempre tenha um valor com o tipo correto
        start_time: time,
        location,
        frequency,
        notification_time: notificationTime,
        duration, // Keep as string
        color,
        subtasks,
        inbox_only: inboxOnly, // Include inbox_only flag
        scheduled: !inboxOnly // Adicionar scheduled flag
      };
      
      // Apenas definir scheduled_date se não for inbox_only
      if (!inboxOnly) {
        updatedItem.scheduled_date = formattedDate;
        // Remover reference_date se existir
        if ('reference_date' in updatedItem) {
          delete updatedItem.reference_date;
        }
      } else {
        // Para tarefas na inbox, não definimos scheduled_date
        updatedItem.scheduled_date = null;
        // Mas podemos manter uma referência à data
        updatedItem.reference_date = formattedDate;
      }
      
      console.log("Salvando tarefa atualizada:", updatedItem);
      onSave(updatedItem);
    } catch (error) {
      console.error("Erro ao salvar tarefa:", error);
      // Poderia adicionar um toast aqui para informar o usuário sobre o erro
    }
  }, [
    title, 
    details, 
    date, 
    time, 
    location, 
    frequency, 
    notificationTime, 
    duration, 
    color, 
    subtasks, 
    inboxOnly, 
    taskType, // Adicionamos taskType na lista de dependências
    item, 
    onSave
  ]);
  
  const addSubtask = useCallback(() => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()]);
      setNewSubtask("");
    }
  }, [newSubtask, subtasks, setSubtasks, setNewSubtask]);
  
  const removeSubtask = useCallback((index: number) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks.splice(index, 1);
    setSubtasks(updatedSubtasks);
  }, [subtasks, setSubtasks]);
  
  return (
    <>
      <DialogBody className="space-y-3 sm:space-y-4 px-3 sm:px-6 py-3 sm:py-4">
        {/* Tipo de tarefa */}
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="taskType" className="text-xs sm:text-sm">Tipo</Label>
          <Select value={taskType} onValueChange={setTaskType}>
            <SelectTrigger id="taskType" className="w-full bg-white border-gray-300">
              <SelectValue placeholder="Selecione o tipo" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="task">
                <div className="flex items-center py-1">
                  <CheckCircle2 className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Tarefa</span>
                </div>
              </SelectItem>
              <SelectItem value="meeting">
                <div className="flex items-center py-1">
                  <Bell className="h-4 w-4 mr-2 text-green-600" />
                  <span>Reunião</span>
                </div>
              </SelectItem>
              <SelectItem value="event">
                <div className="flex items-center py-1">
                  <CalendarRange className="h-4 w-4 mr-2 text-purple-600" />
                  <span>Evento</span>
                </div>
              </SelectItem>
              <SelectItem value="habit">
                <div className="flex items-center py-1">
                  <Clock className="h-4 w-4 mr-2 text-amber-600" />
                  <span>Hábito</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="title" className="text-xs sm:text-sm">Título da Tarefa</Label>
          <Input 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full border-gray-300"
            placeholder="Digite o título da tarefa"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="space-y-1 sm:space-y-2">
            <Label className="text-xs sm:text-sm">Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-gray-300"
                >
                  <CalendarDays className="mr-2 h-4 w-4" />
                  {format(date, "dd/MM/yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 z-50" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="time" className="text-xs sm:text-sm">Horário</Label>
            <Input 
              id="time" 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              className="w-full border-gray-300"
            />
          </div>
        </div>
        
        <div className="grid grid-cols-2 gap-2 sm:gap-4">
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="frequency" className="text-xs sm:text-sm">Frequência</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency" className="w-full bg-white border-gray-300">
                <SelectValue placeholder="Selecione a frequência" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="once">
                  <div className="flex items-center py-1">
                    <CalendarDays className="h-4 w-4 mr-2 text-blue-600" />
                    <span>Uma vez</span>
                  </div>
                </SelectItem>
                <SelectItem value="daily">
                  <div className="flex items-center py-1">
                    <CalendarRange className="h-4 w-4 mr-2 text-green-600" />
                    <span>Diário</span>
                  </div>
                </SelectItem>
                <SelectItem value="weekly">
                  <div className="flex items-center py-1">
                    <CalendarRange className="h-4 w-4 mr-2 text-purple-600" />
                    <span>Semanal</span>
                  </div>
                </SelectItem>
                <SelectItem value="monthly">
                  <div className="flex items-center py-1">
                    <CalendarRange className="h-4 w-4 mr-2 text-amber-600" />
                    <span>Mensal</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-1 sm:space-y-2">
            <Label htmlFor="duration" className="text-xs sm:text-sm">Duração</Label>
            <Select value={duration} onValueChange={setDuration}>
              <SelectTrigger id="duration" className="w-full bg-white border-gray-300">
                <SelectValue placeholder="Selecione a duração" />
              </SelectTrigger>
              <SelectContent className="bg-white">
                <SelectItem value="5min">
                  <div className="flex items-center py-1">
                    <Timer className="h-4 w-4 mr-2 text-purple-600" />
                    <span>5 minutos</span>
                  </div>
                </SelectItem>
                <SelectItem value="15min">
                  <div className="flex items-center py-1">
                    <Timer className="h-4 w-4 mr-2 text-purple-600" />
                    <span>15 minutos</span>
                  </div>
                </SelectItem>
                <SelectItem value="30min">
                  <div className="flex items-center py-1">
                    <Timer className="h-4 w-4 mr-2 text-blue-600" />
                    <span>30 minutos</span>
                  </div>
                </SelectItem>
                <SelectItem value="45min">
                  <div className="flex items-center py-1">
                    <Timer className="h-4 w-4 mr-2 text-blue-600" />
                    <span>45 minutos</span>
                  </div>
                </SelectItem>
                <SelectItem value="1h">
                  <div className="flex items-center py-1">
                    <Timer className="h-4 w-4 mr-2 text-green-600" />
                    <span>1 hora</span>
                  </div>
                </SelectItem>
                <SelectItem value="1h30">
                  <div className="flex items-center py-1">
                    <Timer className="h-4 w-4 mr-2 text-green-600" />
                    <span>1 hora e 30 minutos</span>
                  </div>
                </SelectItem>
                <SelectItem value="2h">
                  <div className="flex items-center py-1">
                    <Timer className="h-4 w-4 mr-2 text-amber-600" />
                    <span>2 horas</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="location" className="text-xs sm:text-sm">Local ou Link da Reunião</Label>
          <div className="flex relative">
            <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">
              <MapPin className="h-4 w-4" />
            </span>
            <Input 
              id="location" 
              value={location || ""} 
              onChange={(e) => setLocation(e.target.value)} 
              className="w-full pl-8 border-gray-300"
              placeholder="Local da atividade ou link da reunião"
            />
          </div>
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="notification" className="text-xs sm:text-sm">Lembrete</Label>
          <Select value={notificationTime} onValueChange={setNotificationTime}>
            <SelectTrigger id="notification" className="w-full bg-white border-gray-300">
              <SelectValue placeholder="Selecione o lembrete" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="none">
                <div className="flex items-center py-1">
                  <Bell className="h-4 w-4 mr-2 text-gray-600" />
                  <span>Sem lembrete</span>
                </div>
              </SelectItem>
              <SelectItem value="at_time">
                <div className="flex items-center py-1">
                  <Bell className="h-4 w-4 mr-2 text-gray-600" />
                  <span>No horário da tarefa</span>
                </div>
              </SelectItem>
              <SelectItem value="5_min_before">
                <div className="flex items-center py-1">
                  <Bell className="h-4 w-4 mr-2 text-amber-600" />
                  <span>5 minutos antes</span>
                </div>
              </SelectItem>
              <SelectItem value="15_min_before">
                <div className="flex items-center py-1">
                  <Bell className="h-4 w-4 mr-2 text-blue-600" />
                  <span>15 minutos antes</span>
                </div>
              </SelectItem>
              <SelectItem value="30_min_before">
                <div className="flex items-center py-1">
                  <Bell className="h-4 w-4 mr-2 text-purple-600" />
                  <span>30 minutos antes</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Add option to send task to planner */}
        <div className="space-y-1 sm:space-y-2 bg-gray-50 p-2 sm:p-3 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <Label htmlFor="confirm-planner" className="flex items-center gap-1.5 sm:gap-2 cursor-pointer text-xs sm:text-sm">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-green-600" />
              <span>Enviar para o Planner</span>
            </Label>
            <Switch 
              id="confirm-planner" 
              checked={!inboxOnly} 
              onCheckedChange={(checked) => setInboxOnly(!checked)}
            />
          </div>
          <p className="text-xs text-gray-500">
            {inboxOnly 
              ? "A tarefa permanecerá apenas na Inbox até ser confirmada para o Planner." 
              : "A tarefa será exibida no Planner e, se recorrente, gerará automaticamente repetições nos próximos períodos."}
          </p>
        </div>
        
        {/* Subtasks */}
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="subtasks" className="text-xs sm:text-sm">Subtarefas</Label>
          <div className="flex gap-2">
            <Input 
              id="newSubtask" 
              value={newSubtask} 
              onChange={(e) => setNewSubtask(e.target.value)} 
              className="flex-1 border-gray-300"
              placeholder="Adicionar subtarefa"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addSubtask();
                }
              }}
            />
            <Button type="button" variant="outline" onClick={addSubtask} className="border-gray-300">
              Adicionar
            </Button>
          </div>
          
          {subtasks.length > 0 && (
            <div className="mt-2 space-y-2">
              {subtasks.map((subtask, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <span className="text-sm">{subtask}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => removeSubtask(index)}
                    className="text-red-500 hover:text-red-700 hover:bg-red-50 h-8 w-8 p-0"
                  >
                    &times;
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <Label className="text-xs sm:text-sm">Cor da Tarefa</Label>
          <div className="flex justify-between py-2 bg-white p-2 rounded-md border border-gray-200">
            {['#EA4335', '#FBBC04', '#34A853', '#4285F4', '#9b87f5', '#FF6D01'].map(colorOption => (
              <div 
                key={colorOption} 
                className="flex flex-col items-center gap-1 cursor-pointer"
                onClick={() => setColor(colorOption)}
              >
                <div 
                  className={`w-8 h-8 rounded-full transition-all duration-200 shadow-sm ${color === colorOption ? "ring-2 ring-offset-2 ring-purple-500" : ""}`} 
                  style={{ backgroundColor: colorOption }}
                />
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-1 sm:space-y-2">
          <Label htmlFor="details" className="text-xs sm:text-sm">Detalhes</Label>
          <Textarea 
            id="details" 
            value={details} 
            onChange={(e) => setDetails(e.target.value)} 
            className="w-full resize-none border-gray-300"
            placeholder="Adicione mais detalhes sobre esta tarefa"
            rows={3}
          />
        </div>
      </DialogBody>
      
      <DialogFooter className="bg-gray-50 p-3 sm:p-4 border-t border-gray-100 sticky bottom-0 z-10">
        <div className="flex gap-3 w-full">
          <Button variant="outline" onClick={onCancel} className="flex-1 border-gray-300">
            Cancelar
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!title.trim()}
            className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600"
          >
            Salvar Alterações
          </Button>
        </div>
      </DialogFooter>
    </>
  );
}

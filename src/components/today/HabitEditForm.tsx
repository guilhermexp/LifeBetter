
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DialogFooter, DialogBody } from "@/components/ui/dialog";
import { TodoItem } from "@/types/today";
import { CalendarDays, Clock, Repeat, Activity, Heart, Timer, Bell, CheckCircle2 } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { HabitFrequency } from "@/types/habits";
import { Switch } from "@/components/ui/switch";

interface HabitEditFormProps {
  item: TodoItem;
  onSave: (updatedItem: TodoItem) => void;
  onCancel: () => void;
}

export function HabitEditForm({ item, onSave, onCancel }: HabitEditFormProps) {
  const [title, setTitle] = useState(item.title);
  const [details, setDetails] = useState(item.details || item.description || "");
  const [date, setDate] = useState<Date>(new Date(item.scheduled_date));
  const [time, setTime] = useState<string>(item.start_time || "08:00");
  const [frequency, setFrequency] = useState<HabitFrequency>(
    (item.frequency || item.category || "daily") as HabitFrequency
  );
  const [color, setColor] = useState<string>(item.color || "#9b87f5");
  const [durationDays, setDurationDays] = useState<number>(item.duration_days || 21);
  const [notificationTime, setNotificationTime] = useState<string>(item.notification_time || "at_time");
  // Use a state for duration as string, default to '15min' if not provided
  const [duration, setDuration] = useState<string>(
    typeof item.duration === 'string' ? item.duration : '15min'
  );
  // Added state for inbox_only flag
  const [inboxOnly, setInboxOnly] = useState<boolean>(item.inbox_only === true);
  
  const handleSave = () => {
    // Format the date for storing in database
    const formattedDate = format(date, "yyyy-MM-dd");
    
    const updatedItem: TodoItem = {
      ...item,
      title,
      details,
      description: details,
      category: frequency,
      frequency,
      scheduled_date: formattedDate,
      start_time: time,
      duration_days: durationDays,
      notification_time: notificationTime,
      duration, // Keep as string
      color,
      inbox_only: inboxOnly // Include inbox_only flag
    };
    onSave(updatedItem);
  };

  return (
    <>
      <DialogBody className="space-y-4 px-6 py-4">
        <div className="space-y-2">
          <Label htmlFor="title">Nome do Hábito</Label>
          <Input 
            id="title" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            className="w-full border-gray-300"
            placeholder="Digite o nome do hábito"
          />
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Data de Início</Label>
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
          
          <div className="space-y-2">
            <Label htmlFor="time">Horário</Label>
            <Input 
              id="time" 
              type="time" 
              value={time} 
              onChange={(e) => setTime(e.target.value)} 
              className="w-full border-gray-300"
            />
          </div>
        </div>
        
        {/* Adicionando campo de duração */}
        <div className="space-y-2">
          <Label htmlFor="duration">Duração da Atividade</Label>
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
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="frequency">Frequência</Label>
          <Select value={frequency} onValueChange={(value) => setFrequency(value as HabitFrequency)}>
            <SelectTrigger id="frequency" className="w-full bg-white border-gray-300">
              <SelectValue placeholder="Selecione a frequência" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="daily">
                <div className="flex items-center py-1">
                  <Repeat className="h-4 w-4 mr-2 text-blue-600" />
                  <span>Diário</span>
                </div>
              </SelectItem>
              <SelectItem value="weekly">
                <div className="flex items-center py-1">
                  <Repeat className="h-4 w-4 mr-2 text-green-600" />
                  <span>Semanal</span>
                </div>
              </SelectItem>
              <SelectItem value="monthly">
                <div className="flex items-center py-1">
                  <Repeat className="h-4 w-4 mr-2 text-purple-600" />
                  <span>Mensal</span>
                </div>
              </SelectItem>
              <SelectItem value="custom">
                <div className="flex items-center py-1">
                  <Repeat className="h-4 w-4 mr-2 text-amber-600" />
                  <span>Personalizado</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Add option to send habit to planner */}
        <div className="space-y-2 bg-gray-50 p-3 rounded-lg border border-gray-100">
          <div className="flex items-center justify-between">
            <Label htmlFor="confirm-planner-habit" className="flex items-center gap-2 cursor-pointer">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <span>Enviar para o Planner</span>
            </Label>
            <Switch 
              id="confirm-planner-habit" 
              checked={!inboxOnly} 
              onCheckedChange={(checked) => setInboxOnly(!checked)}
            />
          </div>
          <p className="text-xs text-gray-500">
            {inboxOnly 
              ? "O hábito permanecerá apenas na Inbox até ser confirmado para o Planner." 
              : "O hábito será exibido no Planner de acordo com sua frequência e período de duração."}
          </p>
        </div>
        
        {/* Adicionando notificações ao hábito */}
        <div className="space-y-2">
          <Label htmlFor="notification">Notificações</Label>
          <Select value={notificationTime} onValueChange={setNotificationTime}>
            <SelectTrigger id="notification" className="w-full bg-white border-gray-300">
              <SelectValue placeholder="Selecione o lembrete" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="at_time">
                <div className="flex items-center py-1">
                  <Bell className="h-4 w-4 mr-2 text-gray-600" />
                  <span>No horário do hábito</span>
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
        
        <div className="space-y-2">
          <Label htmlFor="duration">Duração (dias)</Label>
          <Input 
            id="duration" 
            type="number" 
            min="1"
            value={durationDays} 
            onChange={(e) => setDurationDays(parseInt(e.target.value) || 21)} 
            className="w-full border-gray-300"
          />
          <p className="text-xs text-gray-500">
            Recomendado: 21 dias para formar um novo hábito, 66 dias para hábitos complexos.
          </p>
        </div>
        
        <div className="space-y-2">
          <Label>Cor do Hábito</Label>
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
        
        <div className="space-y-2">
          <Label htmlFor="details">Detalhes</Label>
          <Textarea 
            id="details" 
            value={details} 
            onChange={(e) => setDetails(e.target.value)} 
            className="w-full resize-none border-gray-300"
            placeholder="Adicione mais detalhes sobre este hábito"
            rows={3}
          />
        </div>
      </DialogBody>
      
      <DialogFooter className="bg-gray-50 p-4 border-t border-gray-100">
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

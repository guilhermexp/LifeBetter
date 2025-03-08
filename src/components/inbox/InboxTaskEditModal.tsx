import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Calendar, Clock, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";

interface Task {
  id: string;
  title: string;
  details: string | null;
  color: string;
  priority: string | null;
  completed: boolean;
  type: string;
  created_at: string;
  start_time?: string | null;
  duration?: number;
}

interface InboxTaskEditModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  onSuccess?: () => void;
}

export function InboxTaskEditModal({ 
  isOpen, 
  onOpenChange, 
  task, 
  onSuccess 
}: InboxTaskEditModalProps) {
  const [title, setTitle] = useState(task.title);
  const [details, setDetails] = useState(task.details || "");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState(task.start_time || "");
  const [duration, setDuration] = useState(task.duration || 15);
  const [priority, setPriority] = useState<string | null>(task.priority);
  const [color, setColor] = useState(task.color);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  
  const { toast } = useToast();
  
  const handleUpdateTask = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O título da tarefa é obrigatório."
      });
      return;
    }
    
    setIsUpdating(true);
    
    try {
      // Validate priority value
      const validPriority: 'high' | 'medium' | 'low' | null = 
        (priority === 'high' || priority === 'medium' || priority === 'low') ? priority : null;
      
      const taskData: any = {
        title,
        details,
        color,
        priority: validPriority,
        start_time: time || null,
        duration
      };
      
      // Se a data foi selecionada, adicione-a aos dados da tarefa e marque como não mais na Inbox
      if (date) {
        taskData.scheduled_date = format(date, 'yyyy-MM-dd');
        taskData.in_inbox = false;
      }
      
      const { error } = await supabase
        .from('tasks')
        .update(taskData)
        .eq('id', task.id);
      
      if (error) throw error;
      
      toast({
        title: date ? "Tarefa movida para o Planner" : "Tarefa atualizada",
        description: date 
          ? "A tarefa foi atualizada e movida para o Planner." 
          : "A tarefa foi atualizada na sua Inbox."
      });
      
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível atualizar a tarefa."
      });
    } finally {
      setIsUpdating(false);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Tarefa</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="task-title" className="text-gray-700">Título da Tarefa <span className="text-red-500">*</span></Label>
            <Input 
              id="task-title" 
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Digite o nome da tarefa" 
              className="w-full border-gray-300 focus:border-purple-500"
              autoFocus
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="task-details" className="text-gray-700">Detalhes</Label>
            <Textarea 
              id="task-details" 
              value={details} 
              onChange={e => setDetails(e.target.value)} 
              placeholder="Adicione detalhes sobre a tarefa..." 
              className="min-h-[100px] w-full border-gray-300 focus:border-purple-500"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-gray-700">Data</Label>
              <Popover open={isDatePickerOpen} onOpenChange={setIsDatePickerOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !date && "text-gray-500"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {date ? format(date, "dd/MM/yyyy") : "Selecionar data"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={date}
                    onSelect={(date) => {
                      setDate(date);
                      setIsDatePickerOpen(false);
                    }}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="task-time" className="text-gray-700">Horário</Label>
              <div className="flex items-center">
                <Clock className="mr-2 h-4 w-4 text-gray-500" />
                <Input 
                  id="task-time" 
                  type="time" 
                  value={time} 
                  onChange={e => setTime(e.target.value)} 
                  className="w-full border-gray-300 focus:border-purple-500"
                />
              </div>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-700">Duração</Label>
            <div className="flex flex-wrap gap-2">
              {[15, 30, 45, 60, 90].map(option => (
                <button
                  key={option}
                  className={cn(
                    "px-3 py-2 rounded-full text-sm font-medium transition-colors",
                    duration === option
                      ? "bg-purple-500 text-white"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  )}
                  onClick={() => setDuration(option)}
                  type="button"
                >
                  {option < 60 ? `${option}min` : option === 60 ? '1h' : '1h30'}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-700">Prioridade</Label>
            <div className="flex gap-2">
              {[
                { value: 'high', label: 'Alta', color: 'border-red-500 bg-red-50 text-red-700' },
                { value: 'medium', label: 'Média', color: 'border-amber-500 bg-amber-50 text-amber-700' },
                { value: 'low', label: 'Baixa', color: 'border-green-500 bg-green-50 text-green-700' }
              ].map(option => (
                <button
                  key={option.value}
                  type="button"
                  className={cn(
                    "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex-1",
                    priority === option.value
                      ? `border-2 ${option.color}`
                      : "border-gray-200 hover:bg-gray-50"
                  )}
                  onClick={() => setPriority(option.value)}
                >
                  <AlertCircle className="h-4 w-4" />
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <Label className="text-gray-700">Cor</Label>
            <div className="flex space-x-4 py-2">
              {[
                { value: '#EA4335', description: 'Urgente' },
                { value: '#FBBC04', description: 'Moderado' },
                { value: '#34A853', description: 'Baixa' },
                { value: '#9b87f5', description: 'Normal' }
              ].map(colorOption => (
                <div 
                  key={colorOption.value} 
                  className="flex flex-col items-center gap-1 cursor-pointer"
                  onClick={() => setColor(colorOption.value)}
                >
                  <div 
                    className={`w-10 h-10 rounded-full transition-all duration-200 ${color === colorOption.value ? "ring-2 ring-offset-2 ring-purple-500" : ""}`} 
                    style={{ backgroundColor: colorOption.value }}
                  />
                  <span className="text-xs text-gray-600">{colorOption.description}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
        
        <div className="flex gap-3 w-full mt-6">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="flex-1"
            type="button"
          >
            Cancelar
          </Button>
          
          <Button 
            onClick={handleUpdateTask}
            className={`flex-1 ${date ? 'bg-green-600 hover:bg-green-700' : 'bg-purple-600 hover:bg-purple-700'}`}
            disabled={isUpdating || !title.trim()}
            type="button"
          >
            {isUpdating ? "Salvando..." : date ? "Salvar e Mover para o Planner" : "Salvar na Inbox"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

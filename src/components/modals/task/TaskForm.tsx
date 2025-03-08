
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, AlertCircle, X } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Types
export interface TaskFormData {
  title: string;
  time: string;
  duration: number;
  color: string;
  details: string;
  priority: string | null;
  subtasks: string[];
}

interface TaskFormProps {
  onSuccess?: () => void;
  onClose: () => void;
}

export const TaskForm = ({ onSuccess, onClose }: TaskFormProps) => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(15);
  const [color, setColor] = useState("#9b87f5");
  const [details, setDetails] = useState("");
  const [priority, setPriority] = useState<string | null>(null);
  const [subtasks, setSubtasks] = useState<string[]>([]);
  const [newSubtask, setNewSubtask] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();
  
  const resetForm = () => {
    setTitle("");
    setTime("");
    setDuration(15);
    setColor("#9b87f5");
    setDetails("");
    setPriority(null);
    setSubtasks([]);
    setNewSubtask("");
    setIsCreating(false);
  };

  const handleAddSubtask = () => {
    if (newSubtask.trim()) {
      setSubtasks([...subtasks, newSubtask.trim()]);
      setNewSubtask("");
    }
  };

  const handleRemoveSubtask = (index: number) => {
    const updatedSubtasks = [...subtasks];
    updatedSubtasks.splice(index, 1);
    setSubtasks(updatedSubtasks);
  };

  const handleCreateTask = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O título da tarefa é obrigatório."
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      // Validate priority value
      const validPriority: 'high' | 'medium' | 'low' | null = 
        (priority === 'high' || priority === 'medium' || priority === 'low') ? priority : null;
      
      const taskData = {
        title,
        scheduled_date: null, // Não definimos uma data ao criar a tarefa na Inbox
        start_time: time || null,
        duration,
        color,
        details,
        priority: validPriority,
        completed: false,
        type: 'task',
        user_id: user.id,
        scheduled: false // Tarefa não agendada (apenas na Inbox)
      };

      const { data, error } = await supabase
        .from('tasks')
        .insert(taskData)
        .select();
      
      if (error) throw error;
      
      // Add subtasks if there are any
      if (subtasks.length > 0 && data && data[0]) {
        const taskId = data[0].id;
        
        const subtasksToInsert = subtasks.map((title, index) => ({
          task_id: taskId,
          title,
          completed: false,
          order_index: index
        }));
        
        const { error: subtaskError } = await supabase
          .from('subtasks')
          .insert(subtasksToInsert);
          
        if (subtaskError) {
          console.error("Erro ao adicionar subtarefas:", subtaskError);
          toast({
            variant: "destructive",
            title: "Aviso",
            description: "Tarefa criada, mas houve um erro ao adicionar as subtarefas."
          });
        }
      }
      
      toast({
        title: "Sucesso!",
        description: "Tarefa criada com sucesso."
      });
      
      resetForm();
      onClose();
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error("Erro ao criar tarefa:", error);
      
      let errorMessage = "Não foi possível criar a tarefa. Tente novamente.";
      
      if (error.message.includes("tasks_priority_check")) {
        errorMessage = "Prioridade inválida selecionada. Use apenas: Alta, Média ou Baixa.";
      }
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: errorMessage
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <FormTitleInput 
          title={title} 
          onChange={setTitle} 
        />
        
        <FormTimeInput 
          time={time} 
          onChange={setTime} 
        />
        
        <FormDurationSelector 
          duration={duration} 
          onChange={setDuration} 
        />
        
        <FormPrioritySelector 
          priority={priority} 
          onChange={setPriority} 
        />
        
        <FormColorSelector 
          color={color} 
          onChange={setColor} 
        />
        
        <FormSubtasks 
          subtasks={subtasks} 
          newSubtask={newSubtask} 
          onNewSubtaskChange={setNewSubtask} 
          onAddSubtask={handleAddSubtask} 
          onRemoveSubtask={handleRemoveSubtask} 
        />
        
        <FormDetailsInput 
          details={details} 
          onChange={setDetails} 
        />
      </div>

      <div className="flex gap-3 w-full mt-6">
        <Button 
          variant="outline" 
          onClick={onClose}
          className="flex-1"
          type="button"
        >
          Cancelar
        </Button>
        <Button 
          onClick={handleCreateTask}
          className="flex-1 bg-gradient-to-r from-purple-500 to-indigo-600"
          disabled={isCreating || !title.trim()}
          type="button"
        >
          {isCreating ? "Criando..." : "Criar Tarefa"}
        </Button>
      </div>
    </>
  );
};

// Sub-components for form sections
const FormTitleInput = ({ title, onChange }: { title: string, onChange: (value: string) => void }) => (
  <div className="space-y-2">
    <Label htmlFor="task-title" className="text-gray-700">Título da Tarefa <span className="text-red-500">*</span></Label>
    <Input 
      id="task-title" 
      value={title} 
      onChange={e => onChange(e.target.value)} 
      placeholder="Digite o nome da tarefa" 
      className="w-full border-gray-300 focus:border-purple-500"
      autoFocus
    />
  </div>
);

const FormTimeInput = ({ time, onChange }: { time: string, onChange: (value: string) => void }) => (
  <div className="space-y-2">
    <Label htmlFor="task-time" className="text-gray-700">Horário da Tarefa</Label>
    <Input 
      id="task-time" 
      type="time" 
      value={time} 
      onChange={e => onChange(e.target.value)} 
      className="w-full border-gray-300 focus:border-purple-500"
    />
    <p className="text-xs text-gray-500">Se não preenchido, a tarefa será registrada sem horário definido.</p>
  </div>
);

// Duration options component
const FormDurationSelector = ({ duration, onChange }: { duration: number, onChange: (value: number) => void }) => {
  const durationOptions = [
    { value: 15, label: '15min' },
    { value: 30, label: '30min' },
    { value: 45, label: '45min' },
    { value: 60, label: '1h' },
    { value: 90, label: '1h30' }
  ];

  return (
    <div className="space-y-2">
      <Label className="text-gray-700">Tempo de Duração</Label>
      <div className="flex flex-wrap gap-2">
        {durationOptions.map(option => (
          <button
            key={option.value}
            className={cn(
              "px-3 py-2 rounded-full text-sm font-medium transition-colors",
              duration === option.value
                ? "bg-purple-500 text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200"
            )}
            onClick={() => onChange(option.value)}
            type="button"
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Priority selector component
const FormPrioritySelector = ({ priority, onChange }: { priority: string | null, onChange: (value: string | null) => void }) => {
  const priorityOptions = [
    { value: 'high', label: 'Alta prioridade', color: '#EA4335' },
    { value: 'medium', label: 'Média prioridade', color: '#FBBC04' },
    { value: 'low', label: 'Baixa prioridade', color: '#34A853' }
  ];

  return (
    <div className="space-y-2">
      <Label className="text-gray-700">Prioridade da Tarefa</Label>
      <div className="flex gap-2">
        {priorityOptions.map(option => (
          <button
            key={option.value}
            type="button"
            className={cn(
              "flex items-center gap-1 px-3 py-2 rounded-lg text-sm font-medium border transition-colors flex-1",
              priority === option.value
                ? `border-2 ${option.value === 'high' ? 'border-red-500 bg-red-50 text-red-700' : 
                     option.value === 'medium' ? 'border-amber-500 bg-amber-50 text-amber-700' : 
                     'border-green-500 bg-green-50 text-green-700'}`
                : "border-gray-200 hover:bg-gray-50"
            )}
            onClick={() => onChange(option.value)}
          >
            <AlertCircle className="h-4 w-4" />
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
};

// Color selector component
const FormColorSelector = ({ color, onChange }: { color: string, onChange: (value: string) => void }) => {
  const colorOptions = [
    { value: '#EA4335', label: 'Vermelho', description: 'Urgente' },
    { value: '#FBBC04', label: 'Amarelo', description: 'Moderado' },
    { value: '#34A853', label: 'Verde', description: 'Baixa' },
    { value: '#9b87f5', label: 'Roxo', description: 'Normal' }
  ];

  return (
    <div className="space-y-2">
      <Label className="text-gray-700">Cor da Tarefa</Label>
      <div className="flex space-x-4 py-2">
        {colorOptions.map(colorOption => (
          <div 
            key={colorOption.value} 
            className="flex flex-col items-center gap-1 cursor-pointer"
            onClick={() => onChange(colorOption.value)}
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
  );
};

// Subtasks component
const FormSubtasks = ({ 
  subtasks, 
  newSubtask, 
  onNewSubtaskChange, 
  onAddSubtask, 
  onRemoveSubtask 
}: { 
  subtasks: string[], 
  newSubtask: string, 
  onNewSubtaskChange: (value: string) => void,
  onAddSubtask: () => void,
  onRemoveSubtask: (index: number) => void
}) => {
  return (
    <div className="space-y-2">
      <Label className="text-gray-700">Subtarefas</Label>
      <div className="flex gap-2">
        <Input 
          value={newSubtask} 
          onChange={e => onNewSubtaskChange(e.target.value)} 
          placeholder="Adicionar subtarefa" 
          className="flex-1 border-gray-300 focus:border-purple-500"
          onKeyDown={e => e.key === 'Enter' && onAddSubtask()}
        />
        <Button 
          onClick={onAddSubtask}
          disabled={!newSubtask.trim()}
          variant="outline"
          type="button"
        >
          Adicionar
        </Button>
      </div>
      
      {subtasks.length > 0 && (
        <div className="mt-2 space-y-2">
          {subtasks.map((subtask, index) => (
            <div key={index} className="flex items-center justify-between bg-gray-50 p-2 rounded-md">
              <span className="text-sm text-gray-700">{subtask}</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => onRemoveSubtask(index)}
                className="h-8 w-8 p-0 text-red-500 hover:bg-red-50"
                type="button"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Details input component
const FormDetailsInput = ({ details, onChange }: { details: string, onChange: (value: string) => void }) => (
  <div className="space-y-2">
    <Label htmlFor="task-details" className="text-gray-700">Detalhes Extras</Label>
    <Textarea 
      id="task-details" 
      value={details} 
      onChange={e => onChange(e.target.value)} 
      placeholder="Adicione links, observações ou informações adicionais..." 
      className="min-h-[100px] w-full border-gray-300 focus:border-purple-500"
    />
  </div>
);

import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  CalendarClock, 
  CheckSquare, 
  PartyPopper, 
  RefreshCw, 
  Clock, 
  CalendarDays,
  AlertCircle,
  X
} from "lucide-react";
import { useTasks } from "@/hooks/useTasks";
import { format } from "date-fns";

interface QuickAddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

// Task type detection helper functions
const detectTaskType = (text: string): { 
  type: string, 
  confidence: number,
  date?: string,
  time?: string 
} => {
  // Convert to lowercase for easier pattern matching
  const normalizedText = text.toLowerCase();
  
  // Check for habit patterns (recurring activities)
  const habitPatterns = [
    /todos os dias/i,
    /cada dia/i,
    /diariamente/i,
    /toda[s]? (segunda|terça|quarta|quinta|sexta|sábado|domingo)/i,
    /toda semana/i,
    /semanalmente/i,
    /todo[s]? mês/i,
    /mensalmente/i,
    /rotina/i,
    /hábito/i,
    /prática/i,
    /contínuo/i,
    /regular/i
  ];
  
  // Check for meeting patterns
  const meetingPatterns = [
    /reunião/i,
    /encontro/i,
    /call/i,
    /conversa com/i,
    /meeting/i,
    /entrevista/i,
    /apresentação/i,
    /discussão/i,
    /conferência/i,
    /videoconferência/i,
    /skype/i,
    /zoom/i,
    /teams/i,
    /google meet/i
  ];
  
  // Check for event patterns
  const eventPatterns = [
    /festa/i,
    /celebração/i,
    /aniversário/i,
    /evento/i,
    /casamento/i,
    /cerimônia/i,
    /formatura/i,
    /almoço com/i,
    /jantar com/i,
    /café com/i,
    /churrasco/i,
    /palestra/i,
    /show/i,
    /concerto/i,
    /teatro/i,
    /cinema/i
  ];
  
  // Date patterns
  const datePatterns = [
    /hoje/i,
    /amanhã/i,
    /depois de amanhã/i,
    /(próxima|essa|esta) (segunda|terça|quarta|quinta|sexta|sábado|domingo)/i,
    /dia (\d{1,2})(\/|-)(\d{1,2})(\/|-)?(\d{2,4})?/i,
    /(\d{1,2})(\/|-)(\d{1,2})(\/|-)?(\d{2,4})?/i
  ];
  
  // Time patterns
  const timePatterns = [
    /(\d{1,2})[h:.](\d{2})?\s*(am|pm)?/i,
    /(\d{1,2})\s*(horas?|h)/i,
    /meio[\s-]dia/i,
    /meia[\s-]noite/i
  ];
  
  // Check for date and time in the text
  const hasDate = datePatterns.some(pattern => pattern.test(normalizedText));
  const hasTime = timePatterns.some(pattern => pattern.test(normalizedText));
  
  // Extract date and time if present
  let extractedDate;
  let extractedTime;
  
  if (hasDate) {
    // Basic date extraction logic
    if (normalizedText.includes('hoje')) {
      extractedDate = new Date().toISOString().split('T')[0];
    } else if (normalizedText.includes('amanhã')) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      extractedDate = tomorrow.toISOString().split('T')[0];
    } else {
      // Try to extract more complex dates
      const dateMatch = normalizedText.match(/dia (\d{1,2})(\/|-)(\d{1,2})/i) || 
                        normalizedText.match(/(\d{1,2})(\/|-)(\d{1,2})/i);
      
      if (dateMatch) {
        const day = parseInt(dateMatch[1]);
        const month = parseInt(dateMatch[3]);
        const year = new Date().getFullYear();
        extractedDate = `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
      }
    }
  }
  
  if (hasTime) {
    // Basic time extraction logic
    const timeMatch = normalizedText.match(/(\d{1,2})[h:.](\d{2})?\s*(am|pm)?/i) ||
                    normalizedText.match(/(\d{1,2})\s*(horas?|h)/i);
    
    if (timeMatch) {
      const hour = parseInt(timeMatch[1]);
      const minute = timeMatch[2] ? parseInt(timeMatch[2]) : 0;
      extractedTime = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
    } else if (normalizedText.includes('meio-dia') || normalizedText.includes('meio dia')) {
      extractedTime = '12:00';
    } else if (normalizedText.includes('meia-noite') || normalizedText.includes('meia noite')) {
      extractedTime = '00:00';
    }
  }
  
  // Count pattern matches for each type
  let habitScore = habitPatterns.filter(pattern => pattern.test(normalizedText)).length;
  let meetingScore = meetingPatterns.filter(pattern => pattern.test(normalizedText)).length;
  let eventScore = eventPatterns.filter(pattern => pattern.test(normalizedText)).length;
  
  // Task is default if no specific patterns are found
  let taskScore = 1; // Base score for task
  
  // Adjust scores based on date/time presence
  if (hasDate && hasTime) {
    meetingScore += 2;
    eventScore += 2;
  } else if (hasDate) {
    eventScore += 1;
    taskScore += 1;
  }
  
  if (habitScore > 0) {
    // Habits usually have recurring patterns
    habitScore += 2;
  }
  
  // Determine the highest score
  const scores = [
    { type: "task", score: taskScore },
    { type: "meeting", score: meetingScore },
    { type: "event", score: eventScore },
    { type: "habit", score: habitScore }
  ];
  
  scores.sort((a, b) => b.score - a.score);
  
  const highestScore = scores[0];
  const totalScore = scores.reduce((sum, item) => sum + item.score, 0);
  const confidence = totalScore > 0 ? highestScore.score / totalScore : 0.5;
  
  return { 
    type: highestScore.type, 
    confidence,
    date: extractedDate,
    time: extractedTime
  };
};

export function QuickAddTaskDialog({
  open,
  onOpenChange
}: QuickAddTaskDialogProps) {
  const [taskInput, setTaskInput] = useState("");
  const [detectedType, setDetectedType] = useState<string>("task");
  const [detectedDate, setDetectedDate] = useState<string | undefined>(undefined);
  const [detectedTime, setDetectedTime] = useState<string | undefined>(undefined);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  
  const { addTask } = useTasks();
  
  // Analyze text when input changes
  useEffect(() => {
    if (taskInput) {
      setIsAnalyzing(true);
      setError(null);
      
      const timer = setTimeout(() => {
        const detection = detectTaskType(taskInput);
        
        // Only update if we have a reasonable confidence
        if (detection.confidence > 0.3) {
          setDetectedType(detection.type);
          setDetectedDate(detection.date);
          setDetectedTime(detection.time);
        } else {
          // Default to task type with today's date
          setDetectedType("task");
          setDetectedDate(format(new Date(), 'yyyy-MM-dd'));
          setDetectedTime(undefined);
        }
        
        setIsAnalyzing(false);
      }, 300); // Delay analysis for typing
      
      return () => clearTimeout(timer);
    }
    
    return undefined;
  }, [taskInput]);
  
  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTaskInput(e.target.value);
  };
  
  // Handle task creation
  const handleCreateTask = async () => {
    if (!taskInput.trim()) {
      setError("Por favor, digite uma descrição para a tarefa.");
      return;
    }
    
    setIsCreating(true);
    setError(null);
    
    try {
      // Prepare task data with all required fields to avoid reference_date error
      const today = format(new Date(), 'yyyy-MM-dd');
      const taskData = {
        title: taskInput,
        description: "",
        completed: false,
        scheduled_date: detectedDate || today,
        start_time: detectedTime,
        type: detectedType,
        category: "general",
        is_priority: false,
        is_today: true,
        has_reminder: false,
        has_due_date: true,
        scheduled: true,
        inbox_only: false,
        duration: "0",
        reference_date: today // Adicionando o campo reference_date que estava faltando
      };
      
      // Add task
      const result = await addTask(taskData);
      
      if (result) {
        // Reset form and close dialog
        setTaskInput("");
        setDetectedType("task");
        setDetectedDate(undefined);
        setDetectedTime(undefined);
        onOpenChange(false);
      } else {
        throw new Error("Não foi possível criar a tarefa.");
      }
    } catch (err: any) {
      console.error("Erro ao criar tarefa:", err);
      setError(err.message || "Ocorreu um erro ao criar a tarefa.");
    } finally {
      setIsCreating(false);
    }
  };
  
  // Handle manually changing the task type
  const changeTaskType = (newType: string) => {
    setDetectedType(newType);
  };
  
  // Get the icon for the task type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return <CalendarClock className="h-4 w-4 text-indigo-600" />;
      case "task":
        return <CheckSquare className="h-4 w-4 text-purple-600" />;
      case "event":
        return <PartyPopper className="h-4 w-4 text-green-600" />;
      case "habit":
        return <RefreshCw className="h-4 w-4 text-amber-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };
  
  // Get the color for the task type badge
  const getTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "task":
        return "bg-purple-100 text-purple-800 border-purple-200";
      case "event":
        return "bg-green-100 text-green-800 border-green-200";
      case "habit":
        return "bg-amber-100 text-amber-800 border-amber-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };
  
  // Get the label for the task type
  const getTypeLabel = (type: string) => {
    switch (type) {
      case "meeting":
        return "Reunião";
      case "task":
        return "Tarefa";
      case "event":
        return "Evento";
      case "habit":
        return "Hábito";
      default:
        return "Tarefa";
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden rounded-xl border-0 shadow-xl">
        <DialogHeader className="bg-gradient-to-r from-purple-500 to-indigo-600 p-4 text-white">
          <DialogTitle className="text-lg font-semibold flex items-center gap-2">
            <span className="bg-white/20 p-1.5 rounded-full">
              <CheckSquare className="h-4 w-4" />
            </span>
            Tarefa Rápida
          </DialogTitle>
        </DialogHeader>
        
        <div className="p-4 space-y-4">
          <div className="relative">
            <Input
              value={taskInput}
              onChange={handleInputChange}
              placeholder="O que você quer fazer?"
              className="pr-10 py-6 text-base border-gray-300 focus:border-purple-500 focus:ring focus:ring-purple-200 transition-all"
              autoFocus
            />
            {taskInput && (
              <button 
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                onClick={() => setTaskInput("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Badge 
              variant="outline" 
              className={`px-2 py-1 cursor-pointer ${detectedType === "task" ? getTypeColor("task") : "hover:bg-gray-100"}`}
              onClick={() => changeTaskType("task")}
            >
              <CheckSquare className="h-3.5 w-3.5 mr-1 text-purple-600" />
              Tarefa
            </Badge>
            
            <Badge 
              variant="outline" 
              className={`px-2 py-1 cursor-pointer ${detectedType === "meeting" ? getTypeColor("meeting") : "hover:bg-gray-100"}`}
              onClick={() => changeTaskType("meeting")}
            >
              <CalendarClock className="h-3.5 w-3.5 mr-1 text-indigo-600" />
              Reunião
            </Badge>
            
            <Badge 
              variant="outline" 
              className={`px-2 py-1 cursor-pointer ${detectedType === "event" ? getTypeColor("event") : "hover:bg-gray-100"}`}
              onClick={() => changeTaskType("event")}
            >
              <PartyPopper className="h-3.5 w-3.5 mr-1 text-green-600" />
              Evento
            </Badge>
            
            <Badge 
              variant="outline" 
              className={`px-2 py-1 cursor-pointer ${detectedType === "habit" ? getTypeColor("habit") : "hover:bg-gray-100"}`}
              onClick={() => changeTaskType("habit")}
            >
              <RefreshCw className="h-3.5 w-3.5 mr-1 text-amber-600" />
              Hábito
            </Badge>
          </div>
          
          {detectedDate && (
            <Badge variant="outline" className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-800 border-blue-200">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(detectedDate).toLocaleDateString('pt-BR')}
              {detectedTime && ` às ${detectedTime}`}
            </Badge>
          )}
          
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-2 rounded-md">
              <AlertCircle className="h-4 w-4" />
              {error}
            </div>
          )}
        </div>
        
        <DialogFooter className="bg-gray-50 p-4 border-t border-gray-100">
          <div className="flex justify-between w-full">
            <Button 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="text-gray-600"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateTask}
              disabled={isCreating || !taskInput.trim()}
              className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white"
            >
              {isCreating ? "Criando..." : "Criar Tarefa"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

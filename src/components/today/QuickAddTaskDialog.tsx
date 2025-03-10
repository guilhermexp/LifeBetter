import React, { useState, useEffect } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  CalendarClock, 
  CheckSquare, 
  PartyPopper, 
  RefreshCw, 
  Clock, 
  CalendarDays,
  AlertTriangle,
  X,
  Sparkles
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

// Sugestões de tarefas rápidas
const quickSuggestions = [
  "Responder e-mails",
  "Reunião com equipe",
  "Fazer exercícios",
  "Tomar medicação",
  "Jantar com família",
  "Ler livro",
  "Estudar",
  "Comprar mantimentos"
];

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
  
  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setTaskInput(suggestion);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="p-0 overflow-hidden rounded-3xl border-0 shadow-xl max-w-md">
        {/* Header */}
        <div className="bg-purple-600 p-6 text-white relative">
          <button 
            onClick={() => onOpenChange(false)} 
            className="absolute right-4 top-4 text-white/80 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
          
          <div className="flex items-center gap-3 mb-6">
            <div className="bg-white/20 p-2 rounded-xl">
              <Sparkles className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold">Tarefa Rápida</h2>
          </div>
          
          <div className="flex items-center gap-2 text-purple-100 text-sm">
            <Sparkles className="h-4 w-4" />
            <span>O que você quer fazer?</span>
          </div>
          
          <div className="relative mt-2">
            <Input
              value={taskInput}
              onChange={handleInputChange}
              placeholder="Descreva sua atividade..."
              className="bg-white/10 border-0 text-white placeholder:text-white/50 h-12 rounded-xl focus:ring-white/30 focus:ring-2"
              autoFocus
            />
            {taskInput && (
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white"
                onClick={() => setTaskInput("")}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <p className="text-xs text-white/70 mt-2">
            Exemplo: "Reunião com cliente amanhã às 14h" ou "Tomar remédio às 8h"
          </p>
        </div>
        
        {/* Suggestions */}
        <div className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <div className="h-px bg-gray-200 flex-1"></div>
            <span className="text-sm text-gray-500">Ou selecione uma sugestão</span>
            <div className="h-px bg-gray-200 flex-1"></div>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {quickSuggestions.map((suggestion, index) => (
              <button
                key={index}
                className="text-left p-4 bg-gray-50 hover:bg-gray-100 rounded-xl text-gray-800 transition-colors"
                onClick={() => handleSuggestionClick(suggestion)}
              >
                {suggestion}
              </button>
            ))}
          </div>
          
          {/* Error message */}
          {error && (
            <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-xl mt-4">
              <AlertTriangle className="h-4 w-4 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}
        </div>
        
        {/* Footer */}
        <DialogFooter className="p-4 border-t border-gray-100 flex flex-row justify-between">
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            className="text-gray-600 rounded-full px-6"
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleCreateTask}
            disabled={isCreating || !taskInput.trim()}
            className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6"
          >
            {isCreating ? "Criando..." : "Criar Tarefa"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

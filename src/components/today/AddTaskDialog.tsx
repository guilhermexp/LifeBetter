
import React, { useEffect, useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CalendarClock, CheckSquare, PartyPopper, RefreshCw, Clock, CalendarDays } from "lucide-react";

interface AddTaskDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  taskData: {
    title: string;
    details: string;
    type: string;
    date?: string;
    time?: string;
  };
  onTaskDataChange: (data: any) => void;
  onSave: () => void;
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

export function AddTaskDialog({
  open,
  onOpenChange,
  taskData,
  onTaskDataChange,
  onSave
}: AddTaskDialogProps) {
  const [detectedType, setDetectedType] = useState<string>("");
  const [showSuggestion, setShowSuggestion] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    onTaskDataChange({
      ...taskData,
      [e.target.name]: e.target.value
    });
    
    // Reset detection when title changes
    if (e.target.name === 'title') {
      setIsAnalyzing(true);
    }
  };
  
  // Analyze text when title changes
  useEffect(() => {
    if (taskData.title && isAnalyzing) {
      const timer = setTimeout(() => {
        const detection = detectTaskType(taskData.title);
        
        // Only update if we have a reasonable confidence
        if (detection.confidence > 0.3) {
          setDetectedType(detection.type);
          setShowSuggestion(true);
          
          // Also update the task data with detected type and date/time
          onTaskDataChange({
            ...taskData,
            type: detection.type,
            date: detection.date || taskData.date,
            time: detection.time || taskData.time
          });
        }
        
        setIsAnalyzing(false);
      }, 500); // Delay analysis for typing
      
      return () => clearTimeout(timer);
    }
    
    return undefined;
  }, [taskData.title, isAnalyzing]);
  
  // Get the icon for the task type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "meeting":
        return <CalendarClock className="h-5 w-5 text-indigo-600" />;
      case "task":
        return <CheckSquare className="h-5 w-5 text-purple-600" />;
      case "event":
        return <PartyPopper className="h-5 w-5 text-green-600" />;
      case "habit":
        return <RefreshCw className="h-5 w-5 text-amber-600" />;
      default:
        return <Clock className="h-5 w-5 text-gray-600" />;
    }
  };
  
  // Get the color for the task type badge
  const getTypeColor = (type: string) => {
    switch (type) {
      case "meeting":
        return "bg-indigo-100 text-indigo-800";
      case "task":
        return "bg-purple-100 text-purple-800";
      case "event":
        return "bg-green-100 text-green-800";
      case "habit":
        return "bg-amber-100 text-amber-800";
      default:
        return "bg-gray-100 text-gray-800";
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
  
  // Handle manually changing the task type
  const changeTaskType = (newType: string) => {
    onTaskDataChange({
      ...taskData,
      type: newType
    });
    setDetectedType(newType);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adicionar Nova Atividade</DialogTitle>
          <DialogDescription>
            Digite sua atividade e o sistema classificará automaticamente.
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="title" className="text-right">
              Atividade
            </Label>
            <Input
              id="title"
              name="title"
              className="col-span-3"
              value={taskData.title}
              onChange={handleChange}
              placeholder="Ex: Almoço amanhã com pessoal do trabalho"
            />
          </div>
          
          {/* Task type suggestion */}
          {showSuggestion && detectedType && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm text-gray-500">
                Tipo detectado:
              </div>
              <div className="col-span-3 flex items-center gap-2">
                <Badge className={`flex items-center gap-1 px-2 py-1 ${getTypeColor(detectedType)}`}>
                  {getTypeIcon(detectedType)}
                  <span>{getTypeLabel(detectedType)}</span>
                </Badge>
                
                {/* Type correction buttons */}
                <div className="flex gap-1 ml-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 w-7 p-0" 
                    onClick={() => changeTaskType("task")}
                    title="Marcar como Tarefa"
                  >
                    <CheckSquare className="h-4 w-4 text-purple-600" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 w-7 p-0" 
                    onClick={() => changeTaskType("meeting")}
                    title="Marcar como Reunião"
                  >
                    <CalendarClock className="h-4 w-4 text-indigo-600" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 w-7 p-0" 
                    onClick={() => changeTaskType("event")}
                    title="Marcar como Evento"
                  >
                    <PartyPopper className="h-4 w-4 text-green-600" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="h-7 w-7 p-0" 
                    onClick={() => changeTaskType("habit")}
                    title="Marcar como Hábito"
                  >
                    <RefreshCw className="h-4 w-4 text-amber-600" />
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          {taskData.date && (
            <div className="grid grid-cols-4 items-center gap-4">
              <div className="text-right text-sm text-gray-500">
                Data:
              </div>
              <div className="col-span-3 flex items-center">
                <Badge variant="outline" className="flex items-center gap-1">
                  <CalendarDays className="h-3 w-3" />
                  {taskData.date}
                  {taskData.time && ` às ${taskData.time}`}
                </Badge>
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="details" className="text-right">
              Detalhes
            </Label>
            <Textarea
              id="details"
              name="details"
              className="col-span-3"
              value={taskData.details}
              onChange={handleChange}
              placeholder="Adicione detalhes adicionais se necessário"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button type="submit" onClick={onSave}>
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

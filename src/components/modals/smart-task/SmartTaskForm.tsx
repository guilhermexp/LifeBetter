
import React, { useState, useEffect } from "react";
import { DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useTaskContextDetector, TaskContextType } from "@/hooks/useTaskContextDetector";
import { useToast } from "@/hooks/use-toast";
import { parseISO, addDays, isValid } from "date-fns";
import { SmartInput } from "./SmartInput";
import { DetectedInfoCard } from "./DetectedInfoCard";
import { TaskFormFields } from "./TaskFormFields";
import { createTask } from "./taskUtils";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { motion } from "framer-motion";

interface SmartTaskFormProps {
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  initialData?: any;
}

export const SmartTaskForm = ({ onOpenChange, onSuccess, initialData }: SmartTaskFormProps) => {
  const [inputText, setInputText] = useState("");
  const [title, setTitle] = useState("");
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string | null>(null);
  const [location, setLocation] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [isCalendarOpen, setIsCalendarOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [creationError, setCreationError] = useState<string | null>(null);
  const [taskType, setTaskType] = useState<TaskContextType>('task');
  const { processText, detectedContext } = useTaskContextDetector();
  const { toast } = useToast();
  
  useEffect(() => {
    if (initialData) {
      if (initialData.fullMessage) {
        setInputText(initialData.fullMessage);
        processText(initialData.fullMessage);
      }
      
      if (initialData.title) {
        setTitle(initialData.title);
      }
      
      if (initialData.taskType) {
        // Validar o tipo de tarefa para garantir que seja um valor válido
        const validTaskTypes: TaskContextType[] = ['task', 'event', 'habit', 'meeting'];
        const newTaskType = initialData.taskType as TaskContextType;
        
        if (validTaskTypes.includes(newTaskType)) {
          setTaskType(newTaskType);
        } else {
          console.warn("Tipo de tarefa inválido:", initialData.taskType);
          setTaskType('task'); // Valor padrão seguro
        }
      }
      
      // Processamento aprimorado de datas
      if (initialData.date) {
        try {
          // Caso 1: É uma instância de Date
          if (initialData.date instanceof Date && !isNaN(initialData.date.getTime())) {
            setDate(initialData.date);
          } 
          // Caso 2: É uma string no formato ISO ou similar
          else if (typeof initialData.date === 'string') {
            // Primeiro tentamos fazer o parse como ISO date
            try {
              const parsedDate = parseISO(initialData.date);
              if (isValid(parsedDate)) {
                setDate(parsedDate);
                return; // Retorna cedo se o parse foi bem-sucedido
              }
            } catch (isoError) {
              console.warn("Erro ao parsear como ISO date:", isoError);
              // Continua para tentar outros formatos
            }
            
            // Tenta processar texto para datas relativas
            const lowerDate = initialData.date.toLowerCase();
            const today = new Date();
            
            if (lowerDate.includes('amanhã')) {
              setDate(addDays(today, 1));
            } else if (lowerDate.includes('hoje')) {
              setDate(today);
            } else if (lowerDate.includes('segunda')) {
              setDate(getNextDayOfWeek(1));
            } else if (lowerDate.includes('terça')) {
              setDate(getNextDayOfWeek(2));
            } else if (lowerDate.includes('quarta')) {
              setDate(getNextDayOfWeek(3));
            } else if (lowerDate.includes('quinta')) {
              setDate(getNextDayOfWeek(4));
            } else if (lowerDate.includes('sexta')) {
              setDate(getNextDayOfWeek(5));
            } else if (lowerDate.includes('sábado')) {
              setDate(getNextDayOfWeek(6));
            } else if (lowerDate.includes('domingo')) {
              setDate(getNextDayOfWeek(0));
            } else {
              // Se não conseguimos determinar a data pelo texto, deixamos undefined
              // para que o usuário precise definir manualmente
              console.warn("Não foi possível determinar a data a partir de:", initialData.date);
              setDate(undefined);
            }
          } else {
            console.warn("Formato de data não reconhecido:", initialData.date);
            setDate(undefined);
          }
        } catch (error) {
          console.error("Erro ao processar data:", error);
          setDate(undefined); // Deixa sem data em vez de definir uma data potencialmente incorreta
        }
      }
      
      // Validação da hora
      if (initialData.time) {
        // Verifica se a hora está em um formato válido HH:MM
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
        if (typeof initialData.time === 'string' && timeRegex.test(initialData.time)) {
          setTime(initialData.time);
        } else {
          console.warn("Formato de hora inválido:", initialData.time);
          setTime(null);
        }
      }
      
      if (initialData.location) {
        setLocation(initialData.location);
      }
    }
  }, [initialData, processText]);
  
  const getNextDayOfWeek = (dayOfWeek: number) => {
    const today = new Date();
    const result = new Date(today);
    result.setDate(today.getDate() + (dayOfWeek - today.getDay() + 7) % 7);
    return result;
  };
  
  useEffect(() => {
    if (inputText.trim()) {
      processText(inputText);
    }
  }, [inputText]);
  
  useEffect(() => {
    if (detectedContext.title && !initialData?.title) {
      setTitle(detectedContext.title);
    }
    
    if (detectedContext.type && !initialData?.taskType) {
      setTaskType(detectedContext.type);
    }
    
    if (detectedContext.date) {
      try {
        const parsedDate = parseISO(detectedContext.date);
        if (isValid(parsedDate)) {
          setDate(parsedDate);
        }
      } catch (error) {
        console.error("Erro ao parsear data:", error);
      }
    }
    
    if (detectedContext.time && !initialData?.time) {
      setTime(detectedContext.time);
    }
    
    if (detectedContext.location && !initialData?.location) {
      setLocation(detectedContext.location);
    }
  }, [detectedContext, initialData]);
  
  const resetForm = () => {
    setInputText("");
    setTitle("");
    setDate(new Date());
    setTime(null);
    setLocation(null);
    setDetails("");
    setIsCalendarOpen(false);
    setTaskType('task');
    setCreationError(null);
  };
  
  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const validateForm = () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O título da tarefa é obrigatório."
      });
      return false;
    }
    
    // Não exigimos mais uma data, pois queremos que as tarefas possam ser criadas sem uma data definida
    // e fiquem apenas na Inbox até serem agendadas
    
    return true;
  };

  const handleCreateTask = async () => {
    setCreationError(null);
    
    if (!validateForm()) {
      return;
    }
    
    setIsCreating(true);
    
    try {
      const result = await createTask({
        title,
        date: date as Date,
        time,
        location,
        details,
        taskType,
        detectedContext,
        inboxOnly: true // Garantir que a tarefa seja criada apenas na Inbox
      });
      
      toast({
        title: "Sucesso!",
        description: `${taskType === 'habit' ? 'Hábito' : 'Tarefa'} "${title}" criado com sucesso e adicionado à sua agenda.`,
        variant: "default",
        duration: 5000,
      });
      
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error: any) {
      console.error("Erro ao criar tarefa:", error);
      
      setCreationError(
        error.message || 
        "Não foi possível criar a tarefa. Verifique sua conexão e tente novamente."
      );
      
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar a tarefa. Verifique os detalhes abaixo."
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <>
      <div className="space-y-4">
        <SmartInput 
          inputText={inputText}
          setInputText={setInputText}
        />
        
        {inputText && (
          <DetectedInfoCard 
            detectedContext={detectedContext}
            taskType={taskType}
            date={date}
            time={time}
            location={location}
          />
        )}
        
        {creationError && (
          <Alert variant="destructive" className="bg-red-50 text-red-800 border-red-200">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {creationError}
            </AlertDescription>
          </Alert>
        )}
        
        <TaskFormFields
          title={title}
          setTitle={setTitle}
          date={date}
          setDate={setDate}
          time={time}
          setTime={setTime}
          location={location}
          setLocation={setLocation}
          details={details}
          setDetails={setDetails}
          taskType={taskType}
          isCalendarOpen={isCalendarOpen}
          setIsCalendarOpen={setIsCalendarOpen}
        />
      </div>

      <DialogFooter className="px-6 py-5 bg-gradient-to-r from-gray-50 to-white border-t border-gray-100 sticky bottom-0 shadow-inner">
        <div className="flex gap-4 w-full">
          <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="w-full border-2 border-gray-200 hover:bg-gray-100 hover:text-gray-800 rounded-xl py-6 font-medium"
              type="button"
            >
              Cancelar
            </Button>
          </motion.div>
          
          <motion.div 
            whileHover={{ scale: 1.03 }} 
            whileTap={{ scale: 0.97 }} 
            className="flex-1"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <Button 
              onClick={handleCreateTask}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-md rounded-xl py-6 font-medium"
              disabled={isCreating || !title.trim()}
              type="button"
            >
              {isCreating ? (
                <span className="flex items-center gap-2">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Criando...
                </span>
              ) : "Criar Tarefa"}
            </Button>
          </motion.div>
        </div>
      </DialogFooter>
    </>
  );
};

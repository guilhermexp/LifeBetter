
import { Task } from "@/types/today";
import { format } from "date-fns";

export const formatDateForDisplay = (dateStr: string): string => {
  try {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  } catch (e) {
    return dateStr;
  }
};

export const generateAppointmentQueryResponse = (text: string, allTasks: Task[] | undefined): string => {
  const normalizedText = text.toLowerCase().trim();
  
  const queryResponses = {
    "quais meus próximos compromissos": "Vou verificar seus próximos compromissos para você.",
    "o que tenho hoje": "Deixe-me verificar o que você tem agendado para hoje.",
    "minha agenda": "Vou verificar sua agenda para você.",
    "quais são minhas tarefas": "Deixe-me consultar suas tarefas pendentes.",
    "tenho alguma reunião": "Vou verificar se você tem alguma reunião agendada.",
    "compromissos de hoje": "Consultando seus compromissos para hoje.",
    "agenda da semana": "Vou verificar sua agenda para esta semana."
  };
  
  for (const [key, response] of Object.entries(queryResponses)) {
    if (normalizedText.includes(key)) {
      return response;
    }
  }
  
  if (allTasks && allTasks.length > 0) {
    let filteredTasks = [...allTasks];
    let period = "próximos";
    
    if (normalizedText.includes("hoje")) {
      period = "hoje";
      const today = new Date().toISOString().split('T')[0];
      filteredTasks = allTasks.filter(task => 
        task.scheduled_date === today
      );
    } else if (normalizedText.includes("amanhã")) {
      period = "amanhã";
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const tomorrowStr = tomorrow.toISOString().split('T')[0];
      filteredTasks = allTasks.filter(task => 
        task.scheduled_date === tomorrowStr
      );
    } else if (normalizedText.includes("semana")) {
      period = "esta semana";
      const today = new Date();
      const weekEnd = new Date();
      weekEnd.setDate(today.getDate() + 7);
      
      filteredTasks = allTasks.filter(task => {
        if (!task.scheduled_date) return false;
        const taskDate = new Date(task.scheduled_date);
        return taskDate >= today && taskDate <= weekEnd;
      });
    }
    
    if (filteredTasks.length === 0) {
      return `Você não tem compromissos agendados para ${period}.`;
    } else if (filteredTasks.length === 1) {
      const task = filteredTasks[0];
      return `Você tem 1 compromisso ${period}: ${task.title}, ${task.scheduled_date ? 'em ' + formatDateForDisplay(task.scheduled_date) : ''} ${task.start_time ? 'às ' + task.start_time : ''}.`;
    } else {
      const tasksToShow = filteredTasks.slice(0, 3);
      let response = `Você tem ${filteredTasks.length} compromissos ${period}. Aqui estão os próximos: `;
      
      response += tasksToShow.map(task => 
        `${task.title}, ${task.scheduled_date ? formatDateForDisplay(task.scheduled_date) : ''} ${task.start_time ? 'às ' + task.start_time : ''}`
      ).join("; ");
      
      if (filteredTasks.length > 3) {
        response += ` e mais ${filteredTasks.length - 3} outros.`;
      }
      
      return response;
    }
  } else {
    return "Você não tem compromissos agendados no momento.";
  }
};

export const getNextDayOfWeek = (dayOfWeek: number): Date => {
  const today = new Date();
  const result = new Date(today);
  result.setDate(today.getDate() + (dayOfWeek - today.getDay() + 7) % 7);
  return result;
};

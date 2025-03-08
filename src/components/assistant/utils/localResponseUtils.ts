
/**
 * Utility functions for handling local responses
 */

export const LOCAL_RESPONSES: Record<string, string> = {
  "oi": "Olá! Como posso ajudar você hoje?",
  "olá": "Olá! Como posso ajudar você hoje?",
  "ola": "Olá! Como posso ajudar você hoje?",
  "bom dia": "Bom dia! Como posso ajudar você hoje?",
  "boa tarde": "Boa tarde! Como posso ajudar você hoje?",
  "boa noite": "Boa noite! Como posso ajudar você hoje?",
  "quem é você": "Sou um assistente virtual que ajuda você a gerenciar sua agenda e tarefas. Posso adicionar eventos, reuniões e tarefas ao seu calendário.",
  "o que você faz": "Eu ajudo você a gerenciar sua agenda. Posso criar eventos, tarefas, e ajudar você a se organizar melhor.",
  "como você funciona": "Eu uso processamento de linguagem natural para entender seus pedidos e ajudar a gerenciar sua agenda. Basta me dizer o que precisa adicionar ao calendário.",
  "como adicionar um evento": "Você pode dizer algo como 'Adicione uma reunião amanhã às 15h' ou 'Crie um evento para sexta-feira'. Também pode clicar no ícone de calendário para adicionar manualmente.",
  "ajuda": "Posso ajudar você a gerenciar sua agenda. Experimente comandos como 'adicionar reunião', 'criar evento', ou 'agendar tarefa'. O que você precisa hoje?"
};

export const getLocalResponse = (text: string): string | null => {
  const normalizedText = text.toLowerCase().trim();
  
  if (LOCAL_RESPONSES[normalizedText]) {
    return LOCAL_RESPONSES[normalizedText];
  }
  
  for (const [key, response] of Object.entries(LOCAL_RESPONSES)) {
    if (normalizedText.includes(key)) {
      return response;
    }
  }
  
  return null;
};

export const QUERY_RESPONSES: Record<string, string> = {
  "quais meus próximos compromissos": "Vou verificar seus próximos compromissos para você.",
  "o que tenho hoje": "Deixe-me verificar o que você tem agendado para hoje.",
  "minha agenda": "Vou verificar sua agenda para você.",
  "quais são minhas tarefas": "Deixe-me consultar suas tarefas pendentes.",
  "tenho alguma reunião": "Vou verificar se você tem alguma reunião agendada.",
  "compromissos de hoje": "Consultando seus compromissos para hoje.",
  "agenda da semana": "Vou verificar sua agenda para esta semana."
};

export const isLikelyEventCreation = (text: string): boolean => {
  const lowerText = text.toLowerCase();
  const eventKeywords = [
    "adicionar", "criar", "marcar", "agendar", "lembrar", "lembrete para", 
    "evento", "reunião", "compromisso", "tarefa", "encontro", "nova", "novo",
    "viagem", "viajar", "visitar", "ir para", "passear", "excursão", "passeio",
    "férias", "feriado", "voo", "embarque", "hotel", "hospedagem"
  ];
  
  return eventKeywords.some(keyword => lowerText.includes(keyword));
};

export const isQueryAboutAppointments = (text: string): boolean => {
  const normalizedText = text.toLowerCase().trim();
  
  for (const key of Object.keys(QUERY_RESPONSES)) {
    if (normalizedText.includes(key)) {
      return true;
    }
  }
  
  const queryKeywords = [
    "quais", "quando", "onde", "que horas", "horário", "próximo", "tenho", 
    "agenda", "compromisso", "mostrar", "listar", "ver", "consultar", "próximos", 
    "essa semana", "hoje", "amanhã", "pendente"
  ];
  
  const hasQueryKeyword = queryKeywords.some(keyword => normalizedText.includes(keyword));
  
  const creationKeywords = ["adicionar", "criar", "marcar", "agendar", "novo", "nova"];
  const hasCreationKeyword = creationKeywords.some(keyword => normalizedText.includes(keyword));
  
  return hasQueryKeyword && !hasCreationKeyword;
};


import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  // Add a ping endpoint to check if the function is available
  const url = new URL(req.url);
  if (url.pathname.endsWith('/ping')) {
    return new Response(JSON.stringify({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      message: "Assistente NLP está disponível e funcionando corretamente."
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200
    });
  }

  try {
    const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
    
    if (!OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY is not set in environment variables');
    }
    
    const requestData = await req.json().catch(err => {
      console.error("Error parsing JSON:", err);
      throw new Error('Invalid JSON in request body');
    });
    
    const { message, previousMessages, userCalendarData } = requestData;
    
    if (!message) {
      throw new Error('No message provided');
    }

    console.log("Received message:", message);
    console.log("Previous messages count:", previousMessages?.length || 0);
    console.log("Calendar data provided:", userCalendarData ? 'Yes' : 'No');

    // Build conversation history
    const conversationHistory = [
      {
        role: "system",
        content: `Você é um Assistente de Agenda Inteligente para o aplicativo Vida Melhor, especializado em gestão de tempo, compromissos e produtividade pessoal e profissional. Seu objetivo é compreender solicitações em linguagem natural e transformá-las em eventos estruturados no calendário do usuário, além de sugerir otimizações e melhorias para uma melhor gestão do tempo.

CONTEXTO DO USUÁRIO:
- O usuário utiliza um aplicativo de produtividade e bem-estar, que inclui gerenciamento de tarefas, hábitos, compromissos e acompanhamento de progresso.
- O app organiza a agenda em categorias, como Reuniões, Tarefas, Eventos, Hábitos e Lembretes.
- O assistente deve ser capaz de conectar diferentes aspectos da vida do usuário (pessoal, profissional, saúde, família, finanças, estudos, lazer).
- O usuário pode enviar comandos por texto ou voz para adicionar, alterar ou consultar eventos na agenda.

SUAS HABILIDADES:
1. Extrair informações precisas (data, hora, título, descrição, duração).
2. Identificar o tipo de compromisso (Reunião, Tarefa, Evento, Hábito, Lembrete).
3. Entender comandos informais e interpretar recorrências.
4. Verificar horários disponíveis e sugerir o melhor horário.
5. Reorganizar eventos conflitantes.
6. Avaliar carga de trabalho e gerenciar prioridades.
7. Personalizar com base em padrões de comportamento do usuário.
8. Fornecer respostas em formato JSON para novos eventos, ou respostas estruturadas para consultas.

FORMATO DE RESPOSTA:
Para comandos de criação de eventos, responda com JSON estruturado. Para consultas e outras interações, use linguagem natural, concisa e amigável.

MUITO IMPORTANTE: Seja breve nas respostas. O usuário prefere respostas diretas e informativas, não mais que 2-3 frases.`
      }
    ];
    
    // Add user's calendar data if provided
    if (userCalendarData) {
      conversationHistory[0].content += `\n\nCALENDÁRIO ATUAL DO USUÁRIO:\n${JSON.stringify(userCalendarData, null, 2)}`;
    }
    
    // Add previous messages to conversation history
    if (previousMessages && Array.isArray(previousMessages)) {
      conversationHistory.push(...previousMessages);
    }
    
    // Add current user message
    conversationHistory.push({
      role: "user",
      content: message
    });
    
    // Call OpenAI API with retry mechanism
    let attempts = 0;
    const maxAttempts = 3;
    let response = null;
    let error = null;
    
    console.log("Starting OpenAI API call with retries");
    
    while (attempts < maxAttempts && !response) {
      try {
        console.log(`Attempt ${attempts + 1} of ${maxAttempts} to call OpenAI API`);
        response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: conversationHistory,
            temperature: 0.7,
            max_tokens: 500
          })
        });
        
        // Check response status
        if (!response.ok) {
          const errorData = await response.text();
          console.error(`OpenAI API error (attempt ${attempts + 1}):`, errorData);
          throw new Error(`OpenAI API error: ${errorData}`);
        }
        
        // Try to parse response as JSON
        const responseData = await response.json().catch(err => {
          console.error("Error parsing response JSON:", err);
          throw new Error('Invalid JSON in OpenAI response');
        });
        
        // Validate response structure
        if (!responseData || !responseData.choices || !responseData.choices[0] || !responseData.choices[0].message) {
          console.error("Invalid response structure:", JSON.stringify(responseData));
          throw new Error('Invalid response structure from OpenAI');
        }
        
        console.log("Successfully received valid response from OpenAI");
        return processSuccessfulResponse(responseData, message, userCalendarData);
        
      } catch (err) {
        error = err;
        attempts++;
        console.error(`Error in attempt ${attempts}: ${err.message}`);
        
        if (attempts < maxAttempts) {
          // Wait before retry, with exponential backoff
          const waitTime = Math.pow(2, attempts) * 500; // 1s, 2s, 4s...
          console.log(`Waiting ${waitTime}ms before next attempt...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    // If we get here, all attempts failed
    console.error("All OpenAI API attempts failed:", error);
    throw error || new Error('Failed to get response from OpenAI API after retries');
    
  } catch (error) {
    console.error("Error in nlp-assistant function:", error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        reply: "Desculpe, estou com problemas para processar sua mensagem. Poderia tentar novamente ou adicionar o evento manualmente?"
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
  
  // Helper function to process successful responses
  async function processSuccessfulResponse(data, userMessage, calendarData) {
    const assistantReply = data.choices[0].message.content;
    
    // Try to parse JSON response if it looks like a JSON
    let parsedEvent = null;
    if (assistantReply.includes('{') && assistantReply.includes('}')) {
      try {
        // Extract JSON object from the reply (if it contains other text)
        const jsonMatch = assistantReply.match(/({[\s\S]*})/);
        if (jsonMatch) {
          parsedEvent = JSON.parse(jsonMatch[1]);
          console.log("Extracted event from JSON:", parsedEvent);
        }
      } catch (e) {
        console.log("Could not parse JSON from response, treating as text:", e);
      }
    }
    
    // If JSON wasn't parsed from response, use enhanced extraction
    if (!parsedEvent) {
      parsedEvent = enhancedTaskInfoExtraction(userMessage, assistantReply, calendarData);
    }
    
    console.log("Response processed successfully:", assistantReply);
    
    return new Response(
      JSON.stringify({ 
        reply: assistantReply, 
        taskInfo: parsedEvent,
        usage: data.usage
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

// Enhanced function to extract task information with advanced contextual awareness
function enhancedTaskInfoExtraction(userMessage, aiResponse, calendarData) {
  // Simple heuristic to detect task creation intent in user message
  const lowerUserMessage = userMessage.toLowerCase();
  const taskCreationPatterns = [
    'adicionar', 'criar', 'marcar', 'agendar', 'lembrar', 'nova tarefa', 
    'novo evento', 'nova reunião', 'adicione', 'crie', 'agende', 'evento',
    'compromisso', 'hábito', 'registrar', 'colocar', 'inserir', 'almoço',
    'jantar', 'café', 'encontro'
  ];
  
  const queryPatterns = [
    'o que tenho', 'quais são', 'mostre', 'listar', 'me mostre', 'agenda de',
    'compromissos', 'está marcado', 'verificar', 'tenho alguma', 'tenho reunião'
  ];
  
  const isTaskCreation = taskCreationPatterns.some(pattern => 
    lowerUserMessage.includes(pattern)
  );
  
  const isQuery = queryPatterns.some(pattern => 
    lowerUserMessage.includes(pattern)
  );
  
  if (!isTaskCreation && !isQuery) {
    return null;
  }
  
  if (isQuery) {
    // For queries, return a special object marking this as a calendar query
    return {
      type: 'query',
      queryType: 'calendar_check',
      fullMessage: userMessage,
      rawResponse: aiResponse
    };
  }
  
  // Extract task type (improved)
  let taskType = determineTaskType(lowerUserMessage);
  
  // Parse for recurrence
  const recurrenceInfo = parseRecurrenceInfo(lowerUserMessage);
  
  // Advanced date extraction
  const dateInfo = extractAdvancedDate(lowerUserMessage);
  
  // Extract time information
  const timeInfo = extractTimeInfo(lowerUserMessage);
  
  // Extract location with better context awareness
  const location = extractEnhancedLocation(lowerUserMessage);
  
  // Extract participants or attendees
  const people = extractPeople(lowerUserMessage);
  
  // Detect priority level
  const priority = determinePriority(lowerUserMessage);
  
  // Extract category with better context awareness
  const category = determineCategory(lowerUserMessage, taskType);
  
  // Try to extract a title (improved)
  const title = extractTitle(userMessage, taskType, dateInfo.dateText, timeInfo.timeText, location);
  
  // Attempt to calculate duration
  const duration = calculateDuration(lowerUserMessage, taskType);
  
  // Extract description or notes
  const description = extractDescription(lowerUserMessage, title, location);
  
  return {
    fullMessage: userMessage,
    taskType: taskType,
    title: title,
    date: dateInfo.date,
    time: timeInfo.time,
    duration: duration,
    location: location,
    people: people.length > 0 ? people : undefined,
    priority: priority,
    category: category,
    description: description,
    recurrence: recurrenceInfo.hasRecurrence ? recurrenceInfo : undefined
  };
}

// Function to determine task type based on context
function determineTaskType(text) {
  // Define keywords for each type
  const typeKeywords = {
    'meeting': ['reunião', 'reunir', 'encontro', 'conversa', 'call', 'videoconferência', 'zoom', 'meet', 'teams', 'entrevista'],
    'event': ['evento', 'festa', 'celebração', 'aniversário', 'comemoração', 'workshop', 'seminário', 'palestra', 'cerimônia', 'formatura', 'almoço', 'jantar', 'café'],
    'habit': ['hábito', 'rotina', 'diariamente', 'todas as manhãs', 'toda noite', 'todo dia', 'frequente', 'sempre', 'diário', 'semanal'],
    'reminder': ['lembrete', 'lembrar', 'não esquecer', 'avisar', 'alerta', 'lembre-me']
  };
  
  // Social meals are usually events
  if (text.includes('almoço') || text.includes('jantar') || text.includes('café')) {
    if (text.includes('com')) {
      return 'event';
    }
  }
  
  // Check for matches
  for (const [type, keywords] of Object.entries(typeKeywords)) {
    if (keywords.some(keyword => text.includes(keyword))) {
      return type;
    }
  }
  
  // Default to task if no specific type is detected
  return 'task';
}

// Enhanced location extraction
function extractEnhancedLocation(text) {
  // Common location prepositions and markers
  const locationPatterns = [
    /\bem\s+([^,\.;]+)/i,
    /\bno\s+([^,\.;]+)/i,
    /\bna\s+([^,\.;]+)/i,
    /\blocalizado\s+(?:em|na|no)\s+([^,\.;]+)/i,
    /\blocal:\s*([^,\.;]+)/i,
    /\bendereço:\s*([^,\.;]+)/i,
    /\bsede\s+(?:da|do)?\s+([^,\.;]+)/i,
    /\bda\s+([^,\.;]+)/i  // Para casos como "almoço com os pais da Gardenia"
  ];
  
  for (const pattern of locationPatterns) {
    const match = text.match(pattern);
    if (match && match[1]) {
      let location = match[1].trim();
      
      // Filter out date or time that might have been captured
      if (/^\d{1,2}[:.]\d{2}$/.test(location) || /^\d{1,2}\/\d{1,2}(?:\/\d{2,4})?$/.test(location)) {
        continue;
      }
      
      return location;
    }
  }
  
  return null;
}

// Extract people mentioned in the text
function extractPeople(text) {
  const people = [];
  
  // Keywords for people
  const peoplePatterns = [
    /\bcom\s+([A-Z][a-zÀ-ú]+(?: [A-Z][a-zÀ-ú]+)*)/g,
    /\be\s+([A-Z][a-zÀ-ú]+(?: [A-Z][a-zÀ-ú]+)*)/g,
    /\bpara\s+([A-Z][a-zÀ-ú]+(?: [A-Z][a-zÀ-ú]+)*)/g,
    /\bparticipantes:\s*([^,\.;]+(?:,\s*[^,\.;]+)*)/i,
    /\bcom (?:os |as |o |a )?((?:[a-zÀ-ú]+ )*(?:d[aeo] [A-Z][a-zÀ-ú]+))/gi  // Captura "com os pais da Gardenia"
  ];
  
  for (const pattern of peoplePatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1]) {
        // Split multiple people separated by commas or 'e'
        const possibleMultiple = match[1].split(/(?:,\s*|\s+e\s+)/);
        
        for (const person of possibleMultiple) {
          const trimmed = person.trim();
          // Ensure it starts with capital letter and isn't a common word
          if (trimmed.length > 2 && !isCommonWord(trimmed)) {
            people.push(trimmed);
          }
        }
      }
    }
  }
  
  // Caso especial para "almoço com os pais da Gardenia"
  const familyMatch = text.match(/\bcom (?:os |as )?(pais|família|família|parentes|avós|primos|tios) d[aeo] ([A-Z][a-zÀ-ú]+)/i);
  if (familyMatch && familyMatch[2]) {
    const relationship = familyMatch[1];
    const personName = familyMatch[2];
    people.push(`${relationship} de ${personName}`);
  }
  
  return [...new Set(people)]; // Remove duplicates
}

// Check if a word is a common Portuguese word (not a name)
function isCommonWord(word) {
  const commonWords = ['Com', 'Para', 'Sem', 'Ela', 'Ele', 'Você', 'Todos', 'Algumas', 'Hoje', 'Amanhã', 'Depois'];
  return commonWords.includes(word);
}

// Extract advanced date information
function extractAdvancedDate(text) {
  const today = new Date();
  let dateText = null;
  let date = today; // Default to today
  
  // Common date patterns
  const datePatterns = {
    today: /\bhoje\b/i,
    tomorrow: /\bamanh[ãa]\b/i,
    dayAfterTomorrow: /\bdepois de amanh[ãa]\b/i,
    nextWeek: /\bpr[óo]xima semana\b/i,
    thisWeek: /\best[ae] semana\b/i,
    weekday: /\b(segunda|terça|quarta|quinta|sexta|s[áa]bado|domingo)(?:-feira)?\b/i,
    specificDate: /\b(\d{1,2})[\/\-\.](\d{1,2})(?:[\/\-\.](\d{2,4}))?\b/
  };
  
  // Check for specifc dates first (dd/mm/yyyy)
  const specificMatch = text.match(datePatterns.specificDate);
  if (specificMatch) {
    const day = parseInt(specificMatch[1], 10);
    const month = parseInt(specificMatch[2], 10) - 1; // JavaScript months are 0-indexed
    let year = specificMatch[3] ? parseInt(specificMatch[3], 10) : today.getFullYear();
    
    // Handle two-digit years
    if (year < 100) {
      year += 2000;
    }
    
    const parsedDate = new Date(year, month, day);
    if (isValidDate(parsedDate)) {
      date = parsedDate;
      dateText = specificMatch[0];
      return { date: formatDate(date), dateText };
    }
  }
  
  // Check for keywords like "hoje", "amanhã", etc.
  if (datePatterns.today.test(text)) {
    dateText = "hoje";
    return { date: formatDate(date), dateText };
  } else if (datePatterns.tomorrow.test(text)) {
    date = new Date(today);
    date.setDate(today.getDate() + 1);
    dateText = "amanhã";
    return { date: formatDate(date), dateText };
  } else if (datePatterns.dayAfterTomorrow.test(text)) {
    date = new Date(today);
    date.setDate(today.getDate() + 2);
    dateText = "depois de amanhã";
    return { date: formatDate(date), dateText };
  }
  
  // Check for weekdays
  const weekdayMatch = text.match(datePatterns.weekday);
  if (weekdayMatch) {
    const weekdayMap = {
      'domingo': 0, 'segunda': 1, 'segunda-feira': 1, 
      'terça': 2, 'terça-feira': 2, 
      'quarta': 3, 'quarta-feira': 3, 
      'quinta': 4, 'quinta-feira': 4, 
      'sexta': 5, 'sexta-feira': 5, 
      'sábado': 6, 'sabado': 6
    };
    
    const targetDay = weekdayMap[weekdayMatch[0].toLowerCase()];
    if (targetDay !== undefined) {
      const currentDay = today.getDay();
      let daysToAdd = targetDay - currentDay;
      
      // If the day has already passed this week, move to next week
      if (daysToAdd <= 0) {
        daysToAdd += 7;
      }
      
      date = new Date(today);
      date.setDate(today.getDate() + daysToAdd);
      dateText = weekdayMatch[0];
      return { date: formatDate(date), dateText };
    }
  }
  
  // Check for "próxima semana" (next week)
  if (datePatterns.nextWeek.test(text)) {
    date = new Date(today);
    date.setDate(today.getDate() + 7);
    dateText = "próxima semana";
    return { date: formatDate(date), dateText };
  }
  
  // For monthly recurring events like "todo dia 5"
  const monthlyMatch = text.match(/\btodo(?:\s+o)?\s+dia\s+(\d{1,2})\b/i);
  if (monthlyMatch) {
    const dayOfMonth = parseInt(monthlyMatch[1], 10);
    date = new Date(today);
    
    // Set to the specified day of the current month
    date.setDate(dayOfMonth);
    
    // If that day already passed this month, move to next month
    if (date < today) {
      date.setMonth(date.getMonth() + 1);
    }
    
    dateText = `dia ${dayOfMonth}`;
    return { date: formatDate(date), dateText };
  }
  
  return { date: formatDate(date), dateText };
}

// Helper function to format date as YYYY-MM-DD
function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Helper function to validate a date
function isValidDate(date) {
  return date instanceof Date && !isNaN(date);
}

// Extract time information from text
function extractTimeInfo(text) {
  let timeText = null;
  let time = null;
  
  // Time patterns
  const timePatterns = [
    // HH:MM format
    /\b(\d{1,2})[:.h](\d{2})(?:\s*(?:horas?|hrs?))?\b/i,
    // HH hours format
    /\b(\d{1,2})\s*(?:horas?|hrs?|h)\b/i,
    // Special times
    /\bmeio[\s-]dia\b/i,
    /\bmeia[\s-]noite\b/i,
    // General periods
    /\bmanh[ãa]\b/i,
    /\btarde\b/i,
    /\bnoite\b/i
  ];
  
  // Check for HH:MM format
  const timeMatch = text.match(timePatterns[0]);
  if (timeMatch) {
    const hours = parseInt(timeMatch[1], 10);
    const minutes = parseInt(timeMatch[2], 10);
    
    if (hours >= 0 && hours < 24 && minutes >= 0 && minutes < 60) {
      time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      timeText = timeMatch[0];
      return { time, timeText };
    }
  }
  
  // Check for "X horas" format
  const hoursMatch = text.match(timePatterns[1]);
  if (hoursMatch) {
    const hours = parseInt(hoursMatch[1], 10);
    if (hours >= 0 && hours < 24) {
      time = `${hours.toString().padStart(2, '0')}:00`;
      timeText = hoursMatch[0];
      return { time, timeText };
    }
  }
  
  // Check for special times
  if (timePatterns[2].test(text)) { // meio-dia
    time = "12:00";
    timeText = "meio-dia";
    return { time, timeText };
  }
  
  if (timePatterns[3].test(text)) { // meia-noite
    time = "00:00";
    timeText = "meia-noite";
    return { time, timeText };
  }
  
  // Check for general periods
  if (timePatterns[4].test(text)) { // manhã
    time = "09:00";
    timeText = "manhã";
    return { time, timeText };
  }
  
  if (timePatterns[5].test(text)) { // tarde
    time = "15:00";
    timeText = "tarde";
    return { time, timeText };
  }
  
  if (timePatterns[6].test(text)) { // noite
    time = "20:00";
    timeText = "noite";
    return { time, timeText };
  }
  
  // Se é almoço e não especificou hora
  if (text.includes('almoço') && !time) {
    time = "12:30";
    timeText = "almoço";
    return { time, timeText };
  }
  
  // Se é jantar e não especificou hora
  if (text.includes('jantar') && !time) {
    time = "20:00";
    timeText = "jantar";
    return { time, timeText };
  }
  
  // Se é café e não especificou hora
  if (text.includes('café da manhã') && !time) {
    time = "08:00";
    timeText = "café da manhã";
    return { time, timeText };
  }
  
  return { time, timeText };
}

// Parse recurrence information
function parseRecurrenceInfo(text) {
  const hasRecurrence = /\btodo[s]?\b|\bcada\b|\bsemanalmente\b|\bmensalmente\b|\bdiariamente\b|\btodas\s+as\b/i.test(text);
  
  if (!hasRecurrence) {
    return { hasRecurrence: false };
  }
  
  let frequency = null;
  let interval = 1;
  
  // Detect frequency
  if (/\bdiariamente\b|\btodo[s]?\s+(?:os\s+)?dias?\b|\bcada\s+dia\b/i.test(text)) {
    frequency = 'daily';
  } else if (/\bsemanalmente\b|\btoda[s]?\s+(?:as\s+)?semanas?\b|\bcada\s+semana\b/i.test(text)) {
    frequency = 'weekly';
  } else if (/\bmensalmente\b|\btodo[s]?\s+(?:os\s+)?m[êe]s(?:es)?\b|\bcada\s+m[êe]s\b/i.test(text)) {
    frequency = 'monthly';
  } else if (/\banualmente\b|\btodo[s]?\s+(?:os\s+)?anos?\b|\bcada\s+ano\b/i.test(text)) {
    frequency = 'yearly';
  }
  
  // Detect interval patterns like "a cada 2 dias"
  const intervalMatch = text.match(/\ba\s+cada\s+(\d+)\s+(dias?|semanas?|m[êe]s(?:es)?|anos?)\b/i);
  if (intervalMatch) {
    interval = parseInt(intervalMatch[1], 10);
    if (intervalMatch[2].startsWith("dia")) {
      frequency = 'daily';
    } else if (intervalMatch[2].startsWith("semana")) {
      frequency = 'weekly';
    } else if (intervalMatch[2].startsWith("m")) {
      frequency = 'monthly';
    } else if (intervalMatch[2].startsWith("ano")) {
      frequency = 'yearly';
    }
  }
  
  // Detect weekdays for weekly recurrence
  const weekdays = [];
  const weekdayPatterns = [
    { day: 'MO', pattern: /\bsegunda[s]?(?:-feira[s]?)?\b/i },
    { day: 'TU', pattern: /\bter[çc]a[s]?(?:-feira[s]?)?\b/i },
    { day: 'WE', pattern: /\bquarta[s]?(?:-feira[s]?)?\b/i },
    { day: 'TH', pattern: /\bquinta[s]?(?:-feira[s]?)?\b/i },
    { day: 'FR', pattern: /\bsexta[s]?(?:-feira[s]?)?\b/i },
    { day: 'SA', pattern: /\bs[áa]bado[s]?\b/i },
    { day: 'SU', pattern: /\bdomingo[s]?\b/i }
  ];
  
  for (const { day, pattern } of weekdayPatterns) {
    if (pattern.test(text)) {
      weekdays.push(day);
    }
  }
  
  return {
    hasRecurrence: true,
    frequency: frequency || 'daily', // Default to daily if frequency not specified
    interval: interval,
    weekdays: weekdays.length > 0 ? weekdays : undefined
  };
}

// Determine priority level from text
function determinePriority(text) {
  // High priority indicators
  if (/\balta\s+prioridade\b|\bprioridade\s+alta\b|\burgente\b|\bimportante\b|\bcr[íi]tico\b|\bessencial\b/i.test(text)) {
    return 'high';
  }
  
  // Medium priority indicators
  if (/\bm[ée]dia\s+prioridade\b|\bprioridade\s+m[ée]dia\b|\bintermedi[áa]rio\b/i.test(text)) {
    return 'medium';
  }
  
  // Low priority indicators
  if (/\bbaixa\s+prioridade\b|\bprioridade\s+baixa\b|\bpouco\s+urgente\b|\bsecund[áa]rio\b/i.test(text)) {
    return 'low';
  }
  
  return null; // Return null if no priority is detected
}

// Determine category based on text content
function determineCategory(text, taskType) {
  const categoryPatterns = {
    'trabalho': /\btrabalho\b|\bprofissional\b|\bescrit[óo]rio\b|\bempresa\b|\bjob\b|\bcliente[s]?\b|\bprojeto[s]?\b|\brelat[óo]rio[s]?\b|\breuni[ãa]o\s+de\s+trabalho\b/i,
    'pessoal': /\bpessoal\b|\bcasa\b|\bfam[íi]lia\b|\bamigo[s]?\b|\blazer\b|\bfolga\b|\bdivers[ãa]o\b/i,
    'saúde': /\bsa[úu]de\b|\bm[ée]dico\b|\bdentista\b|\bconsulta\b|\bexame[s]?\b|\bacademia\b|\btreino\b|\bexerc[íi]cio[s]?\b|\bmaratona\b|\byoga\b|\bmedita[çc][ãa]o\b/i,
    'educação': /\bedu[c]?a[çc][ãa]o\b|\bcurso[s]?\b|\baula[s]?\b|\bestud[oa][rs]?\b|\bfaculdade\b|\bescola\b|\bleitura\b|\blivro[s]?\b|\bpalestra\b|\bworkshop\b/i,
    'finanças': /\bfinan[çc]as\b|\bdinheiro\b|\bbanco\b|\binvestimento[s]?\b|\bpagamento[s]?\b|\bconta[s]?\b|\bor[çc]amento\b|\baluguel\b|\bcompra[s]?\b/i,
    'viagem': /\bviagem\b|\bviaja[r]\b|\bv[ôo]o\b|\bpassagem\b|\bhotel\b|\bpacote\b|\bturismo\b|\bturista\b|\bpasseio\b|\baeropor\b/i,
    'social': /\bsocial\b|\bfesta\b|\bconfraterniza[çc][ãa]o\b|\ban?ivers[áa]rio\b|\bchurrasco\b|\bbar\b|\brestaurante\b|\bcaf[ée]\b|\balmo[çc]o\s+com\b|\bjantar\s+com\b/i,
  };
  
  // Special case: Social meals with people are social events
  if ((text.includes('almoço') || text.includes('jantar') || text.includes('café')) 
      && text.includes('com')) {
    return 'social';
  }
  
  // Task type can influence the category
  if (taskType === 'meeting') {
    return 'trabalho';
  }
  
  for (const [category, pattern] of Object.entries(categoryPatterns)) {
    if (pattern.test(text)) {
      return category;
    }
  }
  
  return null; // Return null if no category is detected
}

// Extract title from message
function extractTitle(text, taskType, dateText, timeText, location) {
  // Remove task creation verbs
  let cleanText = text.replace(/^(adicionar|criar|marcar|agendar|lembrar|lembrete para|adicione|crie|agende|coloque|insira|registre)\s+/i, '');
  
  // Remove date/time references 
  if (dateText) {
    cleanText = cleanText.replace(new RegExp(dateText, 'gi'), '');
  }
  
  if (timeText) {
    cleanText = cleanText.replace(new RegExp(timeText, 'gi'), '');
  }
  
  // Remove location if detected
  if (location) {
    cleanText = cleanText.replace(new RegExp(`(em|no|na|para|at[ée]) ${location}`, 'gi'), '');
    cleanText = cleanText.replace(new RegExp(location, 'gi'), '');
  }
  
  // Remove common prepositions and conjunctions at the beginning
  cleanText = cleanText.replace(/^(de|da|do|para|com|e|a|o|que|uma?)\s+/i, '');
  
  // Special case for "almoço com os pais da Gardenia"
  const socialMeal = text.match(/\b(almoço|jantar|café)\b.*\bcom\b.*\b(os|as)?\s*(pais|família|parentes)\s*d[aeo]\s*([A-Z][a-zÀ-ú]+)/i);
  if (socialMeal) {
    const mealType = socialMeal[1];
    const familyType = socialMeal[3];
    const personName = socialMeal[4];
    return `${mealType.charAt(0).toUpperCase() + mealType.slice(1)} com ${familyType} de ${personName}`;
  }
  
  // Clean extra spaces
  cleanText = cleanText.replace(/\s+/g, ' ').trim();
  
  // Get the first part of the text as title (up to 50 chars)
  let title = cleanText.split(/[,.;:\n]/, 1)[0].trim();
  
  // If title is empty after cleaning, use a default based on task type
  if (!title) {
    const defaults = {
      'meeting': 'Nova Reunião',
      'event': 'Novo Evento',
      'task': 'Nova Tarefa',
      'habit': 'Novo Hábito',
      'reminder': 'Novo Lembrete'
    };
    title = defaults[taskType] || 'Novo Compromisso';
  }
  
  // Limit title length
  if (title.length > 50) {
    title = title.substring(0, 47) + '...';
  }
  
  // Capitalize first letter
  return title.charAt(0).toUpperCase() + title.slice(1);
}

// Calculate event duration based on context
function calculateDuration(text, taskType) {
  // Look for explicit duration mentions
  const durationPatterns = [
    /\bdura[çc][ãa]o(?:\s+de)?(?:\s+)(\d+)(?:\s+)(minutos?|horas?)\b/i,
    /\bpor\s+(\d+)(?:\s+)(minutos?|horas?)\b/i,
    /\bdurante\s+(\d+)(?:\s+)(minutos?|horas?)\b/i,
    /\b(\d+)(?:\s+)(minutos?|horas?)(?:\s+de\s+dura[çc][ãa]o)?\b/i
  ];
  
  for (const pattern of durationPatterns) {
    const match = text.match(pattern);
    if (match) {
      const amount = parseInt(match[1], 10);
      const unit = match[2].toLowerCase().startsWith('hora') ? 60 : 1;
      return amount * unit;
    }
  }
  
  // Special case for meals
  if (text.includes('almoço')) {
    return 90; // Almoços geralmente duram 1h30
  } else if (text.includes('jantar')) {
    return 120; // Jantares geralmente duram 2h
  } else if (text.includes('café')) {
    return 60; // Café geralmente dura 1h
  }
  
  // Default durations based on task type
  const defaultDurations = {
    'meeting': 60,
    'event': 120,
    'task': 30,
    'habit': 30,
    'reminder': 15
  };
  
  return defaultDurations[taskType] || 30;
}

// Extract description from message
function extractDescription(text, title, location) {
  // If the text contains 'para' followed by text that doesn't match the title or location, it might be a description
  const descriptionMatch = text.match(/\bpara\s+([^,.;:]+)/i);
  
  if (descriptionMatch && 
      descriptionMatch[1] && 
      !descriptionMatch[1].includes(title) && 
      (!location || !descriptionMatch[1].includes(location))) {
    return descriptionMatch[1].trim();
  }
  
  // Look for text after common separators
  const separatorMatch = text.match(/[,:;]\s+([^,.;:]+)$/i);
  if (separatorMatch) {
    return separatorMatch[1].trim();
  }
  
  return null;
}

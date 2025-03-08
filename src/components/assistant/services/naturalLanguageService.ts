import { Task } from "@/types/today";
import { format, parse, isValid, parseISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';

/**
 * Formata uma data ISO para exibição em formato legível
 */
const formatDateForDisplay = (dateStr: string): string => {
  try {
    const date = parseISO(dateStr);
    return format(date, "dd/MM/yyyy", { locale: ptBR });
  } catch (e) {
    return dateStr;
  }
};

// Tipos de comandos que o assistente pode processar
type CommandType = 'create' | 'update' | 'delete' | 'query' | 'summary' | 'optimize' | 'unknown';

// Interface para comandos de linguagem natural
export interface NaturalLanguageCommand {
  type: CommandType;
  originalText: string;
  parameters: {
    title?: string;
    date?: string;
    time?: string;
    location?: string;
    duration?: string;
    description?: string;
    priority?: string;
    taskId?: string;
    filter?: string;
    period?: string;
    [key: string]: any;
  };
}

// Interface para resultado de comando
export interface CommandResult {
  success: boolean;
  message: string;
  data?: any;
}

/**
 * Processa linguagem natural para identificar intenções e extrair parâmetros
 * @param text Texto do usuário
 * @param context Mensagens anteriores para contexto
 */
export const processNaturalLanguage = async (
  text: string, 
  context: any[] = []
): Promise<NaturalLanguageCommand> => {
  // Texto normalizado para processamento (minúsculas, sem acentos)
  const normalizedText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  
  // Detectar intenção principal
  const commandType = detectCommandType(normalizedText);
  
  // Extrair parâmetros relevantes baseado no tipo de comando
  const parameters = extractParameters(normalizedText, commandType);
  
  // Considerar o contexto da conversa para refinar a interpretação
  const refinedCommand = refineWithContext({
    type: commandType,
    originalText: text,
    parameters
  }, context);
  
  return refinedCommand;
};

/**
 * Detecta o tipo de comando na mensagem do usuário
 */
const detectCommandType = (text: string): CommandType => {
  // Criação de tarefas
  if (
    text.includes("criar") || 
    text.includes("agendar") || 
    text.includes("marcar") ||
    text.includes("nova tarefa") ||
    text.includes("novo compromisso") ||
    text.includes("adicionar") ||
    (text.includes("lembrar") && text.includes("de"))
  ) {
    return 'create';
  }
  
  // Atualização de tarefas
  if (
    text.includes("atualizar") || 
    text.includes("mudar") || 
    text.includes("alterar") || 
    text.includes("editar") ||
    text.includes("modificar") ||
    (text.includes("remarcar") && !text.includes("criar"))
  ) {
    return 'update';
  }
  
  // Exclusão de tarefas
  if (
    text.includes("excluir") || 
    text.includes("deletar") || 
    text.includes("remover") || 
    text.includes("cancelar") ||
    text.includes("apagar")
  ) {
    return 'delete';
  }
  
  // Consultas sobre tarefas
  if (
    text.includes("mostrar") || 
    text.includes("listar") || 
    text.includes("exibir") || 
    text.includes("quais") ||
    text.includes("ver") ||
    text.includes("tenho") ||
    text.includes("existe") ||
    text.includes("há") ||
    text.includes("quando") ||
    text.includes("agenda") ||
    text.includes("compromisso") ||
    text.includes("o que")
  ) {
    return 'query';
  }
  
  // Sumário/recapitulação
  if (
    text.includes("resumir") || 
    text.includes("resumo") || 
    text.includes("recapitular") ||
    text.includes("sintetizar") ||
    text.includes("sumarizar")
  ) {
    return 'summary';
  }
  
  // Otimização de tarefas
  if (
    text.includes("otimizar") || 
    text.includes("organizar") || 
    text.includes("priorizar") ||
    text.includes("reorganizar") ||
    text.includes("sugerir")
  ) {
    return 'optimize';
  }
  
  // Não foi possível determinar o comando
  return 'unknown';
};

/**
 * Extrai parâmetros relevantes do texto baseado no tipo de comando
 */
const extractParameters = (text: string, commandType: CommandType): Record<string, any> => {
  const parameters: Record<string, any> = {};
  
  // Extração de datas
  const datePatterns = [
    // Formato: dia/mês
    { 
      regex: /(\d{1,2})[\/\-](\d{1,2})(?:[\/\-](\d{2,4}))?/g,
      handler: (match: RegExpExecArray) => {
        const day = match[1].padStart(2, '0');
        const month = match[2].padStart(2, '0');
        const year = match[3] ? 
          (match[3].length === 2 ? `20${match[3]}` : match[3]) : 
          new Date().getFullYear().toString();
        
        return `${year}-${month}-${day}`;
      }
    },
    
    // Palavras-chave: hoje, amanhã, etc.
    {
      regex: /\b(hoje|amanha|amanhã|depois de amanha|depois de amanhã)\b/g,
      handler: (match: RegExpExecArray) => {
        const today = new Date();
        let date = new Date(today);
        
        if (match[1].includes('amanhã') || match[1].includes('amanha')) {
          date.setDate(today.getDate() + 1);
        } else if (match[1].includes('depois de amanhã') || match[1].includes('depois de amanha')) {
          date.setDate(today.getDate() + 2);
        }
        
        return format(date, 'yyyy-MM-dd');
      }
    },
    
    // Dias da semana
    {
      regex: /\b(segunda|terça|terca|quarta|quinta|sexta|sábado|sabado|domingo)\b(?:\s*(?:feira)?)?(?:\s+que\s+vem)?/g,
      handler: (match: RegExpExecArray) => {
        const today = new Date();
        const daysOfWeek = {
          'domingo': 0,
          'segunda': 1,
          'terça': 2,
          'terca': 2,
          'quarta': 3,
          'quinta': 4,
          'sexta': 5,
          'sábado': 6,
          'sabado': 6
        };
        
        const targetDay = daysOfWeek[match[1] as keyof typeof daysOfWeek];
        let daysToAdd = (targetDay - today.getDay() + 7) % 7;
        
        // Se for "próxima" ou "que vem", adiciona mais uma semana
        if (text.includes("que vem") || text.includes("próxima") || text.includes("proxima")) {
          daysToAdd += 7;
        }
        
        // Se for o mesmo dia e não tiver "próxima", usa a data de hoje
        if (daysToAdd === 0 && !text.includes("próxima") && !text.includes("proxima") && !text.includes("que vem")) {
          return format(today, 'yyyy-MM-dd');
        }
        
        // Se for o mesmo dia, mas estiver no passado, vai para o próximo
        if (daysToAdd === 0) {
          daysToAdd = 7;
        }
        
        const date = new Date(today);
        date.setDate(today.getDate() + daysToAdd);
        
        return format(date, 'yyyy-MM-dd');
      }
    },
    
    // Data em formato textual (ex: "10 de janeiro")
    {
      regex: /(\d{1,2})\s+(?:de\s+)?([a-zç]+)(?:\s+(?:de\s+)?(\d{2,4}))?/g,
      handler: (match: RegExpExecArray) => {
        const day = match[1].padStart(2, '0');
        const monthNames = {
          'janeiro': '01', 'jan': '01',
          'fevereiro': '02', 'fev': '02',
          'março': '03', 'mar': '03',
          'abril': '04', 'abr': '04',
          'maio': '05', 'mai': '05',
          'junho': '06', 'jun': '06',
          'julho': '07', 'jul': '07',
          'agosto': '08', 'ago': '08',
          'setembro': '09', 'set': '09',
          'outubro': '10', 'out': '10',
          'novembro': '11', 'nov': '11',
          'dezembro': '12', 'dez': '12'
        };
        
        const monthText = match[2].toLowerCase();
        const month = monthNames[monthText as keyof typeof monthNames];
        
        if (!month) {
          return null; // Mês inválido
        }
        
        const year = match[3] ? 
          (match[3].length === 2 ? `20${match[3]}` : match[3]) : 
          new Date().getFullYear().toString();
        
        return `${year}-${month}-${day}`;
      }
    }
  ];
  
  // Tentar extrair data com cada padrão
  for (const pattern of datePatterns) {
    let match: RegExpExecArray | null;
    pattern.regex.lastIndex = 0; // Reset regex index
    
    while ((match = pattern.regex.exec(text)) !== null) {
      const dateStr = pattern.handler(match);
      if (dateStr) {
        // Validar a data
        try {
          const parsedDate = parse(dateStr, 'yyyy-MM-dd', new Date());
          if (isValid(parsedDate)) {
            parameters.date = dateStr;
            break;
          }
        } catch (e) {
          // Data inválida, continua procurando
        }
      }
    }
    
    if (parameters.date) break;
  }
  
  // Extração de hora
  const timeRegex = /(\d{1,2})[:\s]?(\d{2})?(?:\s*(?:horas?|hrs?|h))?/g;
  let timeMatch;
  
  while ((timeMatch = timeRegex.exec(text)) !== null) {
    // Verifique se antes da expressão há palavras como "às", "as", "para"
    const preText = text.substring(0, timeMatch.index).trim();
    const hasTimeIndicator = /(?:as|às|para|em|de)\s*$/.test(preText);
    
    if (hasTimeIndicator || text.includes("hora") || text.includes("hrs")) {
      const hour = parseInt(timeMatch[1], 10);
      const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
      
      // Validação básica de hora (0-23) e minuto (0-59)
      if (hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59) {
        parameters.time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        break;
      }
    }
  }
  
  // Extração de local (após "em", "no", "na", "em", "local")
  const locationRegex = /(?:em|no|na|no|local|lugar)[\s:]*([^\.,;]+)/i;
  const locationMatch = text.match(locationRegex);
  
  if (locationMatch && locationMatch[1]) {
    parameters.location = locationMatch[1].trim();
  }
  
  // Extração de título com base no tipo de comando
  let titleText = '';
  
  if (commandType === 'create') {
    // Para criação, o título geralmente vem após palavras-chave como "criar", "agendar", etc.
    const titleRegex = /(?:criar|agendar|marcar|adicionar|nova tarefa|novo compromisso|lembrar de)\s+([^.,;]+)/i;
    const titleMatch = text.match(titleRegex);
    
    if (titleMatch && titleMatch[1]) {
      titleText = titleMatch[1].trim();
      
      // Limpar palavras que não fazem parte do título
      titleText = titleText
        .replace(/\bpara\b.*$/, '')
        .replace(/\bno dia\b.*$/, '')
        .replace(/\bna data\b.*$/, '')
        .replace(/\bem\b.*$/, '')
        .replace(/\bàs\b.*$/, '')
        .replace(/\bas\b.*$/, '')
        .trim();
    }
  } else if (commandType === 'update' || commandType === 'delete') {
    // Para atualização ou exclusão, o título geralmente vem após palavras-chave
    const titleRegex = /(?:atualizar|mudar|alterar|editar|excluir|deletar|remover|cancelar)\s+([^.,;]+)/i;
    const titleMatch = text.match(titleRegex);
    
    if (titleMatch && titleMatch[1]) {
      titleText = titleMatch[1].trim();
      
      // Limpar palavras que não fazem parte do título
      titleText = titleText
        .replace(/\bpara\b.*$/, '')
        .replace(/\bno dia\b.*$/, '')
        .replace(/\bna data\b.*$/, '')
        .replace(/\bem\b.*$/, '')
        .trim();
    }
  } else if (commandType === 'query') {
    // Para consultas, extrair possível filtro
    if (
      text.includes("hoje") || 
      text.includes("amanhã") || 
      text.includes("esta semana") || 
      text.includes("este mês")
    ) {
      if (text.includes("hoje")) {
        parameters.filter = "hoje";
      } else if (text.includes("amanhã") || text.includes("amanha")) {
        parameters.filter = "amanhã";
      } else if (text.includes("esta semana") || text.includes("proxima semana") || text.includes("próxima semana")) {
        parameters.filter = "semana";
      } else if (text.includes("este mês") || text.includes("proximo mes") || text.includes("próximo mês")) {
        parameters.filter = "mês";
      }
    }
    
    // Extrair possível período para resumo
    if (text.includes("resumo") || text.includes("resumir") || text.includes("recapitular")) {
      if (text.includes("semana")) {
        parameters.period = "semana";
      } else if (text.includes("mês") || text.includes("mes")) {
        parameters.period = "mês";
      } else if (text.includes("dia")) {
        parameters.period = "dia";
      }
    }
  }
  
  // Definir título se encontrado
  if (titleText) {
    parameters.title = titleText;
  }
  
  // Extração de duração
  const durationRegex = /(?:duração|duracao|durar|durante)\s+(?:de\s+)?(\d+)\s*(?:min|minutos?|hora|horas?|h)/i;
  const durationMatch = text.match(durationRegex);
  
  if (durationMatch && durationMatch[1]) {
    const duration = parseInt(durationMatch[1], 10);
    if (!isNaN(duration)) {
      if (text.includes("min") || text.includes("minuto")) {
        parameters.duration = `${duration}min`;
      } else if (text.includes("hora")) {
        parameters.duration = duration === 1 ? "1h" : `${duration}h`;
      }
    }
  }
  
  // Extração de prioridade
  if (text.includes("prioridade alta") || text.includes("alta prioridade")) {
    parameters.priority = "high";
  } else if (text.includes("prioridade média") || text.includes("media prioridade")) {
    parameters.priority = "medium";
  } else if (text.includes("prioridade baixa") || text.includes("baixa prioridade")) {
    parameters.priority = "low";
  }
  
  return parameters;
};

/**
 * Refina o comando com base no contexto da conversa
 */
const refineWithContext = (
  command: NaturalLanguageCommand, 
  context: any[]
): NaturalLanguageCommand => {
  // Se o comando for desconhecido, tenta interpretar com base no contexto
  if (command.type === 'unknown' && context.length > 0) {
    // Verificar últimas mensagens para entender o contexto
    const lastMessages = context.slice(-3);
    
    // Verificar se está em um fluxo de criação de tarefa
    const isInTaskCreationFlow = lastMessages.some(msg => 
      msg.role === 'assistant' && 
      (msg.content.includes("Você quer criar uma tarefa") || 
       msg.content.includes("Que horas") ||
       msg.content.includes("Em qual data"))
    );
    
    if (isInTaskCreationFlow) {
      // Provavelmente é parte de um fluxo de criação
      command.type = 'create';
      
      // Extrair informações com base na última pergunta do assistente
      const lastAssistantMessage = lastMessages.filter(msg => msg.role === 'assistant').pop();
      
      if (lastAssistantMessage) {
        if (lastAssistantMessage.content.includes("Que horas")) {
          // Resposta para horário
          const timeRegex = /(\d{1,2})(?::(\d{2}))?/;
          const match = command.originalText.match(timeRegex);
          
          if (match) {
            const hour = match[1];
            const minute = match[2] || "00";
            command.parameters.time = `${hour.padStart(2, '0')}:${minute}`;
          }
        } else if (lastAssistantMessage.content.includes("Em qual data") || 
                  lastAssistantMessage.content.includes("Qual dia")) {
          // Resposta para data
          // Já tratado na extração de parâmetros
        } else if (lastAssistantMessage.content.includes("local") || 
                  lastAssistantMessage.content.includes("onde")) {
          // Resposta para local
          command.parameters.location = command.originalText;
        }
      }
    }
  }
  
  return command;
};

/**
 * Executa um comando de linguagem natural
 */
export const executeNaturalLanguageCommand = async (
  command: NaturalLanguageCommand,
  tasks: Task[]
): Promise<CommandResult> => {
  try {
    switch (command.type) {
      case 'create':
        return handleCreateCommand(command, tasks);
      
      case 'update':
        return handleUpdateCommand(command, tasks);
      
      case 'delete':
        return handleDeleteCommand(command, tasks);
      
      case 'query':
        return handleQueryCommand(command, tasks);
      
      case 'summary':
        return handleSummaryCommand(command, tasks);
      
      case 'optimize':
        return {
          success: true,
          message: "Analisei suas tarefas e organizei sua agenda da melhor forma possível. Agora suas tarefas estão melhor distribuídas ao longo do dia para otimizar sua produtividade.",
          data: tasks
        };
      
      default:
        return {
          success: false,
          message: "Não entendi completamente. Posso ajudar a gerenciar suas tarefas, consultar compromissos, ou criar novos eventos."
        };
    }
  } catch (error) {
    console.error("Erro ao executar comando:", error);
    return {
      success: false,
      message: "Desculpe, houve um problema ao processar seu pedido. Pode tentar de novo com outras palavras?"
    };
  }
};

/**
 * Simula o manuseio de comando de criação de tarefa
 */
const handleCreateCommand = async (
  command: NaturalLanguageCommand,
  tasks: Task[]
): Promise<CommandResult> => {
  const { title, date, time, location } = command.parameters;
  
  if (!title) {
    return {
      success: false,
      message: "Para criar uma tarefa, preciso de um título. Pode me dizer qual é o título da tarefa?"
    };
  }
  
  // Simular criação de tarefa
  return {
    success: true,
    message: `Ótimo! Criei a tarefa "${title}"${
      date ? ` para ${formatDateForDisplay(date)}` : ''
    }${time ? ` às ${time}` : ''}${
      location ? ` em ${location}` : ''
    }.`,
    data: {
      title,
      date,
      time,
      location
    }
  };
};

/**
 * Simula o manuseio de comando de atualização de tarefa
 */
const handleUpdateCommand = async (
  command: NaturalLanguageCommand,
  tasks: Task[]
): Promise<CommandResult> => {
  const { title } = command.parameters;
  
  if (!title) {
    return {
      success: false,
      message: "Para atualizar uma tarefa, preciso saber qual tarefa você quer modificar. Pode me dizer o título da tarefa?"
    };
  }
  
  // Procurar tarefa no array de tarefas
  const matchingTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(title.toLowerCase())
  );
  
  if (matchingTasks.length === 0) {
    return {
      success: false,
      message: `Não encontrei nenhuma tarefa com o título "${title}". Pode verificar o nome e tentar novamente?`
    };
  }
  
  if (matchingTasks.length > 1) {
    return {
      success: false,
      message: `Encontrei várias tarefas que correspondem a "${title}". Pode ser mais específico?`
    };
  }
  
  // Simular atualização de tarefa
  return {
    success: true,
    message: `Atualizei a tarefa "${matchingTasks[0].title}" com as novas informações. O que mais posso fazer por você?`,
    data: matchingTasks[0]
  };
};

/**
 * Simula o manuseio de comando de exclusão de tarefa
 */
const handleDeleteCommand = async (
  command: NaturalLanguageCommand,
  tasks: Task[]
): Promise<CommandResult> => {
  const { title } = command.parameters;
  
  if (!title) {
    return {
      success: false,
      message: "Para excluir uma tarefa, preciso saber qual tarefa você quer remover. Pode me dizer o título da tarefa?"
    };
  }
  
  // Procurar tarefa no array de tarefas
  const matchingTasks = tasks.filter(task => 
    task.title.toLowerCase().includes(title.toLowerCase())
  );
  
  if (matchingTasks.length === 0) {
    return {
      success: false,
      message: `Não encontrei nenhuma tarefa com o título "${title}". Pode verificar o nome e tentar novamente?`
    };
  }
  
  if (matchingTasks.length > 1) {
    return {
      success: false,
      message: `Encontrei várias tarefas que correspondem a "${title}". Pode ser mais específico?`
    };
  }
  
  // Simular exclusão de tarefa
  return {
    success: true,
    message: `Removi a tarefa "${matchingTasks[0].title}" da sua agenda. Posso ajudar com mais alguma coisa?`,
    data: matchingTasks[0]
  };
};

/**
 * Simula o manuseio de comando de consulta de tarefas
 */
const handleQueryCommand = async (
  command: NaturalLanguageCommand,
  tasks: Task[]
): Promise<CommandResult> => {
  const { filter, date } = command.parameters;
  
  if (tasks.length === 0) {
    return {
      success: true,
      message: "Você não tem nenhuma tarefa agendada no momento."
    };
  }
  
  let filteredTasks = [...tasks];
  let filterDescription = "";
  
  // Aplicar filtros
  if (filter === "hoje" || (date && date === format(new Date(), 'yyyy-MM-dd'))) {
    const today = format(new Date(), 'yyyy-MM-dd');
    filteredTasks = tasks.filter(task => task.scheduled_date === today);
    filterDescription = " para hoje";
  } else if (filter === "amanhã") {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowFormatted = format(tomorrow, 'yyyy-MM-dd');
    filteredTasks = tasks.filter(task => task.scheduled_date === tomorrowFormatted);
    filterDescription = " para amanhã";
  } else if (filter === "semana") {
    // Implementar filtro para a semana
    filterDescription = " para esta semana";
  } else if (filter === "mês") {
    // Implementar filtro para o mês
    filterDescription = " para este mês";
  } else if (date) {
    filteredTasks = tasks.filter(task => task.scheduled_date === date);
    filterDescription = ` para ${formatDateForDisplay(date)}`;
  }
  
  if (filteredTasks.length === 0) {
    return {
      success: true,
      message: `Você não tem tarefas agendadas${filterDescription}.`
    };
  }
  
  // Formatar resposta
  const taskList = filteredTasks.map(task => {
    let taskDescription = `- ${task.title}`;
    if (task.start_time) {
      taskDescription += ` às ${task.start_time}`;
    }
    return taskDescription;
  }).join("\n");
  
  return {
    success: true,
    message: `Aqui estão suas tarefas${filterDescription}:\n\n${taskList}`,
    data: filteredTasks
  };
};

/**
 * Simula o manuseio de comando de resumo/recapitulação
 */
const handleSummaryCommand = async (
  command: NaturalLanguageCommand,
  tasks: Task[]
): Promise<CommandResult> => {
  const { period } = command.parameters;
  
  if (tasks.length === 0) {
    return {
      success: true,
      message: "Você não tem nenhuma tarefa agendada para resumir."
    };
  }
  
  let periodDescription = "agendadas";
  if (period === "dia") {
    periodDescription = "para hoje";
  } else if (period === "semana") {
    periodDescription = "para esta semana";
  } else if (period === "mês") {
    periodDescription = "para este mês";
  }
  
  const completedTasks = tasks.filter(task => task.completed).length;
  const pendingTasks = tasks.length - completedTasks;
  
  // Criar um resumo contextual
  let summary = `Você tem ${tasks.length} tarefas ${periodDescription}. `;
  
  if (completedTasks > 0) {
    summary += `Você já concluiu ${completedTasks} ${completedTasks === 1 ? 'tarefa' : 'tarefas'} e tem ${pendingTasks} ${pendingTasks === 1 ? 'tarefa pendente' : 'tarefas pendentes'}.`;
  } else {
    summary += `Todas as ${tasks.length} tarefas estão pendentes.`;
  }
  
  // Adicionar informações sobre próximas tarefas
  if (pendingTasks > 0) {
    const today = format(new Date(), 'yyyy-MM-dd');
    const upcomingTasks = tasks
      .filter(task => !task.completed && task.scheduled_date >= today)
      .sort((a, b) => a.scheduled_date.localeCompare(b.scheduled_date) || 
                      (a.start_time || '').localeCompare(b.start_time || ''))
      .slice(0, 3);
    
    if (upcomingTasks.length > 0) {
      summary += "\n\nPróximas tarefas:";
      upcomingTasks.forEach(task => {
        summary += `\n- ${task.title}`;
        
        if (task.scheduled_date !== today) {
          summary += ` em ${formatDateForDisplay(task.scheduled_date)}`;
        }
        
        if (task.start_time) {
          summary += ` às ${task.start_time}`;
        }
      });
    }
  }
  
  return {
    success: true,
    message: summary,
    data: {
      totalTasks: tasks.length,
      completedTasks,
      pendingTasks
    }
  };
};

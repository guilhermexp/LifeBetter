import { HabitImplementation } from "@/data/knowledgeBase";
import { AITip } from "./types";
import { AreaType } from "@/types/habits";
import { HabitPlan } from "./types";
import { supabase } from "@/integrations/supabase/client";

// Sugestões locais de fallback para quando a API falhar
const LOCAL_SUGGESTIONS = {
  health: [
    {
      title: "Meditação Matinal",
      description: "Comece seu dia com 10 minutos de meditação para clareza mental",
      area: "health",
      type: "habit",
      source_type: "study",
      tags: ["mindfulness", "bem-estar"],
      study: {
        finding: "A meditação regular reduz o estresse em até 40% e melhora a clareza mental",
        source: "Journal of Mindfulness Research",
        application: "Prática diária por 8 semanas mostrou resultados significativos"
      },
      implementation: {
        recommendedFrequency: "daily",
        recommendedTimes: "1x por dia",
        durationPeriod: "test",
        testDuration: 21,
        bestTimeOfDay: "Manhã",
        progressionSteps: [
          "Comece com 5 minutos",
          "Aumente para 10 minutos",
          "Experimente diferentes técnicas"
        ],
        adaptationTips: [
          "Use app de meditação guiada",
          "Crie espaço dedicado"
        ],
        scientificBasis: "Estudos mostram que a meditação regular reduz estresse e melhora foco"
      }
    },
    {
      title: "Hidratação Constante",
      description: "Beber 2 litros de água diariamente para melhorar saúde geral",
      area: "health",
      type: "habit",
      source_type: "study",
      tags: ["hidratação", "saúde"],
      study: {
        finding: "A hidratação adequada melhora a função cognitiva em até 30%",
        source: "Journal of Hydration Science",
        application: "Beber água regularmente ao longo do dia é mais eficaz"
      },
      implementation: {
        recommendedFrequency: "daily",
        recommendedTimes: "8x por dia",
        durationPeriod: "permanent",
        bestTimeOfDay: "Ao longo do dia",
        progressionSteps: [
          "Comece com 1 litro",
          "Aumente para 2 litros",
          "Distribua ao longo do dia"
        ],
        adaptationTips: [
          "Use garrafa marcada com horários",
          "Configure lembretes no celular"
        ],
        scientificBasis: "A hidratação adequada é essencial para todas as funções corporais"
      }
    }
  ],
  business: [
    {
      title: "Planejamento Semanal",
      description: "Dedique 30 minutos todo domingo para planejar sua semana",
      area: "business",
      type: "habit",
      source_type: "book",
      tags: ["produtividade", "organização"],
      reference: {
        title: "Getting Things Done",
        author: "David Allen"
      },
      implementation: {
        recommendedFrequency: "weekly",
        recommendedTimes: "1x por semana",
        durationPeriod: "permanent",
        bestTimeOfDay: "Domingo à noite",
        progressionSteps: [
          "Liste todas as tarefas pendentes",
          "Priorize por importância",
          "Distribua ao longo da semana"
        ],
        adaptationTips: [
          "Use um aplicativo de planejamento",
          "Bloquei horários específicos no calendário"
        ],
        scientificBasis: "O planejamento proativo reduz estresse e aumenta produtividade"
      }
    }
  ],
  family: [
    {
      title: "Jantar em Família",
      description: "Reserve tempo para jantar com a família sem eletrônicos",
      area: "family",
      type: "habit",
      source_type: "study",
      tags: ["conexão", "relacionamento"],
      study: {
        finding: "Jantares em família regulares melhoram coesão familiar em 40%",
        source: "Journal of Family Psychology",
        application: "Pelo menos 3 vezes por semana mostra resultados significativos"
      },
      implementation: {
        recommendedFrequency: "weekly",
        recommendedTimes: "3x por semana",
        durationPeriod: "permanent",
        bestTimeOfDay: "Noite",
        progressionSteps: [
          "Estabeleça dias fixos",
          "Crie regras sobre eletrônicos",
          "Inclua conversas significativas"
        ],
        adaptationTips: [
          "Prepare refeições com antecedência",
          "Envolva todos na preparação"
        ],
        scientificBasis: "Refeições compartilhadas fortalecem vínculos familiares"
      }
    }
  ],
  finances: [
    {
      title: "Revisão Financeira Semanal",
      description: "Dedique 15 minutos para revisar gastos e orçamento",
      area: "finances",
      type: "habit",
      source_type: "study",
      tags: ["finanças", "orçamento"],
      study: {
        finding: "Revisão regular aumenta economia em 12-15% em média",
        source: "Journal of Financial Planning",
        application: "Mais eficaz quando feito em dia fixo da semana"
      },
      implementation: {
        recommendedFrequency: "weekly",
        recommendedTimes: "1x por semana",
        durationPeriod: "permanent",
        bestTimeOfDay: "Domingo à noite",
        progressionSteps: [
          "Registre todos os gastos",
          "Compare com o orçamento",
          "Ajuste planos para a próxima semana"
        ],
        adaptationTips: [
          "Use aplicativo de finanças",
          "Automatize categorização de gastos"
        ],
        scientificBasis: "Consciência financeira regular melhora hábitos de consumo"
      }
    }
  ],
  spirituality: [
    {
      title: "Gratidão Diária",
      description: "Anote 3 coisas pelas quais você é grato todos os dias",
      area: "spirituality",
      type: "habit",
      source_type: "study",
      tags: ["gratidão", "bem-estar"],
      study: {
        finding: "Prática de gratidão aumenta bem-estar em 25%",
        source: "Journal of Positive Psychology",
        application: "Mais eficaz quando feito por escrito"
      },
      implementation: {
        recommendedFrequency: "daily",
        recommendedTimes: "1x por dia",
        durationPeriod: "test",
        testDuration: 30,
        bestTimeOfDay: "Noite",
        progressionSteps: [
          "Comece com 3 itens simples",
          "Evite repetir os mesmos itens",
          "Reflita sobre o porquê da gratidão"
        ],
        adaptationTips: [
          "Use um diário dedicado",
          "Faça antes de dormir para melhor descanso"
        ],
        scientificBasis: "Gratidão ativa áreas cerebrais relacionadas ao bem-estar"
      }
    }
  ]
};

export const generateHabitPlan = (tip: AITip): HabitPlan => {
  if (tip.implementation) {
    return {
      frequency: tip.implementation.recommendedFrequency,
      bestTime: tip.implementation.bestTimeOfDay,
      suggestedDuration: tip.implementation.durationPeriod === 'test' 
        ? `${tip.implementation.testDuration} dias de teste`
        : 'Permanente',
      implementation: tip.implementation
    };
  }

  if (tip.area === "health") {
    return {
      frequency: "daily",
      bestTime: "Manhã",
      suggestedDuration: "21 dias de teste",
      implementation: {
        recommendedFrequency: "daily",
        recommendedTimes: "1x por dia",
        durationPeriod: "test",
        testDuration: 21,
        bestTimeOfDay: "Manhã",
        progressionSteps: [
          "Comece devagar e aumente gradualmente",
          "Estabeleça um horário fixo",
          "Monitore seu progresso"
        ],
        adaptationTips: [
          "Comece com sessões curtas",
          "Crie lembretes visuais"
        ],
        scientificBasis: "Estudos mostram que hábitos de saúde são mais efetivos quando praticados pela manhã"
      }
    };
  }

  return {
    frequency: "daily",
    implementation: {
      recommendedFrequency: "daily",
      recommendedTimes: "1x por dia",
      durationPeriod: "permanent",
      bestTimeOfDay: "Flexível",
      progressionSteps: [
        "Defina um horário consistente",
        "Comece aos poucos",
        "Aumente gradualmente"
      ],
      adaptationTips: [
        "Seja consistente",
        "Monitore seu progresso"
      ],
      scientificBasis: "Pesquisas indicam que a consistência é chave para formar novos hábitos"
    }
  };
};

export const fetchHabitImplementation = async (habit: string, area: string) => {
  try {
    // Primeiro, tente obter da API
    try {
      const { data, error } = await supabase.functions.invoke('generate-suggestions', {
        body: { 
          habit, 
          area,
          type: 'implementation'
        }
      });

      if (!error && data?.suggestions && Array.isArray(data.suggestions)) {
        const matchingHabit = data.suggestions.find(s => s.title === habit) || data.suggestions[0];
        
        if (matchingHabit?.implementation) {
          return matchingHabit;
        }
      }
    } catch (apiError) {
      console.error('Erro ao chamar API de sugestões:', apiError);
      // Continue para o fallback
    }

    // Fallback: procurar nas sugestões locais
    const areaKey = area as keyof typeof LOCAL_SUGGESTIONS;
    if (LOCAL_SUGGESTIONS[areaKey]) {
      const localSuggestion = LOCAL_SUGGESTIONS[areaKey].find(s => 
        s.title.toLowerCase() === habit.toLowerCase()
      );
      
      if (localSuggestion) {
        return localSuggestion;
      }
    }

    // Se não encontrar, gere um plano padrão
    return generateHabitPlan({
      id: 'default',
      area: area as AreaType,
      title: habit,
      type: 'habit',
      source_type: 'study',
      description: '',
      tags: []
    });
  } catch (error) {
    console.error('Erro ao buscar implementação:', error);
    throw error;
  }
};

export const fetchAllAreaSuggestions = async (existingHabits: any[] = []) => {
  try {
    // Primeiro, tente obter da API
    try {
      const { data, error } = await supabase.functions.invoke('generate-suggestions', {
        body: {
          type: 'all-areas',
          existingHabits
        }
      });

      if (!error && data?.suggestions && Array.isArray(data.suggestions) && data.suggestions.length > 0) {
        return parseSuggestionsToAITips(data.suggestions);
      }
    } catch (apiError) {
      console.error('Erro ao chamar API de sugestões:', apiError);
      // Continue para o fallback
    }

    // Fallback: usar sugestões locais
    console.log('Usando sugestões locais de fallback');
    const allAreasSuggestions = [];
    
    // Pegar uma sugestão de cada área
    for (const areaKey of Object.keys(LOCAL_SUGGESTIONS) as Array<keyof typeof LOCAL_SUGGESTIONS>) {
      const areaSuggestions = LOCAL_SUGGESTIONS[areaKey];
      
      // Filtrar sugestões que já existem
      const filteredSuggestions = areaSuggestions.filter(suggestion => {
        return !existingHabits.some(habit => 
          habit.title.toLowerCase() === suggestion.title.toLowerCase() && 
          habit.area === suggestion.area
        );
      });
      
      // Adicionar uma sugestão desta área se houver disponível
      if (filteredSuggestions.length > 0) {
        allAreasSuggestions.push(filteredSuggestions[0]);
      } else if (areaSuggestions.length > 0) {
        // Se todas as sugestões já existem, adicione a primeira mesmo assim
        allAreasSuggestions.push(areaSuggestions[0]);
      }
    }
    
    return parseSuggestionsToAITips(allAreasSuggestions);
  } catch (error) {
    console.error('Erro ao buscar sugestões:', error);
    
    // Em caso de erro, retorne pelo menos algumas sugestões locais
    const fallbackSuggestions = [
      LOCAL_SUGGESTIONS.health[0],
      LOCAL_SUGGESTIONS.business[0]
    ];
    
    return parseSuggestionsToAITips(fallbackSuggestions);
  }
};

export const parseSuggestionsToAITips = (suggestions: any[]): AITip[] => {
  try {
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
      console.warn('Nenhuma sugestão para processar ou formato inválido');
      return [];
    }
    
    return suggestions.map((suggestion: any, index: number) => ({
      id: `ai-${Date.now()}-${index}`,
      area: suggestion.area || 'health',
      title: suggestion.title || 'Nova Sugestão',
      description: suggestion.description || '',
      type: suggestion.type || 'habit',
      source_type: suggestion.source_type || 'study',
      tags: Array.isArray(suggestion.tags) ? suggestion.tags : [],
      implementation: suggestion.implementation,
      study: suggestion.study,
      reference: suggestion.reference,
      quote: suggestion.quote
    }));
  } catch (error) {
    console.error('Error parsing AI suggestions:', error);
    return [];
  }
};

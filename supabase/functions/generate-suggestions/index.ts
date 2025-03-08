
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import "https://deno.land/x/xhr@0.1.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

console.log("Generate Suggestions function initialized");

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    console.log("Handling OPTIONS request");
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("Received request to generate suggestions");
    const { habit, area, type, existingHabits = [] } = await req.json()
    console.log('Received request:', { habit, area, type, existingHabits })

    // Se estamos buscando implementação específica
    if (type === 'implementation') {
      console.log("Generating implementation for:", habit);
      const implementation = {
        title: habit,
        area: area,
        type: "habit",
        source_type: "study",
        description: "Implementação personalizada do hábito",
        tags: ["personalizado"],
        implementation: {
          recommendedFrequency: "daily",
          recommendedTimes: "1x por dia",
          durationPeriod: "test",
          testDuration: 21,
          bestTimeOfDay: "Flexível",
          progressionSteps: [
            "Comece devagar",
            "Aumente gradualmente",
            "Mantenha consistência"
          ],
          adaptationTips: [
            "Escolha um horário fixo",
            "Use lembretes",
            "Acompanhe seu progresso"
          ],
          scientificBasis: "Baseado em estudos sobre formação de hábitos"
        }
      }

      console.log("Returning implementation suggestion");
      return new Response(
        JSON.stringify({ suggestions: [implementation] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Definir sugestões por área
    const suggestionsByArea = {
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
        },
        {
          title: "Leitura Profissional",
          description: "Leia material relacionado ao seu campo por 20 minutos diários",
          area: "business",
          type: "habit",
          source_type: "study",
          tags: ["desenvolvimento", "educação"],
          study: {
            finding: "Leitura regular na área profissional aumenta competência em 25%",
            source: "Harvard Business Review",
            application: "Mesmo períodos curtos diários têm efeito cumulativo significativo"
          },
          implementation: {
            recommendedFrequency: "daily",
            recommendedTimes: "1x por dia",
            durationPeriod: "permanent",
            bestTimeOfDay: "Noite",
            progressionSteps: [
              "Comece com 10 minutos",
              "Aumente para 20 minutos",
              "Diversifique suas fontes"
            ],
            adaptationTips: [
              "Mantenha livros/artigos acessíveis",
              "Use aplicativos de resumo para otimizar tempo"
            ],
            scientificBasis: "Aprendizado contínuo é essencial para desenvolvimento profissional"
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
        },
        {
          title: "Passeio de Fim de Semana",
          description: "Programe uma atividade familiar ao ar livre aos fins de semana",
          area: "family",
          type: "habit",
          source_type: "book",
          tags: ["lazer", "conexão"],
          reference: {
            title: "The Secrets of Happy Families",
            author: "Bruce Feiler"
          },
          implementation: {
            recommendedFrequency: "weekly",
            recommendedTimes: "1x por semana",
            durationPeriod: "permanent",
            bestTimeOfDay: "Manhã/tarde de sábado ou domingo",
            progressionSteps: [
              "Comece com atividades simples",
              "Varie os tipos de passeio",
              "Permita que todos opinem nas escolhas"
            ],
            adaptationTips: [
              "Prepare uma lista de possíveis passeios",
              "Leve em conta preferências de todos"
            ],
            scientificBasis: "Experiências compartilhadas em ambientes naturais fortalecem vínculos"
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
        },
        {
          title: "Poupança Automática",
          description: "Configure transferência automática para conta poupança",
          area: "finances",
          type: "habit",
          source_type: "book",
          tags: ["poupança", "investimentos"],
          reference: {
            title: "The Automatic Millionaire",
            author: "David Bach"
          },
          implementation: {
            recommendedFrequency: "monthly",
            recommendedTimes: "1x por mês",
            durationPeriod: "permanent",
            bestTimeOfDay: "Dia de pagamento",
            progressionSteps: [
              "Comece com 5% da renda",
              "Aumente gradualmente para 10-20%",
              "Diversifique investimentos"
            ],
            adaptationTips: [
              "Configure transferência automática",
              "Ajuste valor conforme aumentos salariais"
            ],
            scientificBasis: "Automação remove barreiras psicológicas à poupança"
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
        },
        {
          title: "Tempo na Natureza",
          description: "Passe 30 minutos em contato com a natureza",
          area: "spirituality",
          type: "habit",
          source_type: "study",
          tags: ["natureza", "contemplação"],
          study: {
            finding: "Tempo na natureza reduz níveis de cortisol em 20%",
            source: "Environmental Health and Preventive Medicine",
            application: "Mesmo pequenas exposições têm benefícios significativos"
          },
          implementation: {
            recommendedFrequency: "weekly",
            recommendedTimes: "2x por semana",
            durationPeriod: "permanent",
            bestTimeOfDay: "Manhã",
            progressionSteps: [
              "Comece com caminhadas em parques",
              "Pratique mindfulness na natureza",
              "Explore diferentes ambientes naturais"
            ],
            adaptationTips: [
              "Identifique áreas verdes próximas",
              "Combine com exercício físico para potencializar"
            ],
            scientificBasis: "Contato com natureza melhora bem-estar mental e espiritual"
          }
        }
      ]
    };

    // Por padrão, retorna sugestões da área solicitada ou health
    const targetArea = area || "health";
    const requestedAreaSuggestions = suggestionsByArea[targetArea] || suggestionsByArea.health;
    
    // Filtrar sugestões para remover hábitos já existentes
    const filteredSuggestions = requestedAreaSuggestions.filter(suggestion => {
      return !existingHabits.some(habit => 
        habit.title.toLowerCase() === suggestion.title.toLowerCase() && 
        habit.area === suggestion.area
      );
    });

    // Se solicitou para todas as áreas, retorna uma sugestão de cada área
    if (type === 'all-areas') {
      const allAreasSuggestions = [];
      for (const areaKey of Object.keys(suggestionsByArea)) {
        // Filtrar sugestões da área atual para remover hábitos já existentes
        const areaSuggestions = suggestionsByArea[areaKey].filter(suggestion => {
          return !existingHabits.some(habit => 
            habit.title.toLowerCase() === suggestion.title.toLowerCase() && 
            habit.area === suggestion.area
          );
        });
        
        // Adicionar uma sugestão desta área se houver disponível
        if (areaSuggestions.length > 0) {
          allAreasSuggestions.push(areaSuggestions[0]);
        }
      }
      
      return new Response(
        JSON.stringify({ suggestions: allAreasSuggestions }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Caso não haja sugestões filtradas, retorna original
    const suggestions = filteredSuggestions.length > 0 ? filteredSuggestions : requestedAreaSuggestions;

    console.log(`Returning ${suggestions.length} suggestions`);
    return new Response(
      JSON.stringify({ suggestions }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-suggestions:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        suggestions: [] // Sempre retorna um array vazio em caso de erro
      }),
      { 
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});


import { MoodEntry } from '@/hooks/useMoodTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BookOpen, Brain, Clock, Lightbulb, Music, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';

interface ActivitySuggestion {
  title: string;
  description: string;
  duration: string;
  icon: React.ReactNode;
  action?: string;
  link?: string;
}

interface WellnessSuggestionsProps {
  currentMood: MoodEntry;
  moodHistory: MoodEntry[];
  isLoading: boolean;
}

export function WellnessSuggestions({ currentMood, moodHistory, isLoading }: WellnessSuggestionsProps) {
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-full h-24" />
      </div>
    );
  }
  
  const getMoodBasedSuggestions = (): ActivitySuggestion[] => {
    // Default suggestions
    const defaultSuggestions: ActivitySuggestion[] = [
      {
        title: "Meditação de 5 minutos",
        description: "Uma breve pausa para respirar e recalibrar sua mente",
        duration: "5 min",
        icon: <Brain className="h-5 w-5 text-purple-500" />,
        action: "Adicionar ao planner"
      },
      {
        title: "Exercício de alongamento",
        description: "Alongamentos simples para relaxar o corpo e a mente",
        duration: "10 min",
        icon: <Activity className="h-5 w-5 text-green-500" />,
        action: "Adicionar aos hábitos"
      },
      {
        title: "Música relaxante",
        description: "Playlist para acalmar a mente e melhorar o foco",
        duration: "15 min",
        icon: <Music className="h-5 w-5 text-blue-500" />,
        action: "Ouvir agora"
      }
    ];
    
    // If no mood is selected, return default suggestions
    if (!currentMood.mood_type && moodHistory.length === 0) {
      return defaultSuggestions;
    }
    
    // Get the mood to base suggestions on
    const targetMood = currentMood.mood_type || 
      (moodHistory.length > 0 ? moodHistory[0].mood_type : null);
    
    // Custom suggestions based on mood
    switch (targetMood) {
      case 'anxiety':
        return [
          {
            title: "Respiração 4-7-8",
            description: "Técnica de respiração para reduzir a ansiedade rapidamente",
            duration: "3 min",
            icon: <Brain className="h-5 w-5 text-blue-500" />,
            action: "Iniciar agora"
          },
          {
            title: "Meditação guiada para ansiedade",
            description: "Meditação focada em acalmar pensamentos ansiosos",
            duration: "10 min",
            icon: <Lightbulb className="h-5 w-5 text-purple-500" />,
            action: "Adicionar ao planner"
          },
          {
            title: "Caminhada consciente",
            description: "Caminhar prestando atenção em cada passo e na respiração",
            duration: "15 min",
            icon: <Activity className="h-5 w-5 text-green-500" />,
            action: "Adicionar aos hábitos"
          }
        ];
      
      case 'anger':
        return [
          {
            title: "Pausa para respiração profunda",
            description: "Respirações profundas para reduzir a tensão e a raiva",
            duration: "5 min",
            icon: <Clock className="h-5 w-5 text-red-500" />,
            action: "Iniciar agora"
          },
          {
            title: "Escrever seus pensamentos",
            description: "Registre seus pensamentos para processar emoções difíceis",
            duration: "10 min",
            icon: <BookOpen className="h-5 w-5 text-amber-500" />,
            action: "Adicionar ao planner"
          },
          {
            title: "Exercício físico intenso",
            description: "Libere a energia acumulada com exercícios físicos",
            duration: "20 min",
            icon: <Zap className="h-5 w-5 text-orange-500" />,
            action: "Adicionar aos hábitos"
          }
        ];
        
      case 'fatigue':
        return [
          {
            title: "Pequena pausa energizante",
            description: "Exercícios rápidos para aumentar a energia e o foco",
            duration: "5 min",
            icon: <Zap className="h-5 w-5 text-yellow-500" />,
            action: "Iniciar agora"
          },
          {
            title: "Avaliação de hábitos de sono",
            description: "Revise sua rotina de sono para melhorar a qualidade",
            duration: "10 min",
            icon: <Lightbulb className="h-5 w-5 text-blue-500" />,
            action: "Ver dicas"
          },
          {
            title: "Caminhada ao ar livre",
            description: "Um pouco de ar fresco e movimento leve pode revigorar",
            duration: "15 min",
            icon: <Activity className="h-5 w-5 text-green-500" />,
            action: "Adicionar ao planner"
          }
        ];
        
      case 'sadness':
        return [
          {
            title: "Prática de gratidão",
            description: "Liste três coisas pelas quais você é grato hoje",
            duration: "5 min",
            icon: <BookOpen className="h-5 w-5 text-green-500" />,
            action: "Iniciar agora"
          },
          {
            title: "Conexão social",
            description: "Converse com um amigo ou familiar querido",
            duration: "15 min",
            icon: <Lightbulb className="h-5 w-5 text-indigo-500" />,
            action: "Lembrar mais tarde"
          },
          {
            title: "Música que eleva o humor",
            description: "Playlist com músicas para melhorar seu ânimo",
            duration: "20 min",
            icon: <Music className="h-5 w-5 text-pink-500" />,
            action: "Ouvir agora"
          }
        ];
        
      case 'vigor':
        return [
          {
            title: "Tarefa desafiadora",
            description: "Aproveite sua energia para enfrentar um desafio pendente",
            duration: "25 min",
            icon: <Zap className="h-5 w-5 text-amber-500" />,
            action: "Ver tarefas"
          },
          {
            title: "Planejamento estratégico",
            description: "Use essa energia para planejar seus próximos objetivos",
            duration: "15 min",
            icon: <Lightbulb className="h-5 w-5 text-blue-500" />,
            action: "Adicionar ao planner"
          },
          {
            title: "Exercício físico intenso",
            description: "Potencialize seu estado de energia com atividade física",
            duration: "30 min",
            icon: <Activity className="h-5 w-5 text-red-500" />,
            action: "Adicionar aos hábitos"
          }
        ];
        
      case 'happiness':
        return [
          {
            title: "Projeto criativo",
            description: "Use esse estado positivo para criar algo novo",
            duration: "30 min",
            icon: <Lightbulb className="h-5 w-5 text-pink-500" />,
            action: "Explorar ideias"
          },
          {
            title: "Compartilhar positividade",
            description: "Faça algo gentil por alguém para espalhar a alegria",
            duration: "10 min",
            icon: <BookOpen className="h-5 w-5 text-green-500" />,
            action: "Ver sugestões"
          },
          {
            title: "Registro de conquistas",
            description: "Documente suas vitórias recentes e celebre seu progresso",
            duration: "15 min",
            icon: <Brain className="h-5 w-5 text-purple-500" />,
            action: "Adicionar ao planner"
          }
        ];
        
      default:
        return defaultSuggestions;
    }
  };
  
  const suggestions = getMoodBasedSuggestions();
  
  const handleActionClick = (suggestion: ActivitySuggestion) => {
    switch (suggestion.action) {
      case "Adicionar ao planner":
        navigate("/planner");
        toast.success(`"${suggestion.title}" pode ser adicionado ao seu planner`);
        break;
      case "Adicionar aos hábitos":
        toast.success(`"${suggestion.title}" foi sugerido como um novo hábito`);
        // Could open habit creation modal here
        break;
      case "Iniciar agora":
        toast.success(`Iniciando "${suggestion.title}"`);
        // Could show a timer or guided content
        break;
      default:
        toast.info(`Ação para "${suggestion.title}" será implementada em breve`);
    }
  };
  
  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Lightbulb className="mr-2 h-5 w-5" />
            Sugestões Personalizadas
          </CardTitle>
          <CardDescription>
            {currentMood.mood_type ? 
              `Baseado no seu humor atual: ${currentMood.mood_type}` : 
              moodHistory.length > 0 ? 
                `Baseado no seu último registro de humor` : 
                `Sugestões gerais para melhorar seu bem-estar`
            }
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {suggestions.map((suggestion, index) => (
            <div key={index} className="flex items-start p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800">
              <div className="mr-4 mt-1">
                {suggestion.icon}
              </div>
              <div className="flex-1">
                <h4 className="font-medium">{suggestion.title}</h4>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{suggestion.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                    {suggestion.duration}
                  </span>
                  {suggestion.action && (
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => handleActionClick(suggestion)}
                    >
                      {suggestion.action}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

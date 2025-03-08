
import { useState, useCallback, useMemo } from "react";
import { 
  Clock, 
  Calendar, 
  Check, 
  Brain, 
  Sun, 
  Moon, 
  BookOpen, 
  List,
  ArrowRight,
  CheckSquare,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Sparkles
} from "lucide-react";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";

interface RoutineStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface ScienceTip {
  id: string;
  content: string;
  source: string;
  category: "brain" | "body" | "productivity" | "sleep";
  author?: string;
}

interface ToolSuggestion {
  id: string;
  name: string;
  description: string;
  link?: string;
  category: "planning" | "productivity" | "wellbeing" | "tracking";
}

export const RoutineSuggestionCard = () => {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const [activeTab, setActiveTab] = useState("steps");
  const [routineSteps, setRoutineSteps] = useState<RoutineStep[]>([
    {
      id: "step-1",
      title: "Defina seus horários fixos",
      description: "Estabeleça horários consistentes para acordar, dormir e fazer refeições, inclusive aos finais de semana.",
      completed: false
    },
    {
      id: "step-2",
      title: "Crie blocos de tempo",
      description: "Divida seu dia em blocos dedicados a trabalho intenso, comunicação, lazer e descanso.",
      completed: false
    },
    {
      id: "step-3",
      title: "Otimize sua energia natural",
      description: "Programe tarefas complexas para o período em que você está naturalmente mais alerta e produtivo.",
      completed: false
    },
    {
      id: "step-4",
      title: "Evite sobrecarga",
      description: "Não programe mais de 5 tarefas importantes por dia. Seja realista sobre o que você pode realizar.",
      completed: false
    },
    {
      id: "step-5",
      title: "Adapte sua rotina conforme o progresso",
      description: "Revise semanalmente o que funcionou e o que não funcionou, ajustando sua rotina conforme necessário.",
      completed: false
    }
  ]);

  // Usando useMemo para evitar recriação destas arrays a cada render
  const scienceTips = useMemo<ScienceTip[]>(() => [
    {
      id: "science-1",
      content: "A exposição à luz solar pela manhã ajuda a regular seu relógio biológico e melhora a qualidade do sono à noite.",
      source: "Andrew Huberman Lab",
      category: "brain",
      author: "Dr. Andrew Huberman"
    },
    {
      id: "science-2",
      content: "Trabalhar em blocos de 90 minutos seguidos de 15-20 minutos de descanso respeita os ciclos naturais do cérebro.",
      source: "Deep Work",
      category: "productivity",
      author: "Cal Newport"
    },
    {
      id: "science-3",
      content: "Exercícios físicos pela manhã aumentam os níveis de BDNF, uma proteína que melhora a função cognitiva durante o dia.",
      source: "The Scientific Guide to a Better Morning Routine",
      category: "body",
      author: "James Clear"
    },
    {
      id: "science-4",
      content: "Criar rituais de início e fim para períodos de trabalho reduz a procrastinação e aumenta o foco.",
      source: "Atomic Habits",
      category: "productivity",
      author: "James Clear"
    },
    {
      id: "science-5",
      content: "A temperatura corporal diminui para adormecer. Um banho quente 1-2 horas antes de dormir ajuda nesse processo.",
      source: "Why We Sleep",
      category: "sleep",
      author: "Matthew Walker"
    }
  ], []);

  const toolSuggestions = useMemo<ToolSuggestion[]>(() => [
    {
      id: "tool-1",
      name: "Google Agenda",
      description: "Organize sua rotina com blocos de tempo visualizando todo seu dia de forma estruturada.",
      link: "https://calendar.google.com",
      category: "planning"
    },
    {
      id: "tool-2",
      name: "Técnica Pomodoro",
      description: "Trabalhe em blocos de 25 minutos com intervalos de 5 minutos para manter o foco e evitar fadiga mental.",
      category: "productivity"
    },
    {
      id: "tool-3",
      name: "Método Eisenhower",
      description: "Classifique tarefas por urgência e importância para priorizar o que realmente importa em sua rotina.",
      category: "planning"
    },
    {
      id: "tool-4",
      name: "Journaling Matinal",
      description: "Escreva suas intenções para o dia por 5-10 minutos pela manhã para maior clareza mental.",
      category: "wellbeing"
    },
    {
      id: "tool-5",
      name: "Tracking de Hábitos",
      description: "Monitore a consistência da sua rotina e visualize seu progresso a longo prazo.",
      category: "tracking"
    }
  ], []);

  const personalizedSuggestions = useMemo(() => [
    "Seus dados indicam que você tem mais energia pela manhã. Reserve este período para tarefas que exigem maior concentração.",
    "Notamos que você frequentemente pula o almoço. Intervalos regulares para refeições aumentam a produtividade geral.",
    "Você costuma trabalhar até tarde. Estabelecer um horário fixo para encerrar o trabalho melhora a qualidade do sono."
  ], []);

  const progress = (routineSteps.filter(step => step.completed).length / routineSteps.length) * 100;

  const toggleStepCompletion = useCallback((id: string) => {
    setRoutineSteps(steps => 
      steps.map(step => 
        step.id === id 
          ? { ...step, completed: !step.completed } 
          : step
      )
    );
    
    const step = routineSteps.find(s => s.id === id);
    if (step) {
      toast({
        title: !step.completed ? "Etapa concluída!" : "Etapa desmarcada",
        description: !step.completed 
          ? "Continue seguindo os passos para criar uma rotina eficaz" 
          : "Você pode marcar novamente quando completar esta etapa",
      });
    }
  }, [routineSteps, toast]);

  const getCategoryIcon = useCallback((category: string) => {
    switch (category) {
      case "brain":
        return <Brain className="w-4 h-4 text-purple-500" />;
      case "body":
        return <Sun className="w-4 h-4 text-orange-500" />;
      case "productivity":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "sleep":
        return <Moon className="w-4 h-4 text-indigo-500" />;
      case "planning":
        return <Calendar className="w-4 h-4 text-green-500" />;
      case "wellbeing":
        return <Sun className="w-4 h-4 text-yellow-500" />;
      case "tracking":
        return <CheckSquare className="w-4 h-4 text-teal-500" />;
      default:
        return <BookOpen className="w-4 h-4 text-gray-500" />;
    }
  }, []);

  const addToCalendar = useCallback(() => {
    toast({
      title: "Rotina adicionada ao calendário!",
      description: "Suas atividades foram programadas e você receberá lembretes.",
    });
  }, [toast]);

  return (
    <Card className="shadow-lg border-2 hover:border-primary/40 transition-all duration-300">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-start">
          <CardTitle className="text-xl font-bold flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Crie Rotinas Funcionais
          </CardTitle>
          <Badge variant="outline" className="bg-primary/10 text-primary font-medium">
            Baseado em Ciência
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="text-sm text-gray-600">
          <p className="mb-2">Estabeleça uma rotina eficaz seguindo princípios científicos de produtividade e bem-estar.</p>
          
          <div className="mt-3">
            <div className="flex justify-between items-center mb-1.5 text-sm">
              <span className="font-medium">Seu progresso</span>
              <span className="text-primary font-medium">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>

        <div className="pt-2 space-y-3">
          <div className="font-medium flex items-center gap-1.5">
            <Sun className="w-4 h-4 text-amber-500" />
            <h3>Dica do dia:</h3>
          </div>
          <p className="text-sm text-gray-700 bg-amber-50 p-3 rounded-lg border border-amber-100">
            "O segredo de uma boa rotina não é otimizar cada minuto, mas criar espaço para o que realmente importa. Estruture seu dia em torno de suas prioridades, não suas urgências."
          </p>
        </div>

        <div className="pt-1">
          <div className="font-medium flex items-center gap-1.5 mb-2.5">
            <List className="w-4 h-4 text-primary" />
            <h3>Passos para uma rotina eficaz:</h3>
          </div>
          
          <div className="space-y-2.5">
            {routineSteps.slice(0, showDetails ? undefined : 3).map((step) => (
              <div 
                key={step.id} 
                className="flex items-start gap-3 p-2.5 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Button
                  size="sm"
                  variant={step.completed ? "default" : "outline"}
                  className={`h-6 w-6 rounded-full p-0 ${step.completed ? 'bg-primary' : 'text-gray-400'}`}
                  onClick={() => toggleStepCompletion(step.id)}
                >
                  <Check className="h-4 w-4" />
                  <span className="sr-only">Mark as {step.completed ? 'incomplete' : 'complete'}</span>
                </Button>
                <div>
                  <p className={`text-sm font-medium ${step.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {step.title}
                  </p>
                  <p className={`text-xs ${step.completed ? 'text-gray-400' : 'text-gray-600'}`}>
                    {step.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
          
          {routineSteps.length > 3 && (
            <Button 
              variant="ghost" 
              className="w-full mt-2 text-xs h-8" 
              onClick={() => setShowDetails(!showDetails)}
            >
              {showDetails ? (
                <>
                  <ChevronUp className="h-4 w-4 mr-1" />
                  Ver menos
                </>
              ) : (
                <>
                  <ChevronDown className="h-4 w-4 mr-1" />
                  Ver todos os {routineSteps.length} passos
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>

      <CardFooter className="flex gap-2">
        <Dialog>
          <DialogTrigger asChild>
            <Button className="flex-1" variant="default">
              <Brain className="mr-2 h-4 w-4" />
              Estratégias Avançadas
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl">
                <Clock className="h-5 w-5 text-primary" />
                Crie Rotinas Funcionais
              </DialogTitle>
              <DialogDescription>
                Estratégias baseadas em neurociência e produtividade para otimizar sua rotina diária.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs 
              defaultValue="steps" 
              value={activeTab} 
              onValueChange={setActiveTab}
              className="mt-4"
            >
              <TabsList className="grid grid-cols-4 mb-4">
                <TabsTrigger value="steps" className="text-xs sm:text-sm">
                  <List className="h-4 w-4 mr-1 hidden sm:inline" />
                  Passos
                </TabsTrigger>
                <TabsTrigger value="science" className="text-xs sm:text-sm">
                  <Brain className="h-4 w-4 mr-1 hidden sm:inline" />
                  Ciência
                </TabsTrigger>
                <TabsTrigger value="tools" className="text-xs sm:text-sm">
                  <Calendar className="h-4 w-4 mr-1 hidden sm:inline" />
                  Ferramentas
                </TabsTrigger>
                <TabsTrigger value="personal" className="text-xs sm:text-sm">
                  <Sparkles className="h-4 w-4 mr-1 hidden sm:inline" />
                  Para Você
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="steps" className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium">
                      Passos Para Criar Sua Rotina Ideal
                    </h3>
                    <Badge variant="outline" className="bg-primary/10">
                      {routineSteps.filter(s => s.completed).length}/{routineSteps.length} Completos
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {routineSteps.map((step, index) => (
                      <div 
                        key={step.id} 
                        className="flex gap-4 p-4 rounded-lg border bg-white hover:border-primary/30 transition-colors"
                      >
                        <div className="flex items-center justify-center bg-primary/10 text-primary rounded-full w-8 h-8 flex-shrink-0 font-bold">
                          {index + 1}
                        </div>
                        <div className="flex-1 space-y-2">
                          <div className="flex justify-between">
                            <h4 className="font-medium">{step.title}</h4>
                            <Button
                              size="sm"
                              variant={step.completed ? "default" : "outline"}
                              className="h-7"
                              onClick={() => toggleStepCompletion(step.id)}
                            >
                              {step.completed ? 'Concluído' : 'Marcar'}
                              <Check className="ml-1 h-4 w-4" />
                            </Button>
                          </div>
                          <p className="text-sm text-gray-600">{step.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex justify-center pt-2">
                  <Button 
                    onClick={addToCalendar}
                    className="gap-2"
                  >
                    <Calendar className="h-4 w-4" />
                    Adicionar ao Meu Calendário
                  </Button>
                </div>
              </TabsContent>
              
              <TabsContent value="science" className="space-y-4">
                <h3 className="text-lg font-medium mb-3">
                  Ciência Por Trás de Rotinas Eficazes
                </h3>
                
                <div className="grid gap-3">
                  {scienceTips.map((tip) => (
                    <div 
                      key={tip.id} 
                      className="p-4 rounded-lg border bg-white hover:shadow-md transition-all"
                    >
                      <div className="flex items-center gap-2 mb-2">
                        {getCategoryIcon(tip.category)}
                        <span className="text-xs font-medium uppercase text-gray-500">{tip.category}</span>
                      </div>
                      <p className="text-sm text-gray-800 mb-2">"{tip.content}"</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                        <span className="font-medium">{tip.source}</span>
                        {tip.author && (
                          <span className="ml-1">por {tip.author}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="tools" className="space-y-4">
                <h3 className="text-lg font-medium mb-3">
                  Ferramentas Para Construir Sua Rotina
                </h3>
                
                <div className="grid gap-3">
                  {toolSuggestions.map((tool) => (
                    <div 
                      key={tool.id} 
                      className="p-4 rounded-lg border bg-white hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 mb-2">
                          {getCategoryIcon(tool.category)}
                          <h4 className="font-medium">{tool.name}</h4>
                        </div>
                        {tool.link && (
                          <a 
                            href={tool.link} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary/80 transition-colors"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-gray-600">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </TabsContent>
              
              <TabsContent value="personal" className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Sparkles className="h-5 w-5 text-amber-500" />
                  <h3 className="text-lg font-medium">
                    Sugestões Personalizadas Para Você
                  </h3>
                </div>
                
                <div className="space-y-4 mb-6">
                  {personalizedSuggestions.map((suggestion, index) => (
                    <div 
                      key={`suggestion-${index}`} 
                      className="flex gap-3 p-4 rounded-lg border bg-white hover:border-primary/30 transition-colors"
                    >
                      <div className="mt-0.5">
                        <ArrowRight className="h-4 w-4 text-primary" />
                      </div>
                      <p className="text-sm text-gray-700">{suggestion}</p>
                    </div>
                  ))}
                </div>
                
                <div className="flex justify-center pt-2">
                  <Button variant="outline" className="gap-2">
                    <Calendar className="h-4 w-4" />
                    Gerar Mais Sugestões
                  </Button>
                </div>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
        
        <Button 
          variant="outline"
          onClick={addToCalendar}
        >
          <Calendar className="h-4 w-4" />
        </Button>
      </CardFooter>
    </Card>
  );
};

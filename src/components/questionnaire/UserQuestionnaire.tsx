import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { useUser } from "@/providers/UserProvider";

// Question structure
interface QuestionOption {
  value: number;
  label: string;
}

interface Question {
  id: string;
  text: string;
  options: QuestionOption[];
  area: string;
}

// Areas
const AREAS = {
  HEALTH: "health",
  CAREER_FINANCES: "business",
  PERSONAL_GROWTH: "growth",
  RELATIONSHIPS: "relationships",
  QUALITY_OF_LIFE: "impact"
};

// Questions based on the specified areas
const questions: Question[] = [
  // Saúde & Bem-estar
  {
    id: "q1",
    text: "Com que frequência você pratica atividades físicas por semana?",
    options: [
      { value: 0, label: "Nunca" },
      { value: 25, label: "1-2 vezes" },
      { value: 50, label: "3-4 vezes" },
      { value: 75, label: "5-6 vezes" },
      { value: 100, label: "Todos os dias" }
    ],
    area: AREAS.HEALTH
  },
  {
    id: "q2",
    text: "Como você avalia sua alimentação diária?",
    options: [
      { value: 0, label: "Péssima – Como muitos ultraprocessados e fast food" },
      { value: 25, label: "Ruim – Tento me alimentar bem, mas como muitos doces e industrializados" },
      { value: 50, label: "Média – Me alimento bem, mas sem muita disciplina" },
      { value: 75, label: "Boa – Como saudável, mas poderia melhorar" },
      { value: 100, label: "Excelente – Tenho uma alimentação equilibrada e saudável" }
    ],
    area: AREAS.HEALTH
  },
  {
    id: "q3",
    text: "Quantas horas de sono você tem por noite, em média?",
    options: [
      { value: 0, label: "Menos de 4 horas" },
      { value: 33, label: "4-5 horas" },
      { value: 66, label: "6-7 horas" },
      { value: 100, label: "8 horas ou mais" }
    ],
    area: AREAS.HEALTH
  },
  {
    id: "q4",
    text: "Como você avalia seus níveis de estresse e ansiedade?",
    options: [
      { value: 0, label: "Muito alto – Me sinto constantemente exausto e ansioso" },
      { value: 25, label: "Alto – Sinto que minha mente está sempre ocupada" },
      { value: 50, label: "Moderado – Tenho momentos de estresse, mas consigo lidar" },
      { value: 75, label: "Baixo – Geralmente estou tranquilo" },
      { value: 100, label: "Muito baixo – Me sinto equilibrado e em paz" }
    ],
    area: AREAS.HEALTH
  },
  
  // Carreira & Finanças
  {
    id: "q5",
    text: "O quanto você se sente realizado(a) na sua vida profissional?",
    options: [
      { value: 0, label: "Nada – Não gosto do que faço" },
      { value: 33, label: "Pouco – Meu trabalho é OK, mas não me motiva" },
      { value: 66, label: "Moderadamente – Gosto do meu trabalho, mas há desafios" },
      { value: 100, label: "Muito – Sou apaixonado pelo que faço" }
    ],
    area: AREAS.CAREER_FINANCES
  },
  {
    id: "q6",
    text: "Você tem uma reserva financeira para emergências?",
    options: [
      { value: 0, label: "Não, estou sempre no limite" },
      { value: 33, label: "Tenho pouco guardado, mas não o suficiente" },
      { value: 66, label: "Tenho uma reserva razoável para emergências" },
      { value: 100, label: "Tenho uma reserva confortável para 6 meses ou mais" }
    ],
    area: AREAS.CAREER_FINANCES
  },
  {
    id: "q7",
    text: "Seus rendimentos mensais permitem que você viva com tranquilidade?",
    options: [
      { value: 0, label: "Não, estou sempre endividado" },
      { value: 33, label: "Sobrevivo, mas sem sobras" },
      { value: 66, label: "Consigo pagar minhas contas e guardar um pouco" },
      { value: 100, label: "Vivo confortavelmente e ainda invisto" }
    ],
    area: AREAS.CAREER_FINANCES
  },
  
  // Relacionamentos & Vida Social
  {
    id: "q8",
    text: "Quantas vezes por semana você se encontra ou se comunica com amigos ou familiares?",
    options: [
      { value: 0, label: "Nunca" },
      { value: 33, label: "1-2 vezes" },
      { value: 66, label: "3-4 vezes" },
      { value: 100, label: "5 ou mais vezes" }
    ],
    area: AREAS.RELATIONSHIPS
  },
  {
    id: "q9",
    text: "Você sente que tem apoio emocional das pessoas ao seu redor?",
    options: [
      { value: 0, label: "Não – Me sinto muito sozinho" },
      { value: 33, label: "Pouco – Tenho poucas pessoas próximas" },
      { value: 66, label: "Moderado – Tenho algumas pessoas de confiança" },
      { value: 100, label: "Sim – Me sinto bem apoiado emocionalmente" }
    ],
    area: AREAS.RELATIONSHIPS
  },
  {
    id: "q10",
    text: "Como você avalia sua vida amorosa?",
    options: [
      { value: 0, label: "Não tenho relacionamento e não desejo ter" },
      { value: 33, label: "Estou solteiro e gostaria de encontrar alguém" },
      { value: 66, label: "Tenho um relacionamento, mas enfrentamos dificuldades" },
      { value: 100, label: "Meu relacionamento é saudável e equilibrado" }
    ],
    area: AREAS.RELATIONSHIPS
  },
  
  // Desenvolvimento & Equilíbrio Pessoal
  {
    id: "q11",
    text: "Quantos livros ou cursos você consome por ano para crescimento pessoal ou profissional?",
    options: [
      { value: 0, label: "Nenhum" },
      { value: 33, label: "1-2 livros/cursos" },
      { value: 66, label: "3-5 livros/cursos" },
      { value: 100, label: "Mais de 6 livros/cursos" }
    ],
    area: AREAS.PERSONAL_GROWTH
  },
  {
    id: "q12",
    text: "Você tem um tempo diário ou semanal para reflexão ou práticas como meditação?",
    options: [
      { value: 0, label: "Nunca faço" },
      { value: 33, label: "Raramente" },
      { value: 66, label: "Às vezes" },
      { value: 100, label: "Frequentemente" }
    ],
    area: AREAS.PERSONAL_GROWTH
  },
  {
    id: "q13",
    text: "Você sente que sua rotina permite equilíbrio entre trabalho, lazer e descanso?",
    options: [
      { value: 0, label: "Não – Me sinto sempre sobrecarregado" },
      { value: 33, label: "Pouco – Há desequilíbrio, mas consigo lidar" },
      { value: 66, label: "Moderado – Tenho bons momentos de lazer" },
      { value: 100, label: "Sim – Minha vida está bem equilibrada" }
    ],
    area: AREAS.PERSONAL_GROWTH
  },
  
  // Impacto & Qualidade de Vida
  {
    id: "q14",
    text: "Você sente que tem um propósito claro na vida?",
    options: [
      { value: 0, label: "Não sei qual é meu propósito" },
      { value: 33, label: "Tenho uma ideia, mas não está claro" },
      { value: 66, label: "Sei o que quero, mas ainda não estou vivendo isso" },
      { value: 100, label: "Vivo alinhado com meu propósito" }
    ],
    area: AREAS.QUALITY_OF_LIFE
  },
  {
    id: "q15",
    text: "Você faz algo para contribuir com a sociedade ou ajudar outras pessoas?",
    options: [
      { value: 0, label: "Nunca" },
      { value: 33, label: "Às vezes, quando posso" },
      { value: 66, label: "Com frequência" },
      { value: 100, label: "Faço parte de projetos sociais ou voluntariado" }
    ],
    area: AREAS.QUALITY_OF_LIFE
  },
  {
    id: "q16",
    text: "Como você avalia sua felicidade no momento atual?",
    options: [
      { value: 0, label: "Muito infeliz" },
      { value: 25, label: "Pouco feliz" },
      { value: 50, label: "Neutro" },
      { value: 75, label: "Feliz" },
      { value: 100, label: "Muito feliz" }
    ],
    area: AREAS.QUALITY_OF_LIFE
  }
];

// Cards appear one at a time with next/prev navigation
export function UserQuestionnaire({
  onComplete,
  isFirstAccess = true
}: {
  onComplete: () => void;
  isFirstAccess?: boolean;
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  const { user } = useUser();

  const totalQuestions = questions.length;
  const progress = ((currentQuestionIndex + 1) / totalQuestions) * 100;
  const currentQuestion = questions[currentQuestionIndex];

  const handleAnswer = (value: number) => {
    setAnswers(prev => ({
      ...prev,
      [currentQuestion.id]: value
    }));
  };

  // Limpa respostas quando o usuário muda de pergunta
  useEffect(() => {
    // Redefinir seleção quando a pergunta mudar
    const radioItems = document.querySelectorAll('[role="radio"]');
    radioItems.forEach(item => {
      if (item instanceof HTMLElement) {
        item.setAttribute('aria-checked', 'false');
        item.classList.remove('data-[state=checked]:bg-primary');
      }
    });
  }, [currentQuestionIndex]);

  const handleNext = () => {
    if (currentQuestionIndex < totalQuestions - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };

  // Calculate area scores based on answers
  const calculateAreaScores = () => {
    const areaScores: Record<string, { total: number; count: number }> = {};
    const areaOverall: Record<string, number> = {};

    // Initialize area scores
    Object.values(AREAS).forEach(area => {
      areaScores[area] = { total: 0, count: 0 };
    });

    // Calculate scores by area
    Object.entries(answers).forEach(([questionId, value]) => {
      const question = questions.find(q => q.id === questionId);
      if (question) {
        const area = question.area;
        areaScores[area].total += value;
        areaScores[area].count += 1;
      }
    });

    // Calculate percentages
    Object.entries(areaScores).forEach(([area, { total, count }]) => {
      areaOverall[area] = count > 0 ? Math.round(total / count) : 0;
    });

    return areaOverall;
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length < totalQuestions) {
      toast({
        variant: "destructive",
        title: "Responda todas as perguntas",
        description: "Por favor, responda todas as perguntas antes de continuar."
      });
      return;
    }

    try {
      setIsSubmitting(true);

      if (!user) {
        console.error("Usuário não autenticado");
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Você precisa estar logado para enviar o questionário."
        });
        return;
      }

      const areaScores = calculateAreaScores();

      // Fetch existing questionnaire data
      const { data: existingQuestionnaire, error: fetchError } = await supabase
        .from("user_questionnaire")
        .select("*")
        .eq("user_id", user.id)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        throw fetchError;
      }

      // Structure the results object
      const results = {
        health: {
          overall: areaScores[AREAS.HEALTH],
          answers: Object.fromEntries(
            Object.entries(answers).filter(([key]) => {
              const q = questions.find(q => q.id === key);
              return q && q.area === AREAS.HEALTH;
            })
          )
        },
        business: {
          overall: areaScores[AREAS.CAREER_FINANCES],
          answers: Object.fromEntries(
            Object.entries(answers).filter(([key]) => {
              const q = questions.find(q => q.id === key);
              return q && q.area === AREAS.CAREER_FINANCES;
            })
          )
        },
        growth: {
          overall: areaScores[AREAS.PERSONAL_GROWTH],
          answers: Object.fromEntries(
            Object.entries(answers).filter(([key]) => {
              const q = questions.find(q => q.id === key);
              return q && q.area === AREAS.PERSONAL_GROWTH;
            })
          )
        },
        relationships: {
          overall: areaScores[AREAS.RELATIONSHIPS],
          answers: Object.fromEntries(
            Object.entries(answers).filter(([key]) => {
              const q = questions.find(q => q.id === key);
              return q && q.area === AREAS.RELATIONSHIPS;
            })
          )
        },
        impact: {
          overall: areaScores[AREAS.QUALITY_OF_LIFE],
          answers: Object.fromEntries(
            Object.entries(answers).filter(([key]) => {
              const q = questions.find(q => q.id === key);
              return q && q.area === AREAS.QUALITY_OF_LIFE;
            })
          )
        }
      };

      if (existingQuestionnaire) {
        // Update existing questionnaire
        const { error: updateError } = await supabase
          .from("user_questionnaire")
          .update({
            results,
            completed: true,
            updated_at: new Date().toISOString()
          })
          .eq("id", existingQuestionnaire.id);

        if (updateError) throw updateError;
      } else {
        // Insert new questionnaire
        const { error: insertError } = await supabase
          .from("user_questionnaire")
          .insert({
            user_id: user.id,
            results,
            completed: true
          });

        if (insertError) throw insertError;
      }

      // Success message
      toast({
        title: "Questionário enviado!",
        description: "Obrigado por completar o questionário. Suas respostas foram salvas."
      });

      // Se estamos no fluxo de onboarding, apenas chame o callback para ir para próxima etapa
      // sem navegar para a página inicial
      onComplete();
      
      // Apenas redirecione diretamente para a página inicial se não for o primeiro acesso
      // (ou seja, se for uma reavaliação após 30 dias)
      if (!isFirstAccess) {
        navigate("/");
      }

    } catch (error) {
      console.error("Erro ao enviar questionário:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Ocorreu um erro ao enviar o questionário. Tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if current question is answered
  const isCurrentQuestionAnswered = currentQuestion && answers[currentQuestion.id] !== undefined;

  return (
    <div className="w-full max-w-2xl mx-auto py-6 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-2xl font-bold mb-2">Vamos conhecer você melhor!</h1>
        <p className="text-gray-600">
          {isFirstAccess
            ? "Complete este questionário para que possamos personalizar sua experiência e ajudá-lo a melhorar em cada área da vida."
            : "Vamos avaliar seu progresso nos pilares da vida. Suas respostas nos ajudarão a personalizar recomendações para você."}
        </p>
      </div>

      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-500 mb-2">
          <span>Questão {currentQuestionIndex + 1} de {totalQuestions}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <Progress value={progress} className="h-2 w-full bg-gray-100" indicatorClassName="bg-purple-500" />
      </div>

      <Card className="border-0 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg">
            {currentQuestion?.text}
          </CardTitle>
          <CardDescription>
            Selecione a opção que melhor descreve sua situação atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {currentQuestion?.options.map((option) => (
              <div 
                key={option.value} 
                className="flex items-center space-x-2 rounded-lg border p-3 hover:bg-gray-50 transition-colors"
                onClick={() => handleAnswer(option.value)}
              >
                <div className={`h-4 w-4 rounded-full border ${
                  answers[currentQuestion.id] === option.value 
                    ? 'bg-purple-600 border-purple-600' 
                    : 'border-gray-300'
                } flex items-center justify-center`}>
                  {answers[currentQuestion.id] === option.value && (
                    <div className="h-2 w-2 rounded-full bg-white" />
                  )}
                </div>
                <Label className="flex-1 cursor-pointer">
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2">
          <Button
            onClick={handlePrevious}
            disabled={currentQuestionIndex === 0}
            variant="outline"
          >
            Anterior
          </Button>
          
          {currentQuestionIndex < totalQuestions - 1 ? (
            <Button
              onClick={handleNext}
              disabled={!isCurrentQuestionAnswered}
              variant="default"
              className="bg-purple-600 hover:bg-purple-700"
            >
              Próxima
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting || !isCurrentQuestionAnswered}
              className="bg-purple-600 hover:bg-purple-700"
            >
              {isSubmitting ? "Enviando..." : "Concluir"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}

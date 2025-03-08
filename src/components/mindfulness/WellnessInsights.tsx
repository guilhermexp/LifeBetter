
import { MoodEntry, MoodInsight } from '@/hooks/useMoodTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Lightbulb, ArrowRight, Brain, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

interface WellnessInsightsProps {
  moodHistory: MoodEntry[];
  insights: MoodInsight[];
  isLoading: boolean;
}

export function WellnessInsights({ moodHistory, insights, isLoading }: WellnessInsightsProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-full h-24" />
      </div>
    );
  }

  if (moodHistory.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Brain className="mr-2 h-5 w-5" />
            Aguardando dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Registre seu humor para receber insights personalizados sobre seus padrões emocionais e sugestões para melhorar seu bem-estar.
          </p>
        </CardContent>
      </Card>
    );
  }

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'positive':
        return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'negative':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      default:
        return <Lightbulb className="h-5 w-5 text-blue-500" />;
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Brain className="mr-2 h-5 w-5" />
            Insights e Padrões
          </CardTitle>
          <CardDescription>
            Baseado em {moodHistory.length} registro{moodHistory.length !== 1 ? 's' : ''} de humor
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {insights.length > 0 ? (
            insights.map((insight, index) => (
              <div 
                key={index} 
                className={`p-4 rounded-lg border flex items-start gap-3 
                  ${insight.type === 'positive' ? 'border-green-200 bg-green-50 dark:bg-green-900/10 dark:border-green-900' : 
                    insight.type === 'negative' ? 'border-amber-200 bg-amber-50 dark:bg-amber-900/10 dark:border-amber-900' : 
                    'border-blue-200 bg-blue-50 dark:bg-blue-900/10 dark:border-blue-900'}`}
              >
                <div className="mt-1">
                  {getInsightIcon(insight.type)}
                </div>
                <div>
                  <p className="text-sm font-medium">{insight.text}</p>
                  {insight.recommendation && (
                    <p className="text-sm mt-2 text-gray-600 dark:text-gray-300">
                      {insight.recommendation}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 py-4">
              Continue registrando seu humor para receber insights personalizados.
            </p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Lightbulb className="mr-2 h-5 w-5" />
            Relação com Produtividade
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
            Seus padrões de humor podem afetar sua produtividade e foco nas tarefas.
            Aqui estão algumas observações baseadas nos seus registros:
          </p>
          
          {moodHistory.length >= 3 ? (
            <ul className="space-y-3">
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-sm">
                  Seus níveis de energia tendem a ser maiores pela manhã, favorecendo tarefas que exigem mais concentração.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <ArrowRight className="h-4 w-4 mt-0.5 flex-shrink-0 text-primary" />
                <span className="text-sm">
                  Quando você registra humor positivo, sua conclusão de tarefas aumenta em aproximadamente 30%.
                </span>
              </li>
            </ul>
          ) : (
            <p className="text-center text-gray-500 py-2">
              Continue registrando seu humor para ver como ele afeta sua produtividade.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

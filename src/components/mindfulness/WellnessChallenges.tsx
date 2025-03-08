
import { MoodEntry } from '@/hooks/useMoodTracking';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CircleCheck, Medal, Plus, Target, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { Skeleton } from '@/components/ui/skeleton';
import { useState } from 'react';

interface Challenge {
  id: string;
  title: string;
  description: string;
  duration: string;
  progress: number;
  status: 'active' | 'completed' | 'suggested';
  moodTarget?: string;
  icon: React.ReactNode;
}

interface WellnessChallengesProps {
  currentMood: MoodEntry;
  moodHistory: MoodEntry[];
  isLoading: boolean;
}

export function WellnessChallenges({ currentMood, moodHistory, isLoading }: WellnessChallengesProps) {
  const [challenges, setChallenges] = useState<Challenge[]>([
    {
      id: '1',
      title: 'Desafio de Gratidão',
      description: 'Registre 3 coisas pelas quais você é grato todos os dias por uma semana',
      duration: '7 dias',
      progress: 43,
      status: 'active',
      icon: <Trophy className="h-5 w-5 text-amber-500" />
    },
    {
      id: '2',
      title: 'Respiração Mindful',
      description: 'Pratique 5 minutos de respiração consciente diariamente',
      duration: '14 dias',
      progress: 100,
      status: 'completed',
      icon: <Medal className="h-5 w-5 text-green-500" />
    }
  ]);
  
  const [suggestedChallenges, setSuggestedChallenges] = useState<Challenge[]>([
    {
      id: 's1',
      title: 'Desconexão Digital',
      description: 'Reserve 30 minutos por dia sem dispositivos eletrônicos',
      duration: '10 dias',
      progress: 0,
      status: 'suggested',
      moodTarget: 'anxiety',
      icon: <Target className="h-5 w-5 text-blue-500" />
    },
    {
      id: 's2',
      title: 'Caminhada Diária',
      description: 'Faça uma caminhada leve de 15 minutos todos os dias',
      duration: '21 dias',
      progress: 0,
      status: 'suggested',
      moodTarget: 'fatigue',
      icon: <Target className="h-5 w-5 text-purple-500" />
    }
  ]);
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="w-full h-24" />
        <Skeleton className="w-full h-24" />
      </div>
    );
  }
  
  const acceptChallenge = (challenge: Challenge) => {
    // Remove from suggested challenges
    setSuggestedChallenges(prev => prev.filter(c => c.id !== challenge.id));
    
    // Add to active challenges
    const newChallenge: Challenge = {
      ...challenge,
      status: 'active',
      progress: 0
    };
    
    setChallenges(prev => [...prev, newChallenge]);
    toast.success(`Desafio "${challenge.title}" aceito!`);
  };
  
  const completeChallenge = (id: string) => {
    setChallenges(prev => 
      prev.map(challenge => 
        challenge.id === id 
          ? { ...challenge, status: 'completed', progress: 100 } 
          : challenge
      )
    );
    toast.success('Parabéns! Desafio concluído com sucesso!');
  };
  
  // Filter suggested challenges based on current mood if available
  const filteredSuggestions = currentMood.mood_type 
    ? suggestedChallenges.filter(challenge => 
        !challenge.moodTarget || challenge.moodTarget === currentMood.mood_type
      )
    : suggestedChallenges;
    
  return (
    <div className="space-y-6">
      {/* Active Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Trophy className="mr-2 h-5 w-5" />
            Seus Desafios Ativos
          </CardTitle>
          <CardDescription>
            Desafios de bem-estar para melhorar sua rotina
          </CardDescription>
        </CardHeader>
        <CardContent>
          {challenges.filter(c => c.status === 'active').length > 0 ? (
            <div className="space-y-4">
              {challenges
                .filter(challenge => challenge.status === 'active')
                .map(challenge => (
                  <div key={challenge.id} className="border p-4 rounded-lg">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className="mt-1">{challenge.icon}</div>
                        <div>
                          <h4 className="font-medium">{challenge.title}</h4>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {challenge.description}
                          </p>
                          <div className="flex items-center mt-3 text-xs text-gray-500">
                            <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                              {challenge.duration}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => completeChallenge(challenge.id)}
                      >
                        <CircleCheck className="h-4 w-4 mr-1" />
                        Completar
                      </Button>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between text-xs mb-1">
                        <span>Progresso</span>
                        <span>{challenge.progress}%</span>
                      </div>
                      <Progress value={challenge.progress} className="h-2" />
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Você não tem desafios ativos no momento.</p>
              <p className="text-sm mt-2">Aceite um desafio sugerido para começar!</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Suggested Challenges */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center text-lg">
            <Target className="mr-2 h-5 w-5" />
            Desafios Sugeridos
          </CardTitle>
          <CardDescription>
            Baseado no seu histórico e humor atual
          </CardDescription>
        </CardHeader>
        <CardContent>
          {filteredSuggestions.length > 0 ? (
            <div className="space-y-4">
              {filteredSuggestions.map(challenge => (
                <div key={challenge.id} className="border p-4 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">{challenge.icon}</div>
                      <div>
                        <h4 className="font-medium">{challenge.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          {challenge.description}
                        </p>
                        <div className="flex items-center mt-3 text-xs text-gray-500">
                          <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                            {challenge.duration}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => acceptChallenge(challenge)}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Aceitar
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <p>Não há novos desafios sugeridos no momento.</p>
              <p className="text-sm mt-2">Continue registrando seu humor para receber sugestões personalizadas.</p>
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Completed Challenges */}
      {challenges.filter(c => c.status === 'completed').length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center text-lg">
              <Medal className="mr-2 h-5 w-5" />
              Desafios Concluídos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {challenges
                .filter(challenge => challenge.status === 'completed')
                .map(challenge => (
                  <div key={challenge.id} className="border p-3 rounded-lg bg-gray-50 dark:bg-gray-800/50">
                    <div className="flex items-center gap-3">
                      <div>{challenge.icon}</div>
                      <div>
                        <h4 className="font-medium">{challenge.title}</h4>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          {challenge.duration}
                        </p>
                      </div>
                      <div className="ml-auto">
                        <span className="text-xs bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                          Concluído
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

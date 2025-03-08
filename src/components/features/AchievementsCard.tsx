
import { useState, useEffect } from "react";
import { Trophy, Target, Award, TrendingDown, TrendingUp, Medal, Star } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

interface Achievement {
  id: string;
  title: string;
  description: string;
  progress: number;
  total: number;
  type: "habit" | "streak" | "milestone";
  icon: "trophy" | "target" | "award" | "medal" | "star";
  achieved: boolean;
  achieved_at?: string;
  user_id: string;
}

interface Streak {
  habitId: string;
  habitName: string;
  currentStreak: number;
  bestStreak: number;
  lastCompleted: string;
}

interface PerformanceAlert {
  type: "warning" | "success" | "info";
  message: string;
  suggestion?: string;
}

export const AchievementsCard = () => {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [streaks, setStreaks] = useState<Streak[]>([]);
  const [alerts, setAlerts] = useState<PerformanceAlert[]>([]);
  const [weeklyProgress, setWeeklyProgress] = useState(0);
  const [loading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Carregar conquistas do usuário
      const { data: achievementsData, error: achievementsError } = await supabase
        .from('achievements')
        .select('*')
        .eq('user_id', user.id);

      if (achievementsError) throw achievementsError;

      // Carregar rotinas do usuário para calcular streaks
      const { data: routinesData, error: routinesError } = await supabase
        .from('daily_routines')
        .select('*')
        .eq('user_id', user.id)
        .gt('streak_count', 0);

      if (routinesError) throw routinesError;

      // Processar dados de conquistas, mapeando 'name' para 'title'
      const processedAchievements = achievementsData?.map(achievement => ({
        ...achievement,
        title: achievement.name, // Mapeia 'name' para 'title'
        achieved: !!achievement.achieved_at,
        type: (achievement.type || 'milestone') as Achievement['type'], // Garante o tipo correto
        icon: (achievement.icon || 'trophy') as Achievement['icon'], // Garante o tipo correto
        progress: achievement.progress || 0,
        total: achievement.total || 0,
      })) || [];

      // Processar dados de streaks
      const processedStreaks = routinesData?.map(routine => ({
        habitId: routine.id,
        habitName: routine.title,
        currentStreak: routine.streak_count,
        bestStreak: routine.streak_count,
        lastCompleted: routine.last_completed_at,
      })) || [];

      setAchievements(processedAchievements);
      setStreaks(processedStreaks);

      // Calcular progresso semanal
      calculateWeeklyProgress(routinesData);

      // Analisar performance e gerar alertas
      analyzePerformance(processedStreaks, routinesData);
    } catch (error) {
      console.error('Erro ao carregar dados do usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar suas conquistas. Tente novamente mais tarde.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const calculateWeeklyProgress = (routines: any[]) => {
    if (!routines?.length) {
      setWeeklyProgress(0);
      return;
    }

    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay());

    const weeklyRoutines = routines.filter(routine => {
      const routineDate = new Date(routine.scheduled_date);
      return routineDate >= startOfWeek && routineDate <= today;
    });

    const completed = weeklyRoutines.filter(r => r.completed).length;
    const total = weeklyRoutines.length;

    setWeeklyProgress(total > 0 ? Math.round((completed / total) * 100) : 0);
  };

  const analyzePerformance = (currentStreaks: Streak[], routines: any[]) => {
    const performanceAlerts: PerformanceAlert[] = [];

    // Analisar streaks significativas
    currentStreaks.forEach(streak => {
      if (streak.currentStreak === 21) {
        toast({
          title: "🎉 Hábito Inicializado!",
          description: `Você manteve ${streak.habitName} por 21 dias seguidos! Continue assim!`,
        });
      } else if (streak.currentStreak === 66) {
        toast({
          title: "🏆 Hábito Consolidado!",
          description: `Incrível! ${streak.habitName} agora faz parte da sua identidade!`,
        });
      }
    });

    // Analisar progresso semanal
    if (weeklyProgress >= 80) {
      performanceAlerts.push({
        type: "success",
        message: `Ótimo desempenho! Você completou ${weeklyProgress}% das suas metas esta semana.`,
      });
    } else if (weeklyProgress < 50) {
      performanceAlerts.push({
        type: "warning",
        message: "Seu progresso está abaixo do esperado esta semana.",
        suggestion: "Que tal revisar suas metas e ajustar sua rotina?",
      });
    }

    setAlerts(performanceAlerts);
  };

  const iconMap = {
    trophy: Trophy,
    target: Target,
    award: Award,
    medal: Medal,
    star: Star,
  };

  if (loading) {
    return (
      <Card className="w-full">
        <CardContent className="flex items-center justify-center py-10">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl">
          <Trophy className="w-5 h-5 text-primary" />
          Conquistas e Desempenho
        </CardTitle>
        <CardDescription className="text-sm">
          Acompanhe seu progresso e celebre suas conquistas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Progresso Semanal */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Progresso Semanal</h4>
            <span className="text-sm text-primary font-medium">{weeklyProgress}%</span>
          </div>
          <Progress value={weeklyProgress} className="h-2" />
        </div>

        {/* Conquistas */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Conquistas</h4>
          {achievements.length === 0 ? (
            <div className="text-center py-8 text-sm text-muted-foreground">
              Você ainda não tem conquistas.
              <br />
              Continue completando suas metas diárias para desbloquear conquistas!
            </div>
          ) : (
            <div className="grid gap-3">
              {achievements.map((achievement) => {
                const Icon = iconMap[achievement.icon || 'trophy'];
                return (
                  <div
                    key={achievement.id}
                    className={`p-3 rounded-lg border ${
                      achievement.achieved
                        ? "bg-primary/5 border-primary/20"
                        : "bg-accent/5 border-accent/20"
                    }`}
                  >
                    <div className="flex items-start gap-2">
                      <div className={`p-2 rounded-full ${
                        achievement.achieved ? "bg-primary/10" : "bg-accent/10"
                      }`}>
                        <Icon className={`w-4 h-4 ${
                          achievement.achieved ? "text-primary" : "text-accent"
                        }`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium truncate">{achievement.title}</h5>
                        <p className="text-xs text-muted-foreground line-clamp-2">
                          {achievement.description}
                        </p>
                        {!achievement.achieved && achievement.total > 0 && (
                          <div className="mt-2 space-y-1">
                            <div className="flex justify-between text-xs">
                              <span>{achievement.progress}</span>
                              <span>{achievement.total}</span>
                            </div>
                            <Progress
                              value={(achievement.progress / achievement.total) * 100}
                              className="h-1"
                            />
                          </div>
                        )}
                      </div>
                      {achievement.achieved && (
                        <Badge variant="default" className="ml-auto text-xs whitespace-nowrap">
                          Conquistado
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Alertas de Desempenho */}
        {alerts.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Alertas e Sugestões</h4>
            {alerts.map((alert, index) => (
              <div
                key={index}
                className={`p-3 rounded-lg border flex items-start gap-2 ${
                  alert.type === "warning"
                    ? "bg-warning/5 border-warning/20"
                    : alert.type === "success"
                    ? "bg-success/5 border-success/20"
                    : "bg-info/5 border-info/20"
                }`}
              >
                {alert.type === "warning" ? (
                  <TrendingDown className="w-4 h-4 text-warning mt-0.5 flex-shrink-0" />
                ) : (
                  <TrendingUp className="w-4 h-4 text-success mt-0.5 flex-shrink-0" />
                )}
                <div className="space-y-1 min-w-0">
                  <p className="text-sm line-clamp-2">{alert.message}</p>
                  {alert.suggestion && (
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {alert.suggestion}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

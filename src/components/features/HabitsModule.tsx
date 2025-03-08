import { useState, useEffect } from "react";
import { Plus, Award, TrendingUp, Calendar, Tag, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProgressBar } from "@/components/ProgressBar";
import { useToast } from "@/hooks/use-toast";
import type { Habit, HabitStats, AreaType, HabitFrequency, HabitPriority } from "@/types/habits";

interface HabitsModuleProps {
  area: AreaType;
  onHabitComplete: (habitId: string) => void;
  onStatsUpdate: (area: AreaType, stats: { totalHabits: number; completedHabits: number }) => void;
}

export const HabitsModule = ({ area, onHabitComplete, onStatsUpdate }: HabitsModuleProps) => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newHabit, setNewHabit] = useState({
    title: "",
    description: "",
    frequency: "daily" as HabitFrequency,
    priority: "medium" as HabitPriority,
    reminderTime: "",
  });
  const [stats, setStats] = useState<HabitStats>({
    completionRate: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalCompleted: 0,
  });
  const { toast } = useToast();

  const sampleHabits: Habit[] = [
    {
      id: "1",
      title: "Beber 2L de água",
      description: "Manter-se hidratado ao longo do dia",
      area: "health",
      frequency: "daily",
      priority: "high",
      tags: ["saúde", "hidratação"],
      completed: false,
      createdAt: new Date(),
      progress: 0,
      streakCount: 0,
      reminderTime: "08:00",
      scheduled_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    },
    // Add other sample habits with the required fields
  ];

  useEffect(() => {
    setHabits(sampleHabits);
  }, [area]);

  useEffect(() => {
    const totalHabits = habits.length;
    const completedHabits = habits.filter(habit => habit.completed).length;
    onStatsUpdate(area, { totalHabits, completedHabits });
  }, [habits, area, onStatsUpdate]);

  const handleAddHabit = () => {
    if (!newHabit.title) {
      toast({
        variant: "destructive",
        title: "Erro ao criar hábito",
        description: "O título do hábito é obrigatório.",
      });
      return;
    }

    const habit: Habit = {
      id: Date.now().toString(),
      title: newHabit.title,
      description: newHabit.description,
      area,
      frequency: newHabit.frequency,
      priority: newHabit.priority,
      tags: [],
      completed: false,
      createdAt: new Date(),
      progress: 0,
      streakCount: 0,
      reminderTime: newHabit.reminderTime,
      scheduled_date: new Date().toISOString().split('T')[0],
      created_at: new Date().toISOString()
    };

    setHabits((prev) => [...prev, habit]);
    setIsDialogOpen(false);
    setNewHabit({
      title: "",
      description: "",
      frequency: "daily",
      priority: "medium",
      reminderTime: "",
    });

    toast({
      title: "Hábito criado!",
      description: "Seu novo hábito foi adicionado com sucesso.",
    });
  };

  const handleHabitComplete = (habitId: string) => {
    setHabits((prev) =>
      prev.map((habit) =>
        habit.id === habitId
          ? {
              ...habit,
              completed: true,
              progress: 100,
              streakCount: habit.streakCount + 1,
            }
          : habit
      )
    );

    const updatedStats = {
      ...stats,
      completionRate: (stats.totalCompleted + 1) / habits.length * 100,
      totalCompleted: stats.totalCompleted + 1,
    };
    setStats(updatedStats);

    toast({
      title: "Hábito completado!",
      description: "Continue assim! Você está construindo um ótimo hábito.",
    });

    onHabitComplete(habitId);
  };

  const analyzeHabits = () => {
    const suggestions = [
      "Você tem mais energia pela manhã. Que tal adiantar seus hábitos importantes?",
      "Sua taxa de conclusão é maior quando os hábitos são agendados antes do almoço.",
    ];

    toast({
      title: "Análise de Padrões",
      description: suggestions[0]
    });
  };

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-semibold text-gray-900">Hábitos & Tarefas</h3>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="w-4 h-4" /> Novo Hábito
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Hábito</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Título</Label>
                <Input
                  id="title"
                  value={newHabit.title}
                  onChange={(e) => setNewHabit({ ...newHabit, title: e.target.value })}
                  placeholder="Ex: Beber água"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Descrição (opcional)</Label>
                <Textarea
                  id="description"
                  value={newHabit.description}
                  onChange={(e) => setNewHabit({ ...newHabit, description: e.target.value })}
                  placeholder="Adicione detalhes sobre seu hábito"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Frequência</Label>
                  <Select
                    value={newHabit.frequency}
                    onValueChange={(value: HabitFrequency) =>
                      setNewHabit({ ...newHabit, frequency: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diário</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensal</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Prioridade</Label>
                  <Select
                    value={newHabit.priority}
                    onValueChange={(value: HabitPriority) =>
                      setNewHabit({ ...newHabit, priority: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">Alta</SelectItem>
                      <SelectItem value="medium">Média</SelectItem>
                      <SelectItem value="low">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="reminder">Horário do Lembrete (opcional)</Label>
                <Input
                  id="reminder"
                  type="time"
                  value={newHabit.reminderTime}
                  onChange={(e) => setNewHabit({ ...newHabit, reminderTime: e.target.value })}
                />
              </div>
              <Button onClick={handleAddHabit} className="w-full">
                Criar Hábito
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4">
        {habits.map((habit) => (
          <div
            key={habit.id}
            className="p-4 bg-white rounded-lg shadow-sm border border-gray-100 hover:border-primary/20 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                <h4 className="font-medium text-gray-900">{habit.title}</h4>
                {habit.description && (
                  <p className="text-sm text-gray-500">{habit.description}</p>
                )}
                <div className="flex gap-2 flex-wrap">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-primary/10 text-primary">
                    <Clock className="w-3 h-3 mr-1" />
                    {habit.frequency}
                  </span>
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-orange-100 text-orange-700">
                    <Tag className="w-3 h-3 mr-1" />
                    {habit.priority}
                  </span>
                </div>
              </div>
              <Button
                variant={habit.completed ? "default" : "outline"}
                size="sm"
                onClick={() => handleHabitComplete(habit.id)}
                className={habit.completed ? "bg-green-600" : ""}
              >
                {habit.completed ? "Concluído" : "Completar"}
              </Button>
            </div>

            <div className="mt-4">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Progresso</span>
                <span>{habit.progress}%</span>
              </div>
              <ProgressBar progress={habit.progress} />
            </div>

            {habit.streakCount > 0 && (
              <div className="mt-2 flex items-center gap-1 text-sm text-primary">
                <Award className="w-4 h-4" />
                <span>{habit.streakCount} dias seguidos!</span>
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="p-4 bg-primary/5 rounded-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h4 className="font-medium text-gray-900">Análise de Desempenho</h4>
          </div>
          <Button variant="outline" size="sm" onClick={analyzeHabits}>
            Analisar Padrões
          </Button>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="p-3 bg-white rounded-lg">
            <p className="text-sm text-gray-500">Taxa de Conclusão</p>
            <p className="text-xl font-semibold text-primary">
              {stats.completionRate.toFixed(0)}%
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="text-sm text-gray-500">Sequência Atual</p>
            <p className="text-xl font-semibold text-primary">
              {stats.currentStreak} dias
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="text-sm text-gray-500">Melhor Sequência</p>
            <p className="text-xl font-semibold text-primary">
              {stats.bestStreak} dias
            </p>
          </div>
          <div className="p-3 bg-white rounded-lg">
            <p className="text-sm text-gray-500">Total Concluído</p>
            <p className="text-xl font-semibold text-primary">
              {stats.totalCompleted}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

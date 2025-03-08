
import { useState, useEffect } from "react";
import { Timer, Bell, BellOff, Play, Pause, RefreshCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface FocusModeProps {
  taskTitle?: string;
}

export const FocusMode = ({ taskTitle }: FocusModeProps) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isBreak, setIsBreak] = useState(false);
  const [timerType, setTimerType] = useState<"pomodoro" | "custom">("pomodoro");
  const { toast } = useToast();

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isActive && !isPaused) {
      interval = setInterval(() => {
        setTime((time) => {
          if (time === 0) {
            if (!isBreak) {
              toast({
                title: "Tempo finalizado!",
                description: "Hora de fazer uma pausa. Você merece!"
              });
              setIsBreak(true);
              return 5 * 60; // 5 minutes break
            } else {
              toast({
                title: "Pausa finalizada!",
                description: "Vamos voltar ao foco?"
              });
              setIsBreak(false);
              return 25 * 60; // Back to work
            }
          }
          return time - 1;
        });
      }, 1000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, isPaused, isBreak, toast]);

  const toggleTimer = () => {
    setIsActive(!isActive);
    setIsPaused(false);
    
    if (!isActive) {
      toast({
        title: "Modo Foco ativado!",
        description: "Ative o modo 'Não Perturbe' do seu celular para evitar distrações."
      });
    }
  };

  const togglePause = () => {
    setIsPaused(!isPaused);
  };

  const resetTimer = () => {
    setIsActive(false);
    setIsPaused(false);
    setTime(25 * 60);
    setIsBreak(false);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const progress = ((timerType === "pomodoro" ? 25 * 60 : time) - time) / (timerType === "pomodoro" ? 25 * 60 : time) * 100;

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <Timer className="h-4 w-4" />
          Modo Foco
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Modo Foco {taskTitle ? `- ${taskTitle}` : ""}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="flex justify-center items-center gap-4">
            <Select
              value={timerType}
              onValueChange={(value: "pomodoro" | "custom") => setTimerType(value)}
              disabled={isActive}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Escolha o timer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pomodoro">Pomodoro (25/5)</SelectItem>
                <SelectItem value="custom">Personalizado</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col items-center gap-4 p-6 bg-accent/20 rounded-lg">
            <div className="text-4xl font-bold font-mono">
              {formatTime(time)}
            </div>
            <Progress value={progress} className="w-full" />
            <Badge variant={isBreak ? "secondary" : "default"}>
              {isBreak ? "Pausa" : "Foco"}
            </Badge>
          </div>

          <div className="flex justify-center gap-2">
            <Button
              variant={isActive ? "destructive" : "default"}
              onClick={toggleTimer}
              className="gap-2"
            >
              {isActive ? (
                <>
                  <BellOff className="h-4 w-4" />
                  Parar
                </>
              ) : (
                <>
                  <Play className="h-4 w-4" />
                  Iniciar
                </>
              )}
            </Button>
            {isActive && (
              <>
                <Button
                  variant="outline"
                  onClick={togglePause}
                  className="gap-2"
                >
                  {isPaused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
                  {isPaused ? "Continuar" : "Pausar"}
                </Button>
                <Button
                  variant="outline"
                  onClick={resetTimer}
                  className="gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Reiniciar
                </Button>
              </>
            )}
          </div>

          {isActive && (
            <div className="bg-muted/50 p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Dicas para manter o foco:</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• Ative o modo "Não Perturbe" do celular</li>
                <li>• Organize seu ambiente de trabalho</li>
                <li>• Tenha água por perto</li>
                <li>• Respire fundo e mantenha a calma</li>
              </ul>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};


import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Heart, Briefcase, Wallet, Home, Sun, ArrowRight } from "lucide-react";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { ProgressSummaryData } from "@/hooks/useAgentInsights";
import { Button } from "@/components/ui/button";

interface ProgressSummaryProps {
  data: ProgressSummaryData;
  compact?: boolean;
}

export function ProgressSummary({ data, compact = false }: ProgressSummaryProps) {
  const getAreaIcon = (areaType: string) => {
    switch (areaType) {
      case "health":
        return <Heart className="h-4 w-4" />;
      case "business":
        return <Briefcase className="h-4 w-4" />;
      case "finances":
        return <Wallet className="h-4 w-4" />;
      case "family":
        return <Home className="h-4 w-4" />;
      case "spirituality":
        return <Sun className="h-4 w-4" />;
      default:
        return <Heart className="h-4 w-4" />;
    }
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className={compact ? "px-4 py-3" : undefined}>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5 text-purple-500" />
          Resumo de Progresso
        </CardTitle>
        {!compact && (
          <CardDescription>
            Visão geral do seu progresso nas áreas da vida
          </CardDescription>
        )}
      </CardHeader>
      <CardContent className={compact ? "px-4 py-3" : undefined}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-green-50 rounded-lg p-3 hover:bg-green-100 transition-colors">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-100 rounded-full">
                  <TrendingUp className="h-4 w-4 text-green-600" />
                </div>
                <div>
                  <p className={`${compact ? "text-base" : "text-lg"} font-semibold text-green-700`}>{data.topAreaProgress}%</p>
                  <p className="text-xs text-green-800">Maior Progresso</p>
                </div>
              </div>
              <p className="mt-1 text-xs text-green-700">{data.topAreaName}</p>
            </div>
            
            <div className="bg-amber-50 rounded-lg p-3 hover:bg-amber-100 transition-colors">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-amber-100 rounded-full">
                  <TrendingDown className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <p className={`${compact ? "text-base" : "text-lg"} font-semibold text-amber-700`}>{data.lowestAreaProgress}%</p>
                  <p className="text-xs text-amber-800">Menor Progresso</p>
                </div>
              </div>
              <p className="mt-1 text-xs text-amber-700">{data.lowestAreaName}</p>
              
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs flex items-center gap-1 text-amber-700 hover:text-amber-800 hover:bg-amber-200 mt-1 px-2 py-1 h-auto"
                onClick={() => {
                  // Scroll to habits tab and click it
                  const habitsTab = document.querySelector('[data-value="habits"]');
                  if (habitsTab && habitsTab instanceof HTMLElement) {
                    habitsTab.click();
                    setTimeout(() => {
                      habitsTab.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }
                }}
              >
                Ver recomendações
                <ArrowRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </div>
          
          {!compact && (
            <div>
              <h4 className="text-sm font-medium mb-3">Progresso por Área</h4>
              <div className="space-y-4">
                {data.allAreasProgress.map((area, index) => (
                  <div key={index} className="hover:bg-gray-50 p-2 rounded-lg transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <div className={`${area.color} text-white p-1 rounded-md`}>
                          {getAreaIcon(area.areaType)}
                        </div>
                        <span className="text-sm font-medium">{area.name}</span>
                      </div>
                      <span className="text-sm">{area.progress}%</span>
                    </div>
                    <Progress 
                      value={area.progress} 
                      className="h-2"
                      indicatorClassName={area.gradient}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1 mb-3">
                      <span>{area.tasks_completed} tarefas concluídas</span>
                      <span>{area.tasks_pending} pendentes</span>
                    </div>
                    {index < data.allAreasProgress.length - 1 && (
                      <Separator className="my-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
          
          {compact && data.allAreasProgress.length > 0 && (
            <div>
              <h4 className="text-xs font-medium mb-2">Áreas Principais</h4>
              <div className="space-y-2">
                {data.allAreasProgress.slice(0, 3).map((area, index) => (
                  <div key={index} className="hover:bg-gray-50 p-1.5 rounded-lg transition-colors">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-1.5">
                        <div className={`${area.color} text-white p-1 rounded-md`}>
                          {getAreaIcon(area.areaType)}
                        </div>
                        <span className="text-xs font-medium">{area.name}</span>
                      </div>
                      <span className="text-xs">{area.progress}%</span>
                    </div>
                    <Progress 
                      value={area.progress} 
                      className="h-1.5"
                      indicatorClassName={area.gradient}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

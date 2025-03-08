
import React from "react";
import { Button } from "@/components/ui/button";
import { HabitRecommendation } from "@/hooks/useAgentInsights";
import { Card, CardContent } from "@/components/ui/card";
import { Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface HabitRecommendationCardProps {
  recommendation: HabitRecommendation;
  onRefresh: () => void;
  compact?: boolean;
}

export function HabitRecommendationCard({ recommendation, onRefresh, compact = false }: HabitRecommendationCardProps) {
  const { toast } = useToast();
  const [isAdding, setIsAdding] = React.useState(false);

  const addHabitToRoutine = async () => {
    try {
      setIsAdding(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Você precisa estar logado para adicionar hábitos."
        });
        return;
      }

      // Create a today date with timezone safe operations
      const today = new Date();
      const formattedDate = today.toISOString().split('T')[0];

      // Verificar o tipo de área e convertê-lo para os valores permitidos pela tabela
      let category;
      switch (recommendation.areaType) {
        case "health":
          category = "health";
          break;
        case "business":
          category = "business";
          break;
        case "growth":
          category = "growth";
          break;
        case "relationships":
          category = "relationships";
          break;
        default:
          category = "growth"; // Valor padrão seguro
      }

      // Add the habit to daily_routines
      const { error } = await supabase.from('daily_routines').insert({
        title: recommendation.title,
        description: recommendation.description,
        user_id: user.id,
        category: category, // Certifique-se de que este valor é um dos aceitos pela constraint
        frequency: recommendation.frequency === "Diariamente" ? "daily" : 
                  recommendation.frequency.includes("semana") ? "weekly" : "monthly",
        scheduled_date: formattedDate,
        start_time: "08:00:00"
      });

      if (error) {
        console.error("Erro ao adicionar hábito:", error);
        throw error;
      }

      toast({
        title: "Hábito adicionado!",
        description: `${recommendation.title} foi adicionado à sua rotina.`
      });
      
      // Refresh the data after adding a habit
      onRefresh();
    } catch (error) {
      console.error("Erro ao adicionar hábito:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o hábito. Tente novamente."
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <CardContent className="p-0">
        <div className="flex flex-col">
          <div className={`${recommendation.areaColor} p-2 text-white flex items-center gap-2`}>
            <recommendation.areaIcon className="h-4 w-4" />
            <span className="text-sm font-medium">{recommendation.areaName}</span>
          </div>
          
          <div className={compact ? "p-3" : "p-4"}>
            <h4 className={`font-semibold ${compact ? "text-sm" : ""} mb-1`}>{recommendation.title}</h4>
            {!compact ? (
              <p className="text-sm text-gray-600 mb-3">{recommendation.description}</p>
            ) : (
              <p className="text-xs text-gray-600 mb-2 line-clamp-2">{recommendation.description}</p>
            )}
            
            <div className="flex items-center justify-between">
              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full">
                {recommendation.frequency}
              </span>
              
              <Button 
                variant="outline" 
                size="sm" 
                onClick={addHabitToRoutine}
                disabled={isAdding}
                className={`flex items-center gap-1 ${compact ? "text-xs px-2 py-1 h-7" : ""}`}
              >
                <Plus className={`${compact ? "h-3 w-3" : "h-3.5 w-3.5"}`} />
                {isAdding ? "Adicionando..." : "Adicionar"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

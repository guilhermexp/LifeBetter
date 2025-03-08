
import { Button } from "@/components/ui/button";
import { AreaSuggestion } from "@/hooks/useAgentInsights";
import { Heart, Briefcase, Wallet, Home, Sun, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useState } from "react";

interface RecommendationCardsProps {
  recommendations: AreaSuggestion[];
}

export function RecommendationCards({ recommendations }: RecommendationCardsProps) {
  const { toast } = useToast();
  const [addingHabitIds, setAddingHabitIds] = useState<Set<string>>(new Set());

  if (recommendations.length === 0) {
    return null;
  }

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

  const addHabitToRoutine = async (title: string, description: string, areaType: string, itemId: string) => {
    try {
      // Add to loading state
      setAddingHabitIds(prev => new Set(prev).add(itemId));
      
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

      // Add the habit to daily_routines
      const { error } = await supabase.from('daily_routines').insert({
        title: title,
        description: description || `Hábito recomendado para melhorar sua área de ${areaType}`,
        user_id: user.id,
        category: areaType,
        frequency: "daily",
        scheduled_date: formattedDate,
        start_time: "08:00:00"
      });

      if (error) throw error;

      toast({
        title: "Hábito adicionado!",
        description: `${title} foi adicionado à sua rotina.`
      });
    } catch (error) {
      console.error("Erro ao adicionar hábito:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível adicionar o hábito. Tente novamente."
      });
    } finally {
      // Remove from loading state
      setAddingHabitIds(prev => {
        const newSet = new Set(prev);
        newSet.delete(itemId);
        return newSet;
      });
    }
  };

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-medium text-gray-700">Sugestões Personalizadas</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {recommendations.map((suggestion, index) => (
          <div key={index} className={`rounded-xl p-4 ${suggestion.bgColor} bg-opacity-10 border ${suggestion.borderColor} hover:shadow-md transition-shadow`}>
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-md ${suggestion.color} text-white`}>
                {getAreaIcon(suggestion.areaType)}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-sm mb-1">{suggestion.title}</h4>
                <p className="text-xs text-gray-600 mb-3">{suggestion.description}</p>
                
                <div className="space-y-2">
                  {suggestion.items.map((item, i) => {
                    const itemId = `${suggestion.areaType}-${index}-${i}`;
                    const isAdding = addingHabitIds.has(itemId);
                    
                    return (
                      <div key={i} className="flex items-center gap-2 bg-white bg-opacity-60 p-2 rounded-md text-xs hover:bg-opacity-80 transition-colors">
                        <Button 
                          size="icon" 
                          variant="outline" 
                          disabled={isAdding}
                          className="h-5 w-5 rounded-full"
                          onClick={() => addHabitToRoutine(item, "", suggestion.areaType, itemId)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                        <span className="flex-1">{item}</span>
                        {isAdding && (
                          <span className="text-xs text-gray-500 animate-pulse">Adicionando...</span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

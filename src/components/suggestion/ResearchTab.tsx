
import { Button } from "@/components/ui/button";
import { SuggestionCard } from "./SuggestionCard";
import { AITip } from "./types";
import type { AreaType } from "@/types/habits";
import { ArrowRight, Sparkles, BookOpen, RefreshCw } from "lucide-react";
import { useState } from "react";

interface ResearchTabProps {
  tips: AITip[];
  savedTipIds: Set<string>;
  onShuffle: () => void;
  onSaveTip: (tipId: string) => void;
  onAddTip: (tip: AITip) => void;
  areaIcons: Record<AreaType, any>;
  areaNames: Record<AreaType, string>;
  sourceIcons: Record<string, any>;
}

export const ResearchTab = ({
  tips,
  savedTipIds,
  onShuffle,
  onSaveTip,
  onAddTip,
  areaIcons,
  areaNames,
  sourceIcons
}: ResearchTabProps) => {
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleShuffle = () => {
    setIsRefreshing(true);
    // Call the onShuffle function passed from the parent component
    onShuffle();
    
    // Reset the refreshing state after a brief delay to show animation
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  return (
    <div className="space-y-4">
      <div className="bg-purple-50 rounded-xl p-4">
        <div className="flex items-center mb-1">
          <BookOpen className="w-5 h-5 text-purple-700 mr-2" />
          <h3 className="text-base font-medium text-gray-800">Baseado em Pesquisas</h3>
        </div>
        <p className="text-sm text-gray-600 ml-7">
          Sugestões de hábitos e metas baseadas em estudos científicos e literatura especializada.
        </p>
      </div>
      
      <div className="flex justify-center my-4">
        <Button 
          onClick={handleShuffle} 
          disabled={isRefreshing}
          className="flex items-center justify-between gap-2 bg-purple-600 text-white rounded-full px-5 py-2.5"
        >
          {isRefreshing ? (
            <RefreshCw className="w-4 h-4 text-white animate-spin mr-1" />
          ) : (
            <Sparkles className="w-4 h-4 text-white mr-1" />
          )}
          <span>{isRefreshing ? "Carregando..." : "Descobrir Novos Insights"}</span>
          <ArrowRight className="w-4 h-4 text-white ml-1" />
        </Button>
      </div>
      
      <div className="space-y-4">
        {tips.map(tip => (
          <SuggestionCard 
            key={tip.id} 
            tip={tip} 
            isSaved={savedTipIds.has(tip.id)} 
            onSave={onSaveTip} 
            onAdd={onAddTip} 
            areaIcons={areaIcons} 
            areaNames={areaNames} 
            sourceIcons={sourceIcons} 
          />
        ))}
      </div>
    </div>
  );
};

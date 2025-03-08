
import { Sparkles, ArrowRight, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { SuggestionCard } from "./SuggestionCard";
import { AITip } from "./types";
import type { AreaType } from "@/types/habits";

interface AITabProps {
  tips: AITip[];
  savedTipIds: Set<string>;
  isLoading: boolean;
  progressValue: number;
  onFetchSuggestions: () => void;
  onSaveTip: (tipId: string) => void;
  onAddTip: (tip: AITip) => void;
  areaIcons: Record<AreaType, any>;
  areaNames: Record<AreaType, string>;
  sourceIcons: Record<string, any>;
}

export const AITab = ({
  tips,
  savedTipIds,
  isLoading,
  progressValue,
  onFetchSuggestions,
  onSaveTip,
  onAddTip,
  areaIcons,
  areaNames,
  sourceIcons
}: AITabProps) => {
  console.log("AI Tab rendered with tips:", tips.length, "loading:", isLoading);
  
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-[#9b87f5]/10 to-[#7E69AB]/10 p-5 rounded-xl shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 bg-primary/20 rounded-full">
            <Bot className="w-5 h-5 text-primary" />
          </div>
          <h3 className="text-lg font-medium text-gray-800">Sugestões de IA</h3>
        </div>
        <p className="text-sm text-gray-600 ml-12">
          Recomendações personalizadas geradas por inteligência artificial com base no seu perfil.
        </p>
      </div>
      
      <div className="flex justify-end mb-2">
        <Button 
          onClick={onFetchSuggestions} 
          disabled={isLoading} 
          className="flex items-center justify-between gap-3 bg-gradient-to-r from-[#9b87f5] to-[#7E69AB] text-white shadow-md hover:shadow-lg transition-all duration-300 rounded-xl border-0 py-3 px-[18px] disabled:opacity-70"
        >
          {isLoading ? (
            <>
              <span className="animate-spin mr-2 text-white">⭮</span>
              <span>Gerando sugestões...</span>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-white" />
                <span>Gerar Novas Sugestões</span>
              </div>
              <ArrowRight className="w-4 h-4 text-white ml-2" />
            </>
          )}
        </Button>
      </div>

      {isLoading && (
        <div className="space-y-4 py-6 bg-gradient-to-r from-[#9b87f5]/5 to-[#7E69AB]/5 p-6 rounded-xl border border-primary/10">
          <div className="flex items-center gap-3 text-primary">
            <Sparkles className="w-5 h-5 animate-pulse" />
            <p className="font-medium">Gerando recomendações personalizadas...</p>
          </div>
          <Progress value={progressValue} className="h-2" />
          <p className="text-sm text-gray-600 text-center mt-2">
            A IA está analizando seus dados e criando um plano personalizado baseado em evidências científicas
          </p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 3 }).map((_, i) => (
            <Card key={`skeleton-${i}`} className="p-6 border-gray-100 rounded-xl">
              <Skeleton className="h-4 w-1/3 mb-5" />
              <Skeleton className="h-24 w-full mb-5" />
              <Skeleton className="h-4 w-2/3 mb-3" />
              <Skeleton className="h-4 w-1/2 mb-5" />
              <Skeleton className="h-12 w-full rounded-lg" />
            </Card>
          ))
        ) : tips.length > 0 ? (
          tips.map(tip => (
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
          ))
        ) : (
          <div className="col-span-full text-center py-12 bg-gradient-to-r from-[#9b87f5]/5 to-[#7E69AB]/5 rounded-xl border border-dashed border-primary/20">
            <Sparkles className="w-12 h-12 text-primary mx-auto mb-4 opacity-50" />
            <p className="text-gray-700 font-medium mb-2">
              Nenhuma sugestão personalizada disponível
            </p>
            <p className="text-gray-600 text-sm max-w-md mx-auto">
              Clique no botão acima para gerar sugestões personalizadas com IA baseadas no seu perfil
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

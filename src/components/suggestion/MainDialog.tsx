
import { Lightbulb, BookOpen, Sparkles, X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AITab } from "./AITab";
import { ResearchTab } from "./ResearchTab";
import { AITip } from "./types";
import type { AreaType } from "@/types/habits";
import { Button } from "@/components/ui/button";
import { useEffect } from "react";

interface MainDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentTips: AITip[];
  aiTips: AITip[];
  savedTipIds: Set<string>;
  isLoadingAI: boolean;
  progressValue: number;
  onShuffle: () => void;
  onFetchAI: () => void;
  onSaveTip: (tipId: string) => void;
  onAddTip: (tip: AITip) => void;
  areaIcons: Record<AreaType, any>;
  areaNames: Record<AreaType, string>;
  sourceIcons: Record<string, any>;
}

export const MainDialog = ({
  isOpen,
  onOpenChange,
  currentTips,
  aiTips,
  savedTipIds,
  isLoadingAI,
  progressValue,
  onShuffle,
  onFetchAI,
  onSaveTip,
  onAddTip,
  areaIcons,
  areaNames,
  sourceIcons
}: MainDialogProps) => {
  // This effect helps clean up resources when dialog closes
  useEffect(() => {
    return () => {
      // Cleanup function that will run when component unmounts
      console.log("Dialog unmounting, cleaning up resources");
    };
  }, []);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange} data-dialog-trigger="suggestions">
      <DialogContent className="max-w-[500px] max-h-[90vh] overflow-y-auto mx-auto my-0 rounded-xl p-0 border-0 shadow-lg">
        <div className="sticky top-0 z-10 rounded-t-xl">
          <DialogHeader className="space-y-2 p-5 relative bg-purple-600 text-white rounded-t-xl">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => onOpenChange(false)} 
              className="rounded-full absolute right-4 top-4 hover:bg-white/10 h-6 w-6"
            >
              <X className="h-4 w-4 text-white" />
            </Button>
            
            <DialogTitle className="text-lg font-medium text-white">
              Insights e Sugestões Personalizadas
            </DialogTitle>
            <DialogDescription className="text-sm text-white/80">
              Recomendações baseadas em pesquisas e análise de IA para melhorar sua vida
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="research" className="px-4 pt-3 pb-0 bg-[#f5f3ff]">
            <TabsList className="grid w-full grid-cols-2 p-1 bg-white/80 rounded-lg">
              <TabsTrigger value="research" className="rounded-md py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                <BookOpen className="w-4 h-4 mr-2" />
                Baseado em Pesquisas
              </TabsTrigger>
              <TabsTrigger value="ai" className="rounded-md py-2 data-[state=active]:bg-purple-100 data-[state=active]:text-purple-700">
                <Sparkles className="w-4 h-4 mr-2" />
                Sugestões IA
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-4 bg-[#f5f3ff]">
          <Tabs defaultValue="research">
            <TabsContent value="research" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <ResearchTab 
                tips={currentTips} 
                savedTipIds={savedTipIds} 
                onShuffle={onShuffle} 
                onSaveTip={onSaveTip} 
                onAddTip={onAddTip} 
                areaIcons={areaIcons} 
                areaNames={areaNames} 
                sourceIcons={sourceIcons} 
              />
            </TabsContent>

            <TabsContent value="ai" className="mt-0 focus-visible:outline-none focus-visible:ring-0">
              <AITab 
                tips={aiTips} 
                savedTipIds={savedTipIds} 
                isLoading={isLoadingAI} 
                progressValue={progressValue} 
                onFetchSuggestions={onFetchAI} 
                onSaveTip={onSaveTip} 
                onAddTip={onAddTip} 
                areaIcons={areaIcons} 
                areaNames={areaNames} 
                sourceIcons={sourceIcons} 
              />
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};

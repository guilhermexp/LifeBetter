import { Star, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SuggestionCard } from "@/components/suggestion/SuggestionCard";
import { AITip } from "@/components/suggestion/types";
import type { AreaType } from "@/types/habits";

interface FavoritesDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  favoriteTips: AITip[];
  onSaveTip: (tipId: string) => void;
  onAddTip: (tip: AITip) => void;
  areaIcons: Record<AreaType, any>;
  areaNames: Record<AreaType, string>;
  sourceIcons: Record<string, any>;
}

export function FavoritesDialog({
  isOpen,
  onOpenChange,
  favoriteTips,
  onSaveTip,
  onAddTip,
  areaIcons,
  areaNames,
  sourceIcons
}: FavoritesDialogProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[500px] max-h-[90vh] overflow-y-auto mx-auto my-0 rounded-xl p-0 border-0 shadow-lg">
        <DialogHeader className="space-y-2 p-5 relative bg-purple-600 text-white rounded-t-xl">
          <DialogTitle className="text-lg font-medium text-white">
            Hábitos Favoritos
          </DialogTitle>
          <DialogDescription className="text-sm text-white/80">
            Seus hábitos favoritos salvos para implementação futura
          </DialogDescription>
        </DialogHeader>

        <div className="p-5 bg-[#f5f3ff]">
          <div className="space-y-4">
            {favoriteTips.map((tip) => (
              <SuggestionCard
                key={tip.id}
                tip={tip}
                isSaved={true}
                onSave={onSaveTip}
                onAdd={onAddTip}
                areaIcons={areaIcons}
                areaNames={areaNames}
                sourceIcons={sourceIcons}
              />
            ))}

            {favoriteTips.length === 0 && (
              <div className="text-center py-8">
                <div className="bg-purple-100 rounded-full p-3 inline-flex mb-3">
                  <Star className="h-6 w-6 text-purple-600" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">Nenhum favorito ainda</h3>
                <p className="text-sm text-gray-600 mb-4">
                  Adicione hábitos aos favoritos para acessá-los facilmente depois.
                </p>
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

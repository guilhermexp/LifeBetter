
import { Star, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { SuggestionCard } from "./SuggestionCard";
import { AITip } from "./types";
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

export const FavoritesDialog = ({
  isOpen,
  onOpenChange,
  favoriteTips,
  onSaveTip,
  onAddTip,
  areaIcons,
  areaNames,
  sourceIcons
}: FavoritesDialogProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto mx-3 md:mx-auto">
        <DialogHeader className="space-y-2">
          <DialogTitle className="flex items-center gap-2 text-xl md:text-2xl">
            <Star className="w-6 h-6 text-primary" />
            Sugestões Favoritas
          </DialogTitle>
          <DialogDescription className="text-base">
            Suas sugestões salvas para referência futura
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <div className="col-span-full text-center py-8">
              <Star className="w-8 h-8 text-primary mx-auto mb-2" />
              <p className="text-gray-600">
                Você ainda não salvou nenhuma sugestão como favorita.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

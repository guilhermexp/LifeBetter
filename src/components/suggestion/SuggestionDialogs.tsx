
import { AITip } from "./types";
import { HabitPlanDialog } from "./HabitPlanDialog";
import { MainDialog } from "./MainDialog";
import { FavoritesDialog } from "./FavoritesDialog";
import { AreaType } from "@/types/habits";
import { useHabitConfirmation } from "./useHabitConfirmation";

interface SuggestionDialogsProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  currentTips: AITip[];
  aiTips: AITip[];
  savedTips: Set<string>;
  isLoadingAI: boolean;
  progressValue: number;
  showFavorites: boolean;
  setShowFavorites: (show: boolean) => void;
  isConfirmDialogOpen: boolean;
  setIsConfirmDialogOpen: (open: boolean) => void;
  selectedTip: AITip | null;
  habitPlan: any;
  shuffleTips: () => void;
  getFavoriteTips: () => AITip[];
  handleAdd: (tip: AITip) => void;
  toggleSaveTip: (tipId: string) => void;
  fetchAISuggestions: () => void;
  stopProgress: () => void;
  areaIcons: Record<AreaType, any>;
  areaNames: Record<AreaType, string>;
  sourceIcons: Record<string, any>;
  onAddHabit: (area: AreaType, title: string, description: string, implementation?: any) => void;
}

export const SuggestionDialogs = ({
  isOpen,
  setIsOpen,
  currentTips,
  aiTips,
  savedTips,
  isLoadingAI,
  progressValue,
  showFavorites,
  setShowFavorites,
  isConfirmDialogOpen,
  setIsConfirmDialogOpen,
  selectedTip,
  habitPlan,
  shuffleTips,
  getFavoriteTips,
  handleAdd,
  toggleSaveTip,
  fetchAISuggestions,
  stopProgress,
  areaIcons,
  areaNames,
  sourceIcons,
  onAddHabit
}: SuggestionDialogsProps) => {
  const { handleConfirmHabit } = useHabitConfirmation({ onAddHabit });

  return (
    <>
      {/* Main Dialog */}
      <MainDialog 
        isOpen={isOpen} 
        onOpenChange={open => {
          // Prevent issues when clicking logout by properly cleaning up
          if (!open) {
            stopProgress();
          }
          setIsOpen(open);
        }}
        currentTips={currentTips} 
        aiTips={aiTips} 
        savedTipIds={savedTips} 
        isLoadingAI={isLoadingAI} 
        progressValue={progressValue} 
        onShuffle={shuffleTips} 
        onFetchAI={fetchAISuggestions} 
        onSaveTip={toggleSaveTip} 
        onAddTip={handleAdd} 
        areaIcons={areaIcons} 
        areaNames={areaNames} 
        sourceIcons={sourceIcons} 
      />

      {/* Favorites Dialog */}
      <FavoritesDialog 
        isOpen={showFavorites} 
        onOpenChange={setShowFavorites} 
        favoriteTips={getFavoriteTips()} 
        onSaveTip={toggleSaveTip} 
        onAddTip={handleAdd} 
        areaIcons={areaIcons} 
        areaNames={areaNames} 
        sourceIcons={sourceIcons} 
      />

      {/* Habit Plan Dialog */}
      {selectedTip && habitPlan && (
        <HabitPlanDialog 
          isOpen={isConfirmDialogOpen} 
          onOpenChange={setIsConfirmDialogOpen} 
          habit={selectedTip}
          onApply={async () => {
            // If selectedTip exists, pass it to handleConfirmHabit
            if (selectedTip) {
              try {
                const success = await handleConfirmHabit(selectedTip);
                if (success) {
                  setIsConfirmDialogOpen(false);
                }
              } catch (error) {
                console.error("Erro ao adicionar hábito:", error);
              }
            }
          }}
        />
      )}
    </>
  );
};

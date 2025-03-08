
import React from "react";
import { Brain, WifiOff, Volume2, VolumeX } from "lucide-react";
import { CardTitle, CardDescription } from "@/components/ui/card";

interface AssistantHeaderProps {
  isOffline: boolean;
  isSpeaking?: boolean;
  onToggleSpeech?: () => void;
}

export const AssistantHeader: React.FC<AssistantHeaderProps> = ({ 
  isOffline, 
  isSpeaking = false,
  onToggleSpeech
}) => {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2">
        <Brain className="h-5 w-5" />
        <CardTitle className="text-lg">Assistente de Agenda</CardTitle>
        {isOffline && (
          <div className="flex items-center ml-2 text-yellow-200 text-xs bg-purple-700 px-2 py-1 rounded-full">
            <WifiOff className="h-3 w-3 mr-1" />
            <span>Offline</span>
          </div>
        )}
        {isSpeaking && (
          <div className="flex items-center ml-2 text-green-200 text-xs bg-purple-700 px-2 py-1 rounded-full">
            <Volume2 className="h-3 w-3 mr-1 animate-pulse" />
            <span>Falando</span>
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <CardDescription className="text-purple-100 m-0">
          Adicione eventos e tarefas por voz ou texto
        </CardDescription>
        {onToggleSpeech && (
          <button 
            onClick={onToggleSpeech}
            className="p-1 rounded-full hover:bg-purple-500 transition-colors"
            title={isSpeaking ? "Mudo" : "Com som"}
          >
            {isSpeaking ? (
              <Volume2 className="h-4 w-4 text-white" />
            ) : (
              <VolumeX className="h-4 w-4 text-white" />
            )}
          </button>
        )}
      </div>
    </div>
  );
};

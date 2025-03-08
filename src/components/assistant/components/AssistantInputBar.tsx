
import React, { useRef } from "react";
import { Keyboard, Mic, Calendar, Send, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { VoiceRecorder } from "@/components/features/VoiceRecorder";

interface AssistantInputBarProps {
  isProcessing: boolean;
  isRecording: boolean;
  setIsRecording: (isRecording: boolean) => void;
  onTranscription: (text: string) => void;
  onSendClick: () => void;
  onTextInput: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export const AssistantInputBar: React.FC<AssistantInputBarProps> = ({
  isProcessing,
  isRecording,
  setIsRecording,
  onTranscription,
  onSendClick,
  onTextInput,
  inputRef,
}) => {
  return (
    <div className="p-3 border-t flex items-center gap-2">
      <div className="relative flex-1">
        <input 
          ref={inputRef}
          type="text" 
          placeholder={isProcessing ? "Processando..." : "Digite uma mensagem..."}
          className="w-full pl-10 pr-4 py-2 rounded-full border border-gray-300 focus:border-purple-500 focus:ring-1 focus:ring-purple-500 outline-none"
          onKeyDown={onTextInput}
          disabled={isRecording || isProcessing}
        />
        <Keyboard className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
      </div>
      
      <Button
        variant="ghost"
        size="icon"
        className="h-10 w-10 rounded-full text-purple-600 hover:bg-purple-100"
        onClick={onSendClick}
        disabled={isProcessing || isRecording}
      >
        {isProcessing ? (
          <Loader2 className="h-5 w-5 animate-spin" />
        ) : (
          <Send className="h-5 w-5" />
        )}
      </Button>
      
      <VoiceRecorder 
        onTranscription={onTranscription} 
        setIsRecording={setIsRecording}
        disabled={isProcessing}
      />
      
      <Button 
        variant="ghost" 
        size="icon" 
        className="h-10 w-10 rounded-full text-purple-600 hover:bg-purple-100"
        onClick={() => window.location.href = '/planner'}
      >
        <Calendar className="h-5 w-5" />
      </Button>
    </div>
  );
};

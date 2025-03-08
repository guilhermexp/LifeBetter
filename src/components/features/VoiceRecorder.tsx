
import React, { useState, useRef } from 'react';
import { Mic, Square, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface VoiceRecorderProps {
  onTranscription: (text: string) => void;
  setIsRecording?: (isRecording: boolean) => void;
  disabled?: boolean;
}

export const VoiceRecorder = ({ onTranscription, setIsRecording, disabled = false }: VoiceRecorderProps) => {
  const [recording, setRecording] = useState(false);
  const [processing, setProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const { toast } = useToast();

  const startRecording = async () => {
    try {
      audioChunksRef.current = [];
      
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      
      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };
      
      mediaRecorder.onstop = handleStop;
      
      mediaRecorder.start();
      setRecording(true);
      if (setIsRecording) setIsRecording(true);
      
      toast({
        title: "Gravação iniciada",
        description: "Fale o que deseja adicionar à sua agenda",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        variant: "destructive",
        title: "Erro ao iniciar gravação",
        description: "Verifique se o acesso ao microfone está permitido."
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      const tracks = mediaRecorderRef.current.stream.getTracks();
      tracks.forEach(track => track.stop());
      setRecording(false);
      if (setIsRecording) setIsRecording(false);
    }
  };

  const handleStop = async () => {
    try {
      setProcessing(true);
      
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        try {
          const base64Audio = (reader.result as string)?.split(',')[1];
          
          // Send to Supabase Edge Function
          const { data, error } = await supabase.functions.invoke('voice-to-text', {
            body: { audio: base64Audio }
          });
          
          if (error) {
            throw error;
          }
          
          if (data.text && typeof data.text === 'string') {
            toast({
              title: "Áudio transcrito",
              description: data.text.slice(0, 50) + (data.text.length > 50 ? '...' : '')
            });
            onTranscription(data.text);
          } else {
            throw new Error('Falha na transcrição');
          }
        } catch (error) {
          console.error('Error processing audio:', error);
          toast({
            variant: "destructive",
            title: "Erro ao processar áudio",
            description: "Não foi possível transcrever seu áudio. Tente novamente."
          });
        } finally {
          setProcessing(false);
        }
      };
    } catch (error) {
      console.error('Error handling audio stop:', error);
      setProcessing(false);
      toast({
        variant: "destructive",
        title: "Erro ao processar áudio",
        description: "Ocorreu um erro inesperado."
      });
    }
  };

  return (
    <div>
      {processing ? (
        <Button disabled variant="outline" size="icon" className="h-10 w-10 rounded-full">
          <Loader2 className="h-5 w-5 animate-spin" />
        </Button>
      ) : recording ? (
        <Button 
          onClick={stopRecording} 
          variant="destructive" 
          size="icon" 
          className="h-10 w-10 rounded-full"
          disabled={disabled}
        >
          <Square className="h-5 w-5" />
        </Button>
      ) : (
        <Button 
          onClick={startRecording} 
          variant="outline" 
          size="icon" 
          className="h-10 w-10 rounded-full hover:bg-red-100 hover:text-red-600 border-dashed"
          disabled={disabled}
        >
          <Mic className="h-5 w-5" />
        </Button>
      )}
    </div>
  );
};

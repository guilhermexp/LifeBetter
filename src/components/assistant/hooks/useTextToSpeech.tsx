
import { useState, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface TextToSpeechOptions {
  voiceId?: string;
  modelId?: string;
}

export const useTextToSpeech = (options: TextToSpeechOptions = {}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Default voice and model if not provided
  const voiceId = options.voiceId || 'EXAVITQu4vr4xnSDxMaL'; // Sarah voice
  const modelId = options.modelId || 'eleven_multilingual_v2';

  // Initialize audio element if it doesn't exist
  const initAudio = () => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.onended = () => setIsSpeaking(false);
      audioRef.current.onerror = () => {
        setIsSpeaking(false);
        setError('Erro ao reproduzir áudio');
      };
    }
    return audioRef.current;
  };

  // Stop current speech
  const stopSpeech = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      setIsSpeaking(false);
    }
  };

  // Convert text to speech and play it
  const speak = async (text: string) => {
    try {
      if (!text || text.trim() === '') return;

      // Stop any current speech
      stopSpeech();
      
      setIsLoading(true);
      setError(null);

      // Call Supabase Edge Function
      const { data, error } = await supabase.functions.invoke('text-to-speech', {
        body: { 
          text, 
          voiceId,
          modelId
        }
      });

      if (error) {
        console.error('Erro na função text-to-speech:', error);
        setError('Erro ao converter texto para fala');
        setIsLoading(false);
        return;
      }

      if (!data?.audioContent) {
        setError('Resposta inválida do serviço de texto para fala');
        setIsLoading(false);
        return;
      }

      // Create audio from base64
      const audio = initAudio();
      audio.src = `data:audio/mpeg;base64,${data.audioContent}`;
      
      setIsLoading(false);
      setIsSpeaking(true);
      
      audio.play();
    } catch (err) {
      console.error('Erro ao processar texto para fala:', err);
      setError('Erro ao processar texto para fala');
      setIsLoading(false);
    }
  };

  return {
    speak,
    stopSpeech,
    isSpeaking,
    isLoading,
    error
  };
};

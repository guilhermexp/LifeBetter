
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

// Define the types needed by components
export type MoodType = 'anxiety' | 'anger' | 'fatigue' | 'sadness' | 'vigor' | 'happiness';

export interface MoodEntry {
  id?: string;
  user_id?: string;
  mood_type: MoodType;
  intensity: number;
  note: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MoodInsight {
  type: 'positive' | 'negative' | 'neutral';
  text: string;
  recommendation?: string;
}

export interface MoodTrigger {
  id: string;
  name: string;
}

export function useMoodTracking() {
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [currentMood, setCurrentMood] = useState<MoodEntry>({
    mood_type: 'happiness',
    intensity: 5,
    note: null
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [moodInsights, setMoodInsights] = useState<MoodInsight[]>([]);
  const { toast } = useToast();

  const fetchMoodHistory = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }

      const { data, error: fetchError } = await supabase
        .from('mood_entries')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(10);

      if (fetchError) throw fetchError;

      console.log("Dados de humor brutos recebidos:", data);

      if (!data || data.length === 0) {
        console.log("Nenhum dado de humor encontrado");
        setMoodHistory([]);
        return [];
      }

      // Mapear explicitamente para garantir que os tipos estão corretos
      const typedData: MoodEntry[] = data.map(entry => ({
        id: entry.id,
        user_id: entry.user_id,
        mood_type: entry.mood_type as MoodType,
        intensity: entry.intensity,
        note: entry.note,
        created_at: entry.created_at,
        updated_at: entry.updated_at
      }));
      
      console.log("Dados de humor convertidos:", typedData);
      setMoodHistory(typedData);
      
      // Generate basic insights if we have enough entries
      if (typedData.length > 2) {
        generateInsights(typedData);
      }
      
      return typedData;
    } catch (error) {
      console.error("Erro ao buscar histórico de humor:", error);
      setError("Não foi possível carregar seu histórico de humor.");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar seu histórico de humor."
      });
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  const saveMood = useCallback(async (triggers: string[] = []) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      if (!currentMood.mood_type) {
        throw new Error("Tipo de humor não selecionado");
      }
      
      // Add triggers to note if provided
      let noteWithTriggers = currentMood.note || '';
      if (triggers && triggers.length > 0) {
        noteWithTriggers += `\nGatilhos: ${triggers.join(', ')}`;
      }
      
      const moodData = {
        user_id: user.id,
        mood_type: currentMood.mood_type,
        intensity: currentMood.intensity,
        note: noteWithTriggers || null
      };
      
      const { data, error: insertError } = await supabase
        .from('mood_entries')
        .insert(moodData)
        .select()
        .single();
        
      if (insertError) throw insertError;
      
      // Convert the database result to a properly typed MoodEntry object
      const typedData: MoodEntry = {
        id: data.id,
        user_id: data.user_id,
        mood_type: data.mood_type as MoodType,
        intensity: data.intensity,
        note: data.note,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      // Add to history
      setMoodHistory(prev => [typedData, ...prev]);
      
      // Reset current mood
      setCurrentMood({
        mood_type: 'happiness',
        intensity: 5,
        note: null
      });
      
      toast({
        title: "Humor registrado",
        description: "Seu registro de humor foi salvo com sucesso."
      });
      
      return typedData;
    } catch (error) {
      console.error("Erro ao salvar humor:", error);
      setError("Não foi possível salvar seu registro de humor.");
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível salvar seu registro de humor."
      });
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [currentMood, toast]);
  
  // Simple function to generate insights based on mood history
  const generateInsights = (entries: MoodEntry[]) => {
    const insights: MoodInsight[] = [];
    
    // Get most frequent mood
    const moodCounts: Record<MoodType, number> = {
      anxiety: 0,
      anger: 0,
      fatigue: 0,
      sadness: 0,
      vigor: 0,
      happiness: 0
    };
    
    entries.forEach(entry => {
      if (entry.mood_type) {
        moodCounts[entry.mood_type]++;
      }
    });
    
    const mostFrequentMood = Object.entries(moodCounts)
      .sort((a, b) => b[1] - a[1])[0][0] as MoodType;
    
    // Add insight based on most frequent mood
    if (['anxiety', 'anger', 'fatigue', 'sadness'].includes(mostFrequentMood)) {
      insights.push({
        type: 'negative',
        text: `Seu humor mais frequente é ${getMoodDisplayName(mostFrequentMood)}.`,
        recommendation: `Considere adicionar atividades que ajudem a reduzir ${getMoodDisplayName(mostFrequentMood)} em sua rotina.`
      });
    } else {
      insights.push({
        type: 'positive',
        text: `Seu humor mais frequente é ${getMoodDisplayName(mostFrequentMood)}.`,
        recommendation: "Continue com as atividades que promovem esse estado emocional positivo."
      });
    }
    
    // Add general insight
    insights.push({
      type: 'neutral',
      text: "Registrar seu humor regularmente ajuda a identificar padrões emocionais importantes.",
      recommendation: "Tente registrar seu humor pelo menos uma vez por dia para melhores resultados."
    });
    
    setMoodInsights(insights);
  };
  
  // Helper function to get mood name in Portuguese
  const getMoodDisplayName = (moodType: MoodType): string => {
    switch (moodType) {
      case 'anxiety': return 'Ansiedade';
      case 'anger': return 'Raiva';
      case 'fatigue': return 'Cansaço';
      case 'sadness': return 'Tristeza';
      case 'vigor': return 'Vigor';
      case 'happiness': return 'Alegria';
      default: return '';
    }
  };

  return { 
    moodHistory, 
    fetchMoodHistory,
    currentMood,
    setCurrentMood,
    saveMood,
    moodInsights,
    isLoading,
    error
  };
}

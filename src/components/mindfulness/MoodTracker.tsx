
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { MoodEntry, MoodType } from '@/hooks/useMoodTracking';
import { motion } from 'framer-motion';
import { Edit, Save } from 'lucide-react';

interface MoodOption {
  type: MoodType;
  label: string;
  emoji: string;
  color: string;
}

const moodOptions: MoodOption[] = [
  { type: 'anxiety', label: 'Ansiedade', emoji: '😟', color: 'bg-yellow-100 border-yellow-300' },
  { type: 'anger', label: 'Irritação', emoji: '😡', color: 'bg-red-100 border-red-300' },
  { type: 'fatigue', label: 'Cansaço', emoji: '😴', color: 'bg-blue-100 border-blue-300' },
  { type: 'sadness', label: 'Tristeza', emoji: '😢', color: 'bg-indigo-100 border-indigo-300' },
  { type: 'vigor', label: 'Vigor', emoji: '💪', color: 'bg-green-100 border-green-300' },
  { type: 'happiness', label: 'Alegria', emoji: '😊', color: 'bg-pink-100 border-pink-300' },
];

interface MoodTrackerProps {
  currentMood: MoodEntry;
  setCurrentMood: (mood: MoodEntry) => void;
  onSave: () => Promise<void>;
  isLoading: boolean;
}

export function MoodTracker({ currentMood, setCurrentMood, onSave, isLoading }: MoodTrackerProps) {
  const [showNote, setShowNote] = useState(false);

  const handleMoodSelect = (moodType: MoodType) => {
    setCurrentMood({ ...currentMood, mood_type: moodType });
  };

  const handleIntensityChange = (value: number[]) => {
    setCurrentMood({ ...currentMood, intensity: value[0] });
  };

  const handleNoteChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCurrentMood({ ...currentMood, note: e.target.value });
  };

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
        {moodOptions.map((mood, index) => (
          <motion.button
            key={mood.type}
            onClick={() => handleMoodSelect(mood.type)}
            className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all shadow-sm
              ${currentMood.mood_type === mood.type 
                ? `${mood.color} border-dashed` 
                : 'bg-gray-50 border-transparent hover:bg-gray-100'}`}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <motion.span 
              className="text-4xl mb-2"
              animate={{ 
                scale: currentMood.mood_type === mood.type ? [1, 1.2, 1] : 1 
              }}
              transition={{ 
                duration: 0.5, 
                repeat: currentMood.mood_type === mood.type ? Infinity : 0,
                repeatType: "reverse",
                repeatDelay: 1
              }}
            >
              {mood.emoji}
            </motion.span>
            <span className="text-sm font-medium">{mood.label}</span>
          </motion.button>
        ))}
      </div>

      {currentMood.mood_type && (
        <>
          <motion.div 
            className="space-y-3 bg-white p-4 rounded-xl shadow-sm border border-gray-100"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.3 }}
          >
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Intensidade</span>
              <motion.span 
                className="text-sm font-bold bg-purple-100 text-purple-700 px-2 py-1 rounded-full"
                key={currentMood.intensity}
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 500, damping: 15 }}
              >
                {currentMood.intensity}/10
              </motion.span>
            </div>
            <Slider
              value={[currentMood.intensity]}
              min={1}
              max={10}
              step={1}
              onValueChange={handleIntensityChange}
              className="py-4"
            />
          </motion.div>

          <motion.div 
            className="flex gap-3"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: 0.4 }}
          >
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button 
                variant="outline" 
                onClick={() => setShowNote(!showNote)}
                className="text-sm border-2 border-gray-200 hover:bg-gray-100 hover:text-gray-800 rounded-xl py-5 px-4 font-medium flex items-center gap-2"
              >
                <Edit className="h-4 w-4" />
                {showNote ? 'Esconder nota' : 'Adicionar nota'}
              </Button>
            </motion.div>
            
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="ml-auto">
              <Button 
                onClick={onSave} 
                disabled={isLoading} 
                className="text-sm bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-md rounded-xl py-5 px-4 font-medium flex items-center gap-2"
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Salvando...
                  </span>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Salvar humor
                  </>
                )}
              </Button>
            </motion.div>
          </motion.div>

          {showNote && (
            <motion.div 
              className="pt-2"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Textarea
                placeholder="Como você está se sentindo? Adicione detalhes sobre seu humor atual..."
                value={currentMood.note || ''}
                onChange={handleNoteChange}
                rows={3}
                className="resize-none border-2 border-gray-200 focus:border-purple-400 rounded-xl shadow-sm"
              />
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}


import { useState } from 'react';
import { 
  Dialog, 
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogBody
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { MoodTracker } from '@/components/mindfulness/MoodTracker';
import { MoodTriggers, MoodTriggerType } from '@/components/mindfulness/MoodTriggers';
import { MoodEntry, MoodType } from '@/hooks/useMoodTracking';
import { motion, AnimatePresence } from 'framer-motion';
import { Smile, ArrowLeft, Save, X, Sparkles } from 'lucide-react';

interface MoodCheckInDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  currentMood: MoodEntry;
  setCurrentMood: (mood: MoodEntry) => void;
  onSave: (triggers: MoodTriggerType[]) => Promise<void>;
  isLoading: boolean;
}

export function MoodCheckInDialog({
  isOpen,
  onOpenChange,
  currentMood,
  setCurrentMood,
  onSave,
  isLoading
}: MoodCheckInDialogProps) {
  const [step, setStep] = useState<'mood' | 'triggers'>('mood');
  const [selectedTriggers, setSelectedTriggers] = useState<MoodTriggerType[]>([]);
  const [note, setNote] = useState<string>('');

  const handleOpenChange = (open: boolean) => {
    if (!open) {
      // Reset state when dialog is closed
      setStep('mood');
      setSelectedTriggers([]);
      setNote('');
    }
    onOpenChange(open);
  };

  const handleMoodSelected = () => {
    if (currentMood.mood_type) {
      setStep('triggers');
    }
  };

  const handleSave = async () => {
    // Update note in the current mood
    setCurrentMood({
      ...currentMood,
      note: note || null
    });
    
    // Call the save function with triggers
    await onSave(selectedTriggers);
    
    // Close the dialog
    handleOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="w-full max-w-lg p-0 overflow-hidden bg-white rounded-3xl mx-auto shadow-xl border-0">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.3 }}
        >
          <DialogHeader className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-700 text-white relative overflow-hidden">
            <motion.div 
              className="absolute top-0 right-0 w-64 h-64 bg-white opacity-5 rounded-full -mt-32 -mr-32"
              animate={{ 
                scale: [1, 1.1, 1],
                opacity: [0.05, 0.08, 0.05]
              }}
              transition={{ 
                duration: 8,
                repeat: Infinity,
                repeatType: "reverse"
              }}
            />
            
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => handleOpenChange(false)} 
                className="rounded-full absolute right-4 top-4 text-white hover:bg-white/20"
              >
                <X className="h-6 w-6" />
              </Button>
            </motion.div>
            
            <div className="flex items-center gap-3">
              <motion.div
                initial={{ rotate: -10, scale: 0.9 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white/20 p-2 rounded-xl"
              >
                <Smile className="h-6 w-6 text-yellow-300" />
              </motion.div>
              <DialogTitle className="text-2xl font-bold">Check-in de Humor</DialogTitle>
            </div>
          </DialogHeader>
          
          <DialogBody className="px-6 py-5 space-y-5">
            <AnimatePresence mode="wait">
              {step === 'mood' ? (
                <motion.div 
                  className="space-y-6"
                  key="mood-step"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-5 w-5 text-purple-500" />
                    <h3 className="text-lg font-bold text-gray-800">Como você está se sentindo hoje?</h3>
                  </div>
                  
                  <MoodTracker
                    currentMood={currentMood}
                    setCurrentMood={setCurrentMood}
                    onSave={() => Promise.resolve()}
                    isLoading={isLoading}
                  />
                  
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                  >
                    <Button 
                      onClick={handleMoodSelected} 
                      disabled={!currentMood.mood_type || isLoading}
                      className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-md rounded-xl py-6 font-medium"
                    >
                      Continuar
                    </Button>
                  </motion.div>
                </motion.div>
              ) : (
                <motion.div 
                  className="space-y-6"
                  key="triggers-step"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ duration: 0.3 }}
                >
                  <MoodTriggers 
                    selectedTriggers={selectedTriggers}
                    onChange={setSelectedTriggers}
                  />
                  
                  <motion.div 
                    className="pt-4"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                  >
                    <h3 className="text-sm font-bold mb-2 flex items-center gap-2">
                      <Sparkles className="h-4 w-4 text-purple-500" />
                      Adicionar nota (opcional)
                    </h3>
                    <Textarea
                      placeholder="Como você está se sentindo? Adicione detalhes sobre seu humor atual..."
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      rows={3}
                      className="resize-none border-2 border-gray-200 focus:border-purple-400 rounded-xl shadow-sm"
                    />
                  </motion.div>
                  
                  <div className="flex gap-4 pt-2">
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
                      <Button 
                        variant="outline" 
                        onClick={() => setStep('mood')}
                        className="w-full border-2 border-gray-200 hover:bg-gray-100 hover:text-gray-800 rounded-xl py-5 font-medium flex items-center justify-center gap-2"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Voltar
                      </Button>
                    </motion.div>
                    
                    <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} className="flex-1">
                      <Button 
                        onClick={handleSave} 
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-purple-600 to-indigo-700 hover:from-purple-700 hover:to-indigo-800 text-white shadow-md rounded-xl py-5 font-medium flex items-center justify-center gap-2"
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
                            Salvar
                          </>
                        )}
                      </Button>
                    </motion.div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </DialogBody>
        </motion.div>
      </DialogContent>
    </Dialog>
  );
}

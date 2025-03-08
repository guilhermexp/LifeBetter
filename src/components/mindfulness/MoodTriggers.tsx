
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Heart, Brain, Cloud, Coffee, Users, X, Briefcase, Home, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

// Define mood trigger types for better type safety
export type MoodTriggerType = string;

const triggerCategories = [
  {
    name: 'Físico',
    icon: <Heart className="h-4 w-4 text-red-500" />,
    triggers: [
      'Cansaço', 'Fome', 'Dor', 'Exercício', 'Doença', 'Sono ruim', 'Álcool'
    ]
  },
  {
    name: 'Mental',
    icon: <Brain className="h-4 w-4 text-purple-500" />,
    triggers: [
      'Estresse', 'Sobrecarga', 'Preocupação', 'Desafio', 'Ansiedade', 'Conquista', 'Frustração'
    ]
  },
  {
    name: 'Ambiente',
    icon: <Cloud className="h-4 w-4 text-blue-500" />,
    triggers: [
      'Clima', 'Barulho', 'Local', 'Notícias', 'Redes sociais', 'Trânsito', 'Prazos'
    ]
  },
  {
    name: 'Social',
    icon: <Users className="h-4 w-4 text-amber-500" />,
    triggers: [
      'Família', 'Amigos', 'Colegas', 'Conflitos', 'Reuniões', 'Festas', 'Encontros', 'Solidão'
    ]
  },
  {
    name: 'Trabalho',
    icon: <Briefcase className="h-4 w-4 text-indigo-500" />,
    triggers: [
      'Pressão', 'Reuniões', 'Feedback', 'Prazos', 'Colegas', 'Liderança', 'Balanço'
    ]
  },
  {
    name: 'Hábitos',
    icon: <Coffee className="h-4 w-4 text-emerald-500" />,
    triggers: [
      'Alimentação', 'Cafeína', 'Exercícios', 'Meditação', 'Descanso', 'Hobby', 'Rotina'
    ]
  }
];

interface MoodTriggersProps {
  selectedTriggers: MoodTriggerType[];
  onChange: (triggers: MoodTriggerType[]) => void;
}

export function MoodTriggers({ selectedTriggers, onChange }: MoodTriggersProps) {
  const handleToggleTrigger = (trigger: string) => {
    if (selectedTriggers.includes(trigger)) {
      onChange(selectedTriggers.filter(t => t !== trigger));
    } else {
      onChange([...selectedTriggers, trigger]);
    }
  };

  return (
    <motion.div 
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2">
        <Sparkles className="h-4 w-4 text-purple-500" />
        <h3 className="text-sm font-bold text-gray-800">O que pode ter influenciado seu humor? (opcional)</h3>
      </div>
      
      <div className="space-y-6">
        {triggerCategories.map((category, categoryIndex) => (
          <motion.div 
            key={category.name}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: categoryIndex * 0.1 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <div className={`p-1.5 rounded-lg ${
                category.name === 'Físico' ? 'bg-red-100' :
                category.name === 'Mental' ? 'bg-purple-100' :
                category.name === 'Ambiente' ? 'bg-blue-100' :
                category.name === 'Social' ? 'bg-amber-100' :
                category.name === 'Trabalho' ? 'bg-indigo-100' :
                'bg-emerald-100'
              }`}>
                {category.icon}
              </div>
              <h4 className="text-sm font-semibold text-gray-700">{category.name}</h4>
            </div>
            <div className="flex flex-wrap gap-2">
              {category.triggers.map((trigger, triggerIndex) => {
                const isSelected = selectedTriggers.includes(trigger);
                return (
                  <motion.div
                    key={trigger}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.2, delay: 0.1 + (triggerIndex * 0.03) }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Badge
                      variant={isSelected ? "default" : "outline"} 
                      className={`cursor-pointer px-3 py-1.5 text-sm font-medium ${
                        isSelected 
                          ? `bg-purple-100 text-purple-800 hover:bg-purple-200 border border-purple-200` 
                          : 'bg-white hover:bg-gray-50 border border-gray-200'
                      }`}
                      onClick={() => handleToggleTrigger(trigger)}
                    >
                      {trigger}
                      {isSelected && <X className="ml-1.5 h-3 w-3" />}
                    </Badge>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        ))}
      </div>
      
      {selectedTriggers.length > 0 && (
        <motion.div 
          className="pt-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onChange([])}
              className="text-xs border border-gray-200 hover:bg-gray-50 rounded-lg px-3 py-1"
            >
              Limpar seleção
            </Button>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  );
}

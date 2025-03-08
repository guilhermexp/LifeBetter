
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Card, CardContent } from "@/components/ui/card";
import { MoodEntry, MoodType } from '@/hooks/useMoodTracking';
import { Skeleton } from '../ui/skeleton';
import { motion } from 'framer-motion';
import { CalendarDays } from 'lucide-react';

// Helper function to get mood display name in Portuguese
const getMoodDisplayName = (moodType: MoodType): string => {
  switch (moodType) {
    case 'anxiety':
      return 'Ansiedade';
    case 'anger':
      return 'Raiva';
    case 'fatigue':
      return 'Cansaço';
    case 'sadness':
      return 'Tristeza';
    case 'vigor':
      return 'Vigor';
    case 'happiness':
      return 'Alegria';
    default:
      return '';
  }
};

// Helper function to get mood color
const getMoodColor = (moodType: MoodType): string => {
  switch (moodType) {
    case 'anxiety':
      return 'bg-amber-400';
    case 'anger':
      return 'bg-rose-500';
    case 'fatigue':
      return 'bg-sky-400';
    case 'sadness':
      return 'bg-indigo-500';
    case 'vigor':
      return 'bg-emerald-500';
    case 'happiness':
      return 'bg-pink-400';
    default:
      return 'bg-gray-400';
  }
};

// Helper function to extract triggers from note
const extractTriggers = (note: string | null): string[] => {
  if (!note) return [];
  const triggersMatch = note.match(/Gatilhos: (.*?)($|\n)/);
  if (triggersMatch && triggersMatch[1]) {
    return triggersMatch[1].split(', ').map(t => t.trim());
  }
  return [];
};

interface MoodTimelineCardProps {
  entries: MoodEntry[];
  showFullHistory?: boolean;
}

export function MoodTimelineCard({ entries, showFullHistory = false }: MoodTimelineCardProps) {
  console.log("MoodTimelineCard recebeu entries:", entries);
  
  if (!entries || entries.length === 0) {
    console.log("Nenhuma entrada de humor disponível");
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <p className="text-center text-gray-500 text-sm">Nenhum registro de humor disponível.</p>
        </CardContent>
      </Card>
    );
  }

  // Filter entries to only include the current week (unless showFullHistory is true)
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 }); // Segunda-feira como início da semana
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 }); // Domingo como fim da semana
  
  const filteredEntries = showFullHistory 
    ? entries 
    : entries.filter(entry => {
        if (!entry.created_at) return false;
        const entryDate = parseISO(entry.created_at);
        return isWithinInterval(entryDate, { start: weekStart, end: weekEnd });
      });
  
  console.log("Entradas filtradas para a semana atual:", filteredEntries);

  // Group entries by date
  const entriesByDate = filteredEntries.reduce<Record<string, MoodEntry[]>>((acc, entry) => {
    if (!entry.created_at) {
      console.log("Entrada sem data de criação:", entry);
      return acc;
    }
    const date = entry.created_at.split('T')[0];
    if (!acc[date]) {
      acc[date] = [];
    }
    acc[date].push(entry);
    return acc;
  }, {});

  console.log("Entradas agrupadas por data:", entriesByDate);
  
  if (Object.keys(entriesByDate).length === 0) {
    console.log("Nenhuma entrada de humor válida disponível após agrupamento");
    return (
      <Card className="shadow-sm">
        <CardContent className="p-4">
          <p className="text-center text-gray-500 text-sm">Nenhum registro de humor nesta semana.</p>
        </CardContent>
      </Card>
    );
  }

  // Get month names in Portuguese
  const getMonthName = (dateStr: string) => {
    try {
      const date = parseISO(dateStr);
      return format(date, 'MMMM', {
        locale: ptBR
      });
    } catch (error) {
      console.error("Erro ao formatar data:", dateStr, error);
      return "";
    }
  };

  // Get all dates sorted by most recent
  const sortedDates = Object.keys(entriesByDate).sort().reverse();
  
  // Format the week range for display
  const weekRangeText = `${format(weekStart, 'dd/MM')} - ${format(weekEnd, 'dd/MM')}`;

  return (
    <motion.div 
      className="space-y-5"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      {!showFullHistory && (
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2 bg-purple-100 px-3 py-1.5 rounded-lg">
            <CalendarDays className="h-4 w-4 text-purple-600" />
            <span className="text-xs font-medium text-purple-700">Semana: {weekRangeText}</span>
          </div>
        </div>
      )}
      
      {sortedDates.map((date, dateIndex) => {
        const dateEntries = entriesByDate[date];
        const firstEntry = dateEntries[0];
        if (!firstEntry.created_at) {
          console.log("Primeira entrada sem data de criação:", firstEntry);
          return null;
        }
        
        try {
          const entryDate = parseISO(firstEntry.created_at);
          const weekday = format(entryDate, 'EEE', {
            locale: ptBR
          });
          const day = format(entryDate, 'dd');
          const monthName = getMonthName(firstEntry.created_at);
          
          return (
            <motion.div 
              key={date} 
              className="space-y-3"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 * dateIndex }}
            >
              {/* Date as section title */}
              <h3 className="text-sm font-semibold text-gray-600 capitalize flex items-center bg-purple-50 px-3 py-1.5 rounded-lg">
                <span className="capitalize">{weekday}</span>
                <span className="mx-1 font-bold">{day}</span>
                <span className="capitalize">{monthName}</span>
              </h3>
              
              <div className="space-y-2.5 pl-2">
                {dateEntries.map((entry, entryIndex) => {
                  if (!entry.created_at || !entry.mood_type) {
                    console.log("Entrada de humor inválida:", entry);
                    return null;
                  }
                  
                  try {
                    const time = format(parseISO(entry.created_at), 'HH:mm');
                    const moodName = getMoodDisplayName(entry.mood_type);
                    const moodColor = getMoodColor(entry.mood_type);
                    const triggers = extractTriggers(entry.note);
                    
                    return (
                      <motion.div 
                        key={entry.id} 
                        className="flex items-center gap-2"
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: 0.1 * entryIndex + 0.2 }}
                      >                    
                        <Card className="w-full shadow-sm border-0 hover:shadow-md transition-shadow duration-300">
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <div className={`w-4 h-4 rounded-full ${moodColor} flex-shrink-0`}></div>
                                <span className="text-sm font-semibold">{moodName}</span>
                              </div>
                              <span className="text-xs bg-gray-100 px-2 py-1 rounded-full text-gray-600 font-medium">{time}</span>
                            </div>
                            
                            {triggers.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-1.5">
                                {triggers.map((trigger, idx) => (
                                  <motion.span 
                                    key={idx} 
                                    className="inline-block bg-purple-50 rounded-full px-3 py-1 text-xs text-purple-700 font-medium"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                  >
                                    {trigger}
                                  </motion.span>
                                ))}
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      </motion.div>
                    );
                  } catch (error) {
                    console.error("Erro ao renderizar entrada:", entry, error);
                    return null;
                  }
                })}
              </div>
            </motion.div>
          );
        } catch (error) {
          console.error("Erro ao renderizar grupo de data:", date, error);
          return null;
        }
      })}
      
      {!showFullHistory && entries.length > filteredEntries.length && (
        <motion.div 
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.5 }}
        >
          <span className="text-xs bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full font-medium">
            Mostrando apenas registros desta semana
          </span>
        </motion.div>
      )}
    </motion.div>
  );
}

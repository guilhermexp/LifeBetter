
import { useEffect, useState } from 'react';
import { format, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { MoodEntry } from '@/hooks/useMoodTracking';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

interface MoodChartProps {
  moodHistory: MoodEntry[];
  isLoading: boolean;
}

export function MoodChart({ moodHistory, isLoading }: MoodChartProps) {
  const [period, setPeriod] = useState<'week' | 'month'>('week');
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    if (moodHistory.length === 0) return;

    const days = period === 'week' ? 7 : 30;
    const dates = Array.from({ length: days }, (_, i) => {
      const date = subDays(new Date(), days - i - 1);
      return format(date, 'yyyy-MM-dd');
    });

    // Create empty chart data with all dates
    const emptyChartData = dates.map(date => ({
      date,
      displayDate: format(new Date(date), 'dd/MM', { locale: ptBR }),
      anxiety: null,
      anger: null,
      fatigue: null,
      sadness: null,
      vigor: null,
      happiness: null,
    }));

    // Fill with available mood data
    const filledChartData = emptyChartData.map(dayData => {
      const dayEntries = moodHistory.filter(entry => 
        entry.created_at && format(new Date(entry.created_at), 'yyyy-MM-dd') === dayData.date
      );

      const newDayData = { ...dayData };
      
      // Average multiple entries for the same mood type on the same day
      ['anxiety', 'anger', 'fatigue', 'sadness', 'vigor', 'happiness'].forEach(mood => {
        const moodEntries = dayEntries.filter(entry => entry.mood_type === mood);
        if (moodEntries.length > 0) {
          const avgIntensity = moodEntries.reduce((sum, entry) => sum + entry.intensity, 0) / moodEntries.length;
          newDayData[mood] = avgIntensity;
        }
      });

      return newDayData;
    });

    setChartData(filledChartData);
  }, [moodHistory, period]);

  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  const moodColors = {
    anxiety: '#EAB308', // yellow
    anger: '#EF4444',   // red
    fatigue: '#3B82F6',  // blue
    sadness: '#6366F1',  // indigo
    vigor: '#22C55E',    // green
    happiness: '#EC4899', // pink
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Histórico de Humor</CardTitle>
        <div className="flex items-center space-x-2">
          <Button 
            variant={period === 'week' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('week')}
          >
            Semana
          </Button>
          <Button 
            variant={period === 'month' ? 'default' : 'outline'} 
            size="sm"
            onClick={() => setPeriod('month')}
          >
            Mês
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {moodHistory.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <p className="text-gray-500 dark:text-gray-400 mb-2">
              Nenhum registro de humor encontrado.
            </p>
            <p className="text-sm text-gray-400 dark:text-gray-500">
              Registre seu humor para visualizar o histórico.
            </p>
          </div>
        ) : (
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 5, right: 5, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="displayDate" 
                  tick={{ fontSize: 12 }} 
                />
                <YAxis 
                  domain={[0, 10]} 
                  tick={{ fontSize: 12 }}
                  label={{ 
                    value: 'Intensidade', 
                    angle: -90, 
                    position: 'insideLeft',
                    style: { fontSize: '12px', textAnchor: 'middle' }
                  }}
                />
                <Tooltip />
                <Legend />
                <Line 
                  name="Ansiedade" 
                  type="monotone" 
                  dataKey="anxiety" 
                  stroke={moodColors.anxiety} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }}
                  connectNulls
                />
                <Line 
                  name="Irritação" 
                  type="monotone" 
                  dataKey="anger" 
                  stroke={moodColors.anger} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }}
                  connectNulls
                />
                <Line 
                  name="Cansaço" 
                  type="monotone" 
                  dataKey="fatigue" 
                  stroke={moodColors.fatigue} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }}
                  connectNulls
                />
                <Line 
                  name="Tristeza" 
                  type="monotone" 
                  dataKey="sadness" 
                  stroke={moodColors.sadness} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }}
                  connectNulls
                />
                <Line 
                  name="Vigor" 
                  type="monotone" 
                  dataKey="vigor" 
                  stroke={moodColors.vigor} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }}
                  connectNulls
                />
                <Line 
                  name="Alegria" 
                  type="monotone" 
                  dataKey="happiness" 
                  stroke={moodColors.happiness} 
                  dot={{ r: 3 }} 
                  activeDot={{ r: 5 }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

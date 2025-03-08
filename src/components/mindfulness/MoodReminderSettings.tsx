
import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TimerIcon, Bell } from 'lucide-react';
import { toast } from 'sonner';

export function MoodReminderSettings() {
  const [enableReminders, setEnableReminders] = useState(false);
  const [frequency, setFrequency] = useState('daily');
  const [timeOfDay, setTimeOfDay] = useState('evening');
  
  const handleSaveSettings = () => {
    // In a real app, we would save these settings to the database
    toast.success(`Configurações de lembretes salvas: ${enableReminders ? 'Ativado' : 'Desativado'}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-gray-500" />
          <span className="font-medium">Ativar lembretes de humor</span>
        </div>
        <Switch 
          checked={enableReminders} 
          onCheckedChange={setEnableReminders} 
        />
      </div>
      
      {enableReminders && (
        <>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-500 dark:text-gray-400">Frequência</label>
              <Select 
                value={frequency}
                onValueChange={setFrequency}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Frequência" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Diariamente</SelectItem>
                  <SelectItem value="weekdays">Dias de semana</SelectItem>
                  <SelectItem value="weekends">Fins de semana</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center justify-between">
              <label className="text-sm text-gray-500 dark:text-gray-400">Horário</label>
              <Select 
                value={timeOfDay}
                onValueChange={setTimeOfDay}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Horário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="morning">Manhã (08:00)</SelectItem>
                  <SelectItem value="midday">Meio-dia (12:00)</SelectItem>
                  <SelectItem value="afternoon">Tarde (15:00)</SelectItem>
                  <SelectItem value="evening">Noite (20:00)</SelectItem>
                  <SelectItem value="custom">Horário personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="pt-2">
            <Button 
              variant="outline" 
              className="w-full"
              onClick={handleSaveSettings}
            >
              <TimerIcon className="h-4 w-4 mr-2" />
              Salvar configurações
            </Button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-2">
              Você receberá lembretes para registrar seu humor e bem-estar.
            </p>
          </div>
        </>
      )}
    </div>
  );
}

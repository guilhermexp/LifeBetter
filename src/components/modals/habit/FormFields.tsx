import { Clock, Calendar, Info } from "lucide-react";
import { AreaType } from "@/types/habits";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface TitleFieldProps {
  title: string;
  setTitle: (title: string) => void;
  fetchHabitPlan: () => void;
  isLoading: boolean;
}

export const TitleField = ({ title, setTitle, fetchHabitPlan, isLoading }: TitleFieldProps) => (
  <div className="space-y-2">
    <label htmlFor="title" className="text-sm font-medium">Título</label>
    <div className="flex items-center gap-2">
      <Input
        id="title"
        placeholder="Ex: Meditar pela manhã"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <Button 
        type="button" 
        variant="outline" 
        size="sm"
        disabled={isLoading}
        onClick={fetchHabitPlan}
        className="whitespace-nowrap"
      >
        <Info className="w-4 h-4 mr-2" />
        Ver Dicas
      </Button>
    </div>
  </div>
);

interface DescriptionFieldProps {
  description: string;
  setDescription: (description: string) => void;
}

export const DescriptionField = ({ description, setDescription }: DescriptionFieldProps) => (
  <div className="space-y-2">
    <label htmlFor="description" className="text-sm font-medium">Descrição (opcional)</label>
    <Textarea
      id="description"
      placeholder="Detalhes sobre seu hábito"
      value={description}
      onChange={(e) => setDescription(e.target.value)}
      rows={3}
    />
  </div>
);

interface CategoryFieldProps {
  category: string;
  setCategory: (category: string) => void;
}

export const CategoryField = ({ category, setCategory }: CategoryFieldProps) => (
  <div className="space-y-2">
    <label htmlFor="category" className="text-sm font-medium">Categoria</label>
    <Select value={category} onValueChange={setCategory}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione uma categoria" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="health">Saúde</SelectItem>
        <SelectItem value="business">Trabalho</SelectItem>
        <SelectItem value="spirituality">Espiritualidade</SelectItem>
        <SelectItem value="finances">Finanças</SelectItem>
        <SelectItem value="family">Família</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

interface DateFieldProps {
  date: Date;
  setDate: (date: Date) => void;
}

export const DateField = ({ date, setDate }: DateFieldProps) => (
  <div className="space-y-2">
    <label htmlFor="date" className="text-sm font-medium">Data de Início</label>
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className="w-full justify-start text-left font-normal">
          <Calendar className="mr-2 h-4 w-4" />
          {format(date, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0">
        <CalendarComponent
          mode="single"
          selected={date}
          onSelect={(date) => date && setDate(date)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  </div>
);

interface TimeFieldProps {
  startTime: string;
  setStartTime: (time: string) => void;
}

export const TimeField = ({ startTime, setStartTime }: TimeFieldProps) => (
  <div className="space-y-2">
    <label htmlFor="time" className="text-sm font-medium">Horário</label>
    <div className="flex items-center">
      <Clock className="w-4 h-4 mr-2 text-gray-500" />
      <Input
        id="time"
        type="time"
        value={startTime}
        onChange={(e) => setStartTime(e.target.value)}
      />
    </div>
  </div>
);

interface DurationFieldProps {
  duration: number;
  setDuration: (duration: number) => void;
}

export const DurationField = ({ duration, setDuration }: DurationFieldProps) => (
  <div className="space-y-2">
    <label htmlFor="duration" className="text-sm font-medium">Duração (minutos)</label>
    <Input
      id="duration"
      type="number"
      min="5"
      max="180"
      value={duration}
      onChange={(e) => setDuration(parseInt(e.target.value, 10))}
    />
  </div>
);

interface DurationDaysFieldProps {
  durationDays: number | null;
  setDurationDays: (days: number | null) => void;
}

export const DurationDaysField = ({ durationDays, setDurationDays }: DurationDaysFieldProps) => (
  <div className="space-y-2">
    <label htmlFor="durationDays" className="text-sm font-medium">
      Duração do hábito (dias)
      <span className="ml-1 text-xs text-gray-500">(opcional)</span>
    </label>
    <Input
      id="durationDays"
      type="number"
      min="1"
      max="365"
      placeholder="Ex: 21 (para formação de hábito)"
      value={durationDays !== null ? durationDays : ''}
      onChange={(e) => {
        const value = e.target.value ? parseInt(e.target.value, 10) : null;
        setDurationDays(value);
      }}
    />
    <p className="text-xs text-gray-500 mt-1">
      Recomendado: 21 dias para iniciar a formação do hábito, 66 dias para consolidá-lo.
    </p>
  </div>
);

interface FrequencyFieldProps {
  frequency: string;
  setFrequency: (frequency: string) => void;
}

export const FrequencyField = ({ frequency, setFrequency }: FrequencyFieldProps) => (
  <div className="space-y-2">
    <label htmlFor="frequency" className="text-sm font-medium">Frequência</label>
    <Select value={frequency} onValueChange={setFrequency}>
      <SelectTrigger>
        <SelectValue placeholder="Selecione a frequência" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="daily">Diário</SelectItem>
        <SelectItem value="weekly">Semanal</SelectItem>
        <SelectItem value="monthly">Mensal</SelectItem>
      </SelectContent>
    </Select>
  </div>
);

interface WeekdaysSelectorProps {
  selectedDays: number[];
  handleToggleDay: (day: number) => void;
}

export const WeekdaysSelector = ({ selectedDays, handleToggleDay }: WeekdaysSelectorProps) => {
  const weekDays = [
    { value: 0, label: 'D' },
    { value: 1, label: 'S' },
    { value: 2, label: 'T' },
    { value: 3, label: 'Q' },
    { value: 4, label: 'Q' },
    { value: 5, label: 'S' },
    { value: 6, label: 'S' },
  ];
  
  return (
    <div className="space-y-2">
      <label className="text-sm font-medium">Dias da semana</label>
      <div className="flex flex-wrap gap-2">
        {weekDays.map((day) => (
          <Button
            key={day.value}
            type="button"
            variant={selectedDays.includes(day.value) ? "default" : "outline"}
            size="sm"
            className="w-8 h-8 p-0"
            onClick={() => handleToggleDay(day.value)}
          >
            {day.label}
          </Button>
        ))}
      </div>
      {selectedDays.length === 0 && (
        <p className="text-xs text-red-500">Selecione pelo menos um dia</p>
      )}
    </div>
  );
};

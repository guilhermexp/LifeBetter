
import React from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';

// Title Field Component
export const TitleField = ({ 
  value, 
  onChange 
}: { 
  value: string, 
  onChange: (value: string) => void 
}) => (
  <div className="space-y-2">
    <Label htmlFor="title">Nome do Hábito</Label>
    <Input 
      id="title" 
      placeholder="Ex: Ler 20 páginas" 
      value={value}
      onChange={(e) => onChange(e.target.value)}
      required
      className="w-full"
    />
  </div>
);

// Description Field Component
export const DescriptionField = ({ 
  value, 
  onChange 
}: { 
  value: string, 
  onChange: (value: string) => void 
}) => (
  <div className="space-y-2">
    <Label htmlFor="description">Descrição (opcional)</Label>
    <Textarea 
      id="description" 
      placeholder="Por que este hábito é importante para você?"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={3}
      className="resize-none"
    />
  </div>
);

// Area and Frequency Fields Component
export const AreaFrequencyFields = ({ 
  area, 
  frequency, 
  onAreaChange, 
  onFrequencyChange 
}: { 
  area: string, 
  frequency: string, 
  onAreaChange: (value: string) => void, 
  onFrequencyChange: (value: string) => void 
}) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="area">Área</Label>
      <Select 
        value={area} 
        onValueChange={onAreaChange}
      >
        <SelectTrigger id="area" className="w-full">
          <SelectValue placeholder="Selecione uma área" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="health">Saúde</SelectItem>
          <SelectItem value="business">Trabalho</SelectItem>
          <SelectItem value="family">Família</SelectItem>
          <SelectItem value="spirituality">Espiritualidade</SelectItem>
          <SelectItem value="finances">Finanças</SelectItem>
        </SelectContent>
      </Select>
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="frequency">Frequência</Label>
      <Select 
        value={frequency} 
        onValueChange={onFrequencyChange}
      >
        <SelectTrigger id="frequency" className="w-full">
          <SelectValue placeholder="Selecione uma frequência" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="once">Única vez</SelectItem>
          <SelectItem value="daily">Diário</SelectItem>
          <SelectItem value="weekly">Semanal</SelectItem>
          <SelectItem value="monthly">Mensal</SelectItem>
        </SelectContent>
      </Select>
    </div>
  </div>
);

// Date and Time Fields Component
export const DateTimeFields = ({ 
  date, 
  time, 
  onDateChange, 
  onTimeChange 
}: { 
  date: Date, 
  time: string, 
  onDateChange: (date: Date | undefined) => void, 
  onTimeChange: (time: string) => void 
}) => (
  <div className="grid grid-cols-2 gap-4">
    <div className="space-y-2">
      <Label htmlFor="date">Data de Início</Label>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className="w-full justify-start text-left font-normal"
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(date, 'dd/MM/yyyy')}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 z-50" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(newDate) => newDate && onDateChange(newDate)}
            initialFocus
            classNames={{
              day: "text-center p-0 h-7 w-7 text-xs rounded-md hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground data-[selected]:bg-primary data-[selected]:text-primary-foreground"
            }}
          />
        </PopoverContent>
      </Popover>
    </div>
    
    <div className="space-y-2">
      <Label htmlFor="time">Horário</Label>
      <Input 
        id="time" 
        type="time" 
        value={time}
        onChange={(e) => onTimeChange(e.target.value)}
        className="w-full"
      />
    </div>
  </div>
);

// Duration Field Component
export const DurationField = ({ 
  value, 
  onChange 
}: { 
  value: number, 
  onChange: (value: number) => void 
}) => (
  <div className="space-y-2">
    <Label htmlFor="duration">Duração (minutos)</Label>
    <Input 
      id="duration" 
      type="number" 
      min="5"
      max="240"
      value={value}
      onChange={(e) => onChange(Number(e.target.value))}
      className="w-full"
    />
  </div>
);

// Form Actions Component
export const FormActions = ({
  onCancel,
  isSubmitting
}: {
  onCancel: () => void,
  isSubmitting: boolean
}) => (
  <>
    <Button 
      variant="outline" 
      type="button" 
      onClick={onCancel}
      disabled={isSubmitting}
    >
      Cancelar
    </Button>
    <Button type="submit" disabled={isSubmitting}>
      {isSubmitting ? "Salvando..." : "Salvar Hábito"}
    </Button>
  </>
);

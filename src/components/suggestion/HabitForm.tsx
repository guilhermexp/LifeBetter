
import { useState } from "react";
import { Calendar, Clock, AlarmClock, Type, FileText, Repeat } from "lucide-react";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { HabitFrequency } from "@/types/habits";
import { AITip } from "./types";

interface HabitFormProps {
  habit: AITip;
  onFormChange: (formData: {
    title: string;
    description: string;
    frequency: HabitFrequency;
    date: Date;
    time: string;
    duration: number;
  }) => void;
}

export function HabitForm({ habit, onFormChange }: HabitFormProps) {
  const [title, setTitle] = useState(habit.title);
  const [description, setDescription] = useState(habit.description);
  const [frequency, setFrequency] = useState<HabitFrequency>(
    habit.implementation?.recommendedFrequency as HabitFrequency || 'daily'
  );
  const [date, setDate] = useState<Date>(new Date());
  const [time, setTime] = useState("08:00");
  const [duration, setDuration] = useState(30);

  // Handle frequency change with proper type casting
  const handleFrequencyChange = (value: string) => {
    setFrequency(value as HabitFrequency);
    updateFormData(value as HabitFrequency);
  };

  const updateFormData = (newFrequency?: HabitFrequency) => {
    onFormChange({
      title,
      description,
      frequency: newFrequency || frequency,
      date,
      time,
      duration
    });
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    updateFormData();
  };

  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setDescription(e.target.value);
    updateFormData();
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTime(e.target.value);
    updateFormData();
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDuration(parseInt(e.target.value) || 30);
    updateFormData();
  };

  const handleDateChange = (newDate: Date | undefined) => {
    if (newDate) {
      setDate(newDate);
      updateFormData();
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="title" className="text-sm flex items-center text-gray-700">
          <Type className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
          Nome do hábito
        </Label>
        <Input 
          id="title" 
          value={title} 
          onChange={handleTitleChange} 
          placeholder="Nome do hábito"
          className="h-10 rounded-lg border-gray-200 focus:border-purple-300 focus:ring-purple-200"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="description" className="text-sm flex items-center text-gray-700">
          <FileText className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
          Descrição
        </Label>
        <Textarea 
          id="description" 
          value={description} 
          onChange={handleDescriptionChange} 
          placeholder="Descrição do hábito"
          rows={2}
          className="text-sm rounded-lg border-gray-200 focus:border-purple-300 focus:ring-purple-200"
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="frequency" className="text-sm flex items-center text-gray-700">
            <Repeat className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
            Frequência
          </Label>
          <Select 
            value={frequency} 
            onValueChange={handleFrequencyChange}
          >
            <SelectTrigger className="h-10 rounded-lg border-gray-200">
              <SelectValue placeholder="Frequência" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="daily">Diário</SelectItem>
              <SelectItem value="weekly">Semanal</SelectItem>
              <SelectItem value="monthly">Mensal</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="time" className="text-sm flex items-center text-gray-700">
            <Clock className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
            Horário
          </Label>
          <Input 
            id="time" 
            type="time" 
            value={time} 
            onChange={handleTimeChange}
            className="h-10 rounded-lg border-gray-200 focus:border-purple-300 focus:ring-purple-200" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-sm flex items-center text-gray-700">
            <Calendar className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
            Data de início
          </Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-start text-left font-normal h-10 text-sm rounded-lg border-gray-200"
              >
                <Calendar className="mr-2 h-3.5 w-3.5 text-gray-500" />
                {format(date, "dd/MM/yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 z-50">
              <CalendarComponent
                mode="single"
                selected={date}
                onSelect={handleDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="duration" className="text-sm flex items-center text-gray-700">
            <AlarmClock className="h-3.5 w-3.5 mr-1.5 text-purple-500" />
            Duração (min)
          </Label>
          <Input 
            id="duration" 
            type="number" 
            value={duration} 
            onChange={handleDurationChange} 
            min={5}
            max={240}
            className="h-10 rounded-lg border-gray-200 focus:border-purple-300 focus:ring-purple-200"
          />
        </div>
      </div>
    </div>
  );
}


import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { v4 as uuidv4 } from 'uuid';
import { format, addDays, addWeeks, addMonths } from 'date-fns';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, CheckIcon, Plus, Trash } from 'lucide-react';
import { useUser } from '@/providers/UserProvider';

interface GoalModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
  userId?: string;
}

export function GoalModal({ isOpen, onOpenChange, onSuccess, userId }: GoalModalProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [timeframe, setTimeframe] = useState("month");
  const [area, setArea] = useState("business");
  const [startDate, setStartDate] = useState<Date>(new Date());
  const [endDate, setEndDate] = useState<Date>(() => addMonths(new Date(), 1));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [milestones, setMilestones] = useState<Array<{id: string, title: string}>>([
    { id: uuidv4(), title: "" }
  ]);
  const userContext = useUser();
  
  // Fix: Access user.id from the user object in the context
  const currentUserId = userId || (userContext?.user?.id || null);

  useEffect(() => {
    if (!isOpen) {
      // Reset form when modal closes
      setTitle("");
      setDescription("");
      setTimeframe("month");
      setArea("business");
      setStartDate(new Date());
      setEndDate(addMonths(new Date(), 1));
      setMilestones([{ id: uuidv4(), title: "" }]);
    }
  }, [isOpen]);

  useEffect(() => {
    // Update end date based on timeframe
    if (timeframe === "week") {
      setEndDate(addWeeks(startDate, 1));
    } else if (timeframe === "month") {
      setEndDate(addMonths(startDate, 1));
    } else if (timeframe === "quarter") {
      setEndDate(addMonths(startDate, 3));
    } else if (timeframe === "year") {
      setEndDate(addMonths(startDate, 12));
    }
  }, [timeframe, startDate]);

  const handleAddMilestone = () => {
    setMilestones([...milestones, { id: uuidv4(), title: "" }]);
  };

  const handleRemoveMilestone = (id: string) => {
    if (milestones.length <= 1) return;
    setMilestones(milestones.filter(m => m.id !== id));
  };

  const updateMilestone = (id: string, value: string) => {
    setMilestones(milestones.map(m => 
      m.id === id ? { ...m, title: value } : m
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUserId) {
      toast({
        title: "Erro",
        description: "Você precisa estar logado para criar uma meta",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    
    // Filter out empty milestones
    const validMilestones = milestones.filter(m => m.title.trim() !== "");
    
    if (validMilestones.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um marco para sua meta",
        variant: "destructive",
      });
      setIsSubmitting(false);
      return;
    }

    const goalId = uuidv4();
    
    const goalData = {
      id: goalId,
      title,
      details: description,
      type: "goal" as const,
      start_time: "08:00",
      duration: 60,
      color: getColorByArea(area),
      completed: false,
      scheduled_date: format(startDate, 'yyyy-MM-dd'),
      end_date: format(endDate, 'yyyy-MM-dd'),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      area,
      duration_days: Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)),
      user_id: currentUserId,
    };

    try {
      // Insert the goal
      const { error: goalError } = await supabase
        .from('tasks')
        .insert([goalData]);

      if (goalError) throw goalError;
      
      // Insert milestones with the required fields for the goal_milestones table
      if (validMilestones.length > 0) {
        // Fix: Add the required fields for the milestones
        const milestonesData = validMilestones.map((milestone, index) => ({
          id: milestone.id,
          goal_id: goalId,
          title: milestone.title,
          completed: false,
          created_at: new Date().toISOString(),
          // Added required fields
          order_index: index + 1, // Use the index as the order 
          target_date: format(endDate, 'yyyy-MM-dd'), // Use the goal's end date as the target date
          updated_at: new Date().toISOString()
        }));
        
        const { error: milestonesError } = await supabase
          .from('goal_milestones')
          .insert(milestonesData);
          
        if (milestonesError) {
          console.error("Erro ao inserir marcos:", milestonesError);
          // Não vamos lançar um erro aqui para não impedir a criação da meta
        }
      }

      toast({
        title: "Meta criada",
        description: "Sua nova meta foi adicionada com sucesso!",
      });
      
      onOpenChange(false);
      onSuccess?.();
    } catch (error: any) {
      console.error("Erro ao criar meta:", error);
      toast({
        title: "Erro",
        description: error.message || "Ocorreu um erro ao criar a meta",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getColorByArea = (area: string) => {
    const areaColors: Record<string, string> = {
      health: "#10b981",
      business: "#3b82f6",
      family: "#6366f1",
      spirituality: "#eab308",
      finances: "#a855f7"
    };
    
    return areaColors[area] || "#6b7280";
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Nova Meta</DialogTitle>
          <DialogDescription>
            Defina uma meta e crie marcos para acompanhar seu progresso
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Nome da Meta</Label>
            <Input 
              id="title" 
              placeholder="Ex: Lançar site da empresa" 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Descrição (opcional)</Label>
            <Textarea 
              id="description" 
              placeholder="Descreva os detalhes da sua meta"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="area">Área</Label>
              <Select 
                value={area} 
                onValueChange={setArea}
              >
                <SelectTrigger id="area">
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
              <Label htmlFor="timeframe">Prazo</Label>
              <Select 
                value={timeframe} 
                onValueChange={setTimeframe}
              >
                <SelectTrigger id="timeframe">
                  <SelectValue placeholder="Selecione um prazo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">1 Semana</SelectItem>
                  <SelectItem value="month">1 Mês</SelectItem>
                  <SelectItem value="quarter">3 Meses</SelectItem>
                  <SelectItem value="year">1 Ano</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="startDate">Data de Início</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  id="startDate"
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {format(startDate, 'dd/MM/yyyy')}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={(date) => date && setStartDate(date)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="endDate">Data de Conclusão (automática)</Label>
            <Input 
              id="endDate" 
              value={format(endDate, 'dd/MM/yyyy')}
              readOnly
              disabled
              className="bg-gray-50"
            />
          </div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Label>Marcos</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddMilestone}
              >
                <Plus className="h-4 w-4 mr-1" /> Adicionar
              </Button>
            </div>
            
            {milestones.map((milestone, index) => (
              <div key={milestone.id} className="flex items-center gap-2">
                <Input 
                  placeholder={`Marco ${index + 1}`}
                  value={milestone.title}
                  onChange={(e) => updateMilestone(milestone.id, e.target.value)}
                  required={index === 0}
                />
                {milestones.length > 1 && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleRemoveMilestone(milestone.id)}
                  >
                    <Trash className="h-4 w-4 text-gray-500" />
                  </Button>
                )}
              </div>
            ))}
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Salvando..." : "Salvar Meta"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

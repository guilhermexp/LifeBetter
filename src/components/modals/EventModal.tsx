
import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface EventModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const EventModal = ({ isOpen, onOpenChange, onSuccess }: EventModalProps) => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(60);
  const [color, setColor] = useState("#4CD964");
  const [details, setDetails] = useState("");
  const [location, setLocation] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();
  
  const durationOptions = [
    { value: 15, label: '15min' },
    { value: 30, label: '30min' },
    { value: 60, label: '1h' },
    { value: 90, label: '1h30' },
    { value: 120, label: '2h' },
    { value: 180, label: '3h' }
  ];
  
  const colorOptions = [
    { value: '#9b87f5', label: 'Roxo', description: 'Reunião' },
    { value: '#FF9500', label: 'Laranja', description: 'Social' },
    { value: '#FFCC33', label: 'Amarelo', description: 'Estudo' },
    { value: '#4CD964', label: 'Verde', description: 'Saúde' }
  ];

  const resetForm = () => {
    setTitle("");
    setTime("");
    setDuration(60);
    setColor("#4CD964");
    setDetails("");
    setLocation("");
    setIsCreating(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const handleCreateEvent = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O título do evento é obrigatório."
      });
      return;
    }
    
    setIsCreating(true);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      const { error } = await supabase.from('tasks').insert({
        title,
        scheduled_date: format(new Date(), 'yyyy-MM-dd'),
        start_time: time || null,
        duration,
        color,
        details,
        location,
        completed: false,
        type: 'event',
        user_id: user.id,
        scheduled: false // Marca o evento como não agendado (apenas na Inbox)
      });
      
      if (error) throw error;
      
      toast({
        title: "Evento criado!",
        description: "Seu evento foi adicionado com sucesso."
      });
      
      resetForm();
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Erro ao criar evento:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar o evento. Tente novamente."
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden bg-white rounded-xl mx-auto shadow-md">
        <DialogHeader className="px-6 pt-6 pb-4 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-purple-600 to-indigo-600 text-white relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose} 
            className="rounded-full absolute right-4 top-4 text-white hover:bg-white/20"
          >
            <X className="h-5 w-5" />
          </Button>
          
          <DialogTitle className="text-xl font-bold">Novo Evento</DialogTitle>
        </DialogHeader>

        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="event-title" className="text-gray-700">Título do Evento <span className="text-red-500">*</span></Label>
              <Input 
                id="event-title" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Título do evento" 
                className="w-full border-gray-300 focus:border-purple-500"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-time" className="text-gray-700">Horário do Evento</Label>
              <Input 
                id="event-time" 
                type="time" 
                value={time} 
                onChange={e => setTime(e.target.value)} 
                className="w-full border-gray-300 focus:border-purple-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-700">Duração do Evento</Label>
              <div className="flex flex-wrap gap-2">
                {durationOptions.map(option => (
                  <button
                    key={option.value}
                    className={cn(
                      "px-3 py-2 rounded-full text-sm font-medium transition-colors",
                      duration === option.value
                        ? "bg-purple-600 text-white"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                    )}
                    onClick={() => setDuration(option.value)}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-location" className="text-gray-700">Local do Evento</Label>
              <Input 
                id="event-location" 
                value={location} 
                onChange={e => setLocation(e.target.value)} 
                placeholder="Local do evento" 
                className="w-full border-gray-300 focus:border-purple-500"
              />
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-700">Categoria do Evento</Label>
              <div className="flex space-x-4 py-2">
                {colorOptions.map(colorOption => (
                  <div 
                    key={colorOption.value} 
                    className="flex flex-col items-center gap-1 cursor-pointer"
                    onClick={() => setColor(colorOption.value)}
                  >
                    <div 
                      className={`w-10 h-10 rounded-full transition-all duration-200 ${color === colorOption.value ? "ring-2 ring-offset-2 ring-purple-500" : ""}`} 
                      style={{ backgroundColor: colorOption.value }}
                    />
                    <span className="text-xs text-gray-600">{colorOption.description}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="event-details" className="text-gray-700">Descrição e Detalhes</Label>
              <Textarea 
                id="event-details" 
                value={details} 
                onChange={e => setDetails(e.target.value)} 
                placeholder="Adicione informações sobre o evento..." 
                className="min-h-[100px] w-full border-gray-300 focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="p-6 border-t border-gray-100">
          <div className="flex gap-3 w-full">
            <Button 
              variant="outline" 
              onClick={handleClose}
              className="flex-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleCreateEvent}
              className="flex-1 bg-gradient-to-r from-purple-600 to-indigo-600"
              disabled={isCreating || !title.trim()}
            >
              {isCreating ? "Criando..." : "Criar Evento"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

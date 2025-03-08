
import { useState } from "react";
import { X } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogBody, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface MeetingModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export const MeetingModal = ({ isOpen, onOpenChange, onSuccess }: MeetingModalProps) => {
  const [title, setTitle] = useState("");
  const [time, setTime] = useState("");
  const [duration, setDuration] = useState(30);
  const [meetingLink, setMeetingLink] = useState("");
  const [color, setColor] = useState("#5AC8FA");
  const [details, setDetails] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  const { toast } = useToast();
  
  const durationOptions = [
    { value: 15, label: '15min' },
    { value: 30, label: '30min' },
    { value: 45, label: '45min' },
    { value: 60, label: '1h' },
    { value: 90, label: '1h30' },
    { value: 120, label: '2h' }
  ];
  
  const colorOptions = [
    { value: '#5AC8FA', label: 'Azul', description: 'Trabalho' },
    { value: '#4CD964', label: 'Verde', description: 'Estudo' },
    { value: '#FF9500', label: 'Laranja', description: 'Social' },
    { value: '#9b87f5', label: 'Roxo', description: 'Projetos' }
  ];

  const resetForm = () => {
    setTitle("");
    setTime("");
    setDuration(30);
    setMeetingLink("");
    setColor("#5AC8FA");
    setDetails("");
    setIsCreating(false);
  };

  const handleClose = () => {
    resetForm();
    onOpenChange(false);
  };

  const validateMeetingLink = (link: string) => {
    if (!link) return true;
    
    const urlPattern = /^(https?:\/\/)?([\w-]+(\.[\w-]+)+|localhost)(:\d+)?(\/\S*)?$/;
    return urlPattern.test(link);
  };

  const handleCreateMeeting = async () => {
    if (!title.trim()) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "O título da reunião é obrigatório."
      });
      return;
    }
    
    if (meetingLink && !validateMeetingLink(meetingLink)) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, insira um link de reunião válido."
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
        meeting_link: meetingLink || null,
        completed: false,
        type: 'meeting',
        user_id: user.id,
        scheduled: false // Marca a reunião como não agendada (apenas na Inbox)
      });
      
      if (error) throw error;
      
      toast({
        title: "Reunião criada!",
        description: "Sua reunião foi adicionada com sucesso."
      });
      
      resetForm();
      onOpenChange(false);
      
      if (onSuccess) {
        onSuccess();
      }
      
    } catch (error) {
      console.error("Erro ao criar reunião:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível criar a reunião. Tente novamente."
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md p-0 overflow-hidden bg-white rounded-3xl mx-auto animate-fadeIn shadow-xl">
        <DialogHeader className="px-6 pt-6 pb-3 flex justify-between items-center border-b border-gray-100 bg-gradient-to-r from-indigo-500 to-blue-500 text-white relative">
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={handleClose} 
            className="rounded-full absolute right-4 top-4 text-white hover:bg-white/20"
          >
            <X className="h-6 w-6" />
          </Button>
          
          <DialogTitle className="text-2xl font-bold">Nova Reunião</DialogTitle>
        </DialogHeader>

        <DialogBody className="p-6 space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="meeting-title" className="text-gray-700">Título da Reunião <span className="text-red-500">*</span></Label>
              <Input 
                id="meeting-title" 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Título da reunião" 
                className="w-full border-gray-300 focus:border-indigo-500"
                autoFocus
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meeting-time" className="text-gray-700">Horário da Reunião</Label>
              <Input 
                id="meeting-time" 
                type="time" 
                value={time} 
                onChange={e => setTime(e.target.value)} 
                className="w-full border-gray-300 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500">Se não preenchido, a reunião será registrada sem horário fixo.</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-700">Duração da Reunião</Label>
              <div className="flex flex-wrap gap-2">
                {durationOptions.map(option => (
                  <button
                    key={option.value}
                    className={cn(
                      "px-3 py-2 rounded-full text-sm font-medium transition-colors",
                      duration === option.value
                        ? "bg-indigo-500 text-white"
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
              <Label htmlFor="meeting-link" className="text-gray-700">Link da Reunião</Label>
              <Input 
                id="meeting-link" 
                value={meetingLink} 
                onChange={e => setMeetingLink(e.target.value)} 
                placeholder="https://meet.google.com/..." 
                className="w-full border-gray-300 focus:border-indigo-500"
              />
              <p className="text-xs text-gray-500">Adicione um link de videoconferência (opcional).</p>
            </div>
            
            <div className="space-y-2">
              <Label className="text-gray-700">Categoria da Reunião</Label>
              <div className="flex space-x-4 py-2">
                {colorOptions.map(colorOption => (
                  <div 
                    key={colorOption.value} 
                    className="flex flex-col items-center gap-1 cursor-pointer"
                    onClick={() => setColor(colorOption.value)}
                  >
                    <div 
                      className={`w-10 h-10 rounded-full transition-all duration-200 ${color === colorOption.value ? "ring-2 ring-offset-2 ring-indigo-500" : ""}`} 
                      style={{ backgroundColor: colorOption.value }}
                    />
                    <span className="text-xs text-gray-600">{colorOption.description}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="meeting-details" className="text-gray-700">Detalhes da Reunião</Label>
              <Textarea 
                id="meeting-details" 
                value={details} 
                onChange={e => setDetails(e.target.value)} 
                placeholder="Adicione detalhes importantes sobre a reunião..." 
                className="min-h-[100px] w-full border-gray-300 focus:border-indigo-500"
              />
            </div>
          </div>
        </DialogBody>

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
              onClick={handleCreateMeeting}
              className="flex-1 bg-gradient-to-r from-indigo-500 to-blue-500"
              disabled={isCreating || !title.trim()}
            >
              {isCreating ? "Criando..." : "Criar Reunião"}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

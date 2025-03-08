import { useState, useEffect } from "react";
import { HomeHeader } from "@/components/layout/HomeHeader";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useRefresh } from "@/providers/RefreshProvider";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Edit, Calendar, Trash2, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import { InboxTaskEditModal } from "@/components/inbox/InboxTaskEditModal";

interface Task {
  id: string;
  title: string;
  details: string | null;
  color: string;
  priority: string | null;
  completed: boolean;
  type: string;
  created_at: string;
  start_time?: string | null;
  duration?: number;
}

export default function Inbox() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  
  const { toast } = useToast();
  const { refreshTasks, toggleRefreshTasks } = useRefresh();
  
  useEffect(() => {
    fetchInboxTasks();
  }, [refreshTasks]);
  
  const fetchInboxTasks = async () => {
    try {
      setIsLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error("Usuário não autenticado");
      }
      
      const { data, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', user.id)
        .eq('in_inbox', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      setTasks(data || []);
    } catch (error) {
      console.error("Erro ao buscar tarefas da Inbox:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível carregar suas tarefas da Inbox."
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditTask = (task: Task) => {
    setSelectedTask(task);
    setIsEditModalOpen(true);
  };
  
  const handleDeleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .delete()
        .eq('id', taskId);
      
      if (error) throw error;
      
      setTasks(tasks.filter(task => task.id !== taskId));
      
      toast({
        title: "Tarefa excluída",
        description: "A tarefa foi removida da sua Inbox."
      });
    } catch (error) {
      console.error("Erro ao excluir tarefa:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível excluir a tarefa."
      });
    }
  };
  
  const handleCompleteTask = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ completed: true })
        .eq('id', taskId);
      
      if (error) throw error;
      
      setTasks(tasks.map(task => 
        task.id === taskId ? { ...task, completed: true } : task
      ));
      
      toast({
        title: "Tarefa concluída",
        description: "A tarefa foi marcada como concluída."
      });
    } catch (error) {
      console.error("Erro ao concluir tarefa:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível marcar a tarefa como concluída."
      });
    }
  };
  
  const handleMoveToPlanner = async (taskId: string) => {
    try {
      const { error } = await supabase
        .from('tasks')
        .update({ 
          in_inbox: false,
          scheduled_date: format(new Date(), 'yyyy-MM-dd')
        })
        .eq('id', taskId);
      
      if (error) throw error;
      
      setTasks(tasks.filter(task => task.id !== taskId));
      
      toast({
        title: "Tarefa movida",
        description: "A tarefa foi movida para o Planner."
      });
    } catch (error) {
      console.error("Erro ao mover tarefa para o Planner:", error);
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Não foi possível mover a tarefa para o Planner."
      });
    }
  };
  
  const getPriorityColor = (priority: string | null) => {
    switch (priority) {
      case 'high': return 'text-red-500';
      case 'medium': return 'text-amber-500';
      case 'low': return 'text-green-500';
      default: return 'text-gray-500';
    }
  };
  
  const getPriorityLabel = (priority: string | null) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Normal';
    }
  };
  
  return (
    <div className="px-4 pt-16 pb-3 space-y-5 pb-safe max-w-2xl mx-auto bg-gradient-to-b from-purple-50 to-white min-h-screen">
      <HomeHeader />
      
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-800">Inbox</h1>
          <Button 
            variant="outline" 
            size="sm"
            onClick={toggleRefreshTasks}
            className="text-xs"
          >
            Atualizar
          </Button>
        </div>
        
        <p className="text-sm text-gray-600">
          Aqui estão suas tarefas rápidas e lembretes. Adicione detalhes e mova-as para o Planner quando estiver pronto.
        </p>
      </div>
      
      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
          <Skeleton className="h-20 w-full rounded-xl" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm p-8 text-center">
          <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="h-8 w-8 text-purple-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-800 mb-2">Sua Inbox está vazia</h3>
          <p className="text-sm text-gray-600 mb-4">
            Adicione tarefas rápidas e lembretes para organizar seu dia.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map(task => (
            <div 
              key={task.id} 
              className={`bg-white rounded-xl shadow-sm overflow-hidden border-l-4 ${task.completed ? 'border-green-500 opacity-70' : `border-[${task.color}]`}`}
              style={{ borderLeftColor: task.color }}
            >
              <div className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <h3 className={`text-base font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-800'}`}>
                      {task.title}
                    </h3>
                    
                    {task.details && (
                      <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                        {task.details}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-2 mt-2">
                      <span className={`text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {getPriorityLabel(task.priority)}
                      </span>
                      
                      <span className="text-xs text-gray-500">
                        Criado em {format(new Date(task.created_at), 'dd/MM/yyyy')}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-1 ml-4">
                    {!task.completed && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-purple-600 hover:bg-purple-50"
                          onClick={() => handleEditTask(task)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-green-600 hover:bg-green-50"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                    
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-8 w-8 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeleteTask(task.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {!task.completed && (
                  <div className="mt-3 flex justify-end">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="text-xs flex items-center gap-1 text-purple-600 border-purple-200 hover:bg-purple-50"
                      onClick={() => handleMoveToPlanner(task.id)}
                    >
                      <Calendar className="h-3.5 w-3.5" />
                      Mover para o Planner
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {selectedTask && (
        <InboxTaskEditModal 
          isOpen={isEditModalOpen}
          onOpenChange={setIsEditModalOpen}
          task={selectedTask}
          onSuccess={() => {
            setIsEditModalOpen(false);
            fetchInboxTasks();
          }}
        />
      )}
    </div>
  );
}

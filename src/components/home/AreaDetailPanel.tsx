
import { useState, useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription,
  SheetBody
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Check, X, AlertTriangle, ArrowRight, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AreaProgress } from "@/types/areas";
import { Button } from "@/components/ui/button";

interface AreaDetailPanelProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedArea: AreaProgress | null;
}

export function AreaDetailPanel({ isOpen, onOpenChange, selectedArea }: AreaDetailPanelProps) {
  const [completedTasks, setCompletedTasks] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isOpen && selectedArea) {
      fetchAreaTasks();
    }
  }, [isOpen, selectedArea]);

  const fetchAreaTasks = async () => {
    if (!selectedArea) return;
    
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch tasks for this area
      const { data: taskData, error: taskError } = await supabase
        .from('daily_routines')
        .select('*')
        .eq('user_id', user.id)
        .eq('category', selectedArea.areaType)
        .order('scheduled_date', { ascending: false });
        
      if (taskError) throw taskError;
      
      // Separate completed and pending tasks
      const completed = taskData?.filter(task => task.completed) || [];
      const pending = taskData?.filter(task => !task.completed) || [];
      
      setCompletedTasks(completed);
      setPendingTasks(pending);
    } catch (error) {
      console.error("Error fetching area tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!selectedArea) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 max-w-md">
        <SheetHeader className="bg-purple-600 text-white p-6 rounded-b-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-red-500 p-2.5 rounded-lg shadow-sm">
              {selectedArea.icon && <selectedArea.icon className="h-5 w-5 text-white" />}
            </div>
            <SheetTitle className="text-white text-xl">{selectedArea.area}</SheetTitle>
          </div>
          <SheetDescription className="text-white/80">{selectedArea.description}</SheetDescription>
        </SheetHeader>

        <SheetBody className="p-6">
          <div className="space-y-6">
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Progresso atual</h3>
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs text-gray-500">Completado</span>
                <span className="text-xs font-medium bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                  {selectedArea.progress}%
                </span>
              </div>
              <div className="bg-gray-200 rounded-full h-2.5 w-full">
                <div 
                  className="bg-purple-600 h-2.5 rounded-full" 
                  style={{ width: `${selectedArea.progress}%` }}
                ></div>
              </div>
            </div>

            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600"></div>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-800 flex items-center gap-2 mb-3">
                    <div className="bg-green-100 p-1.5 rounded-full">
                      <Check className="h-4 w-4 text-green-600" />
                    </div>
                    Tarefas e hábitos concluídos
                  </h3>
                  
                  {completedTasks.length > 0 ? (
                    <ul className="space-y-2.5">
                      {completedTasks.slice(0, 5).map((task) => (
                        <li key={task.id} className="flex items-start gap-3 p-2.5 border-b border-gray-100 last:border-0">
                          <div className="bg-green-100 p-1 rounded-full flex-shrink-0 mt-0.5">
                            <Check className="h-3.5 w-3.5 text-green-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                            )}
                          </div>
                        </li>
                      ))}
                      {completedTasks.length > 5 && (
                        <Button variant="ghost" size="sm" className="w-full text-purple-600 mt-1 text-xs">
                          Ver mais {completedTasks.length - 5} tarefas <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </ul>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">Nenhuma tarefa concluída recentemente.</p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-800 flex items-center gap-2 mb-3">
                    <div className="bg-red-100 p-1.5 rounded-full">
                      <X className="h-4 w-4 text-red-600" />
                    </div>
                    Tarefas pendentes
                  </h3>
                  
                  {pendingTasks.length > 0 ? (
                    <ul className="space-y-2.5">
                      {pendingTasks.slice(0, 5).map((task) => (
                        <li key={task.id} className="flex items-start gap-3 p-2.5 border-b border-gray-100 last:border-0">
                          <div className="bg-red-100 p-1 rounded-full flex-shrink-0 mt-0.5">
                            <X className="h-3.5 w-3.5 text-red-600" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-gray-800">{task.title}</p>
                            {task.description && (
                              <p className="text-xs text-gray-500 mt-0.5">{task.description}</p>
                            )}
                          </div>
                        </li>
                      ))}
                      {pendingTasks.length > 5 && (
                        <Button variant="ghost" size="sm" className="w-full text-purple-600 mt-1 text-xs">
                          Ver mais {pendingTasks.length - 5} tarefas <ChevronRight className="h-3 w-3 ml-1" />
                        </Button>
                      )}
                    </ul>
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-sm text-gray-500">Sem tarefas pendentes nesta área.</p>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-800 flex items-center gap-2 mb-3">
                    <div className="bg-amber-100 p-1.5 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-amber-600" />
                    </div>
                    Sugestões para melhorar
                  </h3>
                  
                  {pendingTasks.length > 0 ? (
                    <div className="bg-gradient-to-r from-purple-50 to-indigo-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700">
                        Para aumentar seu progresso em <strong>{selectedArea.area}</strong>:
                      </p>
                      <ul className="mt-3 space-y-2">
                        {pendingTasks.slice(0, 3).map((task) => (
                          <li key={task.id} className="flex items-center gap-2 text-sm text-gray-700">
                            <ArrowRight className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                            <span>Retomar "{task.title}"</span>
                          </li>
                        ))}
                        {selectedArea.progress < 50 && (
                          <li className="flex items-center gap-2 text-sm text-gray-700">
                            <ArrowRight className="h-3.5 w-3.5 text-purple-600 flex-shrink-0" />
                            <span>Criar novos hábitos relacionados à {selectedArea.area.toLowerCase()}</span>
                          </li>
                        )}
                      </ul>
                    </div>
                  ) : (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg">
                      <p className="text-sm text-gray-700 flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-600" />
                        Continue mantendo seus bons hábitos!
                      </p>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </SheetBody>
      </SheetContent>
    </Sheet>
  );
}

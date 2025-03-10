import { useState, useEffect } from "react";
import { 
  Sheet, 
  SheetContent, 
  SheetHeader, 
  SheetTitle, 
  SheetDescription
} from "@/components/ui/sheet";
import { Progress } from "@/components/ui/progress";
import { Check, X, AlertTriangle, ArrowRight, ChevronRight, BarChart3, Medal } from "lucide-react";
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
  const [questionnaireData, setQuestionnaireData] = useState<any | null>(null);

  useEffect(() => {
    if (isOpen && selectedArea) {
      fetchAreaTasks();
      fetchQuestionnaireData();
    }
  }, [isOpen, selectedArea]);

  const fetchAreaTasks = async () => {
    if (!selectedArea) return;
    
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Buscar tarefas de duas tabelas diferentes: tasks e daily_routines
      const [tasksResult, routinesResult] = await Promise.all([
        supabase
          .from('tasks')
          .select('*')
          .eq('user_id', user.id)
          .eq('type', selectedArea.areaType)
          .order('created_at', { ascending: false }),
        
        supabase
          .from('daily_routines')
          .select('*')
          .eq('user_id', user.id)
          .eq('category', selectedArea.areaType)
          .order('scheduled_date', { ascending: false })
      ]);
        
      // Combinar resultados de ambas as tabelas
      const combinedTasks = [
        ...(tasksResult.data || []),
        ...(routinesResult.data || [])
      ];

      // Separar tarefas concluídas e pendentes
      const completed = combinedTasks.filter(task => task.completed) || [];
      const pending = combinedTasks.filter(task => !task.completed) || [];
      
      setCompletedTasks(completed);
      setPendingTasks(pending);
    } catch (error) {
      console.error("Erro ao buscar tarefas por área:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Buscar dados do questionário para esta área
  const fetchQuestionnaireData = async () => {
    if (!selectedArea) return;
    
    try {
      console.log("Buscando dados do questionário para:", selectedArea.areaType);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from('user_questionnaire')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) {
        console.error("Erro ao buscar dados do questionário:", error);
        return;
      }

      console.log("Dados do questionário:", data);
      
      if (data?.results && data.results[selectedArea.areaType]) {
        console.log("Dados encontrados para a área:", selectedArea.areaType);
        setQuestionnaireData(data.results[selectedArea.areaType]);
      } else {
        console.log("Não foram encontrados dados para a área:", selectedArea.areaType);
        console.log("Resultados disponíveis:", data?.results ? Object.keys(data.results) : "nenhum");
      }
    } catch (error) {
      console.error("Erro ao buscar dados do questionário:", error);
    }
  };

  if (!selectedArea) return null;

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="p-0 max-w-md">
        <SheetHeader className="bg-purple-600 text-white p-6 rounded-b-xl">
          <div className="flex items-center gap-3 mb-2">
            <div className={`${selectedArea.color} p-2.5 rounded-lg shadow-sm`}>
              {selectedArea.icon && <selectedArea.icon className="h-5 w-5 text-white" />}
            </div>
            <SheetTitle className="text-white text-xl">{selectedArea.area}</SheetTitle>
          </div>
          <SheetDescription className="text-white/80">{selectedArea.description}</SheetDescription>
        </SheetHeader>

        {/* Conteúdo com scroll explícito */}
        <div className="p-6 overflow-y-auto" style={{ 
          maxHeight: 'calc(100vh - 140px)', 
          overflowY: 'auto', 
          WebkitOverflowScrolling: 'touch',
          paddingBottom: '100px' // Espaço adicional no final para garantir que tudo fique visível
        }}>
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

                {/* Exibimos essa seção mesmo sem dados de questionário, com uma mensagem default */}
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100">
                  <h3 className="text-sm font-medium text-gray-800 flex items-center gap-2 mb-3">
                    <div className="bg-blue-100 p-1.5 rounded-full">
                      <BarChart3 className="h-4 w-4 text-blue-600" />
                    </div>
                    Resultado da Avaliação
                  </h3>
                  
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Situação atual: {selectedArea.area}
                      </span>
                      <span className="text-sm font-bold bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                        {selectedArea.questionnaireScore || 0}%
                      </span>
                    </div>
                    
                    <div className="bg-white rounded-full h-2.5 w-full mb-4">
                      <div 
                        className="bg-blue-600 h-2.5 rounded-full" 
                        style={{ width: `${selectedArea.questionnaireScore || 0}%` }}
                      ></div>
                    </div>
                    
                    <div className="mt-3">
                      <p className="text-sm text-gray-700 mb-2">
                        <strong>Análise da avaliação:</strong>
                      </p>
                      
                      {selectedArea.questionnaireScore && selectedArea.questionnaireScore >= 70 ? (
                        <div className="flex items-start gap-2">
                          <Medal className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                          <p className="text-sm text-gray-700">
                            Excelente! Você está obtendo ótimos resultados nesta área da vida.
                          </p>
                        </div>
                      ) : selectedArea.questionnaireScore && selectedArea.questionnaireScore >= 40 ? (
                        <p className="text-sm text-gray-700">
                          Você está no caminho certo! Continue focando em melhorar seus hábitos 
                          nesta área para alcançar resultados ainda melhores.
                        </p>
                      ) : (
                        <p className="text-sm text-gray-700">
                          Esta área precisa de mais atenção. Considere adicionar novos hábitos
                          e atividades relacionados a {selectedArea.area.toLowerCase()} em sua rotina.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}

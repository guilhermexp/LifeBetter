
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Heart, Briefcase, Wallet, Home, Sun } from "lucide-react";
import { useAreaProgress } from "@/hooks/useAreaProgress";
import { supabase } from "@/integrations/supabase/client";
import { AreaProgress } from "@/types/areas";
import { useUser } from "@/providers/UserProvider";
import { AreaDetailPanel } from "./AreaDetailPanel";
import { motion } from "framer-motion";

export function LifeAreaCards() {
  const { areaProgress, setAreaProgress } = useAreaProgress();
  const { user } = useUser();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sliderValues, setSliderValues] = useState<Record<string, number>>({});
  const [isDetailPanelOpen, setIsDetailPanelOpen] = useState(false);
  const [selectedArea, setSelectedArea] = useState<AreaProgress | null>(null);
  
  useEffect(() => {
    console.log("LifeAreaCards recebeu areaProgress:", areaProgress);
    
    if (areaProgress && Array.isArray(areaProgress) && areaProgress.length > 0) {
      const initialValues: Record<string, number> = {};
      areaProgress.forEach(area => {
        initialValues[area.areaType] = area.questionnaireScore || 0;
      });
      setSliderValues(initialValues);
    }
  }, [areaProgress]);

  const handleCardClick = (area: AreaProgress) => {
    if (!area) {
      console.warn("Tentativa de clicar em área nula ou indefinida");
      return;
    }
    setSelectedArea(area);
    setIsDetailPanelOpen(true);
  };

  const saveAreaAssessment = async (areaType: string, value: number) => {
    try {
      setIsSubmitting(true);
      
      if (!user) {
        console.warn("Usuário não autenticado ao tentar salvar avaliação de área");
        return;
      }
      
      const { data: existingQuestionnaire, error: fetchError } = await supabase
        .from('user_questionnaire')
        .select('*')
        .eq('user_id', user.id)
        .single();
        
      if (fetchError && fetchError.code !== 'PGRST116') {
        console.error("Error fetching questionnaire:", fetchError);
        return;
      }
      
      const results = existingQuestionnaire?.results || {};
      
      results[areaType] = {
        ...results[areaType],
        overall: value,
      };
      
      if (existingQuestionnaire) {
        const { error: updateError } = await supabase
          .from('user_questionnaire')
          .update({ 
            results,
            completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingQuestionnaire.id);
          
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_questionnaire')
          .insert({
            user_id: user.id,
            results,
            completed: true
          });
          
        if (insertError) throw insertError;
      }
      
      if (areaProgress && Array.isArray(areaProgress)) {
        const updatedAreas = areaProgress.map(area => {
          if (area.areaType === areaType) {
            return {
              ...area,
              questionnaireScore: value,
            };
          }
          return area;
        });
        
        setAreaProgress(updatedAreas);
      }
      
    } catch (error) {
      console.error("Error saving area assessment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getIconComponent = (area: AreaProgress) => {
    try {
      if (!area) {
        console.warn("Área indefinida ao tentar obter ícone");
        return <Heart className="h-5 w-5" />;
      }
      
      // Verifica se o tipo de área existe antes de verificar o ícone
      if (!area.areaType) {
        console.warn("Tipo de área indefinido:", area);
        return <Heart className="h-5 w-5" />;
      }
      
      // Mapeamento direto de areaType para ícones
      switch (area.areaType) {
        case 'health':
          return <Heart className="h-5 w-5" />;
        case 'business':
          return <Briefcase className="h-5 w-5" />;
        case 'finances':
          return <Wallet className="h-5 w-5" />;
        case 'spirituality':
          return <Sun className="h-5 w-5" />;
        case 'family':
          return <Home className="h-5 w-5" />;
        default:
          console.log(`Tipo de área não reconhecido: ${area.areaType}, usando padrão Heart`);
          return <Heart className="h-5 w-5" />;
      }
    } catch (error) {
      console.error("Erro ao processar ícone:", error);
      return <Heart className="h-5 w-5" />;
    }
  };

  // Prevenção para dados inválidos de áreas com mensagem de log clara
  if (!areaProgress) {
    console.log("areaProgress é null ou undefined");
    return null;
  }
  
  if (!Array.isArray(areaProgress)) {
    console.log("areaProgress não é um array:", areaProgress);
    return null;
  }
  
  if (areaProgress.length === 0) {
    console.log("areaProgress é um array vazio");
    return (
      <div className="space-y-6">
        <div className="flex flex-col space-y-2">
          <h2 className="text-xl font-semibold text-gray-900">Acompanhamento de Áreas</h2>
          <p className="text-sm text-gray-600">
            Ainda não há áreas para acompanhar. Comece adicionando atividades.
          </p>
        </div>
      </div>
    );
  }

  console.log("Renderizando LifeAreaCards com dados:", areaProgress);

  return (
    <motion.div 
      className="space-y-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4, delay: 0.3 }}
    >
      <div className="flex flex-col space-y-2">
        <h2 className="text-xl font-bold text-gray-800">Acompanhamento de Áreas</h2>
        <p className="text-sm text-gray-600">
          Acompanhe seu progresso em cada área da vida com base nas suas atividades
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {areaProgress.map((area, index) => {
          if (!area || !area.areaType) {
            console.warn("Área inválida encontrada:", area);
            return null;
          }
          
          return (
            <motion.div
              key={area.areaType}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.1 * (index + 1) }}
            >
              <Card 
                className="overflow-hidden cursor-pointer hover:shadow-lg transition-all duration-300 border-0 shadow-md"
                onClick={() => handleCardClick(area)}
              >
                <CardHeader className={`flex flex-row items-center space-y-0 gap-3 pb-3 bg-white`}>
                  <div className={`${area.color || 'bg-purple-500'} text-white p-3 rounded-xl shadow-sm`}>
                    {getIconComponent(area)}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-base font-bold">{area.area || 'Área não identificada'}</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="pt-4 pb-5">
                  <CardDescription className="mb-5 text-sm text-gray-600">
                    {area.description || 'Sem descrição disponível'}
                  </CardDescription>
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-700">Progresso atual</span>
                      <span className="text-sm font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                        {typeof area.progress === 'number' ? area.progress : 0}%
                      </span>
                    </div>
                    
                    <Progress 
                      value={typeof area.progress === 'number' ? area.progress : 0} 
                      className="h-3 w-full rounded-full bg-purple-100"
                      indicatorClassName={area.gradient || 'bg-purple-500'}
                    />
                    
                    <div className="flex justify-between items-center text-xs text-gray-500 mt-3">
                      <span>Tarefas completadas nesta área</span>
                      <motion.span 
                        className="bg-purple-600 px-3 py-1.5 rounded-lg text-white font-medium flex items-center gap-1 shadow-sm"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Ver detalhes
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 18L15 12L9 6" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </motion.span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          );
        })}
      </div>

      <AreaDetailPanel 
        isOpen={isDetailPanelOpen}
        onOpenChange={setIsDetailPanelOpen}
        selectedArea={selectedArea}
      />
    </motion.div>
  );
}

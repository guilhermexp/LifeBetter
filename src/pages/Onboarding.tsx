import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { UserQuestionnaire } from "@/components/questionnaire/UserQuestionnaire";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/providers/UserProvider";
import { ChevronLeft, Bell, Zap, HeartPulse } from "lucide-react";

// Etapas do onboarding
const STEPS = {
  WELCOME: 0,
  QUESTIONNAIRE: 1,
  NOTIFICATIONS: 2,
  COMPLETE: 3
};

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(STEPS.WELCOME);
  const [progress, setProgress] = useState(0);
  const navigate = useNavigate();
  const { user } = useUser();
  
  useEffect(() => {
    // Calcular o progresso com base na etapa atual
    const stepProgress = ((currentStep + 1) / Object.keys(STEPS).length) * 100;
    setProgress(stepProgress);
  }, [currentStep]);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep(prev => prev + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleSkip = async () => {
    await completeOnboarding(true);
  };

  const completeOnboarding = async (skipped = false) => {
    if (!user) return;
    
    try {
      console.log("Finalizando onboarding, skipped =", skipped);
      
      // Marcar o onboarding como concluído
      const { error } = await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (error) {
        console.error("Erro ao atualizar perfil:", error);
        throw error;
      }
      
      console.log("Perfil atualizado com onboarding_completed = true");
      
      // Se pulou o questionário, marque como não concluído
      if (skipped) {
        const { error: questError } = await supabase
          .from('user_questionnaire')
          .update({
            completed: false,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
          
        if (questError) {
          console.error("Erro ao atualizar questionário:", questError);
        } else {
          console.log("Questionário marcado como não concluído");
        }
      }
      
      // Forçar um refresh completo em vez de usar o React Router
      console.log("Redirecionando para a página inicial...");
      window.location.href = '/';
    } catch (error) {
      console.error("Erro ao finalizar onboarding:", error);
      alert("Erro ao finalizar onboarding. Por favor, tente novamente.");
    }
  };

  const handleQuestionnaireComplete = async () => {
    setCurrentStep(STEPS.NOTIFICATIONS);
  };

  // Renderizar a etapa atual
  const renderStep = () => {
    switch (currentStep) {
      case STEPS.WELCOME:
        return (
          <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
            <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <HeartPulse className="h-16 w-16 text-purple-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Bem-vindo ao Lifebetter!</h1>
            <p className="text-gray-600 mb-8">
              Vamos conhecer você melhor para personalizar sua experiência e ajudá-lo a alcançar seus objetivos!
            </p>
            <Button 
              onClick={handleNext}
              className="w-full mb-4 bg-purple-600 hover:bg-purple-700 h-12"
            >
              Começar
            </Button>
          </div>
        );
        
      case STEPS.QUESTIONNAIRE:
        return (
          <div className="p-4">
            <UserQuestionnaire 
              onComplete={handleQuestionnaireComplete} 
              isFirstAccess={true} 
            />
            <div className="mt-4 text-center">
              <Button 
                onClick={() => {
                  // Forçar completar o questionário e ir para a próxima etapa
                  setCurrentStep(STEPS.NOTIFICATIONS);
                }}
                variant="outline"
                className="mx-auto"
              >
                Avançar (em caso de problemas)
              </Button>
            </div>
          </div>
        );
        
      case STEPS.NOTIFICATIONS:
        return (
          <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
            <div className="w-32 h-32 bg-purple-100 rounded-full flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 bg-indigo-900 rounded-lg flex items-center justify-center">
                  <Bell className="h-8 w-8 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 bg-cyan-300 p-1.5 rounded-lg transform rotate-12">
                  <Zap className="h-4 w-4 text-indigo-900" />
                </div>
              </div>
            </div>
            
            <h2 className="text-gray-500 font-medium mb-2">ETAPA {currentStep+1}/{Object.keys(STEPS).length}</h2>
            <h1 className="text-2xl font-bold mb-6">Ativar notificações?</h1>
            
            <div className="space-y-4 w-full">
              <div className="flex items-center space-x-3 text-left p-3 bg-purple-50 rounded-xl">
                <div className="text-purple-600 p-2 bg-white rounded-full">
                  <Zap className="h-5 w-5" />
                </div>
                <span className="text-gray-700">Lembretes semanais para hábitos saudáveis</span>
              </div>
              
              <div className="flex items-center space-x-3 text-left p-3 bg-purple-50 rounded-xl">
                <div className="text-purple-600 p-2 bg-white rounded-full">
                  <Bell className="h-5 w-5" />
                </div>
                <span className="text-gray-700">Lembretes motivacionais</span>
              </div>
              
              <div className="flex items-center space-x-3 text-left p-3 bg-purple-50 rounded-xl">
                <div className="text-purple-600 p-2 bg-white rounded-full">
                  <HeartPulse className="h-5 w-5" />
                </div>
                <span className="text-gray-700">Programa personalizado</span>
              </div>
            </div>
            
            <Button 
              onClick={handleNext}
              className="w-full mt-8 bg-purple-600 hover:bg-purple-700 h-12"
            >
              Permitir
            </Button>
          </div>
        );
        
      case STEPS.COMPLETE:
        return (
          <div className="flex flex-col items-center justify-center px-6 py-8 text-center">
            <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <Check className="h-16 w-16 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold mb-4">Tudo pronto!</h1>
            <p className="text-gray-600 mb-8">
              Você configurou seu perfil com sucesso. Vamos começar a sua jornada para uma vida melhor!
            </p>
            <Button 
              onClick={() => completeOnboarding()}
              className="w-full mb-4 bg-purple-600 hover:bg-purple-700 h-12"
            >
              Continuar para o app
            </Button>
          </div>
        );
        
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header com progresso */}
      <div className="py-4 px-6 flex items-center justify-between">
        {currentStep > 0 ? (
          <button 
            onClick={handlePrevious}
            className="p-2 rounded-full hover:bg-gray-100"
          >
            <ChevronLeft className="h-6 w-6 text-gray-600" />
          </button>
        ) : (
          <div className="w-10"></div>
        )}
        
        <div className="flex-1 mx-4">
          <Progress value={progress} className="h-2 bg-purple-100" indicatorClassName="bg-purple-600" />
        </div>
        
        {currentStep < STEPS.COMPLETE && (
          <button 
            onClick={handleSkip}
            className="text-purple-600 font-medium"
          >
            Pular
          </button>
        )}
      </div>
      
      {/* Conteúdo da etapa atual */}
      <div className="flex-1 flex flex-col">
        {renderStep()}
      </div>
    </div>
  );
}

const Check = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
  </svg>
);

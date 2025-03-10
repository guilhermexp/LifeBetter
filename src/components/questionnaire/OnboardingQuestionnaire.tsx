import { useState, useEffect } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { UserQuestionnaire } from "./UserQuestionnaire";
import { supabase } from "@/integrations/supabase/client";
import { useUser } from "@/providers/UserProvider";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

export function OnboardingQuestionnaire() {
  const [isOpen, setIsOpen] = useState(false);
  const [isFirstAccess, setIsFirstAccess] = useState(true);
  const [hasSkipped, setHasSkipped] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user is logged in and if they've completed the questionnaire before
    const checkQuestionnaire = async () => {
      if (!user) return;

      try {
        // Check if the user has already completed the questionnaire
        const { data, error } = await supabase
          .from("user_questionnaire")
          .select("completed, updated_at")
          .eq("user_id", user.id)
          .single();

        if (error) {
          if (error.code === "PGRST116") {
            // Não encontrou registro - criar um registro vazio para o novo usuário
            console.log("Criando registro inicial para novo usuário");
            const { error: insertError } = await supabase
              .from("user_questionnaire")
              .insert({
                user_id: user.id,
                completed: false,
                results: {},
                updated_at: new Date().toISOString()
              });
              
            if (insertError) {
              console.error("Error creating initial questionnaire record:", insertError);
              return;
            }
            
            // Primeiro acesso - mostrar questionário
            setIsOpen(true);
            setIsFirstAccess(true);
            return;
          } else {
            console.error("Error checking questionnaire status:", error);
            return;
          }
        }

        // If no questionnaire data or if it's time for a new assessment (30 days)
        if (!data) {
          // First time user - show questionnaire
          setIsOpen(true);
          setIsFirstAccess(true);
        } else if (data.completed) {
          // Check if it's been 30 days since the last assessment
          const lastUpdated = new Date(data.updated_at);
          const today = new Date();
          const diffTime = Math.abs(today.getTime() - lastUpdated.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          if (diffDays >= 30) {
            // Time for reassessment
            setIsOpen(true);
            setIsFirstAccess(false);
          }
        }
      } catch (error) {
        console.error("Error checking questionnaire status:", error);
      }
    };

    checkQuestionnaire();
    
    // Adicionar listener para o evento personalizado
    const handleOpenQuestionnaire = () => {
      setIsOpen(true);
    };
    
    window.addEventListener('open-questionnaire', handleOpenQuestionnaire);
    
    // Limpar listener ao desmontar
    return () => {
      window.removeEventListener('open-questionnaire', handleOpenQuestionnaire);
    };
  }, [user]);

  const handleComplete = async () => {
    try {
      if (user) {
        // Marcar o onboarding como concluído no perfil do usuário
        const { error } = await supabase
          .from('user_profiles')
          .update({
            onboarding_completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('id', user.id);
          
        if (error) {
          console.error("Erro ao atualizar status de onboarding:", error);
        }
        
        // Marcar o questionário como concluído
        const { error: questionnaireError } = await supabase
          .from('user_questionnaire')
          .update({
            completed: true,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
          
        if (questionnaireError) {
          console.error("Erro ao atualizar status do questionário:", questionnaireError);
        }
        
        console.log("Onboarding concluído com sucesso!");
      }
      
      setIsOpen(false);
      
      // Atualizar a interface sem recarregar a página
      // Isso evita loops de redirecionamento
      setTimeout(() => {
        // Forçar uma atualização das notificações
        const refreshEvent = new CustomEvent('refresh-notifications');
        window.dispatchEvent(refreshEvent);
      }, 500);
      
    } catch (error) {
      console.error("Erro ao finalizar onboarding:", error);
    }
  };

  const handleSkip = async () => {
    if (!user) return;

    try {
      // Mark as skipped in the database
      const { error: questionnaireError } = await supabase
        .from("user_questionnaire")
        .upsert({
          user_id: user.id,
          completed: false,
          results: {},
          updated_at: new Date().toISOString()
        });

      if (questionnaireError) throw questionnaireError;
      
      // Crucial: Marcar o onboarding como concluído mesmo quando o usuário pula
      const { error: profileError } = await supabase
        .from('user_profiles')
        .update({
          onboarding_completed: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;

      setIsOpen(false);
      setHasSkipped(true);
      // Forçar redirecionamento completo para resolver problemas de navegação
      window.location.href = "/"; // Redireciona para a página inicial
    } catch (error) {
      console.error("Error skipping questionnaire:", error);
    }
  };

  // For reassessment (not first access), we don't use a dialog
  if (!isFirstAccess && isOpen) {
    return (
      <div className="min-h-screen bg-white">
        <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 shadow-md">
          <h1 className="text-xl font-bold">Reavaliação de Áreas da Vida</h1>
          <p className="text-sm text-gray-600">
            É hora de verificar seu progresso! Complete este questionário para atualizar seu status.
          </p>
        </div>
        <UserQuestionnaire onComplete={handleComplete} isFirstAccess={false} />
      </div>
    );
  }

  return (
    <>
      <Dialog open={isOpen && isFirstAccess} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl p-0 overflow-hidden">
          <div className="p-4 bg-gradient-to-r from-purple-50 to-indigo-50 border-b">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold">Bem-vindo ao Lifebetter!</h2>
              {isFirstAccess && (
                <Button
                  variant="ghost"
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700"
                >
                  Pular por enquanto
                </Button>
              )}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Vamos personalizar sua experiência com base nas suas respostas.
            </p>
          </div>
          <div className="max-h-[80vh] overflow-y-auto">
            <UserQuestionnaire onComplete={handleComplete} isFirstAccess={true} />
          </div>
        </DialogContent>
      </Dialog>

      {hasSkipped && (
        <div className="fixed bottom-4 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 z-50 max-w-xs">
          <h3 className="font-semibold">Questionário pendente</h3>
          <p className="text-sm text-gray-600 mt-1">
            Complete o questionário para desbloquear recomendações personalizadas.
          </p>
          <Button
            onClick={() => setIsOpen(true)}
            className="mt-2 w-full bg-purple-600 hover:bg-purple-700"
          >
            Completar agora
          </Button>
        </div>
      )}
    </>
  );
}

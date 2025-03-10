import React, { useEffect, useState } from 'react';
import { Bell, Info, Lightbulb, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useUser } from '@/providers/UserProvider';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

export function NotificationBell() {
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasQuestionnaireNotification, setHasQuestionnaireNotification] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  // Também verificar se há sugestões pendentes que ainda não foram convertidas em notificações
  const [suggestionsCount, setSuggestionsCount] = useState(0);
  const [systemInfoCount, setSystemInfoCount] = useState(0);

  // Verificar se o usuário completou o questionário
  const checkQuestionnaireStatus = async () => {
    if (!user) return;

    try {
      // Verificar se o usuário tem um registro de questionário e se está completo
      const { data, error } = await supabase
        .from('user_questionnaire')
        .select('completed')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Erro ao verificar status do questionário:', error);
        return;
      }

      // Se não há dados ou o questionário não está completo, exibir notificação
      const questionnaireCompleted = data?.completed || false;
      setHasQuestionnaireNotification(!questionnaireCompleted);
      
      // Se o questionário não foi completado, adicionar uma notificação no sistema
      if (!questionnaireCompleted) {
        const notificationExists = notifications.some(
          n => n.type === 'system' && n.metadata?.action === 'complete_questionnaire'
        );
        
        if (!notificationExists) {
          // Adicionar notificação através do serviço
          await supabase.from('notifications').insert({
            user_id: user.id,
            title: 'Questionário pendente',
            message: 'Complete o questionário de avaliação para personalizar sua experiência',
            type: 'system',
            read: false,
            actionable: true,
            action_url: '/questionnaire',
            metadata: { action: 'complete_questionnaire' }
          });
        }
      }
    } catch (error) {
      console.error('Erro ao verificar questionário:', error);
    }
  };

  // Adicionar listener para o evento de atualização de notificações
  useEffect(() => {
    const handleRefreshNotifications = () => {
      // Recarregar o status do questionário
      checkQuestionnaireStatus();
    };
    
    window.addEventListener('refresh-notifications', handleRefreshNotifications);
    
    // Limpar listener ao desmontar
    return () => {
      window.removeEventListener('refresh-notifications', handleRefreshNotifications);
    };
  }, [user]);

  // Verificar questionário ao montar o componente
  useEffect(() => {
    checkQuestionnaireStatus();
    
    // Verificar a cada 5 minutos
    const interval = setInterval(checkQuestionnaireStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, notifications]);

  // Verificar sugestões e informações do sistema
  useEffect(() => {
    const checkForSuggestions = async () => {
      if (!user) return;
      
      try {
        // Obter contagem de sugestões não vistas
        const { count, error } = await supabase
          .from('user_suggestions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('viewed', false);
          
        if (error) throw error;
        setSuggestionsCount(count || 0);
        
        // Obter contagem de informações do sistema não vistas
        const { count: infoCount, error: infoError } = await supabase
          .from('system_info')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', user.id)
          .eq('viewed', false);
          
        if (infoError) throw infoError;
        setSystemInfoCount(infoCount || 0);
        
      } catch (err) {
        console.error("Erro ao verificar sugestões:", err);
      }
    };
    
    checkForSuggestions();
    const interval = setInterval(checkForSuggestions, 5 * 60 * 1000); // A cada 5 minutos
    return () => clearInterval(interval);
  }, [user]);

  const handleBellClick = () => {
    setShowDropdown(!showDropdown);
  };

  const handleNotificationClick = async (notification: any) => {
    // Marcar notificação como lida
    await markAsRead(notification.id);
    
    // Se for notificação de questionário, redirecionar para a página de questionário
    if (notification.metadata?.action === 'complete_questionnaire') {
      navigate('/questionnaire');
    } else if (notification.action_url) {
      navigate(notification.action_url);
    }
    
    setShowDropdown(false);
  };
  
  // Calcular contagem total de notificações
  const totalCount = hasQuestionnaireNotification ? 
    unreadCount + suggestionsCount + systemInfoCount + 1 : 
    unreadCount + suggestionsCount + systemInfoCount;

  // Função para abrir o questionário diretamente
  const openQuestionnaire = () => {
    // Disparar evento personalizado para abrir o questionário
    const event = new CustomEvent('open-questionnaire');
    window.dispatchEvent(event);
    setShowDropdown(false);
  };

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="icon"
        className="relative rounded-full"
        onClick={handleBellClick}
      >
        <Bell className="h-5 w-5" />
        {totalCount > 0 && (
          <span className="absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white">
            {totalCount}
          </span>
        )}
      </Button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-96 rounded-lg bg-white shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100 flex justify-between items-center">
            <h3 className="font-medium text-gray-800">Central de Notificações</h3>
            <div className="text-xs text-gray-500">
              {totalCount} {totalCount === 1 ? 'não lida' : 'não lidas'}
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="w-full bg-gray-50 p-0.5 rounded-none border-b border-gray-100">
              <TabsTrigger value="all" className="flex-1 px-3 py-1 text-xs data-[state=active]:shadow-none data-[state=active]:bg-white data-[state=active]:text-purple-600">
                Todas
              </TabsTrigger>
              <TabsTrigger value="alerts" className="flex-1 px-3 py-1 text-xs data-[state=active]:shadow-none data-[state=active]:bg-white data-[state=active]:text-purple-600">
                Alertas
              </TabsTrigger>
              <TabsTrigger value="suggestions" className="flex-1 px-3 py-1 text-xs data-[state=active]:shadow-none data-[state=active]:bg-white data-[state=active]:text-purple-600">
                Sugestões
              </TabsTrigger>
              <TabsTrigger value="info" className="flex-1 px-3 py-1 text-xs data-[state=active]:shadow-none data-[state=active]:bg-white data-[state=active]:text-purple-600">
                Informações
              </TabsTrigger>
            </TabsList>
          
            <div className="max-h-96 overflow-y-auto">
              {/* Notificação do questionário - sempre aparece em todas as abas se existir */}
              {hasQuestionnaireNotification && (
                <div 
                  className="p-3 border-b border-gray-100 hover:bg-purple-50 cursor-pointer flex gap-3 items-start"
                  onClick={openQuestionnaire}
                >
                  <div className="bg-purple-100 p-2 rounded-full flex-shrink-0">
                    <AlertCircle className="h-4 w-4 text-purple-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-sm text-gray-800">Questionário pendente</p>
                      <span className="text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">Importante</span>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      Complete o questionário de avaliação para personalizar sua experiência
                    </p>
                  </div>
                </div>
              )}
              
              {/* Seção de notificações */}
              {notifications.map((notification) => {
                // Determinar o ícone com base no tipo de notificação
                let icon;
                let bgColor = "bg-blue-100";
                let textColor = "text-blue-600";
                
                switch(notification.type) {
                  case 'reminder':
                    icon = <Bell className="h-4 w-4 text-amber-600" />;
                    bgColor = "bg-amber-100";
                    textColor = "text-amber-600";
                    break;
                  case 'achievement':
                    icon = <CheckCircle2 className="h-4 w-4 text-green-600" />;
                    bgColor = "bg-green-100";
                    textColor = "text-green-600";
                    break;
                  case 'suggestion':
                    icon = <Lightbulb className="h-4 w-4 text-purple-600" />;
                    bgColor = "bg-purple-100";
                    textColor = "text-purple-600";
                    break;
                  case 'system':
                  default:
                    icon = <Info className="h-4 w-4 text-blue-600" />;
                    bgColor = "bg-blue-100";
                    textColor = "text-blue-600";
                }
                
                return (
                  <div 
                    key={notification.id}
                    className={cn(
                      "p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer flex gap-3 items-start",
                      !notification.read ? 'bg-blue-50/30' : ''
                    )}
                    onClick={() => handleNotificationClick(notification)}
                  >
                    <div className={`${bgColor} p-2 rounded-full flex-shrink-0`}>
                      {icon}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-sm text-gray-800">{notification.title}</p>
                      <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                      {notification.metadata && notification.metadata.timestamp && (
                        <p className="text-xs text-gray-400 mt-2">{new Date(notification.metadata.timestamp).toLocaleDateString()}</p>
                      )}
                    </div>
                  </div>
                );
              })}
              
              {/* Mensagem de nenhuma notificação */}
              {totalCount === 0 && (
                <div className="p-6 text-center text-gray-500 text-sm">
                  <div className="mb-3">
                    <Bell className="h-8 w-8 text-gray-300 mx-auto" />
                  </div>
                  <p>Não há notificações no momento</p>
                  <p className="text-xs text-gray-400 mt-1">Confira mais tarde por novidades</p>
                </div>
              )}
            </div>
          </Tabs>
          
          <div className="p-2 border-t border-gray-100 flex justify-between items-center">
            <button className="text-xs text-gray-500 hover:text-gray-700">
              Limpar lidas
            </button>
            <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
              Ver todas as notificações
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

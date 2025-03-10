import React, { useEffect, useState } from 'react';
import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNotifications } from '@/hooks/useNotifications';
import { useUser } from '@/providers/UserProvider';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

export function NotificationBell() {
  const { unreadCount, notifications, markAsRead } = useNotifications();
  const [showDropdown, setShowDropdown] = useState(false);
  const [hasQuestionnaireNotification, setHasQuestionnaireNotification] = useState(false);
  const { user } = useUser();
  const navigate = useNavigate();

  // Verificar se o usuário completou o questionário
  useEffect(() => {
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

    checkQuestionnaireStatus();
    
    // Verificar a cada 5 minutos
    const interval = setInterval(checkQuestionnaireStatus, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, [user, notifications]);

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
  const totalCount = hasQuestionnaireNotification ? unreadCount + 1 : unreadCount;

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
        <div className="absolute right-0 mt-2 w-80 rounded-lg bg-white shadow-lg z-50 overflow-hidden">
          <div className="p-3 border-b border-gray-100">
            <h3 className="font-medium text-gray-800">Notificações</h3>
          </div>
          
          <div className="max-h-96 overflow-y-auto">
            {/* Notificação do questionário */}
            {hasQuestionnaireNotification && (
              <div 
                className="p-3 border-b border-gray-100 hover:bg-purple-50 cursor-pointer flex gap-3 items-start"
                onClick={() => navigate('/questionnaire')}
              >
                <div className="bg-purple-100 p-2 rounded-full">
                  <Bell className="h-4 w-4 text-purple-600" />
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-800">Questionário pendente</p>
                  <p className="text-xs text-gray-600 mt-1">
                    Complete o questionário de avaliação para personalizar sua experiência
                  </p>
                </div>
              </div>
            )}
            
            {/* Outras notificações */}
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div 
                  key={notification.id}
                  className={`p-3 border-b border-gray-100 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <p className="font-medium text-sm text-gray-800">{notification.title}</p>
                  <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                </div>
              ))
            ) : totalCount === 0 ? (
              <div className="p-6 text-center text-gray-500 text-sm">
                Não há notificações
              </div>
            ) : null}
          </div>
          
          {notifications.length > 0 && (
            <div className="p-2 border-t border-gray-100 text-center">
              <button className="text-xs text-purple-600 hover:text-purple-700 font-medium">
                Ver todas as notificações
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

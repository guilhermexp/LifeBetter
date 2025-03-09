import React, { useState, useCallback, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  X, 
  Clock, 
  Calendar, 
  MessageSquare,
  AlertCircle,
  Zap
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/integrations/supabase/notifications-service";

// Componente de Notificação
const NotificationItem: React.FC<{ 
  notification: Notification; 
  onMarkAsRead: (id: string) => void;
  onDelete: (id: string) => void;
}> = ({ notification, onMarkAsRead, onDelete }) => {
  // Ícone baseado no tipo de notificação
  const getIcon = () => {
    switch (notification.type) {
      case 'reminder':
        return <Clock className="h-5 w-5 text-blue-500" />;
      case 'achievement':
        return <Badge className="h-5 w-5 text-green-500" />;
      case 'system':
        return <Bell className="h-5 w-5 text-gray-500" />;
      case 'suggestion':
        return <Zap className="h-5 w-5 text-amber-500" />;
      case 'change':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  // Formatar a data/hora da notificação
  const formatTime = (dateString: string): string => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return "Agora";
    if (diffMins < 60) return `${diffMins} min atrás`;
    if (diffHours < 24) return `${diffHours} hora${diffHours > 1 ? 's' : ''} atrás`;
    if (diffDays < 7) return `${diffDays} dia${diffDays > 1 ? 's' : ''} atrás`;
    
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className={cn(
      "p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors",
      !notification.read && "bg-blue-50/50"
    )}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-1">
          {getIcon()}
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h4 className={cn(
              "text-sm font-medium",
              !notification.read ? "text-gray-900" : "text-gray-700"
            )}>
              {notification.title}
            </h4>
            <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
              {formatTime(notification.created_at)}
            </span>
          </div>
          
          <p className="text-sm text-gray-600 mt-1">
            {notification.message}
          </p>
          
          {notification.actionable && (
            <div className="flex gap-2 mt-2">
              <Button 
                variant="outline" 
                size="sm" 
                className="h-8 text-xs"
                onClick={() => onMarkAsRead(notification.id)}
              >
                {notification.type === 'reminder' ? 'Concluir' : 'OK'}
              </Button>
              
              {notification.type === 'reminder' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs text-gray-600"
                >
                  Adiar
                </Button>
              )}
            </div>
          )}
        </div>
        
        <button 
          className="text-gray-400 hover:text-gray-600 p-1"
          onClick={() => onDelete(notification.id)}
          aria-label="Excluir notificação"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

// Componente principal
export const NotificationsTab: React.FC = () => {
  const {
    notifications,
    unreadCount,
    preferences,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    toggleNotificationType,
    toggleNotificationMethod
  } = useNotifications();
  
  const [notificationTab, setNotificationTab] = useState("pending");

  // Filtragem de notificações por status
  const pendingNotifications = notifications.filter(n => !n.read);
  const historyNotifications = notifications.filter(n => n.read);

  // Renderizar o componente de carregamento
  if (loading && notifications.length === 0) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-12 bg-gray-200 rounded"></div>
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4 p-4">
              <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Renderizar mensagem de erro
  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md">
        <div className="flex items-center gap-2 text-red-700">
          <AlertCircle className="h-5 w-5" />
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Seção de Notificações */}
      <div className="space-y-4">
        <Tabs defaultValue="pending" value={notificationTab} onValueChange={setNotificationTab}>
          <div className="flex items-center justify-between mb-2">
            <TabsList className="grid grid-cols-2">
              <TabsTrigger value="pending" className="relative">
                Pendentes
                {unreadCount > 0 && (
                  <Badge className="ml-2 bg-blue-500">{unreadCount}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>
            
            <div className="flex gap-2">
              {notificationTab === "pending" && pendingNotifications.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={markAllAsRead}
                  className="h-9"
                >
                  Marcar todas como lidas
                </Button>
              )}
              
              {notificationTab === "history" && historyNotifications.length > 0 && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearReadNotifications}
                  className="h-9 text-red-500 hover:text-red-600 hover:bg-red-50"
                >
                  Limpar histórico
                </Button>
              )}
            </div>
          </div>
          
          <Card className="overflow-hidden">
            <TabsContent value="pending" className="m-0">
              {pendingNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-gray-500 font-medium">Sem notificações pendentes</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Todas as suas notificações foram lidas
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[400px]">
                  {pendingNotifications.map(notification => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification} 
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </ScrollArea>
              )}
            </TabsContent>
            
            <TabsContent value="history" className="m-0">
              {historyNotifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Clock className="h-10 w-10 text-gray-300 mx-auto mb-3" />
                  <h3 className="text-gray-500 font-medium">Histórico vazio</h3>
                  <p className="text-gray-400 text-sm mt-1">
                    Não há notificações no histórico
                  </p>
                </div>
              ) : (
                <ScrollArea className="max-h-[400px]">
                  {historyNotifications.map(notification => (
                    <NotificationItem 
                      key={notification.id} 
                      notification={notification} 
                      onMarkAsRead={markAsRead}
                      onDelete={deleteNotification}
                    />
                  ))}
                </ScrollArea>
              )}
            </TabsContent>
          </Card>
        </Tabs>
      </div>

      {/* Configurações de Notificações */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Configurações de Notificações</h3>
        
        {/* Banner de explicação */}
        <Card className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row">
            <div className="mb-4 sm:mb-0 sm:mr-4">
              <Bell className="w-10 h-10 text-gray-700" aria-hidden="true" />
            </div>
            <div>
              <p className="text-gray-600">
                Alertas lembram você de suas próximas tarefas, para que não se esqueça delas. 
                Você pode definir alertas padrão e configurá-los para tarefas individuais.
              </p>
              <Button 
                variant="link" 
                className="p-0 h-auto text-primary"
                aria-label="Ler mais sobre configurações de alertas"
              >
                Saiba mais
              </Button>
            </div>
          </div>
          
          <Button 
            className="w-full h-12 bg-gray-200 hover:bg-gray-300 text-gray-800" 
            variant="secondary" 
            onClick={() => {
              if (preferences) {
                toggleNotificationMethod('push', !preferences.push_enabled);
              }
            }}
          >
            {preferences?.push_enabled ? "Desativar Notificações" : "Permitir Notificações"}
          </Button>
        </Card>

        {/* Tipos de Notificações */}
        {preferences && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 px-1">TIPOS DE NOTIFICAÇÕES</h3>
            
            <Card className="overflow-hidden divide-y">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="text-gray-500">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="text-gray-700">Eventos e reuniões</span>
                </div>
                <Switch 
                  checked={preferences.types_config.events} 
                  onCheckedChange={(checked) => toggleNotificationType('events', checked)}
                  aria-label="Ativar notificações de eventos"
                />
              </div>
              
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="text-gray-500">
                    <Clock className="h-4 w-4" />
                  </div>
                  <span className="text-gray-700">Lembretes de tarefas</span>
                </div>
                <Switch 
                  checked={preferences.types_config.tasks} 
                  onCheckedChange={(checked) => toggleNotificationType('tasks', checked)}
                  aria-label="Ativar notificações de tarefas"
                />
              </div>
              
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="text-gray-500">
                    <Zap className="h-4 w-4" />
                  </div>
                  <span className="text-gray-700">Sugestões inteligentes</span>
                </div>
                <Switch 
                  checked={preferences.types_config.suggestions} 
                  onCheckedChange={(checked) => toggleNotificationType('suggestions', checked)}
                  aria-label="Ativar notificações de sugestões"
                />
              </div>
              
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="text-gray-500">
                    <AlertCircle className="h-4 w-4" />
                  </div>
                  <span className="text-gray-700">Mudanças na agenda</span>
                </div>
                <Switch 
                  checked={preferences.types_config.changes} 
                  onCheckedChange={(checked) => toggleNotificationType('changes', checked)}
                  aria-label="Ativar notificações de mudanças"
                />
              </div>
            </Card>
            
            <p className="text-sm text-gray-500 px-1 py-2">
              Escolha quais tipos de notificações você deseja receber.
            </p>
          </div>
        )}

        {/* Métodos de Notificação */}
        {preferences && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-gray-500 px-1">MÉTODOS DE NOTIFICAÇÃO</h3>
            
            <Card className="overflow-hidden divide-y">
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Bell className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">Notificações Push</span>
                </div>
                <Switch 
                  checked={preferences.push_enabled} 
                  onCheckedChange={(checked) => toggleNotificationMethod('push', checked)}
                  aria-label="Ativar notificações push"
                />
              </div>
              
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">E-mail</span>
                </div>
                <Switch 
                  checked={preferences.email_enabled} 
                  onCheckedChange={(checked) => toggleNotificationMethod('email', checked)}
                  aria-label="Ativar notificações por e-mail"
                />
              </div>
              
              <div className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">SMS (em breve)</span>
                </div>
                <Switch 
                  checked={preferences.sms_enabled} 
                  onCheckedChange={(checked) => toggleNotificationMethod('sms', checked)}
                  disabled={true}
                  aria-label="Ativar notificações por SMS"
                />
              </div>
            </Card>
            
            <p className="text-sm text-gray-500 px-1 py-2">
              Escolha como deseja receber suas notificações.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationsTab;

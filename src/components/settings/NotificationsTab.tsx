import React, { useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { 
  Bell, 
  Volume2, 
  X, 
  ChevronRight, 
  Calendar, 
  ListTodo, 
  Settings as SettingsIcon, 
  HelpCircle, 
  FileText,
  Clock,
  Filter,
  AlertTriangle,
  MessageSquare,
  Zap,
  Calendar as CalendarIcon
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

// Definição de interfaces
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'reminder' | 'achievement' | 'system' | 'suggestion' | 'change';
  actionable?: boolean;
}

interface Alert {
  id: string;
  title: string;
  enabled: boolean;
  category?: string;
}

interface NotificationMethod {
  id: string;
  name: string;
  enabled: boolean;
}

interface NotificationType {
  id: string;
  name: string;
  icon: React.ReactNode;
  enabled: boolean;
}

// Dados de exemplo para notificações
const mockNotifications: Notification[] = [
  {
    id: "1",
    title: "Lembrete de Tarefa",
    message: "Reunião com equipe em 30 minutos",
    time: "Agora",
    read: false,
    type: "reminder",
    actionable: true
  }, 
  {
    id: "2",
    title: "Compromisso Próximo",
    message: "Você tem um evento amanhã: Workshop de Produtividade",
    time: "10 min atrás",
    read: false,
    type: "reminder",
    actionable: true
  },
  {
    id: "3",
    title: "Mudança na Agenda",
    message: "A reunião de amanhã foi reagendada para sexta-feira",
    time: "30 min atrás",
    read: false,
    type: "change",
    actionable: true
  },
  {
    id: "4",
    title: "Sugestão Inteligente",
    message: "Você sempre adia a academia na segunda. Quer mudar o horário?",
    time: "1 hora atrás",
    read: true,
    type: "suggestion"
  },
  {
    id: "5",
    title: "Meta Concluída",
    message: "Parabéns! Você atingiu sua meta de 'Ler 30 minutos por dia'",
    time: "Ontem, 18:45",
    read: true,
    type: "achievement"
  },
  {
    id: "6",
    title: "Atualização do Sistema",
    message: "Novas funcionalidades foram adicionadas ao aplicativo",
    time: "25/06/2023",
    read: true,
    type: "system"
  }
];

// Alertas padrão
const defaultAlerts: Alert[] = [
  {
    id: "1",
    title: "No início de tarefas",
    enabled: true
  }, 
  {
    id: "2",
    title: "Ao final de tarefas",
    enabled: true
  }, 
  {
    id: "3",
    title: "5min antes do início",
    enabled: true
  }, 
  {
    id: "4",
    title: "Às 08:00 no dia da tarefa",
    enabled: true,
    category: "allday"
  }
];

// Métodos de notificação
const notificationMethods: NotificationMethod[] = [
  {
    id: "push",
    name: "Notificações Push",
    enabled: true
  },
  {
    id: "email",
    name: "E-mail",
    enabled: false
  },
  {
    id: "sms",
    name: "SMS (em breve)",
    enabled: false
  }
];

// Tipos de notificação
const notificationTypes: NotificationType[] = [
  {
    id: "events",
    name: "Eventos e reuniões",
    icon: <CalendarIcon className="h-4 w-4" />,
    enabled: true
  },
  {
    id: "tasks",
    name: "Lembretes de tarefas",
    icon: <Clock className="h-4 w-4" />,
    enabled: true
  },
  {
    id: "suggestions",
    name: "Sugestões inteligentes",
    icon: <Zap className="h-4 w-4" />,
    enabled: true
  },
  {
    id: "changes",
    name: "Mudanças na agenda",
    icon: <AlertTriangle className="h-4 w-4" />,
    enabled: true
  }
];

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
        return <SettingsIcon className="h-5 w-5 text-gray-500" />;
      case 'suggestion':
        return <Zap className="h-5 w-5 text-amber-500" />;
      case 'change':
        return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
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
              {notification.time}
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
              
              {notification.type === 'change' && (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-8 text-xs text-gray-600"
                >
                  Ver detalhes
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

// Add loading skeleton
const NotificationsSkeleton = () => (
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

// Componente principal
export const NotificationsTab: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [alerts, setAlerts] = useState<Alert[]>(defaultAlerts);
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState(true);
  const [taskReminders, setTaskReminders] = useState(false);
  const [useOnlyContent, setUseOnlyContent] = useState(false);
  const [notificationTab, setNotificationTab] = useState("pending");
  const [methods, setMethods] = useState<NotificationMethod[]>(notificationMethods);
  const [types, setTypes] = useState<NotificationType[]>(notificationTypes);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Add error component
  const ErrorMessage = ({ message }: { message: string }) => (
    <div className="p-4 bg-red-50 border border-red-200 rounded-md">
      <div className="flex items-center gap-2 text-red-700">
        <AlertTriangle className="h-5 w-5" />
        <p>{message}</p>
      </div>
    </div>
  );

  // Contagem de notificações não lidas
  const unreadCount = useMemo(() => 
    notifications.filter(n => !n.read).length
  , [notifications]);
  
  // Filtragem dos alertas por categoria
  const standardAlerts = useMemo(() => 
    alerts.filter(a => !a.category)
  , [alerts]);
  
  const allDayAlerts = useMemo(() => 
    alerts.filter(a => a.category === 'allday')
  , [alerts]);

  // Filtragem de notificações por status
  const pendingNotifications = useMemo(() => 
    notifications.filter(n => !n.read)
  , [notifications]);
  
  const historyNotifications = useMemo(() => 
    notifications.filter(n => n.read)
  , [notifications]);

  // Funções de manipulação de notificações
  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(notif => 
      notif.id === id ? { ...notif, read: true } : notif
    ));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(notif => ({
      ...notif,
      read: true
    })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Funções de manipulação de alertas
  const toggleAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === id ? {
        ...alert,
        enabled: !alert.enabled
      } : alert
    ));
  }, []);

  const addNewAlert = useCallback((category?: string) => {
    // TODO: Implementar adição de novos alertas
    console.log("Adicionar novo alerta", category);
    // Aqui seria implementada a lógica para abrir um modal ou formulário
  }, []);

  // Funções de manipulação de métodos de notificação
  const toggleMethod = useCallback((id: string) => {
    setMethods(prev => prev.map(method => 
      method.id === id ? {
        ...method,
        enabled: !method.enabled
      } : method
    ));
  }, []);

  // Funções de manipulação de tipos de notificação
  const toggleType = useCallback((id: string) => {
    setTypes(prev => prev.map(type => 
      type.id === id ? {
        ...type,
        enabled: !type.enabled
      } : type
    ));
  }, []);

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
              {notificationTab === "pending" && unreadCount > 0 && (
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
                  onClick={clearAllNotifications}
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
            onClick={() => setAllowNotifications(!allowNotifications)}
          >
            {allowNotifications ? "Desativar Notificações" : "Permitir Notificações"}
          </Button>
        </Card>

        {/* Tipos de Notificações */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 px-1">TIPOS DE NOTIFICAÇÕES</h3>
          
          <Card className="overflow-hidden divide-y">
            {types.map(type => (
              <div key={type.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <div className="text-gray-500">
                    {type.icon}
                  </div>
                  <span className="text-gray-700">{type.name}</span>
                </div>
                <Switch 
                  checked={type.enabled} 
                  onCheckedChange={() => toggleType(type.id)}
                  aria-label={`Ativar ${type.name}`}
                />
              </div>
            ))}
          </Card>
          
          <p className="text-sm text-gray-500 px-1 py-2">
            Escolha quais tipos de notificações você deseja receber.
          </p>
        </div>

        {/* Métodos de Notificação */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 px-1">MÉTODOS DE NOTIFICAÇÃO</h3>
          
          <Card className="overflow-hidden divide-y">
            {methods.map(method => (
              <div key={method.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  {method.id === 'push' && <Bell className="w-5 h-5 text-gray-500" />}
                  {method.id === 'email' && <MessageSquare className="w-5 h-5 text-gray-500" />}
                  {method.id === 'sms' && <MessageSquare className="w-5 h-5 text-gray-500" />}
                  <span className="text-gray-700">{method.name}</span>
                </div>
                <Switch 
                  checked={method.enabled} 
                  onCheckedChange={() => toggleMethod(method.id)}
                  disabled={method.id === 'sms'}
                  aria-label={`Ativar ${method.name}`}
                />
              </div>
            ))}
          </Card>
          
          <p className="text-sm text-gray-500 px-1 py-2">
            Escolha como deseja receber suas notificações.
          </p>
        </div>

        {/* Alertas padrão */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 px-1">ALERTAS PADRÃO</h3>
          
          <Card className="overflow-hidden divide-y">
            {standardAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Clock className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">{alert.title}</span>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-600" 
                  onClick={() => toggleAlert(alert.id)}
                  aria-label={`Remover alerta ${alert.title}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            
            <div className="p-4">
              <Button 
                variant="ghost" 
                className="w-full text-gray-500 hover:text-gray-700" 
                onClick={() => addNewAlert()}
              >
                Adicionar novo alerta
              </Button>
            </div>
          </Card>
          
          <p className="text-sm text-gray-500 px-1 py-2">
            Escolha os alertas padrão de tarefas criadas no aplicativo. 
            Você também pode configurá-los separadamente em cada tarefa.
          </p>
        </div>

        {/* Tarefas de dia inteiro */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 px-1">TAREFAS DE DIA INTEIRO</h3>
          
          <Card className="overflow-hidden divide-y">
            {allDayAlerts.map(alert => (
              <div key={alert.id} className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <span className="text-gray-700">{alert.title}</span>
                </div>
                <button 
                  className="text-gray-400 hover:text-gray-600" 
                  onClick={() => toggleAlert(alert.id)}
                  aria-label={`Remover alerta ${alert.title}`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ))}
            
            <div className="p-4">
              <Button 
                variant="ghost" 
                className="w-full text-gray-500 hover:text-gray-700" 
                onClick={() => addNewAlert('allday')}
              >
                Adicionar novo alerta
              </Button>
            </div>
          </Card>
          
          <p className="text-sm text-gray-500 px-1 py-2">
            Escolha quando ser notificado sobre as tarefas de dia inteiro.
          </p>
        </div>

        {/* Tarefas Importadas */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 px-1">TAREFAS IMPORTADAS</h3>
          
          <Card className="overflow-hidden divide-y">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <Calendar className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Eventos do Calendário</span>
              </div>
              <Switch 
                checked={calendarEvents} 
                onCheckedChange={setCalendarEvents}
                aria-label="Ativar notificações de eventos do calendário"
              />
            </div>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <ListTodo className="w-5 h-5 text-gray-500" />
                <span className="text-gray-700">Lembretes de Tarefas</span>
              </div>
              <Switch 
                checked={taskReminders} 
                onCheckedChange={setTaskReminders}
                aria-label="Ativar notificações de lembretes de tarefas"
              />
            </div>
          </Card>
          
          <p className="text-sm text-gray-500 px-1 py-2">
            Ative para receber alertas de tarefas importadas dos apps Calendário ou Lembretes. 
            Outros apps talvez já notifiquem essas tarefas.
          </p>
        </div>

        {/* Avançado */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 px-1">AVANÇADO</h3>
          
          <Card className="overflow-hidden divide-y">
            <button 
              className="w-full text-left flex items-center justify-between p-4" 
              aria-label="Abrir ajustes do sistema"
            >
              <div className="flex items-center gap-3">
                <SettingsIcon className="w-5 h-5 text-gray-500" aria-hidden="true" />
                <span className="text-gray-700">Abrir Ajustes do Sistema</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </button>
            
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-3">
                <FileText className="w-5 h-5 text-gray-500" aria-hidden="true" />
                <span className="text-gray-700">Usar apenas o conteúdo da notificação</span>
              </div>
              <Switch 
                checked={useOnlyContent} 
                onCheckedChange={setUseOnlyContent}
                aria-label="Usar apenas conteúdo da notificação"
              />
            </div>
          </Card>
          
          <p className="text-sm text-gray-500 px-1 py-2">
            Isto pode ajudar caso alguns acessórios não mostrarem o título da notificação.
          </p>
        </div>

        {/* Resolução de problemas */}
        <div className="space-y-2">
          <h3 className="text-sm font-medium text-gray-500 px-1">RESOLUÇÃO DE PROBLEMAS</h3>
          
          <Card className="overflow-hidden">
            <button 
              className="w-full text-left flex items-center justify-between p-4"
              aria-label="Ver notificações agendadas"
            >
              <div className="flex items-center gap-3">
                <HelpCircle className="w-5 h-5 text-gray-500" aria-hidden="true" />
                <span className="text-gray-700">Notificações Agendadas</span>
              </div>
              <ChevronRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
            </button>
          </Card>
          
          <p className="text-sm text-gray-500 px-1 py-2">
            Se você estiver com problemas com as notificações, consulte a <button className="text-gray-700">Central de Ajuda</button> para obter dicas de resolução.
          </p>
        </div>
      </div>
    </div>
  );
};

export default NotificationsTab;

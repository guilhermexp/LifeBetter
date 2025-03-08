
import { useState, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bell, Moon, Sun, Volume2, ArrowLeft, Trash2, Check, Clock, X, ChevronRight, Calendar, ListTodo, Settings as SettingsIcon, HelpCircle, FileText } from "lucide-react";
import { CalendarIntegration } from "@/components/features/CalendarIntegration";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { InteractionsTab } from "@/components/settings/InteractionsTab";

// Definição de interfaces
interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: string;
}

interface Alert {
  id: string;
  title: string;
  enabled: boolean;
  category?: string;
}

// Dados de exemplo para notificações
const mockNotifications: Notification[] = [{
  id: "1",
  title: "Lembrete de Tarefa",
  message: "Você tem 3 tarefas para completar hoje",
  time: "Hoje, 08:30",
  read: false,
  type: "reminder"
}, {
  id: "2",
  title: "Meta Concluída",
  message: "Parabéns! Você atingiu sua meta de 'Ler 30 minutos por dia'",
  time: "Ontem, 18:45",
  read: true,
  type: "achievement"
}, {
  id: "3",
  title: "Atualização do Sistema",
  message: "Novas funcionalidades foram adicionadas ao aplicativo",
  time: "25/06/2023",
  read: true,
  type: "system"
}];

// Alertas padrão
const defaultAlerts: Alert[] = [{
  id: "1",
  title: "No início de tarefas",
  enabled: true
}, {
  id: "2",
  title: "Ao final de tarefas",
  enabled: true
}, {
  id: "3",
  title: "5min antes do início",
  enabled: true
}, {
  id: "4",
  title: "Às 08:00 no dia da tarefa",
  enabled: true,
  category: "allday"
}];

const Settings = () => {
  // Get tab from URL or default to "geral"
  const getDefaultTab = useCallback(() => {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('tab') || "geral";
  }, []);

  const [activeTab, setActiveTab] = useState(getDefaultTab());
  const [notifications, setNotifications] = useState<Notification[]>(mockNotifications);
  const [alerts, setAlerts] = useState<Alert[]>(defaultAlerts);
  const [allowNotifications, setAllowNotifications] = useState(true);
  const [calendarEvents, setCalendarEvents] = useState(true);
  const [taskReminders, setTaskReminders] = useState(false);
  const [useOnlyContent, setUseOnlyContent] = useState(false);
  const navigate = useNavigate();

  // Update URL when tab changes
  const handleTabChange = useCallback((value: string) => {
    setActiveTab(value);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('tab', value);
    window.history.replaceState({}, document.title, newUrl.toString());
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prevNotifications => prevNotifications.map(notif => ({
      ...notif,
      read: true
    })));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const toggleAlert = useCallback((id: string) => {
    setAlerts(prevAlerts => prevAlerts.map(alert => 
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-white to-accent/20">
      <div className="container mx-auto px-3 py-4 md:px-4 md:py-6 space-y-4 md:space-y-6">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={() => navigate(-1)} 
              className="h-9 w-9"
              aria-label="Voltar"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900">
              {activeTab === "notificacoes" ? "Notificações e Alertas" : 
               activeTab === "interacoes" ? "Integrações Externas" : 
               "Configurações"}
            </h1>
          </div>
        </div>

        <Tabs defaultValue={getDefaultTab()} value={activeTab} onValueChange={handleTabChange} className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="geral">Geral</TabsTrigger>
            <TabsTrigger value="notificacoes" className="relative">
              Notificações
              {unreadCount > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 bg-red-500" aria-label={`${unreadCount} notificações não lidas`}>
                  {unreadCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="interacoes">
              Integrações
            </TabsTrigger>
          </TabsList>

          <TabsContent value="geral" className="space-y-4 md:space-y-6">
            <CalendarIntegration />
          </TabsContent>

          <TabsContent value="notificacoes" className="space-y-4">
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

            {/* Sons e Nudge */}
            <Card className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-5 h-5 text-gray-400" aria-hidden="true" />
                  <span className="text-gray-600 font-medium">Sons</span>
                </div>
                <button 
                  className="flex items-center"
                  aria-label="Configurações de nudge"
                >
                  <span className="text-gray-400 mr-2">Nudge</span>
                  <ChevronRight className="w-5 h-5 text-gray-400" aria-hidden="true" />
                </button>
              </div>
            </Card>

            {/* Alertas padrão */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 px-1">ALERTAS PADRÃO</h3>
              
              <Card className="overflow-hidden divide-y">
                {alerts.filter(a => !a.category).map(alert => <div key={alert.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">{alert.title}</span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600" onClick={() => toggleAlert(alert.id)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>)}
                
                <div className="p-4">
                  <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-700" onClick={() => addNewAlert()}>
                    Adicionar novo alerta
                  </Button>
                </div>
              </Card>
              
              <p className="text-sm text-gray-500 px-1 py-2">
                Escolha os alertas padrão de tarefas criadas no Structured. 
                Você também pode configurá-los separadamente em cada tarefa.
              </p>
            </div>

            {/* Tarefas de dia inteiro */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-500 px-1">TAREFAS DE DIA INTEIRO</h3>
              
              <Card className="overflow-hidden divide-y">
                {alerts.filter(a => a.category === 'allday').map(alert => <div key={alert.id} className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <Bell className="w-5 h-5 text-gray-500" />
                      <span className="text-gray-700">{alert.title}</span>
                    </div>
                    <button className="text-gray-400 hover:text-gray-600" onClick={() => toggleAlert(alert.id)}>
                      <X className="w-5 h-5" />
                    </button>
                  </div>)}
                
                <div className="p-4">
                  <Button variant="ghost" className="w-full text-gray-500 hover:text-gray-700" onClick={() => addNewAlert('allday')}>
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
                  <Switch checked={calendarEvents} onCheckedChange={setCalendarEvents} />
                </div>
                
                <div className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <ListTodo className="w-5 h-5 text-gray-500" />
                    <span className="text-gray-700">Lembretes de Tarefas</span>
                  </div>
                  <Switch checked={taskReminders} onCheckedChange={setTaskReminders} />
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
                <button className="w-full text-left flex items-center justify-between p-4" aria-label="Abrir ajustes do sistema">
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
          </TabsContent>

          <TabsContent value="interacoes" className="space-y-4">
            <InteractionsTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Settings;

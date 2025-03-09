
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
import NotificationsTab from "@/components/settings/NotificationsTab";

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
            <NotificationsTab />
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

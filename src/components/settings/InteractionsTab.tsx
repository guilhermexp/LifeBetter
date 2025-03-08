
import { useState, useEffect, useCallback, useMemo } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { Calendar, ArrowUpRight, Check, X, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { 
  initiateGoogleAuth, 
  checkGoogleCalendarConnection, 
  disconnectGoogleCalendar,
  getGoogleCalendarPreferences,
  saveGoogleCalendarPreferences
} from "@/lib/googleCalendarClient";

// Definição de interfaces
interface CalendarPreferences {
  import_meetings: boolean;
  import_personal: boolean;
  import_all: boolean;
}

interface InteractionsTabProps {
  // Se precisar adicionar props no futuro
}

export function InteractionsTab({}: InteractionsTabProps) {
  // Estados
  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [preferences, setPreferences] = useState<CalendarPreferences>({
    import_meetings: true,
    import_personal: true,
    import_all: true
  });
  const [isAuthSuccess, setIsAuthSuccess] = useState(false);
  const { toast } = useToast();

  // Verificar parâmetros de URL para sucesso de autenticação
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const hasAuthSuccess = urlParams.has('google-auth') && urlParams.get('google-auth') === 'success';
    
    if (hasAuthSuccess) {
      setIsAuthSuccess(true);
      
      // Limpar parâmetros da URL
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('google-auth');
      window.history.replaceState({}, document.title, newUrl.toString());
      
      // Notificar usuário
      toast({
        title: "Autenticação realizada com sucesso!",
        description: "Sua conta do Google Calendar foi conectada.",
        variant: "default"
      });
    }
  }, [toast]);

  // Função para exibir mensagens de erro
  const showError = useCallback((message: string) => {
    toast({
      title: "Erro",
      description: message,
      variant: "destructive"
    });
  }, [toast]);

  // Carregar status de conexão e preferências do calendário
  const loadCalendarStatus = useCallback(async () => {
    try {
      setIsLoading(true);
      const { connected } = await checkGoogleCalendarConnection();
      setIsGoogleConnected(connected);
      
      if (connected) {
        const prefs = await getGoogleCalendarPreferences();
        setPreferences({
          import_meetings: prefs.import_meetings,
          import_personal: prefs.import_personal,
          import_all: prefs.import_all
        });
      }
    } catch (error) {
      console.error("Error checking Google Calendar connection:", error);
      showError("Falha ao verificar a conexão com o Google Calendar.");
    } finally {
      setIsLoading(false);
    }
  }, [showError]);

  // Verificar conexão quando o componente monta ou quando a autenticação muda
  useEffect(() => {
    loadCalendarStatus();
  }, [loadCalendarStatus, isAuthSuccess]);

  // Iniciar processo de conexão com Google Calendar
  const handleGoogleConnect = useCallback(async () => {
    try {
      setIsLoading(true);
      await initiateGoogleAuth();
      // Não define isLoading como false aqui porque a página será redirecionada
    } catch (error) {
      console.error("Error connecting to Google Calendar:", error);
      showError("Falha ao iniciar o processo de autenticação com o Google.");
      setIsLoading(false);
    }
  }, [showError]);

  // Desconectar do Google Calendar
  const handleGoogleDisconnect = useCallback(async () => {
    try {
      setIsLoading(true);
      await disconnectGoogleCalendar();
      setIsGoogleConnected(false);
      toast({
        title: "Desconectado",
        description: "Sua conta do Google Calendar foi desconectada.",
      });
    } catch (error) {
      console.error("Error disconnecting Google Calendar:", error);
      showError("Falha ao desconectar do Google Calendar.");
    } finally {
      setIsLoading(false);
    }
  }, [toast, showError]);

  // Alterar preferências do calendário
  const handlePreferenceChange = useCallback(async (key: keyof CalendarPreferences, value: boolean) => {
    try {
      const newPreferences = { ...preferences, [key]: value };
      setPreferences(newPreferences);
      await saveGoogleCalendarPreferences(newPreferences);
    } catch (error) {
      console.error("Error saving preferences:", error);
      showError("Falha ao salvar as preferências.");
      // Reverter para o valor anterior em caso de erro
      setPreferences(preferences);
    }
  }, [preferences, showError]);

  // Determinar se deve mostrar opções detalhadas
  const showDetailedOptions = useMemo(() => 
    isGoogleConnected && !preferences.import_all
  , [isGoogleConnected, preferences.import_all]);

  return (
    <div className="space-y-6">
      {isAuthSuccess && (
        <Alert variant="default" className="mb-4 bg-green-50 border-green-200">
          <Check className="h-4 w-4 text-green-600" aria-hidden="true" />
          <AlertTitle className="text-green-700">Conexão estabelecida!</AlertTitle>
          <AlertDescription className="text-green-600">
            Sua conta do Google Calendar foi conectada com sucesso.
          </AlertDescription>
        </Alert>
      )}

      <Card className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-blue-600" aria-hidden="true" />
            <h3 className="text-lg font-medium">Google Calendar</h3>
          </div>
          
          {isGoogleConnected ? (
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-600 flex items-center gap-1">
                <Check className="h-4 w-4" aria-hidden="true" />
                Conectado
              </span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleGoogleDisconnect} 
                disabled={isLoading}
                aria-label="Desconectar do Google Calendar"
              >
                Desconectar
              </Button>
            </div>
          ) : (
            <Button 
              onClick={handleGoogleConnect} 
              disabled={isLoading}
              className="bg-blue-600 hover:bg-blue-700"
              data-testid="connect-google-button"
              aria-label="Conectar ao Google Calendar"
            >
              <Calendar className="mr-2 h-4 w-4" aria-hidden="true" />
              {isLoading ? "Conectando..." : "Conectar ao Google Calendar"}
            </Button>
          )}
        </div>

        <p className="text-gray-600">
          Conecte sua conta do Google Calendar para importar eventos automaticamente para o Planner.
        </p>

        {isGoogleConnected && (
          <>
            <Separator className="my-4" />
            
            <div className="space-y-4">
              <h4 className="font-medium">Configurações de Importação</h4>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="import_all">Importar todos os eventos</Label>
                  <p className="text-sm text-gray-500">
                    Importar automaticamente todos os eventos do Google Calendar
                  </p>
                </div>
                <Switch
                  id="import_all"
                  checked={preferences.import_all}
                  onCheckedChange={(value) => handlePreferenceChange('import_all', value)}
                  aria-label="Importar todos os eventos"
                  disabled={isLoading}
                />
              </div>
              
              {showDetailedOptions && (
                <>
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="import_meetings">Apenas reuniões</Label>
                      <p className="text-sm text-gray-500">
                        Importar apenas eventos que são reuniões
                      </p>
                    </div>
                    <Switch
                      id="import_meetings"
                      checked={preferences.import_meetings}
                      onCheckedChange={(value) => handlePreferenceChange('import_meetings', value)}
                      aria-label="Importar apenas reuniões"
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label htmlFor="import_personal">Eventos pessoais</Label>
                      <p className="text-sm text-gray-500">
                        Importar eventos pessoais (não reuniões)
                      </p>
                    </div>
                    <Switch
                      id="import_personal"
                      checked={preferences.import_personal}
                      onCheckedChange={(value) => handlePreferenceChange('import_personal', value)}
                      aria-label="Importar eventos pessoais"
                      disabled={isLoading}
                    />
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </Card>

      <Card className="p-6 bg-gray-50">
        <h3 className="text-lg font-medium mb-3">Próximas Integrações</h3>
        <p className="text-gray-600 mb-4">
          Estamos trabalhando para adicionar mais integrações para melhorar sua experiência.
          Aguarde por novas opções em breve!
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Button 
            variant="outline" 
            disabled 
            className="flex items-center justify-center gap-2 opacity-60"
            aria-label="Outlook Calendar (em breve)"
          >
            Outlook Calendar
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Button>
          <Button 
            variant="outline" 
            disabled 
            className="flex items-center justify-center gap-2 opacity-60"
            aria-label="Apple Calendar (em breve)"
          >
            Apple Calendar
            <ArrowUpRight className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </Card>
    </div>
  );
}

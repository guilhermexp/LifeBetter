import { useState, useEffect, useCallback } from 'react';
import { useUser } from '@/providers/UserProvider';
import { NotificationsService, Notification, NotificationPreferences } from '@/integrations/supabase/notifications-service';
import { useToast } from '@/hooks/use-toast';

export function useNotifications() {
  const { user } = useUser();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Carregar notificações
  const loadNotifications = useCallback(async (options?: {
    read?: boolean;
    limit?: number;
    offset?: number;
    type?: string;
  }) => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const { notifications: fetchedNotifications, count } = await NotificationsService.getNotifications(
        user.id,
        options
      );
      
      setNotifications(fetchedNotifications);
      
      // Atualizar contagem de não lidas se não estiver filtrando
      if (options?.read === undefined) {
        const unreadNotifications = fetchedNotifications.filter(n => !n.read);
        setUnreadCount(unreadNotifications.length);
      }
    } catch (err) {
      console.error('Erro ao carregar notificações:', err);
      setError('Falha ao carregar notificações. Tente novamente mais tarde.');
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar suas notificações.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Carregar preferências de notificação
  const loadPreferences = useCallback(async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const prefs = await NotificationsService.getNotificationPreferences(user.id);
      setPreferences(prefs);
    } catch (err) {
      console.error('Erro ao carregar preferências de notificação:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível carregar suas preferências de notificação.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  // Marcar notificação como lida
  const markAsRead = useCallback(async (id: string) => {
    try {
      const success = await NotificationsService.markAsRead(id);
      
      if (success) {
        setNotifications(prev => prev.map(notif => 
          notif.id === id ? { ...notif, read: true } : notif
        ));
        
        // Atualizar contagem de não lidas
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      return success;
    } catch (err) {
      console.error('Erro ao marcar notificação como lida:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar a notificação como lida.',
        variant: 'destructive',
      });
      return false;
    }
  }, [toast]);

  // Marcar todas as notificações como lidas
  const markAllAsRead = useCallback(async () => {
    if (!user?.id) return false;
    
    try {
      const success = await NotificationsService.markAllAsRead(user.id);
      
      if (success) {
        setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
        setUnreadCount(0);
        
        toast({
          title: 'Sucesso',
          description: 'Todas as notificações foram marcadas como lidas.',
        });
      }
      
      return success;
    } catch (err) {
      console.error('Erro ao marcar todas as notificações como lidas:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível marcar todas as notificações como lidas.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast]);

  // Excluir uma notificação
  const deleteNotification = useCallback(async (id: string) => {
    try {
      const success = await NotificationsService.deleteNotification(id);
      
      if (success) {
        const deletedNotification = notifications.find(n => n.id === id);
        setNotifications(prev => prev.filter(notif => notif.id !== id));
        
        // Atualizar contagem de não lidas se a notificação excluída não estava lida
        if (deletedNotification && !deletedNotification.read) {
          setUnreadCount(prev => Math.max(0, prev - 1));
        }
      }
      
      return success;
    } catch (err) {
      console.error('Erro ao excluir notificação:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a notificação.',
        variant: 'destructive',
      });
      return false;
    }
  }, [notifications, toast]);

  // Limpar todas as notificações lidas
  const clearReadNotifications = useCallback(async () => {
    if (!user?.id) return false;
    
    try {
      const success = await NotificationsService.clearReadNotifications(user.id);
      
      if (success) {
        setNotifications(prev => prev.filter(notif => !notif.read));
        
        toast({
          title: 'Sucesso',
          description: 'Todas as notificações lidas foram removidas.',
        });
      }
      
      return success;
    } catch (err) {
      console.error('Erro ao limpar notificações lidas:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível limpar as notificações lidas.',
        variant: 'destructive',
      });
      return false;
    }
  }, [user, toast]);

  // Atualizar preferências de notificação
  const updatePreferences = useCallback(async (updates: Partial<NotificationPreferences>) => {
    if (!user?.id || !preferences) return null;
    
    try {
      const updatedPreferences = await NotificationsService.updateNotificationPreferences(
        user.id,
        updates
      );
      
      if (updatedPreferences) {
        setPreferences(updatedPreferences);
        
        toast({
          title: 'Preferências atualizadas',
          description: 'Suas preferências de notificação foram atualizadas com sucesso.',
        });
      }
      
      return updatedPreferences;
    } catch (err) {
      console.error('Erro ao atualizar preferências de notificação:', err);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar suas preferências de notificação.',
        variant: 'destructive',
      });
      return null;
    }
  }, [user, preferences, toast]);

  // Alternar tipo de notificação
  const toggleNotificationType = useCallback(async (typeId: string, enabled: boolean) => {
    if (!preferences) return false;
    
    const typesConfig = { ...preferences.types_config };
    
    // Atualizar o tipo específico
    if (typeId === 'events') typesConfig.events = enabled;
    if (typeId === 'tasks') typesConfig.tasks = enabled;
    if (typeId === 'suggestions') typesConfig.suggestions = enabled;
    if (typeId === 'changes') typesConfig.changes = enabled;
    
    const result = await updatePreferences({ types_config: typesConfig });
    return !!result;
  }, [preferences, updatePreferences]);

  // Alternar método de notificação
  const toggleNotificationMethod = useCallback(async (methodId: string, enabled: boolean) => {
    if (!preferences) return false;
    
    const updates: Partial<NotificationPreferences> = {};
    
    if (methodId === 'push') updates.push_enabled = enabled;
    if (methodId === 'email') updates.email_enabled = enabled;
    if (methodId === 'sms') updates.sms_enabled = enabled;
    
    const result = await updatePreferences(updates);
    return !!result;
  }, [preferences, updatePreferences]);

  // Carregar dados iniciais
  useEffect(() => {
    if (user?.id) {
      loadNotifications();
      loadPreferences();
    }
  }, [user, loadNotifications, loadPreferences]);

  // Configurar polling para atualização em tempo real (a cada 30 segundos)
  useEffect(() => {
    if (!user?.id) return;
    
    const interval = setInterval(() => {
      loadNotifications();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [user, loadNotifications]);

  return {
    notifications,
    unreadCount,
    preferences,
    loading,
    error,
    loadNotifications,
    loadPreferences,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearReadNotifications,
    updatePreferences,
    toggleNotificationType,
    toggleNotificationMethod
  };
}

export default useNotifications;

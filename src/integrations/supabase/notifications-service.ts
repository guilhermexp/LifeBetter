import { supabase } from './client';
import { User } from '@supabase/supabase-js';

export interface Notification {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'reminder' | 'achievement' | 'system' | 'suggestion' | 'change';
  created_at: string;
  read: boolean;
  actionable?: boolean;
  action_url?: string;
  metadata?: Record<string, any>;
  expires_at?: string;
}

export interface NotificationPreferences {
  user_id: string;
  push_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  types_config: {
    events: boolean;
    tasks: boolean;
    suggestions: boolean;
    changes: boolean;
  };
  quiet_hours?: {
    enabled: boolean;
    start_time?: string;
    end_time?: string;
  };
  default_alerts: string[];
  allday_alerts: string[];
}

/**
 * Serviço para gerenciar notificações no Supabase
 */
export class NotificationsService {
  /**
   * Obter todas as notificações do usuário
   */
  static async getNotifications(
    userId: string,
    options?: {
      read?: boolean;
      limit?: number;
      offset?: number;
      type?: string;
    }
  ): Promise<{ notifications: Notification[]; count: number }> {
    try {
      let query = supabase
        .from('notifications')
        .select('*', { count: 'exact' })
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      // Aplicar filtros se fornecidos
      if (options?.read !== undefined) {
        query = query.eq('read', options.read);
      }

      if (options?.type) {
        query = query.eq('type', options.type);
      }

      // Paginação
      if (options?.limit) {
        query = query.limit(options.limit);
      }

      if (options?.offset) {
        query = query.range(options.offset, options.offset + (options.limit || 10) - 1);
      }

      const { data, error, count } = await query;

      if (error) throw error;
      return { 
        notifications: data as Notification[] || [], 
        count: count || 0 
      };
    } catch (error) {
      console.error('Erro ao buscar notificações:', error);
      return { notifications: [], count: 0 };
    }
  }

  /**
   * Marcar uma notificação como lida
   */
  static async markAsRead(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Erro ao marcar notificação ${id} como lida:`, error);
      return false;
    }
  }

  /**
   * Marcar todas as notificações do usuário como lidas
   */
  static async markAllAsRead(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', userId)
        .eq('read', false);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Erro ao marcar todas as notificações como lidas:`, error);
      return false;
    }
  }

  /**
   * Excluir uma notificação
   */
  static async deleteNotification(id: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Erro ao excluir notificação ${id}:`, error);
      return false;
    }
  }

  /**
   * Limpar todas as notificações lidas do usuário
   */
  static async clearReadNotifications(userId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('read', true);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error(`Erro ao limpar notificações lidas:`, error);
      return false;
    }
  }

  /**
   * Criar uma nova notificação
   */
  static async createNotification(notification: Omit<Notification, 'id' | 'created_at'>): Promise<Notification | null> {
    try {
      const { data, error } = await supabase
        .from('notifications')
        .insert({
          ...notification,
          created_at: new Date().toISOString(),
          read: false
        })
        .select()
        .single();

      if (error) throw error;
      return data as Notification;
    } catch (error) {
      console.error('Erro ao criar notificação:', error);
      return null;
    }
  }

  /**
   * Obter as preferências de notificação do usuário
   */
  static async getNotificationPreferences(userId: string): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Se não existir, criar preferências padrão
        if (error.code === 'PGRST116') {
          return this.createDefaultPreferences(userId);
        }
        throw error;
      }

      return data as NotificationPreferences;
    } catch (error) {
      console.error('Erro ao buscar preferências de notificação:', error);
      return null;
    }
  }

  /**
   * Atualizar as preferências de notificação do usuário
   */
  static async updateNotificationPreferences(
    userId: string, 
    preferences: Partial<NotificationPreferences>
  ): Promise<NotificationPreferences | null> {
    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .update(preferences)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data as NotificationPreferences;
    } catch (error) {
      console.error('Erro ao atualizar preferências de notificação:', error);
      return null;
    }
  }

  /**
   * Criar preferências de notificação padrão para um novo usuário
   */
  private static async createDefaultPreferences(userId: string): Promise<NotificationPreferences | null> {
    const defaultPreferences: Omit<NotificationPreferences, 'id'> = {
      user_id: userId,
      push_enabled: true,
      email_enabled: false,
      sms_enabled: false,
      types_config: {
        events: true,
        tasks: true,
        suggestions: true,
        changes: true
      },
      quiet_hours: {
        enabled: false,
        start_time: '22:00',
        end_time: '08:00'
      },
      default_alerts: [
        'at_start',
        'at_end',
        '5min_before'
      ],
      allday_alerts: [
        'at_8am'
      ]
    };

    try {
      const { data, error } = await supabase
        .from('notification_preferences')
        .insert(defaultPreferences)
        .select()
        .single();

      if (error) throw error;
      return data as NotificationPreferences;
    } catch (error) {
      console.error('Erro ao criar preferências padrão:', error);
      return null;
    }
  }

  /**
   * Verificar se o usuário deve receber notificações no momento atual
   * (baseado em preferências como quiet hours)
   */
  static shouldSendNotification(preferences: NotificationPreferences): boolean {
    if (!preferences.push_enabled && !preferences.email_enabled && !preferences.sms_enabled) {
      return false;
    }

    // Verificar quiet hours
    if (preferences.quiet_hours?.enabled) {
      const now = new Date();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
      
      const startTime = preferences.quiet_hours.start_time || '22:00';
      const endTime = preferences.quiet_hours.end_time || '08:00';
      
      // Se o horário atual estiver dentro do período de silêncio
      if (startTime <= endTime) {
        // Período normal (ex: 22:00 - 08:00)
        if (currentTime >= startTime && currentTime <= endTime) {
          return false;
        }
      } else {
        // Período que cruza a meia-noite (ex: 22:00 - 08:00)
        if (currentTime >= startTime || currentTime <= endTime) {
          return false;
        }
      }
    }

    return true;
  }

  /**
   * Enviar uma notificação push para o usuário
   * (Esta é uma implementação simulada - em produção, usaria um serviço real de push notifications)
   */
  static async sendPushNotification(
    userId: string,
    title: string,
    body: string,
    data?: Record<string, any>
  ): Promise<boolean> {
    try {
      // Verificar preferências do usuário
      const preferences = await this.getNotificationPreferences(userId);
      if (!preferences || !preferences.push_enabled) {
        return false;
      }

      if (!this.shouldSendNotification(preferences)) {
        return false;
      }

      // Em produção, aqui seria a integração com um serviço de push notifications
      console.log(`[PUSH] Enviando notificação para ${userId}: ${title} - ${body}`);
      
      // Registrar a notificação no banco de dados
      await this.createNotification({
        user_id: userId,
        title,
        message: body,
        type: 'system',
        read: false,
        metadata: data
      });

      return true;
    } catch (error) {
      console.error('Erro ao enviar notificação push:', error);
      return false;
    }
  }
}

// Script para criar as tabelas necessárias no Supabase
/*
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  read BOOLEAN DEFAULT FALSE,
  actionable BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB,
  expires_at TIMESTAMP WITH TIME ZONE
);

CREATE TABLE notification_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  push_enabled BOOLEAN DEFAULT TRUE,
  email_enabled BOOLEAN DEFAULT FALSE,
  sms_enabled BOOLEAN DEFAULT FALSE,
  types_config JSONB NOT NULL,
  quiet_hours JSONB,
  default_alerts TEXT[] NOT NULL,
  allday_alerts TEXT[] NOT NULL,
  CONSTRAINT unique_user_preferences UNIQUE (user_id)
);

-- Índices para melhorar a performance
CREATE INDEX notifications_user_id_idx ON notifications(user_id);
CREATE INDEX notifications_read_idx ON notifications(read);
CREATE INDEX notifications_type_idx ON notifications(type);
CREATE INDEX notifications_created_at_idx ON notifications(created_at);

-- Políticas RLS para segurança
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" 
  ON notifications FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
  ON notifications FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own notifications" 
  ON notifications FOR DELETE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own notification preferences" 
  ON notification_preferences FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notification preferences" 
  ON notification_preferences FOR UPDATE 
  USING (auth.uid() = user_id);
*/

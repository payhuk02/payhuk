import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface Notification {
  id: string;
  type: 'payment' | 'message' | 'dispute' | 'order' | 'system';
  title: string;
  message: string;
  data?: any;
  is_read: boolean;
  created_at: string;
  read_at?: string;
  // Relations
  user_id: string;
  order_id?: string;
  conversation_id?: string;
  dispute_id?: string;
}

export interface NotificationSettings {
  email_notifications: boolean;
  push_notifications: boolean;
  payment_notifications: boolean;
  message_notifications: boolean;
  dispute_notifications: boolean;
  order_notifications: boolean;
  system_notifications: boolean;
}

/**
 * Hook pour gérer les notifications et alertes
 */
export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [settings, setSettings] = useState<NotificationSettings>({
    email_notifications: true,
    push_notifications: true,
    payment_notifications: true,
    message_notifications: true,
    dispute_notifications: true,
    order_notifications: true,
    system_notifications: true
  });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  // Créer une notification
  const createNotification = async (data: {
    userId: string;
    type: 'payment' | 'message' | 'dispute' | 'order' | 'system';
    title: string;
    message: string;
    data?: any;
    orderId?: string;
    conversationId?: string;
    disputeId?: string;
  }) => {
    try {
      const { data: notification, error } = await supabase
        .from('notifications')
        .insert({
          user_id: data.userId,
          type: data.type,
          title: data.title,
          message: data.message,
          data: data.data || null,
          order_id: data.orderId || null,
          conversation_id: data.conversationId || null,
          dispute_id: data.disputeId || null,
          is_read: false
        })
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour l'état local
      setNotifications(prev => [notification, ...prev]);
      setUnreadCount(prev => prev + 1);

      // Afficher une notification toast si les paramètres le permettent
      if (shouldShowToast(data.type)) {
        toast({
          title: data.title,
          description: data.message,
          duration: 5000
        });
      }

      return notification;
    } catch (err: any) {
      logger.error('Error creating notification:', err);
      return null;
    }
  };

  // Marquer une notification comme lue
  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('id', notificationId);

      if (error) throw error;

      // Mettre à jour l'état local
      setNotifications(prev => prev.map(n => 
        n.id === notificationId ? { ...n, is_read: true, read_at: new Date().toISOString() } : n
      ));
      setUnreadCount(prev => Math.max(0, prev - 1));

    } catch (err: any) {
      logger.error('Error marking notification as read:', err);
    }
  };

  // Marquer toutes les notifications comme lues
  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('notifications')
        .update({
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('user_id', user.id)
        .eq('is_read', false);

      if (error) throw error;

      // Mettre à jour l'état local
      setNotifications(prev => prev.map(n => ({ ...n, is_read: true, read_at: new Date().toISOString() })));
      setUnreadCount(0);

    } catch (err: any) {
      logger.error('Error marking all notifications as read:', err);
    }
  };

  // Supprimer une notification
  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId);

      if (error) throw error;

      // Mettre à jour l'état local
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(prev => prev.filter(n => n.id !== notificationId));
      
      if (notification && !notification.is_read) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }

    } catch (err: any) {
      logger.error('Error deleting notification:', err);
    }
  };

  // Récupérer les notifications d'un utilisateur
  const fetchUserNotifications = async (userId: string, limit = 50) => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;

      setNotifications(data || []);
      setUnreadCount(data?.filter(n => !n.is_read).length || 0);

      return data || [];
    } catch (err: any) {
      logger.error('Error fetching notifications:', err);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les paramètres de notification
  const fetchNotificationSettings = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

      if (data) {
        setSettings(data);
      }

      return data;
    } catch (err: any) {
      logger.error('Error fetching notification settings:', err);
      return null;
    }
  };

  // Mettre à jour les paramètres de notification
  const updateNotificationSettings = async (userId: string, newSettings: Partial<NotificationSettings>) => {
    try {
      const { data, error } = await supabase
        .from('notification_settings')
        .upsert({
          user_id: userId,
          ...newSettings,
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      setSettings(prev => ({ ...prev, ...newSettings }));

      toast({
        title: "Paramètres mis à jour",
        description: "Vos préférences de notification ont été sauvegardées."
      });

      return data;
    } catch (err: any) {
      logger.error('Error updating notification settings:', err);
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres",
        variant: "destructive"
      });
      return null;
    }
  };

  // Vérifier si une notification toast doit être affichée
  const shouldShowToast = (type: string): boolean => {
    switch (type) {
      case 'payment':
        return settings.payment_notifications && settings.push_notifications;
      case 'message':
        return settings.message_notifications && settings.push_notifications;
      case 'dispute':
        return settings.dispute_notifications && settings.push_notifications;
      case 'order':
        return settings.order_notifications && settings.push_notifications;
      case 'system':
        return settings.system_notifications && settings.push_notifications;
      default:
        return false;
    }
  };

  // Créer des notifications automatiques pour les événements
  const createPaymentNotification = async (userId: string, paymentData: any) => {
    return createNotification({
      userId,
      type: 'payment',
      title: 'Nouveau paiement',
      message: `Paiement de ${paymentData.amount} XOF ${paymentData.type === 'partial' ? 'partiel' : 'escrow'} créé`,
      data: paymentData,
      orderId: paymentData.orderId
    });
  };

  const createMessageNotification = async (userId: string, messageData: any) => {
    return createNotification({
      userId,
      type: 'message',
      title: 'Nouveau message',
      message: `Message reçu de ${messageData.senderName}`,
      data: messageData,
      conversationId: messageData.conversationId
    });
  };

  const createDisputeNotification = async (userId: string, disputeData: any) => {
    return createNotification({
      userId,
      type: 'dispute',
      title: 'Nouveau litige',
      message: `Litige ouvert: ${disputeData.subject}`,
      data: disputeData,
      disputeId: disputeData.id
    });
  };

  const createOrderNotification = async (userId: string, orderData: any) => {
    return createNotification({
      userId,
      type: 'order',
      title: 'Commande mise à jour',
      message: `Statut de la commande: ${orderData.status}`,
      data: orderData,
      orderId: orderData.id
    });
  };

  // Écouter les nouvelles notifications en temps réel
  const subscribeToNotifications = useCallback((userId: string) => {
    const subscription = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`
        },
        (payload) => {
          const newNotification = payload.new as Notification;
          setNotifications(prev => [newNotification, ...prev]);
          setUnreadCount(prev => prev + 1);

          // Afficher une notification toast
          if (shouldShowToast(newNotification.type)) {
            toast({
              title: newNotification.title,
              description: newNotification.message,
              duration: 5000
            });
          }
        }
      )
      .subscribe();

    return subscription;
  }, [settings, toast]);

  // Nettoyer les anciennes notifications
  const cleanupOldNotifications = async (userId: string, daysOld = 30) => {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('user_id', userId)
        .eq('is_read', true)
        .lt('created_at', cutoffDate.toISOString());

      if (error) throw error;

      logger.info(`Cleaned up old notifications for user ${userId}`);
    } catch (err: any) {
      logger.error('Error cleaning up old notifications:', err);
    }
  };

  return {
    // État
    notifications,
    unreadCount,
    settings,
    loading,
    
    // Actions
    createNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchUserNotifications,
    fetchNotificationSettings,
    updateNotificationSettings,
    subscribeToNotifications,
    cleanupOldNotifications,
    
    // Notifications spécialisées
    createPaymentNotification,
    createMessageNotification,
    createDisputeNotification,
    createOrderNotification
  };
};

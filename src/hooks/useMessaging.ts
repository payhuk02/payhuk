import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { logger } from '@/lib/logger';

export interface Conversation {
  id: string;
  order_id: string;
  customer_id: string;
  store_id: string;
  product_id?: string;
  conversation_type: 'order' | 'support' | 'dispute';
  status: 'active' | 'closed' | 'archived';
  last_message_at: string;
  created_at: string;
  updated_at: string;
  // Relations
  order?: any;
  customer?: any;
  store?: any;
  product?: any;
  participants?: ConversationParticipant[];
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  sender_type: 'customer' | 'store' | 'admin';
  message_type: 'text' | 'image' | 'file' | 'system';
  content?: string;
  file_url?: string;
  file_name?: string;
  file_size?: number;
  file_type?: string;
  is_read: boolean;
  is_edited: boolean;
  edited_at?: string;
  reply_to_id?: string;
  created_at: string;
  updated_at: string;
  // Relations
  sender?: any;
  reply_to?: Message;
}

export interface ConversationParticipant {
  id: string;
  conversation_id: string;
  user_id: string;
  user_type: 'customer' | 'store' | 'admin';
  joined_at: string;
  last_read_at: string;
  is_active: boolean;
  // Relations
  user?: any;
}

export interface MessageNotification {
  id: string;
  conversation_id: string;
  message_id: string;
  recipient_id: string;
  notification_type: 'message' | 'mention' | 'system';
  is_read: boolean;
  created_at: string;
  read_at?: string;
  // Relations
  conversation?: Conversation;
  message?: Message;
}

/**
 * Hook pour gérer la messagerie entre clients et vendeurs
 */
export const useMessaging = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notifications, setNotifications] = useState<MessageNotification[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // Créer une conversation
  const createConversation = async (data: {
    orderId: string;
    customerId: string;
    storeId: string;
    productId?: string;
    conversationType?: 'order' | 'support' | 'dispute';
  }) => {
    try {
      setLoading(true);
      setError(null);

      const { data: conversation, error: createError } = await supabase
        .from('conversations')
        .insert({
          order_id: data.orderId,
          customer_id: data.customerId,
          store_id: data.storeId,
          product_id: data.productId,
          conversation_type: data.conversationType || 'order'
        })
        .select(`
          *,
          order:orders(*),
          customer:customers(*),
          store:stores(*),
          product:products(*)
        `)
        .single();

      if (createError) throw createError;

      setConversations(prev => [conversation, ...prev]);

      toast({
        title: "Conversation créée",
        description: "Une nouvelle conversation a été créée pour cette commande."
      });

      return conversation;
    } catch (err: any) {
      logger.error('Error creating conversation:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible de créer la conversation",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Envoyer un message
  const sendMessage = async (data: {
    conversationId: string;
    content?: string;
    messageType?: 'text' | 'image' | 'file' | 'system';
    fileUrl?: string;
    fileName?: string;
    fileSize?: number;
    fileType?: string;
    replyToId?: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Non authentifié');

      // Déterminer le type d'expéditeur
      let senderType: 'customer' | 'store' | 'admin' = 'customer';
      
      // Vérifier si l'utilisateur est un vendeur
      const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (store) {
        senderType = 'store';
      }

      const { data: message, error: sendError } = await supabase
        .from('messages')
        .insert({
          conversation_id: data.conversationId,
          sender_id: user.id,
          sender_type: senderType,
          message_type: data.messageType || 'text',
          content: data.content,
          file_url: data.fileUrl,
          file_name: data.fileName,
          file_size: data.fileSize,
          file_type: data.fileType,
          reply_to_id: data.replyToId
        })
        .select(`
          *,
          sender:auth.users(*),
          reply_to:messages(*)
        `)
        .single();

      if (sendError) throw sendError;

      setMessages(prev => [...prev, message]);

      return message;
    } catch (err: any) {
      logger.error('Error sending message:', err);
      setError(err.message);
      toast({
        title: "Erreur",
        description: "Impossible d'envoyer le message",
        variant: "destructive"
      });
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les conversations d'un utilisateur
  const fetchUserConversations = async (userId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('conversations')
        .select(`
          *,
          order:orders(*),
          customer:customers(*),
          store:stores(*),
          product:products(*),
          participants:conversation_participants(*)
        `)
        .or(`customer_id.eq.${userId},store_id.in.(SELECT id FROM stores WHERE user_id = '${userId}')`)
        .order('last_message_at', { ascending: false });

      if (fetchError) throw fetchError;

      setConversations(data || []);
      return data || [];
    } catch (err: any) {
      logger.error('Error fetching conversations:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Récupérer les messages d'une conversation
  const fetchConversationMessages = async (conversationId: string) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('messages')
        .select(`
          *,
          sender:auth.users(*),
          reply_to:messages(*)
        `)
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (fetchError) throw fetchError;

      setMessages(data || []);
      return data || [];
    } catch (err: any) {
      logger.error('Error fetching messages:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Marquer les messages comme lus
  const markMessagesAsRead = async (conversationId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Marquer les messages comme lus
      await supabase
        .from('messages')
        .update({ is_read: true })
        .eq('conversation_id', conversationId)
        .neq('sender_id', user.id);

      // Mettre à jour last_read_at pour le participant
      await supabase
        .from('conversation_participants')
        .update({ last_read_at: new Date().toISOString() })
        .eq('conversation_id', conversationId)
        .eq('user_id', user.id);

      // Marquer les notifications comme lues
      await supabase
        .from('message_notifications')
        .update({ 
          is_read: true,
          read_at: new Date().toISOString()
        })
        .eq('conversation_id', conversationId)
        .eq('recipient_id', user.id);

      // Mettre à jour l'état local
      setMessages(prev => prev.map(msg => 
        msg.conversation_id === conversationId && msg.sender_id !== user.id
          ? { ...msg, is_read: true }
          : msg
      ));

    } catch (err: any) {
      logger.error('Error marking messages as read:', err);
    }
  };

  // Récupérer les notifications
  const fetchNotifications = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('message_notifications')
        .select(`
          *,
          conversation:conversations(*),
          message:messages(*)
        `)
        .eq('recipient_id', userId)
        .eq('is_read', false)
        .order('created_at', { ascending: false });

      if (error) throw error;

      setNotifications(data || []);
      return data || [];
    } catch (err: any) {
      logger.error('Error fetching notifications:', err);
      return [];
    }
  };

  // Supprimer un message
  const deleteMessage = async (messageId: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId)
        .eq('sender_id', user.id);

      if (error) throw error;

      setMessages(prev => prev.filter(msg => msg.id !== messageId));

      toast({
        title: "Message supprimé",
        description: "Le message a été supprimé avec succès."
      });

    } catch (err: any) {
      logger.error('Error deleting message:', err);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le message",
        variant: "destructive"
      });
    }
  };

  // Modifier un message
  const editMessage = async (messageId: string, newContent: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: message, error } = await supabase
        .from('messages')
        .update({
          content: newContent,
          is_edited: true,
          edited_at: new Date().toISOString()
        })
        .eq('id', messageId)
        .eq('sender_id', user.id)
        .select()
        .single();

      if (error) throw error;

      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? message : msg
      ));

      toast({
        title: "Message modifié",
        description: "Le message a été modifié avec succès."
      });

    } catch (err: any) {
      logger.error('Error editing message:', err);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le message",
        variant: "destructive"
      });
    }
  };

  // Fermer une conversation
  const closeConversation = async (conversationId: string) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ status: 'closed' })
        .eq('id', conversationId);

      if (error) throw error;

      setConversations(prev => prev.map(conv => 
        conv.id === conversationId ? { ...conv, status: 'closed' } : conv
      ));

      toast({
        title: "Conversation fermée",
        description: "La conversation a été fermée avec succès."
      });

    } catch (err: any) {
      logger.error('Error closing conversation:', err);
      toast({
        title: "Erreur",
        description: "Impossible de fermer la conversation",
        variant: "destructive"
      });
    }
  };

  // Écouter les nouveaux messages en temps réel
  const subscribeToMessages = useCallback((conversationId: string) => {
    const subscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        (payload) => {
          const newMessage = payload.new as Message;
          setMessages(prev => [...prev, newMessage]);
        }
      )
      .subscribe();

    return subscription;
  }, []);

  // Écouter les nouvelles conversations
  const subscribeToConversations = useCallback((userId: string) => {
    const subscription = supabase
      .channel(`conversations:${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'conversations'
        },
        (payload) => {
          const newConversation = payload.new as Conversation;
          setConversations(prev => [newConversation, ...prev]);
        }
      )
      .subscribe();

    return subscription;
  }, []);

  return {
    // État
    conversations,
    messages,
    notifications,
    loading,
    error,
    
    // Actions
    createConversation,
    sendMessage,
    fetchUserConversations,
    fetchConversationMessages,
    markMessagesAsRead,
    fetchNotifications,
    deleteMessage,
    editMessage,
    closeConversation,
    subscribeToMessages,
    subscribeToConversations
  };
};

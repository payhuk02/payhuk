import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { 
  Send, 
  Paperclip, 
  Image, 
  FileText, 
  MoreVertical,
  Edit,
  Trash2,
  Reply,
  Clock,
  Check,
  CheckCheck,
  User,
  Store,
  Shield
} from 'lucide-react';
import { useMessaging, Message, Conversation } from '@/hooks/useMessaging';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface MessagingInterfaceProps {
  conversationId: string;
  currentUserId: string;
  onClose?: () => void;
}

/**
 * Interface de messagerie complète
 */
export const MessagingInterface: React.FC<MessagingInterfaceProps> = ({
  conversationId,
  currentUserId,
  onClose
}) => {
  const { 
    messages, 
    loading, 
    sendMessage, 
    fetchConversationMessages,
    markMessagesAsRead,
    deleteMessage,
    editMessage
  } = useMessaging();
  
  const { toast } = useToast();
  
  const [newMessage, setNewMessage] = useState('');
  const [editingMessage, setEditingMessage] = useState<string | null>(null);
  const [editContent, setEditContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<Message | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Charger les messages au montage
  useEffect(() => {
    if (conversationId) {
      fetchConversationMessages(conversationId);
      markMessagesAsRead(conversationId);
    }
  }, [conversationId]);

  // Auto-scroll vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Gérer l'envoi de message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMessage.trim() && !replyingTo) return;

    const message = await sendMessage({
      conversationId,
      content: newMessage.trim(),
      replyToId: replyingTo?.id
    });

    if (message) {
      setNewMessage('');
      setReplyingTo(null);
      setIsTyping(false);
    }
  };

  // Gérer l'édition de message
  const handleEditMessage = async (messageId: string) => {
    if (!editContent.trim()) return;

    await editMessage(messageId, editContent.trim());
    setEditingMessage(null);
    setEditContent('');
  };

  // Gérer la suppression de message
  const handleDeleteMessage = async (messageId: string) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce message ?')) {
      await deleteMessage(messageId);
    }
  };

  // Gérer l'upload de fichier
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Vérifier la taille du fichier (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Fichier trop volumineux",
        description: "La taille maximale autorisée est de 10MB",
        variant: "destructive"
      });
      return;
    }

    try {
      // Upload vers Supabase Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `messages/${conversationId}/${fileName}`;

      const { data, error } = await supabase.storage
        .from('message-files')
        .upload(filePath, file);

      if (error) throw error;

      // Obtenir l'URL publique
      const { data: { publicUrl } } = supabase.storage
        .from('message-files')
        .getPublicUrl(filePath);

      // Envoyer le message avec le fichier
      await sendMessage({
        conversationId,
        messageType: file.type.startsWith('image/') ? 'image' : 'file',
        fileUrl: publicUrl,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type
      });

    } catch (error) {
      console.error('Error uploading file:', error);
      toast({
        title: "Erreur d'upload",
        description: "Impossible d'envoyer le fichier",
        variant: "destructive"
      });
    }
  };

  // Formater l'heure
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('fr-FR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  // Obtenir l'icône du type d'expéditeur
  const getSenderIcon = (senderType: string) => {
    switch (senderType) {
      case 'customer':
        return <User className="h-3 w-3" />;
      case 'store':
        return <Store className="h-3 w-3" />;
      case 'admin':
        return <Shield className="h-3 w-3" />;
      default:
        return <User className="h-3 w-3" />;
    }
  };

  // Obtenir le statut de lecture
  const getReadStatus = (message: Message) => {
    if (message.sender_id === currentUserId) {
      return message.is_read ? (
        <CheckCheck className="h-3 w-3 text-blue-500" />
      ) : (
        <Check className="h-3 w-3 text-gray-400" />
      );
    }
    return null;
  };

  if (loading) {
    return (
      <Card className="h-[600px] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement des messages...</p>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" />
            Messages
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose}>
              Fermer
            </Button>
          )}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col p-0">
        {/* Zone des messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 ? (
            <div className="text-center py-8">
              <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-muted-foreground">Aucun message pour le moment</p>
              <p className="text-sm text-muted-foreground">
                Commencez la conversation en envoyant un message
              </p>
            </div>
          ) : (
            messages.map((message) => (
              <div key={message.id} className={`flex ${message.sender_id === currentUserId ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[70%] ${message.sender_id === currentUserId ? 'order-2' : 'order-1'}`}>
                  {/* Message de réponse */}
                  {message.reply_to && (
                    <div className="mb-2 p-2 bg-muted/50 rounded text-xs border-l-2 border-primary">
                      <p className="font-medium">Réponse à:</p>
                      <p className="truncate">{message.reply_to.content}</p>
                    </div>
                  )}

                  {/* Contenu du message */}
                  <div className={`p-3 rounded-lg ${
                    message.sender_id === currentUserId 
                      ? 'bg-primary text-primary-foreground' 
                      : 'bg-muted'
                  }`}>
                    {editingMessage === message.id ? (
                      <div className="space-y-2">
                        <Textarea
                          value={editContent}
                          onChange={(e) => setEditContent(e.target.value)}
                          className="min-h-[60px]"
                          placeholder="Modifier le message..."
                        />
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleEditMessage(message.id)}
                            disabled={!editContent.trim()}
                          >
                            Sauvegarder
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingMessage(null);
                              setEditContent('');
                            }}
                          >
                            Annuler
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* Contenu texte */}
                        {message.content && (
                          <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                        )}

                        {/* Fichier joint */}
                        {message.file_url && (
                          <div className="mt-2">
                            {message.message_type === 'image' ? (
                              <img
                                src={message.file_url}
                                alt={message.file_name || 'Image'}
                                className="max-w-full h-auto rounded"
                                style={{ maxHeight: '200px' }}
                              />
                            ) : (
                              <div className="flex items-center gap-2 p-2 bg-background/50 rounded">
                                <FileText className="h-4 w-4" />
                                <div className="flex-1 min-w-0">
                                  <p className="text-sm font-medium truncate">
                                    {message.file_name}
                                  </p>
                                  <p className="text-xs text-muted-foreground">
                                    {(message.file_size! / 1024).toFixed(1)} KB
                                  </p>
                                </div>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => window.open(message.file_url, '_blank')}
                                >
                                  Ouvrir
                                </Button>
                              </div>
                            )}
                          </div>
                        )}

                        {/* Métadonnées du message */}
                        <div className="flex items-center justify-between mt-2 text-xs">
                          <div className="flex items-center gap-1">
                            {getSenderIcon(message.sender_type)}
                            <span>{formatTime(message.created_at)}</span>
                            {message.is_edited && (
                              <span className="italic">(modifié)</span>
                            )}
                          </div>
                          <div className="flex items-center gap-1">
                            {getReadStatus(message)}
                            {message.sender_id === currentUserId && (
                              <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                    <MoreVertical className="h-3 w-3" />
                                  </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setEditingMessage(message.id);
                                      setEditContent(message.content || '');
                                    }}
                                  >
                                    <Edit className="h-4 w-4 mr-2" />
                                    Modifier
                                  </DropdownMenuItem>
                                  <DropdownMenuItem
                                    onClick={() => setReplyingTo(message)}
                                  >
                                    <Reply className="h-4 w-4 mr-2" />
                                    Répondre
                                  </DropdownMenuItem>
                                  <DropdownMenuSeparator />
                                  <DropdownMenuItem
                                    onClick={() => handleDeleteMessage(message.id)}
                                    className="text-red-600"
                                  >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Supprimer
                                  </DropdownMenuItem>
                                </DropdownMenuContent>
                              </DropdownMenu>
                            )}
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <Separator />

        {/* Zone de saisie */}
        <div className="p-4">
          {/* Message de réponse */}
          {replyingTo && (
            <div className="mb-3 p-2 bg-muted/50 rounded text-sm border-l-2 border-primary">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Répondre à:</p>
                  <p className="truncate">{replyingTo.content}</p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setReplyingTo(null)}
                >
                  ✕
                </Button>
              </div>
            </div>
          )}

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <div className="flex-1">
              <Textarea
                value={newMessage}
                onChange={(e) => {
                  setNewMessage(e.target.value);
                  setIsTyping(e.target.value.length > 0);
                }}
                placeholder="Tapez votre message..."
                className="min-h-[40px] max-h-[120px] resize-none"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage(e);
                  }
                }}
              />
            </div>
            
            <div className="flex flex-col gap-1">
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileUpload}
                className="hidden"
                accept="image/*,.pdf,.doc,.docx,.txt"
              />
              
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="h-8 w-8 p-0"
              >
                <Paperclip className="h-4 w-4" />
              </Button>
              
              <Button
                type="submit"
                size="sm"
                disabled={!newMessage.trim() && !replyingTo}
                className="h-8 w-8 p-0"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};

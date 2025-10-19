import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Bell, 
  BellOff, 
  Check, 
  CheckCheck, 
  Trash2,
  Settings,
  Mail,
  Smartphone,
  CreditCard,
  MessageSquare,
  AlertTriangle,
  Package,
  Cog,
  Clock,
  X
} from 'lucide-react';
import { useNotifications, Notification } from '@/hooks/useNotifications';
import { useToast } from '@/hooks/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface NotificationCenterProps {
  userId: string;
  onClose?: () => void;
}

/**
 * Centre de notifications avec gestion des paramètres
 */
export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  userId,
  onClose
}) => {
  const {
    notifications,
    unreadCount,
    settings,
    loading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    fetchUserNotifications,
    fetchNotificationSettings,
    updateNotificationSettings
  } = useNotifications();
  
  const { toast } = useToast();
  
  const [showSettings, setShowSettings] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'payment' | 'message' | 'dispute' | 'order' | 'system'>('all');

  useEffect(() => {
    fetchUserNotifications(userId);
    fetchNotificationSettings(userId);
  }, [userId]);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return 'Il y a quelques minutes';
    } else if (diffInHours < 24) {
      return `Il y a ${Math.floor(diffInHours)}h`;
    } else if (diffInHours < 48) {
      return 'Hier';
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <CreditCard className="h-4 w-4 text-green-500" />;
      case 'message':
        return <MessageSquare className="h-4 w-4 text-blue-500" />;
      case 'dispute':
        return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      case 'order':
        return <Package className="h-4 w-4 text-purple-500" />;
      case 'system':
        return <Cog className="h-4 w-4 text-gray-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'payment':
        return 'bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-800';
      case 'message':
        return 'bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800';
      case 'dispute':
        return 'bg-orange-50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-800';
      case 'order':
        return 'bg-purple-50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800';
      case 'system':
        return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800';
      default:
        return 'bg-gray-50 dark:bg-gray-950/20 border-gray-200 dark:border-gray-800';
    }
  };

  const filteredNotifications = notifications.filter(notification => {
    if (filterType === 'all') return true;
    if (filterType === 'unread') return !notification.is_read;
    return notification.type === filterType;
  });

  const handleMarkAsRead = async (notificationId: string) => {
    await markAsRead(notificationId);
  };

  const handleDeleteNotification = async (notificationId: string) => {
    await deleteNotification(notificationId);
  };

  const handleMarkAllAsRead = async () => {
    await markAllAsRead();
    toast({
      title: "Notifications marquées comme lues",
      description: "Toutes les notifications ont été marquées comme lues."
    });
  };

  const handleSettingChange = async (key: keyof typeof settings, value: boolean) => {
    await updateNotificationSettings(userId, { [key]: value });
  };

  if (showSettings) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres de notification
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => setShowSettings(false)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Paramètres généraux */}
          <div className="space-y-4">
            <h3 className="font-semibold">Paramètres généraux</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Notifications par email</span>
              </div>
              <Switch
                checked={settings.email_notifications}
                onCheckedChange={(checked) => handleSettingChange('email_notifications', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                <span>Notifications push</span>
              </div>
              <Switch
                checked={settings.push_notifications}
                onCheckedChange={(checked) => handleSettingChange('push_notifications', checked)}
              />
            </div>
          </div>

          <Separator />

          {/* Types de notifications */}
          <div className="space-y-4">
            <h3 className="font-semibold">Types de notifications</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4" />
                  <span>Paiements</span>
                </div>
                <Switch
                  checked={settings.payment_notifications}
                  onCheckedChange={(checked) => handleSettingChange('payment_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" />
                  <span>Messages</span>
                </div>
                <Switch
                  checked={settings.message_notifications}
                  onCheckedChange={(checked) => handleSettingChange('message_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4" />
                  <span>Litiges</span>
                </div>
                <Switch
                  checked={settings.dispute_notifications}
                  onCheckedChange={(checked) => handleSettingChange('dispute_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Package className="h-4 w-4" />
                  <span>Commandes</span>
                </div>
                <Switch
                  checked={settings.order_notifications}
                  onCheckedChange={(checked) => handleSettingChange('order_notifications', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cog className="h-4 w-4" />
                  <span>Système</span>
                </div>
                <Switch
                  checked={settings.system_notifications}
                  onCheckedChange={(checked) => handleSettingChange('system_notifications', checked)}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setShowSettings(false)}
              className="flex-1"
            >
              Retour
            </Button>
            <Button
              onClick={handleMarkAllAsRead}
              className="flex-1 gap-2"
            >
              <CheckCheck className="h-4 w-4" />
              Tout marquer comme lu
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notifications
            {unreadCount > 0 && (
              <Badge variant="destructive">{unreadCount}</Badge>
            )}
          </CardTitle>
          
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSettings(true)}
            >
              <Settings className="h-4 w-4" />
            </Button>
            {onClose && (
              <Button variant="ghost" size="sm" onClick={onClose}>
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Filtres */}
        <div className="flex gap-2 flex-wrap">
          {[
            { key: 'all', label: 'Toutes' },
            { key: 'unread', label: 'Non lues' },
            { key: 'payment', label: 'Paiements' },
            { key: 'message', label: 'Messages' },
            { key: 'dispute', label: 'Litiges' },
            { key: 'order', label: 'Commandes' },
            { key: 'system', label: 'Système' }
          ].map((filter) => (
            <Button
              key={filter.key}
              variant={filterType === filter.key ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilterType(filter.key as any)}
            >
              {filter.label}
            </Button>
          ))}
        </div>

        <Separator />

        {/* Liste des notifications */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
              <p className="text-muted-foreground">Chargement des notifications...</p>
            </div>
          ) : filteredNotifications.length === 0 ? (
            <div className="text-center py-8">
              <BellOff className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <h3 className="text-lg font-semibold mb-2">Aucune notification</h3>
              <p className="text-muted-foreground">
                {filterType === 'unread' 
                  ? 'Toutes vos notifications ont été lues'
                  : 'Vous n\'avez pas encore de notifications'
                }
              </p>
            </div>
          ) : (
            filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 rounded-lg border transition-colors ${
                  notification.is_read 
                    ? 'bg-muted/50' 
                    : getNotificationColor(notification.type)
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="mt-1">
                    {getNotificationIcon(notification.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-medium text-sm">{notification.title}</h4>
                      {!notification.is_read && (
                        <div className="w-2 h-2 bg-primary rounded-full"></div>
                      )}
                    </div>
                    
                    <p className="text-sm text-muted-foreground mb-2">
                      {notification.message}
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        {formatTime(notification.created_at)}
                      </span>
                      
                      <div className="flex gap-1">
                        {!notification.is_read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="h-6 w-6 p-0"
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        )}
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {!notification.is_read && (
                              <DropdownMenuItem
                                onClick={() => handleMarkAsRead(notification.id)}
                              >
                                <Check className="h-4 w-4 mr-2" />
                                Marquer comme lu
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                              onClick={() => handleDeleteNotification(notification.id)}
                              className="text-red-600"
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Supprimer
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Actions en bas */}
        {filteredNotifications.length > 0 && (
          <>
            <Separator />
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={handleMarkAllAsRead}
                className="flex-1 gap-2"
                disabled={unreadCount === 0}
              >
                <CheckCheck className="h-4 w-4" />
                Tout marquer comme lu
              </Button>
              
              <Button
                variant="outline"
                onClick={() => setShowSettings(true)}
                className="flex-1 gap-2"
              >
                <Settings className="h-4 w-4" />
                Paramètres
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

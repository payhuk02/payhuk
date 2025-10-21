import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Activity, 
  Clock, 
  User, 
  ShoppingCart, 
  Package, 
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
  RefreshCw,
  Filter,
  MoreHorizontal
} from 'lucide-react';
import { useNotification } from '@/components/ui/NotificationContainer';
import { motion, AnimatePresence } from 'framer-motion';

interface ActivityItem {
  id: string;
  type: 'order' | 'product' | 'customer' | 'payment' | 'system';
  title: string;
  description: string;
  timestamp: string;
  status: 'success' | 'warning' | 'error' | 'info';
  user?: string;
  amount?: number;
  metadata?: any;
}

export const ActivityFeed: React.FC = () => {
  const { showInfo } = useNotification();
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [filter, setFilter] = useState<'all' | 'order' | 'product' | 'customer' | 'payment' | 'system'>('all');

  // Générer des activités de démonstration
  const generateDemoActivities = (): ActivityItem[] => {
    const now = new Date();
    const activities: ActivityItem[] = [];

    // Ajouter quelques activités de démonstration si aucune activité réelle
    if (activities.length === 0) {
      activities.push(
        {
          id: '1',
          type: 'system',
          title: 'Bienvenue sur Payhuk !',
          description: 'Votre tableau de bord est maintenant configuré et prêt à l\'emploi.',
          timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
          status: 'success',
          metadata: { isWelcome: true }
        },
        {
          id: '2',
          type: 'product',
          title: 'Prêt à ajouter des produits',
          description: 'Créez votre premier produit pour commencer à vendre.',
          timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
          status: 'info',
          metadata: { action: 'create_product' }
        },
        {
          id: '3',
          type: 'system',
          title: 'Configuration terminée',
          description: 'Toutes les fonctionnalités sont maintenant disponibles.',
          timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
          status: 'success',
          metadata: { setupComplete: true }
        }
      );
    }

    return activities;
  };

  useEffect(() => {
    const demoActivities = generateDemoActivities();
    setActivities(demoActivities);
  }, []);

  const handleRefresh = async () => {
    setIsLoading(true);
    // Simulation d'un rafraîchissement
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsLoading(false);
    showInfo('Actualisation', 'Flux d\'activité mis à jour');
  };

  const getActivityIcon = (type: string, status: string) => {
    const iconClass = "h-4 w-4";
    
    switch (type) {
      case 'order':
        return <ShoppingCart className={`${iconClass} text-blue-600`} />;
      case 'product':
        return <Package className={`${iconClass} text-green-600`} />;
      case 'customer':
        return <User className={`${iconClass} text-purple-600`} />;
      case 'payment':
        return <DollarSign className={`${iconClass} text-yellow-600`} />;
      case 'system':
        return <Activity className={`${iconClass} text-gray-600`} />;
      default:
        return <Info className={`${iconClass} text-gray-600`} />;
    }
  };

  const getStatusIcon = (status: string) => {
    const iconClass = "h-3 w-3";
    
    switch (status) {
      case 'success':
        return <CheckCircle className={`${iconClass} text-green-600`} />;
      case 'warning':
        return <AlertCircle className={`${iconClass} text-yellow-600`} />;
      case 'error':
        return <AlertCircle className={`${iconClass} text-red-600`} />;
      case 'info':
        return <Info className={`${iconClass} text-blue-600`} />;
      default:
        return <Info className={`${iconClass} text-gray-600`} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'info':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-gray-50 border-gray-200 dark:bg-gray-900/20 dark:border-gray-800';
    }
  };

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'À l\'instant';
    if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`;
    if (diffInMinutes < 1440) return `Il y a ${Math.floor(diffInMinutes / 60)}h`;
    return `Il y a ${Math.floor(diffInMinutes / 1440)}j`;
  };

  const filteredActivities = activities.filter(activity => 
    filter === 'all' || activity.type === filter
  );

  const handleActivityClick = (activity: ActivityItem) => {
    if (activity.metadata?.action === 'create_product') {
      window.location.href = '/dashboard/products/new';
    } else {
      showInfo('Activité', activity.description);
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Flux d'activité
            </CardTitle>
            <CardDescription>
              Suivez toutes les activités de votre boutique en temps réel
            </CardDescription>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
            </Button>
            
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Filtres */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2">
          {[
            { value: 'all', label: 'Tout', count: activities.length },
            { value: 'order', label: 'Commandes', count: activities.filter(a => a.type === 'order').length },
            { value: 'product', label: 'Produits', count: activities.filter(a => a.type === 'product').length },
            { value: 'customer', label: 'Clients', count: activities.filter(a => a.type === 'customer').length },
            { value: 'payment', label: 'Paiements', count: activities.filter(a => a.type === 'payment').length },
            { value: 'system', label: 'Système', count: activities.filter(a => a.type === 'system').length }
          ].map((filterOption) => (
            <Button
              key={filterOption.value}
              variant={filter === filterOption.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter(filterOption.value as any)}
              className="whitespace-nowrap"
            >
              {filterOption.label}
              {filterOption.count > 0 && (
                <Badge variant="secondary" className="ml-2 text-xs">
                  {filterOption.count}
                </Badge>
              )}
            </Button>
          ))}
        </div>

        {/* Liste des activités */}
        <div className="space-y-3 max-h-96 overflow-y-auto">
          <AnimatePresence>
            {filteredActivities.length === 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-8 text-muted-foreground"
              >
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Aucune activité récente</p>
                <p className="text-sm">Les activités apparaîtront ici</p>
              </motion.div>
            ) : (
              filteredActivities.map((activity, index) => (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.1 }}
                  className={`p-3 rounded-lg border cursor-pointer hover:shadow-md transition-all duration-200 ${getStatusColor(activity.status)}`}
                  onClick={() => handleActivityClick(activity)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-1">
                      {getActivityIcon(activity.type, activity.status)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-medium text-foreground">
                          {activity.title}
                        </h4>
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(activity.status)}
                          <span className="text-xs text-muted-foreground">
                            {formatTimeAgo(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-muted-foreground mt-1">
                        {activity.description}
                      </p>
                      
                      {activity.user && (
                        <div className="flex items-center space-x-2 mt-2">
                          <User className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {activity.user}
                          </span>
                        </div>
                      )}
                      
                      {activity.amount && (
                        <div className="flex items-center space-x-2 mt-2">
                          <DollarSign className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs font-medium text-green-600">
                            {activity.amount.toLocaleString()} FCFA
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>

        {/* Statistiques du flux */}
        <div className="pt-4 border-t">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-blue-600">
                {activities.filter(a => a.type === 'order').length}
              </div>
              <div className="text-xs text-muted-foreground">Commandes</div>
            </div>
            <div>
              <div className="text-lg font-bold text-green-600">
                {activities.filter(a => a.type === 'product').length}
              </div>
              <div className="text-xs text-muted-foreground">Produits</div>
            </div>
            <div>
              <div className="text-lg font-bold text-purple-600">
                {activities.filter(a => a.type === 'customer').length}
              </div>
              <div className="text-xs text-muted-foreground">Clients</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

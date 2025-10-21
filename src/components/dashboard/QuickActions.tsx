import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Plus, 
  Settings, 
  BarChart3, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  Zap,
  ArrowRight,
  Star,
  TrendingUp,
  Target,
  Globe,
  Smartphone,
  Monitor,
  CreditCard,
  Truck,
  MessageSquare,
  Gift,
  Shield,
  Bell
} from 'lucide-react';
import { useNotification } from '@/components/ui/NotificationContainer';
import { motion } from 'framer-motion';

export const QuickActions: React.FC = () => {
  const { showSuccess, showInfo } = useNotification();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleAction = async (action: string, url: string) => {
    setIsLoading(action);
    
    // Simulation d'un délai pour l'action
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    showSuccess('Action lancée', `Redirection vers ${action}`);
    setIsLoading(null);
    
    // Navigation vers la page
    window.location.href = url;
  };

  const primaryActions = [
    {
      id: 'create-product',
      title: 'Nouveau produit',
      description: 'Ajouter un produit à votre catalogue',
      icon: <Package className="h-5 w-5" />,
      color: 'blue',
      url: '/dashboard/products/new',
      badge: 'Populaire'
    },
    {
      id: 'create-order',
      title: 'Nouvelle commande',
      description: 'Créer une commande manuelle',
      icon: <ShoppingCart className="h-5 w-5" />,
      color: 'green',
      url: '/dashboard/orders/new',
      badge: 'Rapide'
    },
    {
      id: 'analytics',
      title: 'Analytics',
      description: 'Voir les analyses détaillées',
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'purple',
      url: '/dashboard/analytics',
      badge: 'Insights'
    },
    {
      id: 'settings',
      title: 'Paramètres',
      description: 'Configurer votre boutique',
      icon: <Settings className="h-5 w-5" />,
      color: 'yellow',
      url: '/dashboard/settings',
      badge: 'Config'
    }
  ];

  const secondaryActions = [
    {
      id: 'customers',
      title: 'Gestion clients',
      description: 'Gérer votre base clients',
      icon: <Users className="h-4 w-4" />,
      url: '/dashboard/customers'
    },
    {
      id: 'payments',
      title: 'Paiements',
      description: 'Configurer les paiements',
      icon: <CreditCard className="h-4 w-4" />,
      url: '/dashboard/payments'
    },
    {
      id: 'shipping',
      title: 'Livraison',
      description: 'Paramètres de livraison',
      icon: <Truck className="h-4 w-4" />,
      url: '/dashboard/shipping'
    },
    {
      id: 'messaging',
      title: 'Messages',
      description: 'Centre de messagerie',
      icon: <MessageSquare className="h-4 w-4" />,
      url: '/dashboard/messaging'
    },
    {
      id: 'promotions',
      title: 'Promotions',
      description: 'Créer des offres',
      icon: <Gift className="h-4 w-4" />,
      url: '/dashboard/promotions'
    },
    {
      id: 'security',
      title: 'Sécurité',
      description: 'Paramètres de sécurité',
      icon: <Shield className="h-4 w-4" />,
      url: '/dashboard/security'
    }
  ];

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue':
        return 'bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/30 text-blue-700 dark:text-blue-300';
      case 'green':
        return 'bg-green-50 hover:bg-green-100 dark:bg-green-900/20 dark:hover:bg-green-900/30 text-green-700 dark:text-green-300';
      case 'purple':
        return 'bg-purple-50 hover:bg-purple-100 dark:bg-purple-900/20 dark:hover:bg-purple-900/30 text-purple-700 dark:text-purple-300';
      case 'yellow':
        return 'bg-yellow-50 hover:bg-yellow-100 dark:bg-yellow-900/20 dark:hover:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300';
      default:
        return 'bg-gray-50 hover:bg-gray-100 dark:bg-gray-900/20 dark:hover:bg-gray-900/30 text-gray-700 dark:text-gray-300';
    }
  };

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Actions rapides
        </CardTitle>
        <CardDescription>
          Accès rapide aux fonctionnalités principales de votre boutique
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Actions principales */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Actions principales</h4>
            <Badge variant="secondary" className="text-xs">
              <Star className="h-3 w-3 mr-1" />
              Recommandées
            </Badge>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {primaryActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Button
                  variant="outline"
                  className={`w-full h-auto p-4 flex flex-col items-start space-y-2 ${getColorClasses(action.color)} hover:scale-[1.02] transition-all duration-200`}
                  onClick={() => handleAction(action.title, action.url)}
                  disabled={isLoading === action.id}
                >
                  <div className="flex items-center justify-between w-full">
                    <div className="flex items-center space-x-3">
                      {action.icon}
                      <div className="text-left">
                        <div className="font-medium">{action.title}</div>
                        <div className="text-xs opacity-75">{action.description}</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline" className="text-xs">
                        {action.badge}
                      </Badge>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                  
                  {isLoading === action.id && (
                    <div className="w-full">
                      <div className="h-1 bg-current/20 rounded-full overflow-hidden">
                        <motion.div
                          className="h-full bg-current rounded-full"
                          initial={{ width: 0 }}
                          animate={{ width: '100%' }}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      </div>
                    </div>
                  )}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Actions secondaires */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Autres fonctionnalités</h4>
            <Badge variant="outline" className="text-xs">
              <Target className="h-3 w-3 mr-1" />
              Avancées
            </Badge>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            {secondaryActions.map((action, index) => (
              <motion.div
                key={action.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-auto p-3 hover:bg-muted transition-colors"
                  onClick={() => handleAction(action.title, action.url)}
                  disabled={isLoading === action.id}
                >
                  <div className="flex items-center space-x-2">
                    {action.icon}
                    <div className="text-left">
                      <div className="font-medium text-sm">{action.title}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </div>
                </Button>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="pt-4 border-t">
          <div className="flex items-center justify-between mb-3">
            <h4 className="text-sm font-medium">Statistiques rapides</h4>
            <Badge variant="outline" className="text-xs">
              <TrendingUp className="h-3 w-3 mr-1" />
              Temps réel
            </Badge>
          </div>
          
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="space-y-1">
              <div className="text-lg font-bold text-green-600">0</div>
              <div className="text-xs text-muted-foreground">Ventes aujourd'hui</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-blue-600">0</div>
              <div className="text-xs text-muted-foreground">Nouveaux clients</div>
            </div>
            <div className="space-y-1">
              <div className="text-lg font-bold text-purple-600">0</div>
              <div className="text-xs text-muted-foreground">Commandes en cours</div>
            </div>
          </div>
        </div>

        {/* Conseils et astuces */}
        <div className="pt-4 border-t">
          <div className="flex items-center gap-2 mb-3">
            <Bell className="h-4 w-4 text-yellow-600" />
            <h4 className="text-sm font-medium">Conseils du jour</h4>
          </div>
          
          <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-3 space-y-2">
            <div className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
              💡 Optimisez vos produits
            </div>
            <div className="text-xs text-yellow-700 dark:text-yellow-300">
              Ajoutez des descriptions détaillées et des images de qualité pour augmenter vos ventes de 25%.
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="w-full text-xs"
              onClick={() => showInfo('Conseil', 'Les produits avec des descriptions complètes et des images de qualité ont un taux de conversion 25% plus élevé.')}
            >
              En savoir plus
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

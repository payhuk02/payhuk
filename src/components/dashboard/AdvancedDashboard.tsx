import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Download,
  RefreshCw,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Plus,
  Settings,
  FileText,
  Trash2,
  Play,
  Calendar,
  Target,
  Zap,
  Award,
  Globe,
  Smartphone,
  Monitor
} from 'lucide-react';
import { useDashboardData, useDashboardActions } from '@/hooks/useDashboardData';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/components/ui/NotificationContainer';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import ConfigChecker from '@/components/dashboard/ConfigChecker';
import { motion, AnimatePresence } from 'framer-motion';

// Composant pour les cartes de statistiques
interface StatCardProps {
  title: string;
  value: string | number;
  growth?: number;
  icon: React.ReactNode;
  color?: 'green' | 'red' | 'blue' | 'yellow';
  isLoading?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  growth, 
  icon, 
  color = 'blue',
  isLoading = false 
}) => {
  const colorClasses = {
    green: 'text-green-600',
    red: 'text-red-600',
    blue: 'text-blue-600',
    yellow: 'text-yellow-600'
  };

  const bgColorClasses = {
    green: 'bg-green-50 dark:bg-green-900/20',
    red: 'bg-red-50 dark:bg-red-900/20',
    blue: 'bg-blue-50 dark:bg-blue-900/20',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20'
  };

  if (isLoading) {
    return (
      <Card className="hover:shadow-lg transition-all duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className="h-4 w-4 bg-muted animate-pulse rounded" />
        </CardHeader>
        <CardContent>
          <div className="h-8 w-24 bg-muted animate-pulse rounded mb-2" />
          <div className="h-4 w-16 bg-muted animate-pulse rounded" />
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card className={`hover:shadow-lg transition-all duration-300 hover:scale-[1.02] ${bgColorClasses[color]}`}>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
          <div className={colorClasses[color]}>
            {icon}
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold mb-1">{value}</div>
          {growth !== undefined && (
            <div className="flex items-center text-xs">
              {growth >= 0 ? (
                <>
                  <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                  <span className="text-green-600">+{growth}%</span>
                </>
              ) : (
                <>
                  <TrendingDown className="h-3 w-3 mr-1 text-red-600" />
                  <span className="text-red-600">{growth}%</span>
                </>
              )}
              <span className="ml-1 text-muted-foreground">vs période précédente</span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

// Composant pour les actions rapides
const QuickActions: React.FC = () => {
  const { createProduct, createOrder, updateStoreSettings } = useDashboardActions();
  const { showSuccess } = useNotification();

  const actions = [
    {
      title: 'Nouveau produit',
      description: 'Ajouter un produit à votre boutique',
      icon: <Package className="h-5 w-5" />,
      onClick: () => {
        // Navigation vers la page de création de produit
        window.location.href = '/dashboard/products/new';
      },
      color: 'blue'
    },
    {
      title: 'Nouvelle commande',
      description: 'Créer une commande manuelle',
      icon: <ShoppingCart className="h-5 w-5" />,
      onClick: () => {
        // Navigation vers la page de création de commande
        window.location.href = '/dashboard/orders/new';
      },
      color: 'green'
    },
    {
      title: 'Paramètres',
      description: 'Configurer votre boutique',
      icon: <Settings className="h-5 w-5" />,
      onClick: () => {
        window.location.href = '/dashboard/settings';
      },
      color: 'yellow'
    },
    {
      title: 'Analytics',
      description: 'Voir les analyses détaillées',
      icon: <BarChart3 className="h-5 w-5" />,
      onClick: () => {
        window.location.href = '/dashboard/analytics';
      },
      color: 'purple'
    }
  ];

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Actions rapides
        </CardTitle>
        <CardDescription>
          Accès rapide aux fonctionnalités principales
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {actions.map((action, index) => (
          <motion.div
            key={action.title}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Button
              variant="outline"
              className="w-full justify-start h-auto p-3 hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={action.onClick}
            >
              <div className="flex items-center space-x-3">
                {action.icon}
                <div className="text-left">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-muted-foreground">{action.description}</div>
                </div>
              </div>
            </Button>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
};

// Composant pour l'état vide (nouveaux utilisateurs)
const EmptyState: React.FC = () => {
  const { generateDemoData } = useDashboardData();
  const { showInfo } = useNotification();

  return (
    <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
      <motion.div
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
        className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mb-6"
      >
        <BarChart3 className="w-12 h-12 text-primary" />
      </motion.div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="space-y-4 max-w-md"
      >
        <h3 className="text-2xl font-bold">Bienvenue sur votre tableau de bord !</h3>
        <p className="text-muted-foreground">
          Votre tableau de bord est vide car vous venez de commencer. 
          Créez votre premier produit ou générez des données de démonstration pour voir toutes les fonctionnalités.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button 
            onClick={() => window.location.href = '/dashboard/products/new'}
            className="flex-1"
          >
            <Plus className="w-4 h-4 mr-2" />
            Créer mon premier produit
          </Button>
          
          <Button 
            variant="outline" 
            onClick={() => {
              generateDemoData();
              showInfo('Données de démonstration', 'Des données d\'exemple ont été générées pour vous permettre de découvrir toutes les fonctionnalités');
            }}
            className="flex-1"
          >
            <Play className="w-4 h-4 mr-2" />
            Voir la démo
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

// Composant principal du tableau de bord
const AdvancedDashboard: React.FC = () => {
  const { user } = useAuth();
  const { 
    stats, 
    isLoading, 
    error, 
    selectedPeriod, 
    isEmpty, 
    hasData,
    refreshStats, 
    changePeriod, 
    exportData 
  } = useDashboardData();
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refreshStats();
    setLastUpdate(new Date());
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const handleExport = (format: 'csv' | 'json' | 'pdf') => {
    exportData(format);
  };

  // Affichage de l'état vide
  if (!isLoading && isEmpty) {
    return <EmptyState />;
  }

  // Affichage du chargement
  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="h-8 w-48 bg-muted animate-pulse rounded" />
            <div className="h-4 w-32 bg-muted animate-pulse rounded" />
          </div>
          <div className="flex items-center gap-2">
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
            <div className="h-10 w-24 bg-muted animate-pulse rounded" />
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <StatCard
              key={i}
              title="Chargement..."
              value="0"
              icon={<div className="h-4 w-4 bg-muted animate-pulse rounded" />}
              isLoading={true}
            />
          ))}
        </div>
      </div>
    );
  }

  // Affichage des erreurs
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
        <div className="w-24 h-24 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-6">
          <Activity className="w-12 h-12 text-red-600" />
        </div>
        <h3 className="text-2xl font-bold mb-4">Erreur de chargement</h3>
        <p className="text-muted-foreground mb-6">{error}</p>
        <Button onClick={handleRefresh}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Réessayer
        </Button>
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre boutique • {user?.name}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={changePeriod}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">7 derniers jours</SelectItem>
              <SelectItem value="30d">30 derniers jours</SelectItem>
              <SelectItem value="90d">3 derniers mois</SelectItem>
              <SelectItem value="1y">Dernière année</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            {isRefreshing ? (
              <LoadingSpinner size="sm" className="mr-2" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Actualiser
          </Button>
          
          <Button variant="outline" size="sm" onClick={() => handleExport('pdf')}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Revenus"
          value={stats.formattedRevenue}
          growth={stats.revenueGrowth}
          icon={<DollarSign className="h-4 w-4" />}
          color="green"
        />
        
        <StatCard
          title="Commandes"
          value={stats.formattedOrders}
          growth={stats.ordersGrowth}
          icon={<ShoppingCart className="h-4 w-4" />}
          color="blue"
        />
        
        <StatCard
          title="Clients"
          value={stats.formattedCustomers}
          growth={stats.customersGrowth}
          icon={<Users className="h-4 w-4" />}
          color="purple"
        />
        
        <StatCard
          title="Produits"
          value={stats.formattedProducts}
          growth={stats.productsGrowth}
          icon={<Package className="h-4 w-4" />}
          color="yellow"
        />
      </div>

      {/* Tabs pour les sections du tableau de bord */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="actions">Actions</TabsTrigger>
        </TabsList>

        {/* Vue d'ensemble */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Actions rapides */}
            <div className="lg:col-span-1">
              <QuickActions />
            </div>
            
            {/* Métriques de performance */}
            <div className="lg:col-span-2">
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Target className="h-5 w-5" />
                    Métriques de performance
                  </CardTitle>
                  <CardDescription>
                    Indicateurs clés de performance de votre boutique
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Taux de conversion</span>
                        <Badge variant="secondary">{stats.performanceMetrics.conversionRate}%</Badge>
                      </div>
                      <Progress value={stats.performanceMetrics.conversionRate} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Panier moyen</span>
                        <Badge variant="secondary">{stats.formattedRevenue}</Badge>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Taux d'abandon</span>
                        <Badge variant="destructive">{stats.performanceMetrics.cartAbandonmentRate}%</Badge>
                      </div>
                      <Progress value={stats.performanceMetrics.cartAbandonmentRate} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">Durée de session</span>
                        <Badge variant="secondary">{Math.round(stats.performanceMetrics.sessionDuration / 60)}min</Badge>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        {/* Analyses */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Répartition des ventes
                </CardTitle>
                <CardDescription>
                  Distribution des ventes par catégorie
                </CardDescription>
              </CardHeader>
              <CardContent>
                {stats.topProducts.length > 0 ? (
                  <div className="space-y-3">
                    {stats.topProducts.slice(0, 5).map((product, index) => (
                      <div key={product.id} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium">{index + 1}</span>
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            <div className="text-sm text-muted-foreground">{product.category}</div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{product.salesCount} ventes</div>
                          <div className="text-sm text-muted-foreground">{product.revenue} FCFA</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Aucune donnée de vente disponible
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Statistiques clients
                </CardTitle>
                <CardDescription>
                  Informations clés sur vos clients
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Nouveaux clients</span>
                  <Badge variant="secondary">{stats.customerMetrics.newCustomers}</Badge>
                </div>
                <Progress value={stats.customerMetrics.newCustomers > 0 ? 75 : 0} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Clients fidèles</span>
                  <Badge variant="secondary">{stats.customerMetrics.returningCustomers}</Badge>
                </div>
                <Progress value={stats.customerMetrics.retentionRate} className="h-2" />
                
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Valeur vie client</span>
                  <Badge variant="secondary">{stats.customerMetrics.customerLifetimeValue} FCFA</Badge>
                </div>
                <Progress value={60} className="h-2" />
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance" className="space-y-6">
          <ConfigChecker />
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Métriques de trafic
                </CardTitle>
                <CardDescription>
                  Statistiques de visite de votre boutique
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.performanceMetrics.pageViews}</div>
                    <div className="text-sm text-muted-foreground">Pages vues</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold">{stats.performanceMetrics.bounceRate}%</div>
                    <div className="text-sm text-muted-foreground">Taux de rebond</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Objectifs
                </CardTitle>
                <CardDescription>
                  Progression vers vos objectifs mensuels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Objectif revenus</span>
                      <span className="text-sm text-muted-foreground">75%</span>
                    </div>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Objectif commandes</span>
                      <span className="text-sm text-muted-foreground">60%</span>
                    </div>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">Objectif clients</span>
                      <span className="text-sm text-muted-foreground">90%</span>
                    </div>
                    <Progress value={90} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Actions */}
        <TabsContent value="actions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <QuickActions />
            
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Gestion des données
                </CardTitle>
                <CardDescription>
                  Options de gestion de vos données
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start" onClick={() => handleExport('csv')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Exporter en CSV
                </Button>
                
                <Button variant="outline" className="w-full justify-start" onClick={() => handleExport('json')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Exporter en JSON
                </Button>
                
                <Button variant="outline" className="w-full justify-start" onClick={() => handleExport('pdf')}>
                  <FileText className="w-4 h-4 mr-2" />
                  Exporter en PDF
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdvancedDashboard;

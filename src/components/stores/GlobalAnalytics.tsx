import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  Eye,
  Calendar,
  Download,
  RefreshCw,
  Store,
  Target,
  Award,
  Clock
} from 'lucide-react';
import { useMultiStores, Store as StoreType } from '@/hooks/useMultiStores';
import { useToast } from '@/hooks/use-toast';

interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalViews: number;
  conversionRate: number;
  averageOrderValue: number;
  monthlyRevenue: number;
  weeklyRevenue: number;
  dailyRevenue: number;
  topStores: Array<{
    id: string;
    name: string;
    revenue: number;
    orders: number;
    growth: number;
  }>;
  recentOrders: Array<{
    id: string;
    storeName: string;
    customerName: string;
    amount: number;
    date: string;
  }>;
  revenueByMonth: Array<{
    month: string;
    revenue: number;
    orders: number;
  }>;
}

/**
 * Composant d'analytics globales pour toutes les boutiques
 */
export const GlobalAnalytics: React.FC = () => {
  const { stores, getStoreStats } = useMultiStores();
  const { toast } = useToast();
  
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');
  const [activeTab, setActiveTab] = useState('overview');

  // Charger les analytics
  useEffect(() => {
    loadAnalytics();
  }, [stores, timeRange]);

  const loadAnalytics = async () => {
    if (stores.length === 0) return;
    
    setLoading(true);
    try {
      // Charger les statistiques de chaque boutique
      const storeStats = await Promise.all(
        stores.map(async (store) => {
          const stats = await getStoreStats(store.id);
          return { store, stats };
        })
      );

      // Calculer les totaux
      const totalRevenue = storeStats.reduce((sum, { stats }) => sum + (stats?.totalRevenue || 0), 0);
      const totalOrders = storeStats.reduce((sum, { stats }) => sum + (stats?.totalOrders || 0), 0);
      const totalProducts = storeStats.reduce((sum, { stats }) => sum + (stats?.totalProducts || 0), 0);
      const totalViews = storeStats.reduce((sum, { stats }) => sum + (stats?.totalViews || 0), 0);
      const totalCustomers = Math.floor(totalOrders * 0.8); // Estimation

      // Calculer les revenus par période
      const monthlyRevenue = totalRevenue * 0.3;
      const weeklyRevenue = totalRevenue * 0.1;
      const dailyRevenue = totalRevenue * 0.02;

      // Top boutiques
      const topStores = storeStats
        .map(({ store, stats }) => ({
          id: store.id,
          name: store.name,
          revenue: stats?.totalRevenue || 0,
          orders: stats?.totalOrders || 0,
          growth: Math.random() * 20 - 10 // Simulation
        }))
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

      // Commandes récentes (simulation)
      const recentOrders = [
        {
          id: '1',
          storeName: stores[0]?.name || 'Boutique 1',
          customerName: 'Client A',
          amount: 15000,
          date: '2024-01-20T10:00:00Z'
        },
        {
          id: '2',
          storeName: stores[0]?.name || 'Boutique 1',
          customerName: 'Client B',
          amount: 25000,
          date: '2024-01-19T15:30:00Z'
        }
      ];

      // Revenus par mois (simulation)
      const revenueByMonth = [
        { month: 'Jan', revenue: 150000, orders: 25 },
        { month: 'Fév', revenue: 180000, orders: 30 },
        { month: 'Mar', revenue: 220000, orders: 35 },
        { month: 'Avr', revenue: 200000, orders: 32 },
        { month: 'Mai', revenue: 250000, orders: 40 },
        { month: 'Juin', revenue: 280000, orders: 45 }
      ];

      setAnalytics({
        totalRevenue,
        totalOrders,
        totalCustomers,
        totalProducts,
        totalViews,
        conversionRate: totalViews > 0 ? (totalOrders / totalViews) * 100 : 0,
        averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
        monthlyRevenue,
        weeklyRevenue,
        dailyRevenue,
        topStores,
        recentOrders,
        revenueByMonth
      });
    } catch (error) {
      console.error('Error loading analytics:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les analytics",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0
    }).format(amount);
  };

  const exportAnalytics = () => {
    if (!analytics) return;

    const csvData = [
      ['Métrique', 'Valeur'],
      ['Revenus totaux', analytics.totalRevenue.toString()],
      ['Commandes totales', analytics.totalOrders.toString()],
      ['Clients totaux', analytics.totalCustomers.toString()],
      ['Produits totaux', analytics.totalProducts.toString()],
      ['Vues totales', analytics.totalViews.toString()],
      ['Taux de conversion', `${analytics.conversionRate.toFixed(2)}%`],
      ['Valeur moyenne des commandes', analytics.averageOrderValue.toString()],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-globales-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Analytics globales</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="text-center py-12">
        <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Aucune donnée</h3>
        <p className="text-muted-foreground">
          Les analytics seront disponibles une fois que vos boutiques auront des données.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Analytics globales</h2>
          <p className="text-muted-foreground">
            Vue d'ensemble des performances de toutes vos boutiques
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadAnalytics}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Actualiser
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={exportAnalytics}
            className="gap-2"
          >
            <Download className="h-4 w-4" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Métriques principales */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Revenus</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(analytics.totalRevenue)}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <ShoppingCart className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Commandes</span>
            </div>
            <p className="text-2xl font-bold">{analytics.totalOrders.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm font-medium">Clients</span>
            </div>
            <p className="text-2xl font-bold">{analytics.totalCustomers.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Uniques</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Eye className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Vues</span>
            </div>
            <p className="text-2xl font-bold">{analytics.totalViews.toLocaleString()}</p>
            <p className="text-xs text-muted-foreground">Total</p>
          </CardContent>
        </Card>
      </div>

      {/* Métriques secondaires */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Taux de conversion</span>
            </div>
            <p className="text-2xl font-bold">{analytics.conversionRate.toFixed(2)}%</p>
            <p className="text-xs text-muted-foreground">Visiteurs → Clients</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-blue-500" />
              <span className="text-sm font-medium">Panier moyen</span>
            </div>
            <p className="text-2xl font-bold">{formatCurrency(analytics.averageOrderValue)}</p>
            <p className="text-xs text-muted-foreground">Par commande</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Package className="h-4 w-4 text-orange-500" />
              <span className="text-sm font-medium">Produits</span>
            </div>
            <p className="text-2xl font-bold">{analytics.totalProducts}</p>
            <p className="text-xs text-muted-foreground">En vente</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs pour les détails */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="stores">Boutiques</TabsTrigger>
          <TabsTrigger value="revenue">Revenus</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Top boutiques */}
            <Card>
              <CardHeader>
                <CardTitle>Top boutiques</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {analytics.topStores.map((store, index) => (
                    <div key={store.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {store.orders} commandes
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(store.revenue)}</p>
                        <div className="flex items-center gap-1 text-sm">
                          {store.growth > 0 ? (
                            <TrendingUp className="h-3 w-3 text-green-500" />
                          ) : (
                            <TrendingDown className="h-3 w-3 text-red-500" />
                          )}
                          <span className={store.growth > 0 ? 'text-green-500' : 'text-red-500'}>
                            {Math.abs(store.growth).toFixed(1)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Commandes récentes */}
            <Card>
              <CardHeader>
                <CardTitle>Commandes récentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics.recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{order.customerName}</p>
                        <p className="text-sm text-muted-foreground">
                          {order.storeName}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{formatCurrency(order.amount)}</p>
                        <p className="text-sm text-muted-foreground">
                          {new Date(order.date).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="stores" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Performance par boutique</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stores.map((store) => {
                  const storeData = analytics.topStores.find(s => s.id === store.id);
                  return (
                    <div key={store.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                          style={{ backgroundColor: store.theme_color }}
                        >
                          {store.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{store.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {store.slug}.payhuk.com
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">
                          {formatCurrency(storeData?.revenue || 0)}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {storeData?.orders || 0} commandes
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="revenue" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Évolution des revenus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.revenueByMonth.map((month) => (
                  <div key={month.month} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">{month.month}</p>
                      <p className="text-sm text-muted-foreground">
                        {month.orders} commandes
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">{formatCurrency(month.revenue)}</p>
                      <div className="w-32 bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-primary h-2 rounded-full" 
                          style={{ width: `${(month.revenue / Math.max(...analytics.revenueByMonth.map(m => m.revenue))) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

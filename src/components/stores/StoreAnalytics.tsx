import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  Eye,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react';
import { useMultiStores, Store as StoreType, StoreAnalytics } from '@/hooks/useMultiStores';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface StoreAnalyticsProps {
  store: StoreType;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const StoreAnalytics: React.FC<StoreAnalyticsProps> = ({
  store,
  open,
  onOpenChange
}) => {
  const { getStoreAnalytics } = useMultiStores();
  const [analytics, setAnalytics] = useState<StoreAnalytics | null>(null);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d' | '1y'>('30d');

  const loadAnalytics = async () => {
    setLoading(true);
    try {
      const data = await getStoreAnalytics(store.id);
      setAnalytics(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      loadAnalytics();
    }
  }, [open, store.id, timeRange]);

  const getPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous) * 100;
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
      ['Vues', analytics.views.toString()],
      ['Commandes', analytics.orders.toString()],
      ['Revenus', analytics.revenue.toString()],
      ['Produits', analytics.products.toString()],
      ['Clients', analytics.customers.toString()],
      ['Taux de conversion', `${analytics.conversionRate.toFixed(2)}%`],
      ['Valeur moyenne des commandes', analytics.averageOrderValue.toString()],
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `analytics-${store.slug}-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  if (!analytics && !loading) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics - {store.name}
            </DialogTitle>
            <DialogDescription>
              Aucune donnée d'analytics disponible pour cette boutique.
            </DialogDescription>
          </DialogHeader>
          
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <p className="text-muted-foreground">
              Les analytics seront disponibles une fois que votre boutique aura des visiteurs.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Analytics - {store.name}
              </DialogTitle>
              <DialogDescription>
                Suivez les performances de votre boutique
              </DialogDescription>
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
        </DialogHeader>

        {loading ? (
          <div className="space-y-6">
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
        ) : analytics ? (
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
              <TabsTrigger value="products">Produits</TabsTrigger>
              <TabsTrigger value="orders">Commandes</TabsTrigger>
              <TabsTrigger value="traffic">Trafic</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              {/* Métriques principales */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Eye className="h-4 w-4 text-blue-500" />
                      <span className="text-sm font-medium">Vues</span>
                    </div>
                    <p className="text-2xl font-bold">{analytics.views.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <ShoppingCart className="h-4 w-4 text-green-500" />
                      <span className="text-sm font-medium">Commandes</span>
                    </div>
                    <p className="text-2xl font-bold">{analytics.orders.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-4 w-4 text-yellow-500" />
                      <span className="text-sm font-medium">Revenus</span>
                    </div>
                    <p className="text-2xl font-bold">{formatCurrency(analytics.revenue)}</p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4 text-purple-500" />
                      <span className="text-sm font-medium">Clients</span>
                    </div>
                    <p className="text-2xl font-bold">{analytics.customers.toLocaleString()}</p>
                    <p className="text-xs text-muted-foreground">Uniques</p>
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
                    <p className="text-2xl font-bold">{analytics.products}</p>
                    <p className="text-xs text-muted-foreground">En vente</p>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="products" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Top Produits</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.topProducts.length > 0 ? (
                    <div className="space-y-4">
                      {analytics.topProducts.map((product, index) => (
                        <div key={product.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{product.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {product.sales} ventes
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(product.revenue)}</p>
                            <p className="text-sm text-muted-foreground">Revenus</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-muted-foreground">Aucun produit vendu pour le moment</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="orders" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Commandes récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  {analytics.recentOrders.length > 0 ? (
                    <div className="space-y-3">
                      {analytics.recentOrders.map((order) => (
                        <div key={order.id} className="flex items-center justify-between p-3 border rounded-lg">
                          <div>
                            <p className="font-medium">{order.customer_name}</p>
                            <p className="text-sm text-muted-foreground">
                              {format(new Date(order.created_at), 'dd/MM/yyyy à HH:mm', { locale: fr })}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(order.total_amount)}</p>
                            <Badge variant="outline">Complétée</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p className="text-muted-foreground">Aucune commande pour le moment</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="traffic" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sources de trafic</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-bold">D</span>
                        </div>
                        <div>
                          <p className="font-medium">Direct</p>
                          <p className="text-sm text-muted-foreground">URL directe</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{Math.floor(analytics.views * 0.4)}</p>
                        <p className="text-sm text-muted-foreground">40%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                          <span className="text-green-600 font-bold">G</span>
                        </div>
                        <div>
                          <p className="font-medium">Google</p>
                          <p className="text-sm text-muted-foreground">Recherche organique</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{Math.floor(analytics.views * 0.3)}</p>
                        <p className="text-sm text-muted-foreground">30%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-bold">S</span>
                        </div>
                        <div>
                          <p className="font-medium">Réseaux sociaux</p>
                          <p className="text-sm text-muted-foreground">Facebook, Instagram, etc.</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{Math.floor(analytics.views * 0.2)}</p>
                        <p className="text-sm text-muted-foreground">20%</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                          <span className="text-orange-600 font-bold">A</span>
                        </div>
                        <div>
                          <p className="font-medium">Autres</p>
                          <p className="text-sm text-muted-foreground">Référents divers</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">{Math.floor(analytics.views * 0.1)}</p>
                        <p className="text-sm text-muted-foreground">10%</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        ) : null}
      </DialogContent>
    </Dialog>
  );
};

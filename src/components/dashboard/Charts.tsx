import React, { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Calendar,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { motion } from 'framer-motion';

// Types pour les données des graphiques
interface ChartData {
  label: string;
  value: number;
  color?: string;
  percentage?: number;
}

interface RevenueData {
  month: string;
  revenue: number;
  orders: number;
  customers: number;
}

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  totalAmount: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  createdAt: string;
  itemsCount: number;
}

// Composant pour le graphique de revenus
export const RevenueChart: React.FC<{ data: RevenueData[] }> = ({ data }) => {
  const maxRevenue = useMemo(() => {
    return Math.max(...data.map(d => d.revenue), 1);
  }, [data]);

  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucune donnée de revenus disponible</p>
          <p className="text-sm">Les revenus apparaîtront ici une fois que vous aurez des ventes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Évolution des revenus</h3>
          <p className="text-sm text-muted-foreground">
            {data.length} mois de données
          </p>
        </div>
        <Badge variant="secondary">
          {data.reduce((sum, d) => sum + d.revenue, 0).toLocaleString()} FCFA
        </Badge>
      </div>
      
      <div className="space-y-3">
        {data.map((item, index) => (
          <motion.div
            key={item.month}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">{item.month}</span>
              <span className="text-muted-foreground">
                {item.revenue.toLocaleString()} FCFA
              </span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(item.revenue / maxRevenue) * 100}%` }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
              />
            </div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>{item.orders} commandes</span>
              <span>{item.customers} clients</span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Composant pour le graphique des ventes
export const SalesChart: React.FC<{ data: OrderData[] }> = ({ data }) => {
  const salesByDay = useMemo(() => {
    const salesMap = new Map<string, number>();
    
    data.forEach(order => {
      const date = new Date(order.createdAt).toLocaleDateString('fr-FR', {
        day: '2-digit',
        month: '2-digit'
      });
      salesMap.set(date, (salesMap.get(date) || 0) + 1);
    });
    
    return Array.from(salesMap.entries())
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-7); // 7 derniers jours
  }, [data]);

  const maxSales = useMemo(() => {
    return Math.max(...salesByDay.map(d => d.count), 1);
  }, [salesByDay]);

  if (salesByDay.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucune donnée de vente disponible</p>
          <p className="text-sm">Les ventes apparaîtront ici une fois que vous aurez des commandes</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Ventes par jour</h3>
          <p className="text-sm text-muted-foreground">
            {salesByDay.length} derniers jours
          </p>
        </div>
        <Badge variant="secondary">
          {salesByDay.reduce((sum, d) => sum + d.count, 0)} ventes
        </Badge>
      </div>
      
      <div className="grid grid-cols-7 gap-2">
        {salesByDay.map((day, index) => (
          <motion.div
            key={day.date}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="text-center text-xs text-muted-foreground">
              {day.date}
            </div>
            <div className="relative h-32 bg-muted rounded">
              <motion.div
                className="absolute bottom-0 left-0 right-0 bg-primary rounded"
                initial={{ height: 0 }}
                animate={{ height: `${(day.count / maxSales) * 100}%` }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
              />
              <div className="absolute inset-0 flex items-end justify-center pb-2">
                <span className="text-xs font-medium text-primary-foreground">
                  {day.count}
                </span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Composant pour le graphique des produits populaires
export const TopProductsChart: React.FC<{ data: any[] }> = ({ data }) => {
  const topProducts = useMemo(() => {
    return data
      .sort((a, b) => b.salesCount - a.salesCount)
      .slice(0, 5);
  }, [data]);

  const maxSales = useMemo(() => {
    return Math.max(...topProducts.map(p => p.salesCount), 1);
  }, [topProducts]);

  if (topProducts.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <Package className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucun produit vendu</p>
          <p className="text-sm">Les produits populaires apparaîtront ici</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Produits populaires</h3>
          <p className="text-sm text-muted-foreground">
            Top {topProducts.length} des ventes
          </p>
        </div>
        <Badge variant="secondary">
          {topProducts.reduce((sum, p) => sum + p.salesCount, 0)} ventes
        </Badge>
      </div>
      
      <div className="space-y-3">
        {topProducts.map((product, index) => (
          <motion.div
            key={product.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="space-y-2"
          >
            <div className="flex items-center justify-between">
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
                <div className="text-sm text-muted-foreground">
                  {product.revenue.toLocaleString()} FCFA
                </div>
              </div>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <motion.div
                className="bg-primary h-2 rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${(product.salesCount / maxSales) * 100}%` }}
                transition={{ delay: index * 0.1 + 0.2, duration: 0.5 }}
              />
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

// Composant pour les commandes récentes
export const RecentOrdersCard: React.FC<{ orders: OrderData[] }> = ({ orders }) => {
  const recentOrders = useMemo(() => {
    return orders
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [orders]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'processing': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
      case 'shipped': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400';
      case 'delivered': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente';
      case 'processing': return 'En cours';
      case 'shipped': return 'Expédiée';
      case 'delivered': return 'Livrée';
      case 'cancelled': return 'Annulée';
      default: return status;
    }
  };

  if (recentOrders.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-muted-foreground">
        <div className="text-center">
          <ShoppingCart className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>Aucune commande récente</p>
          <p className="text-sm">Les commandes apparaîtront ici</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {recentOrders.map((order, index) => (
        <motion.div
          key={order.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
          className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors"
        >
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
              <ShoppingCart className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{order.orderNumber}</div>
              <div className="text-sm text-muted-foreground">
                {order.customerName} • {order.itemsCount} article{order.itemsCount > 1 ? 's' : ''}
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <div className="font-medium">
              {order.totalAmount.toLocaleString()} FCFA
            </div>
            <div className="flex items-center space-x-2">
              <Badge className={getStatusColor(order.status)}>
                {getStatusText(order.status)}
              </Badge>
              <div className="text-xs text-muted-foreground">
                {new Date(order.createdAt).toLocaleDateString('fr-FR')}
              </div>
            </div>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Composant pour les métriques de performance
export const PerformanceMetrics: React.FC<{ stats: any }> = ({ stats }) => {
  const metrics = [
    {
      title: 'Taux de conversion',
      value: stats.performanceMetrics.conversionRate,
      target: 3.0,
      icon: <TrendingUp className="h-4 w-4" />,
      color: 'green'
    },
    {
      title: 'Panier moyen',
      value: stats.performanceMetrics.averageOrderValue,
      target: 50000,
      icon: <DollarSign className="h-4 w-4" />,
      color: 'blue'
    },
    {
      title: 'Taux d\'abandon',
      value: stats.performanceMetrics.cartAbandonmentRate,
      target: 60,
      icon: <ShoppingCart className="h-4 w-4" />,
      color: 'red',
      reverse: true // Plus bas est mieux
    },
    {
      title: 'Durée de session',
      value: Math.round(stats.performanceMetrics.sessionDuration / 60),
      target: 3,
      icon: <Clock className="h-4 w-4" />,
      color: 'purple'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {metrics.map((metric, index) => {
        const percentage = metric.reverse 
          ? Math.max(0, 100 - (metric.value / metric.target) * 100)
          : (metric.value / metric.target) * 100;
        
        const isGood = metric.reverse 
          ? percentage > 50 
          : percentage > 50;

        return (
          <motion.div
            key={metric.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-sm">
                  {metric.icon}
                  {metric.title}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold">
                    {metric.title.includes('Durée') ? `${metric.value}min` : 
                     metric.title.includes('Panier') ? `${metric.value.toLocaleString()} FCFA` :
                     `${metric.value}%`}
                  </div>
                  <Badge variant={isGood ? 'default' : 'secondary'}>
                    {isGood ? 'Bon' : 'À améliorer'}
                  </Badge>
                </div>
                
                <Progress 
                  value={Math.min(percentage, 100)} 
                  className="h-2"
                />
                
                <div className="text-xs text-muted-foreground">
                  Objectif: {metric.target}{metric.title.includes('Panier') ? ' FCFA' : 
                            metric.title.includes('Durée') ? 'min' : '%'}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        );
      })}
    </div>
  );
};

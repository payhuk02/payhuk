import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { 
  Target, 
  TrendingUp, 
  Clock, 
  Users, 
  ShoppingCart,
  DollarSign,
  Package,
  Eye
} from "lucide-react";

interface PerformanceMetricsProps {
  stats: {
    totalProducts: number;
    activeProducts: number;
    totalOrders: number;
    pendingOrders: number;
    totalCustomers: number;
    totalRevenue: number;
  };
}

export const PerformanceMetrics = ({ stats }: PerformanceMetricsProps) => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  // Calculs des métriques
  const conversionRate = stats.totalCustomers > 0 ? (stats.totalOrders / stats.totalCustomers) * 100 : 0;
  const averageOrderValue = stats.totalOrders > 0 ? stats.totalRevenue / stats.totalOrders : 0;
  const productActivationRate = stats.totalProducts > 0 ? (stats.activeProducts / stats.totalProducts) * 100 : 0;
  const orderCompletionRate = stats.totalOrders > 0 ? ((stats.totalOrders - stats.pendingOrders) / stats.totalOrders) * 100 : 0;

  const metrics = [
    {
      title: "Taux de conversion",
      value: `${conversionRate.toFixed(1)}%`,
      description: "Commandes par client",
      icon: Target,
      progress: conversionRate,
      color: "text-blue-600",
      bgColor: "bg-blue-100"
    },
    {
      title: "Panier moyen",
      value: formatCurrency(averageOrderValue),
      description: "Valeur moyenne des commandes",
      icon: ShoppingCart,
      progress: Math.min((averageOrderValue / 50000) * 100, 100), // Basé sur 50k FCFA max
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      title: "Produits actifs",
      value: `${productActivationRate.toFixed(1)}%`,
      description: "Pourcentage de produits en vente",
      icon: Package,
      progress: productActivationRate,
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      title: "Taux de finalisation",
      value: `${orderCompletionRate.toFixed(1)}%`,
      description: "Commandes finalisées",
      icon: CheckCircle,
      progress: orderCompletionRate,
      color: "text-orange-600",
      bgColor: "bg-orange-100"
    }
  ];

  const kpis = [
    {
      label: "Revenus totaux",
      value: formatCurrency(stats.totalRevenue),
      icon: DollarSign,
      trend: "+12.5%",
      trendColor: "text-green-600"
    },
    {
      label: "Commandes totales",
      value: formatNumber(stats.totalOrders),
      icon: ShoppingCart,
      trend: "+8.2%",
      trendColor: "text-green-600"
    },
    {
      label: "Clients actifs",
      value: formatNumber(stats.totalCustomers),
      icon: Users,
      trend: "+15.3%",
      trendColor: "text-green-600"
    },
    {
      label: "Produits en stock",
      value: formatNumber(stats.totalProducts),
      icon: Package,
      trend: `${stats.activeProducts} actifs`,
      trendColor: "text-blue-600"
    }
  ];

  return (
    <div className="space-y-6">
      {/* KPIs Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((kpi, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {kpi.label}
                  </p>
                  <p className="text-2xl font-bold">
                    {kpi.value}
                  </p>
                  <p className={`text-xs ${kpi.trendColor}`}>
                    {kpi.trend}
                  </p>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <kpi.icon className="h-4 w-4 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm">
                <metric.icon className="h-4 w-4" />
                {metric.title}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold">{metric.value}</span>
                <Badge variant="secondary" className={metric.bgColor}>
                  <span className={metric.color}>
                    {metric.progress.toFixed(1)}%
                  </span>
                </Badge>
              </div>
              <Progress value={metric.progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {metric.description}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Performance Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Résumé des performances
          </CardTitle>
          <CardDescription>
            Vue d'ensemble des indicateurs clés
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-green-50 border border-green-200">
              <div className="text-2xl font-bold text-green-600">
                {conversionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-green-700">Taux de conversion</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-blue-50 border border-blue-200">
              <div className="text-2xl font-bold text-blue-600">
                {formatCurrency(averageOrderValue)}
              </div>
              <div className="text-sm text-blue-700">Panier moyen</div>
            </div>
            <div className="text-center p-4 rounded-lg bg-purple-50 border border-purple-200">
              <div className="text-2xl font-bold text-purple-600">
                {orderCompletionRate.toFixed(1)}%
              </div>
              <div className="text-sm text-purple-700">Finalisation</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

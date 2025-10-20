import { useState, useEffect, memo, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  Wifi,
  WifiOff
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useStore } from "@/hooks/useStore";
import { useResponsive } from "@/hooks/useResponsive";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { SkeletonCard, SkeletonChart } from "@/components/ui/skeleton-cards";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { FadeIn, StaggerContainer } from "@/components/ui/animations";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { RecentOrdersCard } from "@/components/dashboard/RecentOrdersCard";
import { TopProductsCard } from "@/components/dashboard/TopProductsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import { ExportData } from "@/components/dashboard/ExportData";

interface DashboardContentProps {
  store: any;
  isTablet: boolean;
}

const DashboardContent = memo(({ store, isTablet }: DashboardContentProps) => {
  const { stats, loading: statsLoading, refetch } = useDashboardStats();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showExport, setShowExport] = useState(false);

  // Mises à jour en temps réel
  const { isActive: isRealTimeActive } = useRealTimeUpdates({
    interval: 30000,
    enabled: !!store,
    onUpdate: () => {
      refetch();
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatCurrency = useMemo(() => (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }, []);

  const formatNumber = useMemo(() => (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  }, []);

  const getGrowthIcon = useMemo(() => (growth: number) => {
    return growth >= 0 ? ArrowUpRight : ArrowDownRight;
  }, []);

  if (statsLoading) {
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
        
        <StaggerContainer className={`grid gap-6 ${isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`} staggerDelay={100}>
          {[...Array(4)].map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </StaggerContainer>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <SkeletonChart />
          <SkeletonChart />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tableau de bord</h1>
          <p className="text-muted-foreground">
            Vue d'ensemble de votre boutique • {store.name}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Indicateur de mise à jour en temps réel */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {isRealTimeActive ? (
              <div className="flex items-center gap-1 text-green-600">
                <Wifi className="h-3 w-3" />
                <span>En direct</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 text-gray-500">
                <WifiOff className="h-3 w-3" />
                <span>Hors ligne</span>
              </div>
            )}
          </div>
          
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
          <Button variant="outline" size="sm" onClick={() => setShowExport(true)}>
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <StaggerContainer className={`grid gap-6 ${isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`} staggerDelay={150}>
        {/* Revenue */}
        <FadeIn delay={0}>
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(stats.totalRevenue)}
              </div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600">+12.5%</span>
                <span className="ml-1">vs mois dernier</span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Orders */}
        <FadeIn delay={100}>
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Commandes</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalOrders)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600">+8.2%</span>
                <span className="ml-1">vs mois dernier</span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Customers */}
        <FadeIn delay={200}>
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clients</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalCustomers)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600">+15.3%</span>
                <span className="ml-1">vs mois dernier</span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>

        {/* Products */}
        <FadeIn delay={300}>
          <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produits</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalProducts)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <span className="text-green-500">{stats.activeProducts} actifs</span>
              </div>
            </CardContent>
          </Card>
        </FadeIn>
      </StaggerContainer>

      {/* Tabs for Dashboard Sections */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="analytics">Analyses</TabsTrigger>
          <TabsTrigger value="activity">Activité</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className={`grid gap-6 ${isTablet ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            {/* Revenue Chart */}
            <FadeIn delay={0}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Évolution des revenus
                  </CardTitle>
                  <CardDescription>
                    Revenus générés sur la période sélectionnée.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={stats.revenueByMonth} />
                </CardContent>
              </Card>
            </FadeIn>

            {/* Sales Chart */}
            <FadeIn delay={100}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Ventes par jour
                  </CardTitle>
                  <CardDescription>
                    Nombre de commandes passées chaque jour.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesChart data={stats.recentOrders} />
                </CardContent>
              </Card>
            </FadeIn>
          </div>

          <div className={`grid gap-6 ${isTablet ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
            {/* Recent Orders */}
            <FadeIn delay={200}>
              <Card className={`${isTablet ? '' : 'lg:col-span-2'} hover:shadow-lg transition-shadow duration-300`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Commandes récentes
                  </CardTitle>
                  <CardDescription>
                    Les 5 dernières commandes passées sur votre boutique.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentOrdersCard orders={stats.recentOrders} />
                </CardContent>
              </Card>
            </FadeIn>

            {/* Quick Actions */}
            <FadeIn delay={300}>
              <QuickActions />
            </FadeIn>
          </div>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className={`grid gap-6 ${isTablet ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
            <FadeIn delay={0}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Répartition des ventes
                  </CardTitle>
                  <CardDescription>
                    Distribution des ventes par catégorie de produits.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TopProductsChart data={stats.topProducts} />
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={100}>
              <Card className="hover:shadow-lg transition-shadow duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Statistiques clients
                  </CardTitle>
                  <CardDescription>
                    Informations clés sur vos clients.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Nouveaux clients</span>
                    <Badge variant="secondary">+15%</Badge>
                  </div>
                  <Progress value={75} className="h-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Clients fidèles</span>
                    <Badge variant="secondary">60%</Badge>
                  </div>
                  <Progress value={60} className="h-2" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Taux de rétention</span>
                    <Badge variant="secondary">80%</Badge>
                  </div>
                  <Progress value={80} className="h-2" />
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </TabsContent>

        {/* Activity Tab */}
        <TabsContent value="activity" className="space-y-6">
          <FadeIn delay={0}>
            <ActivityFeed />
          </FadeIn>
        </TabsContent>

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <FadeIn delay={0}>
            <PerformanceMetrics stats={stats} />
          </FadeIn>
          <FadeIn delay={100}>
            <ExportData onClose={() => setShowExport(false)} />
          </FadeIn>
        </TabsContent>
      </Tabs>
    </div>
  );
});

DashboardContent.displayName = 'DashboardContent';

export default DashboardContent;

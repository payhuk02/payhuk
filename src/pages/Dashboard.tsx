import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
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
  Eye,
  Download,
  RefreshCw,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  AlertCircle,
  CheckCircle,
  Clock,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  MoreHorizontal,
  Wifi,
  WifiOff
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useStore } from "@/hooks/useStore";
import { useResponsive } from "@/hooks/useResponsive";
import { useRealTimeUpdates } from "@/hooks/useRealTimeUpdates";
import { Skeleton } from "@/components/ui/skeleton";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { TopProductsChart } from "@/components/dashboard/TopProductsChart";
import { RecentOrdersCard } from "@/components/dashboard/RecentOrdersCard";
import { TopProductsCard } from "@/components/dashboard/TopProductsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import { ExportData } from "@/components/dashboard/ExportData";
import DashboardMobile from "@/components/dashboard/DashboardMobile";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const Dashboard = () => {
  const { store, loading: storeLoading } = useStore();
  const { stats, loading: statsLoading, refetch } = useDashboardStats();
  const { isMobile, isTablet } = useResponsive();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState("7d");
  const [showExport, setShowExport] = useState(false);

  // Mises à jour en temps réel
  const { isActive: isRealTimeActive } = useRealTimeUpdates({
    interval: 30000, // 30 secondes
    enabled: !!store, // Seulement si une boutique existe
    onUpdate: () => {
      refetch();
    }
  });

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await refetch();
    setTimeout(() => setIsRefreshing(false), 1000);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('fr-FR').format(num);
  };

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? "text-green-600" : "text-red-600";
  };

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? ArrowUpRight : ArrowDownRight;
  };

  if (storeLoading || statsLoading) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 p-6 space-y-6">
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <Card key={i}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-16 mb-2" />
                  <Skeleton className="h-3 w-20" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!store) {
    return (
      <SidebarProvider>
        <AppSidebar />
        <div className="flex-1 flex items-center justify-center p-6">
          <Card className="w-full max-w-md text-center">
            <CardHeader>
              <CardTitle className="flex items-center justify-center gap-2">
                <Star className="h-6 w-6 text-yellow-500" />
                Bienvenue sur Payhuk !
              </CardTitle>
              <CardDescription>
                Commencez par créer votre boutique pour accéder au tableau de bord complet
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-6xl">🎉</div>
              <p className="text-sm text-muted-foreground">
                Créez votre première boutique et découvrez toutes les fonctionnalités avancées de Payhuk
              </p>
              <Button className="w-full" size="lg">
                Créer ma boutique
              </Button>
            </CardContent>
          </Card>
        </div>
      </SidebarProvider>
    );
  }

  // Affichage mobile optimisé
  if (isMobile) {
    return <DashboardMobile />;
  }

  return (
    <SidebarProvider>
        <AppSidebar />
      <div className="flex-1 p-6 space-y-6">
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
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
            <Button variant="outline" size="sm" onClick={() => setShowExport(true)}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={`grid gap-6 ${isTablet ? 'grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'}`}>
          {/* Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Revenus</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <TrendingUp className="h-3 w-3 mr-1 text-green-600" />
                <span className="text-green-600">+12.5%</span>
                <span className="ml-1">vs mois dernier</span>
              </div>
            </CardContent>
          </Card>

          {/* Orders */}
          <Card>
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

          {/* Customers */}
          <Card>
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

          {/* Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Produits</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatNumber(stats.totalProducts)}</div>
              <div className="flex items-center text-xs text-muted-foreground">
                <Badge variant="secondary" className="text-xs">
                  {stats.activeProducts} actifs
                </Badge>
              </div>
            </CardContent>
          </Card>
                </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="analytics">Analyses</TabsTrigger>
            <TabsTrigger value="activity">Activité</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className={`grid gap-6 ${isTablet ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
              {/* Revenue Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    Évolution des revenus
                  </CardTitle>
                  <CardDescription>
                    Revenus des 30 derniers jours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={stats.revenueByMonth} />
                </CardContent>
              </Card>

              {/* Sales Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Commandes par jour
                  </CardTitle>
                  <CardDescription>
                    Volume de commandes des 7 derniers jours
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <SalesChart data={stats.recentOrders} />
                </CardContent>
              </Card>
            </div>

            <div className={`grid gap-6 ${isTablet ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-3'}`}>
              {/* Recent Orders */}
              <Card className={`${isTablet ? '' : 'lg:col-span-2'}`}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Commandes récentes
                  </CardTitle>
                  <CardDescription>
                    Dernières commandes reçues
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <RecentOrdersCard orders={stats.recentOrders} />
                </CardContent>
              </Card>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Star className="h-5 w-5" />
                    Produits populaires
                  </CardTitle>
                  <CardDescription>
                    Meilleurs vendeurs
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TopProductsCard products={stats.topProducts} />
                </CardContent>
              </Card>
                </div>

            {/* Quick Actions */}
            <QuickActions />
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className={`grid gap-6 ${isTablet ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChart className="h-5 w-5" />
                    Répartition des ventes
                  </CardTitle>
                  <CardDescription>
                    Par catégorie de produits
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <TopProductsChart products={stats.topProducts} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5" />
                    Métriques de performance
                  </CardTitle>
                  <CardDescription>
                    Indicateurs clés de performance
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <PerformanceMetrics stats={stats} />
                </CardContent>
              </Card>
              </div>
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <ActivityFeed />
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <PerformanceMetrics stats={stats} />
            <ExportData onClose={() => setShowExport(false)} />
          </TabsContent>
        </Tabs>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
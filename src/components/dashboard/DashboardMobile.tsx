import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Package,
  Download,
  RefreshCw,
  BarChart3,
  Activity,
  Clock,
  Star,
  Menu,
  ChevronDown
} from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useStore } from "@/hooks/useStore";
import { Skeleton } from "@/components/ui/skeleton";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { SalesChart } from "@/components/dashboard/SalesChart";
import { RecentOrdersCard } from "@/components/dashboard/RecentOrdersCard";
import { TopProductsCard } from "@/components/dashboard/TopProductsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { ActivityFeed } from "@/components/dashboard/ActivityFeed";
import { PerformanceMetrics } from "@/components/dashboard/PerformanceMetrics";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

const DashboardMobile = () => {
  const { store, loading: storeLoading } = useStore();
  const { stats, loading: statsLoading, refetch } = useDashboardStats();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

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

  if (storeLoading || statsLoading) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32" />
          <Skeleton className="h-8 w-8" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-3">
                <Skeleton className="h-4 w-16 mb-2" />
                <Skeleton className="h-6 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="p-4">
        <Card className="text-center">
          <CardHeader>
            <CardTitle className="flex items-center justify-center gap-2">
              <Star className="h-5 w-5 text-yellow-500" />
              Bienvenue !
            </CardTitle>
            <CardDescription>
              Créez votre boutique pour commencer
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-4xl">🎉</div>
            <Button className="w-full" size="lg">
              Créer ma boutique
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header avec menu hamburger */}
      <div className="flex items-center justify-between p-4 border-b bg-background">
        <MobileMenu>
          <div />
        </MobileMenu>
        <h1 className="text-xl font-bold">Tableau de bord</h1>
        <Button
          variant="outline"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {/* Contenu principal */}
      <div className="p-4 space-y-4">

      {/* Stats Cards Mobile */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Revenus</p>
                <p className="text-lg font-bold">{formatCurrency(stats.totalRevenue)}</p>
                <p className="text-xs text-green-600">+12.5%</p>
              </div>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Commandes</p>
                <p className="text-lg font-bold">{formatNumber(stats.totalOrders)}</p>
                <p className="text-xs text-green-600">+8.2%</p>
              </div>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Clients</p>
                <p className="text-lg font-bold">{formatNumber(stats.totalCustomers)}</p>
                <p className="text-xs text-green-600">+15.3%</p>
              </div>
              <Users className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Produits</p>
                <p className="text-lg font-bold">{formatNumber(stats.totalProducts)}</p>
                <Badge variant="secondary" className="text-xs">
                  {stats.activeProducts} actifs
                </Badge>
              </div>
              <Package className="h-4 w-4 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Mobile Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="text-xs">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="analytics" className="text-xs">Analyses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Revenue Chart Mobile */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Revenus
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={stats.revenueByMonth} />
            </CardContent>
          </Card>

          {/* Recent Orders Mobile */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Commandes récentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecentOrdersCard orders={stats.recentOrders} />
            </CardContent>
          </Card>

          {/* Top Products Mobile */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Star className="h-4 w-4" />
                Produits populaires
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TopProductsCard products={stats.topProducts} />
            </CardContent>
          </Card>

          {/* Quick Actions Mobile */}
          <QuickActions />
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Sales Chart Mobile */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Activity className="h-4 w-4" />
                Ventes par jour
              </CardTitle>
            </CardHeader>
            <CardContent>
              <SalesChart data={stats.recentOrders} />
            </CardContent>
          </Card>

          {/* Performance Metrics Mobile */}
          <PerformanceMetrics stats={stats} />

          {/* Activity Feed Mobile */}
          <ActivityFeed />
        </TabsContent>
      </Tabs>
      </div>
    </div>
  );
};

export default DashboardMobile;

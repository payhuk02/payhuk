import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, Clock } from "lucide-react";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { useStore } from "@/hooks/use-store";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentOrdersCard } from "@/components/dashboard/RecentOrdersCard";
import { TopProductsCard } from "@/components/dashboard/TopProductsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const Dashboard = () => {
  const { store, loading: storeLoading } = useStore();
  const { stats, loading } = useDashboardStats();
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <header className="sticky top-0 z-10 border-b bg-card shadow-soft">
            <div className="flex h-12 sm:h-14 md:h-16 items-center gap-2 sm:gap-4 px-2 sm:px-3 md:px-4 lg:px-6">
              <SidebarTrigger className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10" />
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate">{t("dashboard.title")}</h1>
              </div>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6 xl:p-8 bg-gradient-hero overflow-x-hidden">
            {storeLoading || loading ? (
              <div className="flex items-center justify-center h-48 sm:h-64">
                <div className="text-center">
                  <div className="inline-block h-6 w-6 sm:h-8 sm:w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                  <p className="mt-2 text-sm sm:text-base text-muted-foreground">{t("common.loading")}</p>
                </div>
              </div>
            ) : !store ? (
              <div className="max-w-3xl mx-auto text-center py-8 sm:py-12 px-4">
                <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4">{t("dashboard.welcome")} 🎉</h2>
                <p className="text-sm sm:text-base text-muted-foreground mb-4 sm:mb-6">
                  {t("dashboard.description")}
                </p>
                <Button onClick={() => navigate("/dashboard/store")} className="w-full sm:w-auto">
                  {t("dashboard.createStore")}
                </Button>
              </div>
            ) : (
              <div className="w-full max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-6 animate-fade-in">
                {/* Stats Grid */}
                <div className="grid gap-2 sm:gap-3 md:gap-4 grid-cols-1 xs:grid-cols-2 lg:grid-cols-4">
                  <StatsCard
                    title="Produits"
                    value={stats.totalProducts}
                    description={`${stats.activeProducts} actif${stats.activeProducts > 1 ? "s" : ""}`}
                    icon={Package}
                  />
                  <StatsCard
                    title="Commandes"
                    value={stats.totalOrders}
                    description={`${stats.pendingOrders} en attente`}
                    icon={ShoppingCart}
                  />
                  <StatsCard
                    title="Clients"
                    value={stats.totalCustomers}
                    description="Clients enregistrés"
                    icon={Users}
                  />
                  <StatsCard
                    title="Revenus"
                    value={`${stats.totalRevenue.toLocaleString()} FCFA`}
                    description="Total des ventes"
                    icon={DollarSign}
                  />
                </div>

                {/* Quick Actions */}
                <QuickActions />

                {/* Recent Activity Grid */}
                <div className="grid gap-3 sm:gap-4 md:gap-6 grid-cols-1 lg:grid-cols-2">
                  <RecentOrdersCard orders={stats.recentOrders} />
                  <TopProductsCard products={stats.topProducts} />
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;

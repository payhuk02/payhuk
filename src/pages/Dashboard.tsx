import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { useStore } from "@/hooks/useStore";
import { useDashboardStats } from "@/hooks/useDashboardStats";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { RecentOrdersCard } from "@/components/dashboard/RecentOrdersCard";
import { TopProductsCard } from "@/components/dashboard/TopProductsCard";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard = () => {
  const { store, loading: storeLoading } = useStore();
  const { stats, loading } = useDashboardStats();
  const navigate = useNavigate();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        <SidebarInset>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            <div className="flex items-center justify-between">
              <h1 className="text-3xl font-bold tracking-tight">
                Tableau de bord
              </h1>
            </div>

            {loading || storeLoading ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                  <p className="text-muted-foreground">Chargement...</p>
                </div>
              </div>
            ) : !store ? (
              <div className="flex items-center justify-center h-64">
                <div className="text-center">
                  <h2 className="text-2xl font-bold mb-4">Bienvenue ! 🎉</h2>
                  <p className="text-muted-foreground mb-6">
                    Commencez par créer votre boutique pour accéder au tableau de bord
                  </p>
                  <Button onClick={() => navigate("/dashboard/store")}>
                    Créer ma boutique
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <StatsCards stats={stats} />
                <div className="grid gap-6 md:grid-cols-2">
                  <QuickActions />
                  <RecentOrdersCard orders={stats.recentOrders} />
                </div>
                <TopProductsCard products={stats.topProducts} />
              </div>
            )}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
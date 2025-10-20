import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useResponsive } from "@/hooks/useResponsive";
import { SkeletonCard, SkeletonChart } from "@/components/ui/skeleton-cards";
import { StaggerContainer } from "@/components/ui/animations";
import DashboardContent from "@/components/dashboard/DashboardContent";
import DashboardMobile from "@/components/dashboard/DashboardMobile";

const Dashboard = () => {
  const { store, loading: storeLoading } = useStore();
  const { isMobile, isTablet } = useResponsive();

  if (storeLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          {/* Sidebar Desktop */}
          <div className="hidden md:block">
            <AppSidebar />
          </div>
          
          {/* Contenu principal */}
          <div className="flex-1 flex flex-col">
            {/* Header avec menu mobile */}
            <div className="flex items-center justify-between p-4 border-b bg-background md:hidden">
              <MobileMenu>
                <div />
              </MobileMenu>
              <h1 className="text-xl font-bold">Tableau de bord</h1>
              <div className="w-10" />
            </div>
            
            {/* Contenu du dashboard avec skeleton */}
            <div className="flex-1 p-6 space-y-6">
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
              
              <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" staggerDelay={100}>
                {[...Array(4)].map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </StaggerContainer>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <SkeletonChart />
                <SkeletonChart />
              </div>
            </div>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!store) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          {/* Sidebar Desktop */}
          <div className="hidden md:block">
            <AppSidebar />
          </div>
          
          {/* Contenu principal */}
          <div className="flex-1 flex flex-col">
            {/* Header avec menu mobile */}
            <div className="flex items-center justify-between p-4 border-b bg-background md:hidden">
              <MobileMenu>
                <div />
              </MobileMenu>
              <h1 className="text-xl font-bold">Tableau de bord</h1>
              <div className="w-10" />
            </div>
            
            {/* Contenu de bienvenue */}
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
          </div>
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
      <div className="flex min-h-screen w-full">
        {/* Sidebar Desktop */}
        <div className="hidden md:block">
          <AppSidebar />
        </div>
        
        {/* Contenu principal */}
        <div className="flex-1 flex flex-col">
          {/* Header avec menu mobile */}
          <div className="flex items-center justify-between p-4 border-b bg-background md:hidden">
            <MobileMenu>
              <div />
            </MobileMenu>
            <h1 className="text-xl font-bold">Tableau de bord</h1>
            <div className="w-10" />
          </div>
          
          {/* Contenu du dashboard */}
          <div className="flex-1 p-6">
            <DashboardContent store={store} isTablet={isTablet} />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
import { useState, useEffect } from "react";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { MobileMenu } from "@/components/navigation/MobileMenu";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, Plus, Play } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useResponsive } from "@/hooks/useResponsive";
import { SkeletonCard, SkeletonChart } from "@/components/ui/skeleton-cards";
import { StaggerContainer } from "@/components/ui/animations";
import AdvancedDashboard from "@/components/dashboard/AdvancedDashboard";
import DashboardMobile from "@/components/dashboard/DashboardMobile";
import { useAuth } from "@/hooks/useAuth";
import { useNotification } from "@/components/ui/NotificationContainer";
import { motion } from "framer-motion";

const Dashboard = () => {
  const { user } = useAuth();
  const { store, loading: storeLoading } = useStore();
  const { isMobile, isTablet } = useResponsive();
  const { showInfo } = useNotification();

  // État pour gérer l'affichage du tableau de bord
  const [showWelcome, setShowWelcome] = useState(false);

  // Vérifier si c'est un nouvel utilisateur (pas de boutique)
  useEffect(() => {
    if (!storeLoading && !store) {
      setShowWelcome(true);
    } else {
      setShowWelcome(false);
    }
  }, [store, storeLoading]);

  // Affichage de chargement
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

  // Affichage de bienvenue pour nouveaux utilisateurs
  if (showWelcome) {
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
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="w-full max-w-2xl"
              >
                <Card className="text-center">
                  <CardHeader className="pb-4">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                      className="mx-auto w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4"
                    >
                      <Star className="h-10 w-10 text-primary" />
                    </motion.div>
                    <CardTitle className="text-2xl font-bold">
                      Bienvenue sur Payhuk, {user?.name} ! 🎉
                    </CardTitle>
                    <CardDescription className="text-base">
                      Votre tableau de bord est vide car vous venez de commencer. 
                      Créez votre première boutique pour découvrir toutes les fonctionnalités avancées.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground">
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center justify-center mx-auto">
                          <Plus className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Créez votre boutique</div>
                          <div>Configurez votre première boutique</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/20 rounded-lg flex items-center justify-center mx-auto">
                          <Star className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Ajoutez des produits</div>
                          <div>Créez votre catalogue de produits</div>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <div className="w-12 h-12 bg-purple-50 dark:bg-purple-900/20 rounded-lg flex items-center justify-center mx-auto">
                          <Play className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium text-foreground">Commencez à vendre</div>
                          <div>Recevez vos premières commandes</div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Button 
                        size="lg"
                        onClick={() => window.location.href = '/dashboard/store'}
                        className="flex-1"
                      >
                        <Plus className="w-4 h-4 mr-2" />
                        Créer ma boutique
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        size="lg"
                        onClick={() => {
                          showInfo('Fonctionnalités', 'Découvrez toutes les fonctionnalités avancées de Payhuk : analytics, gestion des stocks, paiements, et bien plus !');
                        }}
                        className="flex-1"
                      >
                        <Play className="w-4 h-4 mr-2" />
                        Découvrir les fonctionnalités
                      </Button>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      💡 Conseil : Une fois votre boutique créée, vous pourrez accéder à toutes les fonctionnalités avancées du tableau de bord
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
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

  // Affichage du tableau de bord avancé
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
          
          {/* Contenu du dashboard avancé */}
          <div className="flex-1 p-6">
            <AdvancedDashboard />
          </div>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Dashboard;
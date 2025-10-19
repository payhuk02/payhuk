import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Store as StoreIcon, 
  Plus, 
  BarChart3, 
  Settings,
  Package,
  ShoppingCart,
  Users,
  TrendingUp
} from "lucide-react";
import { useMultiStores } from "@/hooks/useMultiStores";
import { StoresDashboard } from "@/components/stores/StoresDashboard";
import { CreateStoreDialog } from "@/components/stores/CreateStoreDialog";
import StoreDetails from "@/components/store/StoreDetails";

const Store = () => {
  const { stores, loading, canCreateStore } = useMultiStores();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 border-b bg-card shadow-soft backdrop-blur supports-[backdrop-filter]:bg-card/95">
            <div className="flex h-14 sm:h-16 items-center gap-3 sm:gap-4 px-4 sm:px-6">
              <SidebarTrigger className="touch-manipulation" />
              <div className="flex-1 min-w-0">
                <h1 className="text-lg sm:text-2xl font-bold truncate">Mes boutiques</h1>
              </div>
              {canCreateStore && (
                <CreateStoreDialog />
              )}
            </div>
          </header>

          <main className="flex-1 p-3 sm:p-4 md:p-5 lg:p-6 xl:p-8 bg-gradient-hero overflow-x-hidden">
            <div className="max-w-7xl mx-auto w-full animate-fade-in">
              <Tabs defaultValue="dashboard" className="w-full">
                <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 mb-6">
                  <TabsTrigger value="dashboard" className="gap-2">
                    <StoreIcon className="h-4 w-4" />
                    Tableau de bord
                  </TabsTrigger>
                  <TabsTrigger value="analytics" className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Analytics
                  </TabsTrigger>
                  <TabsTrigger value="products" className="gap-2">
                    <Package className="h-4 w-4" />
                    Produits
                  </TabsTrigger>
                  <TabsTrigger value="settings" className="gap-2">
                    <Settings className="h-4 w-4" />
                    Paramètres
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dashboard">
                  <StoresDashboard />
                </TabsContent>

                <TabsContent value="analytics">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <BarChart3 className="h-5 w-5" />
                        Analytics globales
                      </CardTitle>
                      <CardDescription>
                        Vue d'ensemble des performances de toutes vos boutiques
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <TrendingUp className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold mb-2">Analytics globales</h3>
                        <p className="text-muted-foreground">
                          Consultez les analytics détaillées de chaque boutique depuis le tableau de bord.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="products">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Package className="h-5 w-5" />
                        Gestion des produits
                      </CardTitle>
                      <CardDescription>
                        Gérez les produits de toutes vos boutiques
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold mb-2">Gestion des produits</h3>
                        <p className="text-muted-foreground">
                          Accédez à la gestion des produits depuis chaque boutique individuellement.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="settings">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5" />
                        Paramètres généraux
                      </CardTitle>
                      <CardDescription>
                        Configurez les paramètres globaux de vos boutiques
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                        <h3 className="text-lg font-semibold mb-2">Paramètres</h3>
                        <p className="text-muted-foreground">
                          Configurez les paramètres individuels de chaque boutique depuis le tableau de bord.
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default Store;

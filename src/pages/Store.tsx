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
  TrendingUp,
  ArrowRight,
  ExternalLink
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
                        Paramètres des boutiques
                      </CardTitle>
                      <CardDescription>
                        Gérez les paramètres avancés de toutes vos boutiques
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      {/* Actions rapides */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Card className="border-dashed">
                          <CardContent className="p-6 text-center">
                            <Settings className="h-8 w-8 mx-auto mb-3 text-blue-500" />
                            <h3 className="font-semibold mb-2">Paramètres généraux</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Configurez les paramètres globaux de vos boutiques
                            </p>
                            <Button 
                              variant="outline"
                              className="w-full gap-2"
                            >
                              <Settings className="h-4 w-4" />
                              Paramètres
                            </Button>
                          </CardContent>
                        </Card>

                        <Card className="border-dashed">
                          <CardContent className="p-6 text-center">
                            <Package className="h-8 w-8 mx-auto mb-3 text-green-500" />
                            <h3 className="font-semibold mb-2">Gestion des produits</h3>
                            <p className="text-sm text-muted-foreground mb-4">
                              Gérez les produits de toutes vos boutiques
                            </p>
                            <Button 
                              variant="outline"
                              className="w-full gap-2"
                            >
                              <Package className="h-4 w-4" />
                              Produits
                            </Button>
                          </CardContent>
                        </Card>
                      </div>

                      {/* Informations sur les boutiques */}
                      {stores.length > 0 && (
                        <div className="space-y-4">
                          <h4 className="font-semibold">Vos boutiques</h4>
                          <div className="space-y-2">
                            {stores.map((store) => (
                              <div key={store.id} className="flex items-center justify-between p-3 border rounded-lg">
                                <div className="flex items-center gap-3">
                                  <div 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                                    style={{ backgroundColor: store.theme_color }}
                                  >
                                    {store.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium">{store.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                      {store.slug}.payhuk.com
                                    </p>
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                  >
                                    <Settings className="h-3 w-3" />
                                    Paramètres
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => window.open(`/stores/${store.slug}`, '_blank')}
                                    className="gap-2"
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                    Voir
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Message si aucune boutique */}
                      {stores.length === 0 && (
                        <div className="text-center py-8">
                          <StoreIcon className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                          <h3 className="text-lg font-semibold mb-2">Aucune boutique</h3>
                          <p className="text-muted-foreground mb-4">
                            Créez votre première boutique pour commencer à vendre en ligne.
                          </p>
                          <CreateStoreDialog />
                        </div>
                      )}
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

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Store, 
  Settings, 
  Eye, 
  Edit, 
  Plus,
  ArrowLeft,
  ExternalLink,
  BarChart3,
  Package,
  Users,
  DollarSign,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { useMultiStores, Store as StoreType } from '@/hooks/useMultiStores';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CreateStoreDialog } from '@/components/stores/CreateStoreDialog';
import { EditStoreDialog } from '@/components/stores/EditStoreDialog';
import { StoreAnalytics } from '@/components/stores/StoreAnalytics';

/**
 * Composant de gestion multi-boutiques dans les paramètres
 */
export const MultiStoreSettings: React.FC = () => {
  const { 
    stores, 
    loading, 
    canCreateStore, 
    maxStores,
    deleteStore,
    toggleStoreStatus,
    getStoreStats
  } = useMultiStores();
  
  const [searchParams, setSearchParams] = useSearchParams();
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [storeStats, setStoreStats] = useState<Record<string, any>>({});
  const navigate = useNavigate();

  // Récupérer l'ID de la boutique depuis l'URL
  const storeId = searchParams.get('store');
  const activeTab = searchParams.get('tab') || 'overview';

  // Charger les statistiques pour chaque boutique
  useEffect(() => {
    const loadStats = async () => {
      for (const store of stores) {
        const stats = await getStoreStats(store.id);
        if (stats) {
          setStoreStats(prev => ({ ...prev, [store.id]: stats }));
        }
      }
    };
    
    if (stores.length > 0) {
      loadStats();
    }
  }, [stores, getStoreStats]);

  // Sélectionner la boutique depuis l'URL
  useEffect(() => {
    if (storeId && stores.length > 0) {
      const store = stores.find(s => s.id === storeId);
      if (store) {
        setSelectedStore(store);
      }
    }
  }, [storeId, stores]);

  const handleStoreSelect = (store: StoreType) => {
    setSelectedStore(store);
    setSearchParams({ tab: 'store', store: store.id });
  };

  const handleBackToOverview = () => {
    setSelectedStore(null);
    setSearchParams({ tab: 'store' });
  };

  const handleDeleteStore = async (store: StoreType) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la boutique "${store.name}" ?`)) {
      const success = await deleteStore(store.id);
      if (success && selectedStore?.id === store.id) {
        handleBackToOverview();
      }
    }
  };

  const handleToggleStatus = async (store: StoreType) => {
    await toggleStoreStatus(store.id);
  };

  const openStorefront = (store: StoreType) => {
    window.open(`/stores/${store.slug}`, '_blank');
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Gestion des boutiques</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-8 bg-gray-200 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Vue détaillée d'une boutique
  if (selectedStore) {
    return (
      <div className="space-y-6">
        {/* Header avec bouton retour */}
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            size="sm"
            onClick={handleBackToOverview}
            className="gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour
          </Button>
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-bold"
                style={{ backgroundColor: selectedStore.theme_color }}
              >
                {selectedStore.name.charAt(0).toUpperCase()}
              </div>
              {selectedStore.name}
            </h2>
            <p className="text-muted-foreground">
              {selectedStore.slug}.payhuk.com
            </p>
          </div>
        </div>

        {/* Tabs pour la boutique sélectionnée */}
        <Tabs value={activeTab} onValueChange={(value) => setSearchParams({ tab: value, store: selectedStore.id })}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
            <TabsTrigger value="settings">Paramètres</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="products">Produits</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Statut et actions rapides */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    {selectedStore.is_active ? (
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-500" />
                    )}
                    <span className="text-sm font-medium">Statut</span>
                  </div>
                  <p className="text-lg font-bold">
                    {selectedStore.is_active ? 'Active' : 'Inactive'}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <Package className="h-4 w-4 text-blue-500" />
                    <span className="text-sm font-medium">Produits</span>
                  </div>
                  <p className="text-lg font-bold">
                    {storeStats[selectedStore.id]?.totalProducts || 0}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <DollarSign className="h-4 w-4 text-green-500" />
                    <span className="text-sm font-medium">Revenus</span>
                  </div>
                  <p className="text-lg font-bold">
                    {storeStats[selectedStore.id]?.totalRevenue?.toLocaleString() || 0} XOF
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <Button onClick={() => setShowEditDialog(true)} className="gap-2">
                <Edit className="h-4 w-4" />
                Modifier la boutique
              </Button>
              <Button 
                variant="outline" 
                onClick={() => setShowAnalytics(true)}
                className="gap-2"
              >
                <BarChart3 className="h-4 w-4" />
                Voir les analytics
              </Button>
              <Button 
                variant="outline" 
                onClick={() => openStorefront(selectedStore)}
                className="gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Voir la boutique
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres de la boutique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Paramètres détaillés</h3>
                  <p className="text-muted-foreground mb-4">
                    Utilisez le bouton "Modifier la boutique" pour accéder aux paramètres complets.
                  </p>
                  <Button onClick={() => setShowEditDialog(true)} className="gap-2">
                    <Edit className="h-4 w-4" />
                    Modifier la boutique
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Analytics de la boutique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <BarChart3 className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Analytics détaillées</h3>
                  <p className="text-muted-foreground mb-4">
                    Consultez les analytics complètes de cette boutique.
                  </p>
                  <Button onClick={() => setShowAnalytics(true)} className="gap-2">
                    <BarChart3 className="h-4 w-4" />
                    Voir les analytics
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="products" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Produits de la boutique</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-lg font-semibold mb-2">Gestion des produits</h3>
                  <p className="text-muted-foreground mb-4">
                    Gérez les produits de cette boutique.
                  </p>
                  <Button 
                    variant="outline"
                    onClick={() => navigate('/dashboard/products')}
                    className="gap-2"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Aller aux produits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Dialogs */}
        <EditStoreDialog
          store={selectedStore}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
        
        <StoreAnalytics
          store={selectedStore}
          open={showAnalytics}
          onOpenChange={setShowAnalytics}
        />
      </div>
    );
  }

  // Vue d'ensemble de toutes les boutiques
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Gestion des boutiques</h2>
          <p className="text-muted-foreground">
            Gérez vos {stores.length} boutique{stores.length > 1 ? 's' : ''} sur {maxStores} maximum
          </p>
        </div>
        
        {canCreateStore && (
          <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nouvelle boutique
          </Button>
        )}
      </div>

      {/* Statistiques globales */}
      {stores.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Store className="h-4 w-4 text-blue-500" />
                <span className="text-sm font-medium">Boutiques</span>
              </div>
              <p className="text-2xl font-bold">{stores.length}</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-green-500" />
                <span className="text-sm font-medium">Produits</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.values(storeStats).reduce((sum, stats) => sum + (stats?.totalProducts || 0), 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Commandes</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.values(storeStats).reduce((sum, stats) => sum + (stats?.totalOrders || 0), 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Revenus</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.values(storeStats).reduce((sum, stats) => sum + (stats?.totalRevenue || 0), 0).toLocaleString()} XOF
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Liste des boutiques */}
      {stores.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <Store className="h-12 w-12 mx-auto mb-4 text-gray-400" />
            <h3 className="text-lg font-semibold mb-2">Aucune boutique</h3>
            <p className="text-muted-foreground mb-4">
              Créez votre première boutique pour commencer à vendre en ligne.
            </p>
            {canCreateStore && (
              <Button onClick={() => setShowCreateDialog(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Créer ma première boutique
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {stores.map((store) => {
            const stats = storeStats[store.id];
            
            return (
              <Card 
                key={store.id} 
                className="hover:shadow-lg transition-shadow cursor-pointer"
                onClick={() => handleStoreSelect(store)}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: store.theme_color }}
                    >
                      {store.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle className="text-lg">{store.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {store.slug}.payhuk.com
                      </p>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Statut */}
                  <div className="flex items-center justify-between">
                    <Badge variant={store.is_active ? "default" : "secondary"}>
                      {store.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                  </div>

                  {/* Description */}
                  {store.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {store.description}
                    </p>
                  )}

                  {/* Statistiques rapides */}
                  {stats && (
                    <div className="grid grid-cols-3 gap-4 pt-2 border-t">
                      <div className="text-center">
                        <p className="text-lg font-semibold">{stats.totalProducts || 0}</p>
                        <p className="text-xs text-muted-foreground">Produits</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{stats.totalOrders || 0}</p>
                        <p className="text-xs text-muted-foreground">Commandes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">
                          {(stats.totalRevenue || 0).toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">XOF</p>
                      </div>
                    </div>
                  )}

                  {/* Message de clic */}
                  <div className="text-center pt-2">
                    <p className="text-xs text-muted-foreground">
                      Cliquez pour gérer cette boutique
                    </p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Dialogs */}
      <CreateStoreDialog 
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
      />
    </div>
  );
};

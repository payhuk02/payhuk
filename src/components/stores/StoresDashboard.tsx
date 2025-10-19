import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Store, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  MoreVertical,
  TrendingUp,
  ShoppingCart,
  Users,
  DollarSign,
  Package,
  ExternalLink,
  Settings,
  BarChart3,
  Calendar,
  Globe
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useMultiStores, Store as StoreType, StoreStats } from '@/hooks/useMultiStores';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { CreateStoreDialog } from './CreateStoreDialog';
import { EditStoreDialog } from './EditStoreDialog';
import { StoreAnalytics } from './StoreAnalytics';

/**
 * Tableau de bord principal pour la gestion des boutiques
 */
export const StoresDashboard: React.FC = () => {
  const { 
    stores, 
    loading, 
    canCreateStore, 
    maxStores,
    deleteStore,
    toggleStoreStatus,
    getStoreStats
  } = useMultiStores();
  
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showAnalytics, setShowAnalytics] = useState(false);
  const [storeStats, setStoreStats] = useState<Record<string, StoreStats>>({});

  // Charger les statistiques pour chaque boutique
  React.useEffect(() => {
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

  const handleDeleteStore = async (store: StoreType) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la boutique "${store.name}" ?`)) {
      await deleteStore(store.id);
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
          <h2 className="text-2xl font-bold">Mes boutiques</h2>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold">Mes boutiques</h2>
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
                {Object.values(storeStats).reduce((sum, stats) => sum + stats.totalProducts, 0)}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-purple-500" />
                <span className="text-sm font-medium">Commandes</span>
              </div>
              <p className="text-2xl font-bold">
                {Object.values(storeStats).reduce((sum, stats) => sum + stats.totalOrders, 0)}
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
                {Object.values(storeStats).reduce((sum, stats) => sum + stats.totalRevenue, 0).toLocaleString()} XOF
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
              <Card key={store.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
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
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => openStorefront(store)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Voir la boutique
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedStore(store);
                          setShowEditDialog(true);
                        }}>
                          <Edit className="h-4 w-4 mr-2" />
                          Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {
                          setSelectedStore(store);
                          setShowAnalytics(true);
                        }}>
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Analytics
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleToggleStatus(store)}>
                          <Settings className="h-4 w-4 mr-2" />
                          {store.is_active ? 'Désactiver' : 'Activer'}
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDeleteStore(store)}
                          className="text-red-600"
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Supprimer
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Statut */}
                  <div className="flex items-center justify-between">
                    <Badge variant={store.is_active ? "default" : "secondary"}>
                      {store.is_active ? 'Actif' : 'Inactif'}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      Créé le {format(new Date(store.created_at), 'dd/MM/yyyy', { locale: fr })}
                    </span>
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
                        <p className="text-lg font-semibold">{stats.totalProducts}</p>
                        <p className="text-xs text-muted-foreground">Produits</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">{stats.totalOrders}</p>
                        <p className="text-xs text-muted-foreground">Commandes</p>
                      </div>
                      <div className="text-center">
                        <p className="text-lg font-semibold">
                          {stats.totalRevenue.toLocaleString()}
                        </p>
                        <p className="text-xs text-muted-foreground">XOF</p>
                      </div>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex gap-2 pt-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => openStorefront(store)}
                    >
                      <ExternalLink className="h-3 w-3" />
                      Voir
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 gap-2"
                      onClick={() => {
                        setSelectedStore(store);
                        setShowEditDialog(true);
                      }}
                    >
                      <Edit className="h-3 w-3" />
                      Modifier
                    </Button>
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
      
      {selectedStore && (
        <EditStoreDialog
          store={selectedStore}
          open={showEditDialog}
          onOpenChange={setShowEditDialog}
        />
      )}
      
      {selectedStore && (
        <StoreAnalytics
          store={selectedStore}
          open={showAnalytics}
          onOpenChange={setShowAnalytics}
        />
      )}
    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { 
  Package, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  EyeOff,
  Search,
  Filter,
  SortAsc,
  SortDesc,
  MoreVertical,
  DollarSign,
  Tag,
  Calendar,
  BarChart3
} from 'lucide-react';
import { useMultiStores, Store as StoreType } from '@/hooks/useMultiStores';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  is_active: boolean;
  category: string;
  product_type: string;
  image_url?: string;
  created_at: string;
  updated_at: string;
}

/**
 * Composant de gestion des produits pour les boutiques
 */
export const StoreProductsManager: React.FC = () => {
  const { stores } = useMultiStores();
  const { toast } = useToast();
  
  const [selectedStore, setSelectedStore] = useState<StoreType | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'name' | 'price' | 'created_at'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');

  // Initialiser avec la première boutique
  useEffect(() => {
    if (stores.length > 0 && !selectedStore) {
      setSelectedStore(stores[0]);
    }
  }, [stores, selectedStore]);

  // Charger les produits de la boutique sélectionnée
  useEffect(() => {
    if (selectedStore) {
      loadProducts();
    }
  }, [selectedStore]);

  const loadProducts = async () => {
    if (!selectedStore) return;
    
    setLoading(true);
    try {
      // Charger les produits depuis la base de données
      const { data: products, error } = await supabase
        .from('products')
        .select('*')
        .eq('store_id', selectedStore.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Si aucun produit n'existe, créer des exemples
      if (!products || products.length === 0) {
        const mockProducts: Product[] = [
          {
            id: '1',
            name: 'Produit 1',
            description: 'Description du produit 1',
            price: 5000,
            currency: 'XOF',
            is_active: true,
            category: 'Électronique',
            product_type: 'Physique',
            image_url: 'https://via.placeholder.com/150',
            created_at: '2024-01-15T10:00:00Z',
            updated_at: '2024-01-15T10:00:00Z'
          },
          {
            id: '2',
            name: 'Produit 2',
            description: 'Description du produit 2',
            price: 15000,
            currency: 'XOF',
            is_active: false,
            category: 'Mode',
            product_type: 'Digital',
            created_at: '2024-01-14T10:00:00Z',
            updated_at: '2024-01-14T10:00:00Z'
          }
        ];
        setProducts(mockProducts);
      } else {
        setProducts(products as Product[]);
      }
    } catch (error) {
      console.error('Error loading products:', error);
      toast({
        title: "Erreur",
        description: "Impossible de charger les produits",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         product.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterActive === 'all' || 
                         (filterActive === 'active' && product.is_active) ||
                         (filterActive === 'inactive' && !product.is_active);
    
    return matchesSearch && matchesFilter;
  }).sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'name':
        aValue = a.name.toLowerCase();
        bValue = b.name.toLowerCase();
        break;
      case 'price':
        aValue = a.price;
        bValue = b.price;
        break;
      case 'created_at':
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
        break;
      default:
        return 0;
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  });

  const handleToggleProductStatus = async (productId: string) => {
    try {
      const product = products.find(p => p.id === productId);
      if (!product) return;

      const newStatus = !product.is_active;
      
      // Mise à jour optimiste
      setProducts(prev => prev.map(p => 
        p.id === productId ? { ...p, is_active: newStatus } : p
      ));

      // Mise à jour en base de données
      const { error } = await supabase
        .from('products')
        .update({ 
          is_active: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', productId);

      if (error) {
        // Rollback en cas d'erreur
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, is_active: product.is_active } : p
        ));
        throw error;
      }
      
      toast({
        title: "Statut modifié",
        description: `Le produit "${product.name}" est maintenant ${newStatus ? 'actif' : 'inactif'}.`
      });
    } catch (error) {
      console.error('Error toggling product status:', error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut du produit",
        variant: "destructive"
      });
    }
  };

  const handleDeleteProduct = async (productId: string) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.')) {
      return;
    }

    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      setProducts(prev => prev.filter(product => product.id !== productId));
      toast({
        title: "Produit supprimé",
        description: "Le produit a été supprimé avec succès."
      });
    } catch (error) {
      console.error('Error deleting product:', error);
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le produit",
        variant: "destructive"
      });
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Gestion des produits</h2>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-12 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="lg:col-span-2">
            <Card className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-6 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-20 bg-gray-200 rounded"></div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (stores.length === 0) {
    return (
      <div className="text-center py-12">
        <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
        <h3 className="text-lg font-semibold mb-2">Aucune boutique</h3>
        <p className="text-muted-foreground">
          Créez votre première boutique pour gérer des produits.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Gestion des produits</h2>
          <p className="text-muted-foreground">
            Gérez les produits de toutes vos boutiques
          </p>
        </div>
        
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouveau produit
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Liste des boutiques */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Vos boutiques
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {stores.map((store) => (
                <div
                  key={store.id}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedStore?.id === store.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:bg-accent'
                  }`}
                  onClick={() => setSelectedStore(store)}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: store.theme_color }}
                    >
                      {store.name.charAt(0).toUpperCase()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{store.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {store.slug}.payhuk.com
                      </p>
                    </div>
                    <Badge variant="outline">
                      {products.filter(p => p.id).length} produits
                    </Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Gestion des produits */}
        <div className="lg:col-span-2">
          {selectedStore ? (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold"
                      style={{ backgroundColor: selectedStore.theme_color }}
                    >
                      {selectedStore.name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <CardTitle>Produits de {selectedStore.name}</CardTitle>
                      <p className="text-sm text-muted-foreground">
                        {filteredProducts.length} produit{filteredProducts.length > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                  
                  <Button className="gap-2">
                    <Plus className="h-4 w-4" />
                    Ajouter un produit
                  </Button>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Filtres et recherche */}
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        placeholder="Rechercher un produit..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setFilterActive(filterActive === 'all' ? 'active' : filterActive === 'active' ? 'inactive' : 'all')}
                    >
                      <Filter className="h-4 w-4 mr-2" />
                      {filterActive === 'all' ? 'Tous' : filterActive === 'active' ? 'Actifs' : 'Inactifs'}
                    </Button>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                    >
                      {sortOrder === 'asc' ? (
                        <SortAsc className="h-4 w-4" />
                      ) : (
                        <SortDesc className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                {/* Liste des produits */}
                {filteredProducts.length === 0 ? (
                  <div className="text-center py-12">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <h3 className="text-lg font-semibold mb-2">Aucun produit</h3>
                    <p className="text-muted-foreground mb-4">
                      {searchQuery ? 'Aucun produit ne correspond à votre recherche.' : 'Commencez par ajouter votre premier produit.'}
                    </p>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Ajouter un produit
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {filteredProducts.map((product) => (
                      <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent/50 transition-colors">
                        <div className="flex items-center gap-4">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.name}
                              className="w-12 h-12 rounded-lg object-cover"
                            />
                          ) : (
                            <div className="w-12 h-12 rounded-lg bg-muted flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                          
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-medium truncate">{product.name}</h4>
                              <Badge variant={product.is_active ? "default" : "secondary"}>
                                {product.is_active ? 'Actif' : 'Inactif'}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate mb-1">
                              {product.description}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                {product.price.toLocaleString()} {product.currency}
                              </span>
                              <span className="flex items-center gap-1">
                                <Tag className="h-3 w-3" />
                                {product.category}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                {new Date(product.created_at).toLocaleDateString()}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleToggleProductStatus(product.id)}
                            className="gap-2"
                          >
                            {product.is_active ? (
                              <>
                                <EyeOff className="h-3 w-3" />
                                Désactiver
                              </>
                            ) : (
                              <>
                                <Eye className="h-3 w-3" />
                                Activer
                              </>
                            )}
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreVertical className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <Edit className="h-4 w-4 mr-2" />
                                Modifier
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <BarChart3 className="h-4 w-4 mr-2" />
                                Analytics
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => handleDeleteProduct(product.id)}
                                className="text-red-600"
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Supprimer
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <Package className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-semibold mb-2">Sélectionnez une boutique</h3>
                <p className="text-muted-foreground">
                  Choisissez une boutique dans la liste pour gérer ses produits.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

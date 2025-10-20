import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Package } from "lucide-react";
import { useStore } from "@/hooks/useStore";
import { useProducts } from "@/hooks/useProducts";
import { useProductManagement } from "@/hooks/useProductManagement";
import EditProductDialog from "@/components/products/EditProductDialog";
import ProductCardDashboard from "@/components/products/ProductCardDashboard";
import ProductFiltersDashboard from "@/components/products/ProductFiltersDashboard";
import { Product } from "@/hooks/useProducts";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const Products = () => {
  const navigate = useNavigate();
  const { store, loading: storeLoading } = useStore();
  const { products, loading: productsLoading, refetch } = useProducts(store?.id);
  const { deleteProduct, updateProduct } = useProductManagement(store?.id || "");
  
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
  
  // Filters state
  const [searchQuery, setSearchQuery] = useState("");
  const [category, setCategory] = useState("all");
  const [productType, setProductType] = useState("all");
  // Par défaut, afficher uniquement les produits publiés (actifs)
  const [status, setStatus] = useState("active");
  const [sortBy, setSortBy] = useState("recent");

  // Extract unique categories and types
  const categories = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[];
  }, [products]);

  const productTypes = useMemo(() => {
    return Array.from(new Set(products.map((p) => p.product_type).filter(Boolean))) as string[];
  }, [products]);

  // Compteurs par statut
  const publishedCount = useMemo(() => products.filter(p => p.is_active).length, [products]);
  const inactiveCount = useMemo(() => products.filter(p => !p.is_active).length, [products]);
  // const draftCount = 0; // optionnel: ajouter quand la colonne existera

  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Search filter
    if (searchQuery) {
      filtered = filtered.filter((product) =>
        product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Category filter
    if (category !== "all") {
      filtered = filtered.filter((product) => product.category === category);
    }

    // Product type filter
    if (productType !== "all") {
      filtered = filtered.filter((product) => product.product_type === productType);
    }

    // Status filter
    if (status === "active") {
      filtered = filtered.filter((product) => product.is_active);
    } else if (status === "inactive") {
      filtered = filtered.filter((product) => !product.is_active);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "recent":
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case "oldest":
          return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        case "popular":
          return 0; // placeholder tant que la métrique d'avis n'existe pas
        default:
          return 0;
      }
    });

    return filtered;
  }, [products, searchQuery, category, productType, status, sortBy]);

  if (storeLoading) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  if (!store) {
    return (
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <AppSidebar />
          <div className="flex-1 flex items-center justify-center">
            <Card>
              <CardContent className="py-12 px-8 text-center">
                <p className="text-muted-foreground">
                  Vous devez d'abord créer une boutique avant d'ajouter des produits
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </SidebarProvider>
    );
  }

  const handleDelete = async () => {
    if (deletingProductId) {
      await deleteProduct(deletingProductId);
      setDeletingProductId(null);
      refetch();
    }
  };

  const updateProductInline = async (id: string, updates: Partial<Product>) => {
    await updateProduct(id, updates as any);
    refetch();
  };

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full">
        <AppSidebar />
        
        <div className="flex-1 flex flex-col">
          <header className="sticky top-0 z-10 border-b bg-card shadow-soft">
              <div className="flex h-12 sm:h-14 md:h-16 items-center gap-2 sm:gap-4 px-2 sm:px-3 md:px-4 lg:px-6">
              <SidebarTrigger className="h-8 w-8 sm:h-9 sm:w-9 md:h-10 md:w-10" />
              <div className="flex-1 min-w-0">
                <h1 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold truncate">Produits</h1>
                  <div className="mt-1 flex flex-wrap gap-1 sm:gap-2 text-[10px] sm:text-xs">
                    <Badge variant={status==='all'?'default':'outline'} onClick={()=>setStatus('all')} className="cursor-pointer text-[9px] sm:text-[10px] md:text-xs">Tous</Badge>
                    <Badge variant={status==='active'?'default':'outline'} onClick={()=>setStatus('active')} className="cursor-pointer text-[9px] sm:text-[10px] md:text-xs">Publiés: {publishedCount}</Badge>
                    <Badge variant={status==='inactive'?'default':'outline'} onClick={()=>setStatus('inactive')} className="cursor-pointer text-[9px] sm:text-[10px] md:text-xs">Inactifs: {inactiveCount}</Badge>
                  </div>
              </div>
              <Button onClick={() => navigate("/dashboard/products/new?tab=faq") } className="text-xs sm:text-sm h-8 sm:h-9 md:h-10 px-2 sm:px-3 md:px-4">
                <span className="hidden sm:inline">Nouveau produit</span>
                <span className="sm:hidden">+</span>
              </Button>
            </div>
          </header>

          <main className="flex-1 p-2 sm:p-3 md:p-4 lg:p-6 bg-gradient-hero overflow-x-hidden">
            <div className="max-w-7xl mx-auto space-y-3 sm:space-y-4 md:space-y-6">
              {productsLoading ? (
                <Card className="shadow-medium">
                  <CardContent className="py-8 sm:py-12 text-center">
                    <p className="text-sm sm:text-base text-muted-foreground">Chargement des produits...</p>
                  </CardContent>
                </Card>
              ) : products.length === 0 ? (
                <Card className="shadow-medium">
                  <CardHeader className="text-center py-8 sm:py-12 px-4">
                    <div className="flex justify-center mb-3 sm:mb-4">
                      <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-full bg-muted flex items-center justify-center">
                        <Package className="h-8 w-8 sm:h-10 sm:w-10 text-muted-foreground" />
                      </div>
                    </div>
                    <CardTitle className="text-lg sm:text-xl">Aucun produit pour le moment</CardTitle>
                    <CardDescription className="mt-2 text-sm sm:text-base">
                      Créez votre premier produit digital ou service pour commencer à vendre
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center pb-8 sm:pb-12 px-4">
                    <Button onClick={() => navigate("/dashboard/products/new?tab=faq") } className="w-full sm:w-auto">
                      Créer mon premier produit
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <>
                  <ProductFiltersDashboard
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    category={category}
                    onCategoryChange={setCategory}
                    productType={productType}
                    onProductTypeChange={setProductType}
                    status={status}
                    onStatusChange={setStatus}
                    sortBy={sortBy}
                    onSortByChange={setSortBy}
                    categories={categories}
                    productTypes={productTypes}
                  />

                  {filteredProducts.length === 0 ? (
                    <Card className="shadow-medium">
                      <CardContent className="py-8 sm:py-12 text-center">
                        <p className="text-sm sm:text-base text-muted-foreground">
                          Aucun produit ne correspond à vos critères de recherche
                        </p>
                      </CardContent>
                    </Card>
                  ) : (
                    <>
                      <div className="flex items-center justify-between">
                        <p className="text-xs sm:text-sm text-muted-foreground">
                          {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""} trouvé{filteredProducts.length > 1 ? "s" : ""}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-6">
                        {filteredProducts.map((product) => (
                          <ProductCardDashboard
                            key={product.id}
                            product={product}
                            storeSlug={store.slug}
                            onEdit={() => setEditingProduct(product)}
                            onDelete={() => setDeletingProductId(product.id)}
                            onToggleActive={async () => {
                              await updateProductInline(product.id, { is_active: !product.is_active });
                            }}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </div>

      {editingProduct && (
        <EditProductDialog
          product={editingProduct}
          storeSlug={store.slug}
          open={!!editingProduct}
          onOpenChange={(open) => !open && setEditingProduct(null)}
          onProductUpdated={refetch}
        />
      )}

      <AlertDialog open={!!deletingProductId} onOpenChange={(open) => !open && setDeletingProductId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer la suppression</AlertDialogTitle>
            <AlertDialogDescription>
              Êtes-vous sûr de vouloir supprimer ce produit ? Cette action est irréversible.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </SidebarProvider>
  );
};

export default Products;

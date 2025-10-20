import { Product } from "@/hooks/useProducts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Edit, Trash2, Copy, ExternalLink, MessageSquare, Megaphone, Search } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useInternalAnalytics } from "@/hooks/useInternalAnalytics";

interface ProductCardDashboardProps {
  product: Product;
  storeSlug: string;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive?: () => void;
}

const ProductCardDashboard = ({
  product,
  storeSlug,
  onEdit,
  onDelete,
}: ProductCardDashboardProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const { trackInternalEvent } = useInternalAnalytics();

  const productUrl = `${window.location.origin}/stores/${storeSlug}/products/${product.slug}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(productUrl);
      toast({
        title: "Lien copié",
        description: "Le lien du produit a été copié",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien",
        variant: "destructive",
      });
    }
  };

  const handlePreview = () => {
    window.open(productUrl, "_blank");
  };

  return (
    <Card className="shadow-medium hover:shadow-lg transition-shadow">
      <CardHeader className="p-0">
        {product.image_url ? (
          <div className="aspect-square rounded-t-lg overflow-hidden bg-muted">
            <img
              src={product.image_url}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-square rounded-t-lg bg-muted flex items-center justify-center">
            <span className="text-muted-foreground text-sm">Pas d'image</span>
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 space-y-3">
        <div>
          <CardTitle className="line-clamp-2 text-lg">{product.name}</CardTitle>
          {product.description && (
            <CardDescription className="line-clamp-2 mt-1">
              {product.description}
            </CardDescription>
          )}
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xl font-bold">
            {product.price.toLocaleString()} {product.currency}
          </span>
          <div
            className={`px-2 py-1 rounded text-xs font-medium ${
              product.is_active
                ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100"
                : "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100"
            }`}
          >
            {product.is_active ? "Actif" : "Inactif"}
          </div>
        </div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <span className="font-medium">Lien:</span>
            <code className="flex-1 truncate">{product.slug}</code>
          </div>
          {product.category && (
            <div>
              <span className="font-medium">Catégorie:</span> {product.category}
            </div>
          )}
          {product.product_type && (
            <div>
              <span className="font-medium">Type:</span> {product.product_type}
            </div>
          )}
          {product.rating > 0 && (
            <div>
              <span className="font-medium">Note:</span> {product.rating.toFixed(1)}/5 ({product.reviews_count} avis)
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          {onToggleActive && (
            <Button
              variant={product.is_active ? "outline" : "default"}
              size="sm"
              className="flex-1"
              onClick={onToggleActive}
              title={product.is_active ? "Désactiver" : "Activer"}
            >
              {product.is_active ? "Désactiver" : "Activer"}
            </Button>
          )}
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                  trackInternalEvent('pageview', { 
                    product_id: product.id, 
                    product_name: product.name,
                    action: 'edit_product'
                  });
                  onEdit();
                }}>
                  <Edit className="h-4 w-4 mr-1" />
                  Modifier
                </Button>
              </TooltipTrigger>
              <TooltipContent>Ouvrir l’édition générale</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                  trackInternalEvent('pageview', { 
                    product_id: product.id, 
                    product_name: product.name,
                    action: 'edit_faq',
                    tab: 'faq'
                  });
                  navigate(`/admin/products/${product.id}?tab=faq`);
                }}>
                  <MessageSquare className="h-4 w-4 mr-1" />
                  FAQ
                </Button>
              </TooltipTrigger>
              <TooltipContent>Aller directement à l’onglet FAQ</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                  trackInternalEvent('pageview', { 
                    product_id: product.id, 
                    product_name: product.name,
                    action: 'edit_seo',
                    tab: 'seo'
                  });
                  navigate(`/admin/products/${product.id}?tab=seo`);
                }}>
                  <Search className="h-4 w-4 mr-1" />
                  SEO
                </Button>
              </TooltipTrigger>
              <TooltipContent>Aller directement à l’onglet SEO</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="sm" className="flex-1" onClick={() => {
                  trackInternalEvent('pageview', { 
                    product_id: product.id, 
                    product_name: product.name,
                    action: 'edit_promotions',
                    tab: 'promotions'
                  });
                  navigate(`/admin/products/${product.id}?tab=promotions`);
                }}>
                  <Megaphone className="h-4 w-4 mr-1" />
                  Promo
                </Button>
              </TooltipTrigger>
              <TooltipContent>Aller directement à l’onglet Promotions</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopyLink}
            title="Copier le lien"
          >
            <Copy className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreview}
            title="Prévisualiser"
          >
            <ExternalLink className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onDelete}
            title="Supprimer"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProductCardDashboard;

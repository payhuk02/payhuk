import { useState } from "react";
import { Link } from "react-router-dom";
import { ShoppingCart, Star, Percent, Loader2 } from "lucide-react";
import { initiateMonerooPayment } from "@/lib/moneroo-payment";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    image_url?: string;
    price: number;
    promo_price?: number;
    currency?: string;
    rating?: number;
    reviews_count?: number;
    purchases_count?: number;
    category?: string;
    store_id?: string;
  };
  storeSlug: string;
}

const ProductCard = ({ product, storeSlug }: ProductCardProps) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const price = product.promo_price ?? product.price;
  const hasPromo = product.promo_price && product.promo_price < product.price;

  const discountPercent = hasPromo
    ? Math.round(((product.price - product.promo_price!) / product.price) * 100)
    : 0;

  const renderStars = (rating: number) => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`h-4 w-4 ${
            star <= rating ? "fill-yellow-400 text-yellow-400" : "text-muted-foreground"
          }`}
        />
      ))}
    </div>
  );

  const handleBuyNow = async () => {
    if (!product.store_id) {
      toast({
        title: "Erreur",
        description: "Boutique non disponible",
        variant: "destructive",
      });
      return;
    }

    try {
      setLoading(true);

      const result = await initiateMonerooPayment({
        storeId: product.store_id,
        productId: product.id,
        amount: price,
        currency: product.currency ?? "XOF",
        description: `Achat de ${product.name}`,
        customerEmail: "client@example.com",
        metadata: { productName: product.name, storeSlug },
      });

      if (result.checkout_url) {
        window.location.href = result.checkout_url;
      }
    } catch (error: any) {
      console.error("Erreur Moneroo:", error);
      toast({
        title: "Erreur de paiement",
        description: error.message || "Impossible d'initialiser le paiement",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-xl sm:rounded-2xl border border-border bg-card overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-1">
      {hasPromo && (
        <div className="absolute top-2 left-2 sm:top-3 sm:left-3 z-10 bg-red-500 text-white text-[10px] sm:text-xs font-bold px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-md flex items-center gap-0.5 sm:gap-1">
          <Percent className="h-2 w-2 sm:h-3 sm:w-3" /> -{discountPercent}%
        </div>
      )}

      <div className="aspect-square overflow-hidden bg-muted relative">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.name}
            width={1080}
            height={1080}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-muted-foreground">
            <ShoppingCart className="h-12 w-12 sm:h-16 sm:w-16 opacity-20" />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col p-2 sm:p-3 md:p-4 space-y-1 sm:space-y-2">
        {product.category && (
          <span className="text-[10px] sm:text-xs font-medium text-primary uppercase tracking-wide">
            {product.category}
          </span>
        )}

        <h3 className="text-sm sm:text-base font-semibold leading-tight line-clamp-2 group-hover:text-primary transition-colors">
          {product.name}
        </h3>

        {product.rating ? (
          <div className="flex items-center gap-0.5 sm:gap-1 text-xs sm:text-sm text-muted-foreground">
            {renderStars(product.rating)}
            <span className="ml-1 text-[10px] sm:text-xs">({product.reviews_count ?? 0})</span>
          </div>
        ) : (
          <div className="h-4 sm:h-5" />
        )}

        <div className="flex items-baseline gap-1 sm:gap-2 mt-1">
          {hasPromo && (
            <span className="text-xs sm:text-sm text-muted-foreground line-through">
              {product.price.toLocaleString()} {product.currency ?? "FCFA"}
            </span>
          )}
          <span className="text-base sm:text-lg font-bold text-primary">
            {price.toLocaleString()} {product.currency ?? "FCFA"}
          </span>
        </div>

        <span className="text-[10px] sm:text-xs text-muted-foreground">
          {product.purchases_count
            ? `${product.purchases_count} ventes`
            : "Aucune vente"}
        </span>

        <div className="mt-2 sm:mt-3 flex flex-col sm:flex-row gap-1 sm:gap-2">
          <Link to={`/stores/${storeSlug}/products/${product.slug}`} className="flex-1">
            <Button variant="outline" className="w-full h-8 sm:h-9 text-xs sm:text-sm">
              Voir le produit
            </Button>
          </Link>

          <Button
            onClick={handleBuyNow}
            disabled={loading}
            className="bg-primary text-primary-foreground flex items-center gap-1 h-8 sm:h-9 text-xs sm:text-sm"
          >
            {loading ? (
              <>
                <Loader2 className="h-3 w-3 sm:h-4 sm:w-4 animate-spin" />
                <span className="hidden sm:inline">Paiement...</span>
                <span className="sm:hidden">...</span>
              </>
            ) : (
              <>
                <ShoppingCart className="h-3 w-3 sm:h-4 sm:w-4" />
                <span>Acheter</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;

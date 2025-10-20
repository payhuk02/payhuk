import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export interface Product {
  id: string;
  store_id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  currency: string;
  image_url: string | null;
  category: string | null;
  product_type: string | null;
  rating: number;
  reviews_count: number;
  is_active: boolean;
  digital_file_url: string | null;
  created_at: string;
  updated_at: string;
}

export const useProducts = (storeId?: string) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      // Si aucun storeId, ne pas interroger encore (évite écran vide)
      if (!storeId) {
        setProducts([]);
        setLoading(false);
        return;
      }

      const query = supabase
        .from('products')
        .select('id, store_id, name, slug, description, price, currency, image_url, category, product_type, rating, reviews_count, is_active, created_at, updated_at')
        // Dashboard: afficher tous les produits (y compris drafts/inactifs)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false });

      const { data, error } = await query;

      if (error) throw error;
      setProducts(data || []);
    } catch (error: any) {
      toast({
        title: "Erreur",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [storeId]);

  return { products, loading, refetch: fetchProducts };
};

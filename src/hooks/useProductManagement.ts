import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { generateSlug } from "@/lib/store-utils";

export const useProductManagement = (storeId: string) => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const checkSlugAvailability = async (
    slug: string,
    excludeProductId?: string
  ): Promise<boolean> => {
    try {
      const { data, error } = await supabase.rpc("is_product_slug_available", {
        check_slug: slug,
        check_store_id: storeId,
        exclude_product_id: excludeProductId || null,
      });

      if (error) throw error;
      return data;
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue.",
        variant: "destructive",
      });
      return false;
    }
  };

  // Backward-compatible simple creator used by older UIs
  const createProduct = async (product: {
    name: string;
    slug: string;
    description?: string | null;
    price?: number | null;
    category?: string | null;
    product_type?: string | null;
    image_url?: string | null;
  }): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('products')
        .insert([
          {
            store_id: storeId,
            name: product.name,
            slug: product.slug,
            description: product.description || null,
            price: product.price ?? null,
            currency: 'XOF',
            category: product.category || null,
            product_type: product.product_type || null,
            image_url: product.image_url || null,
            is_active: false,
            is_draft: true,
            status: 'draft',
          },
        ]);

      if (error) throw error;
      toast({ title: 'Succès', description: 'Produit créé' });
      return true;
    } catch (error: unknown) {
      toast({
        title: 'Erreur',
        description: error instanceof Error ? error.message : 'Une erreur est survenue.',
        variant: 'destructive',
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const createProductComplete = async (productData: Record<string, unknown>): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase.from("products").insert({
        store_id: storeId,
        name: productData.name,
        slug: productData.slug,
        description: productData.description,
        short_description: productData.short_description,
        price: productData.price,
        promotional_price: productData.promotional_price,
        currency: productData.currency || "XOF",
        category: productData.category,
        product_type: productData.product_type,
        pricing_model: productData.pricing_model,
        image_url: productData.image_url,
        images: productData.images,
        video_url: productData.video_url,
        gallery_images: productData.gallery_images,
        downloadable_files: productData.downloadable_files,
        file_access_type: productData.file_access_type,
        download_limit: productData.download_limit,
        download_expiry_days: productData.download_expiry_days,
        custom_fields: productData.custom_fields,
        faqs: productData.faqs,
        meta_title: productData.meta_title,
        meta_description: productData.meta_description,
        meta_keywords: productData.meta_keywords,
        og_image: productData.og_image,
        og_title: productData.og_title,
        og_description: productData.og_description,
        analytics_enabled: productData.analytics_enabled,
        track_views: productData.track_views,
        track_clicks: productData.track_clicks,
        track_purchases: productData.track_purchases,
        track_time_spent: productData.track_time_spent,
        google_analytics_id: productData.google_analytics_id,
        facebook_pixel_id: productData.facebook_pixel_id,
        google_tag_manager_id: productData.google_tag_manager_id,
        tiktok_pixel_id: productData.tiktok_pixel_id,
        pinterest_pixel_id: productData.pinterest_pixel_id,
        advanced_tracking: productData.advanced_tracking,
        custom_events: productData.custom_events,
        pixels_enabled: productData.pixels_enabled,
        conversion_pixels: productData.conversion_pixels,
        retargeting_pixels: productData.retargeting_pixels,
        variants: productData.variants,
        color_variants: productData.color_variants,
        size_variants: productData.size_variants,
        pattern_variants: productData.pattern_variants,
        finish_variants: productData.finish_variants,
        dimension_variants: productData.dimension_variants,
        weight_variants: productData.weight_variants,
        centralized_stock: productData.centralized_stock,
        low_stock_alerts: productData.low_stock_alerts,
        preorder_allowed: productData.preorder_allowed,
        hide_when_out_of_stock: productData.hide_when_out_of_stock,
        different_prices_per_variant: productData.different_prices_per_variant,
        price_surcharge: productData.price_surcharge,
        quantity_discounts: productData.quantity_discounts,
        promotions_enabled: productData.promotions_enabled,
        discount_percentage: productData.discount_percentage,
        discount_fixed: productData.discount_fixed,
        buy_one_get_one: productData.buy_one_get_one,
        family_pack: productData.family_pack,
        flash_sale: productData.flash_sale,
        first_order_discount: productData.first_order_discount,
        loyalty_discount: productData.loyalty_discount,
        birthday_discount: productData.birthday_discount,
        advanced_promotions: productData.advanced_promotions,
        cumulative_promotions: productData.cumulative_promotions,
        automatic_promotions: productData.automatic_promotions,
        promotion_notifications: productData.promotion_notifications,
        geolocated_promotions: productData.geolocated_promotions,
        is_active: productData.is_active,
        is_featured: productData.is_featured,
        hide_from_store: productData.hide_from_store,
        password_protected: productData.password_protected,
        product_password: productData.product_password,
        purchase_limit: productData.purchase_limit,
        hide_purchase_count: productData.hide_purchase_count,
        access_control: productData.access_control,
        sale_start_date: productData.sale_start_date,
        sale_end_date: productData.sale_end_date,
        collect_shipping_address: productData.collect_shipping_address,
        shipping_required: productData.shipping_required,
        shipping_cost: productData.shipping_cost,
        free_shipping_threshold: productData.free_shipping_threshold,
        post_purchase_guide_url: productData.post_purchase_guide_url,
        support_email: productData.support_email,
        documentation_url: productData.documentation_url,
        is_draft: productData.is_draft,
        status: productData.status || 'draft',
        version: 1
      });

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Produit créé avec succès",
      });
      return true;
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateProduct = async (
    productId: string,
    updates: {
      name?: string;
      slug?: string;
      description?: string;
      price?: number;
      currency?: string;
      category?: string;
      product_type?: string;
      image_url?: string;
      is_active?: boolean;
    }
  ): Promise<boolean> => {
    setLoading(true);
    try {
      // If slug is being updated, check availability
      if (updates.slug) {
        const isAvailable = await checkSlugAvailability(
          updates.slug,
          productId
        );
        if (!isAvailable) {
          toast({
            title: "Erreur",
            description: "Ce lien est déjà utilisé pour un autre produit",
            variant: "destructive",
          });
          return false;
        }
      }

      const { error } = await supabase
        .from("products")
        .update(updates)
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Produit mis à jour",
      });
      return true;
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from("products")
        .delete()
        .eq("id", productId);

      if (error) throw error;

      toast({
        title: "Succès",
        description: "Produit supprimé",
      });
      return true;
    } catch (error: unknown) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue.",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    loading,
    checkSlugAvailability,
    createProduct,
    createProductComplete,
    updateProduct,
    deleteProduct,
  };
};

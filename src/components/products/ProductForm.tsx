import { useState, useEffect } from "react";
import { z } from "zod";
import { productCompleteSchema } from "@/lib/schemas";
import { useNavigate, useLocation } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Eye, Save, MoreVertical, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { ProductInfoTab } from "./tabs/ProductInfoTab";
import { ProductDescriptionTab } from "./tabs/ProductDescriptionTab";
import { ProductVisualTab } from "./tabs/ProductVisualTab";
import { ProductFilesTab } from "./tabs/ProductFilesTab";
import { ProductCustomFieldsTab } from "./tabs/ProductCustomFieldsTab";
import { ProductFAQTab } from "./tabs/ProductFAQTab";
import { ProductSeoTab } from "./tabs/ProductSeoTab";
import { ProductAnalyticsTab } from "./tabs/ProductAnalyticsTab";
import { ProductPixelsTab } from "./tabs/ProductPixelsTab";
import { ProductVariantsTab } from "./tabs/ProductVariantsTab";
import { ProductPromotionsTab } from "./tabs/ProductPromotionsTab";
import { PaymentSelection } from "@/components/payments/PaymentSelection";
import { generateSlug } from "@/lib/store-utils";
import "@/styles/product-creation.css";

interface ProductFormProps {
  storeId: string;
  storeSlug: string;
  productId?: string;
  initialData?: Record<string, unknown>;
  onSuccess?: () => void;
}

// Types pour les données du formulaire
interface ProductFormData {
  // Informations de base
  name: string;
  slug: string;
  category: string;
  product_type: string;
  pricing_model: "one-time" | "subscription" | "pay-what-you-want" | "free";
  price: number | null;
  promotional_price: number | null;
  currency: string;
  
  // Description et contenu
  description: string;
  short_description: string;
  features: string[];
  specifications: Record<string, unknown>[];
  
  // Images et médias
  image_url: string;
  images: string[];
  video_url: string;
  gallery_images: string[];
  
  // Fichiers et téléchargements
  downloadable_files: Record<string, unknown>[];
  file_access_type: string;
  download_limit: number | null;
  download_expiry_days: number | null;
  
  // Champs personnalisés
  custom_fields: Record<string, unknown>[];
  
  // FAQ
  faqs: Record<string, unknown>[];
  
  // SEO et métadonnées
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
  og_image: string;
  og_title: string;
  og_description: string;
  
  // Analytics et tracking
  analytics_enabled: boolean;
  track_views: boolean;
  track_clicks: boolean;
  track_purchases: boolean;
  track_time_spent: boolean;
  google_analytics_id: string;
  facebook_pixel_id: string;
  google_tag_manager_id: string;
  tiktok_pixel_id: string;
  pinterest_pixel_id: string;
  advanced_tracking: boolean;
  custom_events: string[];
  
  // Pixels et tracking
  pixels_enabled: boolean;
  conversion_pixels: Record<string, unknown>[];
  retargeting_pixels: Record<string, unknown>[];
  
  // Variantes et attributs
  variants: Record<string, unknown>[];
  color_variants: boolean;
  size_variants: boolean;
  pattern_variants: boolean;
  finish_variants: boolean;
  dimension_variants: boolean;
  weight_variants: boolean;
  centralized_stock: boolean;
  low_stock_alerts: boolean;
  preorder_allowed: boolean;
  hide_when_out_of_stock: boolean;
  different_prices_per_variant: boolean;
  price_surcharge: boolean;
  quantity_discounts: boolean;
  
  // Promotions
  promotions_enabled: boolean;
  discount_percentage: boolean;
  discount_fixed: boolean;
  buy_one_get_one: boolean;
  family_pack: boolean;
  flash_sale: boolean;
  first_order_discount: boolean;
  loyalty_discount: boolean;
  birthday_discount: boolean;
  advanced_promotions: boolean;
  cumulative_promotions: boolean;
  automatic_promotions: boolean;
  promotion_notifications: boolean;
  geolocated_promotions: boolean;
  
  // Visibilité et accès
  is_active: boolean;
  is_featured: boolean;
  hide_from_store: boolean;
  password_protected: boolean;
  product_password: string;
  purchase_limit: number | null;
  hide_purchase_count: boolean;
  access_control: string;
  
  // Dates de vente
  sale_start_date: string | null;
  sale_end_date: string | null;
  
  // Livraison et expédition
  collect_shipping_address: boolean;
  shipping_required: boolean;
  shipping_cost: number;
  free_shipping_threshold: number | null;
  
  // Support et guides
  post_purchase_guide_url: string;
  support_email: string;
  documentation_url: string;
  
  // État et statut
  is_draft: boolean;
  status: string;
  
  // Métadonnées techniques
  created_at: string;
  updated_at: string;
  version: number;
}

// Données par défaut vides pour création d'un nouveau produit
const getEmptyFormData = (): ProductFormData => ({
  // Informations de base
  name: "",
  slug: "",
  category: "",
  product_type: "",
  pricing_model: "one-time",
  price: null,
  promotional_price: null,
  currency: "XOF",
  
  // Description et contenu
  description: "",
  short_description: "",
  features: [],
  specifications: [],
  
  // Images et médias
  image_url: "",
  images: [],
  video_url: "",
  gallery_images: [],
  
  // Fichiers et téléchargements
  downloadable_files: [],
  file_access_type: "immediate",
  download_limit: null,
  download_expiry_days: null,
  
  // Champs personnalisés
  custom_fields: [],
  
  // FAQ
  faqs: [],
  
  // SEO et métadonnées
  meta_title: "",
  meta_description: "",
  meta_keywords: "",
  og_image: "",
  og_title: "",
  og_description: "",
  
  // Analytics et tracking
  analytics_enabled: false,
  track_views: false,
  track_clicks: false,
  track_purchases: false,
  track_time_spent: false,
  google_analytics_id: "",
  facebook_pixel_id: "",
  google_tag_manager_id: "",
  tiktok_pixel_id: "",
  pinterest_pixel_id: "",
  advanced_tracking: false,
  custom_events: [],
  
  // Pixels et tracking
  pixels_enabled: false,
  conversion_pixels: [],
  retargeting_pixels: [],
  
  // Variantes et attributs
  variants: [],
  color_variants: false,
  size_variants: false,
  pattern_variants: false,
  finish_variants: false,
  dimension_variants: false,
  weight_variants: false,
  centralized_stock: false,
  low_stock_alerts: false,
  preorder_allowed: false,
  hide_when_out_of_stock: false,
  different_prices_per_variant: false,
  price_surcharge: false,
  quantity_discounts: false,
  
  // Promotions
  promotions_enabled: false,
  discount_percentage: false,
  discount_fixed: false,
  buy_one_get_one: false,
  family_pack: false,
  flash_sale: false,
  first_order_discount: false,
  loyalty_discount: false,
  birthday_discount: false,
  advanced_promotions: false,
  cumulative_promotions: false,
  automatic_promotions: false,
  promotion_notifications: false,
  geolocated_promotions: false,
  
  // Visibilité et accès
  is_active: false,
  is_featured: false,
  hide_from_store: false,
  password_protected: false,
  product_password: "",
  purchase_limit: null,
  hide_purchase_count: false,
  access_control: "public",
  
  // Dates de vente
  sale_start_date: null,
  sale_end_date: null,
  
  // Livraison et expédition
  collect_shipping_address: false,
  shipping_required: false,
  shipping_cost: 0,
  free_shipping_threshold: null,
  
  // Support et guides
  post_purchase_guide_url: "",
  support_email: "",
  documentation_url: "",
  
  // État et statut
  is_draft: true,
  status: "draft",
  
  // Métadonnées techniques
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  version: 1,
});

export const ProductForm = ({ storeId, storeSlug, productId, initialData, onSuccess }: ProductFormProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const fromUrl = urlParams.get('tab');
    const allowed = new Set(['info','description','visual','files','custom','faq','seo','analytics','pixels','variants','promotions','payment']);
    if (fromUrl && allowed.has(fromUrl)) return fromUrl;
    return localStorage.getItem('productFormActiveTab') || sessionStorage.getItem('productFormActiveTab') || 'info';
  });
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // État du formulaire avec données vides par défaut
  const [formData, setFormData] = useState<ProductFormData>(() => {
    if (initialData) {
      return { ...getEmptyFormData(), ...initialData };
    }
    return getEmptyFormData();
  });

  const updateFormData = (field: string, value: string | number | boolean | string[] | Record<string, unknown>[]) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-generate slug from name
    if (field === "name" && !productId) {
      setFormData(prev => ({ ...prev, slug: generateSlug(value) }));
    }
    
    // Clear validation error when user starts typing
    if (validationErrors[field]) {
      setValidationErrors(prev => ({ ...prev, [field]: "" }));
    }
  };

  const checkSlugAvailability = async (slug: string): Promise<boolean> => {
    if (!slug) return false;
    
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id')
        .eq('slug', slug)
        .eq('store_id', storeId)
        .neq('id', productId || '');
      
      if (error) throw error;
      return data.length === 0;
    } catch (error) {
      console.error('Error checking slug availability:', error);
      return false;
    }
  };

  // Helpers Zod -> erreurs inline
  const zodToFieldErrors = (err: z.ZodError): Record<string, string> => {
    const out: Record<string, string> = {};
    for (const issue of err.issues) {
      const path = issue.path.join(".") || "form";
      if (!out[path]) out[path] = issue.message;
    }
    return out;
  };

  // Sauvegarde du produit
  const saveProduct = async (status: 'draft' | 'published' = 'draft') => {
    // 1) Validation Zod (draft = partielle, publish = complète)
    const schema = status === 'published' ? productCompleteSchema : productCompleteSchema.partial();
    // Normaliser les FAQ (dates en ISO string pour la validation et la persistance)
    const normalizedFormData = {
      ...formData,
      faqs: (formData.faqs || []).map((f: any, idx: number) => ({
        ...f,
        order: typeof f.order === 'number' ? f.order : idx,
        createdAt: typeof f.createdAt === 'string' ? f.createdAt : new Date(f.createdAt).toISOString(),
        updatedAt: typeof f.updatedAt === 'string' ? f.updatedAt : new Date(f.updatedAt).toISOString(),
      })),
    };
    const parsed = schema.safeParse(normalizedFormData);
    if (!parsed.success) {
      setValidationErrors(zodToFieldErrors(parsed.error));
      toast({
        title: "Erreur de validation",
        description: status === 'published' ? "Complétez les champs requis pour publier" : "Corrigez les champs invalides",
        variant: "destructive",
      });
      return;
    }

    // 2) Règles additionnelles: prix obligatoire si pas 'free'
    if (formData.pricing_model !== 'free' && (formData.price === null || formData.price === undefined)) {
      setValidationErrors(prev => ({ ...prev, price: "Le prix est requis (modèle non gratuit)" }));
      toast({ title: "Prix requis", description: "Renseignez un prix valide", variant: "destructive" });
      return;
    }

    // 3) Slug unique (contrôle final serveur)
    const available = await checkSlugAvailability(formData.slug);
    if (!available) {
      setValidationErrors(prev => ({ ...prev, slug: "Ce slug est déjà utilisé dans votre boutique" }));
      toast({ title: "URL déjà utilisée", description: "Modifiez l'URL (slug) du produit", variant: "destructive" });
      return;
    }

    setLoading(true);
    
    try {
      // Filtrer les données pour ne garder que les champs valides pour la base de données
      const productData = {
        name: formData.name,
        slug: formData.slug,
        category: formData.category,
        product_type: formData.product_type,
        pricing_model: formData.pricing_model,
        price: formData.price,
        promotional_price: formData.promotional_price,
        currency: formData.currency,
        description: formData.description,
        short_description: formData.short_description,
        image_url: formData.image_url,
        video_url: formData.video_url,
        meta_title: formData.meta_title,
        meta_description: formData.meta_description,
        meta_keywords: formData.meta_keywords,
        faqs: normalizedFormData.faqs,
        is_active: status === 'published',
        is_draft: status === 'draft',
        status: status,
        collect_shipping_address: formData.collect_shipping_address,
        shipping_required: formData.shipping_required,
        shipping_cost: formData.shipping_cost,
        free_shipping_threshold: formData.free_shipping_threshold,
        created_at: formData.created_at,
        updated_at: new Date().toISOString(),
      };

      let result;
      if (productId) {
        // Mise à jour
        const { data, error } = await supabase
          .from('products')
          .update(productData)
          .eq('id', productId)
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      } else {
        // Création
        const { data, error } = await supabase
          .from('products')
          .insert([{ ...productData, store_id: storeId }])
          .select()
          .single();
        
        if (error) throw error;
        result = data;
      }

      toast({
        title: status === 'published' ? "Produit publié" : "Produit sauvegardé",
        description: `Le produit "${formData.name}" a été ${status === 'published' ? 'publié' : 'sauvegardé'} avec succès`,
      });

      if (onSuccess) {
        onSuccess();
      } else {
        navigate(`/admin/products/${result.id}`);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la sauvegarde",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = () => saveProduct('draft');
  const handlePublish = () => saveProduct('published');

  // Persistance de l'onglet actif
  useEffect(() => {
    sessionStorage.setItem('productFormActiveTab', activeTab);
    localStorage.setItem('productFormActiveTab', activeTab);
    // Sync URL query param ?tab=activeTab (preserve other params)
    const search = new URLSearchParams(location.search);
    if (search.get('tab') !== activeTab) {
      search.set('tab', activeTab);
      navigate({ pathname: location.pathname, search: `?${search.toString()}` }, { replace: true });
    }
  }, [activeTab]);

  // Si le paramètre d'URL change (navigation externe), synchroniser l'état
  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const fromUrl = search.get('tab');
    if (fromUrl && fromUrl !== activeTab) {
      setActiveTab(fromUrl);
    }
  }, [location.search]);

  // Bouton Voir: ouvre la page produit si publié, sinon preview locale
  const handleView = () => {
    if (formData.slug && formData.is_active) {
      window.open(`/stores/${storeSlug}/products/${formData.slug}`, '_blank');
      return;
    }
    // preview locale simple: ouvre une fenêtre avec un rendu minimal
    const preview = window.open('', '_blank');
    if (preview) {
      preview.document.write(`<title>Prévisualisation produit</title><div style="font-family:system-ui;padding:24px;color:#e5e7eb;background:#0b1220"><h1 style="margin:0 0 8px">${formData.name || 'Produit sans titre'}</h1><p style="opacity:.8;margin:0 0 12px">${formData.short_description || ''}</p>${formData.image_url ? `<img src="${formData.image_url}" style="max-width:100%;border-radius:8px"/>` : ''}<p style="margin-top:12px;font-weight:600">${formData.price ? `${formData.price} ${formData.currency}` : ''}</p></div>`);
      preview.document.close();
    }
  };

  return (
    <div className="product-form-container">
      <Card className="product-card">
        <CardContent className="p-6">
          {/* En-tête avec titre et boutons d'action */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="theme-section-title text-2xl">
                {productId ? "Modifier le produit" : "Créer un produit"}
              </h1>
              <p className="theme-section-description">
                {productId ? "Modifiez les informations de votre produit" : "Remplissez les informations pour créer un nouveau produit"}
              </p>
            </div>
            
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={handleView}
                className="theme-button-outline"
              >
                <Eye className="h-4 w-4 mr-2" />
                Voir
              </Button>
              
              <Button
                onClick={handleSave}
                disabled={loading}
                className="theme-button-outline"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Enregistrer
              </Button>
              
              <Button
                onClick={handlePublish}
                disabled={loading}
                className="theme-button"
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                )}
                Publier
              </Button>
              
              <Button variant="ghost" size="sm">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Indicateur de validation */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <div className="flex items-center gap-2 text-red-500 mb-2">
                <AlertCircle className="h-4 w-4" />
                <span className="font-medium">Erreurs de validation</span>
              </div>
              <ul className="text-sm text-red-400 space-y-1">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <li key={field}>• {error}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Onglets */}
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="product-tabs-list grid w-full grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 xl:grid-cols-7 mb-6 h-auto gap-1 overflow-x-auto">
              <TabsTrigger value="info" className="product-tab-trigger">
                <span className="hidden sm:inline">Informations</span>
                <span className="sm:hidden">Info</span>
              </TabsTrigger>
              <TabsTrigger value="description" className="product-tab-trigger">
                <span className="hidden sm:inline">Description</span>
                <span className="sm:hidden">Desc</span>
              </TabsTrigger>
              <TabsTrigger value="visual" className="product-tab-trigger">
                <span className="hidden sm:inline">Visuel</span>
                <span className="sm:hidden">Vis</span>
              </TabsTrigger>
              <TabsTrigger value="files" className="product-tab-trigger">
                <span className="hidden sm:inline">Fichiers</span>
                <span className="sm:hidden">Files</span>
              </TabsTrigger>
              <TabsTrigger value="custom" className="product-tab-trigger">
                <span className="hidden sm:inline">Champs perso.</span>
                <span className="sm:hidden">Perso</span>
              </TabsTrigger>
              <TabsTrigger value="faq" className="product-tab-trigger">
                FAQ
              </TabsTrigger>
              <TabsTrigger value="seo" className="product-tab-trigger">
                SEO
              </TabsTrigger>
              <TabsTrigger value="analytics" className="product-tab-trigger">
                Analytics
              </TabsTrigger>
              <TabsTrigger value="pixels" className="product-tab-trigger">
                Pixels
              </TabsTrigger>
              <TabsTrigger value="variants" className="product-tab-trigger">
                Variantes
              </TabsTrigger>
              <TabsTrigger value="promotions" className="product-tab-trigger">
                Promotions
              </TabsTrigger>
              <TabsTrigger value="payment" className="product-tab-trigger">
                Paiements
              </TabsTrigger>
            </TabsList>

            {/* Contenu des onglets */}
            <TabsContent value="info" className="mt-6">
              <ProductInfoTab
                formData={formData}
                updateFormData={updateFormData}
                storeId={storeId}
                storeSlug={storeSlug}
                checkSlugAvailability={checkSlugAvailability}
                validationErrors={validationErrors}
              />
            </TabsContent>

            <TabsContent value="description" className="mt-6">
              <ProductDescriptionTab
                formData={formData}
                updateFormData={updateFormData}
              />
            </TabsContent>

            <TabsContent value="visual" className="mt-6">
              <ProductVisualTab
                formData={formData}
                updateFormData={updateFormData}
                storeId={storeId}
              />
            </TabsContent>

            <TabsContent value="files" className="mt-6">
              <ProductFilesTab
                formData={formData}
                updateFormData={updateFormData}
                storeId={storeId}
              />
            </TabsContent>

            <TabsContent value="custom" className="mt-6">
              <ProductCustomFieldsTab
                formData={formData}
                updateFormData={updateFormData}
              />
            </TabsContent>

            <TabsContent value="faq" className="mt-6">
              <ProductFAQTab
                formData={formData}
                updateFormData={updateFormData}
              />
            </TabsContent>

            <TabsContent value="seo" className="mt-6">
              <ProductSeoTab
                formData={formData}
                updateFormData={updateFormData}
              />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <ProductAnalyticsTab
                formData={formData}
                updateFormData={updateFormData}
              />
            </TabsContent>

            <TabsContent value="pixels" className="mt-6">
              <ProductPixelsTab
                formData={formData}
                updateFormData={updateFormData}
              />
            </TabsContent>

            <TabsContent value="variants" className="mt-6">
              <ProductVariantsTab
                formData={formData}
                updateFormData={updateFormData}
              />
            </TabsContent>

            <TabsContent value="promotions" className="mt-6">
              <ProductPromotionsTab
                formData={formData}
                updateFormData={updateFormData}
              />
            </TabsContent>

            <TabsContent value="payment" className="mt-6">
              <div className="space-y-6">
                <div className="text-center">
                  <h3 className="text-lg font-semibold mb-2">Configuration des paiements</h3>
                  <p className="text-muted-foreground">
                    Configurez les options de paiement pour ce produit
                  </p>
                </div>
                
                <PaymentSelection
                  orderId="preview-order"
                  customerId="preview-customer"
                  storeId={storeId}
                  totalAmount={Number(formData.price) || 0}
                  productType={formData.product_type as 'physical' | 'digital' | 'service'}
                  onPaymentMethodSelected={(method) => {
                    console.log('Méthode de paiement sélectionnée:', method);
                  }}
                  onPaymentCreated={(payment) => {
                    console.log('Paiement créé:', payment);
                  }}
                  onCancel={() => {
                    console.log('Paiement annulé');
                  }}
                />
              </div>
            </TabsContent>

          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
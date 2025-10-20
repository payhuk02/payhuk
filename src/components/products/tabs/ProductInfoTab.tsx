import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CurrencySelect } from "@/components/ui/currency-select";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { CalendarIcon, CheckCircle2, XCircle, Package, Smartphone, Wrench, Info, Zap, Shield, Clock, Users, Target, Globe, Eye, ShoppingCart, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { generateSlug } from "@/lib/store-utils";

interface ProductInfoTabProps {
  formData: Record<string, unknown>;
  updateFormData: (field: string, value: string | number | boolean | string[] | Record<string, unknown>[]) => void;
  storeId: string;
  storeSlug: string;
  checkSlugAvailability: (slug: string) => Promise<boolean>;
  validationErrors?: Record<string, string>;
}

// Constantes pour les choix dynamiques
const PRODUCT_TYPES = [
  { value: "digital", label: "Produit Digital", icon: Smartphone, description: "Ebooks, formations, logiciels, templates, fichiers téléchargeables" },
  { value: "physical", label: "Produit Physique", icon: Package, description: "Vêtements, accessoires, objets artisanaux, produits manufacturés" },
  { value: "service", label: "Service", icon: Wrench, description: "Consultations, coaching, design, développement, maintenance" },
];

const DIGITAL_CATEGORIES = [
  "Formation", "Ebook", "Template", "Logiciel", "Cours en ligne", 
  "Guide", "Checklist", "Fichier audio", "Vidéo", "Application mobile"
];

const PHYSICAL_CATEGORIES = [
  "Vêtements", "Accessoires", "Artisanat", "Électronique", "Maison & Jardin",
  "Sport", "Beauté", "Livres", "Jouets", "Alimentation"
];

const SERVICE_CATEGORIES = [
  "Consultation", "Coaching", "Design", "Développement", "Marketing",
  "Rédaction", "Traduction", "Maintenance", "Formation", "Conseil"
];

const PRICING_MODELS = [
  { value: "one-time", label: "Paiement unique", description: "Les clients paient une seule fois" },
  { value: "subscription", label: "Abonnement", description: "Paiement récurrent mensuel/annuel" },
  { value: "pay-what-you-want", label: "Prix libre", description: "Le client choisit le montant" },
  { value: "free", label: "Gratuit", description: "Produit gratuit" },
];

const ACCESS_CONTROLS = [
  { value: "public", label: "Public", description: "Tout le monde peut voir et acheter" },
  { value: "logged_in", label: "Utilisateurs connectés", description: "Seuls les utilisateurs connectés" },
  { value: "purchasers", label: "Acheteurs uniquement", description: "Seuls les acheteurs précédents" },
];

export const ProductInfoTab = ({ formData, updateFormData, storeSlug, checkSlugAvailability, validationErrors = {} }: ProductInfoTabProps) => {
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);
  const [checkingSlug, setCheckingSlug] = useState(false);

  useEffect(() => {
    const checkSlug = async () => {
      if (formData.slug) {
        setCheckingSlug(true);
        const available = await checkSlugAvailability(formData.slug);
        setSlugAvailable(available);
        setCheckingSlug(false);
      }
    };
    const timeout = setTimeout(checkSlug, 500);
    return () => clearTimeout(timeout);
  }, [formData.slug]);

  const productUrl = `${window.location.origin}/${storeSlug}/${formData.slug}`;

  // Obtenir les catégories selon le type de produit
  const getCategories = () => {
    switch (formData.product_type) {
      case "digital": return DIGITAL_CATEGORIES;
      case "physical": return PHYSICAL_CATEGORIES;
      case "service": return SERVICE_CATEGORIES;
      default: return [];
    }
  };

  return (
    <div className="space-y-6">
      {/* Sélecteur de type de produit */}
      <div className="modern-section">
        <div className="modern-section-header">
          <Package className="modern-icon modern-icon-primary" />
          <h3 className="modern-section-title">Type de produit</h3>
        </div>
        <p className="modern-section-description">
          Choisissez le type de produit que vous souhaitez vendre
        </p>
        
        <div className="modern-grid modern-grid-cols-3">
          {PRODUCT_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <div
                key={type.value}
                className={cn(
                  "p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                  formData.product_type === type.value 
                    ? "border-[var(--primary)] bg-[var(--primary-light)]" 
                    : "border-[var(--border)] hover:border-[var(--primary)]"
                )}
                onClick={() => updateFormData("product_type", type.value)}
              >
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="h-6 w-6 modern-icon modern-icon-primary" />
                  <h3 className="font-semibold">{type.label}</h3>
                </div>
                <p className="text-sm modern-description mb-3">
                  {type.description}
                </p>
                <div className="flex flex-wrap gap-1">
                  {type.value === "digital" && (
                    <>
                      <span className="modern-badge modern-badge-success">Téléchargement instantané</span>
                      <span className="modern-badge modern-badge-primary">Pas de stock</span>
                      <span className="modern-badge modern-badge-success">Livraison automatique</span>
                    </>
                  )}
                  {type.value === "physical" && (
                    <>
                      <span className="modern-badge modern-badge-warning">Livraison requise</span>
                      <span className="modern-badge modern-badge-primary">Gestion stock</span>
                      <span className="modern-badge modern-badge-primary">Adresse client</span>
                    </>
                  )}
                  {type.value === "service" && (
                    <>
                      <span className="modern-badge modern-badge-primary">Rendez-vous</span>
                      <span className="modern-badge modern-badge-primary">Prestation</span>
                      <span className="modern-badge modern-badge-primary">Sur mesure</span>
                    </>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        
        {validationErrors.product_type && (
          <p className="text-red-400 text-sm mt-2 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {validationErrors.product_type}
          </p>
        )}
      </div>

      {/* Informations de base */}
      <div className="modern-section">
        <div className="modern-section-header">
          <Info className="modern-icon" />
          <h3 className="modern-section-title">Informations de base</h3>
        </div>
        <p className="modern-section-description">
          Renseignez les informations essentielles de votre produit
        </p>
        
        <div className="space-y-4">
          <div>
            <Label className="product-label">Nom du produit *</Label>
            <Input
              value={formData.name}
              onChange={(e) => updateFormData("name", e.target.value)}
              placeholder="Ex: Guide complet Facebook Ads 2025"
              className={cn("modern-input", validationErrors.name && "border-red-500")}
            />
            {validationErrors.name && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.name}
              </p>
            )}
          </div>

          <div>
            <Label className="product-label">URL du produit *</Label>
            <div className="space-y-2">
              <div className="flex gap-2">
                <Input
                  value={formData.slug}
                  onChange={(e) => updateFormData("slug", generateSlug(e.target.value))}
                  placeholder="guide-facebook-ads-2025"
                  className={cn("modern-input flex-1", validationErrors.slug && "border-red-500")}
                />
                {checkingSlug ? (
                  <div className="flex items-center text-gray-400">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-400"></div>
                  </div>
                ) : slugAvailable === true ? (
                  <div className="flex items-center text-green-400">
                    <CheckCircle2 className="h-5 w-5" />
                  </div>
                ) : slugAvailable === false ? (
                  <div className="flex items-center text-red-400">
                    <XCircle className="h-5 w-5" />
                  </div>
                ) : null}
              </div>
              <p className="text-sm text-gray-600 break-all">
                URL complète : <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs text-gray-800">{productUrl}</span>
              </p>
              {validationErrors.slug && (
                <p className="text-red-400 text-sm flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.slug}
                </p>
              )}
            </div>
          </div>

          <div className="modern-grid modern-grid-cols-2">
            <div>
              <Label className="product-label">Catégorie *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => updateFormData("category", value)}
              >
                <SelectTrigger className={cn("modern-input", validationErrors.category && "border-red-500")}>
                  <SelectValue placeholder="Sélectionnez une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {getCategories().map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.category && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.category}
                </p>
              )}
            </div>
            <div>
              <Label className="product-label">Modèle de tarification *</Label>
              <Select 
                value={formData.pricing_model} 
                onValueChange={(value) => updateFormData("pricing_model", value)}
              >
                <SelectTrigger className={cn("modern-input", validationErrors.pricing_model && "border-red-500")}>
                  <SelectValue placeholder="Sélectionnez un modèle" />
                </SelectTrigger>
                <SelectContent>
                  {PRICING_MODELS.map((model) => (
                    <SelectItem key={model.value} value={model.value}>
                      <div>
                        <div className="font-medium">{model.label}</div>
                        <div className="text-xs text-gray-600">{model.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {validationErrors.pricing_model && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.pricing_model}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Prix et tarification */}
      <div className="modern-section">
        <div className="modern-section-header">
          <Zap className="modern-icon" />
          <h3 className="modern-section-title">Prix et tarification</h3>
        </div>
        <p className="modern-section-description">
          Configurez le prix et le modèle de tarification de votre produit
        </p>
        
        <div className="space-y-4">
          <div className="modern-grid modern-grid-cols-2">
            <div>
              <Label className="product-label">Prix *</Label>
              <Input
                type="number"
                value={formData.price || ""}
                onChange={(e) => updateFormData("price", e.target.value ? parseFloat(e.target.value) : null)}
                placeholder="Entrez le prix"
                className={cn("modern-input", validationErrors.price && "border-red-500")}
              />
              {validationErrors.price && (
                <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                  <AlertCircle className="h-4 w-4" />
                  {validationErrors.price}
                </p>
              )}
            </div>
            <div>
              <Label className="product-label">Devise *</Label>
              <CurrencySelect
                value={formData.currency}
                onValueChange={(value) => updateFormData("currency", value)}
                className="modern-input"
              />
            </div>
          </div>

          <div>
            <Label className="product-label">Prix promotionnel</Label>
            <Input
              type="number"
              value={formData.promotional_price || ""}
              onChange={(e) => updateFormData("promotional_price", e.target.value ? parseFloat(e.target.value) : null)}
              placeholder="0"
              className={cn("modern-input", validationErrors.promotional_price && "border-red-500")}
            />
            {validationErrors.promotional_price && (
              <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                <AlertCircle className="h-4 w-4" />
                {validationErrors.promotional_price}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Visibilité et accès */}
      <div className="modern-section">
        <div className="modern-section-header">
          <Eye className="modern-icon" />
          <h3 className="modern-section-title">Visibilité et accès</h3>
        </div>
        <p className="modern-section-description">
          Contrôlez qui peut voir et acheter votre produit
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="product-label">Produit actif</Label>
              <p className="modern-description">Rendre le produit visible et achetable</p>
            </div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => updateFormData("is_active", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="product-label">Mettre en avant</Label>
              <p className="modern-description">Afficher ce produit sur la page d'accueil</p>
            </div>
            <Switch
              checked={formData.is_featured}
              onCheckedChange={(checked) => updateFormData("is_featured", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="product-label">Masquer de la boutique</Label>
              <p className="modern-description">Le produit ne sera pas listé publiquement</p>
            </div>
            <Switch
              checked={formData.hide_from_store}
              onCheckedChange={(checked) => updateFormData("hide_from_store", checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="product-label">Protéger par mot de passe</Label>
              <p className="modern-description">Un mot de passe sera requis pour accéder au produit</p>
            </div>
            <Switch
              checked={formData.password_protected}
              onCheckedChange={(checked) => updateFormData("password_protected", checked)}
            />
          </div>
          
          {formData.password_protected && (
            <div>
              <Label className="product-label">Mot de passe du produit</Label>
              <Input
                type="password"
                value={formData.product_password}
                onChange={(e) => updateFormData("product_password", e.target.value)}
                placeholder="Mot de passe sécurisé"
                className="modern-input"
              />
            </div>
          )}

          <div>
            <Label className="product-label">Contrôle d'accès</Label>
            <Select 
              value={formData.access_control} 
              onValueChange={(value) => updateFormData("access_control", value)}
            >
              <SelectTrigger className="modern-input">
                <SelectValue placeholder="Sélectionner le contrôle d'accès" />
              </SelectTrigger>
              <SelectContent>
                {ACCESS_CONTROLS.map((control) => (
                  <SelectItem key={control.value} value={control.value}>
                    <div>
                      <div className="font-medium">{control.label}</div>
                      <div className="text-xs text-gray-600">{control.description}</div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Options d'achat */}
      <div className="modern-section">
        <div className="modern-section-header">
          <ShoppingCart className="modern-icon" />
          <h3 className="modern-section-title">Options d'achat</h3>
        </div>
        <p className="modern-section-description">
          Configurez les règles d'achat pour ce produit
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="product-label">Limite d'achat par client</Label>
              <p className="modern-description">Nombre maximum d'achats par client</p>
            </div>
            <Input
              type="number"
              value={formData.purchase_limit || ""}
              onChange={(e) => updateFormData("purchase_limit", parseInt(e.target.value) || null)}
              placeholder="0 = illimité"
              className="modern-input w-24"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="product-label">Masquer le nombre d'achats</Label>
              <p className="modern-description">Ne pas afficher le nombre d'achats</p>
            </div>
            <Switch
              checked={formData.hide_purchase_count}
              onCheckedChange={(checked) => updateFormData("hide_purchase_count", checked)}
            />
          </div>
        </div>
      </div>

      {/* Dates de vente */}
      <div className="modern-section">
        <div className="modern-section-header">
          <CalendarIcon className="modern-icon" />
          <h3 className="modern-section-title">Dates de vente</h3>
        </div>
        <p className="modern-section-description">
          Définissez des périodes spécifiques pour la vente
        </p>
        
        <div className="modern-grid modern-grid-cols-2">
          <div>
            <Label className="product-label">Date de début de vente</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal modern-input",
                    !formData.sale_start_date && "text-gray-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.sale_start_date ? format(new Date(formData.sale_start_date), "PPP") : <span>Sélectionner une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 product-popover">
                <Calendar
                  mode="single"
                  selected={formData.sale_start_date ? new Date(formData.sale_start_date) : undefined}
                  onSelect={(date) => updateFormData("sale_start_date", date?.toISOString() || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
          <div>
            <Label className="product-label">Date de fin de vente</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal modern-input",
                    !formData.sale_end_date && "text-gray-500"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.sale_end_date ? format(new Date(formData.sale_end_date), "PPP") : <span>Sélectionner une date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 product-popover">
                <Calendar
                  mode="single"
                  selected={formData.sale_end_date ? new Date(formData.sale_end_date) : undefined}
                  onSelect={(date) => updateFormData("sale_end_date", date?.toISOString() || null)}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
      </div>

      {/* Métadonnées techniques */}
      <div className="modern-section">
        <div className="modern-section-header">
          <Globe className="modern-icon" />
          <h3 className="modern-section-title">Métadonnées techniques</h3>
        </div>
        <p className="modern-section-description">
          Informations système sur le produit
        </p>
        
        <div className="modern-grid modern-grid-cols-2">
          <div>
            <Label className="product-label">Créé le</Label>
            <Input 
              value={formData.created_at ? format(new Date(formData.created_at), "PPP p") : "N/A"} 
              readOnly 
              className="modern-input" 
            />
          </div>
          <div>
            <Label className="product-label">Dernière mise à jour</Label>
            <Input 
              value={formData.updated_at ? format(new Date(formData.updated_at), "PPP p") : "N/A"} 
              readOnly 
              className="modern-input" 
            />
          </div>
          <div>
            <Label className="product-label">Version</Label>
            <Input 
              value={formData.version || "1.0.0"} 
              readOnly 
              className="modern-input" 
            />
          </div>
          <div>
            <Label className="product-label">Statut</Label>
            <Input 
              value={formData.status || "Brouillon"} 
              readOnly 
              className="modern-input" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};
import { z } from 'zod';
import { isValidEmail, isValidPhone, isValidAmount } from '@/lib/validation';

/**
 * Schémas de validation Zod pour les formulaires
 */

// Schéma simplifié pour les produits (formulaire de base)
export const productSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  
  description: z.string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional(),
  
  price: z.number()
    .positive('Le prix doit être positif')
    .max(1000000, 'Le prix ne peut pas dépasser 1,000,000'),
  
  currency: z.string()
    .length(3, 'La devise doit contenir 3 caractères')
    .regex(/^[A-Z]{3}$/, 'Format de devise invalide'),
  
  category: z.string()
    .min(2, 'La catégorie doit contenir au moins 2 caractères')
    .max(50, 'La catégorie ne peut pas dépasser 50 caractères'),
  
  product_type: z.enum(['digital', 'physical', 'service'], {
    errorMap: () => ({ message: 'Type de produit invalide' })
  }),
  
  image_url: z.string()
    .url('URL d\'image invalide')
    .optional()
    .or(z.literal('')),
});

// Schéma FAQ détaillé
export const faqItemSchema = z.object({
  id: z.string(),
  question: z.string().min(3, 'La question est requise'),
  answer: z.string().min(3, 'La réponse est requise'),
  category: z.string().optional().or(z.literal('')),
  order: z.number().int().min(0),
  isActive: z.boolean(),
  isFeatured: z.boolean(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

// Schéma complet pour les produits
export const productCompleteSchema = z.object({
  // Informations de base
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères')
    .refine(val => val.trim().length > 0, 'Le nom est requis'),
  
  slug: z.string()
    .min(2, 'Le slug doit contenir au moins 2 caractères')
    .max(50, 'Le slug ne peut pas dépasser 50 caractères')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Format de slug invalide'),
  
  category: z.string()
    .min(2, 'La catégorie doit contenir au moins 2 caractères')
    .max(50, 'La catégorie ne peut pas dépasser 50 caractères'),
  
  product_type: z.enum(['digital', 'physical', 'service'], {
    errorMap: () => ({ message: 'Type de produit invalide' })
  }),
  
  pricing_model: z.enum(['one-time', 'subscription', 'pay-what-you-want', 'free'], {
    errorMap: () => ({ message: 'Modèle de tarification invalide' })
  }),
  
  price: z.number()
    .positive('Le prix doit être positif')
    .max(1000000, 'Le prix ne peut pas dépasser 1,000,000')
    .refine(isValidAmount, 'Montant invalide'),
  
  promotional_price: z.number()
    .positive('Le prix promotionnel doit être positif')
    .max(1000000, 'Le prix promotionnel ne peut pas dépasser 1,000,000')
    .optional()
    .nullable(),
  
  currency: z.string()
    .length(3, 'La devise doit contenir 3 caractères')
    .regex(/^[A-Z]{3}$/, 'Format de devise invalide'),
  
  // Description et contenu
  description: z.string()
    .max(2000, 'La description ne peut pas dépasser 2000 caractères')
    .optional(),
  
  short_description: z.string()
    .max(500, 'La description courte ne peut pas dépasser 500 caractères')
    .optional(),
  
  features: z.array(z.string()).optional(),
  specifications: z.array(z.record(z.unknown())).optional(),
  
  // Images et médias
  image_url: z.string()
    .url('URL d\'image invalide')
    .optional()
    .or(z.literal('')),
  
  images: z.array(z.string().url('URL d\'image invalide')).optional(),
  video_url: z.string().url('URL de vidéo invalide').optional().or(z.literal('')),
  gallery_images: z.array(z.string().url('URL d\'image invalide')).optional(),
  
  // Fichiers et téléchargements
  downloadable_files: z.array(z.record(z.unknown())).optional(),
  file_access_type: z.enum(['immediate', 'after_payment', 'manual']).optional(),
  download_limit: z.number().positive().optional().nullable(),
  download_expiry_days: z.number().positive().optional().nullable(),
  
  // Champs personnalisés
  custom_fields: z.array(z.record(z.unknown())).optional(),
  
  // FAQ
  faqs: z.array(faqItemSchema).optional(),
  
  // SEO et métadonnées
  meta_title: z.string().max(60, 'Le titre SEO ne peut pas dépasser 60 caractères').optional(),
  meta_description: z.string().max(160, 'La description SEO ne peut pas dépasser 160 caractères').optional(),
  meta_keywords: z.string().optional(),
  og_image: z.string().url('URL d\'image Open Graph invalide').optional().or(z.literal('')),
  og_title: z.string().optional(),
  og_description: z.string().optional(),
  
  // Analytics et tracking
  analytics_enabled: z.boolean().optional(),
  track_views: z.boolean().optional(),
  track_clicks: z.boolean().optional(),
  track_purchases: z.boolean().optional(),
  track_time_spent: z.boolean().optional(),
  google_analytics_id: z.string().optional(),
  facebook_pixel_id: z.string().optional(),
  google_tag_manager_id: z.string().optional(),
  tiktok_pixel_id: z.string().optional(),
  pinterest_pixel_id: z.string().optional(),
  advanced_tracking: z.boolean().optional(),
  custom_events: z.array(z.string()).optional(),
  
  // Pixels et tracking
  pixels_enabled: z.boolean().optional(),
  conversion_pixels: z.array(z.record(z.unknown())).optional(),
  retargeting_pixels: z.array(z.record(z.unknown())).optional(),
  
  // Variantes et attributs
  variants: z.array(z.object({
    id: z.string(),
    name: z.string().min(1, 'Nom de variante requis'),
    sku: z.string().optional(),
    values: z.array(z.string()).optional().default([]),
    priceOverride: z.number().optional(),
    stock: z.number().optional(),
    isDefault: z.boolean().optional()
  })).optional(),
  color_variants: z.boolean().optional(),
  size_variants: z.boolean().optional(),
  pattern_variants: z.boolean().optional(),
  finish_variants: z.boolean().optional(),
  dimension_variants: z.boolean().optional(),
  weight_variants: z.boolean().optional(),
  centralized_stock: z.boolean().optional(),
  low_stock_alerts: z.boolean().optional(),
  preorder_allowed: z.boolean().optional(),
  hide_when_out_of_stock: z.boolean().optional(),
  different_prices_per_variant: z.boolean().optional(),
  price_surcharge: z.boolean().optional(),
  quantity_discounts: z.boolean().optional(),
  
  // Promotions
  promotions_enabled: z.boolean().optional(),
  discount_percentage: z.boolean().optional(),
  discount_fixed: z.boolean().optional(),
  buy_one_get_one: z.boolean().optional(),
  family_pack: z.boolean().optional(),
  flash_sale: z.boolean().optional(),
  first_order_discount: z.boolean().optional(),
  loyalty_discount: z.boolean().optional(),
  birthday_discount: z.boolean().optional(),
  advanced_promotions: z.boolean().optional(),
  cumulative_promotions: z.boolean().optional(),
  automatic_promotions: z.boolean().optional(),
  promotion_notifications: z.boolean().optional(),
  geolocated_promotions: z.boolean().optional(),
  
  // Visibilité et accès
  is_active: z.boolean().optional(),
  is_featured: z.boolean().optional(),
  hide_from_store: z.boolean().optional(),
  password_protected: z.boolean().optional(),
  product_password: z.string().optional(),
  purchase_limit: z.number().positive().optional().nullable(),
  hide_purchase_count: z.boolean().optional(),
  access_control: z.enum(['public', 'logged_in', 'purchasers']).optional(),
  
  // Dates de vente
  sale_start_date: z.string().datetime().optional().nullable(),
  sale_end_date: z.string().datetime().optional().nullable(),
  
  // Livraison et expédition
  collect_shipping_address: z.boolean().optional(),
  shipping_required: z.boolean().optional(),
  shipping_cost: z.number().min(0).optional(),
  free_shipping_threshold: z.number().positive().optional().nullable(),
  
  // Support et guides
  post_purchase_guide_url: z.string().url('URL de guide invalide').optional().or(z.literal('')),
  support_email: z.string().email('Email de support invalide').optional().or(z.literal('')),
  documentation_url: z.string().url('URL de documentation invalide').optional().or(z.literal('')),
  
  // État et statut
  is_draft: z.boolean().optional(),
  status: z.enum(['draft', 'published', 'archived']).optional(),
  
  // Métadonnées techniques
  created_at: z.string().datetime().optional(),
  updated_at: z.string().datetime().optional(),
  version: z.number().positive().optional(),
});

// Schéma pour les commandes
export const orderSchema = z.object({
  customer_name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  
  customer_email: z.string()
    .email('Email invalide')
    .refine(isValidEmail, 'Format d\'email invalide'),
  
  customer_phone: z.string()
    .optional()
    .refine(val => !val || isValidPhone(val), 'Numéro de téléphone invalide'),
  
  total_amount: z.number()
    .positive('Le montant doit être positif')
    .refine(isValidAmount, 'Montant invalide'),
  
  currency: z.string()
    .length(3, 'La devise doit contenir 3 caractères')
    .regex(/^[A-Z]{3}$/, 'Format de devise invalide'),
  
  notes: z.string()
    .max(500, 'Les notes ne peuvent pas dépasser 500 caractères')
    .optional(),
});

// Schéma pour les boutiques
export const storeSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  
  description: z.string()
    .max(1000, 'La description ne peut pas dépasser 1000 caractères')
    .optional(),
  
  slug: z.string()
    .min(2, 'Le slug doit contenir au moins 2 caractères')
    .max(50, 'Le slug ne peut pas dépasser 50 caractères')
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Format de slug invalide'),
  
  contact_email: z.string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  
  contact_phone: z.string()
    .optional()
    .refine(val => !val || isValidPhone(val), 'Numéro de téléphone invalide'),
  
  facebook_url: z.string()
    .url('URL invalide')
    .optional()
    .or(z.literal('')),
  
  instagram_url: z.string()
    .url('URL invalide')
    .optional()
    .or(z.literal('')),
  
  twitter_url: z.string()
    .url('URL invalide')
    .optional()
    .or(z.literal('')),
  
  linkedin_url: z.string()
    .url('URL invalide')
    .optional()
    .or(z.literal('')),
});

// Schéma pour les clients
export const customerSchema = z.object({
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  
  email: z.string()
    .email('Email invalide')
    .optional()
    .or(z.literal('')),
  
  phone: z.string()
    .optional()
    .refine(val => !val || isValidPhone(val), 'Numéro de téléphone invalide'),
  
  address: z.string()
    .max(200, 'L\'adresse ne peut pas dépasser 200 caractères')
    .optional(),
  
  city: z.string()
    .max(50, 'La ville ne peut pas dépasser 50 caractères')
    .optional(),
  
  country: z.string()
    .max(50, 'Le pays ne peut pas dépasser 50 caractères')
    .optional(),
  
  notes: z.string()
    .max(500, 'Les notes ne peuvent pas dépasser 500 caractères')
    .optional(),
});

// Schéma pour l'authentification
export const authSchema = z.object({
  email: z.string()
    .email('Email invalide')
    .refine(isValidEmail, 'Format d\'email invalide'),
  
  password: z.string()
    .min(8, 'Le mot de passe doit contenir au moins 8 caractères')
    .max(100, 'Le mot de passe ne peut pas dépasser 100 caractères')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Le mot de passe doit contenir au moins une minuscule, une majuscule et un chiffre'),
});

// Types TypeScript dérivés des schémas
export type ProductFormData = z.infer<typeof productSchema>;
export type ProductCompleteFormData = z.infer<typeof productCompleteSchema>;
export type OrderFormData = z.infer<typeof orderSchema>;
export type StoreFormData = z.infer<typeof storeSchema>;
export type CustomerFormData = z.infer<typeof customerSchema>;
export type AuthFormData = z.infer<typeof authSchema>;
export type FAQItemFormData = z.infer<typeof faqItemSchema>;

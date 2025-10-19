-- =====================================================
-- CORRECTION DES PROBLÈMES CRITIQUES DE BASE DE DONNÉES
-- =====================================================
-- Ce fichier corrige les erreurs critiques identifiées lors de l'audit
-- 
-- Problèmes corrigés:
-- 1. Colonne order_number manquante dans la table orders
-- 2. Fonctions PostgreSQL manquantes
-- 3. Index manquants pour les performances
-- 4. Contraintes de sécurité renforcées
-- =====================================================

-- 1. CORRECTION DE LA COLONNE ORDER_NUMBER MANQUANTE
-- =====================================================
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS order_number TEXT UNIQUE;

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);

-- Ajouter un commentaire pour la documentation
COMMENT ON COLUMN public.orders.order_number IS 'Numero unique de commande genere automatiquement';

-- 2. CRÉATION DES FONCTIONS MANQUANTES
-- =====================================================

-- Fonction pour générer un numéro de commande unique
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
    order_num TEXT;
    counter INTEGER;
BEGIN
    -- Générer un numéro au format: ORD-YYYYMMDD-XXXX
    -- Utiliser un compteur basé sur la date pour éviter les collisions
    SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 13) AS INTEGER)), 0) + 1
    INTO counter
    FROM orders 
    WHERE order_number LIKE 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%';
    
    order_num := 'ORD-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
    RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un code de parrainage unique
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    referral_code TEXT;
    code_exists BOOLEAN;
BEGIN
    LOOP
        -- Générer un code de 8 caractères alphanumériques en majuscules
        referral_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
        
        -- Vérifier l'unicité dans la table profiles
        SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = generate_referral_code.referral_code)
        INTO code_exists;
        
        -- Si le code n'existe pas, on peut l'utiliser
        EXIT WHEN NOT code_exists;
    END LOOP;
    
    RETURN referral_code;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier la disponibilité d'un slug de produit
CREATE OR REPLACE FUNCTION is_product_slug_available(
    check_slug TEXT,
    check_store_id UUID,
    exclude_product_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    slug_exists BOOLEAN;
BEGIN
    -- Vérifier si le slug existe déjà pour ce store
    SELECT EXISTS(
        SELECT 1 FROM products 
        WHERE slug = check_slug 
        AND store_id = check_store_id
        AND (exclude_product_id IS NULL OR id != exclude_product_id)
    ) INTO slug_exists;
    
    RETURN NOT slug_exists;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour vérifier la disponibilité d'un slug de store
CREATE OR REPLACE FUNCTION is_store_slug_available(
    check_slug TEXT,
    exclude_store_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    slug_exists BOOLEAN;
BEGIN
    -- Vérifier si le slug existe déjà
    SELECT EXISTS(
        SELECT 1 FROM stores 
        WHERE slug = check_slug 
        AND (exclude_store_id IS NULL OR id != exclude_store_id)
    ) INTO slug_exists;
    
    RETURN NOT slug_exists;
END;
$$ LANGUAGE plpgsql;

-- Fonction pour générer un slug à partir d'un texte
CREATE OR REPLACE FUNCTION generate_slug(input_text TEXT)
RETURNS TEXT AS $$
DECLARE
    slug TEXT;
BEGIN
    -- Convertir en minuscules et remplacer les caractères spéciaux
    slug := LOWER(TRIM(input_text));
    slug := REGEXP_REPLACE(slug, '[^a-z0-9\s-]', '', 'g');
    slug := REGEXP_REPLACE(slug, '\s+', '-', 'g');
    slug := REGEXP_REPLACE(slug, '-+', '-', 'g');
    slug := TRIM(slug, '-');
    
    -- S'assurer que le slug n'est pas vide
    IF slug = '' THEN
        slug := 'untitled-' || EXTRACT(EPOCH FROM NOW())::TEXT;
    END IF;
    
    RETURN slug;
END;
$$ LANGUAGE plpgsql;

-- 3. TRIGGER POUR GÉNÉRATION AUTOMATIQUE DU NUMÉRO DE COMMANDE
-- =====================================================
CREATE OR REPLACE FUNCTION set_order_number()
RETURNS TRIGGER AS $$
BEGIN
    -- Générer le numéro de commande si il n'est pas fourni
    IF NEW.order_number IS NULL OR NEW.order_number = '' THEN
        NEW.order_number := generate_order_number();
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Créer le trigger
DROP TRIGGER IF EXISTS trigger_set_order_number ON public.orders;
CREATE TRIGGER trigger_set_order_number
    BEFORE INSERT ON public.orders
    FOR EACH ROW
    EXECUTE FUNCTION set_order_number();

-- 4. INDEX POUR AMÉLIORER LES PERFORMANCES
-- =====================================================

-- Index pour les requêtes fréquentes sur les produits
CREATE INDEX IF NOT EXISTS idx_products_store_active ON public.products(store_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category) WHERE category IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products(created_at DESC);

-- Index pour les commandes
CREATE INDEX IF NOT EXISTS idx_orders_store_status ON public.orders(store_id, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON public.orders(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_orders_customer ON public.orders(customer_id) WHERE customer_id IS NOT NULL;

-- Index pour les transactions
CREATE INDEX IF NOT EXISTS idx_transactions_store_status ON public.transactions(store_id, status);
-- Note: idx_transactions_moneroo_id existe déjà dans la migration précédente

-- Index pour les clients
CREATE INDEX IF NOT EXISTS idx_customers_store ON public.customers(store_id);
-- Note: idx_customers_email existe déjà dans la migration précédente

-- 5. RENFORCEMENT DES CONTRAINTES DE SÉCURITÉ
-- =====================================================

-- Ajouter des contraintes de validation (si elles n'existent pas déjà)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_order_number_format') THEN
        ALTER TABLE public.orders 
        ADD CONSTRAINT check_order_number_format 
        CHECK (order_number ~ '^ORD-\d{8}-\d{4}$');
    END IF;
END $$;

-- Contrainte pour les montants positifs (si elle n'existe pas déjà)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_total_amount_positive') THEN
        ALTER TABLE public.orders 
        ADD CONSTRAINT check_total_amount_positive 
        CHECK (total_amount > 0);
    END IF;
END $$;

-- Contrainte pour les quantités positives (si elle n'existe pas déjà)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_quantity_positive') THEN
        ALTER TABLE public.order_items 
        ADD CONSTRAINT check_quantity_positive 
        CHECK (quantity > 0);
    END IF;
END $$;

-- Contrainte pour les prix positifs (si elle n'existe pas déjà)
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'check_unit_price_positive') THEN
        ALTER TABLE public.order_items 
        ADD CONSTRAINT check_unit_price_positive 
        CHECK (unit_price > 0);
    END IF;
END $$;

-- 6. MISE À JOUR DES COMMENTAIRES POUR LA DOCUMENTATION
-- =====================================================
COMMENT ON FUNCTION generate_order_number() IS 'Genere un numero de commande unique au format ORD-YYYYMMDD-XXXX';
COMMENT ON FUNCTION generate_referral_code() IS 'Genere un code de parrainage unique de 8 caracteres alphanumeriques';
COMMENT ON FUNCTION is_product_slug_available(TEXT, UUID, UUID) IS 'Verifie la disponibilite d''un slug de produit pour un store donne';
COMMENT ON FUNCTION is_store_slug_available(TEXT, UUID) IS 'Verifie la disponibilite d''un slug de store';
COMMENT ON FUNCTION generate_slug(TEXT) IS 'Genere un slug URL-friendly a partir d''un texte';

-- 7. MISE À JOUR DES STATISTICS POUR L'OPTIMISEUR DE REQUETES
-- =====================================================
ANALYZE public.orders;
ANALYZE public.products;
ANALYZE public.transactions;
ANALYZE public.customers;
ANALYZE public.order_items;
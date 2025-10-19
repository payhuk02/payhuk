-- Script SQL simple pour ajouter la colonne is_active à la table stores
-- Ce script peut être exécuté directement dans l'interface Supabase

-- Ajouter la colonne is_active si elle n'existe pas
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'stores' 
        AND column_name = 'is_active'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.stores 
        ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
        
        -- Ajouter un commentaire
        COMMENT ON COLUMN public.stores.is_active IS 'Indique si la boutique est active et visible publiquement';
        
        -- Créer un index pour les performances
        CREATE INDEX IF NOT EXISTS idx_stores_is_active ON public.stores(is_active);
        
        -- Mettre à jour toutes les boutiques existantes
        UPDATE public.stores 
        SET is_active = true 
        WHERE is_active IS NULL;
        
        RAISE NOTICE 'Colonne is_active ajoutée avec succès à la table stores';
    ELSE
        RAISE NOTICE 'La colonne is_active existe déjà dans la table stores';
    END IF;
END $$;

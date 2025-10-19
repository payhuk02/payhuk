-- =====================================================
-- AJOUT DE LA COLONNE IS_ACTIVE À LA TABLE STORES
-- =====================================================
-- Ce fichier ajoute la colonne is_active manquante à la table stores
-- pour permettre l'activation/désactivation des boutiques
-- =====================================================

-- Ajouter la colonne is_active à la table stores
ALTER TABLE public.stores 
ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- Ajouter un commentaire pour documenter la colonne
COMMENT ON COLUMN public.stores.is_active IS 'Indique si la boutique est active et visible publiquement';

-- Créer un index pour améliorer les performances des requêtes sur is_active
CREATE INDEX IF NOT EXISTS idx_stores_is_active ON public.stores(is_active);

-- Mettre à jour toutes les boutiques existantes pour qu'elles soient actives par défaut
UPDATE public.stores 
SET is_active = true 
WHERE is_active IS NULL;

-- Ajouter une contrainte pour s'assurer que is_active ne peut pas être NULL
ALTER TABLE public.stores 
ALTER COLUMN is_active SET NOT NULL;

-- Mettre à jour les politiques RLS pour tenir compte de l'état actif
-- Les boutiques inactives ne doivent pas être visibles publiquement
DROP POLICY IF EXISTS "Anyone can view stores by slug" ON public.stores;

CREATE POLICY "Anyone can view active stores by slug"
  ON public.stores
  FOR SELECT
  USING (is_active = true);

-- Les propriétaires peuvent toujours voir leurs boutiques même si elles sont inactives
CREATE POLICY "Store owners can view their own stores regardless of status"
  ON public.stores
  FOR SELECT
  USING (auth.uid() = user_id);

-- Fonction pour activer/désactiver une boutique
CREATE OR REPLACE FUNCTION public.toggle_store_status(store_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  current_status BOOLEAN;
  new_status BOOLEAN;
BEGIN
  -- Récupérer le statut actuel
  SELECT is_active INTO current_status
  FROM stores
  WHERE id = store_id AND user_id = auth.uid();
  
  -- Vérifier que la boutique existe et appartient à l'utilisateur
  IF current_status IS NULL THEN
    RAISE EXCEPTION 'Boutique non trouvée ou non autorisée';
  END IF;
  
  -- Basculer le statut
  new_status := NOT current_status;
  
  -- Mettre à jour la boutique
  UPDATE stores
  SET is_active = new_status, updated_at = now()
  WHERE id = store_id;
  
  RETURN new_status;
END;
$$;

-- Commentaire pour la fonction
COMMENT ON FUNCTION public.toggle_store_status(UUID) IS 'Active ou désactive une boutique appartenant à l''utilisateur connecté';

-- Fonction pour obtenir le statut d'une boutique
CREATE OR REPLACE FUNCTION public.get_store_status(store_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  store_status BOOLEAN;
BEGIN
  SELECT is_active INTO store_status
  FROM stores
  WHERE id = store_id AND user_id = auth.uid();
  
  RETURN COALESCE(store_status, false);
END;
$$;

-- Commentaire pour la fonction
COMMENT ON FUNCTION public.get_store_status(UUID) IS 'Récupère le statut actif/inactif d''une boutique appartenant à l''utilisateur connecté';

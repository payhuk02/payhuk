-- =====================================================
-- CORRECTION DE LA TABLE REFERRALS
-- =====================================================
-- Ce fichier corrige la structure de la table referrals
-- pour qu'elle soit compatible avec le système de parrainage
-- =====================================================

-- Supprimer la table referrals existante si elle existe
DROP TABLE IF EXISTS public.referrals CASCADE;

-- Créer la table referrals avec la bonne structure
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(referrer_id, referred_id)
);

-- Créer la table referral_history pour l'historique des commissions
CREATE TABLE IF NOT EXISTS public.referral_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('signup', 'purchase', 'commission')),
  amount NUMERIC NOT NULL DEFAULT 0,
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Activer RLS sur les tables
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_history ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour referrals
CREATE POLICY "Users can view their own referrals"
  ON public.referrals
  FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "Users can create referrals"
  ON public.referrals
  FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);

CREATE POLICY "Users can update their own referrals"
  ON public.referrals
  FOR UPDATE
  USING (auth.uid() = referrer_id);

-- Politiques RLS pour referral_history
CREATE POLICY "Users can view their own referral history"
  ON public.referral_history
  FOR SELECT
  USING (auth.uid() = referrer_id);

CREATE POLICY "System can create referral history"
  ON public.referral_history
  FOR INSERT
  WITH CHECK (true);

-- Créer des index pour les performances
CREATE INDEX idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);
CREATE INDEX idx_referral_history_referrer_id ON public.referral_history(referrer_id);
CREATE INDEX idx_referral_history_type ON public.referral_history(type);
CREATE INDEX idx_referral_history_created_at ON public.referral_history(created_at);

-- Fonction pour créer un parrainage
CREATE OR REPLACE FUNCTION create_referral(
  p_referrer_id UUID,
  p_referred_id UUID,
  p_referral_code TEXT
)
RETURNS UUID AS $$
DECLARE
  referral_id UUID;
BEGIN
  -- Vérifier que l'utilisateur n'est pas déjà parrainé
  IF EXISTS (SELECT 1 FROM referrals WHERE referred_id = p_referred_id) THEN
    RAISE EXCEPTION 'Cet utilisateur est déjà parrainé';
  END IF;
  
  -- Vérifier que l'utilisateur ne se parraine pas lui-même
  IF p_referrer_id = p_referred_id THEN
    RAISE EXCEPTION 'Un utilisateur ne peut pas se parrainer lui-même';
  END IF;
  
  -- Créer le parrainage
  INSERT INTO referrals (referrer_id, referred_id, referral_code)
  VALUES (p_referrer_id, p_referred_id, p_referral_code)
  RETURNING id INTO referral_id;
  
  -- Créer un historique d'inscription
  INSERT INTO referral_history (referrer_id, referred_user_id, type, amount, description)
  VALUES (p_referrer_id, p_referred_id, 'signup', 0, 'Nouvelle inscription parrainée');
  
  RETURN referral_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour enregistrer une commission
CREATE OR REPLACE FUNCTION record_referral_commission(
  p_referrer_id UUID,
  p_referred_id UUID,
  p_amount NUMERIC,
  p_description TEXT
)
RETURNS UUID AS $$
DECLARE
  commission_id UUID;
  referral_id UUID;
BEGIN
  -- Trouver le parrainage
  SELECT id INTO referral_id 
  FROM referrals 
  WHERE referrer_id = p_referrer_id AND referred_id = p_referred_id;
  
  IF referral_id IS NULL THEN
    RAISE EXCEPTION 'Parrainage non trouvé';
  END IF;
  
  -- Créer l'historique de commission
  INSERT INTO referral_history (referrer_id, referred_user_id, type, amount, description)
  VALUES (p_referrer_id, p_referred_id, 'commission', p_amount, p_description)
  RETURNING id INTO commission_id;
  
  -- Mettre à jour la commission totale
  UPDATE referrals 
  SET updated_at = now()
  WHERE id = referral_id;
  
  -- Mettre à jour les gains totaux du parrain
  UPDATE profiles 
  SET total_referral_earnings = total_referral_earnings + p_amount
  WHERE user_id = p_referrer_id;
  
  RETURN commission_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Commentaires pour la documentation
COMMENT ON TABLE public.referrals IS 'Table des parrainages entre utilisateurs';
COMMENT ON TABLE public.referral_history IS 'Historique des commissions de parrainage';
COMMENT ON FUNCTION create_referral(UUID, UUID, TEXT) IS 'Crée un nouveau parrainage';
COMMENT ON FUNCTION record_referral_commission(UUID, UUID, NUMERIC, TEXT) IS 'Enregistre une commission de parrainage';

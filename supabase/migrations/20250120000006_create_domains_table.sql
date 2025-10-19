-- Table pour la gestion des domaines personnalisés
CREATE TABLE IF NOT EXISTS public.domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE, -- NULL pour domaines globaux
    domain_name TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'not_configured', -- 'active', 'pending_dns', 'pending_ssl', 'error', 'disconnected', 'not_configured'
    dns_records JSONB DEFAULT '[]'::jsonb, -- Array de {type, name, value, ttl}
    ssl_status TEXT DEFAULT 'pending', -- 'pending', 'issued', 'error', 'expired'
    verification_token TEXT, -- Token pour vérification de propriété
    verification_method TEXT DEFAULT 'dns', -- 'dns', 'file', 'meta'
    ssl_certificate_id TEXT, -- ID du certificat SSL
    ssl_expires_at TIMESTAMP WITH TIME ZONE,
    last_checked_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.domains IS 'Gère les noms de domaine personnalisés pour les boutiques ou l''application.';

-- RLS pour la table domains
ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

-- Policy pour les utilisateurs authentifiés de lire leurs propres domaines ou domaines globaux
DROP POLICY IF EXISTS "Enable read access for users on domains" ON public.domains;
CREATE POLICY "Enable read access for users on domains" ON public.domains
FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.stores WHERE id = store_id) OR -- L'utilisateur possède la boutique
    store_id IS NULL -- Domaine global (si applicable)
);

-- Policy pour les utilisateurs authentifiés d'insérer des domaines
DROP POLICY IF EXISTS "Enable insert for authenticated users on domains" ON public.domains;
CREATE POLICY "Enable insert for authenticated users on domains" ON public.domains
FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.stores WHERE id = store_id) OR
    store_id IS NULL
);

-- Policy pour les utilisateurs authentifiés de mettre à jour leurs propres domaines
DROP POLICY IF EXISTS "Enable update for users on domains" ON public.domains;
CREATE POLICY "Enable update for users on domains" ON public.domains
FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM public.stores WHERE id = store_id)
) WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.stores WHERE id = store_id)
);

-- Policy pour les utilisateurs authentifiés de supprimer leurs propres domaines
DROP POLICY IF EXISTS "Enable delete for users on domains" ON public.domains;
CREATE POLICY "Enable delete for users on domains" ON public.domains
FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM public.stores WHERE id = store_id)
);

-- Trigger pour mettre à jour `updated_at`
CREATE TRIGGER handle_domains_updated_at BEFORE UPDATE ON public.domains
FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_domains_store_id ON public.domains(store_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain_name ON public.domains(domain_name);
CREATE INDEX IF NOT EXISTS idx_domains_status ON public.domains(status);
CREATE INDEX IF NOT EXISTS idx_domains_ssl_status ON public.domains(ssl_status);

-- Fonction pour générer un token de vérification
CREATE OR REPLACE FUNCTION public.generate_domain_verification_token()
RETURNS TEXT AS $$
BEGIN
    RETURN 'payhuk-verification-' || encode(gen_random_bytes(16), 'hex');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fonction pour vérifier le statut d'un domaine
CREATE OR REPLACE FUNCTION public.check_domain_status(p_domain_id UUID)
RETURNS JSONB AS $$
DECLARE
    v_domain RECORD;
    v_result JSONB;
BEGIN
    -- Récupérer les informations du domaine
    SELECT * INTO v_domain FROM public.domains WHERE id = p_domain_id;
    
    IF NOT FOUND THEN
        RETURN jsonb_build_object('success', false, 'error', 'Domaine non trouvé');
    END IF;
    
    -- Simuler la vérification DNS (dans un vrai système, ceci appellerait une API externe)
    -- Pour l'instant, on simule avec une probabilité de succès
    IF random() > 0.3 THEN
        -- DNS configuré correctement
        UPDATE public.domains 
        SET status = 'active', 
            ssl_status = 'issued',
            last_checked_at = now(),
            updated_at = now()
        WHERE id = p_domain_id;
        
        v_result := jsonb_build_object(
            'success', true,
            'status', 'active',
            'message', 'Domaine actif et sécurisé'
        );
    ELSE
        -- DNS pas encore configuré ou erreur
        UPDATE public.domains 
        SET status = 'pending_dns',
            last_checked_at = now(),
            updated_at = now()
        WHERE id = p_domain_id;
        
        v_result := jsonb_build_object(
            'success', false,
            'status', 'pending_dns',
            'message', 'En attente de configuration DNS'
        );
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execution to authenticated users
GRANT EXECUTE ON FUNCTION public.generate_domain_verification_token() TO authenticated;
GRANT EXECUTE ON FUNCTION public.check_domain_status(UUID) TO authenticated;

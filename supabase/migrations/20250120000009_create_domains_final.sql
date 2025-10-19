-- Migration pour créer la table domains
-- Version ultra-simplifiée

CREATE TABLE IF NOT EXISTS public.domains (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    store_id UUID REFERENCES public.stores(id) ON DELETE CASCADE,
    domain_name TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL DEFAULT 'not_configured',
    dns_records JSONB DEFAULT '[]'::jsonb,
    ssl_status TEXT DEFAULT 'pending',
    verification_token TEXT,
    verification_method TEXT DEFAULT 'dns',
    ssl_certificate_id TEXT,
    ssl_expires_at TIMESTAMP WITH TIME ZONE,
    last_checked_at TIMESTAMP WITH TIME ZONE,
    error_message TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

COMMENT ON TABLE public.domains IS 'Gère les noms de domaine personnalisés pour les boutiques';

ALTER TABLE public.domains ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read their own domains" ON public.domains
FOR SELECT USING (
    auth.uid() = (SELECT user_id FROM public.stores WHERE id = store_id) OR
    store_id IS NULL
);

CREATE POLICY "Users can insert domains for their stores" ON public.domains
FOR INSERT WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.stores WHERE id = store_id) OR
    store_id IS NULL
);

CREATE POLICY "Users can update their own domains" ON public.domains
FOR UPDATE USING (
    auth.uid() = (SELECT user_id FROM public.stores WHERE id = store_id)
) WITH CHECK (
    auth.uid() = (SELECT user_id FROM public.stores WHERE id = store_id)
);

CREATE POLICY "Users can delete their own domains" ON public.domains
FOR DELETE USING (
    auth.uid() = (SELECT user_id FROM public.stores WHERE id = store_id)
);

CREATE INDEX IF NOT EXISTS idx_domains_store_id ON public.domains(store_id);
CREATE INDEX IF NOT EXISTS idx_domains_domain_name ON public.domains(domain_name);
CREATE INDEX IF NOT EXISTS idx_domains_status ON public.domains(status);
CREATE INDEX IF NOT EXISTS idx_domains_ssl_status ON public.domains(ssl_status);

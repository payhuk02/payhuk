-- Migration pour le système de gestion des litiges
-- Créée le 2024-01-20

-- Table pour les litiges
CREATE TABLE IF NOT EXISTS public.disputes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    escrow_payment_id UUID REFERENCES public.escrow_payments(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    dispute_type VARCHAR(20) NOT NULL CHECK (dispute_type IN ('delivery', 'quality', 'service', 'payment', 'other')),
    status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'investigating', 'resolved', 'closed', 'escalated')),
    priority VARCHAR(10) NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high', 'urgent')),
    subject VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    customer_evidence JSONB,
    store_evidence JSONB,
    admin_notes TEXT,
    resolution TEXT,
    resolution_type VARCHAR(20) CHECK (resolution_type IN ('refund', 'partial_refund', 'replacement', 'service_credit', 'no_action')),
    refund_amount DECIMAL(12,2),
    assigned_admin_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE,
    closed_at TIMESTAMP WITH TIME ZONE
);

-- Table pour les actions sur les litiges
CREATE TABLE IF NOT EXISTS public.dispute_actions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
    action_type VARCHAR(20) NOT NULL CHECK (action_type IN ('created', 'updated', 'evidence_added', 'admin_assigned', 'status_changed', 'resolved', 'closed')),
    performed_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    performed_by_type VARCHAR(10) NOT NULL CHECK (performed_by_type IN ('customer', 'store', 'admin')),
    description TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les preuves des litiges
CREATE TABLE IF NOT EXISTS public.dispute_evidence (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
    uploaded_by UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    uploaded_by_type VARCHAR(10) NOT NULL CHECK (uploaded_by_type IN ('customer', 'store', 'admin')),
    evidence_type VARCHAR(20) NOT NULL CHECK (evidence_type IN ('image', 'document', 'video', 'audio', 'other')),
    file_url TEXT NOT NULL,
    file_name TEXT NOT NULL,
    file_size INTEGER NOT NULL,
    file_type VARCHAR(50) NOT NULL,
    description TEXT,
    is_verified BOOLEAN DEFAULT FALSE,
    verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    verified_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les décisions d'arbitrage
CREATE TABLE IF NOT EXISTS public.dispute_decisions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    dispute_id UUID NOT NULL REFERENCES public.disputes(id) ON DELETE CASCADE,
    admin_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    decision_type VARCHAR(20) NOT NULL CHECK (decision_type IN ('customer_wins', 'store_wins', 'partial_customer', 'partial_store', 'no_fault')),
    decision_reason TEXT NOT NULL,
    customer_penalty DECIMAL(12,2) DEFAULT 0,
    store_penalty DECIMAL(12,2) DEFAULT 0,
    refund_amount DECIMAL(12,2) DEFAULT 0,
    additional_notes TEXT,
    is_final BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON public.disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_customer_id ON public.disputes(customer_id);
CREATE INDEX IF NOT EXISTS idx_disputes_store_id ON public.disputes(store_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);
CREATE INDEX IF NOT EXISTS idx_disputes_priority ON public.disputes(priority);
CREATE INDEX IF NOT EXISTS idx_disputes_assigned_admin_id ON public.disputes(assigned_admin_id);
CREATE INDEX IF NOT EXISTS idx_disputes_created_at ON public.disputes(created_at);

CREATE INDEX IF NOT EXISTS idx_dispute_actions_dispute_id ON public.dispute_actions(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_actions_performed_by ON public.dispute_actions(performed_by);
CREATE INDEX IF NOT EXISTS idx_dispute_actions_action_type ON public.dispute_actions(action_type);

CREATE INDEX IF NOT EXISTS idx_dispute_evidence_dispute_id ON public.dispute_evidence(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_evidence_uploaded_by ON public.dispute_evidence(uploaded_by);
CREATE INDEX IF NOT EXISTS idx_dispute_evidence_evidence_type ON public.dispute_evidence(evidence_type);

CREATE INDEX IF NOT EXISTS idx_dispute_decisions_dispute_id ON public.dispute_decisions(dispute_id);
CREATE INDEX IF NOT EXISTS idx_dispute_decisions_admin_id ON public.dispute_decisions(admin_id);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_disputes_updated_at 
    BEFORE UPDATE ON public.disputes 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour créer automatiquement une action
CREATE OR REPLACE FUNCTION create_dispute_action()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.dispute_actions (
        dispute_id,
        action_type,
        performed_by,
        performed_by_type,
        description,
        metadata
    ) VALUES (
        NEW.id,
        'created',
        NEW.customer_id,
        'customer',
        'Litige créé: ' || NEW.subject,
        jsonb_build_object(
            'dispute_type', NEW.dispute_type,
            'priority', NEW.priority
        )
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour créer une action lors de la création d'un litige
CREATE TRIGGER create_dispute_action_trigger
    AFTER INSERT ON public.disputes
    FOR EACH ROW EXECUTE FUNCTION create_dispute_action();

-- Fonction pour créer une action lors de la mise à jour du statut
CREATE OR REPLACE FUNCTION create_status_change_action()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.status != NEW.status THEN
        INSERT INTO public.dispute_actions (
            dispute_id,
            action_type,
            performed_by,
            performed_by_type,
            description,
            metadata
        ) VALUES (
            NEW.id,
            'status_changed',
            COALESCE(NEW.assigned_admin_id, OLD.assigned_admin_id, NEW.customer_id),
            CASE 
                WHEN NEW.assigned_admin_id IS NOT NULL THEN 'admin'
                ELSE 'customer'
            END,
            'Statut changé de ' || OLD.status || ' vers ' || NEW.status,
            jsonb_build_object(
                'old_status', OLD.status,
                'new_status', NEW.status
            )
        );
    END IF;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour les changements de statut
CREATE TRIGGER create_status_change_action_trigger
    AFTER UPDATE ON public.disputes
    FOR EACH ROW EXECUTE FUNCTION create_status_change_action();

-- RLS (Row Level Security)
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_evidence ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dispute_decisions ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour disputes
CREATE POLICY "Users can view their own disputes" ON public.disputes
    FOR SELECT USING (
        customer_id = auth.uid() OR 
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()) OR
        assigned_admin_id = auth.uid()
    );

CREATE POLICY "Users can create disputes for their orders" ON public.disputes
    FOR INSERT WITH CHECK (
        customer_id = auth.uid() OR
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their own disputes" ON public.disputes
    FOR UPDATE USING (
        customer_id = auth.uid() OR 
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()) OR
        assigned_admin_id = auth.uid()
    );

-- Politiques RLS pour dispute_actions
CREATE POLICY "Users can view actions for their disputes" ON public.dispute_actions
    FOR SELECT USING (
        dispute_id IN (
            SELECT id FROM public.disputes 
            WHERE customer_id = auth.uid() OR 
            store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()) OR
            assigned_admin_id = auth.uid()
        )
    );

CREATE POLICY "Users can create actions for their disputes" ON public.dispute_actions
    FOR INSERT WITH CHECK (
        performed_by = auth.uid() AND
        dispute_id IN (
            SELECT id FROM public.disputes 
            WHERE customer_id = auth.uid() OR 
            store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
        )
    );

-- Politiques RLS pour dispute_evidence
CREATE POLICY "Users can view evidence for their disputes" ON public.dispute_evidence
    FOR SELECT USING (
        dispute_id IN (
            SELECT id FROM public.disputes 
            WHERE customer_id = auth.uid() OR 
            store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()) OR
            assigned_admin_id = auth.uid()
        )
    );

CREATE POLICY "Users can upload evidence for their disputes" ON public.dispute_evidence
    FOR INSERT WITH CHECK (
        uploaded_by = auth.uid() AND
        dispute_id IN (
            SELECT id FROM public.disputes 
            WHERE customer_id = auth.uid() OR 
            store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
        )
    );

-- Politiques RLS pour dispute_decisions
CREATE POLICY "Users can view decisions for their disputes" ON public.dispute_decisions
    FOR SELECT USING (
        dispute_id IN (
            SELECT id FROM public.disputes 
            WHERE customer_id = auth.uid() OR 
            store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
        )
    );

CREATE POLICY "Admins can create decisions" ON public.dispute_decisions
    FOR INSERT WITH CHECK (
        admin_id = auth.uid() AND
        dispute_id IN (
            SELECT id FROM public.disputes 
            WHERE assigned_admin_id = auth.uid()
        )
    );

-- Commentaires pour la documentation
COMMENT ON TABLE public.disputes IS 'Litiges entre clients et vendeurs';
COMMENT ON TABLE public.dispute_actions IS 'Historique des actions sur les litiges';
COMMENT ON TABLE public.dispute_evidence IS 'Preuves uploadées pour les litiges';
COMMENT ON TABLE public.dispute_decisions IS 'Décisions d''arbitrage des litiges';

COMMENT ON COLUMN public.disputes.dispute_type IS 'Type de litige: delivery, quality, service, payment, other';
COMMENT ON COLUMN public.disputes.status IS 'Statut du litige: open, investigating, resolved, closed, escalated';
COMMENT ON COLUMN public.disputes.priority IS 'Priorité: low, medium, high, urgent';
COMMENT ON COLUMN public.disputes.resolution_type IS 'Type de résolution: refund, partial_refund, replacement, service_credit, no_action';

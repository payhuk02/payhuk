-- Migration pour le système de paiements partiels et escrow
-- Créée le 2024-01-20

-- Table pour les paiements partiels
CREATE TABLE IF NOT EXISTS public.partial_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    total_amount DECIMAL(12,2) NOT NULL,
    paid_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    remaining_amount DECIMAL(12,2) NOT NULL,
    payment_percentage INTEGER NOT NULL CHECK (payment_percentage >= 1 AND payment_percentage <= 100),
    payment_method VARCHAR(50) NOT NULL DEFAULT 'moneroo',
    payment_status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending', 'partial', 'completed', 'failed', 'refunded')),
    transaction_id VARCHAR(255),
    payment_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE,
    due_date TIMESTAMP WITH TIME ZONE
);

-- Table pour les paiements escrow (à la livraison)
CREATE TABLE IF NOT EXISTS public.escrow_payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    amount DECIMAL(12,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL DEFAULT 'moneroo',
    escrow_status VARCHAR(20) NOT NULL DEFAULT 'held' CHECK (escrow_status IN ('held', 'released', 'disputed', 'refunded')),
    transaction_id VARCHAR(255) NOT NULL,
    payment_data JSONB,
    release_conditions TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    paid_at TIMESTAMP WITH TIME ZONE NOT NULL,
    released_at TIMESTAMP WITH TIME ZONE,
    dispute_deadline TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '7 days')
);

-- Table pour l'historique des paiements
CREATE TABLE IF NOT EXISTS public.payment_history (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('partial', 'escrow', 'full')),
    amount DECIMAL(12,2) NOT NULL,
    action VARCHAR(20) NOT NULL CHECK (action IN ('payment', 'release', 'refund', 'dispute')),
    status VARCHAR(20) NOT NULL,
    transaction_id VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id)
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_partial_payments_order_id ON public.partial_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_partial_payments_customer_id ON public.partial_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_partial_payments_store_id ON public.partial_payments(store_id);
CREATE INDEX IF NOT EXISTS idx_partial_payments_status ON public.partial_payments(payment_status);

CREATE INDEX IF NOT EXISTS idx_escrow_payments_order_id ON public.escrow_payments(order_id);
CREATE INDEX IF NOT EXISTS idx_escrow_payments_customer_id ON public.escrow_payments(customer_id);
CREATE INDEX IF NOT EXISTS idx_escrow_payments_store_id ON public.escrow_payments(store_id);
CREATE INDEX IF NOT EXISTS idx_escrow_payments_status ON public.escrow_payments(escrow_status);

CREATE INDEX IF NOT EXISTS idx_payment_history_order_id ON public.payment_history(order_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_type ON public.payment_history(payment_type);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_partial_payments_updated_at 
    BEFORE UPDATE ON public.partial_payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_escrow_payments_updated_at 
    BEFORE UPDATE ON public.escrow_payments 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour calculer le montant restant
CREATE OR REPLACE FUNCTION calculate_remaining_amount()
RETURNS TRIGGER AS $$
BEGIN
    NEW.remaining_amount = NEW.total_amount - NEW.paid_amount;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour calculer le montant restant
CREATE TRIGGER calculate_remaining_amount_trigger
    BEFORE INSERT OR UPDATE ON public.partial_payments
    FOR EACH ROW EXECUTE FUNCTION calculate_remaining_amount();

-- Fonction pour créer un historique de paiement
CREATE OR REPLACE FUNCTION create_payment_history()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.payment_history (
        order_id,
        payment_type,
        amount,
        action,
        status,
        transaction_id,
        notes,
        created_by
    ) VALUES (
        NEW.order_id,
        CASE 
            WHEN TG_TABLE_NAME = 'partial_payments' THEN 'partial'
            WHEN TG_TABLE_NAME = 'escrow_payments' THEN 'escrow'
            ELSE 'full'
        END,
        NEW.paid_amount,
        'payment',
        NEW.payment_status,
        NEW.transaction_id,
        'Paiement créé',
        NEW.customer_id
    );
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour l'historique
CREATE TRIGGER create_partial_payment_history
    AFTER INSERT ON public.partial_payments
    FOR EACH ROW EXECUTE FUNCTION create_payment_history();

CREATE TRIGGER create_escrow_payment_history
    AFTER INSERT ON public.escrow_payments
    FOR EACH ROW EXECUTE FUNCTION create_payment_history();

-- RLS (Row Level Security)
ALTER TABLE public.partial_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.escrow_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_history ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour partial_payments
CREATE POLICY "Users can view their own partial payments" ON public.partial_payments
    FOR SELECT USING (
        customer_id = auth.uid() OR 
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create their own partial payments" ON public.partial_payments
    FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update their own partial payments" ON public.partial_payments
    FOR UPDATE USING (
        customer_id = auth.uid() OR 
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

-- Politiques RLS pour escrow_payments
CREATE POLICY "Users can view their own escrow payments" ON public.escrow_payments
    FOR SELECT USING (
        customer_id = auth.uid() OR 
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can create their own escrow payments" ON public.escrow_payments
    FOR INSERT WITH CHECK (customer_id = auth.uid());

CREATE POLICY "Users can update their own escrow payments" ON public.escrow_payments
    FOR UPDATE USING (
        customer_id = auth.uid() OR 
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

-- Politiques RLS pour payment_history
CREATE POLICY "Users can view their own payment history" ON public.payment_history
    FOR SELECT USING (
        order_id IN (
            SELECT id FROM public.orders 
            WHERE customer_id = auth.uid() OR 
            store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
        )
    );

-- Commentaires pour la documentation
COMMENT ON TABLE public.partial_payments IS 'Gestion des paiements partiels par pourcentage';
COMMENT ON TABLE public.escrow_payments IS 'Gestion des paiements à la livraison (escrow)';
COMMENT ON TABLE public.payment_history IS 'Historique complet de tous les paiements';

COMMENT ON COLUMN public.partial_payments.payment_percentage IS 'Pourcentage du montant total payé (1-100)';
COMMENT ON COLUMN public.partial_payments.remaining_amount IS 'Montant restant à payer (calculé automatiquement)';
COMMENT ON COLUMN public.escrow_payments.escrow_status IS 'Statut du paiement en escrow';
COMMENT ON COLUMN public.escrow_payments.dispute_deadline IS 'Date limite pour ouvrir un litige';

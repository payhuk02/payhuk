-- Migration pour le système de messagerie
-- Créée le 2024-01-20

-- Table pour les conversations
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES public.customers(id) ON DELETE CASCADE,
    store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
    conversation_type VARCHAR(20) NOT NULL DEFAULT 'order' CHECK (conversation_type IN ('order', 'support', 'dispute')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'closed', 'archived')),
    last_message_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(order_id, customer_id, store_id)
);

-- Table pour les messages
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    sender_type VARCHAR(10) NOT NULL CHECK (sender_type IN ('customer', 'store', 'admin')),
    message_type VARCHAR(20) NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file', 'system')),
    content TEXT,
    file_url TEXT,
    file_name TEXT,
    file_size INTEGER,
    file_type VARCHAR(50),
    is_read BOOLEAN DEFAULT FALSE,
    is_edited BOOLEAN DEFAULT FALSE,
    edited_at TIMESTAMP WITH TIME ZONE,
    reply_to_id UUID REFERENCES public.messages(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table pour les participants de conversation
CREATE TABLE IF NOT EXISTS public.conversation_participants (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    user_type VARCHAR(10) NOT NULL CHECK (user_type IN ('customer', 'store', 'admin')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(conversation_id, user_id)
);

-- Table pour les notifications de messages
CREATE TABLE IF NOT EXISTS public.message_notifications (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    conversation_id UUID NOT NULL REFERENCES public.conversations(id) ON DELETE CASCADE,
    message_id UUID NOT NULL REFERENCES public.messages(id) ON DELETE CASCADE,
    recipient_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    notification_type VARCHAR(20) NOT NULL DEFAULT 'message' CHECK (notification_type IN ('message', 'mention', 'system')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
);

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_conversations_order_id ON public.conversations(order_id);
CREATE INDEX IF NOT EXISTS idx_conversations_customer_id ON public.conversations(customer_id);
CREATE INDEX IF NOT EXISTS idx_conversations_store_id ON public.conversations(store_id);
CREATE INDEX IF NOT EXISTS idx_conversations_status ON public.conversations(status);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message_at ON public.conversations(last_message_at);

CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at);
CREATE INDEX IF NOT EXISTS idx_messages_is_read ON public.messages(is_read);

CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);

CREATE INDEX IF NOT EXISTS idx_message_notifications_recipient_id ON public.message_notifications(recipient_id);
CREATE INDEX IF NOT EXISTS idx_message_notifications_is_read ON public.message_notifications(is_read);

-- Fonction pour mettre à jour updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_conversations_updated_at 
    BEFORE UPDATE ON public.conversations 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at 
    BEFORE UPDATE ON public.messages 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour mettre à jour last_message_at
CREATE OR REPLACE FUNCTION update_conversation_last_message()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.conversations 
    SET last_message_at = NEW.created_at
    WHERE id = NEW.conversation_id;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour mettre à jour last_message_at
CREATE TRIGGER update_conversation_last_message_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION update_conversation_last_message();

-- Fonction pour créer des notifications
CREATE OR REPLACE FUNCTION create_message_notifications()
RETURNS TRIGGER AS $$
BEGIN
    -- Créer des notifications pour tous les participants sauf l'expéditeur
    INSERT INTO public.message_notifications (
        conversation_id,
        message_id,
        recipient_id,
        notification_type
    )
    SELECT 
        NEW.conversation_id,
        NEW.id,
        cp.user_id,
        'message'
    FROM public.conversation_participants cp
    WHERE cp.conversation_id = NEW.conversation_id 
    AND cp.user_id != NEW.sender_id
    AND cp.is_active = TRUE;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour créer des notifications
CREATE TRIGGER create_message_notifications_trigger
    AFTER INSERT ON public.messages
    FOR EACH ROW EXECUTE FUNCTION create_message_notifications();

-- Fonction pour créer automatiquement les participants
CREATE OR REPLACE FUNCTION create_conversation_participants()
RETURNS TRIGGER AS $$
BEGIN
    -- Ajouter le client
    INSERT INTO public.conversation_participants (conversation_id, user_id, user_type)
    VALUES (NEW.id, NEW.customer_id, 'customer');
    
    -- Ajouter le vendeur
    INSERT INTO public.conversation_participants (conversation_id, user_id, user_type)
    SELECT NEW.id, s.user_id, 'store'
    FROM public.stores s
    WHERE s.id = NEW.store_id;
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour créer les participants
CREATE TRIGGER create_conversation_participants_trigger
    AFTER INSERT ON public.conversations
    FOR EACH ROW EXECUTE FUNCTION create_conversation_participants();

-- RLS (Row Level Security)
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_notifications ENABLE ROW LEVEL SECURITY;

-- Politiques RLS pour conversations
CREATE POLICY "Users can view their own conversations" ON public.conversations
    FOR SELECT USING (
        customer_id = auth.uid() OR 
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()) OR
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp 
            WHERE cp.conversation_id = id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create conversations for their orders" ON public.conversations
    FOR INSERT WITH CHECK (
        customer_id = auth.uid() OR
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

CREATE POLICY "Users can update their own conversations" ON public.conversations
    FOR UPDATE USING (
        customer_id = auth.uid() OR 
        store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid())
    );

-- Politiques RLS pour messages
CREATE POLICY "Users can view messages in their conversations" ON public.messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp 
            WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create messages in their conversations" ON public.messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp 
            WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update their own messages" ON public.messages
    FOR UPDATE USING (sender_id = auth.uid());

-- Politiques RLS pour conversation_participants
CREATE POLICY "Users can view participants in their conversations" ON public.conversation_participants
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.conversation_participants cp 
            WHERE cp.conversation_id = conversation_id AND cp.user_id = auth.uid()
        )
    );

-- Politiques RLS pour message_notifications
CREATE POLICY "Users can view their own notifications" ON public.message_notifications
    FOR SELECT USING (recipient_id = auth.uid());

CREATE POLICY "Users can update their own notifications" ON public.message_notifications
    FOR UPDATE USING (recipient_id = auth.uid());

-- Commentaires pour la documentation
COMMENT ON TABLE public.conversations IS 'Conversations entre clients et vendeurs';
COMMENT ON TABLE public.messages IS 'Messages dans les conversations';
COMMENT ON TABLE public.conversation_participants IS 'Participants aux conversations';
COMMENT ON TABLE public.message_notifications IS 'Notifications de nouveaux messages';

COMMENT ON COLUMN public.conversations.conversation_type IS 'Type de conversation: order, support, dispute';
COMMENT ON COLUMN public.messages.message_type IS 'Type de message: text, image, file, system';
COMMENT ON COLUMN public.messages.sender_type IS 'Type d''expéditeur: customer, store, admin';

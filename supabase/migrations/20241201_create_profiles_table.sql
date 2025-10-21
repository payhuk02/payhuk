-- Migration pour créer la table profiles avec RLS
-- Ce fichier doit être exécuté dans Supabase SQL Editor

-- Créer la table profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT,
    avatar_url TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'vendor', 'customer')),
    bio TEXT,
    phone TEXT,
    location TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS (Row Level Security)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politique pour permettre aux utilisateurs de voir leur propre profil
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de créer leur propre profil
CREATE POLICY "Users can create own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de mettre à jour leur propre profil
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Politique pour permettre aux utilisateurs de supprimer leur propre profil
CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- Politique pour permettre aux admins de voir tous les profils
CREATE POLICY "Admins can view all profiles" ON public.profiles
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- Fonction pour créer automatiquement un profil lors de l'inscription
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Fonction pour mettre à jour updated_at automatiquement
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger pour updated_at
DROP TRIGGER IF EXISTS handle_updated_at ON public.profiles;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);

-- Commentaires pour la documentation
COMMENT ON TABLE public.profiles IS 'Profils utilisateurs avec informations étendues';
COMMENT ON COLUMN public.profiles.id IS 'ID utilisateur (référence vers auth.users)';
COMMENT ON COLUMN public.profiles.name IS 'Nom d''affichage de l''utilisateur';
COMMENT ON COLUMN public.profiles.email IS 'Email de l''utilisateur';
COMMENT ON COLUMN public.profiles.avatar_url IS 'URL de l''avatar';
COMMENT ON COLUMN public.profiles.role IS 'Rôle de l''utilisateur (admin, vendor, customer)';
COMMENT ON COLUMN public.profiles.bio IS 'Biographie de l''utilisateur';
COMMENT ON COLUMN public.profiles.phone IS 'Numéro de téléphone';
COMMENT ON COLUMN public.profiles.location IS 'Localisation';
COMMENT ON COLUMN public.profiles.website IS 'Site web personnel';
COMMENT ON COLUMN public.profiles.created_at IS 'Date de création';
COMMENT ON COLUMN public.profiles.updated_at IS 'Date de dernière mise à jour';

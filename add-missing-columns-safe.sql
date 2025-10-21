-- Script simple pour ajouter les colonnes manquantes à la table profiles
-- À exécuter dans l'éditeur SQL de Supabase

-- ÉTAPE 1: Vérifier la structure actuelle
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- ÉTAPE 2: Ajouter les colonnes manquantes une par une
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ÉTAPE 3: Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 4: Supprimer les anciennes politiques
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- ÉTAPE 5: Créer les nouvelles politiques RLS
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can create own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- ÉTAPE 6: Mettre à jour les profils existants avec des valeurs par défaut
UPDATE public.profiles 
SET 
    name = COALESCE(name, 'Utilisateur'),
    email = COALESCE(email, 'email@example.com'),
    role = COALESCE(role, 'customer')
WHERE name IS NULL OR email IS NULL OR role IS NULL;

-- ÉTAPE 7: Créer des profils pour les utilisateurs qui n'en ont pas
INSERT INTO public.profiles (id, name, email, role)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'name', au.email),
    au.email,
    'customer'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- ÉTAPE 8: Vérifier le résultat
SELECT 
    'Colonnes ajoutees avec succes' as status,
    COUNT(*) as total_profiles
FROM public.profiles;

-- ÉTAPE 9: Vérifier la structure finale
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public'
ORDER BY ordinal_position;

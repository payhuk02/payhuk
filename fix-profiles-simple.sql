-- Script ultra-simple pour corriger la table profiles
-- À exécuter dans l'éditeur SQL de Supabase

-- ÉTAPE 1: Vérifier la structure actuelle
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- ÉTAPE 2: Ajouter la colonne role
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- ÉTAPE 3: Ajouter les autres colonnes manquantes
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS bio TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS phone TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS website TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- ÉTAPE 4: Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 5: Créer les politiques RLS de base
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
CREATE POLICY "Users can create own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- ÉTAPE 6: Mettre à jour les profils existants
UPDATE public.profiles 
SET role = 'customer' 
WHERE role IS NULL;

-- ÉTAPE 7: Créer des profils pour les utilisateurs existants
INSERT INTO public.profiles (id, name, email, role)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'name', au.email),
    au.email,
    'customer'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- ÉTAPE 8: Vérifier le résultat
SELECT 
    'Correction terminee' as status,
    COUNT(*) as total_profiles
FROM public.profiles;

-- ÉTAPE 9: Test d'accès
SELECT 
    'Test de connexion' as test,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN 'OK - Utilisateur connecte'
        ELSE 'ERREUR - Aucun utilisateur connecte'
    END as result;

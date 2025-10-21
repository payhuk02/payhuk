-- Script SQL simple pour tester la connexion Payhuk
-- Exécutez ce script étape par étape dans l'éditeur SQL de Supabase

-- ÉTAPE 1: Vérifier si la table profiles existe
SELECT 
    table_name,
    table_schema
FROM information_schema.tables 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- ÉTAPE 2: Si la table n'existe pas, la créer
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÉTAPE 3: Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ÉTAPE 4: Créer les politiques RLS de base
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
CREATE POLICY "Users can create own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- ÉTAPE 5: Créer un profil pour l'utilisateur actuel
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

-- ÉTAPE 6: Vérifier le résultat
SELECT 
    'Profiles disponibles' as info,
    COUNT(*) as total
FROM public.profiles;

-- ÉTAPE 7: Test d'accès (exécutez cette requête après vous être connecté)
SELECT 
    'Test de connexion' as test,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN 'OK - Utilisateur connecte'
        ELSE 'ERREUR - Aucun utilisateur connecte'
    END as result;

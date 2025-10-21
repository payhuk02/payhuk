-- Script simple pour ajouter la colonne role manquante
-- À exécuter dans l'éditeur SQL de Supabase

-- ÉTAPE 1: Vérifier la structure actuelle
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';

-- ÉTAPE 2: Ajouter la colonne role si elle n'existe pas
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

-- ÉTAPE 4: Mettre à jour les profils existants
UPDATE public.profiles 
SET role = 'customer' 
WHERE role IS NULL;

-- ÉTAPE 5: Vérifier le résultat
SELECT 
    'Structure corrigee' as status,
    COUNT(*) as total_profiles
FROM public.profiles;

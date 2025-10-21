# 🔧 Guide de Dépannage - Erreur SQL Payhuk

## 🚨 Erreur Rencontrée

```
ERROR: 42601: syntax error at or near "' as test,
    CASE 
        WHEN auth.uid() IS NOT NULL THEN '"
LINE 112:     'Test d\'accès' as test,
```

## 🔍 Cause du Problème

L'erreur vient des **caractères spéciaux** et des **guillemets** dans le script SQL. PostgreSQL est sensible aux caractères d'échappement.

## ✅ Solution Immédiate

### Option 1: Utiliser le Script Corrigé

1. **Ouvrez Supabase SQL Editor**
2. **Copiez le contenu de `fix-database-connection-corrected.sql`**
3. **Collez et exécutez**

### Option 2: Script Simple (Recommandé)

1. **Utilisez `test-connection-simple.sql`**
2. **Exécutez étape par étape**
3. **Vérifiez chaque résultat**

## 📋 Étapes de Correction

### Étape 1: Vérification
```sql
-- Vérifier si la table profiles existe
SELECT table_name FROM information_schema.tables 
WHERE table_name = 'profiles' AND table_schema = 'public';
```

### Étape 2: Création de Table
```sql
-- Créer la table profiles
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Étape 3: Activation RLS
```sql
-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### Étape 4: Politiques RLS
```sql
-- Politique de lecture
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- Politique d'insertion
CREATE POLICY "Users can create own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

-- Politique de mise à jour
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);
```

### Étape 5: Création de Profil
```sql
-- Créer un profil pour l'utilisateur actuel
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
```

### Étape 6: Test Final
```sql
-- Vérifier que tout fonctionne
SELECT COUNT(*) as total_profiles FROM public.profiles;
```

## 🛠️ Script de Test Complet

Si vous préférez un script complet sans caractères spéciaux :

```sql
-- Script complet sans caractères spéciaux
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'customer',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
CREATE POLICY "Users can create own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

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

SELECT COUNT(*) as total_profiles FROM public.profiles;
```

## 🎯 Résultat Attendu

Après exécution réussie :
- ✅ Table `profiles` créée
- ✅ Politiques RLS configurées
- ✅ Profil utilisateur créé
- ✅ Connexion au dashboard fonctionnelle

## 🚨 Si l'Erreur Persiste

1. **Vérifiez la syntaxe** - Copiez-collez exactement le script
2. **Exécutez étape par étape** - Ne pas tout exécuter d'un coup
3. **Vérifiez les permissions** - Assurez-vous d'être admin du projet Supabase
4. **Contactez le support** - Si le problème persiste

---

**Note:** Ce guide résout l'erreur de syntaxe SQL et permet la création correcte des tables nécessaires.

# 🔧 Correction - Erreurs de Colonnes Manquantes

## 🚨 Erreurs Rencontrées

```
ERROR: 42703: column "email" does not exist
ERROR: 42703: column "name" of relation "profiles" does not exist
ERROR: 42601: syntax error at or near "#"
```

## 🔍 Causes du Problème

1. **Colonnes manquantes** - La table `profiles` n'a pas les colonnes de base (`name`, `email`)
2. **Texte markdown copié** - Du texte de documentation a été copié dans l'éditeur SQL
3. **Structure incomplète** - La table existe mais avec une structure incorrecte

## ✅ Solutions

### Option 1: Script Sécurisé (Recommandé)

**Utilisez `add-missing-columns-safe.sql`** - il ajoute les colonnes sans supprimer la table :

```sql
-- Ajouter les colonnes manquantes
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

-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
CREATE POLICY "Users can create own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;
CREATE POLICY "Users can delete own profile" ON public.profiles
    FOR DELETE USING (auth.uid() = id);

-- Mettre à jour les profils existants
UPDATE public.profiles 
SET 
    name = COALESCE(name, 'Utilisateur'),
    email = COALESCE(email, 'email@example.com'),
    role = COALESCE(role, 'customer')
WHERE name IS NULL OR email IS NULL OR role IS NULL;

-- Créer des profils pour les utilisateurs qui n'en ont pas
INSERT INTO public.profiles (id, name, email, role)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'name', au.email),
    au.email,
    'customer'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;

-- Vérifier le résultat
SELECT 'Colonnes ajoutees avec succes' as status, COUNT(*) as total_profiles FROM public.profiles;
```

### Option 2: Reconstruction Complète

**Si Option 1 ne fonctionne pas, utilisez `rebuild-profiles-table.sql`** :

⚠️ **ATTENTION:** Ce script supprime et recrée la table (perte de données)

## 📋 Étapes de Correction Détaillées

### Étape 1: Vérifier la Structure
```sql
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';
```

### Étape 2: Ajouter les Colonnes de Base
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
```

### Étape 3: Ajouter les Autres Colonnes
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

### Étape 4: Configurer RLS
```sql
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
```

### Étape 5: Mettre à Jour les Données
```sql
UPDATE public.profiles 
SET 
    name = COALESCE(name, 'Utilisateur'),
    email = COALESCE(email, 'email@example.com'),
    role = COALESCE(role, 'customer')
WHERE name IS NULL OR email IS NULL OR role IS NULL;
```

### Étape 6: Créer les Profils Manquants
```sql
INSERT INTO public.profiles (id, name, email, role)
SELECT 
    au.id,
    COALESCE(au.raw_user_meta_data->>'name', au.email),
    au.email,
    'customer'
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL;
```

## 🎯 Résultat Attendu

Après correction :
- ✅ Colonnes `name`, `email`, `role` ajoutées
- ✅ Toutes les colonnes manquantes créées
- ✅ Politiques RLS configurées
- ✅ Profils utilisateurs créés/mis à jour
- ✅ Application fonctionnelle

## 🚨 Points Importants

1. **Ne copiez pas de texte markdown** dans l'éditeur SQL
2. **Exécutez étape par étape** pour éviter les erreurs
3. **Vérifiez la structure** avant et après
4. **Sauvegardez vos données** si vous utilisez la reconstruction

## 📝 Notes de Sécurité

- `ADD COLUMN IF NOT EXISTS` est sûr
- Les colonnes ajoutées auront des valeurs par défaut
- Les données existantes ne seront pas perdues
- L'application fonctionnera immédiatement après

---

**Note:** Cette correction résout tous les problèmes de colonnes manquantes et permet à l'application de fonctionner correctement.

# 🔧 Correction - Erreur "syntax error at or near NOT"

## 🚨 Erreur Rencontrée

```
ERROR: 42601: syntax error at or near "NOT"
LINE 35: ADD CONSTRAINT IF NOT EXISTS check_role 
                           ^
```

## 🔍 Cause du Problème

PostgreSQL ne supporte pas `IF NOT EXISTS` pour les contraintes dans toutes les versions. Cette syntaxe est spécifique à certaines versions récentes.

## ✅ Solution Immédiate

**Utilisez le script `fix-profiles-simple.sql`** - il évite les contraintes complexes :

### Script de Correction Rapide

```sql
-- Ajouter la colonne role
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';

-- Ajouter les autres colonnes
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

-- Mettre à jour les profils existants
UPDATE public.profiles 
SET role = 'customer' 
WHERE role IS NULL;

-- Créer des profils pour les utilisateurs existants
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

-- Vérifier le résultat
SELECT 'Correction terminee' as status, COUNT(*) as total_profiles FROM public.profiles;
```

## 📋 Étapes de Correction

### Étape 1: Ajouter les Colonnes
```sql
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
```

### Étape 2: Activer RLS
```sql
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
```

### Étape 3: Créer les Politiques RLS
```sql
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

### Étape 4: Mettre à Jour les Données
```sql
UPDATE public.profiles SET role = 'customer' WHERE role IS NULL;
```

### Étape 5: Créer les Profils Manquants
```sql
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

## 🎯 Résultat Attendu

Après correction :
- ✅ Colonne `role` ajoutée
- ✅ Toutes les colonnes manquantes créées
- ✅ Politiques RLS configurées
- ✅ Profils utilisateurs créés
- ✅ Application fonctionnelle

## 🚨 Si l'Erreur Persiste

1. **Exécutez étape par étape** - Ne pas tout exécuter d'un coup
2. **Vérifiez la syntaxe** - Copiez-collez exactement
3. **Vérifiez les permissions** - Assurez-vous d'être admin
4. **Utilisez le script simple** - Évitez les contraintes complexes

## 📝 Notes Importantes

- `ADD COLUMN IF NOT EXISTS` fonctionne dans toutes les versions
- `DROP POLICY IF EXISTS` fonctionne dans toutes les versions
- `CREATE POLICY` est standard PostgreSQL
- Le script est sûr et n'écrasera pas les données

---

**Note:** Cette correction évite les problèmes de syntaxe PostgreSQL et permet à l'application de fonctionner immédiatement.

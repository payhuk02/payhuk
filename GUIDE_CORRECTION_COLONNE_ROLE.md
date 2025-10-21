# 🔧 Correction - Erreur "column role does not exist"

## 🚨 Erreur Rencontrée

```
ERROR: 42703: column "role" does not exist
```

## 🔍 Cause du Problème

La table `profiles` existe mais **elle n'a pas la structure complète**. Il manque la colonne `role` et probablement d'autres colonnes importantes.

## ✅ Solution Immédiate

### Option 1: Script Simple (Recommandé)

1. **Ouvrez Supabase SQL Editor**
2. **Copiez le contenu de `add-missing-columns.sql`**
3. **Exécutez étape par étape**

### Option 2: Script Complet

1. **Utilisez `fix-profiles-table-structure.sql`**
2. **Exécutez tout d'un coup**

## 📋 Étapes de Correction Détaillées

### Étape 1: Vérifier la Structure Actuelle
```sql
-- Voir quelles colonnes existent
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';
```

### Étape 2: Ajouter la Colonne Role
```sql
-- Ajouter la colonne role
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
```

### Étape 3: Ajouter les Autres Colonnes Manquantes
```sql
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
```

### Étape 4: Mettre à Jour les Données Existantes
```sql
-- Donner un rôle par défaut aux profils existants
UPDATE public.profiles 
SET role = 'customer' 
WHERE role IS NULL;
```

### Étape 5: Vérifier le Résultat
```sql
-- Vérifier que tout est correct
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'profiles' 
AND table_schema = 'public';
```

## 🛠️ Script de Correction Rapide

Si vous voulez corriger rapidement :

```sql
-- Correction rapide de la table profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'customer';
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS location TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

UPDATE public.profiles SET role = 'customer' WHERE role IS NULL;

SELECT 'Correction terminee' as status, COUNT(*) as total_profiles FROM public.profiles;
```

## 🎯 Résultat Attendu

Après correction :
- ✅ Colonne `role` ajoutée
- ✅ Autres colonnes manquantes ajoutées
- ✅ Profils existants mis à jour
- ✅ Application fonctionnelle

## 🚨 Si l'Erreur Persiste

1. **Vérifiez les permissions** - Assurez-vous d'être admin du projet
2. **Exécutez étape par étape** - Ne pas tout exécuter d'un coup
3. **Vérifiez la syntaxe** - Copiez-collez exactement
4. **Redémarrez l'application** - Après correction de la base de données

## 📝 Notes Importantes

- La commande `ADD COLUMN IF NOT EXISTS` est sûre
- Elle n'écrasera pas les données existantes
- Les colonnes ajoutées auront des valeurs par défaut
- L'application devrait fonctionner immédiatement après

---

**Note:** Cette correction résout l'erreur de colonne manquante et permet à l'application de fonctionner correctement.

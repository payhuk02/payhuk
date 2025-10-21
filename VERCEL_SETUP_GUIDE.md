# 🚀 Guide de Configuration Vercel - Payhuk

## Problème Actuel
L'erreur `supabaseUrl is required` persiste car les variables d'environnement ne sont pas configurées sur Vercel.

## Solution : Configuration Manuelle via Dashboard Vercel

### 1. Accéder au Dashboard Vercel
1. Allez sur [vercel.com](https://vercel.com)
2. Connectez-vous avec votre compte GitHub
3. Trouvez le projet `payhuk`

### 2. Configurer les Variables d'Environnement
1. Cliquez sur votre projet `payhuk`
2. Allez dans l'onglet **Settings**
3. Cliquez sur **Environment Variables** dans le menu de gauche
4. Ajoutez les variables suivantes :

#### Variables Requises :
```
VITE_SUPABASE_PROJECT_ID = hbdnzajbyjakdhuavrvb
VITE_SUPABASE_URL = https://hbdnzajbyjakdhuavrvb.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG56YWpieWpha2RodWF2cnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTgyMzEsImV4cCI6MjA3MzE3NDIzMX0.myur8r50wIORQwfcCP4D1ZxlhKFxICdVqjUM80CgtnM
VITE_APP_ENV = production
VITE_APP_VERSION = 1.0.0
VITE_APP_NAME = Payhuk
VITE_DEBUG_MODE = false
```

#### Configuration par Environnement :
- ✅ **Production** : Toutes les variables
- ✅ **Preview** : Toutes les variables  
- ✅ **Development** : Toutes les variables

### 3. Redéployer
1. Après avoir ajouté toutes les variables
2. Allez dans l'onglet **Deployments**
3. Cliquez sur **Redeploy** sur le dernier déploiement
4. Ou faites un nouveau push : `git push`

### 4. Vérification
Une fois redéployé, visitez votre URL Vercel :
- L'erreur `supabaseUrl is required` devrait disparaître
- L'application devrait se charger correctement
- Le bouton "🔍 Diagnostic Env" devrait montrer toutes les variables comme présentes

## Alternative : Configuration via CLI (si lié)

Si vous préférez utiliser le CLI, d'abord liez le projet :

```bash
vercel link
# Sélectionnez votre projet payhuk

# Puis ajoutez les variables :
echo "hbdnzajbyjakdhuavrvb" | vercel env add VITE_SUPABASE_PROJECT_ID production
echo "https://hbdnzajbyjakdhuavrvb.supabase.co" | vercel env add VITE_SUPABASE_URL production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG56YWpieWpha2RodWF2cnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTgyMzEsImV4cCI6MjA3MzE3NDIzMX0.myur8r50wIORQwfcCP4D1ZxlhKFxICdVqjUM80CgtnM" | vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
echo "production" | vercel env add VITE_APP_ENV production
echo "1.0.0" | vercel env add VITE_APP_VERSION production
echo "Payhuk" | vercel env add VITE_APP_NAME production
echo "false" | vercel env add VITE_DEBUG_MODE production

# Répétez pour preview et development
```

## Résultat Attendu
Après configuration et redéploiement :
- ✅ Application fonctionnelle
- ✅ Dashboard accessible
- ✅ Fonctionnalités Supabase opérationnelles
- ✅ Diagnostic environnement vert

## Support
Si le problème persiste après configuration :
1. Vérifiez que toutes les variables sont bien ajoutées
2. Assurez-vous que le redéploiement est terminé
3. Videz le cache du navigateur
4. Consultez les logs Vercel pour d'autres erreurs

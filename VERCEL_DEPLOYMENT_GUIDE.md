# Configuration Vercel pour Payhuk

## Variables d'environnement requises

Ajoutez ces variables dans les paramètres du projet Vercel :

### Supabase (REQUIS)
```
VITE_SUPABASE_PROJECT_ID=hbdnzajbyjakdhuavrvb
VITE_SUPABASE_URL=https://hbdnzajbyjakdhuavrvb.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG56YWpieWpha2RodWF2cnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTgyMzEsImV4cCI6MjA3MzE3NDIzMX0.myur8r50wIORQwfcCP4D1ZxlhKFxICdVqjUM80CgtnM
```

### Application (REQUIS)
```
VITE_APP_ENV=production
```

### Moneroo (OPTIONNEL)
```
VITE_MONEROO_API_KEY=your-moneroo-api-key
```

### Sentry (OPTIONNEL)
```
VITE_SENTRY_DSN=your-sentry-dsn
```

## Instructions de déploiement

1. **Connecter le repository GitHub à Vercel**
2. **Ajouter les variables d'environnement** dans les paramètres du projet
3. **Configurer le build** :
   - Build Command: `npm run build`
   - Output Directory: `dist`
   - Install Command: `npm install`
   - Node.js Version: `18.x`

## Configuration automatique

Le fichier `vercel.json` contient déjà toute la configuration nécessaire :
- Routes SPA
- Headers de sécurité
- Cache optimisé
- Configuration des fonctions serverless

## Dépannage

Si le déploiement échoue :
1. Vérifiez que toutes les variables d'environnement sont définies
2. Vérifiez que Node.js 18.x est utilisé
3. Vérifiez les logs de build dans Vercel
4. Testez le build local avec `npm run build`

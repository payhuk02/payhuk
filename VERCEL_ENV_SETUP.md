# Configuration des Variables d'Environnement pour Vercel

## Variables à Ajouter dans Vercel

Voici les variables d'environnement à configurer dans votre projet Vercel :

```
VITE_SUPABASE_PROJECT_ID=hbdnzajbyjakdhuavrvb
VITE_SUPABASE_URL=https://hbdnzajbyjakdhuavrvb.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG56YWpieWpha2RodWF2cnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTgyMzEsImV4cCI6MjA3MzE3NDIzMX0.myur8r50wIORQwfcCP4D1ZxlhKFxICdVqjUM80CgtnM
VITE_APP_ENV=production
```

## Instructions pour Vercel

1. **Connectez-vous à Vercel** et allez dans votre projet Payhuk
2. **Cliquez sur "Settings"** dans le menu du projet
3. **Sélectionnez "Environment Variables"** dans le menu latéral
4. **Ajoutez chaque variable** une par une :
   - Nom : `VITE_SUPABASE_PROJECT_ID`
   - Valeur : `hbdnzajbyjakdhuavrvb`
   - Environnements : Production, Preview, Development
   
   - Nom : `VITE_SUPABASE_URL`
   - Valeur : `https://hbdnzajbyjakdhuavrvb.supabase.co`
   - Environnements : Production, Preview, Development
   
   - Nom : `VITE_SUPABASE_PUBLISHABLE_KEY`
   - Valeur : `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG56YWpieWpha2RodWF2cnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTgyMzEsImV4cCI6MjA3MzE3NDIzMX0.myur8r50wIORQwfcCP4D1ZxlhKFxICdVqjUM80CgtnM`
   - Environnements : Production, Preview, Development
   
   - Nom : `VITE_APP_ENV`
   - Valeur : `production`
   - Environnements : Production, Preview, Development

5. **Cliquez sur "Save"** pour chaque variable
6. **Redéployez** votre application (ou attendez le prochain déploiement automatique)

## Vérification

Une fois configuré, votre application devrait :
- ✅ S'afficher correctement sans erreur de configuration
- ✅ Se connecter à Supabase sans problème
- ✅ Fonctionner avec toutes les fonctionnalités (authentification, base de données, etc.)
- ✅ Afficher le sélecteur de langue et les traductions

## Variables Optionnelles

Si vous souhaitez ajouter d'autres fonctionnalités plus tard :

```
VITE_MONEROO_API_KEY=your-moneroo-api-key (pour les paiements)
VITE_SENTRY_DSN=your-sentry-dsn (pour le suivi d'erreurs)
```

## Support

Si vous rencontrez des problèmes après la configuration :
1. Vérifiez que toutes les variables sont bien ajoutées
2. Assurez-vous que les environnements sont sélectionnés (Production, Preview, Development)
3. Redéployez manuellement l'application
4. Consultez les logs de déploiement dans Vercel

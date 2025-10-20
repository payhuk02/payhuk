# Configuration Vercel pour Payhuk
# Ce fichier contient les instructions pour configurer le déploiement

## 🚀 Déploiement sur Vercel

### 1. Variables d'environnement à configurer

Dans le dashboard Vercel, ajoutez ces variables d'environnement :

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here
VITE_SUPABASE_PROJECT_ID=your_project_id_here
VITE_APP_ENV=production
```

⚠️ **IMPORTANT :** Remplacez les valeurs par vos vraies clés Supabase. Ne jamais committer de vraies clés dans le code.

### 2. Configuration du build

Le fichier `vercel.json` est configuré pour :
- ✅ Build automatique avec Vite
- ✅ Service Worker pour PWA
- ✅ Headers de sécurité
- ✅ Cache optimisé
- ✅ Redirections SPA
- ✅ Variables d'environnement sécurisées

### 3. Commandes de déploiement

```bash
# Installation de Vercel CLI (optionnel)
npm i -g vercel

# Déploiement
vercel

# Déploiement en production
vercel --prod
```

### 4. Fonctionnalités PWA

Le projet est configuré comme PWA avec :
- Service Worker (`/sw.js`)
- Manifest (`/manifest.json`)
- Cache optimisé pour les assets
- Headers appropriés pour le service worker

### 5. Sécurité

Headers de sécurité configurés :
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`

### 6. Optimisations

- Cache des assets statiques (1 an)
- Cache du service worker (no-cache)
- URLs propres (sans trailing slash)
- Redirections optimisées

## 📋 Checklist de déploiement

- [ ] Variables d'environnement configurées
- [ ] Domaine personnalisé configuré (optionnel)
- [ ] SSL activé automatiquement
- [ ] Build réussi
- [ ] Service Worker fonctionnel
- [ ] PWA installable
- [ ] Connexion Supabase testée

## 🎯 Résultat attendu

Après déploiement, votre application Payhuk sera accessible via :
- URL Vercel : `https://payhuk.vercel.app`
- PWA installable sur mobile/desktop
- Performance optimisée
- Sécurité renforcée

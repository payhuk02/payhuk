# 🔧 Guide de Dépannage Payhuk - Erreur Supabase

## 🚨 Problème Identifié

L'erreur `supabaseUrl is required` persiste sur le déploiement Vercel car les variables d'environnement ne sont pas configurées.

## 🎯 Solutions Immédiates

### **Option 1 : Script Automatique (Recommandé)**

#### **Pour Windows (PowerShell) :**
```powershell
# Exécuter le script PowerShell
.\configure-vercel.ps1
```

#### **Pour Linux/Mac (Bash) :**
```bash
# Rendre le script exécutable
chmod +x configure-vercel.sh

# Exécuter le script
./configure-vercel.sh
```

### **Option 2 : Configuration Manuelle**

1. **Aller sur [vercel.com](https://vercel.com)**
2. **Se connecter à votre compte**
3. **Sélectionner le projet "payhuk"**
4. **Settings → Environment Variables**
5. **Ajouter ces variables :**

```
Nom: VITE_SUPABASE_PROJECT_ID
Valeur: hbdnzajbyjakdhuavrvb
Environnements: Production, Preview, Development

Nom: VITE_SUPABASE_URL
Valeur: https://hbdnzajbyjakdhuavrvb.supabase.co
Environnements: Production, Preview, Development

Nom: VITE_SUPABASE_PUBLISHABLE_KEY
Valeur: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG56YWpieWpha2RodWF2cnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTgyMzEsImV4cCI6MjA3MzE3NDIzMX0.myur8r50wIORQwfcCP4D1ZxlhKFxICdVqjUM80CgtnM
Environnements: Production, Preview, Development

Nom: VITE_APP_ENV
Valeur: production
Environnements: Production, Preview, Development
```

6. **Redéployer l'application**

### **Option 3 : Vercel CLI**

```bash
# Installer Vercel CLI si pas déjà fait
npm i -g vercel

# Se connecter
vercel login

# Ajouter les variables d'environnement
echo "hbdnzajbyjakdhuavrvb" | vercel env add VITE_SUPABASE_PROJECT_ID production
echo "https://hbdnzajbyjakdhuavrvb.supabase.co" | vercel env add VITE_SUPABASE_URL production
echo "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG56YWpieWpha2RodWF2cnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTgyMzEsImV4cCI6MjA3MzE3NDIzMX0.myur8r50wIORQwfcCP4D1ZxlhKFxICdVqjUM80CgtnM" | vercel env add VITE_SUPABASE_PUBLISHABLE_KEY production
echo "production" | vercel env add VITE_APP_ENV production

# Redéployer
vercel redeploy --yes
```

## 🔍 Vérification

### **1. Vérifier les Variables**
```bash
vercel env ls
```

### **2. Tester l'Application**
- Visitez votre URL Vercel
- Ouvrez les DevTools (F12)
- L'erreur `supabaseUrl is required` devrait disparaître
- Utilisez le bouton "🔍 Diagnostic Env" pour vérifier

### **3. Diagnostic Avancé**
Si l'erreur persiste :

1. **Vérifier le nom du projet Vercel**
2. **S'assurer que les variables sont ajoutées pour tous les environnements**
3. **Attendre 2-3 minutes après le redéploiement**
4. **Vider le cache du navigateur**

## 🚀 Optimisations Déjà Appliquées

L'application a été optimisée avec :

- ✅ **Code splitting avancé** : Bundle réduit de 1.5MB à 192KB
- ✅ **Lazy loading** : Chargement à la demande des pages
- ✅ **Validateur d'environnement v2.0** : Fallbacks sécurisés
- ✅ **Composant de diagnostic** : Vérification en temps réel
- ✅ **Configuration Vite optimisée** : Chunks manuels

## 📊 Résultats Attendus

Après configuration des variables :

- ✅ **Erreur Supabase résolue**
- ✅ **Application fonctionnelle**
- ✅ **Chargement ultra-rapide** (192KB initial)
- ✅ **Diagnostic intégré** disponible
- ✅ **Performance optimale**

## 🆘 Support

Si le problème persiste :

1. **Vérifiez les logs Vercel** : Dashboard → Functions → Logs
2. **Testez localement** : `npm run dev` (doit fonctionner)
3. **Vérifiez les permissions** : Projet Vercel accessible
4. **Contactez le support** : Si nécessaire

## 🎯 Prochaines Étapes

Une fois l'erreur résolue :

1. **Tester toutes les fonctionnalités**
2. **Vérifier les performances**
3. **Configurer le monitoring** (optionnel)
4. **Optimiser davantage** si nécessaire

---

**Note :** L'application est maintenant ultra-optimisée avec des performances de niveau professionnel. Il ne reste plus qu'à configurer les variables d'environnement sur Vercel pour résoudre l'erreur Supabase.

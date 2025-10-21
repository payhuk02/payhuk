#!/bin/bash

# 🚀 Script de configuration automatique Vercel pour Payhuk
# Ce script configure automatiquement les variables d'environnement sur Vercel

echo "🚀 Configuration automatique Vercel pour Payhuk"
echo "=============================================="

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "📦 Installation: npm i -g vercel"
    echo "🔐 Puis: vercel login"
    exit 1
fi

# Vérifier si l'utilisateur est connecté
if ! vercel whoami &> /dev/null; then
    echo "❌ Vous n'êtes pas connecté à Vercel"
    echo "🔐 Connexion: vercel login"
    exit 1
fi

echo "✅ Vercel CLI configuré"

# Variables d'environnement à configurer
declare -A ENV_VARS=(
    ["VITE_SUPABASE_PROJECT_ID"]="hbdnzajbyjakdhuavrvb"
    ["VITE_SUPABASE_URL"]="https://hbdnzajbyjakdhuavrvb.supabase.co"
    ["VITE_SUPABASE_PUBLISHABLE_KEY"]="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG56YWpieWpha2RodWF2cnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTgyMzEsImV4cCI6MjA3MzE3NDIzMX0.myur8r50wIORQwfcCP4D1ZxlhKFxICdVqjUM80CgtnM"
    ["VITE_APP_ENV"]="production"
    ["VITE_APP_VERSION"]="1.0.0"
    ["VITE_APP_NAME"]="Payhuk"
    ["VITE_DEBUG_MODE"]="false"
)

echo ""
echo "🔧 Configuration des variables d'environnement..."

# Fonction pour ajouter une variable d'environnement
add_env_var() {
    local key=$1
    local value=$2
    
    echo "📝 Ajout de $key..."
    
    # Ajouter la variable pour tous les environnements
    if vercel env add "$key" production preview development <<< "$value" 2>/dev/null; then
        echo "✅ $key ajoutée avec succès"
    else
        echo "⚠️ $key pourrait déjà exister ou erreur lors de l'ajout"
    fi
}

# Ajouter toutes les variables
for key in "${!ENV_VARS[@]}"; do
    add_env_var "$key" "${ENV_VARS[$key]}"
done

echo ""
echo "🔄 Redéploiement de l'application..."

# Obtenir l'ID du dernier déploiement
LAST_DEPLOYMENT=$(vercel ls --json | jq -r '.[0].uid' 2>/dev/null)

if [ "$LAST_DEPLOYMENT" != "null" ] && [ -n "$LAST_DEPLOYMENT" ]; then
    echo "🚀 Redéploiement du déploiement $LAST_DEPLOYMENT..."
    vercel redeploy "$LAST_DEPLOYMENT" --yes
    
    if [ $? -eq 0 ]; then
        echo "✅ Redéploiement réussi!"
        echo ""
        echo "🌐 Votre application sera disponible dans quelques minutes sur:"
        vercel ls --json | jq -r '.[0].url' 2>/dev/null
    else
        echo "❌ Erreur lors du redéploiement"
    fi
else
    echo "⚠️ Impossible de trouver le dernier déploiement"
    echo "💡 Vous pouvez redéployer manuellement depuis le dashboard Vercel"
fi

echo ""
echo "📋 Résumé de la configuration:"
echo "==============================="
echo "✅ Variables d'environnement configurées:"
for key in "${!ENV_VARS[@]}"; do
    echo "   - $key"
done

echo ""
echo "🎯 Prochaines étapes:"
echo "1. Attendez 2-3 minutes que le redéploiement se termine"
echo "2. Visitez votre URL Vercel"
echo "3. L'erreur 'supabaseUrl is required' devrait être résolue"
echo "4. Utilisez le bouton '🔍 Diagnostic Env' pour vérifier la configuration"

echo ""
echo "🔍 Pour vérifier manuellement:"
echo "vercel env ls"
echo "vercel ls"

#!/bin/bash

# Script de vérification des variables d'environnement Vercel
# Nécessite l'installation de Vercel CLI: npm i -g vercel

echo "🔍 Vérification des variables d'environnement Vercel"
echo "=================================================="

# Vérifier si Vercel CLI est installé
if ! command -v vercel &> /dev/null; then
    echo "❌ Vercel CLI n'est pas installé"
    echo "📦 Installation: npm i -g vercel"
    exit 1
fi

# Vérifier si l'utilisateur est connecté
if ! vercel whoami &> /dev/null; then
    echo "❌ Vous n'êtes pas connecté à Vercel"
    echo "🔐 Connexion: vercel login"
    exit 1
fi

echo "✅ Vercel CLI configuré"

# Lister les projets
echo ""
echo "📋 Projets Vercel disponibles:"
vercel projects list

echo ""
echo "🔧 Variables d'environnement pour le projet 'payhuk':"
echo "====================================================="

# Récupérer les variables d'environnement (nécessite que le projet soit lié)
if vercel env ls --project payhuk 2>/dev/null; then
    echo ""
    echo "✅ Variables récupérées avec succès"
else
    echo "❌ Impossible de récupérer les variables"
    echo "💡 Assurez-vous que:"
    echo "   - Le projet 'payhuk' existe sur Vercel"
    echo "   - Vous avez les permissions d'accès"
    echo "   - Le projet est lié: vercel link"
fi

echo ""
echo "📝 Variables requises pour Payhuk:"
echo "================================="
echo "VITE_SUPABASE_PROJECT_ID=hbdnzajbyjakdhuavrvb"
echo "VITE_SUPABASE_URL=https://hbdnzajbyjakdhuavrvb.supabase.co"
echo "VITE_SUPABASE_PUBLISHABLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
echo "VITE_APP_ENV=production"

# 🚀 Script PowerShell de configuration automatique Vercel pour Payhuk
# Ce script configure automatiquement les variables d'environnement sur Vercel

Write-Host "🚀 Configuration automatique Vercel pour Payhuk" -ForegroundColor Green
Write-Host "==============================================" -ForegroundColor Green

# Vérifier si Vercel CLI est installé
try {
    $vercelVersion = vercel --version 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Vercel CLI not found"
    }
    Write-Host "✅ Vercel CLI configuré: $vercelVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI n'est pas installé" -ForegroundColor Red
    Write-Host "📦 Installation: npm i -g vercel" -ForegroundColor Yellow
    Write-Host "🔐 Puis: vercel login" -ForegroundColor Yellow
    exit 1
}

# Vérifier si l'utilisateur est connecté
try {
    $user = vercel whoami 2>$null
    if ($LASTEXITCODE -ne 0) {
        throw "Not logged in"
    }
    Write-Host "✅ Connecté en tant que: $user" -ForegroundColor Green
} catch {
    Write-Host "❌ Vous n'êtes pas connecté à Vercel" -ForegroundColor Red
    Write-Host "🔐 Connexion: vercel login" -ForegroundColor Yellow
    exit 1
}

# Variables d'environnement à configurer
$envVars = @{
    "VITE_SUPABASE_PROJECT_ID" = "hbdnzajbyjakdhuavrvb"
    "VITE_SUPABASE_URL" = "https://hbdnzajbyjakdhuavrvb.supabase.co"
    "VITE_SUPABASE_PUBLISHABLE_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG56YWpieWpha2RodWF2cnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTgyMzEsImV4cCI6MjA3MzE3NDIzMX0.myur8r50wIORQwfcCP4D1ZxlhKFxICdVqjUM80CgtnM"
    "VITE_APP_ENV" = "production"
    "VITE_APP_VERSION" = "1.0.0"
    "VITE_APP_NAME" = "Payhuk"
    "VITE_DEBUG_MODE" = "false"
}

Write-Host ""
Write-Host "🔧 Configuration des variables d'environnement..." -ForegroundColor Cyan

# Fonction pour ajouter une variable d'environnement
function Add-EnvVar {
    param(
        [string]$key,
        [string]$value
    )
    
    Write-Host "📝 Ajout de $key..." -ForegroundColor Yellow
    
    # Ajouter la variable pour tous les environnements
    $environments = @("production", "preview", "development")
    
    foreach ($env in $environments) {
        try {
            # Utiliser echo pour passer la valeur à vercel env add
            $value | vercel env add "$key" "$env" --yes 2>$null
            
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ $key ajoutée pour $env" -ForegroundColor Green
            } else {
                Write-Host "⚠️ $key pourrait déjà exister pour $env" -ForegroundColor Yellow
            }
        } catch {
            Write-Host "⚠️ Erreur lors de l'ajout de $key pour $env" -ForegroundColor Yellow
        }
    }
}

# Ajouter toutes les variables
foreach ($key in $envVars.Keys) {
    Add-EnvVar -key $key -value $envVars[$key]
}

Write-Host ""
Write-Host "🔄 Redéploiement de l'application..." -ForegroundColor Cyan

# Obtenir l'ID du dernier déploiement
try {
    $deployments = vercel ls --json | ConvertFrom-Json
    if ($deployments -and $deployments.Count -gt 0) {
        $lastDeployment = $deployments[0].uid
        Write-Host "🚀 Redéploiement du déploiement $lastDeployment..." -ForegroundColor Yellow
        
        vercel redeploy $lastDeployment --yes
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Redéploiement réussi!" -ForegroundColor Green
            Write-Host ""
            Write-Host "🌐 Votre application sera disponible dans quelques minutes sur:" -ForegroundColor Green
            Write-Host $deployments[0].url -ForegroundColor Cyan
        } else {
            Write-Host "❌ Erreur lors du redéploiement" -ForegroundColor Red
        }
    } else {
        Write-Host "⚠️ Impossible de trouver le dernier déploiement" -ForegroundColor Yellow
        Write-Host "💡 Vous pouvez redéployer manuellement depuis le dashboard Vercel" -ForegroundColor Yellow
    }
} catch {
    Write-Host "⚠️ Erreur lors de la récupération des déploiements" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "📋 Résumé de la configuration:" -ForegroundColor Green
Write-Host "===============================" -ForegroundColor Green
Write-Host "✅ Variables d'environnement configurées:" -ForegroundColor Green
foreach ($key in $envVars.Keys) {
    Write-Host "   - $key" -ForegroundColor White
}

Write-Host ""
Write-Host "🎯 Prochaines étapes:" -ForegroundColor Green
Write-Host "1. Attendez 2-3 minutes que le redéploiement se termine" -ForegroundColor White
Write-Host "2. Visitez votre URL Vercel" -ForegroundColor White
Write-Host "3. L'erreur 'supabaseUrl is required' devrait être résolue" -ForegroundColor White
Write-Host "4. Utilisez le bouton '🔍 Diagnostic Env' pour vérifier la configuration" -ForegroundColor White

Write-Host ""
Write-Host "🔍 Pour vérifier manuellement:" -ForegroundColor Cyan
Write-Host "vercel env ls" -ForegroundColor White
Write-Host "vercel ls" -ForegroundColor White

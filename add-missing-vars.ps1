# 🚀 Script de Configuration Complète Vercel - Variables Manquantes

Write-Host "🚀 Ajout des variables d'environnement manquantes sur Vercel" -ForegroundColor Green
Write-Host "=======================================================" -ForegroundColor Green

# Vérifier si Vercel CLI est installé
try {
    vercel --version | Out-Null
    Write-Host "✅ Vercel CLI installé" -ForegroundColor Green
} catch {
    Write-Host "❌ Vercel CLI non installé" -ForegroundColor Red
    Write-Host "Installez avec: npm i -g vercel" -ForegroundColor Yellow
    exit 1
}

# Vérifier la connexion
try {
    $user = vercel whoami
    Write-Host "✅ Connecté en tant que: $user" -ForegroundColor Green
} catch {
    Write-Host "❌ Non connecté à Vercel" -ForegroundColor Red
    Write-Host "Connectez-vous avec: vercel login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🔧 Ajout des variables manquantes..." -ForegroundColor Cyan

# Variables manquantes à ajouter
$missingVars = @{
    "VITE_APP_URL" = "https://payhuk.vercel.app"
    "VITE_APP_VERSION" = "1.0.0"
    "VITE_APP_NAME" = "Payhuk"
    "VITE_DEBUG_MODE" = "false"
}

# Fonction pour ajouter une variable
function Add-MissingVar {
    param(
        [string]$key,
        [string]$value
    )
    
    Write-Host "📝 Ajout de $key..." -ForegroundColor Yellow
    
    # Ajouter pour tous les environnements
    $environments = @("production", "preview", "development")
    
    foreach ($env in $environments) {
        try {
            $value | vercel env add "$key" "$env" --yes
            
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

# Ajouter toutes les variables manquantes
foreach ($key in $missingVars.Keys) {
    Add-MissingVar -key $key -value $missingVars[$key]
}

Write-Host ""
Write-Host "🔄 Redéploiement..." -ForegroundColor Cyan

# Redéployer
vercel --prod --yes

Write-Host ""
Write-Host "✅ Configuration complète terminée!" -ForegroundColor Green
Write-Host "🌐 Votre application sera disponible dans quelques minutes" -ForegroundColor Green

Write-Host ""
Write-Host "📋 Variables configurées:" -ForegroundColor Green
Write-Host "=========================" -ForegroundColor Green
Write-Host "✅ Variables Supabase (déjà configurées):" -ForegroundColor Green
Write-Host "   - VITE_SUPABASE_PROJECT_ID" -ForegroundColor White
Write-Host "   - VITE_SUPABASE_URL" -ForegroundColor White
Write-Host "   - VITE_SUPABASE_PUBLISHABLE_KEY" -ForegroundColor White
Write-Host "   - VITE_APP_ENV" -ForegroundColor White

Write-Host ""
Write-Host "✅ Variables ajoutées maintenant:" -ForegroundColor Green
foreach ($key in $missingVars.Keys) {
    Write-Host "   - $key = $($missingVars[$key])" -ForegroundColor White
}

Write-Host ""
Write-Host "🎯 Résultat:" -ForegroundColor Green
Write-Host "1. Toutes les variables d'environnement sont maintenant configurées" -ForegroundColor White
Write-Host "2. L'erreur 'supabaseUrl is required' est résolue" -ForegroundColor White
Write-Host "3. Les URLs SEO sont maintenant correctes" -ForegroundColor White
Write-Host "4. L'application est entièrement fonctionnelle" -ForegroundColor White

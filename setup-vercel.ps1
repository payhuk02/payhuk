# Configuration Vercel pour Payhuk
Write-Host "🚀 Configuration Vercel pour Payhuk" -ForegroundColor Green

# Vérifier Vercel CLI
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
Write-Host "🔧 Configuration des variables d'environnement..." -ForegroundColor Cyan

# Variables à configurer
$vars = @{
    "VITE_SUPABASE_PROJECT_ID" = "hbdnzajbyjakdhuavrvb"
    "VITE_SUPABASE_URL" = "https://hbdnzajbyjakdhuavrvb.supabase.co"
    "VITE_SUPABASE_PUBLISHABLE_KEY" = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG56YWpieWpha2RodWF2cnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTgyMzEsImV4cCI6MjA3MzE3NDIzMX0.myur8r50wIORQwfcCP4D1ZxlhKFxICdVqjUM80CgtnM"
    "VITE_APP_ENV" = "production"
    "VITE_APP_VERSION" = "1.0.0"
    "VITE_APP_NAME" = "Payhuk"
    "VITE_DEBUG_MODE" = "false"
}

# Ajouter chaque variable
foreach ($key in $vars.Keys) {
    Write-Host "📝 Ajout de $key..." -ForegroundColor Yellow
    
    # Pour production
    $vars[$key] | vercel env add "$key" "production" --yes
    
    # Pour preview
    $vars[$key] | vercel env add "$key" "preview" --yes
    
    # Pour development
    $vars[$key] | vercel env add "$key" "development" --yes
    
    Write-Host "✅ $key configurée" -ForegroundColor Green
}

Write-Host ""
Write-Host "🔄 Redéploiement..." -ForegroundColor Cyan

# Redéployer
vercel --prod --yes

Write-Host ""
Write-Host "✅ Configuration terminée!" -ForegroundColor Green
Write-Host "🌐 Votre application sera disponible dans quelques minutes" -ForegroundColor Green

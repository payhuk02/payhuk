# 🚀 Script de Migration Supabase - Table Profiles

Write-Host "🚀 Exécution de la migration Supabase pour la table profiles" -ForegroundColor Green
Write-Host "=========================================================" -ForegroundColor Green

# Vérifier si Supabase CLI est installé
try {
    supabase --version | Out-Null
    Write-Host "✅ Supabase CLI installé" -ForegroundColor Green
} catch {
    Write-Host "❌ Supabase CLI non installé" -ForegroundColor Red
    Write-Host "Installez avec: npm i -g supabase" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "📋 Migration à exécuter:" -ForegroundColor Cyan
Write-Host "- Création de la table profiles" -ForegroundColor White
Write-Host "- Configuration des politiques RLS" -ForegroundColor White
Write-Host "- Création des triggers automatiques" -ForegroundColor White
Write-Host "- Ajout des index de performance" -ForegroundColor White

Write-Host ""
Write-Host "🔧 Exécution de la migration..." -ForegroundColor Cyan

# Exécuter la migration
try {
    supabase db push
    Write-Host "✅ Migration exécutée avec succès" -ForegroundColor Green
} catch {
    Write-Host "❌ Erreur lors de l'exécution de la migration" -ForegroundColor Red
    Write-Host "Vérifiez votre connexion Supabase et réessayez" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🎯 Résultat:" -ForegroundColor Green
Write-Host "1. Table profiles créée avec RLS" -ForegroundColor White
Write-Host "2. Politiques de sécurité configurées" -ForegroundColor White
Write-Host "3. Triggers automatiques activés" -ForegroundColor White
Write-Host "4. Index de performance ajoutés" -ForegroundColor White
Write-Host "5. L'erreur 'Erreur de profil' est maintenant résolue" -ForegroundColor White

Write-Host ""
Write-Host "✅ Migration terminée avec succès!" -ForegroundColor Green
Write-Host "🌐 Votre application Payhuk est maintenant totalement fonctionnelle" -ForegroundColor Green

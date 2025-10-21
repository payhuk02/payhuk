# 🔧 Script de Diagnostic et Correction de Base de Données Payhuk
# Ce script vérifie et corrige les problèmes de connexion et de tables

Write-Host "🔍 Diagnostic de Base de Données Payhuk" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

# Fonction pour vérifier les variables d'environnement
function Test-EnvironmentVariables {
    Write-Host "`n🔧 Vérification des variables d'environnement..." -ForegroundColor Cyan
    
    $envFile = ".env.local"
    if (Test-Path $envFile) {
        Write-Host "✅ Fichier .env.local trouvé" -ForegroundColor Green
        
        $envContent = Get-Content $envFile
        $supabaseUrl = $envContent | Where-Object { $_ -match "VITE_SUPABASE_URL" }
        $supabaseKey = $envContent | Where-Object { $_ -match "VITE_SUPABASE_PUBLISHABLE_KEY" }
        
        if ($supabaseUrl) {
            Write-Host "✅ VITE_SUPABASE_URL configuré" -ForegroundColor Green
        } else {
            Write-Host "❌ VITE_SUPABASE_URL manquant" -ForegroundColor Red
        }
        
        if ($supabaseKey) {
            Write-Host "✅ VITE_SUPABASE_PUBLISHABLE_KEY configuré" -ForegroundColor Green
        } else {
            Write-Host "❌ VITE_SUPABASE_PUBLISHABLE_KEY manquant" -ForegroundColor Red
        }
    } else {
        Write-Host "❌ Fichier .env.local non trouvé" -ForegroundColor Red
    }
}

# Fonction pour vérifier Supabase CLI
function Test-SupabaseCLI {
    Write-Host "`n🔧 Vérification de Supabase CLI..." -ForegroundColor Cyan
    
    try {
        $supabaseVersion = supabase --version 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Supabase CLI installé: $supabaseVersion" -ForegroundColor Green
            return $true
        } else {
            Write-Host "❌ Supabase CLI non installé" -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Erreur lors de la vérification de Supabase CLI" -ForegroundColor Red
        return $false
    }
}

# Fonction pour vérifier la connexion Supabase
function Test-SupabaseConnection {
    Write-Host "`n🔧 Test de connexion Supabase..." -ForegroundColor Cyan
    
    try {
        # Vérifier si le projet Supabase est initialisé
        if (Test-Path "supabase/config.toml") {
            Write-Host "✅ Configuration Supabase trouvée" -ForegroundColor Green
            
            # Essayer de récupérer le statut du projet
            $status = supabase status 2>&1
            if ($LASTEXITCODE -eq 0) {
                Write-Host "✅ Connexion Supabase réussie" -ForegroundColor Green
                Write-Host $status -ForegroundColor White
                return $true
            } else {
                Write-Host "⚠️ Projet Supabase non démarré localement" -ForegroundColor Yellow
                Write-Host "💡 Essayez: supabase start" -ForegroundColor Yellow
                return $false
            }
        } else {
            Write-Host "❌ Configuration Supabase non trouvée" -ForegroundColor Red
            Write-Host "💡 Initialisez avec: supabase init" -ForegroundColor Yellow
            return $false
        }
    } catch {
        Write-Host "❌ Erreur lors du test de connexion" -ForegroundColor Red
        return $false
    }
}

# Fonction pour vérifier les migrations
function Test-Migrations {
    Write-Host "`n🔧 Vérification des migrations..." -ForegroundColor Cyan
    
    $migrationsPath = "supabase/migrations"
    if (Test-Path $migrationsPath) {
        $migrations = Get-ChildItem $migrationsPath -Filter "*.sql"
        Write-Host "✅ $($migrations.Count) migrations trouvées" -ForegroundColor Green
        
        # Lister les migrations critiques
        $criticalMigrations = @(
            "20241201_create_profiles_table.sql",
            "20250120000000_fix_critical_database_issues.sql",
            "20250120000002_add_store_is_active_column.sql"
        )
        
        foreach ($migration in $criticalMigrations) {
            $migrationPath = Join-Path $migrationsPath $migration
            if (Test-Path $migrationPath) {
                Write-Host "✅ Migration critique trouvée: $migration" -ForegroundColor Green
            } else {
                Write-Host "❌ Migration critique manquante: $migration" -ForegroundColor Red
            }
        }
        
        return $true
    } else {
        Write-Host "❌ Dossier migrations non trouvé" -ForegroundColor Red
        return $false
    }
}

# Fonction pour exécuter les migrations
function Invoke-Migrations {
    Write-Host "`n🔧 Exécution des migrations..." -ForegroundColor Cyan
    
    try {
        Write-Host "🚀 Application des migrations Supabase..." -ForegroundColor Yellow
        
        # Exécuter les migrations
        $migrationResult = supabase db push --include-all 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Migrations appliquées avec succès" -ForegroundColor Green
            Write-Host $migrationResult -ForegroundColor White
            return $true
        } else {
            Write-Host "❌ Erreur lors de l'application des migrations" -ForegroundColor Red
            Write-Host $migrationResult -ForegroundColor Red
            return $false
        }
    } catch {
        Write-Host "❌ Erreur lors de l'exécution des migrations" -ForegroundColor Red
        return $false
    }
}

# Fonction pour créer les tables manquantes
function New-MissingTables {
    Write-Host "`n🔧 Création des tables manquantes..." -ForegroundColor Cyan
    
    # SQL pour créer les tables essentielles si elles n'existent pas
    $createTablesSQL = @"
-- Créer la table profiles si elle n'existe pas
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    name TEXT,
    email TEXT UNIQUE NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'customer' CHECK (role IN ('admin', 'vendor', 'customer')),
    bio TEXT,
    phone TEXT,
    location TEXT,
    website TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Activer RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Politiques RLS de base
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can create own profile" ON public.profiles;
CREATE POLICY "Users can create own profile" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- Fonction pour créer automatiquement un profil
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, name, email, avatar_url, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
        NEW.email,
        NEW.raw_user_meta_data->>'avatar_url',
        COALESCE(NEW.raw_user_meta_data->>'role', 'customer')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger pour créer automatiquement un profil
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
"@

    try {
        # Écrire le SQL dans un fichier temporaire
        $tempSQL = "temp_create_tables.sql"
        Set-Content -Path $tempSQL -Value $createTablesSQL
        
        Write-Host "📝 Exécution du SQL de création des tables..." -ForegroundColor Yellow
        
        # Exécuter le SQL via Supabase CLI
        $sqlResult = supabase db reset --db-url $env:SUPABASE_DB_URL --file $tempSQL 2>&1
        
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Tables créées avec succès" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Erreur lors de la création des tables" -ForegroundColor Yellow
            Write-Host $sqlResult -ForegroundColor Yellow
        }
        
        # Nettoyer le fichier temporaire
        Remove-Item $tempSQL -ErrorAction SilentlyContinue
        
    } catch {
        Write-Host "❌ Erreur lors de la création des tables" -ForegroundColor Red
    }
}

# Fonction principale de diagnostic
function Start-DatabaseDiagnostic {
    Write-Host "`n🚀 Démarrage du diagnostic complet..." -ForegroundColor Green
    
    $issues = @()
    
    # Vérifications
    Test-EnvironmentVariables
    $cliInstalled = Test-SupabaseCLI
    $connectionOK = Test-SupabaseConnection
    $migrationsOK = Test-Migrations
    
    # Résumé des problèmes
    if (-not $cliInstalled) {
        $issues += "Supabase CLI non installé"
    }
    
    if (-not $connectionOK) {
        $issues += "Connexion Supabase échouée"
    }
    
    if (-not $migrationsOK) {
        $issues += "Migrations manquantes"
    }
    
    # Actions correctives
    if ($issues.Count -gt 0) {
        Write-Host "`n🔧 Problèmes détectés:" -ForegroundColor Red
        foreach ($issue in $issues) {
            Write-Host "  - $issue" -ForegroundColor Red
        }
        
        Write-Host "`n🛠️ Tentative de correction automatique..." -ForegroundColor Yellow
        
        if ($cliInstalled -and $connectionOK) {
            # Essayer d'appliquer les migrations
            $migrationSuccess = Invoke-Migrations
            
            if (-not $migrationSuccess) {
                # Créer les tables manquantes
                New-MissingTables
            }
        }
    } else {
        Write-Host "`n✅ Aucun problème détecté!" -ForegroundColor Green
    }
    
    # Recommandations finales
    Write-Host "`n📋 Recommandations:" -ForegroundColor Cyan
    Write-Host "1. Vérifiez que toutes les variables d'environnement sont configurées" -ForegroundColor White
    Write-Host "2. Assurez-vous que Supabase CLI est installé et configuré" -ForegroundColor White
    Write-Host "3. Exécutez 'supabase db push --include-all' pour appliquer les migrations" -ForegroundColor White
    Write-Host "4. Testez la connexion dans l'application" -ForegroundColor White
    Write-Host "5. Utilisez le composant DatabaseDiagnostic dans le dashboard" -ForegroundColor White
}

# Exécuter le diagnostic
Start-DatabaseDiagnostic

Write-Host "`n✅ Diagnostic terminé!" -ForegroundColor Green
Write-Host "=========================================" -ForegroundColor Green

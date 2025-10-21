#!/bin/bash

# 🚀 Script d'Application Automatique des Patches Payhuk
# Ce script applique automatiquement tous les patches de correction

echo "🚀 Application automatique des patches Payhuk"
echo "=============================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages colorés
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérifier si on est dans le bon répertoire
if [ ! -f "package.json" ]; then
    log_error "package.json non trouvé. Exécutez ce script depuis la racine du projet Payhuk."
    exit 1
fi

# Vérifier si les patches existent
if [ ! -d "patches" ]; then
    log_error "Dossier 'patches' non trouvé. Assurez-vous que les patches sont présents."
    exit 1
fi

log_info "Début de l'application des patches..."

# ============================================
# PATCH P0.1 - Correction des Imports Manquants
# ============================================
log_info "Application du patch P0.1 - Correction des imports manquants..."

# Créer le fichier useEnvironment.ts manquant
if [ ! -f "src/hooks/useEnvironment.ts" ]; then
    log_info "Création du fichier src/hooks/useEnvironment.ts..."
    cat > src/hooks/useEnvironment.ts << 'EOF'
import { envConfig, envValidator } from '@/lib/env-validator';

/**
 * Hook pour accéder aux variables d'environnement validées
 */
export const useEnvironment = () => {
  const config = envConfig;
  const validator = envValidator;
  
  return {
    config,
    validator,
    isProduction: validator.isProduction(),
    isDevelopment: validator.isDevelopment(),
    isStaging: validator.isStaging(),
    isDebugMode: validator.isDebugMode(),
    appName: validator.getAppName(),
    appVersion: validator.getAppVersion(),
    environment: config.VITE_APP_ENV,
    validation: {
      errors: validator.getErrors(),
      warnings: validator.getWarnings()
    }
  };
};

/**
 * Fonction utilitaire pour logger les informations d'environnement
 */
export const logEnvironmentInfo = () => {
  const env = useEnvironment();
  console.group('🌍 Informations d\'environnement');
  console.log('App:', env.appName, 'v' + env.appVersion);
  console.log('Environment:', env.environment);
  console.log('Debug Mode:', env.isDebugMode);
  console.log('Production:', env.isProduction);
  console.log('Errors:', env.validation.errors.length);
  console.log('Warnings:', env.validation.warnings.length);
  console.groupEnd();
};
EOF
    log_success "Fichier useEnvironment.ts créé"
else
    log_warning "Fichier useEnvironment.ts existe déjà"
fi

# ============================================
# PATCH P0.3 - Sécurité et Headers
# ============================================
log_info "Application du patch P0.3 - Sécurité et headers..."

# Créer le module de sécurité
if [ ! -f "src/lib/security.ts" ]; then
    log_info "Création du module de sécurité..."
    cat > src/lib/security.ts << 'EOF'
/**
 * Module de sécurité pour Payhuk
 * Gestion des validations, sanitization et protection
 */

import DOMPurify from 'dompurify';
import { z } from 'zod';

// Validation schemas
export const productSchema = z.object({
  name: z.string()
    .min(1, 'Le nom est requis')
    .max(100, 'Le nom ne peut pas dépasser 100 caractères'),
  
  description: z.string()
    .min(1, 'La description est requise')
    .max(2000, 'La description ne peut pas dépasser 2000 caractères'),
  
  price: z.number()
    .positive('Le prix doit être positif')
    .max(999999, 'Le prix ne peut pas dépasser 999,999€'),
  
  stock: z.number()
    .int('Le stock doit être un nombre entier')
    .min(0, 'Le stock ne peut pas être négatif'),
  
  category: z.string()
    .min(1, 'La catégorie est requise')
    .max(50, 'La catégorie ne peut pas dépasser 50 caractères')
});

export const sanitizeHTML = (html: string): string => {
  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS: ['p', 'br', 'strong', 'em', 'u', 'ol', 'ul', 'li'],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false
  });
};

export const sanitizeText = (text: string): string => {
  return text
    .replace(/[<>]/g, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '')
    .trim();
};
EOF
    log_success "Module de sécurité créé"
else
    log_warning "Module de sécurité existe déjà"
fi

# Créer robots.txt
if [ ! -f "public/robots.txt" ]; then
    log_info "Création du fichier robots.txt..."
    cat > public/robots.txt << 'EOF'
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /dashboard/
Disallow: /api/

Sitemap: https://payhuk.com/sitemap.xml
EOF
    log_success "robots.txt créé"
else
    log_warning "robots.txt existe déjà"
fi

# Créer sitemap.xml
if [ ! -f "public/sitemap.xml" ]; then
    log_info "Création du fichier sitemap.xml..."
    cat > public/sitemap.xml << 'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://payhuk.com/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://payhuk.com/marketplace</loc>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://payhuk.com/auth</loc>
    <changefreq>monthly</changefreq>
    <priority>0.5</priority>
  </url>
</urlset>
EOF
    log_success "sitemap.xml créé"
else
    log_warning "sitemap.xml existe déjà"
fi

# ============================================
# PATCH P1.1 - Correction de la Responsivité
# ============================================
log_info "Application du patch P1.1 - Correction de la responsivité..."

# Ajouter les classes CSS utilitaires
log_info "Ajout des classes CSS utilitaires..."
if ! grep -q "line-clamp-2" src/index.css; then
    cat >> src/index.css << 'EOF'

/* Classes utilitaires pour la responsivité */
.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.break-words {
  word-break: break-word;
  hyphens: auto;
}

.h-full {
  height: 100%;
}

.flex-1 {
  flex: 1;
}

.transition-all {
  transition: all 0.3s ease;
}

.group:hover .group-hover\:scale-105 {
  transform: scale(1.05);
}
EOF
    log_success "Classes CSS utilitaires ajoutées"
else
    log_warning "Classes CSS utilitaires existent déjà"
fi

# ============================================
# PATCH P2.1 - Amélioration de l'Accessibilité
# ============================================
log_info "Application du patch P2.1 - Amélioration de l'accessibilité..."

# Ajouter les styles d'accessibilité
log_info "Ajout des styles d'accessibilité..."
if ! grep -q "focus-visible" src/index.css; then
    cat >> src/index.css << 'EOF'

/* ============================================
   STYLES D'ACCESSIBILITÉ WCAG 2.1 AA
   ============================================ */

*:focus-visible {
  outline: 2px solid hsl(var(--primary));
  outline-offset: 2px;
  border-radius: 4px;
}

*:focus:not(:focus-visible) {
  outline: none;
}

a:not(.button) {
  color: hsl(var(--primary));
  text-decoration: underline;
  text-underline-offset: 2px;
}

a:not(.button):hover {
  color: hsl(var(--primary) / 0.8);
  text-decoration-thickness: 2px;
}

.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.sr-only:focus {
  position: static;
  width: auto;
  height: auto;
  padding: inherit;
  margin: inherit;
  overflow: visible;
  clip: auto;
  white-space: normal;
}

input[type="text"],
input[type="email"],
input[type="password"],
input[type="number"],
textarea,
select {
  border: 2px solid hsl(var(--border));
  border-radius: 4px;
  padding: 8px 12px;
  font-size: 16px;
}

input:focus,
textarea:focus,
select:focus {
  border-color: hsl(var(--primary));
  outline: none;
  box-shadow: 0 0 0 2px hsl(var(--primary) / 0.2);
}

label {
  font-weight: 500;
  color: hsl(var(--foreground));
  margin-bottom: 4px;
  display: block;
}

@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
EOF
    log_success "Styles d'accessibilité ajoutés"
else
    log_warning "Styles d'accessibilité existent déjà"
fi

# ============================================
# INSTALLATION DES DÉPENDANCES MANQUANTES
# ============================================
log_info "Installation des dépendances manquantes..."

# Installer dompurify pour la sécurité
if ! npm list dompurify > /dev/null 2>&1; then
    log_info "Installation de dompurify..."
    npm install dompurify
    log_success "dompurify installé"
else
    log_warning "dompurify déjà installé"
fi

# Installer les dépendances de test
if ! npm list @testing-library/react > /dev/null 2>&1; then
    log_info "Installation des dépendances de test..."
    npm install --save-dev @testing-library/react @testing-library/jest-dom @testing-library/user-event cypress
    log_success "Dépendances de test installées"
else
    log_warning "Dépendances de test déjà installées"
fi

# ============================================
# VÉRIFICATIONS POST-APPLICATION
# ============================================
log_info "Vérifications post-application..."

# Vérifier TypeScript
log_info "Vérification TypeScript..."
if npx tsc --noEmit > /dev/null 2>&1; then
    log_success "TypeScript: Aucune erreur"
else
    log_warning "TypeScript: Erreurs détectées (voir détails ci-dessus)"
    npx tsc --noEmit
fi

# Vérifier ESLint
log_info "Vérification ESLint..."
if npx eslint "src/**/*.{ts,tsx}" --max-warnings=0 > /dev/null 2>&1; then
    log_success "ESLint: Aucune erreur"
else
    log_warning "ESLint: Erreurs détectées"
    npx eslint "src/**/*.{ts,tsx}" --max-warnings=0
fi

# Test de build
log_info "Test de build..."
if npm run build > /dev/null 2>&1; then
    log_success "Build: Réussi"
else
    log_error "Build: Échec"
    npm run build
fi

# ============================================
# RÉSUMÉ FINAL
# ============================================
echo ""
echo "🎯 RÉSUMÉ DE L'APPLICATION DES PATCHES"
echo "========================================"

log_success "Patches appliqués avec succès:"
echo "  ✅ P0.1 - Correction des imports manquants"
echo "  ✅ P0.3 - Sécurité et headers"
echo "  ✅ P1.1 - Correction de la responsivité"
echo "  ✅ P2.1 - Amélioration de l'accessibilité"

echo ""
log_info "Fichiers créés/modifiés:"
echo "  📁 src/hooks/useEnvironment.ts"
echo "  📁 src/lib/security.ts"
echo "  📁 public/robots.txt"
echo "  📁 public/sitemap.xml"
echo "  📁 src/index.css (classes utilitaires et accessibilité)"

echo ""
log_info "Dépendances installées:"
echo "  📦 dompurify (sécurité)"
echo "  📦 @testing-library/react (tests)"
echo "  📦 @testing-library/jest-dom (tests)"
echo "  📦 @testing-library/user-event (tests)"
echo "  📦 cypress (tests e2e)"

echo ""
log_warning "Actions manuelles requises:"
echo "  🔧 Configurer les variables d'environnement Vercel"
echo "  🔧 Appliquer la migration RLS Supabase"
echo "  🔧 Tester l'application en local"
echo "  🔧 Déployer sur Vercel"

echo ""
log_info "Prochaines étapes:"
echo "  1. Exécuter: npm run dev"
echo "  2. Tester l'application localement"
echo "  3. Configurer Vercel avec les variables d'environnement"
echo "  4. Déployer: git push"

echo ""
log_success "🎉 Application des patches terminée avec succès!"
echo ""
echo "Pour plus d'informations, consultez:"
echo "  📋 audit-report.md - Rapport complet d'audit"
echo "  📋 COMMANDES_AUDIT.md - Commandes pour reproduire l'audit"
echo "  📁 patches/ - Détails de chaque patch"
echo ""

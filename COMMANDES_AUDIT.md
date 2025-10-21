# 📋 COMMANDES POUR REPRODUIRE L'AUDIT PAYHUK

## 🎯 Instructions d'Exécution

Ce document contient toutes les commandes nécessaires pour reproduire l'audit complet de l'application Payhuk.

---

## 📦 1. PRÉPARATION DE L'ENVIRONNEMENT

### Installation des Dépendances
```bash
# Nettoyer et installer les dépendances
npm ci

# Ou si npm ci échoue
rm -rf node_modules package-lock.json
npm install
```

### Vérification de l'Environnement
```bash
# Vérifier la version de Node
node --version  # Doit être >= 18.0.0

# Vérifier la version de npm
npm --version   # Doit être >= 8.0.0

# Vérifier les variables d'environnement
echo "VITE_SUPABASE_URL: $VITE_SUPABASE_URL"
echo "VITE_SUPABASE_PUBLISHABLE_KEY: $VITE_SUPABASE_PUBLISHABLE_KEY"
```

---

## 🔍 2. VÉRIFICATIONS TECHNIQUES

### TypeScript
```bash
# Vérifier les erreurs TypeScript
npx tsc --noEmit

# Vérifier avec plus de détails
npx tsc --noEmit --strict
```

### ESLint
```bash
# Vérifier les erreurs de linting
npx eslint "src/**/*.{ts,tsx,js,jsx}" --max-warnings=0

# Corriger automatiquement les erreurs corrigeables
npx eslint "src/**/*.{ts,tsx,js,jsx}" --fix
```

### Tests Unitaires
```bash
# Exécuter tous les tests
npm test

# Exécuter les tests avec couverture
npm run test:coverage

# Exécuter les tests en mode watch
npm run test:watch
```

---

## 🏗️ 3. BUILD ET ANALYSE

### Build de Production
```bash
# Build standard
npm run build

# Build avec analyse
npm run build:analyze

# Build en mode développement
npm run build:dev
```

### Analyse du Bundle
```bash
# Analyser la taille des chunks
ls -la dist/assets/*.js | sort -k5 -nr

# Analyser avec source-map-explorer (si installé)
npx source-map-explorer dist/assets/*.js

# Analyser avec webpack-bundle-analyzer (si installé)
npx webpack-bundle-analyzer dist/assets/*.js
```

### Preview du Build
```bash
# Démarrer le serveur de preview
npm run preview

# Dans un autre terminal, tester l'application
curl http://localhost:4173
```

---

## 🚀 4. TESTS DE PERFORMANCE

### Lighthouse (après npm run preview)
```bash
# Installer Lighthouse si pas déjà fait
npm install -g lighthouse

# Audit Lighthouse mobile
npx lighthouse http://localhost:4173 --output json --output html --emulated-form-factor=mobile --output-path=./reports/lighthouse/mobile-report

# Audit Lighthouse desktop
npx lighthouse http://localhost:4173 --output json --output html --emulated-form-factor=desktop --output-path=./reports/lighthouse/desktop-report

# Audit Lighthouse avec toutes les catégories
npx lighthouse http://localhost:4173 --output json --output html --only-categories=performance,accessibility,best-practices,seo --output-path=./reports/lighthouse/full-report
```

### Tests de Charge
```bash
# Installer Artillery si pas déjà fait
npm install -g artillery

# Test de charge simple
artillery quick --count 10 --num 5 http://localhost:4173

# Test de charge avancé (avec fichier de config)
artillery run load-test.yml
```

---

## 🗄️ 5. AUDIT BASE DE DONNÉES

### Supabase CLI
```bash
# Installer Supabase CLI si pas déjà fait
npm install -g supabase

# Se connecter à Supabase
supabase login

# Vérifier la connexion
supabase status

# Appliquer les migrations
supabase db push

# Vérifier les politiques RLS
supabase db diff --schema public

# Exporter le schéma
supabase db dump --schema public > schema-backup.sql
```

### Vérification des Tables
```sql
-- Se connecter à la base de données Supabase
-- Vérifier les tables existantes
SELECT table_name, table_type 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;

-- Vérifier les politiques RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Vérifier les index
SELECT indexname, tablename, indexdef
FROM pg_indexes 
WHERE schemaname = 'public'
ORDER BY tablename, indexname;
```

---

## 🔒 6. AUDIT DE SÉCURITÉ

### Vérification des Headers
```bash
# Vérifier les headers de sécurité
curl -I http://localhost:4173

# Vérifier avec des outils spécialisés
npx security-headers https://payhuk.com

# Vérifier la CSP
npx csp-validator https://payhuk.com
```

### Scan des Secrets
```bash
# Installer TruffleHog si pas déjà fait
npm install -g trufflehog

# Scanner les secrets dans le repo
trufflehog filesystem . --no-verification

# Scanner avec plus de détails
trufflehog filesystem . --only-verified
```

### Audit des Dépendances
```bash
# Audit npm
npm audit

# Audit avec fix automatique
npm audit fix

# Audit avec force
npm audit fix --force

# Vérifier les vulnérabilités avec Snyk
npx snyk test
```

---

## ♿ 7. AUDIT D'ACCESSIBILITÉ

### Tests Automatisés
```bash
# Installer axe-core si pas déjà fait
npm install -g @axe-core/cli

# Test d'accessibilité
axe http://localhost:4173 --save results.json

# Test avec rapport HTML
axe http://localhost:4173 --save results.html --reporter html
```

### Tests Manuels
```bash
# Ouvrir l'application dans le navigateur
open http://localhost:4173

# Tester la navigation au clavier
# - Tab pour naviguer
# - Entrée pour activer
# - Échap pour fermer les modales

# Tester avec un lecteur d'écran
# - VoiceOver sur Mac
# - NVDA sur Windows
# - Orca sur Linux
```

---

## 🌐 8. AUDIT SEO

### Vérification des Meta Tags
```bash
# Vérifier les meta tags
curl -s http://localhost:4173 | grep -i "meta\|title"

# Vérifier avec des outils SEO
npx seo-analyzer http://localhost:4173

# Vérifier le sitemap
curl -s http://localhost:4173/sitemap.xml

# Vérifier robots.txt
curl -s http://localhost:4173/robots.txt
```

### Tests de Performance Web
```bash
# Test avec PageSpeed Insights
npx psi http://localhost:4173

# Test avec WebPageTest
npx webpagetest http://localhost:4173
```

---

## 📊 9. GÉNÉRATION DES RAPPORTS

### Créer les Dossiers de Rapports
```bash
mkdir -p reports/lighthouse reports/bundle reports/security reports/accessibility reports/seo
```

### Générer le Rapport Bundle
```bash
# Analyser le bundle
npm run build
ls -la dist/assets/*.js | sort -k5 -nr > reports/bundle/bundle-analysis.txt

# Générer un rapport détaillé
echo "# Analyse du Bundle Payhuk" > reports/bundle/bundle-report.md
echo "Date: $(date)" >> reports/bundle/bundle-report.md
echo "" >> reports/bundle/bundle-report.md
echo "## Taille des Chunks" >> reports/bundle/bundle-report.md
echo '```' >> reports/bundle/bundle-report.md
ls -la dist/assets/*.js | sort -k5 -nr >> reports/bundle/bundle-report.md
echo '```' >> reports/bundle/bundle-report.md
```

### Générer le Rapport de Sécurité
```bash
# Rapport de sécurité
echo "# Rapport de Sécurité Payhuk" > reports/security/security-report.md
echo "Date: $(date)" >> reports/security/security-report.md
echo "" >> reports/security/security-report.md
echo "## Audit des Dépendances" >> reports/security/security-report.md
echo '```' >> reports/security/security-report.md
npm audit >> reports/security/security-report.md
echo '```' >> reports/security/security-report.md
```

---

## 🧪 10. TESTS E2E

### Cypress
```bash
# Installer Cypress si pas déjà fait
npm install --save-dev cypress

# Ouvrir Cypress
npx cypress open

# Exécuter les tests en mode headless
npx cypress run

# Exécuter avec rapport
npx cypress run --reporter json --reporter-options output=reports/e2e/cypress-results.json
```

### Playwright (Alternative)
```bash
# Installer Playwright si pas déjà fait
npm install --save-dev @playwright/test

# Exécuter les tests
npx playwright test

# Exécuter avec rapport HTML
npx playwright test --reporter=html
```

---

## 📋 11. CHECKLIST DE VÉRIFICATION

### ✅ Vérifications Obligatoires
- [ ] `npm ci` s'exécute sans erreur
- [ ] `npx tsc --noEmit` passe sans erreur
- [ ] `npx eslint` passe sans erreur
- [ ] `npm run build` compile sans erreur
- [ ] `npm run preview` démarre correctement
- [ ] Les tests unitaires passent
- [ ] Les tests e2e passent
- [ ] Lighthouse score > 90 pour Performance
- [ ] Lighthouse score > 95 pour Accessibility
- [ ] Lighthouse score > 90 pour Best Practices
- [ ] Lighthouse score > 85 pour SEO

### ✅ Vérifications de Sécurité
- [ ] `npm audit` ne montre pas de vulnérabilités critiques
- [ ] Les headers de sécurité sont présents
- [ ] Les politiques RLS sont actives
- [ ] Aucun secret dans le code
- [ ] Les variables d'environnement sont sécurisées

### ✅ Vérifications de Performance
- [ ] Bundle initial < 200KB
- [ ] First Contentful Paint < 1.5s
- [ ] Largest Contentful Paint < 2.5s
- [ ] Cumulative Layout Shift < 0.1
- [ ] Time to Interactive < 3s

---

## 🚨 12. DÉPANNAGE

### Problèmes Courants

#### Erreur npm ci
```bash
# Solution 1: Nettoyer le cache
npm cache clean --force
rm -rf node_modules package-lock.json
npm install

# Solution 2: Utiliser npm install
npm install
```

#### Erreur TypeScript
```bash
# Vérifier la configuration
npx tsc --showConfig

# Réinstaller les types
npm install --save-dev @types/react @types/react-dom @types/node
```

#### Erreur ESLint
```bash
# Vérifier la configuration
npx eslint --print-config src/App.tsx

# Réinitialiser la configuration
rm eslint.config.js
npx eslint --init
```

#### Erreur de Build
```bash
# Vérifier les erreurs détaillées
npm run build -- --verbose

# Nettoyer le cache Vite
rm -rf node_modules/.vite
npm run build
```

#### Erreur Supabase
```bash
# Vérifier la connexion
supabase status

# Réinitialiser la connexion
supabase logout
supabase login
```

---

## 📈 13. MÉTRIQUES CIBLES

### Performance
- **Performance Score:** 90+
- **First Contentful Paint:** < 1.5s
- **Largest Contentful Paint:** < 2.5s
- **Cumulative Layout Shift:** < 0.1
- **Time to Interactive:** < 3s

### Accessibilité
- **Accessibility Score:** 95+
- **Contraste des couleurs:** AA+
- **Navigation clavier:** 100%
- **Lecteurs d'écran:** Compatible

### SEO
- **SEO Score:** 90+
- **Meta tags:** Complets
- **Sitemap:** Présent
- **Robots.txt:** Configuré

### Sécurité
- **Vulnérabilités:** 0 critique
- **Headers de sécurité:** Présents
- **Politiques RLS:** Actives
- **Secrets:** Aucun exposé

---

## 🎯 14. COMMANDES RAPIDES

### Audit Complet en Une Commande
```bash
# Script d'audit complet
npm ci && \
npx tsc --noEmit && \
npx eslint "src/**/*.{ts,tsx}" --max-warnings=0 && \
npm run build && \
npm run preview & \
sleep 5 && \
npx lighthouse http://localhost:4173 --output json --output html --emulated-form-factor=mobile && \
npm test && \
echo "Audit complet terminé!"
```

### Vérification Rapide
```bash
# Vérification rapide des problèmes critiques
npm run type-check && \
npm run lint && \
npm run build && \
npm audit --audit-level=moderate
```

---

*Ce document contient toutes les commandes nécessaires pour reproduire l'audit complet de Payhuk. Exécutez-les dans l'ordre pour obtenir les mêmes résultats que l'audit initial.*

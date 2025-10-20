#!/usr/bin/env node

/**
 * Script de vérification de la configuration de déploiement
 * Vérifie que tous les éléments nécessaires sont en place pour le déploiement
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🚀 Vérification de la configuration de déploiement...\n');

let allTestsPassed = true;

// Test 1: Vérifier les fichiers de configuration Vercel
console.log('📋 Test 1: Configuration Vercel');
const vercelConfigPath = path.join(__dirname, '..', 'vercel.json');
if (fs.existsSync(vercelConfigPath)) {
  const content = fs.readFileSync(vercelConfigPath, 'utf8');
  
  const hasRoutes = content.includes('"routes"');
  const hasFilesystem = content.includes('"filesystem"');
  const hasIndexHtml = content.includes('index.html');
  
  if (hasRoutes && hasFilesystem && hasIndexHtml) {
    console.log('✅ Configuration Vercel correcte');
  } else {
    console.log('❌ Configuration Vercel incomplète');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Fichier vercel.json manquant');
  allTestsPassed = false;
}

// Test 2: Vérifier les fichiers de redirection
console.log('\n📋 Test 2: Fichiers de redirection');
const redirectsPath = path.join(__dirname, '..', 'public/_redirects');
if (fs.existsSync(redirectsPath)) {
  const content = fs.readFileSync(redirectsPath, 'utf8');
  
  const hasAssets = content.includes('/assets/');
  const hasIndexHtml = content.includes('index.html');
  const hasSplat = content.includes(':splat');
  
  if (hasAssets && hasIndexHtml && hasSplat) {
    console.log('✅ Fichier _redirects correct');
  } else {
    console.log('❌ Fichier _redirects incomplet');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Fichier _redirects manquant');
  allTestsPassed = false;
}

// Test 3: Vérifier les composants de gestion d'erreur
console.log('\n📋 Test 3: Gestion d\'erreurs');
const configErrorPath = path.join(__dirname, '..', 'src/components/error/ConfigError.tsx');
const configCheckerPath = path.join(__dirname, '..', 'src/components/ConfigChecker.tsx');

if (fs.existsSync(configErrorPath) && fs.existsSync(configCheckerPath)) {
  console.log('✅ Composants de gestion d\'erreur présents');
} else {
  console.log('❌ Composants de gestion d\'erreur manquants');
  allTestsPassed = false;
}

// Test 4: Vérifier l'intégration dans App.tsx
console.log('\n📋 Test 4: Intégration dans App.tsx');
const appPath = path.join(__dirname, '..', 'src/App.tsx');
if (fs.existsSync(appPath)) {
  const content = fs.readFileSync(appPath, 'utf8');
  
  const hasConfigChecker = content.includes('ConfigChecker');
  const hasImport = content.includes('import { ConfigChecker }');
  const hasWrapper = content.includes('<ConfigChecker>');
  
  if (hasConfigChecker && hasImport && hasWrapper) {
    console.log('✅ ConfigChecker intégré dans App.tsx');
  } else {
    console.log('❌ ConfigChecker non intégré dans App.tsx');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Fichier App.tsx manquant');
  allTestsPassed = false;
}

// Test 5: Vérifier le validateur d'environnement
console.log('\n📋 Test 5: Validateur d\'environnement');
const envValidatorPath = path.join(__dirname, '..', 'src/lib/env-validator.ts');
if (fs.existsSync(envValidatorPath)) {
  const content = fs.readFileSync(envValidatorPath, 'utf8');
  
  const hasFallback = content.includes('configuration de fallback');
  const hasProdCheck = content.includes('import.meta.env.PROD');
  const hasTryCatch = content.includes('try {') && content.includes('} catch');
  
  if (hasFallback && hasProdCheck && hasTryCatch) {
    console.log('✅ Validateur d\'environnement avec fallback');
  } else {
    console.log('❌ Validateur d\'environnement sans fallback');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Validateur d\'environnement manquant');
  allTestsPassed = false;
}

// Test 6: Vérifier le build
console.log('\n📋 Test 6: Vérification du build');
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  const distFiles = fs.readdirSync(distPath);
  const hasIndexHtml = distFiles.includes('index.html');
  const hasAssets = distFiles.includes('assets');
  const hasRedirects = distFiles.includes('_redirects');
  
  if (hasIndexHtml && hasAssets && hasRedirects) {
    console.log('✅ Build complet avec tous les fichiers');
  } else {
    console.log('❌ Build incomplet');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Dossier dist manquant');
  allTestsPassed = false;
}

// Résumé
console.log('\n' + '='.repeat(60));
if (allTestsPassed) {
  console.log('🎉 TOUS LES TESTS SONT PASSÉS !');
  console.log('✅ Configuration de déploiement prête :');
  console.log('   - Configuration Vercel correcte');
  console.log('   - Fichiers de redirection présents');
  console.log('   - Gestion d\'erreurs implémentée');
  console.log('   - Validateur d\'environnement avec fallback');
  console.log('   - Build complet et fonctionnel');
} else {
  console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
  console.log('   Veuillez vérifier les erreurs ci-dessus');
}
console.log('='.repeat(60));

// Instructions pour Vercel
console.log('\n💡 Instructions pour configurer Vercel :');
console.log('1. Allez dans les paramètres de votre projet Vercel');
console.log('2. Ajoutez les variables d\'environnement suivantes :');
console.log('   - VITE_SUPABASE_URL=https://your-project.supabase.co');
console.log('   - VITE_SUPABASE_PUBLISHABLE_KEY=your-anon-key');
console.log('   - VITE_APP_ENV=production');
console.log('3. Redéployez l\'application');
console.log('4. Vérifiez que l\'application s\'affiche correctement');

process.exit(allTestsPassed ? 0 : 1);

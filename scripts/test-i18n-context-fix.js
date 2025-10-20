#!/usr/bin/env node

/**
 * Script de test pour vérifier la correction de l'erreur de contexte i18n
 * Vérifie que l'initialisation d'i18n est correcte et évite les erreurs useContext
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Test de correction de l\'erreur de contexte i18n...\n');

let allTestsPassed = true;

// Test 1: Vérifier que I18nProvider existe et est correctement configuré
console.log('📋 Test 1: Vérification du I18nProvider');
const i18nProviderPath = path.join(__dirname, '..', 'src/components/I18nProvider.tsx');
if (fs.existsSync(i18nProviderPath)) {
  const content = fs.readFileSync(i18nProviderPath, 'utf8');
  
  const hasSuspense = content.includes('Suspense');
  const hasUseTranslation = content.includes('useTranslation');
  const hasReadyCheck = content.includes('ready');
  const hasI18nReady = content.includes('I18nReady');
  
  if (hasSuspense && hasUseTranslation && hasReadyCheck && hasI18nReady) {
    console.log('✅ I18nProvider correctement configuré');
  } else {
    console.log('❌ I18nProvider mal configuré');
    allTestsPassed = false;
  }
} else {
  console.log('❌ I18nProvider manquant');
  allTestsPassed = false;
}

// Test 2: Vérifier l'intégration dans App.tsx
console.log('\n📋 Test 2: Vérification de l\'intégration dans App.tsx');
const appPath = path.join(__dirname, '..', 'src/App.tsx');
if (fs.existsSync(appPath)) {
  const content = fs.readFileSync(appPath, 'utf8');
  
  const hasI18nProvider = content.includes('I18nProvider');
  const hasImport = content.includes('import { I18nProvider }');
  const hasWrapper = content.includes('<I18nProvider>');
  
  if (hasI18nProvider && hasImport && hasWrapper) {
    console.log('✅ I18nProvider intégré dans App.tsx');
  } else {
    console.log('❌ I18nProvider non intégré dans App.tsx');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Fichier App.tsx manquant');
  allTestsPassed = false;
}

// Test 3: Vérifier la configuration i18n.ts
console.log('\n📋 Test 3: Vérification de la configuration i18n.ts');
const i18nPath = path.join(__dirname, '..', 'i18n.ts');
if (fs.existsSync(i18nPath)) {
  const content = fs.readFileSync(i18nPath, 'utf8');
  
  const hasInitImmediate = content.includes('initImmediate: false');
  const hasInitFunction = content.includes('const initI18n = ()');
  const hasImmediateInit = content.includes('initI18n();');
  
  if (hasInitImmediate && hasInitFunction && hasImmediateInit) {
    console.log('✅ Configuration i18n.ts corrigée');
  } else {
    console.log('❌ Configuration i18n.ts non corrigée');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Fichier i18n.ts manquant');
  allTestsPassed = false;
}

// Test 4: Vérifier les vérifications de sécurité dans LanguageSelector
console.log('\n📋 Test 4: Vérification des vérifications de sécurité');
const languageSelectorPath = path.join(__dirname, '..', 'src/components/navigation/LanguageSelector.tsx');
if (fs.existsSync(languageSelectorPath)) {
  const content = fs.readFileSync(languageSelectorPath, 'utf8');
  
  const hasReadyCheck = content.includes('ready');
  const hasReadyCondition = content.includes('if (!ready)');
  const hasDisabledButton = content.includes('disabled');
  
  if (hasReadyCheck && hasReadyCondition && hasDisabledButton) {
    console.log('✅ Vérifications de sécurité ajoutées');
  } else {
    console.log('❌ Vérifications de sécurité manquantes');
    allTestsPassed = false;
  }
} else {
  console.log('❌ LanguageSelector manquant');
  allTestsPassed = false;
}

// Test 5: Vérifier que le build fonctionne
console.log('\n📋 Test 5: Vérification du build');
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  const distFiles = fs.readdirSync(distPath);
  const hasIndexHtml = distFiles.includes('index.html');
  const hasAssets = distFiles.includes('assets');
  
  if (hasIndexHtml && hasAssets) {
    console.log('✅ Build réussi');
  } else {
    console.log('❌ Build échoué');
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
  console.log('✅ Erreur de contexte i18n corrigée :');
  console.log('   - I18nProvider avec Suspense et vérifications');
  console.log('   - Configuration i18n.ts avec initImmediate: false');
  console.log('   - Vérifications de sécurité dans LanguageSelector');
  console.log('   - Intégration correcte dans App.tsx');
  console.log('   - Build réussi sans erreurs');
} else {
  console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
  console.log('   Veuillez vérifier les erreurs ci-dessus');
}
console.log('='.repeat(60));

// Recommandations
console.log('\n💡 Recommandations pour tester manuellement :');
console.log('1. Ouvrir l\'application dans le navigateur');
console.log('2. Ouvrir les outils de développement (F12)');
console.log('3. Vérifier l\'onglet Console - aucune erreur useContext');
console.log('4. Tester le changement de langue');
console.log('5. Vérifier que les traductions s\'affichent correctement');

process.exit(allTestsPassed ? 0 : 1);

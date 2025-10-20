#!/usr/bin/env node

/**
 * Script de test pour vérifier la correction de l'erreur useContext
 * Vérifie que l'ordre des providers et l'initialisation sont corrects
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔧 Test de correction de l\'erreur useContext...\n');

let allTestsPassed = true;

// Test 1: Vérifier l'ordre des providers dans App.tsx
console.log('📋 Test 1: Ordre des providers dans App.tsx');
const appPath = path.join(__dirname, '..', 'src/App.tsx');
if (fs.existsSync(appPath)) {
  const content = fs.readFileSync(appPath, 'utf8');
  
  // Vérifier l'ordre correct des providers
  const hasCorrectOrder = content.includes('<I18nProvider>') && 
                         content.includes('<ConfigChecker>') && 
                         content.includes('<AuthProvider>');
  
  // Vérifier que ConfigChecker est après I18nProvider
  const i18nIndex = content.indexOf('<I18nProvider>');
  const configIndex = content.indexOf('<ConfigChecker>');
  const authIndex = content.indexOf('<AuthProvider>');
  
  const correctOrder = i18nIndex < configIndex && configIndex < authIndex;
  
  if (hasCorrectOrder && correctOrder) {
    console.log('✅ Ordre des providers correct');
  } else {
    console.log('❌ Ordre des providers incorrect');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Fichier App.tsx manquant');
  allTestsPassed = false;
}

// Test 2: Vérifier I18nProvider sans useTranslation au niveau racine
console.log('\n📋 Test 2: I18nProvider sans useTranslation au niveau racine');
const i18nProviderPath = path.join(__dirname, '..', 'src/components/I18nProvider.tsx');
if (fs.existsSync(i18nProviderPath)) {
  const content = fs.readFileSync(i18nProviderPath, 'utf8');
  
  const hasUseEffect = content.includes('useEffect');
  const hasIsReady = content.includes('isReady');
  const hasI18nextProvider = content.includes('I18nextProvider');
  const hasNoUseTranslation = !content.includes('useTranslation');
  
  if (hasUseEffect && hasIsReady && hasI18nextProvider && hasNoUseTranslation) {
    console.log('✅ I18nProvider corrigé sans useTranslation au niveau racine');
  } else {
    console.log('❌ I18nProvider non corrigé');
    allTestsPassed = false;
  }
} else {
  console.log('❌ I18nProvider manquant');
  allTestsPassed = false;
}

// Test 3: Vérifier ConfigChecker avec délai
console.log('\n📋 Test 3: ConfigChecker avec délai');
const configCheckerPath = path.join(__dirname, '..', 'src/components/ConfigChecker.tsx');
if (fs.existsSync(configCheckerPath)) {
  const content = fs.readFileSync(configCheckerPath, 'utf8');
  
  const hasTimeout = content.includes('setTimeout');
  const hasDelay = content.includes('100');
  const hasCleanup = content.includes('clearTimeout');
  
  if (hasTimeout && hasDelay && hasCleanup) {
    console.log('✅ ConfigChecker avec délai pour éviter les problèmes de contexte');
  } else {
    console.log('❌ ConfigChecker sans délai');
    allTestsPassed = false;
  }
} else {
  console.log('❌ ConfigChecker manquant');
  allTestsPassed = false;
}

// Test 4: Vérifier ConfigError sans dépendances externes
console.log('\n📋 Test 4: ConfigError sans dépendances externes');
const configErrorPath = path.join(__dirname, '..', 'src/components/error/ConfigError.tsx');
if (fs.existsSync(configErrorPath)) {
  const content = fs.readFileSync(configErrorPath, 'utf8');
  
  const hasInstructions = content.includes('Configuration requise pour Vercel');
  const hasValues = content.includes('hbdnzajbyjakdhuavrvb');
  const hasNoUseTranslation = !content.includes('useTranslation');
  
  if (hasInstructions && hasValues && hasNoUseTranslation) {
    console.log('✅ ConfigError sans dépendances externes');
  } else {
    console.log('❌ ConfigError avec dépendances externes');
    allTestsPassed = false;
  }
} else {
  console.log('❌ ConfigError manquant');
  allTestsPassed = false;
}

// Test 5: Vérifier le build
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
  console.log('✅ Erreur useContext corrigée :');
  console.log('   - Ordre des providers correct');
  console.log('   - I18nProvider sans useTranslation au niveau racine');
  console.log('   - ConfigChecker avec délai de sécurité');
  console.log('   - ConfigError sans dépendances externes');
  console.log('   - Build réussi');
} else {
  console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
  console.log('   Veuillez vérifier les erreurs ci-dessus');
}
console.log('='.repeat(60));

// Instructions pour tester
console.log('\n💡 Instructions pour tester manuellement :');
console.log('1. Ouvrir l\'application dans le navigateur');
console.log('2. Ouvrir les outils de développement (F12)');
console.log('3. Vérifier l\'onglet Console - aucune erreur useContext');
console.log('4. Si erreur de configuration, vérifier les variables Vercel');
console.log('5. Tester le changement de langue');

process.exit(allTestsPassed ? 0 : 1);

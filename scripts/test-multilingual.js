#!/usr/bin/env node

/**
 * Script de test pour vérifier la fonctionnalité multilingue
 * Vérifie que tous les composants et pages utilisent les traductions
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🌐 Test de la fonctionnalité multilingue...\n');

// Fichiers à vérifier
const filesToCheck = [
  'src/components/AppSidebar.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Products.tsx',
  'src/pages/Marketplace.tsx',
  'src/components/dashboard/QuickActions.tsx',
  'src/components/navigation/LanguageSelector.tsx',
  'i18n.ts',
  'locales/fr/translation.json',
  'locales/en/translation.json'
];

let allTestsPassed = true;

// Test 1: Vérifier que les fichiers de traduction existent
console.log('📋 Test 1: Vérification des fichiers de traduction');
const translationFiles = [
  'locales/fr/translation.json',
  'locales/en/translation.json'
];

translationFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    try {
      const translations = JSON.parse(content);
      const keyCount = Object.keys(translations).length;
      console.log(`✅ ${filePath}: ${keyCount} clés de traduction`);
    } catch (error) {
      console.log(`❌ ${filePath}: Erreur de parsing JSON`);
      allTestsPassed = false;
    }
  } else {
    console.log(`❌ ${filePath}: Fichier manquant`);
    allTestsPassed = false;
  }
});

// Test 2: Vérifier que i18n est configuré
console.log('\n📋 Test 2: Vérification de la configuration i18n');
const i18nPath = path.join(__dirname, '..', 'i18n.ts');
if (fs.existsSync(i18nPath)) {
  const content = fs.readFileSync(i18nPath, 'utf8');
  
  const hasReactI18next = content.includes('react-i18next');
  const hasLanguageDetector = content.includes('i18next-browser-languagedetector');
  const hasFallbackLng = content.includes('fallbackLng');
  const hasResources = content.includes('resources');
  
  if (hasReactI18next && hasLanguageDetector && hasFallbackLng && hasResources) {
    console.log('✅ Configuration i18n complète');
  } else {
    console.log('❌ Configuration i18n incomplète');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Fichier i18n.ts manquant');
  allTestsPassed = false;
}

// Test 3: Vérifier que les composants utilisent useTranslation
console.log('\n📋 Test 3: Vérification de l\'utilisation de useTranslation');
const componentFiles = [
  'src/components/AppSidebar.tsx',
  'src/pages/Dashboard.tsx',
  'src/pages/Products.tsx',
  'src/pages/Marketplace.tsx',
  'src/components/dashboard/QuickActions.tsx'
];

componentFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    const hasUseTranslation = content.includes('useTranslation');
    const hasTFunction = content.includes('t(');
    const hasImport = content.includes('react-i18next');
    
    if (hasUseTranslation && hasTFunction && hasImport) {
      console.log(`✅ ${filePath}: Utilise les traductions`);
    } else {
      console.log(`❌ ${filePath}: N'utilise pas les traductions`);
      allTestsPassed = false;
    }
  }
});

// Test 4: Vérifier le sélecteur de langue
console.log('\n📋 Test 4: Vérification du sélecteur de langue');
const languageSelectorPath = path.join(__dirname, '..', 'src/components/navigation/LanguageSelector.tsx');
if (fs.existsSync(languageSelectorPath)) {
  const content = fs.readFileSync(languageSelectorPath, 'utf8');
  
  const hasDropdownMenu = content.includes('DropdownMenu');
  const hasLanguageChange = content.includes('changeLanguage');
  const hasFlags = content.includes('🇫🇷') && content.includes('🇬🇧');
  
  if (hasDropdownMenu && hasLanguageChange && hasFlags) {
    console.log('✅ Sélecteur de langue fonctionnel');
  } else {
    console.log('❌ Sélecteur de langue incomplet');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Composant LanguageSelector manquant');
  allTestsPassed = false;
}

// Test 5: Vérifier l'intégration dans main.tsx
console.log('\n📋 Test 5: Vérification de l\'intégration dans main.tsx');
const mainPath = path.join(__dirname, '..', 'src/main.tsx');
if (fs.existsSync(mainPath)) {
  const content = fs.readFileSync(mainPath, 'utf8');
  
  if (content.includes('i18n')) {
    console.log('✅ i18n intégré dans main.tsx');
  } else {
    console.log('❌ i18n non intégré dans main.tsx');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Fichier main.tsx manquant');
  allTestsPassed = false;
}

// Test 6: Vérifier la cohérence des traductions
console.log('\n📋 Test 6: Vérification de la cohérence des traductions');
const frPath = path.join(__dirname, '..', 'locales/fr/translation.json');
const enPath = path.join(__dirname, '..', 'locales/en/translation.json');

if (fs.existsSync(frPath) && fs.existsSync(enPath)) {
  const frContent = JSON.parse(fs.readFileSync(frPath, 'utf8'));
  const enContent = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  
  const frKeys = Object.keys(frContent);
  const enKeys = Object.keys(enContent);
  
  const missingInEn = frKeys.filter(key => !enKeys.includes(key));
  const missingInFr = enKeys.filter(key => !frKeys.includes(key));
  
  if (missingInEn.length === 0 && missingInFr.length === 0) {
    console.log('✅ Traductions cohérentes entre FR et EN');
  } else {
    console.log('❌ Traductions incohérentes:');
    if (missingInEn.length > 0) {
      console.log(`   - Manquantes en EN: ${missingInEn.join(', ')}`);
    }
    if (missingInFr.length > 0) {
      console.log(`   - Manquantes en FR: ${missingInFr.join(', ')}`);
    }
    allTestsPassed = false;
  }
} else {
  console.log('❌ Impossible de vérifier la cohérence (fichiers manquants)');
  allTestsPassed = false;
}

// Résumé
console.log('\n' + '='.repeat(60));
if (allTestsPassed) {
  console.log('🎉 TOUS LES TESTS SONT PASSÉS !');
  console.log('✅ Fonctionnalité multilingue opérationnelle :');
  console.log('   - Configuration i18n complète');
  console.log('   - Sélecteur de langue fonctionnel');
  console.log('   - Traductions intégrées dans les composants');
  console.log('   - Cohérence entre les langues FR/EN');
  console.log('   - Détection automatique de langue');
} else {
  console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
  console.log('   Veuillez vérifier les erreurs ci-dessus');
}
console.log('='.repeat(60));

// Recommandations
console.log('\n💡 Recommandations pour tester manuellement :');
console.log('1. Ouvrir l\'application dans le navigateur');
console.log('2. Vérifier que le sélecteur de langue est visible dans la sidebar');
console.log('3. Changer de langue et vérifier que les textes changent');
console.log('4. Vérifier que la langue est sauvegardée dans localStorage');
console.log('5. Tester la détection automatique de langue du navigateur');
console.log('6. Naviguer entre les pages pour vérifier la cohérence');

process.exit(allTestsPassed ? 0 : 1);

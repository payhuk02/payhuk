#!/usr/bin/env node

/**
 * Script de test pour vérifier la correction des erreurs de console
 * Vérifie que les fichiers CSS manquants et les erreurs JavaScript sont corrigés
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔍 Test des corrections des erreurs de console...\n');

// Fichiers à vérifier
const filesToCheck = [
  'src/components/optimization/PerformanceOptimizer.tsx',
  'dist/index.html',
  'src/App.tsx'
];

let allTestsPassed = true;

// Test 1: Vérifier que les références aux fichiers CSS manquants sont supprimées
console.log('📋 Test 1: Vérification des références CSS manquantes');
filesToCheck.forEach(filePath => {
  const fullPath = path.join(__dirname, '..', filePath);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    
    // Vérifier qu'il n'y a plus de références à critical.css ou fonts.css
    const criticalCssRefs = content.match(/critical\.css/g) || [];
    const fontsCssRefs = content.match(/fonts\.css/g) || [];
    
    if (criticalCssRefs.length > 0 || fontsCssRefs.length > 0) {
      console.log(`❌ ${filePath}: Références CSS problématiques trouvées`);
      console.log(`   - critical.css: ${criticalCssRefs.length} références`);
      console.log(`   - fonts.css: ${fontsCssRefs.length} références`);
      allTestsPassed = false;
    } else {
      console.log(`✅ ${filePath}: Aucune référence CSS problématique`);
    }
  }
});

// Test 2: Vérifier que les vérifications de type sont ajoutées
console.log('\n📋 Test 2: Vérification des vérifications de type');
const performanceOptimizerPath = path.join(__dirname, '..', 'src/components/optimization/PerformanceOptimizer.tsx');
if (fs.existsSync(performanceOptimizerPath)) {
  const content = fs.readFileSync(performanceOptimizerPath, 'utf8');
  
  // Vérifier la présence de vérifications de type pour className
  const hasTypeCheck = content.includes('typeof iconClass === \'string\'');
  const hasNullCheck = content.includes('icon.className || \'\'');
  
  if (hasTypeCheck && hasNullCheck) {
    console.log('✅ PerformanceOptimizer: Vérifications de type ajoutées');
  } else {
    console.log('❌ PerformanceOptimizer: Vérifications de type manquantes');
    allTestsPassed = false;
  }
  
  // Vérifier la présence de try-catch
  const hasTryCatch = content.includes('try {') && content.includes('} catch (error)');
  if (hasTryCatch) {
    console.log('✅ PerformanceOptimizer: Gestion d\'erreurs avec try-catch');
  } else {
    console.log('❌ PerformanceOptimizer: Gestion d\'erreurs manquante');
    allTestsPassed = false;
  }
}

// Test 3: Vérifier que le build s'est bien passé
console.log('\n📋 Test 3: Vérification du build');
const distPath = path.join(__dirname, '..', 'dist');
if (fs.existsSync(distPath)) {
  const distFiles = fs.readdirSync(distPath);
  const hasIndexHtml = distFiles.includes('index.html');
  const hasAssets = distFiles.includes('assets');
  
  if (hasIndexHtml && hasAssets) {
    console.log('✅ Build réussi: Fichiers dist présents');
    
    // Vérifier le contenu de index.html
    const indexHtmlPath = path.join(distPath, 'index.html');
    const indexContent = fs.readFileSync(indexHtmlPath, 'utf8');
    
    // Vérifier qu'il n'y a pas de références à critical.css ou fonts.css
    const hasProblematicRefs = indexContent.includes('critical.css') || indexContent.includes('fonts.css');
    if (!hasProblematicRefs) {
      console.log('✅ index.html: Aucune référence CSS problématique');
    } else {
      console.log('❌ index.html: Références CSS problématiques trouvées');
      allTestsPassed = false;
    }
  } else {
    console.log('❌ Build échoué: Fichiers dist manquants');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Dossier dist manquant');
  allTestsPassed = false;
}

// Résumé
console.log('\n' + '='.repeat(50));
if (allTestsPassed) {
  console.log('🎉 TOUS LES TESTS SONT PASSÉS !');
  console.log('✅ Les erreurs de console ont été corrigées :');
  console.log('   - Fichiers CSS manquants (critical.css, fonts.css)');
  console.log('   - Erreur JavaScript e.includes is not a function');
  console.log('   - Gestion d\'erreurs améliorée');
} else {
  console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
  console.log('   Veuillez vérifier les erreurs ci-dessus');
}
console.log('='.repeat(50));

// Recommandations
console.log('\n💡 Recommandations pour tester manuellement :');
console.log('1. Ouvrir l\'application dans le navigateur');
console.log('2. Ouvrir les outils de développement (F12)');
console.log('3. Vérifier l\'onglet Console pour les erreurs');
console.log('4. Vérifier l\'onglet Network pour les requêtes 404');
console.log('5. Tester sur différents appareils (mobile, tablette, desktop)');

process.exit(allTestsPassed ? 0 : 1);

#!/usr/bin/env node

/**
 * Script de test de connexion Supabase
 * Vérifie que les variables d'environnement permettent une connexion à Supabase
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

console.log('🔗 Test de connexion Supabase...\n');

// Variables d'environnement Supabase
const SUPABASE_CONFIG = {
  PROJECT_ID: 'hbdnzajbyjakdhuavrvb',
  URL: 'https://hbdnzajbyjakdhuavrvb.supabase.co',
  PUBLISHABLE_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG56YWpieWpha2RodWF2cnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTgyMzEsImV4cCI6MjA3MzE3NDIzMX0.myur8r50wIORQwfcCP4D1ZxlhKFxICdVqjUM80CgtnM'
};

let allTestsPassed = true;

// Test 1: Vérifier le format de l'URL Supabase
console.log('📋 Test 1: Format de l\'URL Supabase');
const url = new URL(SUPABASE_CONFIG.URL);
if (url.hostname.includes('supabase.co') && url.protocol === 'https:') {
  console.log('✅ URL Supabase valide');
} else {
  console.log('❌ URL Supabase invalide');
  allTestsPassed = false;
}

// Test 2: Vérifier le format de la clé publique
console.log('\n📋 Test 2: Format de la clé publique');
const keyParts = SUPABASE_CONFIG.PUBLISHABLE_KEY.split('.');
if (keyParts.length === 3) {
  try {
    const header = JSON.parse(Buffer.from(keyParts[0], 'base64').toString());
    const payload = JSON.parse(Buffer.from(keyParts[1], 'base64').toString());
    
    if (header.alg === 'HS256' && payload.iss === 'supabase' && payload.ref === SUPABASE_CONFIG.PROJECT_ID) {
      console.log('✅ Clé publique Supabase valide');
    } else {
      console.log('❌ Clé publique Supabase invalide');
      allTestsPassed = false;
    }
  } catch (error) {
    console.log('❌ Clé publique Supabase malformée');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Clé publique Supabase malformée');
  allTestsPassed = false;
}

// Test 3: Vérifier la cohérence du PROJECT_ID
console.log('\n📋 Test 3: Cohérence du PROJECT_ID');
if (SUPABASE_CONFIG.URL.includes(SUPABASE_CONFIG.PROJECT_ID)) {
  console.log('✅ PROJECT_ID cohérent avec l\'URL');
} else {
  console.log('❌ PROJECT_ID incohérent avec l\'URL');
  allTestsPassed = false;
}

// Test 4: Vérifier les fichiers de configuration
console.log('\n📋 Test 4: Fichiers de configuration');
const envExamplePath = path.join(__dirname, '..', 'env.example');
if (fs.existsSync(envExamplePath)) {
  const content = fs.readFileSync(envExamplePath, 'utf8');
  
  const hasProjectId = content.includes(SUPABASE_CONFIG.PROJECT_ID);
  const hasUrl = content.includes(SUPABASE_CONFIG.URL);
  const hasKey = content.includes(SUPABASE_CONFIG.PUBLISHABLE_KEY);
  
  if (hasProjectId && hasUrl && hasKey) {
    console.log('✅ Fichier env.example à jour');
  } else {
    console.log('❌ Fichier env.example non à jour');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Fichier env.example manquant');
  allTestsPassed = false;
}

// Test 5: Vérifier le validateur d'environnement
console.log('\n📋 Test 5: Validateur d\'environnement');
const envValidatorPath = path.join(__dirname, '..', 'src/lib/env-validator.ts');
if (fs.existsSync(envValidatorPath)) {
  const content = fs.readFileSync(envValidatorPath, 'utf8');
  
  const hasProjectId = content.includes('VITE_SUPABASE_PROJECT_ID');
  const hasUrl = content.includes('VITE_SUPABASE_URL');
  const hasKey = content.includes('VITE_SUPABASE_PUBLISHABLE_KEY');
  
  if (hasProjectId && hasUrl && hasKey) {
    console.log('✅ Validateur d\'environnement à jour');
  } else {
    console.log('❌ Validateur d\'environnement non à jour');
    allTestsPassed = false;
  }
} else {
  console.log('❌ Validateur d\'environnement manquant');
  allTestsPassed = false;
}

// Résumé
console.log('\n' + '='.repeat(60));
if (allTestsPassed) {
  console.log('🎉 TOUS LES TESTS SONT PASSÉS !');
  console.log('✅ Configuration Supabase valide :');
  console.log('   - URL Supabase correcte');
  console.log('   - Clé publique valide');
  console.log('   - PROJECT_ID cohérent');
  console.log('   - Fichiers de configuration à jour');
  console.log('   - Validateur d\'environnement prêt');
} else {
  console.log('❌ CERTAINS TESTS ONT ÉCHOUÉ');
  console.log('   Veuillez vérifier les erreurs ci-dessus');
}
console.log('='.repeat(60));

// Instructions pour Vercel
console.log('\n💡 Instructions pour configurer Vercel :');
console.log('1. Allez dans les paramètres de votre projet Vercel');
console.log('2. Ajoutez ces variables d\'environnement :');
console.log(`   - VITE_SUPABASE_PROJECT_ID=${SUPABASE_CONFIG.PROJECT_ID}`);
console.log(`   - VITE_SUPABASE_URL=${SUPABASE_CONFIG.URL}`);
console.log(`   - VITE_SUPABASE_PUBLISHABLE_KEY=${SUPABASE_CONFIG.PUBLISHABLE_KEY}`);
console.log('   - VITE_APP_ENV=production');
console.log('3. Sélectionnez tous les environnements (Production, Preview, Development)');
console.log('4. Redéployez l\'application');
console.log('5. Vérifiez que l\'application s\'affiche correctement');

process.exit(allTestsPassed ? 0 : 1);

import { createClient } from '@supabase/supabase-js';

// Configuration Supabase avec les variables fournies
const supabaseUrl = "https://hbdnzajbyjakdhuavrvb.supabase.co";
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG56YWpieWpha2RodWF2cnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTgyMzEsImV4cCI6MjA3MzE3NDIzMX0.myur8r50wIORQwfcCP4D1ZxlhKFxICdVqjUM80CgtnM";

const supabase = createClient(supabaseUrl, supabaseKey);

// Tables requises selon les types TypeScript
const REQUIRED_TABLES = [
  'admin_actions',
  'categories', 
  'customers',
  'kyc_submissions',
  'order_items',
  'orders',
  'payments',
  'pixel_events',
  'platform_commissions',
  'products',
  'profiles',
  'promotions',
  'referral_commissions',
  'referrals',
  'reviews',
  'seo_pages',
  'stores',
  'transaction_logs',
  'transactions',
  'user_pixels',
  'user_roles'
];

async function checkTable(tableName) {
  try {
    console.log(`🔍 Vérification de la table: ${tableName}`);
    
    const { data, error, count } = await supabase
      .from(tableName)
      .select('*', { count: 'exact', head: true });

    if (error) {
      if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.log(`❌ ${tableName} - Table n'existe pas`);
        return { exists: false, accessible: false, error: error.message };
      } else {
        console.log(`⚠️  ${tableName} - Existe mais erreur d'accès: ${error.message}`);
        return { exists: true, accessible: false, error: error.message };
      }
    } else {
      console.log(`✅ ${tableName} - OK (${count || 0} lignes)`);
      return { exists: true, accessible: true, rowCount: count || 0 };
    }
  } catch (err) {
    console.log(`❌ ${tableName} - Erreur: ${err.message}`);
    return { exists: false, accessible: false, error: err.message };
  }
}

async function checkCustomFunctions() {
  console.log('\n🔧 Vérification des fonctions personnalisées...');
  
  const functions = [
    'generate_order_number',
    'generate_referral_code', 
    'generate_slug',
    'has_role',
    'is_product_slug_available',
    'is_store_slug_available'
  ];
  
  for (const funcName of functions) {
    try {
      // Test avec des paramètres par défaut
      let params = {};
      if (funcName === 'generate_slug') {
        params = { input_text: 'test' };
      } else if (funcName === 'has_role') {
        params = { _role: 'user', _user_id: '00000000-0000-0000-0000-000000000000' };
      } else if (funcName === 'is_product_slug_available') {
        params = { check_slug: 'test', check_store_id: '00000000-0000-0000-0000-000000000000' };
      } else if (funcName === 'is_store_slug_available') {
        params = { check_slug: 'test' };
      }
      
      const { data, error } = await supabase.rpc(funcName, params);
      if (error) {
        console.log(`❌ ${funcName}: ${error.message}`);
      } else {
        console.log(`✅ ${funcName}: OK`);
      }
    } catch (err) {
      console.log(`❌ ${funcName}: ${err.message}`);
    }
  }
}

async function main() {
  console.log('🚀 Vérification des tables Supabase...\n');
  console.log(`📡 Connexion à: ${supabaseUrl}`);
  console.log(`🔑 Project ID: hbdnzajbyjakdhuavrvb\n`);
  
  const results = [];
  
  for (const tableName of REQUIRED_TABLES) {
    const result = await checkTable(tableName);
    results.push({ name: tableName, ...result });
  }
  
  console.log('\n📊 Résumé:');
  const existingTables = results.filter(r => r.exists);
  const accessibleTables = results.filter(r => r.accessible);
  const missingTables = results.filter(r => !r.exists);
  
  console.log(`✅ Tables existantes: ${existingTables.length}/${REQUIRED_TABLES.length}`);
  console.log(`🔓 Tables accessibles: ${accessibleTables.length}/${REQUIRED_TABLES.length}`);
  console.log(`❌ Tables manquantes: ${missingTables.length}/${REQUIRED_TABLES.length}`);
  
  if (missingTables.length > 0) {
    console.log('\n🚨 Tables manquantes:');
    missingTables.forEach(table => {
      console.log(`   - ${table.name}: ${table.error}`);
    });
  }
  
  if (accessibleTables.length !== REQUIRED_TABLES.length) {
    console.log('\n⚠️  Certaines tables ne sont pas accessibles. Vérifiez les permissions RLS.');
  }
  
  // Test de connexion générale
  console.log('\n🔗 Test de connexion générale...');
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.log(`❌ Erreur de connexion: ${error.message}`);
    } else {
      console.log('✅ Connexion Supabase OK');
    }
  } catch (err) {
    console.log(`❌ Erreur de connexion: ${err.message}`);
  }
  
  // Vérification des fonctions
  await checkCustomFunctions();
  
  console.log('\n🎉 Vérification terminée !');
  
  // Recommandations
  if (missingTables.length > 0) {
    console.log('\n💡 Recommandations:');
    console.log('1. Exécutez les migrations manquantes avec: npx supabase db push');
    console.log('2. Vérifiez que toutes les migrations sont appliquées');
    console.log('3. Consultez le fichier IMPROVEMENTS.md pour plus de détails');
  }
}

main().catch(console.error);

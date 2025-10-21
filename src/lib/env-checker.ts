// Script de vérification des variables d'environnement
// À ajouter temporairement dans votre application pour vérifier Vercel

export const checkEnvironmentVariables = () => {
  console.log('🔍 Vérification des variables d\'environnement:');
  console.log('=====================================');
  
  // Variables Supabase
  console.log('VITE_SUPABASE_PROJECT_ID:', import.meta.env.VITE_SUPABASE_PROJECT_ID);
  console.log('VITE_SUPABASE_URL:', import.meta.env.VITE_SUPABASE_URL);
  console.log('VITE_SUPABASE_PUBLISHABLE_KEY:', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? '✅ Présente' : '❌ Manquante');
  
  // Environnement
  console.log('VITE_APP_ENV:', import.meta.env.VITE_APP_ENV);
  
  // Variables optionnelles
  console.log('VITE_MONEROO_API_KEY:', import.meta.env.VITE_MONEROO_API_KEY ? '✅ Présente' : '❌ Manquante');
  console.log('VITE_SENTRY_DSN:', import.meta.env.VITE_SENTRY_DSN ? '✅ Présente' : '❌ Manquante');
  
  console.log('=====================================');
  
  // Vérification critique
  const criticalVars = [
    'VITE_SUPABASE_PROJECT_ID',
    'VITE_SUPABASE_URL', 
    'VITE_SUPABASE_PUBLISHABLE_KEY',
    'VITE_APP_ENV'
  ];
  
  const missingVars = criticalVars.filter(varName => !import.meta.env[varName]);
  
  if (missingVars.length > 0) {
    console.error('❌ Variables critiques manquantes:', missingVars);
    return false;
  } else {
    console.log('✅ Toutes les variables critiques sont présentes');
    return true;
  }
};

// Fonction pour vérifier la connexion Supabase
export const checkSupabaseConnection = async () => {
  try {
    const { supabase } = await import('@/integrations/supabase/client');
    
    console.log('🔗 Test de connexion Supabase...');
    
    // Test simple de connexion
    const { data, error } = await supabase.from('profiles').select('count').limit(1);
    
    if (error) {
      console.error('❌ Erreur de connexion Supabase:', error.message);
      return false;
    } else {
      console.log('✅ Connexion Supabase réussie');
      return true;
    }
  } catch (error) {
    console.error('❌ Erreur lors du test Supabase:', error);
    return false;
  }
};

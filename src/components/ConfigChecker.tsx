import { useEffect, useState } from 'react';
import { ConfigError } from '@/components/error/ConfigError';

interface ConfigCheckerProps {
  children: React.ReactNode;
}

export const ConfigChecker = ({ children }: ConfigCheckerProps) => {
  const [configError, setConfigError] = useState<Error | null>(null);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    const checkConfig = async () => {
      try {
        // Vérifier que les variables d'environnement critiques sont présentes
        const requiredVars = [
          'VITE_SUPABASE_URL',
          'VITE_SUPABASE_PUBLISHABLE_KEY',
          'VITE_APP_ENV'
        ];

        const missingVars = requiredVars.filter(varName => {
          const value = import.meta.env[varName];
          return !value || value.trim() === '';
        });

        if (missingVars.length > 0) {
          throw new Error(
            `Variables d'environnement manquantes: ${missingVars.join(', ')}. ` +
            'Veuillez configurer ces variables dans les paramètres Vercel ou dans votre fichier .env.local'
          );
        }

        // Vérifier que Supabase est accessible
        const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
        if (supabaseUrl && !supabaseUrl.includes('supabase.co') && !supabaseUrl.includes('fallback')) {
          throw new Error(
            'URL Supabase invalide. Vérifiez que VITE_SUPABASE_URL pointe vers un projet Supabase valide.'
          );
        }

        setConfigError(null);
      } catch (error) {
        console.error('Erreur de configuration:', error);
        setConfigError(error as Error);
      } finally {
        setIsChecking(false);
      }
    };

    checkConfig();
  }, []);

  if (isChecking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-blue-500 border-r-transparent mb-4"></div>
          <p className="text-slate-300">Vérification de la configuration...</p>
        </div>
      </div>
    );
  }

  if (configError) {
    return (
      <ConfigError 
        error={configError}
        onRetry={() => window.location.reload()}
      />
    );
  }

  return <>{children}</>;
};

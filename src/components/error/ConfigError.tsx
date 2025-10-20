import { AlertCircle, Settings, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ConfigErrorProps {
  error: Error;
  onRetry?: () => void;
}

export const ConfigError = ({ error, onRetry }: ConfigErrorProps) => {
  const isEnvError = error.message.includes('Variables d\'environnement');
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl shadow-2xl border-red-500/20 bg-slate-800/50 backdrop-blur-sm">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 rounded-full bg-red-500/20 w-fit">
            <AlertCircle className="h-8 w-8 text-red-400" />
          </div>
          <CardTitle className="text-2xl font-bold text-white">
            {isEnvError ? 'Configuration Manquante' : 'Erreur de Configuration'}
          </CardTitle>
          <CardDescription className="text-slate-300 text-lg">
            {isEnvError 
              ? 'Les variables d\'environnement nécessaires ne sont pas configurées'
              : 'Une erreur s\'est produite lors du chargement de l\'application'
            }
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Message d'erreur */}
          <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700">
            <h3 className="font-semibold text-red-400 mb-2">Détails de l'erreur :</h3>
            <code className="text-sm text-slate-300 break-words">
              {error.message}
            </code>
          </div>

          {/* Instructions pour les variables d'environnement */}
          {isEnvError && (
            <div className="bg-blue-900/20 rounded-lg p-4 border border-blue-500/20">
              <h3 className="font-semibold text-blue-400 mb-3 flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Configuration requise pour Vercel
              </h3>
              <div className="space-y-2 text-sm text-slate-300">
                <p>Ajoutez ces variables dans les paramètres Vercel :</p>
                <div className="bg-slate-800 rounded p-3 space-y-2">
                  <div><code className="bg-slate-700 px-2 py-1 rounded">VITE_SUPABASE_PROJECT_ID</code> = hbdnzajbyjakdhuavrvb</div>
                  <div><code className="bg-slate-700 px-2 py-1 rounded">VITE_SUPABASE_URL</code> = https://hbdnzajbyjakdhuavrvb.supabase.co</div>
                  <div><code className="bg-slate-700 px-2 py-1 rounded">VITE_SUPABASE_PUBLISHABLE_KEY</code> = [votre clé publique]</div>
                  <div><code className="bg-slate-700 px-2 py-1 rounded">VITE_APP_ENV</code> = production</div>
                </div>
                <p className="mt-3 text-blue-300">
                  <strong>Instructions :</strong> Settings → Environment Variables → Ajouter chaque variable
                </p>
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            {onRetry && (
              <Button 
                onClick={onRetry}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
              >
                <RefreshCw className="h-4 w-4" />
                Réessayer
              </Button>
            )}
            
            <Button 
              variant="outline"
              onClick={() => window.location.reload()}
              className="flex items-center gap-2 border-slate-600 text-slate-300 hover:bg-slate-700"
            >
              <RefreshCw className="h-4 w-4" />
              Recharger la page
            </Button>
          </div>

          {/* Informations de débogage */}
          <div className="text-xs text-slate-500 text-center">
            <p>Si le problème persiste, vérifiez la configuration Vercel.</p>
            <p className="mt-1">
              Timestamp: {new Date().toLocaleString()}
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

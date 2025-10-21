import React, { useState, useEffect } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  AlertTriangle, 
  ExternalLink, 
  Copy, 
  CheckCircle, 
  XCircle,
  RefreshCw,
  Settings,
  Terminal
} from 'lucide-react';
import { useEnvironment } from '@/hooks/useEnvironment';

interface SupabaseErrorAlertProps {
  onDismiss?: () => void;
}

export const SupabaseErrorAlert: React.FC<SupabaseErrorAlertProps> = ({ onDismiss }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [copiedVar, setCopiedVar] = useState<string | null>(null);
  const env = useEnvironment();

  // Variables d'environnement à configurer
  const requiredVars = [
    {
      name: 'VITE_SUPABASE_PROJECT_ID',
      value: 'hbdnzajbyjakdhuavrvb',
      description: 'ID du projet Supabase'
    },
    {
      name: 'VITE_SUPABASE_URL',
      value: 'https://hbdnzajbyjakdhuavrvb.supabase.co',
      description: 'URL de l\'API Supabase'
    },
    {
      name: 'VITE_SUPABASE_PUBLISHABLE_KEY',
      value: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhiZG56YWpieWpha2RodWF2cnZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc1OTgyMzEsImV4cCI6MjA3MzE3NDIzMX0.myur8r50wIORQwfcCP4D1ZxlhKFxICdVqjUM80CgtnM',
      description: 'Clé publique Supabase'
    },
    {
      name: 'VITE_APP_ENV',
      value: 'production',
      description: 'Environnement de l\'application'
    }
  ];

  useEffect(() => {
    // Afficher l'alerte si on est en production et qu'il y a des erreurs Supabase
    const hasSupabaseErrors = env.validation.errors.some(error => 
      error.includes('SUPABASE') || error.includes('supabaseUrl')
    );
    
    if (env.isProduction && hasSupabaseErrors) {
      setIsVisible(true);
    }
  }, [env.isProduction, env.validation.errors]);

  const copyToClipboard = async (text: string, varName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedVar(varName);
      setTimeout(() => setCopiedVar(null), 2000);
    } catch (err) {
      console.error('Erreur lors de la copie:', err);
    }
  };

  const openVercelDashboard = () => {
    window.open('https://vercel.com/dashboard', '_blank');
  };

  const openTroubleshootingGuide = () => {
    window.open('https://github.com/payhuk02/payhuk/blob/main/TROUBLESHOOTING_GUIDE.md', '_blank');
  };

  if (!isVisible) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-6 w-6 text-red-500" />
              <div>
                <CardTitle className="text-xl">Configuration Vercel Requise</CardTitle>
                <CardDescription>
                  L'erreur "supabaseUrl is required" indique que les variables d'environnement ne sont pas configurées sur Vercel
                </CardDescription>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsVisible(false);
                onDismiss?.();
              }}
            >
              ✕
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Statut actuel */}
          <Alert>
            <XCircle className="h-4 w-4" />
            <AlertTitle>Erreur de Configuration</AlertTitle>
            <AlertDescription>
              Les variables d'environnement Supabase ne sont pas configurées sur Vercel, 
              ce qui empêche l'application de fonctionner correctement.
            </AlertDescription>
          </Alert>

          {/* Solutions rapides */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Terminal className="h-5 w-5" />
                  Script Automatique
                </CardTitle>
                <CardDescription>
                  Exécutez le script PowerShell pour configurer automatiquement Vercel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="p-3 bg-muted rounded-lg font-mono text-sm">
                    .\configure-vercel.ps1
                  </div>
                  <Button 
                    onClick={() => copyToClipboard('.\configure-vercel.ps1', 'script')}
                    variant="outline"
                    size="sm"
                    className="w-full"
                  >
                    {copiedVar === 'script' ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copier la commande
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Settings className="h-5 w-5" />
                  Configuration Manuelle
                </CardTitle>
                <CardDescription>
                  Configurez manuellement les variables dans le dashboard Vercel
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button 
                  onClick={openVercelDashboard}
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Ouvrir Vercel Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Variables à configurer */}
          <div>
            <h3 className="font-semibold mb-4 flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Variables d'Environnement à Ajouter
            </h3>
            <div className="space-y-3">
              {requiredVars.map((variable) => (
                <div key={variable.name} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="font-medium">{variable.name}</div>
                      <div className="text-sm text-muted-foreground">{variable.description}</div>
                    </div>
                    <Badge variant="destructive">Requis</Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 p-2 bg-muted rounded font-mono text-sm break-all">
                      {variable.value}
                    </div>
                    <Button
                      onClick={() => copyToClipboard(variable.value, variable.name)}
                      variant="outline"
                      size="sm"
                    >
                      {copiedVar === variable.name ? (
                        <CheckCircle className="h-4 w-4" />
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-semibold text-blue-800 dark:text-blue-200 mb-2">
              📋 Instructions de Configuration
            </h4>
            <ol className="text-sm text-blue-700 dark:text-blue-300 space-y-1 list-decimal list-inside">
              <li>Allez sur <a href="https://vercel.com/dashboard" target="_blank" className="underline">Vercel Dashboard</a></li>
              <li>Sélectionnez votre projet "payhuk"</li>
              <li>Allez dans <strong>Settings → Environment Variables</strong></li>
              <li>Ajoutez chaque variable avec sa valeur (cliquez sur "Copier" ci-dessus)</li>
              <li>Sélectionnez <strong>Production, Preview, Development</strong> pour chaque variable</li>
              <li>Cliquez sur <strong>Save</strong></li>
              <li>Redéployez l'application</li>
            </ol>
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button
              onClick={openTroubleshootingGuide}
              variant="outline"
              className="flex-1"
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Guide de Dépannage Complet
            </Button>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser la Page
            </Button>
            <Button
              onClick={() => {
                setIsVisible(false);
                onDismiss?.();
              }}
              className="flex-1"
            >
              J'ai Configuré Vercel
            </Button>
          </div>

          {/* Note importante */}
          <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
            <div className="text-sm text-yellow-800 dark:text-yellow-200">
              <strong>💡 Note importante :</strong> Après avoir configuré les variables sur Vercel, 
              attendez 2-3 minutes que le redéploiement se termine avant de tester l'application.
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

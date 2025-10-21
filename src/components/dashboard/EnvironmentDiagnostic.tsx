import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, ExternalLink } from 'lucide-react';

interface EnvStatus {
  name: string;
  value: string | undefined;
  required: boolean;
  status: 'present' | 'missing' | 'partial';
}

export const EnvironmentDiagnostic: React.FC = () => {
  const [envStatus, setEnvStatus] = useState<EnvStatus[]>([]);
  const [supabaseStatus, setSupabaseStatus] = useState<'checking' | 'connected' | 'error'>('checking');
  const [isVisible, setIsVisible] = useState(false);

  const checkEnvironment = () => {
    const variables: EnvStatus[] = [
      {
        name: 'VITE_SUPABASE_PROJECT_ID',
        value: import.meta.env.VITE_SUPABASE_PROJECT_ID,
        required: true,
        status: import.meta.env.VITE_SUPABASE_PROJECT_ID ? 'present' : 'missing'
      },
      {
        name: 'VITE_SUPABASE_URL',
        value: import.meta.env.VITE_SUPABASE_URL,
        required: true,
        status: import.meta.env.VITE_SUPABASE_URL ? 'present' : 'missing'
      },
      {
        name: 'VITE_SUPABASE_PUBLISHABLE_KEY',
        value: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        required: true,
        status: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ? 'present' : 'missing'
      },
      {
        name: 'VITE_APP_ENV',
        value: import.meta.env.VITE_APP_ENV,
        required: true,
        status: import.meta.env.VITE_APP_ENV ? 'present' : 'missing'
      },
      {
        name: 'VITE_MONEROO_API_KEY',
        value: import.meta.env.VITE_MONEROO_API_KEY,
        required: false,
        status: import.meta.env.VITE_MONEROO_API_KEY ? 'present' : 'missing'
      },
      {
        name: 'VITE_SENTRY_DSN',
        value: import.meta.env.VITE_SENTRY_DSN,
        required: false,
        status: import.meta.env.VITE_SENTRY_DSN ? 'present' : 'missing'
      }
    ];

    setEnvStatus(variables);
  };

  const testSupabaseConnection = async () => {
    setSupabaseStatus('checking');
    try {
      const { supabase } = await import('@/integrations/supabase/client');
      const { error } = await supabase.from('profiles').select('count').limit(1);
      
      if (error) {
        setSupabaseStatus('error');
      } else {
        setSupabaseStatus('connected');
      }
    } catch (error) {
      setSupabaseStatus('error');
    }
  };

  useEffect(() => {
    checkEnvironment();
    testSupabaseConnection();
  }, []);

  const getStatusIcon = (status: EnvStatus['status'], required: boolean) => {
    if (status === 'present') return <CheckCircle className="h-4 w-4 text-green-500" />;
    if (status === 'missing' && required) return <XCircle className="h-4 w-4 text-red-500" />;
    if (status === 'missing' && !required) return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
    return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
  };

  const getStatusBadge = (status: EnvStatus['status'], required: boolean) => {
    if (status === 'present') return <Badge variant="default" className="bg-green-500">Présente</Badge>;
    if (status === 'missing' && required) return <Badge variant="destructive">Manquante</Badge>;
    if (status === 'missing' && !required) return <Badge variant="secondary">Optionnelle</Badge>;
    return <Badge variant="secondary">Inconnue</Badge>;
  };

  const criticalMissing = envStatus.filter(v => v.required && v.status === 'missing').length;
  const isHealthy = criticalMissing === 0 && supabaseStatus === 'connected';

  if (!isVisible) {
    return (
      <div className="fixed bottom-4 right-4 z-50">
        <Button
          onClick={() => setIsVisible(true)}
          variant="outline"
          size="sm"
          className="bg-background/80 backdrop-blur-sm"
        >
          🔍 Diagnostic Env
        </Button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                🔍 Diagnostic des Variables d'Environnement
                {isHealthy ? (
                  <Badge variant="default" className="bg-green-500">✅ Sain</Badge>
                ) : (
                  <Badge variant="destructive">❌ Problème</Badge>
                )}
              </CardTitle>
              <CardDescription>
                Vérification de la configuration Supabase et des variables d'environnement
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              ✕
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          {/* Résumé */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-green-500">
                {envStatus.filter(v => v.status === 'present').length}
              </div>
              <div className="text-sm text-muted-foreground">Variables présentes</div>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <div className="text-2xl font-bold text-red-500">
                {criticalMissing}
              </div>
              <div className="text-sm text-muted-foreground">Variables critiques manquantes</div>
            </div>
          </div>

          {/* Variables d'environnement */}
          <div>
            <h3 className="font-semibold mb-3">Variables d'Environnement</h3>
            <div className="space-y-2">
              {envStatus.map((variable) => (
                <div key={variable.name} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(variable.status, variable.required)}
                    <div>
                      <div className="font-medium">{variable.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {variable.value ? `${variable.value.substring(0, 20)}...` : 'Non définie'}
                      </div>
                    </div>
                  </div>
                  {getStatusBadge(variable.status, variable.required)}
                </div>
              ))}
            </div>
          </div>

          {/* Statut Supabase */}
          <div>
            <h3 className="font-semibold mb-3">Connexion Supabase</h3>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <div className="flex items-center gap-3">
                {supabaseStatus === 'checking' && <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />}
                {supabaseStatus === 'connected' && <CheckCircle className="h-4 w-4 text-green-500" />}
                {supabaseStatus === 'error' && <XCircle className="h-4 w-4 text-red-500" />}
                <div>
                  <div className="font-medium">Connexion Base de Données</div>
                  <div className="text-sm text-muted-foreground">
                    {supabaseStatus === 'checking' && 'Vérification en cours...'}
                    {supabaseStatus === 'connected' && 'Connexion réussie'}
                    {supabaseStatus === 'error' && 'Erreur de connexion'}
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={testSupabaseConnection}
                disabled={supabaseStatus === 'checking'}
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Tester
              </Button>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2 pt-4 border-t">
            <Button
              onClick={() => {
                checkEnvironment();
                testSupabaseConnection();
              }}
              className="flex-1"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Actualiser
            </Button>
            <Button
              variant="outline"
              onClick={() => window.open('https://vercel.com/dashboard', '_blank')}
            >
              <ExternalLink className="h-4 w-4 mr-2" />
              Vercel Dashboard
            </Button>
          </div>

          {/* Instructions */}
          {criticalMissing > 0 && (
            <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
              <h4 className="font-semibold text-yellow-800 dark:text-yellow-200 mb-2">
                ⚠️ Action Requise
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-3">
                Des variables critiques sont manquantes. Pour résoudre ce problème :
              </p>
              <ol className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1 list-decimal list-inside">
                <li>Allez sur <a href="https://vercel.com/dashboard" target="_blank" className="underline">Vercel Dashboard</a></li>
                <li>Sélectionnez votre projet "payhuk"</li>
                <li>Allez dans Settings → Environment Variables</li>
                <li>Ajoutez les variables manquantes</li>
                <li>Redéployez l'application</li>
              </ol>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

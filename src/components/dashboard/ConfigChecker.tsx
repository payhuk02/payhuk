import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  RefreshCw,
  Database,
  Settings,
  ExternalLink
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { envConfig } from '@/lib/env-validator';
import { motion } from 'framer-motion';

interface ConfigStatus {
  supabase: 'connected' | 'error' | 'checking';
  database: 'connected' | 'error' | 'checking';
  auth: 'connected' | 'error' | 'checking';
}

const ConfigChecker: React.FC = () => {
  const [configStatus, setConfigStatus] = useState<ConfigStatus>({
    supabase: 'checking',
    database: 'checking',
    auth: 'checking'
  });
  const [isChecking, setIsChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkConfiguration = async () => {
    setIsChecking(true);
    setError(null);
    
    const newStatus: ConfigStatus = {
      supabase: 'checking',
      database: 'checking',
      auth: 'checking'
    };
    setConfigStatus(newStatus);

    try {
      // Vérifier la configuration Supabase
      if (envConfig.VITE_SUPABASE_URL && envConfig.VITE_SUPABASE_PUBLISHABLE_KEY) {
        newStatus.supabase = 'connected';
      } else {
        newStatus.supabase = 'error';
        throw new Error('Configuration Supabase manquante');
      }

      // Vérifier la connexion à la base de données
      try {
        const { data, error: dbError } = await supabase
          .from('stores')
          .select('count')
          .limit(1);
        
        if (dbError) {
          newStatus.database = 'error';
          console.warn('Erreur de connexion à la base de données:', dbError);
        } else {
          newStatus.database = 'connected';
        }
      } catch (dbError) {
        newStatus.database = 'error';
        console.warn('Erreur de connexion à la base de données:', dbError);
      }

      // Vérifier l'authentification
      try {
        const { data: { session }, error: authError } = await supabase.auth.getSession();
        
        if (authError) {
          newStatus.auth = 'error';
          console.warn('Erreur d\'authentification:', authError);
        } else {
          newStatus.auth = 'connected';
        }
      } catch (authError) {
        newStatus.auth = 'error';
        console.warn('Erreur d\'authentification:', authError);
      }

      setConfigStatus({ ...newStatus });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de configuration');
      newStatus.supabase = 'error';
      setConfigStatus({ ...newStatus });
    } finally {
      setIsChecking(false);
    }
  };

  useEffect(() => {
    checkConfiguration();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      case 'checking':
        return <RefreshCw className="h-4 w-4 text-blue-600 animate-spin" />;
      default:
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return 'Connecté';
      case 'error':
        return 'Erreur';
      case 'checking':
        return 'Vérification...';
      default:
        return 'Inconnu';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
        return 'bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'error':
        return 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'checking':
        return 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800';
      default:
        return 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
    }
  };

  const allConnected = Object.values(configStatus).every(status => status === 'connected');
  const hasErrors = Object.values(configStatus).some(status => status === 'error');

  return (
    <Card className="hover:shadow-lg transition-shadow duration-300">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Vérification de la configuration
        </CardTitle>
        <CardDescription>
          État des connexions et services de Payhuk
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Statut général */}
        <div className="flex items-center justify-between p-3 rounded-lg border">
          <div className="flex items-center gap-3">
            {allConnected ? (
              <CheckCircle className="h-5 w-5 text-green-600" />
            ) : hasErrors ? (
              <XCircle className="h-5 w-5 text-red-600" />
            ) : (
              <RefreshCw className="h-5 w-5 text-blue-600 animate-spin" />
            )}
            <div>
              <div className="font-medium">Statut général</div>
              <div className="text-sm text-muted-foreground">
                {allConnected ? 'Tous les services sont opérationnels' : 
                 hasErrors ? 'Certains services ont des problèmes' : 
                 'Vérification en cours...'}
              </div>
            </div>
          </div>
          <Badge variant={allConnected ? 'default' : hasErrors ? 'destructive' : 'secondary'}>
            {allConnected ? 'Opérationnel' : hasErrors ? 'Problème' : 'Vérification'}
          </Badge>
        </div>

        {/* Détails des services */}
        <div className="space-y-3">
          {/* Supabase */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className={`p-3 rounded-lg border ${getStatusColor(configStatus.supabase)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(configStatus.supabase)}
                <div>
                  <div className="font-medium">Supabase</div>
                  <div className="text-sm text-muted-foreground">
                    Configuration et connexion
                  </div>
                </div>
              </div>
              <Badge variant={configStatus.supabase === 'connected' ? 'default' : 'destructive'}>
                {getStatusText(configStatus.supabase)}
              </Badge>
            </div>
          </motion.div>

          {/* Base de données */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className={`p-3 rounded-lg border ${getStatusColor(configStatus.database)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(configStatus.database)}
                <div>
                  <div className="font-medium">Base de données</div>
                  <div className="text-sm text-muted-foreground">
                    Connexion aux tables
                  </div>
                </div>
              </div>
              <Badge variant={configStatus.database === 'connected' ? 'default' : 'destructive'}>
                {getStatusText(configStatus.database)}
              </Badge>
            </div>
          </motion.div>

          {/* Authentification */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className={`p-3 rounded-lg border ${getStatusColor(configStatus.auth)}`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(configStatus.auth)}
                <div>
                  <div className="font-medium">Authentification</div>
                  <div className="text-sm text-muted-foreground">
                    Service d'authentification
                  </div>
                </div>
              </div>
              <Badge variant={configStatus.auth === 'connected' ? 'default' : 'destructive'}>
                {getStatusText(configStatus.auth)}
              </Badge>
            </div>
          </motion.div>
        </div>

        {/* Erreurs */}
        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {error}
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-muted-foreground">
            Dernière vérification: {new Date().toLocaleTimeString('fr-FR')}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={checkConfiguration}
              disabled={isChecking}
            >
              {isChecking ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Vérifier
            </Button>
            
            {hasErrors && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open('https://supabase.com/dashboard', '_blank')}
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Supabase
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ConfigChecker;

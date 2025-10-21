import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle, XCircle, AlertTriangle, RefreshCw, User, Database, Shield } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';

interface AuthDiagnosticProps {
  onClose?: () => void;
}

export const AuthDiagnostic: React.FC<AuthDiagnosticProps> = ({ onClose }) => {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [diagnostics, setDiagnostics] = useState<{
    auth: 'checking' | 'connected' | 'error';
    profile: 'checking' | 'found' | 'missing' | 'error';
    rls: 'checking' | 'enabled' | 'disabled' | 'error';
    session: any;
    profileData: any;
  }>({
    auth: 'checking',
    profile: 'checking',
    rls: 'checking',
    session: null,
    profileData: null
  });

  const runDiagnostics = async () => {
    setDiagnostics(prev => ({
      ...prev,
      auth: 'checking',
      profile: 'checking',
      rls: 'checking'
    }));

    try {
      // Vérifier l'authentification
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        setDiagnostics(prev => ({ ...prev, auth: 'error', session: null }));
        return;
      }

      if (session) {
        setDiagnostics(prev => ({ ...prev, auth: 'connected', session }));
        
        // Vérifier le profil
        try {
          const { data: profile, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profileError) {
            if (profileError.code === 'PGRST116') {
              setDiagnostics(prev => ({ ...prev, profile: 'missing', profileData: null }));
            } else {
              setDiagnostics(prev => ({ ...prev, profile: 'error', profileData: null }));
            }
          } else {
            setDiagnostics(prev => ({ ...prev, profile: 'found', profileData: profile }));
          }
        } catch (profileErr) {
          setDiagnostics(prev => ({ ...prev, profile: 'error', profileData: null }));
        }

        // Vérifier RLS
        try {
          const { data: rlsData, error: rlsError } = await supabase
            .from('profiles')
            .select('id')
            .limit(1);

          if (rlsError && rlsError.message.includes('row-level security')) {
            setDiagnostics(prev => ({ ...prev, rls: 'disabled' }));
          } else {
            setDiagnostics(prev => ({ ...prev, rls: 'enabled' }));
          }
        } catch (rlsErr) {
          setDiagnostics(prev => ({ ...prev, rls: 'error' }));
        }
      } else {
        setDiagnostics(prev => ({ ...prev, auth: 'error', session: null }));
      }
    } catch (error) {
      console.error('Diagnostic error:', error);
      setDiagnostics(prev => ({ ...prev, auth: 'error' }));
    }
  };

  useEffect(() => {
    runDiagnostics();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
      case 'found':
      case 'enabled':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'missing':
        return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />;
      default:
        return <RefreshCw className="h-4 w-4 text-gray-600 animate-spin" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected': return 'Connecté';
      case 'found': return 'Profil trouvé';
      case 'missing': return 'Profil manquant';
      case 'enabled': return 'RLS activé';
      case 'disabled': return 'RLS désactivé';
      case 'error': return 'Erreur';
      default: return 'Vérification...';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected':
      case 'found':
      case 'enabled':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'missing':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'error':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Diagnostic d'Authentification
        </CardTitle>
        <CardDescription>
          Vérification de l'état de l'authentification et du profil utilisateur
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* État de l'authentification */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span className="font-medium">Authentification</span>
            </div>
            <Badge className={getStatusColor(diagnostics.auth)}>
              {getStatusIcon(diagnostics.auth)}
              <span className="ml-1">{getStatusText(diagnostics.auth)}</span>
            </Badge>
          </div>
          
          {diagnostics.session && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
              <div><strong>Email:</strong> {diagnostics.session.user.email}</div>
              <div><strong>ID:</strong> {diagnostics.session.user.id}</div>
              <div><strong>Vérifié:</strong> {diagnostics.session.user.email_confirmed_at ? 'Oui' : 'Non'}</div>
            </div>
          )}
        </div>

        {/* État du profil */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4" />
              <span className="font-medium">Profil Utilisateur</span>
            </div>
            <Badge className={getStatusColor(diagnostics.profile)}>
              {getStatusIcon(diagnostics.profile)}
              <span className="ml-1">{getStatusText(diagnostics.profile)}</span>
            </Badge>
          </div>
          
          {diagnostics.profileData && (
            <div className="text-sm text-muted-foreground bg-muted p-3 rounded">
              <div><strong>Nom:</strong> {diagnostics.profileData.name || 'Non défini'}</div>
              <div><strong>Rôle:</strong> {diagnostics.profileData.role || 'customer'}</div>
              <div><strong>Créé:</strong> {new Date(diagnostics.profileData.created_at).toLocaleDateString()}</div>
            </div>
          )}
        </div>

        {/* État RLS */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Sécurité (RLS)</span>
            </div>
            <Badge className={getStatusColor(diagnostics.rls)}>
              {getStatusIcon(diagnostics.rls)}
              <span className="ml-1">{getStatusText(diagnostics.rls)}</span>
            </Badge>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={runDiagnostics} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualiser
          </Button>
          {onClose && (
            <Button onClick={onClose} variant="outline" size="sm">
              Fermer
            </Button>
          )}
        </div>

        {/* Recommandations */}
        {diagnostics.profile === 'missing' && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-yellow-800">Profil manquant</h4>
                <p className="text-sm text-yellow-700 mt-1">
                  Le profil utilisateur n'existe pas dans la base de données. 
                  Il sera créé automatiquement lors de la prochaine connexion.
                </p>
              </div>
            </div>
          </div>
        )}

        {diagnostics.rls === 'disabled' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <XCircle className="h-5 w-5 text-red-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-red-800">RLS désactivé</h4>
                <p className="text-sm text-red-700 mt-1">
                  Row Level Security n'est pas activé sur la table profiles. 
                  Exécutez la migration SQL pour activer la sécurité.
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
